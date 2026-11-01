// The home page's Apple TV: Aether's home screen with a hero that cycles
// like the app's carousel and a Continue Watching row the focus moves along.
// Every title and image is made up — no one's artwork appears on the site.
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";

type Title = {
  name: string;
  art: string;
  rating: string;
  year: string;
  genre: string;
  kind: "Series" | "Movie";
  plot: string;
  action: string;
  progress: number;
};

const titles: Title[] = [
  {
    name: "Low Tide",
    art: "art-tide",
    rating: "7.8",
    year: "2026",
    genre: "Drama",
    kind: "Series",
    plot: "A lighthouse keeper's daughter comes home to a town the sea is slowly taking back.",
    action: "Resume S1:E4",
    progress: 0.62,
  },
  {
    name: "The Lantern Keeper",
    art: "art-lantern",
    rating: "8.1",
    year: "2025",
    genre: "Mystery",
    kind: "Series",
    plot: "On the night shift, a keeper finds the lamp has been signalling to someone across the bay.",
    action: "Resume S2:E1",
    progress: 0.3,
  },
  {
    name: "Northbound",
    art: "art-north",
    rating: "7.2",
    year: "2026",
    genre: "Adventure",
    kind: "Movie",
    plot: "Two sisters who haven't spoken in years drive a failing truck to the top of the map.",
    action: "Resume · 48 min left",
    progress: 0.55,
  },
  {
    name: "Signal & Noise",
    art: "art-signal",
    rating: "7.6",
    year: "2024",
    genre: "Sci-Fi",
    kind: "Series",
    plot: "A radio engineer starts hearing tomorrow's broadcast tonight.",
    action: "Resume S1:E7",
    progress: 0.8,
  },
  {
    name: "Paper Moons",
    art: "art-moon",
    rating: "6.9",
    year: "2026",
    genre: "Comedy",
    kind: "Movie",
    plot: "A stage magician's last trick goes better than planned, which is the problem.",
    action: "Play",
    progress: 0.15,
  },
  {
    name: "Harbour Lights",
    art: "art-harbor",
    rating: "7.4",
    year: "2025",
    genre: "Crime",
    kind: "Series",
    plot: "Every boat in the harbour has a secret, and the new harbourmaster keeps a list.",
    action: "Resume S3:E2",
    progress: 0.45,
  },
];

const INTERVAL = 6000;

export default function HeroTV() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Only cycle while the TV is on screen, the tab is visible, and the viewer
  // hasn't paused it or asked for reduced motion.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(element);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setUserPaused(true);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || userPaused || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % titles.length);
    }, INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, userPaused, visible, index]);

  const move = useCallback((step: number) => {
    setIndex((current) => (current + step + titles.length) % titles.length);
  }, []);

  const current = titles[index];
  // Keep the focused card in view the way tvOS scrolls a row.
  // The TV scrolls the row to keep focus in view; the phone layout, one card
  // wide, scrolls by `--index` instead (see .mock-row in global.css).
  const railOffset = Math.max(0, Math.min(index - 1, titles.length - 4));

  return (
    <div
      ref={root}
      className="tv"
      role="group"
      aria-roledescription="carousel"
      aria-label="Aether's home screen on Apple TV"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      <div className="tv-screen">
        <div className="mock">
          <div className="mock-tabs" aria-hidden="true">
            <span className="on">Home</span>
            <span>Explore</span>
            <span>Live TV</span>
            <span>Library</span>
            <span>Search</span>
          </div>

          <div className="mock-hero" aria-hidden="true">
            {titles.map((title, i) => (
              <div key={title.name} className={`art ${title.art} hero-art${i === index ? " is-active" : ""}`} />
            ))}
          </div>

          <div className="mock-hero-copy" key={current.name} aria-live="polite">
            <div className={`mock-logo${current.name.length > 12 ? " is-long" : ""}`}>{current.name}</div>
            <div className="mock-meta">
              <b>★ {current.rating}</b>
              <span>{current.year}</span>
              <span>{current.genre}</span>
              <span className="pill mock-pill">{current.kind}</span>
            </div>
            <p className="mock-plot">{current.plot}</p>
            <div className="mock-buttons" aria-hidden="true">
              <span className="mock-btn primary">
                <Icon name="play" size={10} /> {current.action}
              </span>
              <span className="mock-btn">＋ My List</span>
            </div>
          </div>

          <div className="mock-dots">
            {titles.map((title, i) => (
              <button
                key={title.name}
                type="button"
                className={i === index ? "is-active" : undefined}
                aria-label={`Show ${title.name}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>

          <div className="mock-rail">
            <div className="mock-rail-title" aria-hidden="true">
              Continue Watching
            </div>
            <div className="mock-row" style={{ "--offset": railOffset, "--index": index } as CSSProperties}>
              {titles.map((title, i) => (
                <button
                  key={title.name}
                  type="button"
                  className={`mock-wide${i === index ? " focus" : ""}`}
                  style={{ "--p": `${Math.round(title.progress * 100)}%` } as CSSProperties}
                  onClick={() => setIndex(i)}
                  aria-label={`${title.name}, ${title.action}`}
                  tabIndex={-1}
                >
                  <span className={`art ${title.art}`} />
                  <span className="mock-wide-name">{title.name}</span>
                  <i />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="tv-pause"
        onClick={() => setUserPaused((value) => !value)}
        aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
      >
        {userPaused ? <Icon name="play" size={12} /> : <span className="pause-glyph" aria-hidden="true" />}
      </button>
    </div>
  );
}
