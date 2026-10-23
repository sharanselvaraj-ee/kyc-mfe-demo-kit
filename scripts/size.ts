// SLIDE: "Why compile-time?" (lite bundle size vs full — real bundled budgets are LITE-002, M2)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = join(import.meta.dirname, "..");

function collectSource(dir: string, exts: string[], out: Buffer[] = []): Buffer[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (name === "node_modules") continue;
      collectSource(path, exts, out);
    } else if (exts.some((ext) => name.endsWith(ext))) {
      out.push(readFileSync(path));
    }
  }
  return out;
}

function report(label: string, dir: string, exts: string[]) {
  const buffers = collectSource(join(ROOT, dir), exts);
  const raw = Buffer.concat(buffers);
  const gz = gzipSync(raw);
  console.log(`${label.padEnd(24)} raw ${(raw.length / 1024).toFixed(1).padStart(6)} KB   gzip (source, approx) ${(gz.length / 1024).toFixed(1).padStart(6)} KB`);
}

console.log("pnpm size — approximate, source-only measurement.");
console.log("Real bundled + minified gzip budgets (loader <=2KB, lite <=35KB) are LITE-002, M2 scope. See docs/LIMITS.md.\n");

report("loader", "packages/loader/src", [".ts"]);
report("mfe-lite", "packages/mfe-lite/src", [".ts", ".svelte"]);
report("mfe-full (no budget)", "packages/mfe-full/src", [".ts", ".tsx"]);
