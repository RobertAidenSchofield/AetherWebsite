// "Paste your provider's link": the visitor pastes a link and the iPhone
// beside it fills in Onda's add form exactly as the app would, using the
// same recognition rules (lib/iptvLink.ts). Runs entirely in the browser.
import { useEffect, useId, useState } from "react";
import { defaultName, recognise, type IPTVLink } from "../lib/iptvLink";
import Icon from "./Icon";

const examples = [
  { label: "Xtream link", value: "http://line.example.com:8080/get.php?username=alice&password=s3cret&type=m3u_plus" },
  { label: "Server address", value: "line.example.com:8080" },
  { label: "Stalker portal", value: "http://portal.example.com:8080/c/" },
  { label: "M3U playlist", value: "https://lists.example.com/tv.m3u8" },
];

// The app's own wording (LoginView+ProviderLink.swift).
const summaries: Record<IPTVLink["kind"], string> = {
  xtream: "Xtream login — everything's filled in.",
  xtreamServer: "Xtream server — add your username and password below.",
  stalker: "Stalker portal — check the MAC address your provider registered.",
  m3u: "M3U playlist.",
};

const explanations: Record<IPTVLink["kind"], string> = {
  xtream: "An Xtream login. Onda takes the server, username and password straight from the link — there's nothing left to type.",
  xtreamServer: "An Xtream server address. Onda fills in the server; you add the username and password your provider sent.",
  stalker: "A Stalker (MAG) portal. Onda switches to the Stalker form; you confirm the MAC address registered with your provider.",
  m3u: "An M3U playlist. Onda adds it as it is, with the channels, guide and VOD the playlist lists.",
};

type Tab = "Xtream" | "M3U" | "Stalker";
const tabFor = (link: IPTVLink | null): Tab =>
  link?.kind === "stalker" ? "Stalker" : link?.kind === "m3u" ? "M3U" : "Xtream";

export default function LinkPhone() {
  const [text, setText] = useState("");
  const inputId = useId();
  const link = recognise(text);
  const tab = tabFor(link);
  const typed = text.trim().length > 0;
  // Decided after hydrating: the server can't know about the clipboard.
  const [canPaste, setCanPaste] = useState(false);
  useEffect(() => setCanPaste(!!navigator.clipboard?.readText), []);

  const paste = async () => {
    try {
      setText(await navigator.clipboard.readText());
    } catch {
      // Permission refused: the field still takes a normal paste.
    }
  };

  return (
    <div className="linkdemo">
      <div className="card linkdemo-input">
        <label htmlFor={inputId} className="linkdemo-label">
          Paste a link from your provider
        </label>
        <div className="linkdemo-field">
          <input
            id={inputId}
            type="url"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="http://…"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          {typed ? (
            <button type="button" className="icon-btn" onClick={() => setText("")} aria-label="Clear">
              <Icon name="close" size={16} strokeWidth={2.2} />
            </button>
          ) : (
            canPaste && (
              <button type="button" className="icon-btn" onClick={paste} aria-label="Paste">
                <Icon name="clipboard" size={16} strokeWidth={2} />
              </button>
            )
          )}
        </div>
        <div className="chips" aria-label="Examples">
          <span className="linkdemo-or">Or try:</span>
          {examples.map((example) => (
            <button key={example.label} type="button" className="chip chip-btn" onClick={() => setText(example.value)}>
              {example.label}
            </button>
          ))}
        </div>
        <p className="linkdemo-result" aria-live="polite">
          {link ? (
            <>
              <Icon name="checkCircle" size={18} strokeWidth={2.2} className="ok" /> {explanations[link.kind]}
            </>
          ) : typed ? (
            <>
              <Icon name="warning" size={18} strokeWidth={2} className="warn" /> That doesn't look like a web address. Links start with
              http:// or https://, or a server name.
            </>
          ) : (
            "Onda recognises Xtream, M3U and Stalker links, so you never have to know which one you have."
          )}
        </p>
        <p className="linkdemo-private">
          <Icon name="lock" size={14} strokeWidth={2} /> Checked in your browser. Nothing you paste leaves this page.
        </p>
      </div>

      <div className="phone" role="img" aria-label={`Onda's add form on iPhone, showing the ${tab} form${link ? " filled in from the link" : ""}.`}>
        <div className="phone-screen" aria-hidden="true">
          <div className="phone-island" />
          <div className="phone-body">
            <div className="phone-heading compact">
              <strong>IPTV Subscription</strong>
            </div>

            <div className="p-segmented">
              {(["Xtream", "M3U", "Stalker"] as Tab[]).map((name) => (
                <span key={name} className={name === tab ? "on" : undefined}>
                  {name}
                </span>
              ))}
            </div>

            <div className="p-label">Quick Setup</div>
            <div className="p-card">
              <div className="p-row">
                <span className={`link${typed ? "" : " placeholder"}`}>{typed ? text.trim() : "Paste the link from your provider"}</span>
                <span className="paste">
                  <Icon name="clipboard" strokeWidth={2} />
                </span>
              </div>
              {link && (
                <div className="p-row ok">
                  <Icon name="checkCircle" strokeWidth={2.4} />
                  {summaries[link.kind]}
                </div>
              )}
            </div>

            <div className="p-label">{tab === "M3U" ? "Playlist" : tab === "Stalker" ? "Portal" : "Xtream Codes"}</div>
            <div className="p-card">
              {tab === "Xtream" && (
                <>
                  <Field label="Server" value={link && "server" in link ? link.server.replace(/^https?:\/\//, "") : ""} />
                  <Field label="Username" value={link?.kind === "xtream" ? link.username : ""} />
                  <Field label="Password" value={link?.kind === "xtream" ? "•".repeat(Math.min(10, link.password.length)) : ""} />
                </>
              )}
              {tab === "M3U" && <Field label="URL" value={link?.kind === "m3u" ? link.url : ""} />}
              {tab === "Stalker" && (
                <>
                  <Field label="Portal" value={link?.kind === "stalker" ? link.portal.replace(/^https?:\/\//, "") : ""} />
                  <Field label="MAC" value="" placeholder="00:1A:79:…" />
                </>
              )}
              <Field label="Name" value="" placeholder={link ? defaultName(text) : "Optional"} />
            </div>

            <div className={`p-primary${link?.kind === "xtream" || link?.kind === "m3u" ? "" : " is-disabled"}`}>Add Playlist</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder = "Required" }: { label: string; value: string; placeholder?: string }) {
  return (
    <div className="p-row">
      <span className="k">{label}</span>
      <span className={`v${value ? " filled" : " placeholder"}`}>{value || placeholder}</span>
    </div>
  );
}
