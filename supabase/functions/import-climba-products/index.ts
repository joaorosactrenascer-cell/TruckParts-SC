import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClimbaProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  description?: string;
  image_url?: string;
  category: string;
  brand?: string;
  oem_number?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

interface SyncResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
  duration: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const startTime = Date.now()
    const { supplierId, apiKey, categoryIds } = await req.json()

    if (!supplierId || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'supplierId and apiKey are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verify supplier exists and is active
    const { data: supplier, error: supplierError } = await supabaseClient
      .from('suppliers_enhanced')
      .select('id, is_active, company_id')
      .eq('id', supplierId)
      .single()

    if (supplierError || !supplier) {
      return new Response(
        JSON.stringify({ error: 'Supplier not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!supplier.is_active) {
      return new Response(
        JSON.stringify({ error: 'Supplier is not active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Fetch products from Climba API
    const climbaProducts = await fetchClimbaProducts(apiKey, categoryIds)
    
    if (!climbaProducts.success) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Climba products', details: climbaProducts.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Process and sync products
    const syncResult = await syncProductsToDatabase(supabaseClient, climbaProducts.data!, supplierId, supplier.company_id)
    
    // Log the sync operation
    await supabaseClient.from('analytics_events').insert({
      user_id: supplierId,
      event_type: 'climba_sync',
      event_data: {
        imported: syncResult.imported,
        updated: syncResult.updated,
        errors: syncResult.errors.length,
        duration: Date.now() - startTime
      }
    })

    const finalResult: SyncResult = {
      success: syncResult.errors.length === 0,
      imported: syncResult.imported,
      updated: syncResult.updated,
      errors: syncResult.errors,
      duration: Date.now() - startTime
    }

    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Climba sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function fetchClimbaProducts(apiKey: string, categoryIds?: string[]): Promise<{ success: boolean; data?: ClimbaProduct[]; error?: string }> {
  try {
    // Mock Climba API - Replace with actual API integration
    // This is a simulation of what the real integration would look like
    
    const mockProducts: ClimbaProduct[] = [
      {
        id: 'CLB001',
        name: 'Filtro de Ar Volvo FH',
        sku: 'FA-VOLVO-FH-001',
        price: 89.90,
        stock: 25,
        description: 'Filtro de ar de alta qualidade para Volvo FH',
        image_url: 'https://example.com/images/filtro-volvo-fh.jpg',
        category: 'Filtros',
        brand: 'Volvo',
        oem_number: 'VO123456',
        weight: 0.5,
        dimensions: { length: 30, width: 20, height: 15 }
      },
      {
        id: 'CLB002',
        name: 'Pastilha de Freio Scania',
        sku: 'PF-SCANIA-002',
        price: 156.50,
        stock: 12,
        description: 'Pastilha de freio para Scania Series',
        image_url: 'https://example.com/images/pastilha-scania.jpg',
        category: 'Freios',
        brand: 'Scania',
        oem_number: 'SC789012',
        weight: 1.2,
        dimensions: { length: 15, width: 10, height: 5 }
      },
      {
        id: 'CLB003',
        name: 'Alternador Mercedes-Benz',
        sku: 'ALT-MB-003',
        price: 1250.00,
        stock: 8,
        description: 'Alternador 12V para Mercedes-Benz Actros',
        image_url: 'https://example.com/images/alternador-mb.jpg',
        category: 'Elétrica',
        brand: 'Mercedes-Benz',
        oem_number: 'MB345678',
        weight: 8.5,
        dimensions: { length: 25, width: 20, height: 20 }
      }
    ]

    // In real implementation, this would be:
    // const response = await fetch('https://api.climba.com.br/products', {
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // })
    // const data = await response.json()

    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

    return { success: true, data: mockProducts }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function syncProductsToDatabase(
  supabaseClient: any,
  climbaProducts: ClimbaProduct[],
  supplierId: string,
  companyId: string
): Promise<{ imported: number; updated: number; errors: string[] }> {
  let imported = 0
  let updated = 0
  const errors: string[] = []

  for (const climbaProduct of climbaProducts) {
    try {
      // Check if product already exists by SKU
      const { data: existingProduct } = await supabaseClient
        .from('products')
        .select('id, name, description')
        .eq('sku', climbaProduct.sku)
        .eq('supplier_id', supplierId)
        .single()

      if (existingProduct) {
        // Update existing product
        const { error: updateError } = await supabaseClient
          .from('products')
          .update({
            name: climbaProduct.name,
            description: climbaProduct.description,
            oem_number: climbaProduct.oem_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProduct.id)

        if (updateError) {
          errors.push(`Failed to update product ${climbaProduct.sku}: ${updateError.message}`)
        } else {
          updated++
        }
      } else {
        // Create new product
        const { data: newProduct, error: insertError } = await supabaseClient
          .from('products')
          .insert({
            supplier_id: supplierId,
            name: climbaProduct.name,
            description: climbaProduct.description,
            part_number: climbaProduct.sku,
            oem_number: climbaProduct.oem_number,
            condition: 'new'
          })
          .select()
          .single()

        if (insertError) {
          errors.push(`Failed to create product ${climbaProduct.sku}: ${insertError.message}`)
        } else {
          // Create product variant
          const { data: variant, error: variantError } = await supabaseClient
            .from('product_variants')
            .insert({
              product_id: newProduct.id,
              sku: climbaProduct.sku,
              attributes: {
                weight: climbaProduct.weight,
                dimensions: climbaProduct.dimensions,
                brand: climbaProduct.brand,
                source: 'climba'
              }
            })
            .select()
            .single()

          if (variantError) {
            errors.push(`Failed to create variant for ${climbaProduct.sku}: ${variantError.message}`)
          } else {
            // Create price
            const { error: priceError } = await supabaseClient
              .from('product_prices')
              .insert({
                variant_id: variant.id,
                price: climbaProduct.price,
                currency: 'BRL'
              })

            if (priceError) {
              errors.push(`Failed to set price for ${climbaProduct.sku}: ${priceError.message}`)
            } else {
              // Create stock
              const { error: stockError } = await supabaseClient
                .from('product_stock')
                .insert({
                  variant_id: variant.id,
                  quantity: climbaProduct.stock
                })

              if (stockError) {
                errors.push(`Failed to set stock for ${climbaProduct.sku}: ${stockError.message}`)
              } else {
                // Create product image if available
                if (climbaProduct.image_url) {
                  await supabaseClient
                    .from('product_images')
                    .insert({
                      product_id: newProduct.id,
                      url: climbaProduct.image_url,
                      is_primary: true
                    })
                }

                imported++
              }
            }
          }
        }
      }
    } catch (error) {
      errors.push(`Error processing ${climbaProduct.sku}: ${error.message}`)
    }
  }

  return { imported, updated, errors }
}
