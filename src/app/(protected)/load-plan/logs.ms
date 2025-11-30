Download the React DevTools for a better development experience: https://react.dev/link/react-devtools react-dom-client.development.js:25630:1
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
Starting fetchData... page.tsx:259:13
Fetching from Supabase... page.tsx:261:15
Loading assignments from database for dates: 
Object { today: "2025-11-29", tomorrow: "2025-11-30", dayAfter: "2025-12-01" }
page.tsx:366:15
Missing locations for distance calc: 
Object { loadingLocation: "Fuchs Lubricants, Stikland Industrial, 9 Square Street, Bellville 7530", dropOffPoint: "" }
page.tsx:766:17
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
Route preview triggered: 
Object { loadingLocation: "Fuchs Lubricants, Stikland Industrial, 9 Square Street, Bellville 7530", dropOffPoint: "", stopPoints: [], customStopPoints: [] }
page.tsx:589:15
Found assigned orders: 0 page.tsx:375:15
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
Supabase errors: 
Object { loadsError: null, clientsError: null, vehiclesError: null, driversError: null, costCentersError: null }
page.tsx:280:15
Raw loads data: 
Array(14) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
page.tsx:325:15
Raw loads count: 14 page.tsx:326:15
Processed load data: 
Array(14) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
page.tsx:327:15
Processed loads count: 14 page.tsx:328:15
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
RouteEditModal props: 
Object { stopPoints: [], customStopPoints: [], availableStopPoints: 0 }
route-edit-modal.jsx:17:11
Starting 72-hour assignment with 21 new orders page.tsx:1578:15
Existing assignments: 0 vehicle-date combinations page.tsx:1579:15
Day 1: Starting assignment... page.tsx:1582:15
Available vehicles for today: 8/8 page.tsx:1593:15
Fetched 1 available drivers for assignment vehicle-assignment-rules.ts:733:11

=== STEP 0: GEOGRAPHIC CLUSTERING (25km radius) === vehicle-assignment-rules.ts:754:11
Cluster 1: Ceres (3 orders, 3174kg) vehicle-assignment-rules.ts:822:13
Cluster 2: Betty's Bay (1 orders, 58kg) vehicle-assignment-rules.ts:822:13
Cluster 3: Mfuleni (9 orders, 6623kg) vehicle-assignment-rules.ts:822:13
Cluster 4: Kimberley (2 orders, 315kg) vehicle-assignment-rules.ts:822:13
Cluster 5: New Orleans (2 orders, 257kg) vehicle-assignment-rules.ts:822:13
Cluster 6: Porterville (1 orders, 33kg) vehicle-assignment-rules.ts:822:13
Cluster 7: Field's Hill (1 orders, 185kg) vehicle-assignment-rules.ts:822:13
Cluster 8: Theewaterskloof NU (2 orders, 109kg) vehicle-assignment-rules.ts:822:13
Created 8 geographic clusters from 21 orders vehicle-assignment-rules.ts:825:11

=== STEP 1: FILTER COMPATIBLE VEHICLES === vehicle-assignment-rules.ts:835:11
  Analyzed 21 orders for vehicle compatibility vehicle-assignment-rules.ts:892:11

=== STEP 2A: SEPARATE ORDERS BY RESTRICTIONS === vehicle-assignment-rules.ts:895:11
Separated: 0 drum orders, 0 customer-restricted, 21 unrestricted vehicle-assignment-rules.ts:929:11

=== ASSIGNING DRUM ORDERS === vehicle-assignment-rules.ts:932:11

=== ASSIGNING CUSTOMER-RESTRICTED ORDERS === vehicle-assignment-rules.ts:964:11

=== STEP 2B: ASSIGN UNRESTRICTED ORDERS BY CLUSTER (CAPACITY OPTIMIZATION) === vehicle-assignment-rules.ts:993:11
Assigning 21 orders from 8 clusters vehicle-assignment-rules.ts:1008:13

Cluster: Ceres (3 orders, 3174kg) vehicle-assignment-rules.ts:1013:15
  ✓ AUTOZONE (CERES) → CN33826 (2417.072kg, 35% full) vehicle-assignment-rules.ts:1065:21
  ✓ AUTOZONE (CERES) → CN33826 (563.82kg, 43% full) vehicle-assignment-rules.ts:1065:21
  ✓ AUTOZONE (CERES) → CN33826 (192.76kg, 45% full) vehicle-assignment-rules.ts:1065:21

Cluster: Betty's Bay (1 orders, 58kg) vehicle-assignment-rules.ts:1013:15
  ✓ DE WHITE INDUSTRIES (PTY) LTD → CN24056 (57.735kg, 1% full) vehicle-assignment-rules.ts:1065:21

Cluster: Mfuleni (9 orders, 6623kg) vehicle-assignment-rules.ts:1013:15
  ✗ SCANIA SOUTH AFRICA - No vehicle with capacity (3163.88kg) vehicle-assignment-rules.ts:1079:19
  ✓ WSCV ORBIT COMMERCIAL VEHICLES → CN32070 (2712.32kg, 90% full) vehicle-assignment-rules.ts:1065:21
  → CN32070 is 90% full, moving to next vehicle vehicle-assignment-rules.ts:1071:23
  ✓ SMITH MINING EQUIPMENT CAPE TOWN. → CN30847 (385.52kg, 39% full) vehicle-assignment-rules.ts:1065:21
  ✓ LANGEBERG FOODS → CN30847 (192.76kg, 58% full) vehicle-assignment-rules.ts:1065:21
