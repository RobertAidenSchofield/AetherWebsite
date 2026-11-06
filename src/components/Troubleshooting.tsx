// The support page's troubleshooting list, searchable as you type.
import { type ReactNode, useId, useMemo, useState } from "react";
import Icon from "./Icon";

type Topic = { question: string; keywords: string; answer: ReactNode };

const Path = ({ children }: { children: ReactNode }) => <span className="path">{children}</span>;

const topics: Topic[] = [
  {
    question: "Onda can't reach my media server",
    keywords: "jellyfin emby plex server connect address port network local unreachable https",
    answer: (
      <>
        <p>Check that the server is running and reachable: open the same address in a web browser on that device.</p>
        <p>
          At home, make sure you're on the same network as the server, and include the port if it isn't the usual one (<code>8096</code> for
          Jellyfin and Emby, <code>32400</code> for Plex). Away from home you need the server's public address, usually starting with{" "}
          <code>https://</code>.
        </p>
        <p>
          On iPhone and iPad, Onda needs permission to find devices on your local network. Turn it on in{" "}
          <Path>Settings → Privacy &amp; Security → Local Network</Path>.
        </p>
      </>
    ),
  },
  {
    question: "My server isn't listed when I add one",
    keywords: "discover find scan list wifi server missing",
    answer: (
      <p>
        Onda looks for Jellyfin, Emby and Plex servers on the usual ports of your Wi-Fi network. A server on another network, behind a
        firewall or on a custom port won't appear — type its address instead, and Onda checks it.
      </p>
    ),
  },
  {
    question: "Jellyfin says Quick Connect is off",
    keywords: "quick connect code sign in jellyfin dashboard",
    answer: (
      <p>
        Quick Connect is a server setting. The administrator turns it on in the Jellyfin dashboard under <Path>General</Path>. Until then,
        sign in with your username and password.
      </p>
    ),
  },
  {
    question: "A channel or film won't play",
    keywords: "play error fail black screen stream channel movie engine connection limit",
    answer: (
      <>
        <p>When a stream fails, Onda already tries its other playback engines in turn. If none can play it:</p>
        <ul>
          <li>Check it plays in your provider's own app or website.</li>
          <li>Check you're not over your subscription's connection limit — many providers allow one stream at a time.</li>
          <li>
            Change the engine order in <Path>Settings → Player</Path> and try again.
          </li>
        </ul>
        <p>If it still fails, send a diagnostic report straight after trying — it records what happened during playback.</p>
      </>
    ),
  },
  {
    question: "Live TV freezes or keeps buffering",
    keywords: "buffer buffering freeze stutter live lag drop cushion standby reconnect",
    answer: (
      <>
        <p>
          Try the <strong>Onda Engine</strong> (beta) for live channels: it reconnects inside the stream and keeps a small buffer. In its
          options under <Path>Settings → Player</Path>, turn on <strong>Live Cushion</strong> and <strong>Standby Reconnect</strong>.
        </p>
        <p>A wired connection or a stronger Wi-Fi signal helps more than any setting, especially on Apple TV.</p>
      </>
    ),
  },
  {
    question: "The TV guide is empty or missing channels",
    keywords: "epg guide xmltv empty missing programmes schedule",
    answer: (
      <p>
        The guide comes from your provider. If it doesn't supply one, or some channels have none, add an XMLTV link in{" "}
        <Path>Settings → TV Guide</Path>. Guide data can take a moment to download after you add it.
      </p>
    ),
  },
  {
    question: "My Apple TV didn't get the source I added on iPhone",
    keywords: "apple tv icloud sync iphone setup qr code missing",
    answer: (
      <p>
        Sources reach other devices through iCloud. Make sure both are signed in to the same Apple Account with iCloud turned on, then open
        Onda on both and give it a minute.
      </p>
    ),
  },
  {
    question: "The Android APK won't install",
    keywords: "android apk install fire tv google tv shield downloader unknown sources app not installed",
    answer: (
      <>
        <p>
          The app you download it with needs permission to install apps: on Fire TV under{" "}
          <Path>Settings → My Fire TV → Developer options → Install unknown apps</Path>, on Google TV under{" "}
          <Path>Settings → Apps → Security &amp; restrictions → Unknown sources</Path>.
        </p>
        <p>
          The device needs Android 9 or later and an ARM processor (64-bit or 32-bit). "App not installed" over an existing copy usually means
          that copy came from somewhere else: uninstall it first, then install the APK from the releases page.
        </p>
      </>
    ),
  },
  {
    question: "The first load takes a long time",
    keywords: "slow loading sync index catalogue first time",
    answer: (
      <p>
        The first time you add a source, Onda downloads and indexes the whole catalogue on your device so browsing and search are
        instant afterwards. Large catalogues can take a few minutes. Later updates only fetch what changed.
      </p>
    ),
  },
  {
    question: "How do I move my setup to a new device?",
    keywords: "new device move transfer export import backup",
    answer: (
      <p>
        Sign in to the same iCloud account and open Onda — your sources, profiles, progress and favourites come with you. You can also
        export your setup to a file and import it on the other device from Settings.
      </p>
    ),
  },
];

export default function Troubleshooting({ email }: { email: string }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const words = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const matches = useMemo(
    () =>
      topics.filter((topic) => {
        const haystack = `${topic.question} ${topic.keywords}`.toLowerCase();
        return words.every((word) => haystack.includes(word));
      }),
    [words],
  );

  return (
    <div className="troubleshooting">
      <label className="search-field" htmlFor={inputId}>
        <Icon name="search" size={18} strokeWidth={2} />
        <input
          id={inputId}
          type="search"
          placeholder="Search problems — e.g. buffering, Plex, guide"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <p className="search-count" aria-live="polite">
        {query ? `${matches.length} of ${topics.length} topics` : `${topics.length} topics`}
      </p>

      <div className="faq">
        {matches.map((topic) => (
          <details key={topic.question} open={words.length > 0 && matches.length <= 2}>
            <summary>{topic.question}</summary>
            <div className="answer">{topic.answer}</div>
          </details>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="card empty">
          <p>
            <strong>Nothing matches that yet.</strong>
          </p>
          <p className="muted">
            Send a diagnostic report from Settings, or email <a href={`mailto:${email}`}>{email}</a> and we'll help.
          </p>
        </div>
      )}
    </div>
  );
}
