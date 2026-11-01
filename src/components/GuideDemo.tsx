// A working slice of Aether's TV guide, on the visitor's own clock: the
// schedule is laid out around the current time, the red line moves, and a
// programme opens its details — with catch-up for ones that already aired on
// channels that offer it. Channels and programmes are made up.
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";

type Show = { title: string; minutes: number; about: string };
type Channel = { number: number; name: string; logo: string; color: string; catchUp: boolean; shows: Show[] };

const channels: Channel[] = [
  {
    number: 101,
    name: "Cinema One",
    logo: "C1",
    color: "#be123c",
    catchUp: true,
    shows: [
      { title: "Feature Presentation", minutes: 120, about: "Tonight's big film, introduced by the channel's resident critic." },
      { title: "Cinema Classics", minutes: 105, about: "A restored favourite from the golden age, in its original ratio." },
      { title: "Director's Cut", minutes: 95, about: "The version the director wanted you to see, with an introduction." },
    ],
  },
  {
    number: 102,
    name: "Action 24/7",
    logo: "ACT",
    color: "#c2410c",
    catchUp: false,
    shows: [
      { title: "Action Hour", minutes: 60, about: "Back-to-back chases, heists and narrow escapes." },
      { title: "Blockbuster Tonight", minutes: 120, about: "A summer tentpole, explosions included." },
      { title: "Stunt Masters", minutes: 30, about: "How the most daring scenes were really filmed." },
    ],
  },
  {
    number: 103,
    name: "Northern News",
    logo: "NN",
    color: "#1d4ed8",
    catchUp: true,
    shows: [
      { title: "World Tonight", minutes: 30, about: "The day's main stories from around the world." },
      { title: "Evening Bulletin", minutes: 30, about: "National and regional news, sport and the weather." },
      { title: "Weather", minutes: 15, about: "The forecast for the next three days." },
      { title: "Business Brief", minutes: 15, about: "Markets, money and the companies in the news." },
    ],
  },
  {
    number: 104,
    name: "Kids Club",
    logo: "KC",
    color: "#047857",
    catchUp: false,
    shows: [
      { title: "Paper Planes", minutes: 25, about: "Folding, flying and a lot of crash landings." },
      { title: "Starlight Stories", minutes: 20, about: "Gentle tales under a sky full of stars." },
      { title: "Puzzle Pals", minutes: 30, about: "Three friends, one mystery, and a talking map." },
    ],
  },
  {
    number: 105,
    name: "Sports Central",
    logo: "SC",
    color: "#7c3aed",
    catchUp: true,
    shows: [
      { title: "Matchday Live", minutes: 105, about: "Full coverage of tonight's match, with analysis at half-time." },
      { title: "Highlights", minutes: 45, about: "Every goal from today's games." },
      { title: "Training Ground", minutes: 30, about: "Inside the drills, tactics and team talks." },
    ],
  },
];

/** Minutes shown: two hours, or one where the guide is phone-narrow. */
const WINDOW = 120;
const COMPACT_WINDOW = 60;
/** Below this width the guide drops channel names and shows one hour. */
const COMPACT_WIDTH = 560;
const MINUTE = 60_000;

type Slot = { channel: Channel; show: Show; start: Date; end: Date; key: string };

/** Each channel's day, repeating its shows from local midnight. */
function schedule(channel: Channel, from: Date, to: Date): Slot[] {
  const midnight = new Date(from);
  midnight.setHours(0, 0, 0, 0);
  const slots: Slot[] = [];
  let cursor = midnight.getTime();
  let i = 0;
  while (cursor < to.getTime()) {
    const show = channel.shows[i % channel.shows.length];
    const end = cursor + show.minutes * MINUTE;
    if (end > from.getTime()) {
      slots.push({ channel, show, start: new Date(cursor), end: new Date(end), key: `${channel.number}-${cursor}` });
    }
    cursor = end;
    i += 1;
  }
  return slots;
}

// The server renders one fixed evening; the browser switches to the real
// clock after hydrating, so both first renders match.
const FIXED = new Date(2026, 9, 31, 20, 43);

