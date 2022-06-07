import type {
  EntrySet,
  VerboseLog
} from './index.d';


import {sync} from 'glob';
import {
  join,
  parse,
  normalize,
  sep
} from 'path';
import {normalizePath} from './normalizePath';


/** Builds component entries from files found under a directory, for selected file extensions, for being transpiled out to a target path. */
export function buildEntriesToSubfolder(
  entrySet :EntrySet,
  verboseLog :VerboseLog
) {
  verboseLog(entrySet, "Entries from subfolder - entry set", 1);

  const sourcePath = normalizePath(entrySet.sourcePath);
  const extensions = entrySet.sourceExtensions;
  let targetPath = (entrySet.targetSubDir || "").trim();
  if (targetPath.startsWith("/")) {
    targetPath = targetPath.substring(1);
  }

  // Builds and returns an object [entries]
  // where values are found files under directory [sourcePath] with any one of the fileExtensions in [extensions],
  // and the values are the corresponding filenames (full path under react4xp subfolder)
  // - which also is the access path (jsxPath) of each component in react4xp.

  // path - join normalizes paths. So windows "/" become "\"
  // glob - sync does not accept "\" as path seperators... only "/"
  return extensions.reduce(
    (accumulator, extension) =>
      Object.assign(
        accumulator,
        sync(normalizePath(join(sourcePath, `**/*.${extension}`)))
          .reduce((obj, entry) => {
            const parsedEl = parse(entry);

            if (parsedEl && parsedEl.dir.startsWith(sourcePath)) {
              const subdir = parsedEl.dir
                .substring(sourcePath.length)
                .replace(/(^\/+)|(\/+$)/g, "");

              // UGLY HACK: Platform-independent forced-forwardslash version of path.join
              const name = [targetPath, subdir, parsedEl.name]
                .filter((a) => (a || "").trim())
                .join("/");

              verboseLog(`${name} -> ${entry}`, "\tEntry");

              // eslint-disable-next-line no-param-reassign
              obj[name] = entry;
            }
            return obj;
          }, {})
      ),
    {}
  );
}
