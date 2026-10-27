// Loads core's config code (lib/config.ts, lib/schema.ts) outside Next. Those
// files import through the `@/` alias and pull .tsx editors, which plain Node
// cannot load, so tsx is registered first. Register code validates client
// .pages.yml files through this.

import { register } from "tsx/esm/api";
import { register as registerCjs } from "tsx/cjs/api";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = new URL("../../", import.meta.url);
const tsconfig = fileURLToPath(new URL("tsconfig.json", root));
const require = createRequire(import.meta.url);

type CoreModules = {
  config: typeof import("../../lib/config.ts");
  schema: typeof import("../../lib/schema.ts");
};

let loaded: CoreModules | null = null;

export function loadCoreConfig(): Promise<CoreModules> {
  if (!loaded) {
    // core's files have no "type": "module", so Node loads them as CommonJS;
    // tsx's CJS hook reads the tsconfig `paths` (the `@/` alias) from this
    // variable, and the ESM hook covers any ESM import beneath them.
    process.env.TSX_TSCONFIG_PATH = tsconfig;
    register({ tsconfig });
    registerCjs();
    // The field editors import stylesheets; nothing here renders them.
    (require.extensions as Record<string, unknown>)[".css"] = () => {};
    loaded = {
      config: require(fileURLToPath(new URL("lib/config.ts", root))),
      schema: require(fileURLToPath(new URL("lib/schema.ts", root))),
    };
  }
  return Promise.resolve(loaded);
}
