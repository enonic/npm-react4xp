import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import { existsSync, readFileSync } from 'fs';
import {
	document,
	Element as HTMLElement,
	// Document
} from 'html-element';
// import 'html-element/global-shim'; // loads document into global namespace
import { join } from 'path';
// NOTE: Import assertion not needed when using jest
import manifest from './components/build/resources/main/r4xAssets/executor.manifest.json' /* assert {
	type: 'json',
}; */

// console.debug('document', document);
// console.debug('HTMLElement', HTMLElement);

global.document = document;
global.HTMLElement = HTMLElement;

// console.debug('global', global);
// console.debug('global.window', global.window); // undefined

const DIR_NAME = join(process.cwd(), 'test/components');
const DIR_R4X = join(DIR_NAME, 'build/resources/main/r4xAssets');
const FILE_PATH_MANIFEST = join(DIR_R4X, 'executor.manifest.json')
const FILE_PATH_JS = join(DIR_R4X, manifest['executor.js'])


describe('executor', () => {
	it('makes a manifest file', () => {
		const exists = existsSync(FILE_PATH_MANIFEST);
		expect(exists).toBeTruthy();
	});
	it('the manifest file points to a js file', () => {
		const exists = existsSync(FILE_PATH_JS);
		expect(exists).toBeTruthy();
	});
	it('the js file runs without error', () => {
		const script = readFileSync(FILE_PATH_JS).toString();
		const element = document.createElement('script');
		element.dataset['react4xp-app-name'] = 'com.enonic.app.whatever';
		element.dataset['react4xp-ref'] = 'parts_example__main_0';
		element.dataset['type'] = 'application/json';
		element.textContent = '{"command":"render","devMode":false,"hasRegions":0,"isPage":0,"jsxPath":"site/parts/example/example","props":{"react4xpId":"parts_example__main_0"}}'
		document.querySelectorAll = () => [element] as unknown as NodeListOf<HTMLScriptElement>;
		global.ComEnonicAppWhateverReact4xp = {
			'site/parts/example/example': () => undefined
		};
		global.ComEnonicAppWhateverReact4xpClient =  {
			render: () => undefined
		};

		// const context = {
		// 	document,
		// 	HTMLElement,
		// 	window
		// };
		function evalInContext(str) {
			eval(str);
			// console.log(this); // context
		};
		evalInContext.call(global, script);
	});
});
