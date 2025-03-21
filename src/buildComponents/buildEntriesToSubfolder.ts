import type {
  EntrySet,
  VerboseLog
} from './index.d';


import {globbySync} from 'globby';
import {
	// join,
	parse,
	// normalize,
	resolve,
	sep
} from 'path';
import {normalizePath} from './normalizePath';


/** Builds component entries from files found under a directory, for selected file extensions, for being transpiled out to a target path. */
export function buildEntriesToSubfolder(
	entrySet: EntrySet,
	verboseLog: VerboseLog
) {
	verboseLog(entrySet, "Entries from subfolder - entry set", 1);

	const sourcePath = normalizePath(entrySet.sourcePath);
	const extensions = entrySet.sourceExtensions;

	// Builds and returns an object [entries]
	// where values are found files under directory [sourcePath] with any one of the fileExtensions in [extensions],
	// and the values are the corresponding filenames (full path under react4xp subfolder)
	// - which also is the access path (jsxPath) of each component in react4xp.

	// path - join normalizes paths. So windows "/" become "\"
	// glob - sync does not accept "\" as path seperators... only "/"
	const initialValueOuter: Record<string,string> = {};
	const initialValueInner: Record<string,string> = {};
	return extensions.reduce(
		(accumulator, extension) =>
			Object.assign(
				accumulator,
				globbySync(`**/*.${extension}`, {cwd: sourcePath})
					.reduce(
						(obj, match) => {
							const parsedEl = parse(match);
							const subdir = parsedEl.dir.split(sep);
							const name = [
								entrySet.targetSubDir,
								...subdir,
								parsedEl.name
							].filter(Boolean).join("/");

							const entry = resolve(sourcePath, match);
							verboseLog(`${name} -> ${entry}`, "\tEntry");

							obj[name] = entry;
							return obj;
						},
						initialValueInner
					)
			),
			initialValueOuter
	);
}
