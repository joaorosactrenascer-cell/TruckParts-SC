import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchResult {
  id: string;
  name: string;
  sku: string;
  price: number;
  supplier: string;
  category: string;
  image_url?: string;
  compatibility: string[];
  relevance_score: number;
  match_type: 'exact' | 'partial' | 'vehicle' | 'category';
}

interface SearchFilters {
  vehicle_type?: string;
  brand?: string;
  model?: string;
  year?: number;
  category?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
}

interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const searchRequest: SearchRequest = await req.json()
    const { query, filters = {}, limit = 20, offset = 0 } = searchRequest

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters long' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse intelligent query
    const parsedQuery = parseIntelligentQuery(query)
    
    // Perform multi-modal search
    const searchResults = await performSmartSearch(supabaseClient, parsedQuery, filters, limit, offset)
    
    // Log search for analytics
    await logSearch(supabaseClient, query, parsedQuery, searchResults.length)

    return new Response(
      JSON.stringify({
        results: searchResults,
        total: searchResults.length,
        query: query,
        parsed_query: parsedQuery,
        filters_applied: filters
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Smart search error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function parseIntelligentQuery(query: string) {
  const normalized = query.toLowerCase().trim()
  
  // Extract vehicle information
  const vehiclePatterns = {
    brands: ['volvo', 'scania', 'mercedes', 'man', 'iveco', 'daf', 'vw', 'ford', 'toyota'],
    models: ['fh', 'fh16', 'r-series', 'actros', 'g-series', 'p-series', 'n-series'],
    types: ['caminhão', 'carreta', 'van', 'ônibus', 'pickup']
  }

  const extracted = {
    terms: normalized.split(/\s+/).filter(term => term.length > 1),
    brand: null as string | null,
    model: null as string | null,
    year: null as number | null,
    type: null as string | null,
    part_number: null as string | null
  }

  // Extract brand
  for (const brand of vehiclePatterns.brands) {
    if (normalized.includes(brand)) {
      extracted.brand = brand
      break
    }
  }

  // Extract model
  for (const model of vehiclePatterns.models) {
    if (normalized.includes(model)) {
      extracted.model = model
      break
    }
  }

  // Extract year (4-digit number)
  const yearMatch = normalized.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    extracted.year = parseInt(yearMatch[0])
  }

  // Extract part number (alphanumeric with dashes)
  const partNumberMatch = normalized.match(/\b[a-z0-9\-]{3,}\b/i)
  if (partNumberMatch) {
    extracted.part_number = partNumberMatch[0].toUpperCase()
  }

  // Extract vehicle type
  for (const type of vehiclePatterns.types) {
    if (normalized.includes(type)) {
      extracted.type = type
      break
    }
  }

  return extracted
}

async function performSmartSearch(
  supabaseClient: any,
  parsedQuery: any,
  filters: SearchFilters,
  limit: number,
  offset: number
): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  // 1. Exact part number match (highest priority)
  if (parsedQuery.part_number) {
    const exactMatches = await searchByPartNumber(supabaseClient, parsedQuery.part_number, filters)
    results.push(...exactMatches.map(r => ({ ...r, match_type: 'exact' as const, relevance_score: 100 })))
  }

  // 2. Vehicle-based search
  if (parsedQuery.brand || parsedQuery.model || parsedQuery.year) {
    const vehicleMatches = await searchByVehicle(supabaseClient, parsedQuery, filters)
    results.push(...vehicleMatches.map(r => ({ ...r, match_type: 'vehicle' as const, relevance_score: 85 })))
  }

  // 3. Text-based search with full-text search
  const textMatches = await searchByText(supabaseClient, parsedQuery.terms, filters)
  results.push(...textMatches.map(r => ({ ...r, match_type: 'partial' as const, relevance_score: 70 })))

  // 4. Category-based search
  const categoryMatches = await searchByCategory(supabaseClient, parsedQuery.terms, filters)
  results.push(...categoryMatches.map(r => ({ ...r, match_type: 'category' as const, relevance_score: 60 })))

  // Remove duplicates and sort by relevance
  const uniqueResults = Array.from(
    new Map(results.map(item => [item.id, item])).values()
  )

  return uniqueResults
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(offset, offset + limit)
}

async function searchByPartNumber(supabaseClient: any, partNumber: string, filters: SearchFilters): Promise<SearchResult[]> {
  let query = supabaseClient
    .from('products')
    .select(`
      id, name, part_number, oem_number,
      product_variants!inner(
        sku,
        product_prices!inner(price)
      ),
      product_stock!inner(quantity),
      suppliers_enhanced!inner(
        company_id,
        companies!inner(name)
      ),
      categories_enhanced!inner(name)
    `)
    .or(`part_number.ilike.%${partNumber}%,oem_number.ilike.%${partNumber}%`)

  if (filters.in_stock) {
    query = query.gt('product_stock.quantity', 0)
  }

  const { data, error } = await query.limit(10)

  if (error || !data) return []

  return data.map((product: any) => ({
    id: product.id,
    name: product.name,
    sku: product.product_variants[0]?.sku || '',
    price: Number(product.product_variants[0]?.product_prices[0]?.price || 0),
    supplier: product.suppliers_enhanced?.companies?.name || '',
    category: product.categories_enhanced?.name || '',
    compatibility: [],
    relevance_score: 100
  }))
}

async function searchByVehicle(supabaseClient: any, parsedQuery: any, filters: SearchFilters): Promise<SearchResult[]> {
  let vehicleQuery = supabaseClient.from('vehicle_brands').select('id, name')
  
  if (parsedQuery.brand) {
    vehicleQuery = vehicleQuery.ilike('name', `%${parsedQuery.brand}%`)
  }

  const { data: brands } = await vehicleQuery
  if (!brands || brands.length === 0) return []

  const brandIds = brands.map(b => b.id)

  let modelQuery = supabaseClient.from('vehicle_models').select('id, name, brand_id')
    .in('brand_id', brandIds)

  if (parsedQuery.model) {
    modelQuery = modelQuery.ilike('name', `%${parsedQuery.model}%`)
  }

  const { data: models } = await modelQuery
  if (!models || models.length === 0) return []

  const modelIds = models.map(m => m.id)

  // Find products compatible with these vehicles
  const { data: compatibleProducts } = await supabaseClient
    .from('product_vehicle_compatibility')
    .select(`
      product_id,
      vehicle_model_id,
      products!inner(
        name,
        product_variants!inner(
          sku,
          product_prices!inner(price)
        ),
        product_stock!inner(quantity),
        suppliers_enhanced!inner(
          companies!inner(name)
        ),
        categories_enhanced!inner(name)
      ),
      vehicle_models!inner(name, vehicle_brands!inner(name))
    `)
    .in('vehicle_model_id', modelIds)

  if (!compatibleProducts) return []

  return compatibleProducts.map((item: any) => ({
    id: item.product_id,
    name: item.products.name,
    sku: item.products.product_variants[0]?.sku || '',
    price: Number(item.products.product_variants[0]?.product_prices[0]?.price || 0),
    supplier: item.products.suppliers_enhanced?.companies?.name || '',
    category: item.products.categories_enhanced?.name || '',
    compatibility: [`${item.vehicle_models.vehicle_brands.name} ${item.vehicle_models.name}`],
    relevance_score: 85
  }))
}

async function searchByText(supabaseClient: any, terms: string[], filters: SearchFilters): Promise<SearchResult[]> {
  if (terms.length === 0) return []

  const searchText = terms.join(' | ') // PostgreSQL full-text search syntax

  let query = supabaseClient
    .from('products')
    .select(`
      id, name,
      product_variants!inner(
        sku,
        product_prices!inner(price)
      ),
      product_stock!inner(quantity),
      suppliers_enhanced!inner(
        companies!inner(name)
      ),
      categories_enhanced!inner(name)
    `)
    .textSearch('name', searchText)
    .textSearch('description', searchText, { type: 'websearch' })

  if (filters.in_stock) {
    query = query.gt('product_stock.quantity', 0)
  }

  if (filters.price_min) {
    query = query.gte('product_variants.product_prices.price', filters.price_min)
  }

  if (filters.price_max) {
    query = query.lte('product_variants.product_prices.price', filters.price_max)
  }

  const { data, error } = await query.limit(20)

  if (error || !data) return []

  return data.map((product: any) => ({
    id: product.id,
    name: product.name,
    sku: product.product_variants[0]?.sku || '',
    price: Number(product.product_variants[0]?.product_prices[0]?.price || 0),
    supplier: product.suppliers_enhanced?.companies?.name || '',
    category: product.categories_enhanced?.name || '',
    compatibility: [],
    relevance_score: 70
  }))
}

async function searchByCategory(supabaseClient: any, terms: string[], filters: SearchFilters): Promise<SearchResult[]> {
  if (terms.length === 0) return []

  const { data: categories } = await supabaseClient
    .from('categories_enhanced')
    .select('id, name')
    .textSearch('name', terms.join(' | '))
    .limit(5)

  if (!categories || categories.length === 0) return []

  const categoryIds = categories.map(c => c.id)

  const { data: products } = await supabaseClient
    .from('products')
    .select(`
      id, name,
      product_variants!inner(
        sku,
        product_prices!inner(price)
      ),
      product_stock!inner(quantity),
      suppliers_enhanced!inner(
        companies!inner(name)
      ),
      categories_enhanced!inner(name)
    `)
    .in('category_id', categoryIds)
    .limit(20)

  if (!products) return []

  return products.map((product: any) => ({
    id: product.id,
    name: product.name,
    sku: product.product_variants[0]?.sku || '',
    price: Number(product.product_variants[0]?.product_prices[0]?.price || 0),
    supplier: product.suppliers_enhanced?.companies?.name || '',
    category: product.categories_enhanced?.name || '',
    compatibility: [],
    relevance_score: 60
  }))
}

async function logSearch(supabaseClient: any, originalQuery: string, parsedQuery: any, resultCount: number) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    await supabaseClient.from('analytics_events').insert({
      user_id: user?.id,
      event_type: 'smart_search',
      event_data: {
        original_query: originalQuery,
        parsed_query: parsedQuery,
        result_count: resultCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Failed to log search:', error)
  }
}
