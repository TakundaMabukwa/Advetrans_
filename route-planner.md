Route Planner API

The Route Planner API allows developers to integrate route planning and schedule optimization functionality into their applications. With this API, users can obtain the optimal routes between multiple locations and for multiple vehicles or agents.

The Route Planner API has been specifically developed to tackle various types of route planning challenges, such as the Travelling Salesman Problem (TSP), Capacitated VRP (CVRP), VRP with Time Windows (VRPTW), Multi-depot Heterogeneous Vehicle VRPTW (MDHVRPTW), Pickup-and-delivery problem with Time Windows (PDPTW), and etc. This API offers a comprehensive solution for optimizing routes and streamlining transportation operations for businesses and organizations of all sizes.

The API accepts input parameters such as locations, amounts, time frames, etc. The API then returns the optimized order of locations as a result. So the Route Planner helps you to solve delivery and route optimization problems for multiple vehicles.

    Authentication and API key
    API reference: inputs
    API reference: outputs
    Solving a route optimization task
    Code samples
    Pricing

In the Route Optimization API Playground, you can experiment with various popular route optimization scenarios to see how this API can help streamline your operations:

Route Planner API Live Demo
Authentication and API key

To start using the Route Planner API, you will need to obtain an API key. Fortunately, you can easily register for a free Route Planner API Key without needing a credit card.

Our free plan lets you start immediately without worrying about costs. Then, when your project requirements grow, you can upgrade to a paid plan to access additional features and resources. To learn more about our pricing options, please visit the Pricing page.

Follow these simple steps to get a Geoapify API key:

    Head over to the Geoapify MyProjects page and create a new account.
    Create a new project and navigate to the API Keys section. An API key will be generated automatically for you, but you can generate multiple keys per project if needed.
    Optionally, you can protect the API key by specifying allowed IP addresses, HTTP referrers, origins, and CORS.
    Select the "Route Planner API" and an API key to generate a URL and programming code.
    Click the "Try" button to execute the API call and view an example of the result object.

API reference: inputs

The Route Planner API operates through HTTP POST requests that receives input data within the request body. Its API parameters enable users to optimize deliveries of bulk or discrete goods and schedule service, maintenance, and repair tasks.
Request URL

You can access the Geoapify Route Planner API via a POST request to the endpoint located at https://api.geoapify.com/v1/routeplanner.

This endpoint allows users to send input data in JSON format and receive optimized route planning solutions for deliveries or other similar tasks.

HTTP POST https://api.geoapify.com/v1/routeplanner
HEADERS 'Content-Type: application/json'
Request URL parameters

To request the Geoapify Route Planner API, you only need to provide one URL parameter - their API key.
Name 	Description
apiKey 	your Geoapify API key
Request body parameters

The API input parameters you need to specify in the request body:
Name 	Type 	Description
agents 	Agent[] 	An agent represents the resource which route and time should be planned (experts, workers, vehicles)
jobs 	Job[] 	The list of jobs that should be done
shipments 	Shipment[] 	The list of shipments that should be pick up/delivered. The shipments list is used to describe items that should be picked up from one location and delivered to another location.
locations 	Location[] 	The list of locations that can be referenced in jobs and shipments
mode 	See the Routing API Travel Modes table 	Travel or transportation mode. The Routing API Travel Modes table contains detailed information about possible travel modes and vehicle types.

Please note that every task submitted to the Geoapify Route Planner API must include at least one of the following lists: jobs or shipments. However, it's possible to have both shipments and jobs in the same task.

