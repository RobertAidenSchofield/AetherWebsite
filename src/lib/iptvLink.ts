// A port of the app's `IPTVLink` and `ServerAddressHelp` (Aether/Services/
// Network/IPTVLink.swift, Aether/Views/LoginView+MediaServer.swift), so the
// site's "paste your link" demo recognises a link exactly as the app does.
// Keep the two in step: iptvLink.test.ts mirrors the app's
// OnboardingSetupTests.

export type IPTVLink =
  | { kind: "xtream"; server: string; username: string; password: string }
  | { kind: "xtreamServer"; server: string }
  | { kind: "stalker"; portal: string }
  | { kind: "m3u"; url: string };

/** Adds `http://` to an address typed without a scheme. */
export function withScheme(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || trimmed.includes("://")) return trimmed;
  return `http://${trimmed}`;
}

/** The name a playlist gets when none was entered: its host, without `www.`. */
export function defaultName(address: string): string {
  const url = parse(withScheme(address));
  const host = url?.hostname ?? "";
  if (!host) return "My Playlist";
  return host.startsWith("www.") ? host.slice(4) : host;
}

/** What a pasted link is, or null for text that isn't a web address. */
export function recognise(text: string): IPTVLink | null {
  const address = withScheme(text);
  // Foundation's URLComponents rejects spaces; some browsers' URL parsers
  // don't, so refuse them here to match the app.
  if (/\s/.test(address)) return null;
  const url = parse(address);
  if (!url) return null;
  const scheme = url.protocol.replace(":", "").toLowerCase();
  if ((scheme !== "http" && scheme !== "https") || !url.hostname) return null;

  const path = url.pathname;
  const lowerPath = path.toLowerCase();
  if (lowerPath.endsWith("get.php") || lowerPath.endsWith("player_api.php")) {
    const username = url.searchParams.get("username");
    const password = url.searchParams.get("password");
    if (username && password) {
      return { kind: "xtream", server: base(url), username, password };
    }
  }
  if (lowerPath.endsWith("/c") || lowerPath.endsWith("/c/") || lowerPath.endsWith("portal.php")) {
    return { kind: "stalker", portal: address };
  }
  if (path === "" || path === "/") {
    return { kind: "xtreamServer", server: base(url) };
  }
  return { kind: "m3u", url: address };
}

/** Scheme, host and port: an Xtream login's server address. */
function base(url: URL): string {
  return `${url.protocol}//${url.host}`;
}

function parse(address: string): URL | null {
  if (!address) return null;
  try {
    return new URL(address);
  } catch {
    return null;
  }
}
