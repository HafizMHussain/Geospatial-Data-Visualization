# GIE 419: Spatial Decision Support Systems
# Assignment 3 Report

**Exploring Frontend Visualization Tools: Kepler.gl, CesiumJS, and D3.js**

---

**Course:** GIE 419 - Spatial Decision Support Systems  
**Submission Date:** December 2024

---

## Introduction and Background

When I first started working on this assignment, I wasn't really sure what to expect from these JavaScript mapping libraries. I had heard of D3.js before in some online tutorials, but Kepler.gl and CesiumJS were completely new to me. After spending considerable time exploring each tool, I can honestly say they're all pretty impressive in their own ways - though each has its quirks and learning curves.

The main goal here was to build a working web application that showcases all three tools. I ended up creating a full-stack setup with Node.js handling the backend stuff and React for the frontend. It took some trial and error to get everything working together, but the end result turned out better than I initially expected.

What I built includes:
- A backend server using Node.js and Express that serves up the geospatial data
- A React-based frontend with a nice Material-UI interface
- Three separate map visualizations - one for each library
- Real datasets including earthquake info, city populations, and country statistics

---

## Why These Tools Matter for SDSS

So here's the thing about Spatial Decision Support Systems - they're basically useless if you can't actually see the data in a meaningful way. You could have the best spatial analysis algorithms in the world, but if the output is just a bunch of numbers in a spreadsheet, good luck making any decisions with that.

That's where these visualization tools come in. They let you take raw geographic data and turn it into something you can actually interact with and understand. What's really cool is that all three of these libraries work right in the browser - no need to install ArcGIS or QGIS or any heavy desktop software.

For this project, I decided to test out three different approaches:
1. Kepler.gl - which Uber created for handling massive datasets
2. CesiumJS - for when you need a proper 3D globe
3. D3.js - the go-to library when you want total control over your visualizations

---

## How I Set Up the Application

### The Tech I Used

I went with a pretty standard modern web stack. Here's what everything looks like:

| Component | What I Used | Why |
|-----------|-------------|-----|
| Server | Node.js with Express | It's fast and I'm familiar with it |
| Frontend Framework | React 18 | Industry standard, lots of resources online |
| UI Library | Material-UI v5 | Makes things look professional without much effort |
| 2D Mapping | Deck.gl | Works great with React, similar to Kepler |
| 3D Globe | CesiumJS 1.113 | Only real option for true 3D globes |
| Charts/Maps | D3.js v7 | Most flexible option out there |
| Navigation | React Router v6 | Standard for React apps |

### Backend API Structure

The server exposes a few endpoints that the frontend calls to get data:

```
/api/data/earthquakes  -> returns earthquake locations in GeoJSON
/api/data/cities       -> gives you major world cities with population info
/api/data/population   -> country-level population density numbers
/api/data/stats        -> some summary statistics
/api/health            -> just checks if the server is running
```

Nothing too fancy here - just straightforward REST endpoints that return JSON data.

---

## Task 1: Working with Kepler.gl

### What is Kepler.gl Anyway?

So Kepler.gl was originally built by the folks at Uber - which makes sense when you think about it. They needed something that could handle visualizing millions of ride data points without the browser crashing. The tool is built on top of another library called Deck.gl, which uses WebGL to do the heavy lifting.

What surprised me most was how easy it is to use. You basically just upload your data (CSV or GeoJSON) and the tool figures out what columns contain the geographic info. Then you can play around with different layer types and styles without writing any code.

### Features I Found Useful

After experimenting for a while, here are the capabilities that stood out:

- The WebGL rendering is seriously fast - I threw 10,000+ points at it and it barely slowed down
- You get lots of layer options: scatter plots, arcs, hexagonal bins, heatmaps, even 3D extruded polygons
- There's a built-in time slider for datasets with timestamps, which is really handy for showing change over time
- You can filter data on the fly using the sidebar controls
- Exporting your map as an image or standalone HTML file is straightforward

### My Implementation

