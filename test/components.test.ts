import {
	describe,
	// expect,
	test as it
} from '@jest/globals';
import { expect } from 'chai';
// import deepFreeze from 'deep-freeze';
import { existsSync, readFileSync } from 'fs';
import {join} from 'path';

// import { getEntries } from '../src/buildComponents/getEntries';
// import { makeExclusionsRegexpString } from '../src/buildComponents/makeExclusionsRegexpString';
import { makeVerboseLogger } from '../src/util/makeVerboseLogger';
//import { normalizePath } from '../../src/buildComponents/normalizePath';
// NOTE: Import assertion not needed when using jest
import stats from './components/build/resources/main/r4xAssets/stats.components.json' /* assert {
	type: 'json',
}; */

//console.debug(process.cwd());

const DIR_NAME = join(process.cwd(), 'test', 'components'); // eslint-disable-line no-undef
// console.debug('DIR_NAME:', JSON.stringify(DIR_NAME, null, 2));

const SRC_MAIN_RESOURCES = join(DIR_NAME, 'src', 'main', 'resources');
const DIR_R4X = join(DIR_NAME, 'build/resources/main/r4xAssets');
const FILE_PATH_VENDORS_JS = join(DIR_R4X, stats.assetsByChunkName['vendors'][0]);

const verboseLog = makeVerboseLogger(true);