In addition, you can also specify additional route parameters. These parameters allow users to customize their route planning solutions further. Below is a list of supported parameters:
Name 	Format 	Description 	Example
avoid 	Array 	List of road types or locations to be avoided by the router. Check the Routing API Avoid options for more details. 	"avoid": [{"type": "tolls"},{"type": "highways"},{"type": "locations", "values": [{"lon": 12.1830350,"lat": 47.981384}]}]
traffic 	Enum: free_flow, approximated 	The traffic model for route calculation, the default value is free_flow, meaning that the route is calculated optimistically with no traffic influence. The approximated traffic model decreases speed for potentially heavy-loaded roads. The traffic model is only used for motorized vehicles modes, such as drive, truck, etc. 	traffic: "approximated"
type 	Enum: balanced, short, less_maneuvers 	Route type, the default value is balanced. Check The Routing API Route Type for more information. 	type: "short"
max_speed 	number 	The maximum speed that a vehicle can travel. This applies to driving mode, all truck modes, and bus modes. The max_speed should be specified within the range of 10 to 252 KPH (6.5 - 155 MPH). For trucks, the standard setting is 90 kilometers per hour (KPH), while for automobiles and buses, it's set at 140 KPH by default. 	max_speed: 80
units 	Enum: metric, imperial 	Distance units for the calculated route, the default valie is metric. 	units: "imperial"
Agent object

An agent represents a resource requiring route and time planning, such as experts, workers, or vehicles:
Name 	Type 	Description
start_location 	[longitude, latitude] 	Start location represented as an array of coordinates: [longitude, latitude]. Usually is a parking or warehouse location for vehicles, an office or home location for workers.
start_location_index 	number 	Index of the start location in the locations list
end_location 	[longitude, latitude] 	Optional end location for the agent.
end_location_index 	number 	Index of the end location in the locations list
pickup_capacity 	number 	For bulky goods shipments only! Amount of bulky goods that could be picked up by the agent.
delivery_capacity 	number 	For bulky goods shipments only! Amount of bulky goods that could be delivered by the agent.
capabilities 	string[] 	List of the agent capabilities that describe a feature, tool, or knowledge of the agent (vehicle or person). This could be any string values - 'extra-long', ''welding machine, 'electricity'. Agent capabilities should match job requirements.
time_windows 	[[number, number], ...] 	Working timeframes that are represented as pairs of relative times in seconds: [[0, 3600]] - available the first hour only, [[0, 14400], [18000, 32400]] - corresponds to 8-hours working day with 1-hour lunchtime.
breaks 	Break[] 	More flexible way of specifying breaks and interruptions during the working hours. Each break have a desired duration, and list of time_windows during which it can take place. Route planner will try to choose the optimal time window, that fits best to the agent's route.
id 	string 	Optional agent identifier, that can help to identify the agent in results
description 	string 	The agent description

Please note that the time_windows object in the request body contains relative time. For example, the time value "0" can correspond to the start of a day, the beginning of a working day, or any other specific time.

When dealing with bulky goods shipments, it is essential to note that goods for pickup cannot be mixed with goods for delivery. Both the pickup_capacity and delivery_capacity parameters can still be used in the task description. However, it should be assumed that the goods to be picked up and the goods to be delivered will be kept in separate containers.

For example, if an agent has a 1000 pickup capacity and a 1000 delivery capacity, this means that they have two containers: one containing 1000 units of goods and the other one empty. When they deliver 200 units and pick up 100 units at the next job, the containers will contain 800 and 100 units, respectively. This ensures that the picked up and delivered goods are not mixed up."
Break object

The break object specifies breaks and interruptions during working hours in a more flexible manner. Each break includes a desired duration and a list of time_windows, which represent the time intervals during which the break can take place.

The Route Planner API will try to choose the optimal time window for the break that fits best with the agent's route. This object can help to ensure that the agent's working hours are efficiently scheduled and that necessary breaks are taken at appropriate times.
Name 	Type 	Description
duration 	number 	The break duration in seconds.
time_windows 	[[number, number], ...] 	Time ranges during which the break can take place, represented as pairs of relative times in seconds. Examples: [[3600, 7200]] - during the 2nd hour from the beginning of working day, [[14400, 18000], [28800, 32400]] - break can take place betwen 4th and 5th working hour or between 8th and 9th working hour.
Job object

