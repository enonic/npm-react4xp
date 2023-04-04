import { expect } from 'chai';
// import deepFreeze from 'deep-freeze';
import { existsSync } from 'fs';
import {join} from 'path';

import { getEntries } from '../dist/buildComponents/getEntries.js';
import { makeExclusionsRegexpString } from '../dist/buildComponents/makeExclusionsRegexpString.js';
import { makeVerboseLogger } from '../dist/util/makeVerboseLogger.js';
//import { normalizePath } from '../../dist/buildComponents/normalizePath.js';

//console.debug(process.cwd());

const DIR_NAME = join(process.cwd(), 'test', 'components'); // eslint-disable-line no-undef
console.log('DIR_NAME:', JSON.stringify(DIR_NAME, null, 2));

const SRC_MAIN_RESOURCES = join(DIR_NAME, 'src', 'main', 'resources');
const DIR_R4X = join(DIR_NAME, 'build/resources/main/assets/react4xp');

const verboseLog = makeVerboseLogger(false);

describe('components', ()=>{

	describe('makeExclusionsRegexpString', () => {
		it('react4xpExclusions is AChunkDirInsideReact4xpDir (why not AChunkDirOutsideReact4xpDir?)', () => {
			expect(
				makeExclusionsRegexpString(
					join(SRC_MAIN_RESOURCES, 'react4xp'), // currentDir
					[ // otherDirs
						join(SRC_MAIN_RESOURCES, 'react4xp/AChunkDirInsideReact4xpDir'),
						join(SRC_MAIN_RESOURCES, 'AChunkDirOutsideReact4xpDir')
					],
					verboseLog
				)
			).to.deep.equal('AChunkDirInsideReact4xpDir');
		});
		it('chunkExclusions react4xp/AChunkDirInsideReact4xpDir is empty', () => {
			expect(
				makeExclusionsRegexpString(
					join(SRC_MAIN_RESOURCES, 'react4xp/AChunkDirInsideReact4xpDir'), // currentDir
					[ // otherDirs
						join(SRC_MAIN_RESOURCES, 'react4xp/AChunkDirInsideReact4xpDir'),
						join(SRC_MAIN_RESOURCES, 'AChunkDirOutsideReact4xpDir')
					],
					verboseLog
				)
			).to.deep.equal('');
		});
		it('chunkExclusions AChunkDirOutsideReact4xpDir is empty', () => {
			expect(
				makeExclusionsRegexpString(
					join(SRC_MAIN_RESOURCES, 'AChunkDirOutsideReact4xpDir'), // currentDir
					[ // otherDirs
						join(SRC_MAIN_RESOURCES, 'react4xp/AChunkDirInsideReact4xpDir'),
						join(SRC_MAIN_RESOURCES, 'AChunkDirOutsideReact4xpDir')
					],
					verboseLog
				)
			).to.deep.equal('');
		});
	});

	describe('getEntries', ()=> {

		it('handles site parts', ()=>{
			expect(
				getEntries(
					[{
						sourcePath: join(SRC_MAIN_RESOURCES, 'site'),
						sourceExtensions: ['jsx', 'tsx'],
						targetSubDir: 'site',
					},{
						sourcePath: join(SRC_MAIN_RESOURCES, 'react4xp/_entries'),
						sourceExtensions: ['jsx', 'tsx'],
					}],
					join(DIR_NAME, 'build', 'resources', 'main', 'site'),
					'entries.json',
					()=>{}
				)
			).to.deep.equal(
				{
					"thisIsAnEntry": join(SRC_MAIN_RESOURCES,'react4xp/_entries/thisIsAnEntry.jsx'),
					'site/parts/jsExample/jsExample': join(SRC_MAIN_RESOURCES,'site/parts/jsExample/jsExample.jsx'),
					'site/parts/tsExample/tsExample': join(SRC_MAIN_RESOURCES,'site/parts/tsExample/tsExample.tsx')
				}
			);
		});
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

		it('makes a runtime.js file', () => {
			const exists = existsSync(join(DIR_R4X, 'runtime.js'));
			expect(exists).to.be.true;
		});

		it('makes a react4xp.js file', () => {
			const exists = existsSync(join(DIR_R4X, 'react4xp.js'));
			expect(exists).to.be.true;
		});

		it('makes a AChunkDirInsideReact4xpDir.js file', () => {
			const exists = existsSync(join(DIR_R4X, 'AChunkDirInsideReact4xpDir.js'));
			expect(exists).to.be.true;
		});

		it('makes a AChunkDirOutsideReact4xpDir.js file', () => {
			const exists = existsSync(join(DIR_R4X, 'AChunkDirOutsideReact4xpDir.js'));
			expect(exists).to.be.true;
		});

		it('makes a site/parts/jsExample/jsExample.js file', () => {
			const exists = existsSync(join(DIR_R4X, 'site/parts/jsExample/jsExample.js'));
			expect(exists).to.be.true;
		});

		it('makes a site/parts/tsExample/tsExample.js file', () => {
			const exists = existsSync(join(DIR_R4X, 'site/parts/tsExample/tsExample.js'));
			expect(exists).to.be.true;
		});
	});
});
