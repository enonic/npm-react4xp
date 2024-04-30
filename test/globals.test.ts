import {
	describe,
	expect,
	test as it
} from '@jest/globals';

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// NOTE: Import assertion not needed when using jest
import manifest from './components/build/resources/main/r4xAssets/globals.json' /* assert {
	type: 'json',
}; */

const DIR_NAME = join(process.cwd(), 'test/components');
const DIR_R4X = join(DIR_NAME, 'build/resources/main/r4xAssets');
const FILE_PATH_MANIFEST = join(DIR_R4X, 'globals.json')
const FILE_PATH_GLOBALS_JS = join(DIR_R4X, manifest['globals']['js'][0]);

describe('globals', () => {
	describe('manifest', () => {
		it('makes a manifest file', () => {
			const exists = existsSync(FILE_PATH_MANIFEST);
			expect(exists).toBeTruthy();
		});
		it('the manifest file points to a js file', () => {
			const exists = existsSync(FILE_PATH_GLOBALS_JS);
			expect(exists).toBeTruthy();
		});
	});
	describe('exports', () => {
		const script = readFileSync(FILE_PATH_GLOBALS_JS).toString();
		global.eval(script);
		it('the js file exports React', () => {
			// @ts-expect-error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(!!React).toBeTruthy();
			// @ts-expect-error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(typeof React === 'object').toBeTruthy();
		});
		it('the js file exports ReactDOM', () => {
			// @ts-expect-error TS2686: 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(!!ReactDOM).toBeTruthy();
			// @ts-expect-error TS2686: 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(typeof ReactDOM === 'object').toBeTruthy();
		});
		it('the js file exports ReactDOM with createRoot()', () => {
			// @ts-expect-error TS2686: 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(!!ReactDOM.createRoot).toBeTruthy();
			// @ts-expect-error TS2686: 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(typeof ReactDOM.createRoot === 'function').toBeTruthy();
		});
		it('the js file exports ReactDOM with flushSync()', () => {
			// @ts-expect-error TS2686: 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(!!ReactDOM.flushSync).toBeTruthy();
			// @ts-expect-error TS2686: 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(typeof ReactDOM.flushSync === 'function').toBeTruthy();
		});
		it('the js file exports ReactDOM with hydrateRoot()', () => {
			// @ts-expect-error TS2686: 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(!!ReactDOM.hydrateRoot).toBeTruthy();
			// @ts-expect-error TS2686: 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(typeof ReactDOM.hydrateRoot === 'function').toBeTruthy();
		});
		it('the js file exports lodash as _', () => {
			// @ts-expect-error TS2686: '_' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(!!_).toBeTruthy();
			// @ts-expect-error TS2686: '_' refers to a UMD global, but the current file is a module. Consider adding an import instead.
			expect(typeof _ === 'function').toBeTruthy();
		});
		it("the js file DOESN'T export dayjs", () => {
			// @ts-expect-error TS2304: Cannot find name 'dayjs'.
			expect(typeof dayjs === 'undefined').toBeTruthy();
		});
		it("the js file DOESN'T export MaterialUIButton", () => {
			// @ts-expect-error TS2304: Cannot find name 'MaterialUIButton'.
			expect(typeof MaterialUIButton === 'undefined').toBeTruthy();
		});
		it("the js file DOESN'T export jQuery", () => {
			// @ts-expect-error TS2304: Cannot find name 'jQuery'.
			expect(typeof jQuery === 'undefined').toBeTruthy();
		});
	});
});
