import type {SymlinksUnderR4xRoot} from './index.d';


import {
  existsSync,
  lstatSync,
  readlinkSync,
  realpathSync
} from 'fs';

import {
  join,
  resolve,
  sep
} from 'path';

//import {toStr} from '../util/toStr';


// Turns a comma-separated list of subdirectories below the root React4xp source folder (dirPathAbsoluteSrcR4x, usually .../resources/react4xp/)
// into an array of unique, verified, absolute-path'd and OS-compliant folder names.
// Halts on errors, displays warnings, skips items that are not found.
export const normalizeDirList = (
  commaSepDirList: string,
  singularLabel: string,
  dirPathAbsoluteSrcR4x: string,
  symlinksUnderReact4xpRootObject: SymlinksUnderR4xRoot,
  VERBOSE: boolean
) =>
  (commaSepDirList || "").trim()
    ? Array.from(
        new Set(
          commaSepDirList
            .trim()
            .replace(/[\\/]/g, sep)
            .replace(/[´`'"]/g, "")
            .split(",")

            .map((item) => (item || "").trim())
            .filter((item) => !!item)
            .map((item) => item.replace(/[\\/]$/, ""))
            .map((orig) => {
              //console.debug('normalizeDirList() orig', toStr(orig)); // lodash
              let dir = resolve(join(dirPathAbsoluteSrcR4x, orig));
              //console.debug('normalizeDirList() dir', toStr(dir)); // /<...>/src/main/resources/react4xp/lodash

              let realDir = null;
              try {
                realDir = realpathSync(dir);
              } catch (e) {
                if (VERBOSE) {
                  console.warn(
                    `Warning - error message dump for ${singularLabel} '${orig}':\n--------`
                  );
                  console.warn(e);
                }
                console.warn(
                  `${
                    VERBOSE ? "-------->" : "Warning:"
                  } skipping ${singularLabel} '${orig}' from react4xp.config.js${
                    !VERBOSE
                      ? " - it probably just doesn't exist. If you're sure it exists, there may be another problem - run the build again with verbose option (-i) for full error dump"
                      : ""
                  }.`
                );
                return null;
              }

              let symlinkTargetDir = null;
              let lstat = lstatSync(dir);
              while (lstat.isSymbolicLink()) {
                symlinkTargetDir = readlinkSync(dir);
                dir = resolve(dir, '..', symlinkTargetDir);

                if (existsSync(dir)) {
                  if (dir.startsWith(dirPathAbsoluteSrcR4x)) {
                    symlinksUnderReact4xpRootObject[orig] = true; // eslint-disable-line no-param-reassign
                    //console.debug('normalizeDirList() symlinksUnderReact4xpRootObject', toStr(symlinksUnderReact4xpRootObject));
                  }
                  lstat = lstatSync(dir);
                } else {
                  throw Error(
                    `${singularLabel.replace(/^\w/, (c) =>
                      c.toUpperCase()
                    )} '${orig}' from react4xp.config.js leads by resolved symlink(s) to '${dir}', which was not found.`
                  );
                }
              }

              lstat = lstatSync(realDir);
              if (!lstat.isDirectory()) {
                throw Error(
                  `Can't add ${singularLabel} '${orig}' from react4xp.config.js - ${realDir} was found but is not a directory.`
                );
              }

              return realDir;
            })
            .filter((dir) => !!dir)
        )
      )
    : [];
