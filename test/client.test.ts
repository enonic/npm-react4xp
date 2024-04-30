import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
// NOTE: Import assertion not needed when using jest
import manifest from './components/build/resources/main/r4xAssets/client.manifest.json' /* assert {
	type: 'json',
}; */


const DIR_NAME = join(process.cwd(), 'test/components');
const DIR_R4X = join(DIR_NAME, 'build/resources/main/r4xAssets');
const FILE_PATH_MANIFEST = join(DIR_R4X, 'client.manifest.json')
const FILE_PATH_JS = join(DIR_R4X, manifest['client.js'])


describe('client', () => {
	it('makes a manifest file', () => {
		const exists = existsSync(FILE_PATH_MANIFEST);
		expect(exists).toBeTruthy();
	});
	it('the manifest file points to a js file', () => {
		const exists = existsSync(FILE_PATH_JS);
		expect(exists).toBeTruthy();
	});
	it('the js file export the correct global, and have hydrate, render and renderWithDependencies', () => {
		const script = readFileSync(FILE_PATH_JS).toString();
		global.eval(script);
		// @ts-expect-error TS2304: Cannot find name 'ComEnonicAppWhateverReact4xpClient'.
		expect(!!ComEnonicAppWhateverReact4xpClient).toBeTruthy();
		// @ts-expect-error TS2304: Cannot find name 'ComEnonicAppWhateverReact4xpClient'.
		expect(!!ComEnonicAppWhateverReact4xpClient.hydrate).toBeTruthy();
		// @ts-expect-error TS2304: Cannot find name 'ComEnonicAppWhateverReact4xpClient'.
		expect(!!ComEnonicAppWhateverReact4xpClient.render).toBeTruthy();
		// @ts-expect-error TS2304: Cannot find name 'ComEnonicAppWhateverReact4xpClient'.
		expect(!!ComEnonicAppWhateverReact4xpClient.renderWithDependencies).toBeTruthy();
	});
});
