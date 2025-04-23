import { build } from "esbuild"

// ESM

build({
	entryPoints: ["./src/index.ts"],
	outdir: "./dist",
	format: "esm",
	bundle: true,
})

build({
	entryPoints: ["./src/style.css"],
	outdir: "./dist",
	format: "esm",
	bundle: true,
})

// BROWSER

const index = ["./src/index.ts"]
const style = ["./src/style.css"]

build({
	entryPoints: index,
	outfile: "./browser/pocketeditor.js",
	bundle: true,
})
build({
	entryPoints: style,
	outfile: "./browser/pocketeditor.css",
})

build({
	entryPoints: index,
	outfile: "./browser/min/pocketeditor.min.js",
	bundle: true,
	minify: true,
})
build({
	entryPoints: style,
	outfile: "./browser/min/pocketeditor.min.css",
	minify: true,
})