describe('components', ()=>{

	// describe('makeExclusionsRegexpString', () => {
	// 	it('react4xpExclusions is AChunkDirInsideReact4xpDir (why not AChunkDirOutsideReact4xpDir?)', () => {
	// 		expect(
	// 			makeExclusionsRegexpString(
	// 				join(SRC_MAIN_RESOURCES, 'react4xp'), // currentDir
	// 				[ // otherDirs
	// 					join(SRC_MAIN_RESOURCES, 'react4xp/AChunkDirInsideReact4xpDir'),
	// 					join(SRC_MAIN_RESOURCES, 'AChunkDirOutsideReact4xpDir')
	// 				],
	// 				verboseLog
	// 			)
	// 		).to.deep.equal('AChunkDirInsideReact4xpDir');
	// 	});
	// 	it('chunkExclusions react4xp/AChunkDirInsideReact4xpDir is empty', () => {
	// 		expect(
	// 			makeExclusionsRegexpString(
	// 				join(SRC_MAIN_RESOURCES, 'react4xp/AChunkDirInsideReact4xpDir'), // currentDir
	// 				[ // otherDirs
	// 					join(SRC_MAIN_RESOURCES, 'react4xp/AChunkDirInsideReact4xpDir'),
	// 					join(SRC_MAIN_RESOURCES, 'AChunkDirOutsideReact4xpDir')
	// 				],
	// 				verboseLog
	// 			)
	// 		).to.deep.equal('');
	// 	});
	// 	it('chunkExclusions AChunkDirOutsideReact4xpDir is empty', () => {
	// 		expect(
	// 			makeExclusionsRegexpString(
	// 				join(SRC_MAIN_RESOURCES, 'AChunkDirOutsideReact4xpDir'), // currentDir
	// 				[ // otherDirs
	// 					join(SRC_MAIN_RESOURCES, 'react4xp/AChunkDirInsideReact4xpDir'),
	// 					join(SRC_MAIN_RESOURCES, 'AChunkDirOutsideReact4xpDir')
	// 				],
	// 				verboseLog
	// 			)
	// 		).to.deep.equal('');
	// 	});
	// });

	describe('getEntries', () => {

		// NOTE: This test has a side-effect it creates an extra file build/resources/main/site/entries.json
		// it('handles site parts', () => {
		// 	expect(
		// 		getEntries(
		// 			[{
		// 				sourcePath: join(SRC_MAIN_RESOURCES, 'site'),
		// 				sourceExtensions: ['jsx', 'tsx'],
		// 				targetSubDir: 'site',
		// 			},{
		// 				sourcePath: join(SRC_MAIN_RESOURCES, 'react4xp/anEntryDirInsideR4xDir'),
		// 				sourceExtensions: ['jsx', 'tsx'],
		// 			},{
		// 				sourcePath: join(SRC_MAIN_RESOURCES, 'anEntryDirOutsideR4xDir'),
		// 				sourceExtensions: ['jsx', 'tsx'],
		// 			}],
		// 			join(DIR_NAME, 'build', 'resources', 'main', 'site'),
		// 			'entries.json',
		// 			()=>{}
		// 		)
		// 	).to.deep.equal(
		// 		{
		// 			'anEntryInAnEntryDirInsideR4xDir': join(SRC_MAIN_RESOURCES,'react4xp/anEntryDirInsideR4xDir/anEntryInAnEntryDirInsideR4xDir.jsx'),
		// 			'anEntryInAnEntryDirOutsideR4xDir': join(SRC_MAIN_RESOURCES,'anEntryDirOutsideR4xDir/anEntryInAnEntryDirOutsideR4xDir.tsx'),
		// 			'site/parts/jsExample/jsExample': join(SRC_MAIN_RESOURCES,'site/parts/jsExample/jsExample.jsx'),
		// 			'site/parts/tsExample/tsExample': join(SRC_MAIN_RESOURCES,'site/parts/tsExample/tsExample.tsx')
		// 		}
		// 	);
		// });

		//const OUTPUT_PATH = join(DIR_NAME, 'dummy-build', 'react4xp');
        //console.log("OUTPUT_PATH:", JSON.stringify(OUTPUT_PATH, null, 2));

        // actualEntries object should exactly match this. storedEntries should exactly match these keys.
        /*const EXPECTED_MATCHING_ENTRIES = deepFreeze({
            "thisIsAnEntry": normalizePath(join(DIR_NAME, "dummy-src", "react4xp", "_entries", "thisIsAnEntry.jsx")),
            "site/parts/client/client": normalizePath(join(DIR_NAME, "dummy-src", "site", "parts", "client", "client.jsx")),
            "site/parts/example/example": normalizePath(join(DIR_NAME, "dummy-src", "site", "parts", "example", "example.jsx")),
        });
        //console.log("EXPECTED_MATCHING_ENTRIES:", JSON.stringify(EXPECTED_MATCHING_ENTRIES, null, 2));



        it("scans files with selected file extensions under the source paths, " +
            "and builds an object where the values are full paths to matching files, " +
            "exactly one path per matching file, " +
            "and does not match files that have non-target file extensions " +
            "or files in existing, non-target directories", ()=>{

            const actualEntries = getEntries(
                [
                    {
                        sourcePath: join(DIR_NAME, 'dummy-src', 'react4xp', '_entries'),
                        sourceExtensions: ['jsx', 'js', 'es6'],
                    },
                    {
                        sourcePath: join(DIR_NAME, 'dummy-src', 'site'),
                        sourceExtensions: ['jsx'],
                        targetSubDir: "site",
                    },
                ],
                OUTPUT_PATH,
                "outputEntries.json",
                console.log
            );
            //console.log("actualEntries from .getEntries: " + JSON.stringify(actualEntries, null, 2));

            // Make sure the found results can't be altered during testing
            const FROZEN_ACTUAL_ENTRIES = deepFreeze(actualEntries);

            expect(FROZEN_ACTUAL_ENTRIES).to.deep.equal(EXPECTED_MATCHING_ENTRIES);
        });


        it("produces an entries.json file in the output path, " +
            "whose content is an array that perfectly matches the keys of the returned entry object", ()=>{

            const actualEntries = getEntries(
                [
                    {
                        sourcePath: join(DIR_NAME, 'dummy-src', 'react4xp', '_entries'),
                        sourceExtensions: ['jsx', 'js', 'es6'],
                    },
                    {
                        sourcePath: join(DIR_NAME, 'dummy-src', 'site'),
                        sourceExtensions: ['jsx'],
                        targetSubDir: "site",
                    },
                ],
                OUTPUT_PATH,
                "outputEntries.json",
                console.log
            );

            // Loads as JSON data the expected file that should be side-effect-generated during .getEntries)
            //const storedEntries = require(join(OUTPUT_PATH, "outputEntries.json"));
            //console.log("storedEntries from entries.json: " + JSON.stringify(storedEntries, null, 2));

            // Make sure the found results can't be altered during testing
            /*const FROZEN_ACTUAL_ENTRIES = deepFreeze(actualEntries);
            const FROZEN_STORED_ENTRIES = deepFreeze(storedEntries);

            expect(Array.isArray(FROZEN_STORED_ENTRIES)).to.equal(true);

            Object.keys(FROZEN_ACTUAL_ENTRIES).forEach( key => {
                //console.log(JSON.stringify(key, null, 2));
                expect(FROZEN_STORED_ENTRIES.indexOf(key)).to.not.equal(-1);
            });

            FROZEN_STORED_ENTRIES.forEach( entry => {
                //console.log(JSON.stringify(entry, null, 2));
                expect(FROZEN_ACTUAL_ENTRIES[entry]).to.not.equal(undefined);
            });
        });*/
    });

	describe('files', ()=> {
		it('makes a entries.json file', () => {
			const exists = existsSync(join(DIR_R4X, 'entries.json'));
			expect(exists).to.be.true;
		});

		it('makes a stats.components.json file', () => {
			const exists = existsSync(join(DIR_R4X, 'stats.components.json'));
			expect(exists).to.be.true;
		});
	});

	describe('chunks', ()=> {
		it('makes a runtimeChunks file', () => {
			const exists = existsSync(join(DIR_R4X, stats.assetsByChunkName['runtime'][0]));
			expect(exists).to.be.true;
		});

		it('makes a vendors chunk file', () => {
			const exists = existsSync(join(DIR_R4X, stats.assetsByChunkName['vendors'][0]));
			expect(exists).to.be.true;
		});

		it('makes a react4xp chunk file', () => {
			const exists = existsSync(join(DIR_R4X, stats.assetsByChunkName['react4xp'][0]));
			expect(exists).to.be.true;
		});

		it('makes a anEntryInAnEntryDirInsideR4xDir chunk file', () => {
			const exists = existsSync(join(DIR_R4X, stats.assetsByChunkName['anEntryInAnEntryDirInsideR4xDir'][0]));
			expect(exists).to.be.true;
		});

		it('makes a anEntryInAnEntryDirOutsideR4xDir chunk file', () => {
			const exists = existsSync(join(DIR_R4X, stats.assetsByChunkName['anEntryInAnEntryDirOutsideR4xDir'][0]));
			expect(exists).to.be.true;
		});

		it('makes a site/parts/jsExample/jsExample chunk file', () => {
			const exists = existsSync(join(DIR_R4X, stats.assetsByChunkName['site/parts/jsExample/jsExample'][0]));
			expect(exists).to.be.true;
		});

		it('makes a site/parts/tsExample/tsExample chunk file', () => {
			const exists = existsSync(join(DIR_R4X, stats.assetsByChunkName['site/parts/tsExample/tsExample'][0]));
			expect(exists).to.be.true;
		});

		it('makes a aChunkDirInsideReact4xpDir chunk file', () => {
			const exists = existsSync(join(DIR_R4X, stats.assetsByChunkName['aChunkDirInsideReact4xpDir'][0]));
			expect(exists).to.be.true;
		});

		it('makes a aChunkDirOutsideReact4xpDir chunk file', () => {
			const exists = existsSync(join(DIR_R4X, stats.assetsByChunkName['aChunkDirOutsideReact4xpDir'][0]));
			expect(exists).to.be.true;
		});

	});
});


