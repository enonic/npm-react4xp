import {
	describe,
	// expect,
	test as it
} from '@jest/globals';
import { expect } from 'chai';
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
		expect(exists).to.be.true;
	});
	it('the manifest file points to a js file', () => {
		const exists = existsSync(FILE_PATH_JS);
		expect(exists).to.be.true;
	});
	it('the js file export the correct global, and have hydrate, render and renderWithDependencies', () => {
		const script = readFileSync(FILE_PATH_JS).toString();
		global.eval(script);
		// @ts-expect-error TS2304: Cannot find name 'ComEnonicAppWhateverReact4xpClient'.
		expect(!!ComEnonicAppWhateverReact4xpClient).to.be.true;
		// @ts-expect-error TS2304: Cannot find name 'ComEnonicAppWhateverReact4xpClient'.
		expect(!!ComEnonicAppWhateverReact4xpClient.hydrate).to.be.true;
		// @ts-expect-error TS2304: Cannot find name 'ComEnonicAppWhateverReact4xpClient'.
		expect(!!ComEnonicAppWhateverReact4xpClient.render).to.be.true;
		// @ts-expect-error TS2304: Cannot find name 'ComEnonicAppWhateverReact4xpClient'.
		expect(!!ComEnonicAppWhateverReact4xpClient.renderWithDependencies).to.be.true;
	});
});
