import { useEffect, useMemo, useState } from "react";

const EARTH_RADIUS = 6371;
const EARTH_MU = 398600.4418;

function getOrbitData(altitude) {
  const radius = EARTH_RADIUS + altitude;
  const velocity = Math.sqrt(EARTH_MU / radius);
  const period = 2 * Math.PI * Math.sqrt(Math.pow(radius, 3) / EARTH_MU);
  const gravity = (EARTH_MU / Math.pow(radius, 2)) * 1000;
  const escapeSpeed = Math.sqrt((2 * EARTH_MU) / radius);

  return { radius, velocity, period, gravity, escapeSpeed };
}

function formatTime(seconds) {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${secs}`;
}

function formatPeriod(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);

  return `${minutes}m ${String(secs).padStart(2, "0")}s`;
}

function DataCard({ label, value, unit, note }) {
  return (
    <div className="data-card">
      <div className="data-top">
        <span>{label}</span>
        <i />
      </div>
      <strong>
        {value}
        <small>{unit}</small>
      </strong>
      <p>{note}</p>
    </div>
  );
}

function TelemetryGraph({ history }) {
  const width = 640;
  const height = 180;
  const values = history.map((item) => item.value);
  const min = Math.min(...values, 405);
  const max = Math.max(...values, 415);
  const range = Math.max(max - min, 1);

  const points = history
    .map((item, index) => {
      const x = 12 + (index / Math.max(history.length - 1, 1)) * 616;
      const y = 168 - ((item.value - min) / range) * 150;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="graph-box">
      <svg viewBox={`0 0 ${width} ${height}`} aria-label="Altitude telemetry graph">
        {[36, 72, 108, 144].map((y) => (
          <line key={y} x1="0" x2={width} y1={y} y2={y} className="grid-line" />
        ))}
        <polyline points={points} className="graph-line" />
      </svg>
      <div className="graph-labels">
        <span>-30 SEC</span>
        <span>ALTITUDE HISTORY</span>
        <span>NOW</span>
      </div>
    </div>
  );
}

function OrbitGraphic({ missionTime, period, altitude }) {
  const progress = (missionTime % period) / period;
  const angle = progress * Math.PI * 2;
  const x = 350 + Math.cos(angle) * 245;
  const y = 220 + Math.sin(angle) * 132;

  return (
    <div className="orbit-space">
      <div className="stars" />
      <svg className="orbit-svg" viewBox="0 0 700 440">
        <defs>
          <radialGradient id="earthBlue" cx="35%" cy="28%">
            <stop offset="0%" stopColor="#75c7ff" />
            <stop offset="35%" stopColor="#1d6daa" />
            <stop offset="75%" stopColor="#07385f" />
            <stop offset="100%" stopColor="#02131f" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="350" cy="220" rx="245" ry="132" className="orbit-line" />
        <ellipse cx="350" cy="220" rx="282" ry="160" className="orbit-line second" />

        <circle cx="350" cy="220" r="96" fill="url(#earthBlue)" className="earth" />
        <path d="M303 176 C330 158 365 163 378 181 C369 198 344 205 319 197 C309 192 305 184 303 176Z" className="land" />
        <path d="M371 233 C395 220 420 235 421 252 C416 272 392 287 378 279 C370 266 365 249 371 233Z" className="land land-two" />
        <path d="M286 230 C301 213 324 214 334 225 C334 242 320 254 298 258 C287 250 282 240 286 230Z" className="land land-three" />
        <path d="M274 190 C315 166 388 163 432 187" className="cloud" />
        <path d="M282 264 C327 290 386 293 425 269" className="cloud dim-cloud" />

        <line x1="350" y1="220" x2="350" y2="62" className="reference" />
        <text x="364" y="78" className="svg-text">r = {(EARTH_RADIUS + altitude).toFixed(0)} km</text>

        <circle cx={x} cy={y} r="12" className="craft-glow" filter="url(#glow)" />
        <g transform={`translate(${x}, ${y})`} className="craft">
          <rect x="-8" y="-6" width="16" height="12" />
          <rect x="-27" y="-4" width="15" height="8" />
          <rect x="12" y="-4" width="15" height="8" />
          <line x1="-12" y1="0" x2="-8" y2="0" />
          <line x1="8" y1="0" x2="12" y2="0" />
        </g>
      </svg>

      <div className="orbit-note left">
        <span>MODEL</span>
        <strong>CIRCULAR / TWO-BODY</strong>
      </div>
      <div className="orbit-note right">
        <span>TARGET ALTITUDE</span>
        <strong>{altitude} KM</strong>
      </div>
    </div>
  );
}

function App() {
  const [running, setRunning] = useState(true);
  const [missionTime, setMissionTime] = useState(0);
  const [altitude, setAltitude] = useState(410);
  const [telemetryAltitude, setTelemetryAltitude] = useState(410);
  const [temperature, setTemperature] = useState(21.4);
  const [battery, setBattery] = useState(94);
  const [signal, setSignal] = useState(98);
  const [history, setHistory] = useState([
    { value: 410 },
    { value: 410.1 },
    { value: 409.9 },
  ]);
  const [events, setEvents] = useState([
    "Flight dynamics solution loaded",
    "Navigation state vector accepted",
    "Telemetry simulation started",
  ]);

  const orbit = useMemo(() => getOrbitData(altitude), [altitude]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = setInterval(() => {
      setMissionTime((time) => time + 1);

      setTelemetryAltitude((current) => {
        const correction = (altitude - current) * 0.15;
        const smallNoise = (Math.random() - 0.5) * 0.16;
        return current + correction + smallNoise;
      });

      setTemperature((current) =>
        Math.max(18, Math.min(26, current + (Math.random() - 0.5) * 0.18))
      );

      setBattery((current) => Math.max(62, current - Math.random() * 0.015));
      setSignal(Math.round(94 + Math.random() * 6));
    }, 1000);

    return () => clearInterval(timer);
  }, [running, altitude]);

  useEffect(() => {
    if (!running) {
      return;
    }

    setHistory((current) => [
      ...current.slice(-29),
      { value: telemetryAltitude },
    ]);
  }, [telemetryAltitude, running]);

  useEffect(() => {
    if (missionTime > 0 && missionTime % 12 === 0) {
      const messages = [
        "Orbit determination cycle complete",
        "S-band communications link stable",
        "Thermal state remains inside limits",
        "Attitude reference solution updated",
        "Power system load check complete",
      ];

      const index = Math.floor(missionTime / 12) % messages.length;

      setEvents((current) => [
        messages[index],
        ...current.slice(0, 5),
      ]);
    }
  }, [missionTime]);

  function changeAltitude(event) {
    const newAltitude = Number(event.target.value);
    setAltitude(newAltitude);

    setEvents((current) => [
      `Target orbit changed to ${newAltitude} km`,
      ...current.slice(0, 5),
    ]);
  }

  function resetSimulation() {
    setRunning(true);
    setMissionTime(0);
    setAltitude(410);
    setTelemetryAltitude(410);
    setTemperature(21.4);
    setBattery(94);
    setSignal(98);
    setHistory([
      { value: 410 },
      { value: 410.1 },
      { value: 409.9 },
    ]);
    setEvents([
      "Flight dynamics solution loaded",
      "Navigation state vector accepted",
      "Telemetry simulation started",
    ]);
  }

  return (
    <main className="console">
      <header className="top-header">
        <div className="mission-id">
          <div className="mark">OD</div>
          <div>
            <p>ORBITAL DYNAMICS LAB / REACT DEMO</p>
            <h1>Flight Dynamics Console</h1>
          </div>
        </div>

        <div className="header-data">
          <div>
            <span>SIM STATE</span>
            <strong className={running ? "good" : "caution"}>
              {running ? "RUNNING" : "PAUSED"}
            </strong>
          </div>
          <div>
            <span>MISSION ELAPSED TIME</span>
            <strong>{formatTime(missionTime)}</strong>
          </div>
        </div>
      </header>

      <section className="status-strip">
        <span>FLIGHT <strong className="good">GO</strong></span>
        <span>GUIDANCE <strong className="good">NOMINAL</strong></span>
        <span>NAV <strong className="good">LOCKED</strong></span>
        <span>S-BAND <strong className="good">{signal}%</strong></span>
        <span>MODEL <strong>EARTH / CIRCULAR</strong></span>
      </section>

      <section className="intro-panel">
        <div>
          <p className="section-code">FDO // ORBIT SOLUTION 01</p>
          <h2>Low Earth Orbit Dynamics</h2>
          <p className="intro-copy">
            Adjust the target altitude and watch the circular-orbit solution update.
            The dashboard calculates velocity, period, gravity, and escape speed.
          </p>
        </div>

        <div className="actions">
          <button onClick={() => setRunning(!running)}>
            {running ? "PAUSE SIM" : "RESUME SIM"}
          </button>
          <button className="ghost" onClick={resetSimulation}>RESET</button>
        </div>
      </section>

      <section className="main-grid">
        <article className="panel orbit-panel">
          <div className="panel-heading">
            <div>
              <p>FD-01</p>
              <h3>Orbital Geometry</h3>
            </div>
            <span className="panel-state">LIVE MODEL</span>
          </div>

          <OrbitGraphic
            missionTime={missionTime}
            period={orbit.period}
            altitude={altitude}
          />

          <div className="altitude-control">
            <div>
              <span>TARGET ORBIT ALTITUDE</span>
              <strong>{altitude} km</strong>
            </div>
            <input
              type="range"
              min="200"
              max="1200"
              step="10"
              value={altitude}
              onChange={changeAltitude}
              aria-label="Target orbit altitude"
            />
            <div className="range-labels">
              <span>200 KM</span>
              <span>1200 KM</span>
            </div>
          </div>
        </article>

        <article className="panel physics-panel">
          <div className="panel-heading">
            <div>
              <p>FD-02</p>
              <h3>Physics Solution</h3>
            </div>
            <span className="panel-state">DERIVED</span>
          </div>

          <div className="formula-box">
            <span>CIRCULAR ORBIT VELOCITY</span>
            <strong>v = √( μ / r )</strong>
            <p>μ = 398600.4418 km³/s²</p>
          </div>

          <div className="physics-list">
            <DataCard
              label="ORBITAL VELOCITY"
              value={orbit.velocity.toFixed(3)}
              unit="km/s"
              note="Circular orbit solution"
            />
            <DataCard
              label="ORBITAL PERIOD"
              value={formatPeriod(orbit.period)}
              unit=""
              note="Time for one complete orbit"
            />
            <DataCard
              label="LOCAL GRAVITY"
              value={orbit.gravity.toFixed(3)}
              unit="m/s²"
              note="At current orbital radius"
            />
            <DataCard
              label="ESCAPE VELOCITY"
              value={orbit.escapeSpeed.toFixed(3)}
              unit="km/s"
              note="At current orbital radius"
            />
          </div>
        </article>
      </section>

      <section className="telemetry-grid">
        <article className="panel graph-panel">
          <div className="panel-heading">
            <div>
              <p>TLM-01</p>
              <h3>Altitude Telemetry</h3>
            </div>
            <span className="panel-state">{telemetryAltitude.toFixed(2)} KM</span>
          </div>
          <TelemetryGraph history={history} />
        </article>

        <article className="panel vehicle-panel">
          <div className="panel-heading">
            <div>
              <p>SYS-01</p>
              <h3>Vehicle State</h3>
            </div>
          </div>

          <div className="vehicle-list">
            <div><span>CABIN TEMP</span><strong>{temperature.toFixed(1)} °C</strong><em>NOMINAL</em></div>
            <div><span>BATTERY</span><strong>{battery.toFixed(1)} %</strong><em>NOMINAL</em></div>
            <div><span>COMM SIGNAL</span><strong>{signal} %</strong><em>LOCKED</em></div>
            <div><span>ATTITUDE</span><strong>LVLH</strong><em>HOLDING</em></div>
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p>LOG-01</p>
              <h3>Flight Event Log</h3>
            </div>
          </div>

          <ol className="event-list">
            {events.map((event, index) => (
              <li key={`${event}-${index}`}>
                <span>MET {formatTime(Math.max(missionTime - index * 4, 0))}</span>
                <p>{event}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className="panel notes-panel">
          <div className="panel-heading">
            <div>
              <p>DOC-01</p>
              <h3>Model Notes</h3>
            </div>
          </div>

          <p>
            This is a student simulation, not a real flight system. The model
            assumes a circular two-body Earth orbit. Atmospheric drag, Earth
            oblateness, and active maneuvers are not included.
          </p>

          <div className="tags">
            <span>REACT</span>
            <span>ORBITAL PHYSICS</span>
            <span>SVG</span>
            <span>LIVE STATE</span>
          </div>
        </article>
      </section>

      <footer>
        <span>ODC V2.0</span>
        <p>Student aerospace software demo // React + JavaScript</p>
        <span>NOT FOR FLIGHT</span>
      </footer>
    </main>
  );
}

export default App;
