import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import site from "./site.config.mjs";

export default defineConfig({
  site: site.url,
  trailingSlash: "ignore",
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes("/add") && !page.includes("/404") }),
  ],
});
