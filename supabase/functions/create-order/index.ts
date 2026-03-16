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
    const { customerId, items, shippingAddress } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Calculate total
    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    // Create Order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create Order Items
    const orderItems = items.map(item => ({
      order_id: order.id,
      variant_id: item.variantId,
      supplier_id: item.supplierId,
      quantity: item.quantity,
      unit_price: item.price
    }))

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return new Response(
      JSON.stringify({ orderId: order.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