For the Kepler-style visualization, I used Deck.gl directly (since embedding the full Kepler.gl package in React was giving me headaches). I created an earthquake map showing 25 seismic events from around the world.

The earthquakes show up as circles on the map. Bigger circles mean stronger earthquakes, and the color indicates severity - red for the big ones, green for the smaller tremors. When you hover over a point, you get a tooltip with the location name, magnitude, and depth.

I also added some arc lines connecting earthquakes to a central point, mostly just to show off what Deck.gl can do. It looks pretty cool honestly.

### How It Works Under the Hood

The basic flow goes something like this:
1. React component loads up and calls the backend API
2. API returns the earthquake data as GeoJSON
3. Deck.gl creates layer objects from the data
4. WebGL renders everything to a canvas element
5. When you mouse over something, the state updates and shows the tooltip

The nice thing about this approach is that all the rendering happens on the GPU, so your JavaScript thread stays free for handling interactions.

---

## Task 2: Exploring CesiumJS

### First Impressions

CesiumJS is a completely different beast compared to the other two libraries. While Kepler and D3 give you flat maps (or maps with some fake 3D effects), Cesium gives you an actual globe that you can spin around and zoom into.

The library was created by a company called Cesium (formerly AGI) that does a lot of aerospace and defense work. You can tell it's built for serious applications - there's support for things like accurate terrain models, satellite imagery, and even time-dynamic simulations.

### What Makes It Special

A few things that really impressed me:

- It's a true 3D globe using the WGS84 ellipsoid model - same coordinate system that GPS uses
- You can add real terrain data so mountains actually look like mountains
- The timeline feature lets you animate objects moving through space over time
- It can stream huge 3D datasets using something called "3D Tiles"
- Lots of imagery options - Bing maps, OpenStreetMap, or your own custom tiles

### What I Built

For the Cesium part of the project, I made a globe showing 35 major cities around the world. Each city appears as a colored dot that you can click on.

The coloring scheme I went with:
- Red dots for megacities over 20 million people (Tokyo, Delhi, etc.)
- Orange for cities between 10-20 million
- Yellow for 5-10 million
- Green for everything under 5 million

When you click a city, an info box pops up with details about the population and country. The labels only show up when you're zoomed in close enough - otherwise the map would be way too cluttered.

### Technical Bits

Working with CesiumJS was a bit tricky at first. The API is quite different from what I'm used to. Instead of adding DOM elements, you work with "entities" that Cesium manages internally.

Here's roughly how I added each city marker:

```javascript
viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    point: {
        pixelSize: 15,
        color: Cesium.Color.RED
    },
    label: {
        text: "City Name",
        font: '14px sans-serif'
    }
});
```

One thing that tripped me up: Cesium uses its own coordinate system internally (Cartesian3), so you have to convert from regular lat/long coordinates.

---

## Task 3: Building with D3.js

### Why D3 is Different

D3.js takes a fundamentally different approach compared to the mapping-focused libraries. It's not really a mapping library at all - it's a general-purpose tool for binding data to DOM elements and transforming them based on that data.

The name stands for "Data-Driven Documents" which actually describes it pretty well. You give it data, you tell it how that data should map to visual properties (position, color, size, etc.), and D3 handles the rendering.

### What You Can Do With It

For geographic stuff specifically, D3 offers:

- A ton of map projections - Mercator, Robinson, Natural Earth, Orthographic globe view, and like a dozen others
- SVG-based rendering, which means your maps scale perfectly at any size
- Complete control over every visual aspect
- Smooth animations and transitions between states
- Standard DOM events for interactivity

The tradeoff is that D3 has a steep learning curve. There's no "plug in your data and get a map" feature - you have to build everything yourself.

### The Choropleth Map I Made

I decided to create a classic choropleth showing population density by country. Darker blue means more people per square kilometer.

The map uses the Natural Earth projection, which I picked because it looks nice and doesn't distort sizes too badly (unlike Mercator where Greenland looks massive).

