const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ihegfiqnobewpwcewrae.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZWdmaXFub2Jld3B3Y2V3cmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzAzNjAsImV4cCI6MjA3NTg0NjM2MH0.xaxkB2Br7cQTQRD-PSheiKTY3Rg3jvqsA_pQn1JWS2I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAuditTrigger() {
  try {
    console.log('🔍 Checking audit trigger setup...\n')

    // 1. Check if audit table exists
    console.log('1. Checking audit table...')
    const { data: auditData, error: auditError } = await supabase
      .from('audit')
      .select('*')
      .limit(5)
    
    if (auditError) {
      console.log('❌ Audit table error:', auditError.message)
    } else {
      console.log('✅ Audit table exists with', auditData.length, 'records')
    }

    // 2. Check trips with delivered status
    console.log('\n2. Checking trips with delivered status...')
    const { data: deliveredTrips, error: tripsError } = await supabase
      .from('trips')
      .select('id, trip_id, status, created_at, updated_at')
      .eq('status', 'delivered')
      .order('updated_at', { ascending: false })
      .limit(10)
    
    if (tripsError) {
      console.log('❌ Trips query error:', tripsError.message)
    } else {
      console.log('✅ Found', deliveredTrips.length, 'delivered trips')
      deliveredTrips.forEach(trip => {
        console.log(`   - Trip ${trip.trip_id} (ID: ${trip.id}) - Updated: ${trip.updated_at}`)
      })
    }

    // 3. Check if any delivered trips are in audit table
    if (deliveredTrips && deliveredTrips.length > 0) {
      console.log('\n3. Checking if delivered trips are in audit table...')
      const tripIds = deliveredTrips.map(t => t.trip_id)
      
      const { data: auditTrips, error: auditTripsError } = await supabase
        .from('audit')
        .select('trip_id, status, created_at, actual_end_time')
        .in('trip_id', tripIds)
      
      if (auditTripsError) {
        console.log('❌ Audit trips query error:', auditTripsError.message)
      } else {
        console.log('✅ Found', auditTrips.length, 'trips in audit table')
        auditTrips.forEach(trip => {
          console.log(`   - Audit Trip ${trip.trip_id} - Status: ${trip.status} - End: ${trip.actual_end_time}`)
        })
        
        // Check which delivered trips are missing from audit
        const auditTripIds = auditTrips.map(t => t.trip_id)
        const missingTrips = deliveredTrips.filter(t => !auditTripIds.includes(t.trip_id))
        
        if (missingTrips.length > 0) {
          console.log('\n❌ Missing from audit table:')
          missingTrips.forEach(trip => {
            console.log(`   - Trip ${trip.trip_id} (delivered but not in audit)`)
          })
        } else {
          console.log('\n✅ All delivered trips are in audit table')
        }
      }
    }

    // 4. Test trigger by updating a trip status
    console.log('\n4. Testing trigger by updating a trip status...')
    const { data: testTrip, error: testTripError } = await supabase
      .from('trips')
      .select('id, trip_id, status')
      .neq('status', 'delivered')
      .limit(1)
      .single()
    
    if (testTripError) {
      console.log('❌ No test trip found:', testTripError.message)
    } else if (testTrip) {
      console.log(`📝 Found test trip: ${testTrip.trip_id} (current status: ${testTrip.status})`)
      
      // Update to delivered to trigger the audit
      const { error: updateError } = await supabase
        .from('trips')
        .update({ status: 'delivered' })
        .eq('id', testTrip.id)
      
      if (updateError) {
        console.log('❌ Update error:', updateError.message)
      } else {
        console.log('✅ Updated trip status to delivered')
        
        // Wait a moment and check if it appears in audit
        setTimeout(async () => {
          const { data: auditCheck, error: auditCheckError } = await supabase
            .from('audit')
            .select('*')
            .eq('trip_id', testTrip.trip_id)
            .single()
          
          if (auditCheckError) {
            console.log('❌ Trip not found in audit after update:', auditCheckError.message)
          } else {
            console.log('✅ Trip successfully added to audit table!')
            console.log('   Audit record:', auditCheck)
          }
        }, 2000)
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugAuditTrigger()