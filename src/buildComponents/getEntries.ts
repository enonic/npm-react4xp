import type {EntrySet} from './index.d';


import {buildEntriesToSubfolder} from './buildEntriesToSubfolder';
import {makeEntriesFile} from './makeEntriesFile';


// Entries are the non-dependency output files, i.e. react components and other js files that should be directly
// available and runnable to both the browser and the nashorn engine.
// This function builds the entries AND entries.json, which lists the first-level components that shouldn't be counted
// as general dependencies.
export function getEntries(
  entrySets :Array<EntrySet>,
  outputPath :string,
  entriesFilename :string,
  verboseLog
) {
  const entries = entrySets.reduce(
    (accumulator, entrySet) =>
      Object.assign(accumulator, buildEntriesToSubfolder(entrySet, verboseLog)),
    {}
  );

  if (
    typeof outputPath === "string" &&
    outputPath.trim() !== "" &&
    typeof entriesFilename === "string" &&
    entriesFilename.trim() !== ""
  ) {
    makeEntriesFile(entries, outputPath, entriesFilename, verboseLog);
  }

  return entries;
}
