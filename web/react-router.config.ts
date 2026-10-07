import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: the browser downloads the app and talks to the NestJS API directly.
  // The API key for Claude and the database credentials live in the NestJS server, never here.
  ssr: false,
} satisfies Config;
