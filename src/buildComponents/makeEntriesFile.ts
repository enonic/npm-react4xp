import type {VerboseLog} from './index.d';


import {
	existsSync,
	mkdirSync,
	writeFileSync
} from 'fs';

import {join} from 'path';


const SLASH = process.platform === "win32" ? '\\' : '/';


// Builds entries.json, which lists the entries: first-level react4xp components that shouldn't be counted as general dependencies.
export function makeEntriesFile(
	entries: object,
	outputPath: string,
	entriesFilename: string,
	verboseLog: VerboseLog
) {
	const entryList = Object.keys(entries);
	const entryFile = join(outputPath, entriesFilename);

	const dirs = outputPath.split(SLASH);
	let accum = "";
	dirs.forEach((dir) => {
		accum += dir + SLASH;
		if (!existsSync(accum)) {
		verboseLog(accum, "\tCreate");
		mkdirSync(accum);
		}
	});
	writeFileSync(entryFile, JSON.stringify(entryList, null, 2));

	verboseLog(entryFile, "React4xp entries (a.k.a jsxPath) listed in");
}