The jobs object represents a list of delivery or service jobs that an agent needs to perform:
Name 	Type 	Description
location 	[longitude, latitude] 	The job location.
location_index 	number 	Index of the location in the locations list
priority 	number = 0..100 	Job priority. By default is 0. 0 - the lowest priority, 100 - the highest priority. Lower priority jobs may be skipped if there is not enough agents or time to serve all.
duration 	number 	The job duration in seconds.
pickup_amount 	number 	For bulky goods shipments only! Amount of bulky goods to be picked up.
delivery_amount 	number 	For bulky goods shipments only! Amount of bulky goods to be delivered.
requirements 	string[] 	List of the job requirements that describe a feature, tool or knowledge that is required to make the job. This can be any string values - 'extra-long', 'welding machine', 'electricity'. Job requirements should match agent capabilities.
time_windows 	[[number, number], ...] 	Required timeframes that are represented as pairs of relative times in seconds, for example [[0, 3600]]. An agent will be required to reach job location within the time window. Can be used to influence job visit order.
id 	string 	Optional job identifier, that can help to identify the job in results
description 	string 	The job description
Shipment object

The shipment object represents the delivery of goods from one location to another location. It is similar to the job object but separately describes pickup and delivery locations:
Name 	Type 	Description
id 	string 	Required parameter, the unique identifier of a shipment.
pickup 	Object 	Pickup parameters.
pickup.location 	[longitude, latitude] 	Pickup location.
pickup.location_index 	number 	Index of the pickup location in the locations list.
pickup.duration 	number 	The pickup duration in seconds.
pickup.time_windows 	[[number, number], ...] 	Pickup timeframes that are represented as pairs of relative times in seconds, for example [[0, 3600]]. An agent will be required to reach pickup location within the time window. Can be used to influence pickup order.
delivery 	Object 	Pickup parameters.
delivery.location 	[longitude, latitude] 	Delivery location.
delivery.location_index 	number 	Index of the delivery location in the locations list.
delivery.duration 	number 	The delivery duration in seconds.
delivery.time_windows 	[[number, number], ...] 	Delivery timeframes that are represented as pairs of relative times in seconds, for example [[0, 3600]]. An agent will be required to reach delivery location within the time window. Can be used to influence delivery order.
requirements 	string[] 	List of the shipment requirements that describe a feature, tool or knowledge that is required to pick up or deliver the shipment. This can be any string values - 'extra-long', 'dangerous', . Shipment requirements should match agent capabilities.
priority 	number = 0..100 	Shipment priority. By default is 0. 0 - the lowest priority, 100 - the highest priority. Lower priority shipments may be skipped if there is not enough agents or time to deliver all.
description 	string 	The shipment description
amount 	number 	The amount of the shipment. The amount can be used in combination with the agent's delivery_capacity when the agent has limits.
Location object

When using the Geoapify Route Planner API, you can specify a list of locations for repeated locations. This is particularly useful when describing the locations of warehouses or other repeated destinations, as it allows you to optimize the number of locations that the route planner will consider.
Name 	Type 	Description
id 	string 	Location unique identifier
location 	[longitude, latitude] 	The location coordinates.

Below is a sample request for a Route Planner API:

POST https://api.geoapify.com/v1/routeplanner?apiKey=YOUR_API_KEY
Content-Type=application/json

{
   "mode":"drive",
   "agents":[
      {
         "start_location":[
            13.381453755359324,
            52.520666399999996
         ],
         "time_windows":[
            [
               0,
               7200
            ]
         ]
      },
      ...
   ],
   "shipments":[
      {
         "id":"order_1",
         "pickup":{
            "location_index":0,
            "duration":120
         },
         "delivery":{
            "location":[
               13.381175446198714,
               52.50929975
            ],
            "duration":120
         }
      },
      ...
   ],
   "locations":[
      {
         "id":"warehouse-0",
         "location":[
            13.3465209,
            52.5245064
         ]
      }
   ]
}

