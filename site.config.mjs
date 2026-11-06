// The site's one settings file: where it's served and how people reach you.
// Read by astro.config.mjs (canonical URLs, sitemap) and by the pages.
export default {
  /** Where the site is served, without a trailing slash. */
  url: "https://example.com",
  /** Shown on Support, Privacy and Anti-piracy. */
  supportEmail: "support@example.com",
  /** Onda's public beta. Download buttons point here until it's on the App Store. */
  testFlightURL: "https://testflight.apple.com/join/bmAGafTY",
  /**
   * The Android beta. "latest/download" with a fixed file name always serves
   * the newest release of the public RobertAidenSchofield/Aether-Releases repo
   * (the source repo stays private; its release files can't be linked).
   */
  androidAPKURL: "https://github.com/RobertAidenSchofield/Aether-Releases/releases/latest/download/Aether-Android.apk",
  androidReleasesURL: "https://github.com/RobertAidenSchofield/Aether-Releases/releases",
  discordURL: "https://discord.gg/DMnQfr69Ug",
};
