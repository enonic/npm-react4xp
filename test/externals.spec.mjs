import { expect } from 'chai';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import manifest from './components/build/resources/main/assets/react4xp/chunks.externals.json' assert {
	type: 'json',
};

const DIR_NAME = join(process.cwd(), 'test/components');
const DIR_R4X = join(DIR_NAME, 'build/resources/main/assets/react4xp');
const FILE_PATH_MANIFEST = join(DIR_R4X, 'chunks.externals.json')
const FILE_PATH_JS = join(DIR_R4X, manifest['externals']['js'][0])

describe('externals', () => {
	it('makes a manifest file', () => {
		const exists = existsSync(FILE_PATH_MANIFEST);
		expect(exists).to.be.true;
	});
	it('the manifest file points to a js file', () => {
		const exists = existsSync(FILE_PATH_JS);
		expect(exists).to.be.true;
	});
	it('the js file export React and ReactDOM. And ReactDOM has createRoot(), flushSync() and hydrateRoot()', () => {
		const script = readFileSync(FILE_PATH_JS).toString();
		global.eval(script);
		expect(!!React).to.be.true;
		expect(typeof React === 'object').to.be.true;
		expect(!!ReactDOM).to.be.true;
		expect(typeof ReactDOM === 'object').to.be.true;
		expect(!!ReactDOM.createRoot).to.be.true;
		expect(typeof ReactDOM.createRoot === 'function').to.be.true;
		expect(!!ReactDOM.flushSync).to.be.true;
		expect(typeof ReactDOM.flushSync === 'function').to.be.true;
		expect(!!ReactDOM.hydrateRoot).to.be.true;
		expect(typeof ReactDOM.hydrateRoot === 'function').to.be.true;
	});
});