You can generate request objects using the API Playground that encompass the most common route optimization tasks.
API reference: outputs

The API returns a GeoJSON FeatureCollection object, with each feature representing an agent's plan.

Each feature, which is essentially an agent plan, provides comprehensive data regarding route legs, steps, and waypoints associated with job locations, as well as a list of actions that the agent must execute.

Furthermore, the FeatureCollection object incorporates the "properties" object, which holds the input parameters and any issues that arise during task resolution.
Issues object

The Route Planner Issues object returned by a Route Planner API contains information about any issues that occurred during the planning process.

The Issues object may include information about the following types of issues:
Name 	Type 	Description
unassignedAgents 	number[] 	list of agent indexes that do not have an execution plan (shipments or jobs)
unassignedJobs 	number[] 	list of job indexes that are not assigned to any agent
unassignedShipments 	number[] 	list of shipment indexes that are not assigned to any agent
Agent plan object (GeoJSON Feature properties)

Within the feature properties, there is data about the agent's route and the execution of jobs:
Name 	Description
agent_index 	Index of the corresponding agent in the agents input array
distance 	Distance in meters for the whole agent route
time 	Time in seconds, that contains travel time
total_time 	Total time in seconds, contains travel time and action durations
start_time 	Start time for the agent
mode 	Requested transportation or travel mode
actions 	An array of Actions corresponds to the single steps for the agent.
waypoints 	An array of Waypoints corresponds to the jobs execution plan.
legs 	An array of RouteLeg. Each leg represents a route from one waypoint to another.
Action object

Contains single operation information:
Name 	Description
type 	Type of the action. Possible values: 'start', 'end', 'pickup', 'delivery'
start_time 	Execution start time
duration 	Action duration
shipment_index 	Index of the shipment in original shipments array
shopment_id 	Shipment unique identifier
job_index 	Index of the job in original jobs array
job_id 	Job unique identifier if specified
waypoint_index 	Index of the correspinding waypoint
Waypoints

Contains information about a waypoint location and works planned in the location:
Name 	Description
original_location 	Original location. An array of the coordinates: [lon, lat]
original_location_index 	Index of the original location if specified in locations input
original_location_id 	Identifier of the original location if specified in locations input
location 	Matched location. An array of the coordinates: [lon, lat]
start_time 	Actions execution start time, corresponds to arrival time for the waypoint.
duration 	All actions duration
actions 	An array of Actions planned for the waypoint
prev_leg_index 	Route leg that leads to the waypoint
next_leg_index 	Route leg that leads off the waypoint
RouteLeg object

Contains information about a route between 2 locations:
Name 	Description
distance 	Length of the route leg in meters
time 	Time in seconds for the route leg
steps 	An array of LegStep. Steps of the route
from_waypoint_index 	Index of the previous waypoint
to_waypoint_index 	Index of the next waypoint
LegStep object

Contains information about a separate step of RouteLeg:
Name 	Description
distance 	Distance in meters for the step
time 	Time in seconds for the step
from_index 	An index of the way start point in the corresponding feature coordinates array
to_index 	An index of the way end point in the corresponding feature coordinates array

Here is an example of Route Optimization result object:

{
   "type":"FeatureCollection",
   "properties":{
      "mode":"drive",
      "params":{
         "mode":"drive",
         "agents":[...],
         "shipments":[...],
         "locations":[...]
      },
      "issues":{
         "unassigned_shipments":[ 17 ],
         "unassigned_agents": [ 4 ]
      }
   },
   "features":[ ... ]
}

Here is an example of Agent Plan Feature:

