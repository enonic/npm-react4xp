import type {VerboseLog} from './index.d';


import {sep} from 'path';


export const makeExclusionsRegexpString = (
  currentDir :string,
  otherDirs :Array<string>,
  verboseLog :VerboseLog
) =>
  otherDirs
    .filter((dir) => dir !== currentDir && dir.startsWith(currentDir))
    .map((dir) => dir.slice(currentDir.length))
    .map((d) => {
      let dir = d;
      if (dir.startsWith(sep)) {
        dir = dir.slice(1);
      }
      if (dir.endsWith(sep)) {
        dir = dir.slice(0, dir.length - 1);
      }
      verboseLog(`\tExcluding '${dir}' relative to '${currentDir}'`);
      return dir;
    })
    // TODO: escape characters in folder names that actually are regexp characters
    .join("|")
    .trim();
