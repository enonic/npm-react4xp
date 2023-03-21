import { expect } from 'chai';
import { existsSync, readFileSync } from 'fs';
import { document, Element as HTMLElement} from 'html-element';
import { join } from 'path';
import manifest from './components/build/resources/main/assets/react4xp/executor.manifest.json' assert {
	type: 'json',
};


const DIR_NAME = join(process.env.PWD, 'test/components');
const DIR_R4X = join(DIR_NAME, 'build/resources/main/assets/react4xp');
const FILE_PATH_MANIFEST = join(DIR_R4X, 'executor.manifest.json')
const FILE_PATH_JS = join(DIR_R4X, manifest['executor.js'])


describe('executor', () => {
	it('makes a manifest file', () => {
		const exists = existsSync(FILE_PATH_MANIFEST);
		expect(exists).to.be.true;
	});
	it('the manifest file points to a js file', () => {
		const exists = existsSync(FILE_PATH_JS);
		expect(exists).to.be.true;
	});
	it('the js file runs without error', () => {
		const script = readFileSync(FILE_PATH_JS).toString();
		const element = document.createElement('script');
		element.dataset['react4xp-app-name'] = 'com.enonic.app.whatever';
		element.dataset['react4xp-ref'] = 'parts_example__main_0';
		element.dataset['type'] = 'application/json';
		element.textContent = '{"command":"render","devMode":false,"hasRegions":0,"isPage":0,"jsxPath":"site/parts/example/example","props":{"react4xpId":"parts_example__main_0"}}'
		document.querySelectorAll = () => [element];
		const window = {
			'ComEnonicAppWhateverReact4xp': {
				'site/parts/example/example': () => undefined
			},
			'ComEnonicAppWhateverReact4xpClient': {
				render: () => undefined
			}
		};
		const context = {
			document,
			HTMLElement,
			window
		};
		function evalInContext(str) {
			eval(str);
			// console.log(this); // context
		};
		evalInContext.call(context, script);
	});
});