describe('externals', () => {

	// Polyfill window for jquery
	global.eval(`
	if (typeof globalThis === 'undefined') { var globalThis = this; }
	if (typeof window === 'undefined') { var window = this; }
	if (typeof global === 'undefined') { var global = this; }
	if (typeof exports === 'undefined') { var exports = {}; }
	if (typeof process === 'undefined') { var process = {env:{}}; }
	if (typeof console === 'undefined') { var console = {debug : print, log: print, warn: print, error: print}; }
	if (typeof window.addEventListener !== 'function') { window.addEventListener = function () {}; }`);

	global.eval(readFileSync(FILE_PATH_VENDORS_JS).toString()); // jquery requires window

	it('lodash should NOT exist in the vendors bundle', () => {
		// @ts-expect-error TS2304: Cannot find name 'webpackChunkComEnonicAppWhateverReact4xp'.
		expect(Array.isArray(webpackChunkComEnonicAppWhateverReact4xp)).to.be.true;

		let found = false;
		// @ts-expect-error TS2304: Cannot find name 'webpackChunkComEnonicAppWhateverReact4xp'.
		outer: for (let i = 0; i < webpackChunkComEnonicAppWhateverReact4xp.length; i++) {
			// @ts-expect-error TS2304: Cannot find name 'webpackChunkComEnonicAppWhateverReact4xp'.
			const anArray = webpackChunkComEnonicAppWhateverReact4xp[i];
			expect(Array.isArray(anArray)).to.be.true;
			middle: for (let j = 0; j < anArray.length; j++) {
				const arrayOrObject = anArray[j];
				// verboseLog(arrayOrObject);
				if (Array.isArray(arrayOrObject) && arrayOrObject[0] === 'vendors') {
					found = true;
					const vendorsObj = anArray[j+1];
					// verboseLog(vendorsObj);
					expect(typeof vendorsObj['../../node_modules/lodash/lodash.js'] === 'undefined').to.be.true;
					break outer;
				}
			}
		}

		expect(found).to.be.true;
	});

	it('jquery should NOT exist in the vendors bundle', () => {
		// @ts-expect-error TS2304: Cannot find name 'webpackChunkComEnonicAppWhateverReact4xp'.
		expect(Array.isArray(webpackChunkComEnonicAppWhateverReact4xp)).to.be.true;

		let found = false;
		// @ts-expect-error TS2304: Cannot find name 'webpackChunkComEnonicAppWhateverReact4xp'.
		outer: for (let i = 0; i < webpackChunkComEnonicAppWhateverReact4xp.length; i++) {
			// @ts-expect-error TS2304: Cannot find name 'webpackChunkComEnonicAppWhateverReact4xp'.
			const anArray = webpackChunkComEnonicAppWhateverReact4xp[i];
			expect(Array.isArray(anArray)).to.be.true;
			middle: for (let j = 0; j < anArray.length; j++) {
				const arrayOrObject = anArray[j];
				// verboseLog(arrayOrObject);
				if (Array.isArray(arrayOrObject) && arrayOrObject[0] === 'vendors') {
					found = true;
					const vendorsObj = anArray[j+1];
					// verboseLog(vendorsObj);
					expect(typeof vendorsObj['../../node_modules/jquery/dist/jquery.js'] === 'undefined').to.be.true;
					break outer;
				}
			}
		}

		expect(found).to.be.true;
	});

}); // externals
