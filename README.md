# Orbital Dynamics Console

A React aerospace demo that combines a spacecraft-style operations interface with a simplified circular Earth orbit model. This is the second version of my original Mission Status project. I wanted V2 to include more physics and more meaningful data instead of only randomly changing telemetry values.

## Features

- Adjustable low Earth orbit altitude
- Circular orbital velocity calculation
- Orbital period calculation
- Local gravitational acceleration calculation
- Escape velocity comparison
- Simplified animated orbit visualization
- Live altitude telemetry graph
- Mission elapsed time
- Pause and resume controls
- Simulated spacecraft health values
- Flight event log

## Physics Model

The project uses a simplified circular two-body orbit model.

```text
mu = 398600.4418 km^3/s^2
v = sqrt(mu / r)
T = 2 * pi * sqrt(r^3 / mu)
```

The orbital radius `r` is the radius of Earth plus the selected altitude. This demo does not model atmospheric drag, Earth oblateness, solar radiation pressure, or active spacecraft maneuvers.

## Used

- React
- JavaScript
- CSS
- SVG
- Vite

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The interface is an original design inspired by aerospace operations software and human-factors ideas. It is in demo.