{
    "geometry":{
      "type":"MultiLineString",
      "coordinates":[...]
    },
    "type":"Feature",
    "properties":{
      "agent_index":0,
      "time":10775,
      "start_time":0,
      "end_time":10775,
      "distance":19203,
      "legs":[
          {
            "time":44,
            "distance":391,
            "from_waypoint_index":0,
            "to_waypoint_index":1,
            "steps":[
                {
                  "from_index":0,
                  "to_index":1,
                  "time":44,
                  "distance":391
                }
            ]
          },
          ...
      ],
      "mode":"drive",
      "actions":[
          {
            "index":0,
            "type":"start",
            "start_time":0,
            "duration":0,
            "waypoint_index":0
          },
          {
            "index":1,
            "type":"pickup",
            "start_time":44,
            "duration":120,
            "shipment_index":19,
            "shipment_id":"order_20",
            "waypoint_index":1
          },
          ...
      ],
      "waypoints":[
          {
            "original_location":[
                13.3908216,
                52.5194189
            ],
            "location":[
                13.390822,
                52.519419
            ],
            "start_time":0,
            "duration":0,
            "actions":[
                {
                  "index":0,
                  "type":"start",
                  "start_time":0,
                  "duration":0,
                  "waypoint_index":0
                }
            ],
            "next_leg_index":0
          },
          ...
      ]
    }
}

Solving VRP-related tasks

The Route Planner is flexible and has the needed parameters to let you solve a wide range of vehicle routing problems. Here are some quick tips and tricks that will help you define input parameters.
Shipping Bulky Goods

When using the Route Planner API to plan the delivery or pickup of bulky goods, keep the following in mind:

    Use the agent's delivery_capacity / pickup_capacity t define the agent's capacity and the job's delivery_amount / pickup_amount or shipment's amount parameters to determine the shipment amount.
    It is assumed that the agents are fully loaded for delivery-related tasks at the start location. For example, if the task is to deliver heating oil, the vehicle will be considered full at the start position, with the amount specified in delivery_capacity.
    It is assumed that the agents are empty at the start location for pickup-related tasks and can carry up to the amount specified in pickup_capacity at the end position.
    If the agents need to perform multiple iterations to complete all jobs, create additional virtual agents with their starting position at the end location.

Suppose, for instance, you have three Waste Collector Trucks with a collection capacity of 5000l each (15000l in total), and you need to collect 20000l of waste. In that case, one of the trucks will need to make an extra trip to complete all the jobs. To accomplish this, you can generate an additional agent that will commence from a Waste Recycling Plant (where the other agents have their End location). This way, one of the trucks can perform the second iteration planned for the additional agent.
Shipping Individual / Discrete Items

The Route Planner API can also solve tasks involving the delivery or pickup of discrete items. Here are some guidelines to follow:

    Use shipments to specify the items to deliver or pick up.
    If necessary, include jobs in the task to specify additional actions.
    Use locations to add repeated places, such as a storage facility or warehouse.
    Specify capabilities and requirements for agents and jobs, if necessary, to fulfill tasks with unique requirements such as "extra-long," "fragile," or "dangerous."
    By default, the API optimizes resources (agents). To ensure that the jobs are completed within a specific time frame, set the agent's time_windows accordingly.

Resouce management

With the Route Planner API, you can effectively manage resources (agents) based on their capabilities and available hours. Here's how:

    Utilize the agent's capabilities and the job's requirements to specify features, tools, or specific knowledge.
    Set time_windows for both agents and jobs to specify the required and available time slots.
    Ensure that you set the job durations for each job.

Modifying the Execution Plan

In certain cases, modifying the existing route plan may be necessary by adding additional jobs or reassigning certain jobs and optimizing the routes again. You can easily achieve this with the following steps:

    Add the agent identifier as a capability for each agent.
    Add the agent identifier as a requirement to each job where an agent is already assigned.
    Solve the task with the new input parameters.

Code samples
Visualizing Agent Waypoints

The agent's route consists of waypoints or planned jobs and route legs between waypoints. Below is a code sample of how to visualize an agent's waypoints using the MapLibre GL / Mapbox GL library:

