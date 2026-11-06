// One app on every Apple screen: pick a device to see it framed, with what
// Onda does best there.
import { type KeyboardEvent, useRef, useState } from "react";
import Icon, { type IconName } from "./Icon";

type Platform = {
  id: string;
  name: string;
  icon: IconName;
  tagline: string;
  points: string[];
};

const platforms: Platform[] = [
  {
    id: "iphone",
    name: "iPhone",
    icon: "iphone",
    tagline: "Everything in your pocket.",
    points: [
      "Download movies and episodes to watch offline.",
      "Widgets and Live Activities for what's playing and downloading.",
      "On iPhone Duo, a tabletop player: video above the fold, controls below.",
    ],
  },
  {
    id: "ipad",
    name: "iPad",
    icon: "ipad",
    tagline: "Room for the whole guide.",
    points: [
      "A sidebar and a guide with room to breathe.",
      "Picture in Picture while you do something else.",
      "Multi-View: up to four channels at once.",
    ],
  },
  {
    id: "mac",
    name: "Mac",
    icon: "mac",
    tagline: "In a window, beside your work.",
    points: [
      "Keyboard and trackpad throughout.",
      "Picture in Picture and Multi-View.",
      "Spotlight finds titles and channels straight from your desktop.",
    ],
  },
  {
    id: "tv",
    name: "Apple TV",
    icon: "appletv",
    tagline: "Made for the Siri Remote.",
    points: [
      "Top Shelf takes you straight back to what you were watching.",
      "A channel switcher inside the player, and a live preview in the guide.",
      "Set up from your iPhone by scanning a code — no typing with the remote.",
    ],
  },
  {
    id: "vision",
    name: "Vision Pro",
    icon: "vision",
    tagline: "A screen as big as you like.",
    points: [
      "Watch on a window as large as the room.",
      "The same library, guide and player as everywhere else.",
      "Profiles and progress arrive through iCloud.",
    ],
  },
  {
    id: "android",
    name: "Android TV",
    icon: "remote",
    tagline: "Android TV and Fire TV, in beta.",
    points: [
      "Built for the remote: every screen works with the D-pad.",
      "Paste your provider's link and the Xtream or M3U form fills itself in.",
      "Live TV with the guide, movies and series. Media servers, catch-up and search are coming.",
    ],
  },
];

const cards = ["art-tide", "art-lantern", "art-north", "art-signal", "art-moon"];

export default function PlatformTabs() {
  const [selected, setSelected] = useState("tv");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const platform = platforms.find((item) => item.id === selected) ?? platforms[0];

  const onKey = (event: KeyboardEvent, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + platforms.length) % platforms.length;
    setSelected(platforms[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <div className="platforms-tabs">
      <div className="platform-tablist" role="tablist" aria-label="Devices">
        {platforms.map((item, i) => (
          <button
            key={item.id}
            ref={(element) => {
              tabs.current[i] = element;
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={item.id === selected}
            aria-controls="platform-panel"
            tabIndex={item.id === selected ? 0 : -1}
            onClick={() => setSelected(item.id)}
            onKeyDown={(event) => onKey(event, i)}
          >
            <Icon name={item.icon} size={20} strokeWidth={1.7} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      <div className="card platform-panel" role="tabpanel" id="platform-panel" aria-labelledby={`tab-${platform.id}`}>
        <div className={`device device-${platform.id}`} aria-hidden="true" key={platform.id}>
          <div className="device-screen">
            <div className="art art-tide" />
            <div className="device-shade" />
            <div className="device-title">Low Tide</div>
            <div className="device-row">
              {cards.map((art) => (
                <span key={art} className={`art ${art}`} />
              ))}
            </div>
          </div>
          {platform.id === "mac" && <div className="device-foot" />}
          {(platform.id === "tv" || platform.id === "android") && <div className="device-box" />}
        </div>

        <div className="platform-copy">
          <h3>{platform.tagline}</h3>
          <ul className="checks">
            {platform.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
