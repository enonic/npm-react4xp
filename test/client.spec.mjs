import { expect } from 'chai';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import manifest from './components/build/resources/main/assets/react4xp/client.manifest.json' assert {
	type: 'json',
};


const DIR_NAME = join(process.cwd(), 'test/components');
const DIR_R4X = join(DIR_NAME, 'build/resources/main/assets/react4xp');
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
		expect(!!ComEnonicAppWhateverReact4xpClient).to.be.true;
		expect(!!ComEnonicAppWhateverReact4xpClient.hydrate).to.be.true;
		expect(!!ComEnonicAppWhateverReact4xpClient.render).to.be.true;
		expect(!!ComEnonicAppWhateverReact4xpClient.renderWithDependencies).to.be.true;
	});
});
