import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import {join} from 'path';

import { getEntries } from '../../dist/buildComponents/getEntries.js';
//import { normalizePath } from '../../dist/buildComponents/normalizePath.js';

//console.debug(process.cwd());

const DIR_NAME = join(process.cwd(), 'test', 'components'); // eslint-disable-line no-undef
console.log('DIR_NAME:', JSON.stringify(DIR_NAME, null, 2));

const SRC_MAIN_RESOURCES = join(DIR_NAME, 'src', 'main', 'resources');

describe('components', ()=>{
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
					'site/parts/client/client': join(SRC_MAIN_RESOURCES,'site/parts/client/client.jsx'),
					'site/parts/example/example': join(SRC_MAIN_RESOURCES,'site/parts/example/example.jsx')
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
});
