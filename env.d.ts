/// <reference types="node" />

declare module "astro/config" {
  export function defineConfig<T extends Record<string, unknown>>(config: T): T;
}

declare module "@astrojs/react" {
  import type { AstroIntegration } from "astro";
  export default function react(): AstroIntegration;
}

declare module "@astrojs/node" {
  import type { AstroIntegration } from "astro";
  type Options = { mode?: "standalone" | "middleware" };
  export default function node(options?: Options): AstroIntegration;
}
