import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderItemId, amount } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Calculate commission (e.g., 10% platform fee)
    const commissionAmount = amount * 0.10

    // Create Commission Record
    const { data: commission, error } = await supabaseClient
      .from('commissions')
      .insert({
        order_item_id: orderItemId,
        amount: commissionAmount,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ commissionId: commission.id, amount: commissionAmount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
