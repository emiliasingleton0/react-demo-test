# Orbital Dynamics Console

A React aerospace demo that combines a spacecraft-style operations interface with a simplified circular Earth orbit model. This is the second version of my original Mission Status project. Wanted V2 to include more physics and more data instead of randomly changing telemetry values

The project uses a simplified circular two-body orbit model.

```text
mu = 398600.4418 km^3/s^2
v = sqrt(mu / r)
T = 2 * pi * sqrt(r^3 / mu)
```

The orbital radius `r` is the radius of Earth plus the selected altitude. This demo does not model atmospheric drag, Earth oblateness, solar radiation pressure, or active spacecraft maneuvers.

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
