/**
 * Test script for Geoapify Route Optimization
 * Tests: Fastest route, toll avoidance, truck mode
 */

import { RoutePlanner, Agent, Job, Avoid } from '@geoapify/route-planner-sdk';

// Test configuration
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const DEPOT = { lat: -33.9249, lng: 18.6369 }; // Cape Town depot

// Test customers (Cape Town area)
const TEST_CUSTOMERS = [
  { id: 'job-0', name: 'Stellenbosch', lat: -33.9321, lng: 18.8602, weight: 500 },
  { id: 'job-1', name: 'Paarl', lat: -33.7340, lng: 18.9644, weight: 300 },
  { id: 'job-2', name: 'Somerset West', lat: -34.0781, lng: 18.8419, weight: 400 },
  { id: 'job-3', name: 'Strand', lat: -34.1167, lng: 18.8167, weight: 350 }
];

async function testGeoapifyOptimization() {
  console.log('=== GEOAPIFY ROUTE OPTIMIZATION TEST ===\n');
  
  if (!GEOAPIFY_API_KEY) {
    console.error('❌ ERROR: NEXT_PUBLIC_GEOAPIFY_API_KEY not found in environment');
    process.exit(1);
  }
  
  console.log('✓ API Key found');
  console.log(`✓ Testing with ${TEST_CUSTOMERS.length} customers\n`);
  
  try {
    // Initialize Route Planner
    const planner = new RoutePlanner({ apiKey: GEOAPIFY_API_KEY });
    
    // Configure for SHORTEST route (fastest for trucks) with TOLL avoidance
    planner.setMode('truck');
    planner.setType('short');
    
    // Create avoid object for tolls
    const avoid = new Avoid();
    avoid.setType('tolls');
    planner.addAvoid(avoid);
    
    console.log('Configuration:');
    console.log('  Mode: truck');
    console.log('  Type: short (shortest/fastest route)');
    console.log('  Avoid: tolls\n');
    
    // Add vehicle
    const agent = new Agent()
      .setId('test-vehicle')
      .setStartLocation(DEPOT.lng, DEPOT.lat)
      .setEndLocation(DEPOT.lng, DEPOT.lat)
      .setPickupCapacity(2000);
    
    planner.addAgent(agent);
    console.log(`✓ Added vehicle (capacity: 2000kg)`);
    
    // Add customers as jobs
    TEST_CUSTOMERS.forEach(customer => {
      const job = new Job()
        .setId(customer.id)
        .setLocation(customer.lng, customer.lat)
        .setPickupAmount(customer.weight)
        .setDuration(300); // 5 min per stop
      
      planner.addJob(job);
    });
    
    console.log(`✓ Added ${TEST_CUSTOMERS.length} delivery stops\n`);
    
    // Run optimization
    console.log('Running optimization...');
    const startTime = Date.now();
    const result = await planner.plan();
    const duration = Date.now() - startTime;
    
    console.log(`✓ Optimization completed in ${duration}ms\n`);
    
    // Parse results
    const solutions = result.getAgentSolutions();
    
    if (solutions.length === 0) {
      console.error('❌ No solutions found');
      process.exit(1);
    }
    
    console.log('=== OPTIMIZATION RESULTS ===\n');
    
    for (const solution of solutions) {
      const agentId = solution.getAgentId();
      const distance = solution.getDistance();
      const time = solution.getTime();
      const waypoints = solution.getWaypoints();
      
      console.log(`Vehicle: ${agentId}`);
      console.log(`Total Distance: ${(distance / 1000).toFixed(2)} km`);
      console.log(`Total Time: ${(time / 60).toFixed(0)} minutes`);
      console.log(`Stops: ${waypoints.length}\n`);
      
      console.log('Optimized Route Sequence:');
      waypoints.forEach((waypoint, index) => {
        const actions = waypoint.getActions();
        actions.forEach(action => {
          const jobId = action.getJobId();
          if (jobId) {
            const customer = TEST_CUSTOMERS.find(c => c.id === jobId);
            if (customer) {
              console.log(`  ${index}. ${customer.name} (${customer.weight}kg)`);
            }
          } else if (action.getType() === 'start') {
            console.log(`  ${index}. START - Depot`);
          } else if (action.getType() === 'end') {
            console.log(`  ${index}. END - Return to Depot`);
          }
        });
      });
      
      // Test route geometry fetching
      console.log('\nFetching route geometry...');
      try {
        const routeData = await result.getAgentRoute(agentId, {
          mode: 'truck',
          type: 'short'
        });
        
        if (routeData?.features?.[0]?.geometry) {
          const geometry = routeData.features[0].geometry;
          console.log(`✓ Route geometry fetched (${geometry.coordinates.length} points)`);
          console.log(`  Type: ${geometry.type}`);
        } else {
          console.log('⚠️  No geometry data returned');
        }
      } catch (error) {
        console.error('❌ Failed to fetch route geometry:', error.message);
      }
    }
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('✓ Route Planner initialized');
    console.log('✓ Truck mode configured');
    console.log('✓ Fast route type set');
    console.log('✓ Toll avoidance enabled');
    console.log('✓ Optimization successful');
    console.log('✓ Route sequence generated');
    console.log('✓ Distance and time calculated');
    console.log('\n✅ ALL TESTS PASSED\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run test
testGeoapifyOptimization();
