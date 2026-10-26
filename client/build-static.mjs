// Build statis untuk GitHub Pages (menggantikan client/build.mjs yang memakai
// @hatch/space-sdk/build, khusus hosting Muse). Jalankan: bun run build:static
// Output: ./dist/ (index.html + main.js + main.css + aset gambar/video).
// Catatan: theme.css mengimpor "tailwindcss" dan "tailwindcss-safe-area";
// plugin di bawah mengganti kedua impor CSS itu dengan CSS kosong, karena
// semua kelas yang dipakai aplikasi sudah didefinisikan sendiri di theme.css
// (tidak ada kelas utilitas Tailwind di JSX). Preflight Tailwind dengan
// demikian tidak ikut — ini satu-satunya perbedaan gaya yang disengaja.

import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";

const tailwindStub = {
  name: "tailwind-stub",
  setup(builder) {
    builder.onLoad({ filter: /tailwindcss(-safe-area)?\.css$/ }, () => ({
      contents: "/* tailwind preflight intentionally omitted in the static build */",
      loader: "css",
    }));
    // Bun resolves bare CSS @imports through onResolve as well; catch both.
    builder.onResolve({ filter: /^tailwindcss(-safe-area)?$/ }, () => ({
      path: "tailwind-stub.css",
      namespace: "tailwind-stub",
    }));
    builder.onLoad({ filter: /.*/, namespace: "tailwind-stub" }, () => ({
      contents: "/* tailwind preflight intentionally omitted in the static build */",
      loader: "css",
    }));
  },
};

const result = await Bun.build({
  entrypoints: ["./client/src/main.tsx"],
  outdir: "./dist",
  target: "browser",
  splitting: true,
  minify: false,
  sourcemap: "none",
  naming: { entry: "[name]-[hash].js", asset: "[name]-[hash].[ext]" },
  plugins: [tailwindStub],
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

// Bun memberi nama chunk CSS dengan pola entry (".js") sehingga berkas CSS
// keluar berekstensi .js dan tidak akan dipakai browser sebagai stylesheet.
// Kenali berkas itu dari isinya (dimulai komentar CSS + aturan .app-shell)
// dan ganti namanya menjadi .css sebelum index.html dibuat.
let entryCss = null;
for (const name of readdirSync("./dist")) {
  if (!name.endsWith(".js")) continue;
  const path = `./dist/${name}`;
  const content = readFileSync(path, "utf8");
  if (content.startsWith("/*") && content.includes(".app-shell {")) {
    const cssName = name.replace(/\.js$/, ".css");
    renameSync(path, `./dist/${cssName}`);
    entryCss = cssName;
  }
}

// Salin index.html dan arahkan ke bundel statis.
let html = readFileSync("./client/index.html", "utf8");
const entryJs = result.outputs.find((o) => o.kind === "entry-point" && o.path.endsWith(".js") && existsSync(o.path));
if (!entryJs) throw new Error("entry JS not found in build outputs");
const jsName = entryJs.path.split("/").at(-1);
const cssTag = entryCss ? `<link rel="stylesheet" href="./${entryCss}" />\n    ` : "";
html = html.replace(
  '<script src="./src/main.tsx" type="module"></script>',
  `${cssTag}<script src="./${jsName}" type="module"></script>`,
);
writeFileSync("./dist/index.html", html);
console.log("static build ok:", result.outputs.map((o) => o.path).join(", "));