routePlans.forEach((agentPlan) => {
  const items = agentPlan.waypoints.map((waypoint, index) =>
    point(waypoint.location, { index: index + 1 })
  );

  // create points source + layer
  map.addSource(`waypoints-of-agent-${agentPlan.agentIndex}`, {
    type: "geojson",
    data: featureCollection(items),
  });

  map.addLayer({
    id: `waypoints-of-agent-${agentPlan.agentIndex}`,
    type: "circle",
    source: `waypoints-of-agent-${agentPlan.agentIndex}`,
    paint: {
      "circle-radius": 10,
      "circle-color": color, // set any color here
      "circle-stroke-width": 1,
      "circle-stroke-color": darker_color, // set a darker color here
    },
  });

  map.addLayer({
    id: `waypoints-text-of-agent-${agentPlan.agentIndex}`,
    type: "symbol",
    source: `waypoints-of-agent-${agentPlan.agentIndex}`,
    layout: {
      "text-field": "{index}",
      "text-allow-overlap": false,
      "text-font": ["Roboto", "Helvetica Neue", "sans-serif"],
      "text-size": 12,
    },
    paint: {
      "text-color": textColor, // set contrast to the color textColor
    },
  });
});

Visualize agent route legs

The Route Planner API uses the Route Matrix API, which operates with time and distance values. The API result includes an order of waypoints but not the actual route geometry. Call the Routing API with the agent waypoints to visualize the agent route and construct the route geometry:

routePlans.forEach((agentPlan, index) => {
  const waypoints = agentPlan.waypoints.map(waypoint => waypoint.location as Position);

  generateRoute(waypoints, travelMode /* 'drive', 'truck', ...*/).then((routeData: FeatureCollection) => {
    const layerId = `agent-route-${index}`;
    agentPlan.routeLayer = layerId;
    map.addSource(layerId, {
      type: 'geojson',
      data: routeData as any
    });

    map.addLayer({
      'id': layerId,
      'type': 'line',
      'source': layerId,
      'layout': {
        'line-cap': "round",
        'line-join': "round"
      },
      'paint': {
        'line-color': color
      }
    });
    
    return layerId;
  })
});

function generateRoute(points: Position[], mode: string) {
  const waypoints = points.map(position => position[1] + ',' + position[0]).join('|');
  let url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=${mode}&apiKey=${apiKey}`;

  return fetch(url).then((resp) => resp.json());
})

Pricing

Geoapify applies credit-based pricing for API usage. We provide various Pricing Plans based on the daily credit consumption. Our pricing plans begin with a free plan that offers 3000 daily credits. You can start with the free plan and upgrade as your business grows.

Route Planner pricing builds on the underlying Route Matrix engine. Every API call considers all locations involved in the task (agent start/end, job, shipment pickup/delivery, and any additional coordinates).
How Route Planner credits are calculated
Component 	How credits are added
Baseline matrix cost 	cost = n × min(n, 10) where n is the number of unique locations
Avoidance surcharges 	Each avoid toggle (+1 for green zones, tolls, ferries, highways), each avoid polygon (+1), country exclusions (+1 each)
Distance surcharges 	For each route returned by the solver, add floor(distance / 500000) credits (1 credit per 500 km chunk)
Batch processing 	Batch submissions reuse the total above before the platform-wide 0.5 multiplier

Examples

    2 couriers (start locations only) and 7 jobs → 9 locations. Baseline 9 × min(9, 10) = 81 credits. No avoid rules means you pay 81.
    7 couriers (start locations) and 30 jobs → 37 locations. Baseline 37 × min(37, 10) = 370 credits. Avoiding ferries and 3 countries adds 4 credits (total 374).
    5 couriers (start & end) and 30 shipments → 80 locations. Baseline 80 × min(80, 10) = 800 credits. A 1 200 km route in the solution adds floor(1_200_000 / 500_000) = 2 more credits (total 802).

Batch or asynchronous jobs reuse the same calculation, then apply the global ×0.5 multiplier when billed.
Learn more

    Geoapify pricing
    Pricing Calculator