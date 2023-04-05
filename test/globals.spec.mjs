import { expect } from 'chai';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import manifest from './components/build/resources/main/assets/react4xp/globals.json' assert {
	type: 'json',
};

const DIR_NAME = join(process.cwd(), 'test/components');
const DIR_R4X = join(DIR_NAME, 'build/resources/main/assets/react4xp');
const FILE_PATH_MANIFEST = join(DIR_R4X, 'globals.json')
const FILE_PATH_JS = join(DIR_R4X, manifest['globals']['js'][0])


describe('globals', () => {
	describe('manifest', () => {
		it('makes a manifest file', () => {
			const exists = existsSync(FILE_PATH_MANIFEST);
			expect(exists).to.be.true;
		});
		it('the manifest file points to a js file', () => {
			const exists = existsSync(FILE_PATH_JS);
			expect(exists).to.be.true;
		});
	});
	describe('exports', () => {
		const script = readFileSync(FILE_PATH_JS).toString();
		global.eval(script);
		it('the js file exports React', () => {
			expect(!!React).to.be.true;
			expect(typeof React === 'object').to.be.true;
		});
		it('the js file exports ReactDOM', () => {
			expect(!!ReactDOM).to.be.true;
			expect(typeof ReactDOM === 'object').to.be.true;
		});
		it('the js file exports ReactDOM with createRoot()', () => {
			expect(!!ReactDOM.createRoot).to.be.true;
			expect(typeof ReactDOM.createRoot === 'function').to.be.true;
		});
		it('the js file exports ReactDOM with flushSync()', () => {
			expect(!!ReactDOM.flushSync).to.be.true;
			expect(typeof ReactDOM.flushSync === 'function').to.be.true;
		});
		it('the js file exports ReactDOM with hydrateRoot()', () => {
			expect(!!ReactDOM.hydrateRoot).to.be.true;
			expect(typeof ReactDOM.hydrateRoot === 'function').to.be.true;
		});
		it('the js file exports lodash as _', () => {
			expect(!!_).to.be.true;
			expect(typeof _ === 'function').to.be.true;
		});
		it("the js file DOESN'T export dayjs", () => {
			expect(typeof dayjs === 'undefined').to.be.true;
		});
		it("the js file DOESN'T export MaterialUIButton", () => {
			expect(typeof MaterialUIButton === 'undefined').to.be.true;
		});
	});
});
