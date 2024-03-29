import type {VerboseLog} from './index.d';


import {sep} from 'path';
import {regexpEscape} from '../util/regexpEscape';


export const makeExclusionsRegexpString = (
  currentDir: string,
  otherDirs: string[],
  verboseLog: VerboseLog
) => {
	verboseLog(currentDir, 'makeExclusionsRegexpString currentDir');
	verboseLog(otherDirs, 'makeExclusionsRegexpString otherDirs');
	const returnValue = otherDirs
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
		.map(d => regexpEscape(d))
		.join("|")
		.trim();
	verboseLog(returnValue, 'makeExclusionsRegexpString returnValue');
	return returnValue;
}