I included data for about 56 countries - basically all the major ones plus some smaller countries for variety. Singapore shows up as super dark blue because it has something like 8,000 people per square kilometer, while places like Canada and Australia are barely colored at all.

There's also a legend at the bottom showing what the colors mean, and tooltips that appear when you hover over each country.

### The Data Pipeline

Getting D3 to display geographic data requires a few steps:

1. First you need the actual country shapes. I used a TopoJSON file from the world-atlas package
2. TopoJSON needs to be converted to GeoJSON (D3's preferred format)
3. Then you create a projection and a path generator
4. Each country shape gets bound to an SVG path element
5. The fill color comes from looking up that country's population density in my dataset

The trickiest part was matching countries between the two datasets. The map data uses numeric ISO codes while my density data uses three-letter codes, so I had to create a mapping between them.

---

## Comparing the Three Tools

After working with all three, here's my honest assessment:

| Aspect | Kepler/Deck.gl | CesiumJS | D3.js |
|--------|----------------|----------|-------|
| How it renders | WebGL (GPU) | WebGL (GPU) | SVG or Canvas |
| Best suited for | Huge datasets, quick exploration | 3D visualization, precise mapping | Custom visualizations, infographics |
| Data handling | Millions of points, no problem | Also handles millions via 3D tiles | Gets slow past a few thousand elements |
| 3D capabilities | Fake 3D (extruded shapes) | Real 3D globe | 2D only |
| How customizable | Medium - mostly through config | High - full API access | Extremely high - total control |
| Learning difficulty | Pretty easy | Moderate | Quite hard |
| File size impact | Large (~1MB+) | Large (~1MB+) | Small (~100KB) |

---

## How to Run This Project

If you want to try this out yourself, here's what you need:

### Requirements
- Node.js version 18 or newer
- npm (comes with Node)
- A modern web browser

### Getting It Running

Open up a terminal and run these commands:

```bash
# Go to the project folder
cd "SDSS Assignment 3"

# Install the server dependencies
npm install

# Now install the frontend stuff
cd client
npm install
cd ..

# Start both servers at once
npm run dev
```

After a minute or so, you should be able to open:
- http://localhost:3000 for the frontend
- http://localhost:5000/api for the API directly

---

## What I Learned From This

Honestly, this assignment taught me quite a bit about geospatial visualization. Before starting, I thought mapping libraries were all pretty similar - turns out they're not even close.

**Kepler.gl/Deck.gl** is what I'd reach for if I needed to quickly explore a large dataset. The setup is minimal and the performance is excellent. It's not super customizable, but for most use cases that's fine.

**CesiumJS** is overkill for simple maps, but if you genuinely need 3D globe visualization, it's basically the only game in town. I could see it being useful for things like flight tracking, satellite visualization, or urban planning where terrain matters.

**D3.js** requires the most work but gives you the most control. If I needed to create a really specific visualization that doesn't fit the mold of standard mapping tools, D3 would be my choice. The learning curve is real though.

### My Recommendations

Based on my experience, here's when I'd use each tool:

- **Kepler.gl**: When you have lots of data and need something working fast. Great for data exploration and prototyping.
- **CesiumJS**: When 3D actually matters - aerospace applications, terrain analysis, anything where elevation is important.
- **D3.js**: When you need something custom or you're building visualizations that combine maps with other chart types.

---

## References and Resources

Here are the sources I used while working on this project:

1. Kepler.gl official docs - https://docs.kepler.gl/
2. Deck.gl documentation - https://deck.gl/docs
3. CesiumJS tutorials and API - https://cesium.com/learn/cesiumjs/
4. D3.js documentation - https://d3js.org/
5. React official docs - https://react.dev/
6. Express.js getting started guide - https://expressjs.com/
7. World Atlas TopoJSON files - https://github.com/topojson/world-atlas
8. USGS earthquake data portal - https://earthquake.usgs.gov/

---

*Submitted for GIE 419 - Spatial Decision Support Systems*  
*Assignment 3: Frontend Visualization Tools*
