
skip to:contentpackage searchsign in
❤

    Pro
    Teams
    Pricing
    Documentation

npm
@geoapify/route-planner-sdk
TypeScript icon, indicating that this package has built-in type declarations
1.1.7 • Public • Published 2 months ago

Geoapify Route Optimization SDK

Docs npm version MIT License

The Geoapify Route Optimization SDK is a lightweight, dependency-free TypeScript library that simplifies building, executing requests, and modifying results for the Geoapify Route Planner API. It helps you easily implement advanced route optimization and delivery planning in both frontend (browser) and backend (Node.js) environments.

Delivery Routes Optimization
Table of Contents

    Features
    Installation
    Quick Start
        Getting API Key
        Import the SDK
        Example: Create Shipment / Delivery Task
        Example: Create Job Optimization Task
    Full Documentation
    Modifying Route Results
        Example: Assign Jobs to the Agent
        Example: Assign Shipments to the Agent
        Example: Remove Jobs
        Example: Remove Shipments
        Example: Add New Jobs
        Example: Add New Shipments
    Timeline Generation
        Example: Generate Placeholder Timeline without Waypoints
        Example: Generate Timeline with Optimized Routes
        Example: Timeline with Custom Popup and Agent Actions
        Timeline Setup Requirements
    Useful Links
    When to Use

Features

The Geoapify Route Optimization SDK provides a modern, dependency-free way to interact with the Geoapify Route Planner API, making it easy to implement complex logistics workflows in both browser and backend environments.

Supported Use Cases:

    Route optimization
    Delivery planning
    Pickup/drop-off scheduling
    Time-constrained and multi-agent logistics

Developer Convenience:

    Build and send optimization requests
    Interpret results (e.g., agent timelines, task sequences)
    Reassign jobs or shipments between agents
    Modify planned routes dynamically

Visualization Support:

    Extract structured timeline and status data for each agent
    Analyze and display routes and schedules using charts or maps

Installation

Install the SDK from NPM:

npm install @geoapify/route-planner-sdk

Quick Start
Getting API Key

To use the Route Optimization SDK, you need a valid Geoapify API Key.

    Go to the Geoapify page.
    Sign up for a Geoapify account. No credit card is required.
    Use the created by default or create a new API key.

You can start with the Free Plan which includes usage limits suitable for testing and small projects. For commercial use and higher request volumes, consider upgrading your plan.
Import the SDK

import RoutePlanner, { Agent, Job } from "@geoapify/route-planner-sdk";
const planner = new RoutePlanner({ apiKey: "YOUR_API_KEY" });

Or use in HTML:

<script src="./node_modules/@geoapify/route-planner-sdk/dist/index.min.js"></script>
<script>
  const planner = new RoutePlannerSDK.RoutePlanner({ apiKey: "YOUR_API_KEY" });
</script>

Example: Create Shipment / Delivery Task

const planner = new RoutePlanner({apiKey: API_KEY});

planner.setMode("drive");

planner.addAgent(new Agent().setStartLocation(44.50485912329202, 40.177547000000004).addTimeWindow(0, 7200));
planner.addAgent(new Agent().setStartLocation(44.50485912329202, 40.177547000000004).addTimeWindow(0, 7200));
planner.addAgent(new Agent().setStartLocation(44.50485912329202, 40.177547000000004).addTimeWindow(0, 7200));

planner.addLocation(new Location().setId("warehouse-0").setLocation(44.5130974, 40.1766863));

planner.addShipment(new Shipment().setId("order-1")
    .setDelivery(new ShipmentStep().setDuration(120).setLocation(44.50932929564537, 40.18686625))
    .setPickup(new ShipmentStep().setDuration(120).setLocationIndex(0)));

planner.addShipment(new Shipment().setId("order-2")
    .setDelivery(new ShipmentStep().setDuration(120).setLocation(44.511160727462574, 40.1816037))
    .setPickup(new ShipmentStep().setDuration(120).setLocationIndex(0)));

planner.addAvoid(new Avoid().setType("tolls"));
planner.addAvoid(new Avoid().addValue(40.50485912329202, 42.177547000000004).setType("locations"));

planner.setTraffic("approximated")
planner.setType("short")
planner.setUnits("metric");
planner.setMaxSpeed(10)

const result = await planner.plan();

Example: Create Job Optimization Task

const planner = new RoutePlanner({apiKey: API_KEY});

planner.setMode("drive");

