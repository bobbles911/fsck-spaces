#!/usr/bin/env node
import {cwd} from "node:process";
import {join, isAbsolute} from "node:path";
import yargs from "yargs";
import iterateFiles from "./iterateFiles.js";
import processFiles from "./processFiles.js";

let fileTypes = ["js", "ts", "jsx", "tsx", "cjs", "mjs", "json", "html", "css"];
let excludeDirs = ["node_modules"];
let dryRun = false;

const argv = yargs(process.argv.slice(2))
	.scriptName("fsck-spaces")
	.option("more", {
		describe : "add more comma separated file extensions to replace within",
		type : "string"
	})
	.option("dry-run", {
		describe : "just list the files which would be modified",
		type : "string"
	})
	.help()
	.argv;

const runPath = argv._.length > 0 ? argv._[0] : "./";

if (argv.more) {
	fileTypes = [...new Set(fileTypes.concat(argv.more.split(",")))]
}

if (argv.no) {
	excludeDirs = [...new Set(excludeDirs.concat(argv.no.split(",")))]
}

console.log("Running in", runPath);
console.log(`Using file extensions: ${fileTypes}...`);
console.log(`Excluding directories: ${excludeDirs}...`);

if ("dryRun" in argv) {
	dryRun = true;
	console.log("Dry run, will not change anything.");
}

try {
	processFiles(iterateFiles(
		isAbsolute(runPath) ? runPath : join(cwd(), runPath),
		fileTypes,
		excludeDirs
	), dryRun);
} catch (error) {
	console.error(error);
}
