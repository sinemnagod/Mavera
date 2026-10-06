import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  // Server-side rendering is on: the Claude API key must live in server-only route code.
  ssr: true,
  presets: [vercelPreset()],
} satisfies Config;