planner.addAgent(new Agent().setStartLocation(44.52566026661482, 40.1877687).addTimeWindow(0, 10800).setEndLocation(44.486653350000005, 40.18298485).setPickupCapacity(10000));
planner.addAgent(new Agent().setStartLocation(44.52244306971864, 40.1877687).addTimeWindow(0, 10800));
planner.addAgent(new Agent().setStartLocation(44.505007387303756, 40.1877687).addTimeWindow(0, 10800).setEndLocation(44.486653350000005, 40.18298485).setPickupCapacity(10000));

planner.addJob(new Job().setDuration(300).setPickupAmount(60).setLocation(44.50932929564537, 40.18686625));
planner.addJob(new Job().setDuration(200).setPickupAmount(20000).setLocation(44.50932929564537, 40.18686625));
planner.addJob(new Job().setDuration(300).setPickupAmount(10).setLocation(44.50932929564537, 40.18686625));
planner.addJob(new Job().setDuration(300).setPickupAmount(0).setLocation(44.50932929564537, 40.18686625));

const result = await planner.plan();

Full Documentation

Looking for full API references, usage examples, and SDK architecture details?

👉 Explore the full documentation here:
https://geoapify.github.io/route-planner-sdk/
Modifying Route Results

You can edit planned routes easily using RoutePlannerResultEditor.
Example: Assign jobs to the agent

const routeEditor = new RoutePlannerResultEditor(result);
await routeEditor.assignJobs('agent-a', ['job-2']);
let modifiedResult = routeEditor.getModifiedResult();

Example: Assign shipments to the agent

const routeEditor = new RoutePlannerResultEditor(result);
await routeEditor.assignShipments('agent-b', ['shipment-2']);
let modifiedResult = routeEditor.getModifiedResult();

Example: Remove jobs

const routeEditor = new RoutePlannerResultEditor(plannerResult);
await routeEditor.removeJobs(['job-2']);
let modifiedResult = routeEditor.getModifiedResult();

Example: Remove shipments

const routeEditor = new RoutePlannerResultEditor(plannerResult);
await routeEditor.removeShipments(['shipment-4']);
let modifiedResult = routeEditor.getModifiedResult();

Example: Add new jobs

let newJob = new Job()
    .setLocation(44.50932929564537, 40.18686625)
    .setPickupAmount(10)
    .setId("job-5");
await routeEditor.addNewJobs('agent-A', [newJob]);
let modifiedResult = routeEditor.getModifiedResult();

Example: Add new shipments

let newShipment = new Shipment()
    .setPickup(new ShipmentStep().setLocation(44.50932929564537, 40.18686625).setDuration(1000))
    .setDelivery(new ShipmentStep().setLocation(44.50932929564537, 40.18686625))
    .addRequirement('heavy-items')
    .setId("shipment-5");
await routeEditor.addNewShipments('agent-A', [newShipment]);
let modifiedResult = routeEditor.getModifiedResult();

Timeline Generation

RoutePlannerTimeline generates a visual timeline for delivery routes, agents, waypoints, and jobs. It can display either the planned input data or the computed solution, supporting both time-based and distance-based views.

Timeline example
Features

    Visualizes agent timelines for delivery or pickup tasks
    Supports "time" or "distance" modes
    Customizable agent colors, labels, and capacity units
    Optional waypoint popup details and three-dot agent menus

Example: Generate Placeholder Timeline without Waypoints

Creates an empty placeholder timeline based solely on the input data — no routing solution is computed, and no waypoints are included:

const container = document.getElementById('timeline-container');

new RoutePlannerTimeline(container, inputData, undefined, {
      timelineType: 'time',
      hasLargeDescription: false,
      capacityUnit: 'liters',
      agentLabel: 'Truck',
      label: "Simple delivery route planner",
      description: "Deliver ordered items to customers within defined timeframe",
      agentColors: ["#ff4d4d", "#1a8cff", "#00cc66", "#b300b3", "#e6b800", "#ff3385",
        "#0039e6", "#408000", "#ffa31a", "#990073", "#cccc00", "#cc5200", "#6666ff", "#009999"],
    }
);

You can first generate an empty placeholder timeline and later initialize it using the setResult() function with the routing result data
Example: Generate Timeline with Optimized Routes

Displays a complete timeline that includes the computed routing results, along with interactive waypoint popups for each stop.

Let me know if you'd like to emphasize route optimization, travel times, or interactivity more explicitly.

const container = document.getElementById('timeline-container');

new RoutePlannerTimeline(container, inputData, result, {
        timelineType: 'time',
        hasLargeDescription: false,
        capacityUnit: 'liters',
        agentLabel: 'Truck',
        label: "Simple delivery route planner",
        description: "Deliver ordered items to customers within defined timeframe",
        showWaypointPopup: true,
        agentColors: ["#ff4d4d", "#1a8cff", "#00cc66", "#b300b3", "#e6b800", "#ff3385",
          "#0039e6", "#408000", "#ffa31a", "#990073", "#cccc00", "#cc5200", "#6666ff", "#009999"],
      }
);