export default function GuideDemo() {
  const [now, setNow] = useState(FIXED);
  const [compact, setCompact] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < COMPACT_WIDTH));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const [live, setLive] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date());
    setLive(true);
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const format = useMemo(
    () => new Intl.DateTimeFormat(live ? undefined : "en-GB", { hour: "2-digit", minute: "2-digit" }),
    [live],
  );

  // A two-hour window starting on the half hour before last, so "now" sits
  // in the first half like the app's guide.
  const start = new Date(now);
  // "Now" sits a quarter to half way in: the full guide starts on the half
  // hour before last, the one-hour compact guide a quarter hour before now.
  const span = compact ? COMPACT_WINDOW : WINDOW;
  if (compact) {
    start.setMinutes(now.getMinutes() - (now.getMinutes() % 15) - 15, 0, 0);
  } else {
    start.setMinutes(now.getMinutes() < 30 ? 0 : 30, 0, 0);
    start.setTime(start.getTime() - 30 * MINUTE);
  }
  const end = new Date(start.getTime() + span * MINUTE);
  const needle = (now.getTime() - start.getTime()) / (span * MINUTE);
  const marks = Array.from({ length: span / 30 }, (_, i) => new Date(start.getTime() + i * 30 * MINUTE));

  const rows = channels.map((channel) => schedule(channel, start, end));
  const all = rows.flat();
  const airing = (slot: Slot) => slot.start <= now && slot.end > now;
  const chosen = all.find((slot) => slot.key === selected) ?? rows[0].find(airing) ?? rows[0][0];

  const state = (slot: Slot) => (airing(slot) ? "live" : slot.end <= now ? "past" : "future");
  const minutesUntil = Math.max(0, Math.round((chosen.start.getTime() - now.getTime()) / MINUTE));
  const chosenState = state(chosen);

  return (
    <div className={`card guide${compact ? " is-compact" : ""}`} ref={root}>
      <div className="guide-inner">
        <div className="guide-top">
          <strong>TV Guide</strong>
          <span className="guide-clock tabular" aria-label="Current time">
            {format.format(now)}
          </span>
        </div>

        <div className="guide-grid" role="grid" aria-label="Programme guide">
          <div className="guide-corner" aria-hidden="true">
            ● Now
          </div>
          <div className="guide-times" style={{ gridTemplateColumns: `repeat(${marks.length}, 1fr)` }} aria-hidden="true">
            {marks.map((mark) => (
              <span key={mark.getTime()}>{format.format(mark)}</span>
            ))}
          </div>

          {rows.map((slots, row) => {
            const channel = channels[row];
            return (
              <div className="guide-row" role="row" key={channel.number}>
                <div className="guide-channel" role="rowheader">
                  <span className="num">{channel.number}</span>
                  <span className="guide-logo" style={{ background: channel.color }}>
                    {channel.logo}
                  </span>
                  <span className="name">{channel.name}</span>
                </div>
                <div className="guide-line">
                  {slots.map((slot) => {
                    const visibleStart = Math.max(slot.start.getTime(), start.getTime());
                    const visibleEnd = Math.min(slot.end.getTime(), end.getTime());
                    const width = (visibleEnd - visibleStart) / MINUTE;
                    const slotState = state(slot);
                    const replay = slotState === "past" && channel.catchUp;
                    return (
                      <button
                        type="button"
                        role="gridcell"
                        key={slot.key}
                        className={[
                          "guide-prog",
                          slotState === "live" && "now",
                          slotState === "past" && !replay && "past",
                          slot.key === chosen.key && "focus",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={{ "--w": width } as CSSProperties}
                        aria-pressed={slot.key === chosen.key}
                        aria-label={`${channel.name}: ${slot.show.title}, ${format.format(slot.start)} to ${format.format(slot.end)}`}
                        onClick={() => setSelected(slot.key)}
                      >
                        <b>
                          {replay && <Icon name="replay" size={11} strokeWidth={2.4} className="guide-replay" />}
                          {slot.show.title}
                        </b>
                        <small>{format.format(slot.start)}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="guide-needle" style={{ "--x": needle } as CSSProperties} aria-hidden="true" />
        </div>

        <div className="guide-detail" aria-live="polite">
          <span className="guide-logo guide-detail-logo" style={{ background: chosen.channel.color }}>
            {chosen.channel.logo}
          </span>
          <div className="guide-detail-copy">
            <div className="guide-detail-head">
              <strong>{chosen.show.title}</strong>
              {chosenState === "live" && <span className="pill live">Live</span>}
              {chosenState === "past" && chosen.channel.catchUp && <span className="pill">Catch-up</span>}
              {chosenState === "future" && <span className="pill">In {minutesUntil} min</span>}
            </div>
            <span className="guide-detail-meta tabular">
              {chosen.channel.name} · {format.format(chosen.start)} – {format.format(chosen.end)}
            </span>
            <p>{chosen.show.about}</p>
          </div>
          <span className="guide-detail-action" aria-hidden="true">
            {chosenState === "live" && (
              <>
                <Icon name="play" size={12} /> Watch
              </>
            )}
            {chosenState === "past" && chosen.channel.catchUp && (
              <>
                <Icon name="replay" size={13} strokeWidth={2.2} /> Catch Up
              </>
            )}
            {chosenState === "past" && !chosen.channel.catchUp && "Ended"}
            {chosenState === "future" && "Coming Up"}
          </span>
        </div>
      </div>
    </div>
  );
}
