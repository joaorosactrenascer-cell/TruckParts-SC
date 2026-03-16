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
    const { customerId, installerId, serviceId, scheduledAt, notes, orderId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Create Appointment
    const { data: appointment, error } = await supabaseClient
      .from('appointments')
      .insert({
        customer_id: customerId,
        installer_id: installerId,
        service_id: serviceId,
        scheduled_at: scheduledAt,
        notes: notes,
        order_id: orderId,
        status: 'requested'
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ appointmentId: appointment.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