Example: Timeline with Custom Popup and Agent Actions

const customWaypointPopupGenerator = (waypoint: Waypoint): HTMLElement => {
  const popupDiv = document.createElement('div');
  popupDiv.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 5px;">
      <h4 style="margin: 0">${[...new Set(waypoint.getActions().map(
        action => action.getType().charAt(0).toUpperCase() + action.getType().slice(1))
      )].join(' / ')}</h4>
      <p style="margin: 0">Duration: ${this.toPrettyTime(waypoint.getDuration()) || 'N/A'}</p>
      <p style="margin: 0">Time Before: ${this.toPrettyTime(waypoint.getStartTime()) || 'N/A'}</p>
      <p style="margin: 0">Time After: ${this.toPrettyTime(waypoint.getStartTime() + waypoint.getDuration()) || 'N/A'}</p>
    </div>`;
  return popupDiv;
};

const agentActions: TimelineMenuItem[] = [
  {
    key: 'show-hide-agent',
    label: 'Hide Route',
    callback: (agentIndex: number) => {
      console.log(`Agent ${agentIndex} visibility toggled`);
    }
  },
  {
    key: 'second-button',
    label: 'Test Button',
    disabled: false,
    hidden: false,
    callback: (agentIndex: number) => {
      console.log(`Agent ${agentIndex} test button clicked`);
    }
  }
];

const container = document.getElementById('timeline-container');

const timeline = new RoutePlannerTimeline(container, inputData, undefined, {
  timelineType: 'time',
  hasLargeDescription: false,
  capacityUnit: 'liters',
  agentLabel: 'Truck',
  label: 'Simple delivery route planner',
  description: 'Deliver ordered items to customers within defined timeframe',
  timeLabels: this.timeLabels, // optional
  showWaypointPopup: true,
  waypointPopupGenerator: customWaypointPopupGenerator,
  agentMenuItems: agentActions,
  agentColors: ['#ff4d4d', '#1a8cff', '#00cc66', '#b300b3']
});

// Optional: Listen to hover events
timeline.on('onWaypointHover', (waypoint: Waypoint, agentIndex: number) => {
  console.log('Hovered waypoint:', waypoint, 'Agent:', agentIndex);
});

// Optional: Listen to click events
timeline.on('onWaypointClick', (waypoint: Waypoint, agentIndex: number) => {
  console.log('Clicked waypoint:', waypoint, 'Agent:', agentIndex);
});

// Optional: Modify menu items dynamically before they are shown
timeline.on('beforeAgentMenuShow', (agentIndex: number, actions: TimelineMenuItem[]) => {
  return actions.map(action => {
    if (action.key === 'show-hide-agent') {
      return {
        ...action,
        label: this.agentVisibilityState[agentIndex] ? 'Show Route' : 'Hide Route'
      };
    }
    return action;
  });
});

Timeline Setup Requirements

    Include the timeline-specific CSS: ./node_modules/@geoapify/route-planner-sdk/styles/minimal.css
    Ensure that your HTML container ('timeline-container') is present and ready to render the timeline
    Import the necessary types for the timeline feature, such as RoutePlannerInputData and RoutePlannerResult

Useful Links

    Geoapify Route Planner API Overview
    API Playground
    API Documentation

When to Use

The Geoapify Route Optimization SDK is ideal for:

    Delivery and logistics platforms
    Multi-agent job dispatching
    Shipment planning and optimization
    Interactive route editing and visualization

Simplify your logistics and delivery operations with automated and flexible route optimization.
Readme
Keywords

    geoapify
    route planner
    route optimization
    delivery route optimization
    logistics planning
    last mile delivery
    vehicle routing problem
    vrp
    traveling salesman problem
    tsp
    tsp route planner
    delivery scheduling
    multi-agent routing
    route optimization sdk
    route planning sdk
    route visualization
    route editor
    fleet management
    map routing

Package Sidebar
Install
npm i @geoapify/route-planner-sdk
Repository

github.com/geoapify/route-planner-sdk
Homepage

geoapify.github.io/route-planner-sdk/
Weekly Downloads

55
Version

1.1.7
License

MIT
Unpacked Size

1.51 MB
Total Files

168
Issues

0
Pull Requests

0
Last publish

2 months ago
Collaborators

    geoapify

Try on RunKit
Report malware
Footer
Support

    Help
    Advisories
    Status
    Contact npm

Company

    About
    Blog
    Press

Terms & Policies

    Policies
    Terms of Use
    Code of Conduct
    Privacy

Viewing @geoapify/route-planner-sdk version 1.1.7