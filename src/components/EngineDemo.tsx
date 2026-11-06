// Plays out the two things the player does when a stream misbehaves:
// moving on to the next engine when one fails, and — on the Onda Engine —
// riding out a live dropout by reconnecting inside the stream. A
// dramatisation of real behaviour; nothing here touches a network.
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

type Status = "idle" | "starting" | "playing" | "failed" | "warning";
type Scenario = "fallback" | "live";
type Step = { at: number; engine: string; status: Status; log: string; buffer?: number };

const orders: Record<Scenario, { name: string; what: string; beta?: boolean }[]> = {
  fallback: [
    { name: "KSPlayer", what: "Broad IPTV compatibility" },
    { name: "VLCKit", what: "Plays almost anything" },
    { name: "AVPlayer", what: "Apple's own, for HLS and MP4" },
    { name: "Onda Engine", what: "Long-running live streams", beta: true },
  ],
  live: [
    { name: "Onda Engine", what: "Long-running live streams", beta: true },
    { name: "KSPlayer", what: "Broad IPTV compatibility" },
    { name: "VLCKit", what: "Plays almost anything" },
    { name: "AVPlayer", what: "Apple's own, for HLS and MP4" },
  ],
};

const scripts: Record<Scenario, Step[]> = {
  fallback: [
    { at: 0, engine: "KSPlayer", status: "starting", log: "Opening stream on KSPlayer" },
    { at: 1800, engine: "KSPlayer", status: "failed", log: "KSPlayer stalled before the first frame" },
    { at: 2500, engine: "VLCKit", status: "starting", log: "Trying the next engine: VLCKit" },
    { at: 3900, engine: "VLCKit", status: "playing", log: "Playing on VLCKit", buffer: 1 },
  ],
  live: [
    { at: 0, engine: "Onda Engine", status: "playing", log: "Playing live on Onda Engine", buffer: 8 },
    { at: 2200, engine: "Onda Engine", status: "warning", log: "Source warning: no data from the provider" },
    { at: 4600, engine: "Onda Engine", status: "playing", log: "Reconnected inside the stream; the picture never stopped", buffer: 2.4 },
  ],
};

const labels: Record<Status, string> = {
  idle: "",
  starting: "Starting…",
  playing: "Playing",
  failed: "Stalled",
  warning: "Warning",
};

export default function EngineDemo() {
  const [scenario, setScenario] = useState<Scenario>("fallback");
  const [step, setStep] = useState(-1);
  const [buffer, setBuffer] = useState(0);
  const [bitrate, setBitrate] = useState(18.4);
  const [run, setRun] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // Start the first time the panel scrolls into view.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRun((value) => value + 1);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Walk the script.
  useEffect(() => {
    if (run === 0) return;
    const steps = scripts[scenario];
    const timers = steps.map((item, i) =>
      window.setTimeout(() => {
        setStep(i);
        if (item.buffer !== undefined) setBuffer(item.buffer);
      }, item.at),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [run, scenario]);

  const steps = scripts[scenario];
  const currentStep = step >= 0 ? steps[step] : null;
  const playing = currentStep?.status === "playing";
  const warning = currentStep?.status === "warning";

  // The buffer fills towards its target while playing and drains during a
  // source warning; the bitrate wanders like a real stream's.
  useEffect(() => {
    if (!playing && !warning) return;
    const target = scenario === "live" ? 8 : 12;
    const timer = window.setInterval(() => {
      setBuffer((value) => (warning ? Math.max(1.2, value - 0.35) : Math.min(target, value + 0.6)));
      setBitrate(() => 17.6 + Math.random() * 1.6);
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing, warning, scenario]);

  const statusOf = (engine: string): Status => {
    let status: Status = "idle";
    for (let i = 0; i <= step; i += 1) {
      if (steps[i].engine === engine) status = steps[i].status;
    }
    return status;
  };

  const replay = (next: Scenario) => {
    started.current = true;
    // Reset in the same render as the scenario switch: the scripts differ in
    // length, so a stale step would index past the end of the new one.
    setStep(-1);
    setBuffer(0);
    setScenario(next);
    setRun((value) => value + 1);
  };

  const stamp = (ms: number) => `+${(ms / 1000).toFixed(1)} s`;

  return (
    <div className="card engine" ref={root}>
      <div className="engine-head">
        <strong>Engine Priority</strong>
        <div className="segmented" role="group" aria-label="Scenario">
          <button type="button" aria-pressed={scenario === "fallback"} onClick={() => replay("fallback")}>
            Stream fails
          </button>
          <button type="button" aria-pressed={scenario === "live"} onClick={() => replay("live")}>
            Live dropout
          </button>
        </div>
      </div>

      <ol className="engine-list">
        {orders[scenario].map((engine, i) => {
          const status = statusOf(engine.name);
          return (
            <li key={engine.name} className={`is-${status}`}>
              <span className="rank">{i + 1}</span>
              <span>
                <span className="name">
                  {engine.name} {engine.beta && <span className="pill tiny">Beta</span>}
                </span>
                <span className="what">{engine.what}</span>
              </span>
              {status !== "idle" && <span className={`pill status-${status}`}>{labels[status]}</span>}
            </li>
          );
        })}
      </ol>

      <dl className="telemetry">
        <div>
          <dt>Video</dt>
          <dd>{playing || warning ? "HEVC 10-bit" : "—"}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{playing || warning ? "3840×2160" : "—"}</dd>
        </div>
        <div>
          <dt>Bitrate</dt>
          <dd>{playing ? `${bitrate.toFixed(1)} Mb/s` : warning ? "0.0 Mb/s" : "—"}</dd>
        </div>
        <div>
          <dt>Buffer</dt>
          <dd className={warning ? "warn" : playing ? "good" : undefined}>{playing || warning ? `${buffer.toFixed(1)} s` : "—"}</dd>
        </div>
      </dl>

      <ol className="engine-log" aria-live="polite">
        {steps.slice(0, step + 1).map((item) => (
          <li key={item.at} className={`is-${item.status}`}>
            <span className="mono">{stamp(item.at)}</span>
            {item.log}
          </li>
        ))}
        {step < 0 && <li className="is-idle">Waiting to play…</li>}
      </ol>

      <button type="button" className="btn btn-small" onClick={() => replay(scenario)}>
        <Icon name="replay" size={16} strokeWidth={2} /> Play again
      </button>
    </div>
  );
}
