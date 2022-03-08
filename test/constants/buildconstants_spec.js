import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

import buildConstants from '../../constants/index';
const ensureTargetOutputPath = require('../../constants/ensureTargetOutputPath');

const DIR_NAME = __dirname; // eslint-disable-line no-undef


describe("constants", ()=>{
    describe(".buildConstants", ()=> {

        const EXPECTED_DEFAULT_OUTPUT = deepFreeze({
            BUILD_ENV: "production",
            LIBRARY_NAME: "React4xp",
            SITE_SUBFOLDER: "site",
            SRC_SITE: path.join(DIR_NAME, 'src', 'main', 'resources', 'site'),
            R4X_HOME: 'react4xp',
            R4X_TARGETSUBDIR: path.join('assets', 'react4xp'),
            SRC_R4X: path.join(DIR_NAME, 'src', 'main', 'resources', 'react4xp'),
            RELATIVE_BUILD_R4X: path.join('build', 'resources', 'main', 'assets', 'react4xp'),
            BUILD_MAIN: path.join(DIR_NAME, 'build', 'resources', 'main'),
            BUILD_R4X: path.join(DIR_NAME, 'build', 'resources', 'main', 'assets', 'react4xp'),

            // NASHORNPOLYFILLS_FILENAME: "nashornPolyfills",
            CLIENT_CHUNKS_FILENAME: "chunks.client.json",
            EXTERNALS_CHUNKS_FILENAME: "chunks.externals.json",
            ENTRIES_FILENAME: "entries.json",
            COMPONENT_STATS_FILENAME: "stats.components.json",

            CHUNK_CONTENTHASH: 9,

            SSR_LAZYLOAD: true,
            SSR_ENGINE_SETTINGS: 0,
            SSR_MAX_THREADS: null,

            EXTERNALS: {
                "react": "React",
                "react-dom": "ReactDOM",
                "react-dom/server": "ReactDOMServer",
            },
        });

        const TEST_OUTPUT_ROOT = path.join(DIR_NAME, "output");
        const COPY_OUTPUT_NAME = path.join(DIR_NAME, "build", "resources", "main", "lib", "enonic", "react4xp", "react4xp_constants.json");



        before(()=>{
            rimraf.sync(TEST_OUTPUT_ROOT);
            rimraf.sync(path.join(DIR_NAME, "build"));
        });

        after(()=>{
            //rimraf.sync(TEST_OUTPUT_ROOT);
            //rimraf.sync(path.join(DIR_NAME, "build"));
        });


        it("builds a constants file with a standard name, if the output file or path doesn't exist", () => {

            // Changing the rootDir arg to avoid putting the output file right in the test root.
            // That will affect the file content of course - different expectations below.
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "react4xp_constants.json");

            fs.mkdirSync(TEST_OUTPUT_ROOT);

            buildConstants(
                TEST_OUTPUT_ROOT,
                {
                    // verbose: true,
                }
            );

            const expectedOutput = {...EXPECTED_DEFAULT_OUTPUT};
            expectedOutput.BUILD_MAIN = path.join(TEST_OUTPUT_ROOT, 'build', 'resources', 'main');
            expectedOutput.BUILD_R4X = path.join(TEST_OUTPUT_ROOT, 'build', 'resources', 'main', 'assets', 'react4xp');
            expectedOutput.SRC_R4X = path.join(TEST_OUTPUT_ROOT, 'src', 'main', 'resources', 'react4xp');
            expectedOutput.SRC_SITE = path.join(TEST_OUTPUT_ROOT, 'src', 'main', 'resources', 'site');


            const actualOutput = require(outputFileName);

            delete actualOutput['__meta__'];
            expect(actualOutput).to.deep.equal(expectedOutput);
        });



        it("builds a constants file with the specified output name, if the output file or path doesn't exist", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "built_constants.json");

            buildConstants(
                DIR_NAME,
                {
                    outputFileName,
                    // verbose: true,
                }
            );

            const actualOutput = require(outputFileName);

            delete actualOutput['__meta__'];
            expect(actualOutput).to.deep.equal(EXPECTED_DEFAULT_OUTPUT);
        });
        it("builds a constants file with the specified output name, if the output file or path doesn't exist", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "built_constants.json");

            buildConstants(
                DIR_NAME,
                {
                    outputFileName,
                    // verbose: true,
                }
            );

            const actualOutput = require(outputFileName);

            delete actualOutput['__meta__'];
            expect(actualOutput).to.deep.equal(EXPECTED_DEFAULT_OUTPUT);
        });

        it("makes a copy of the constants file, with a fixed name and path (build/resources/main/lib/enonic/react4xp)", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "thisIsNotTheCopy_constants.json");

            buildConstants(
                DIR_NAME,
                {
                    outputFileName,
                    // verbose: true,
                }
            );

            const actualOutput = require(COPY_OUTPUT_NAME);

            delete actualOutput['__meta__'];
            expect(actualOutput).to.deep.equal(EXPECTED_DEFAULT_OUTPUT);
        });

        it("leaves an existing output file intact instead of replacing it, and also skips the copy", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "existing_constants.json");

            ensureTargetOutputPath(outputFileName);
            fs.writeFileSync(outputFileName, '{"thisIsThe":"previousContent"}');

            buildConstants(
                DIR_NAME,
                {
                    outputFileName,
                    // verbose: true,
                }
            );

            const actualOutput = deepFreeze(require(outputFileName));

            const expectedOutput = deepFreeze(
                {thisIsThe:"previousContent"}
            );

            expect(actualOutput).to.deep.equal(expectedOutput);
        });

        it("overwrites any existing output file and the copy, iff 'overwriteConstantsFile' in the overrides object is set to true", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "overwrite_constants.json");

            ensureTargetOutputPath(outputFileName);
            fs.writeFileSync(outputFileName, '{"thisIsThe":"previousContent"}');

            ensureTargetOutputPath(COPY_OUTPUT_NAME);
            fs.writeFileSync(COPY_OUTPUT_NAME, '{"thisIsThe":"previouslyCopiedContent"}');

            buildConstants(
                DIR_NAME,
                {
                    outputFileName,
                    overwriteConstantsFile: true,
                    // verbose: true,
                }
            );

            const actualOutput = require(outputFileName);
            const copiedOutput = require(COPY_OUTPUT_NAME);

            delete actualOutput['__meta__'];
            delete copiedOutput['__meta__'];

            expect(actualOutput).to.deep.equal(EXPECTED_DEFAULT_OUTPUT);
            expect(copiedOutput).to.deep.equal(EXPECTED_DEFAULT_OUTPUT);
        });


        it("adds a .json extension to the output file name if there is none", () => {
            const outputFileNameRaw = path.join(TEST_OUTPUT_ROOT, "deep", "path", "addjson_constants");
            const outputFileNameJSON = outputFileNameRaw + ".json";

            buildConstants(
                DIR_NAME,
                {
                    outputFileName: outputFileNameRaw,
                    // verbose: true,
                }
            );

            const actualOutput = require(outputFileNameJSON);

            delete actualOutput['__meta__'];
            expect(actualOutput).to.deep.equal(EXPECTED_DEFAULT_OUTPUT);
        });

        it("puts the output file in the project path (rootDir) if outputFileName is only a filename, not a path", () => {
            const outputFileName = "purefilename_constants.json";

            buildConstants(

                // Changing the rootDir arg to avoid putting the output file right here.
                // That will affect the file content of course, different expectations below.
                TEST_OUTPUT_ROOT,
                {
                    outputFileName,
                    // verbose: true,
                }
            );

            const actualOutput = deepFreeze(require(path.join(TEST_OUTPUT_ROOT, outputFileName)));

            // Just sampling a few unchanged ones
            expect(actualOutput.LIBRARY_NAME).to.equal(EXPECTED_DEFAULT_OUTPUT.LIBRARY_NAME);
            expect(actualOutput.EXTERNALS).to.deep.equal(EXPECTED_DEFAULT_OUTPUT.EXTERNALS);

            // Just sampling two changed ones
            expect(actualOutput.BUILD_R4X).to.equal(path.join(TEST_OUTPUT_ROOT, 'build', 'resources', 'main', 'assets', 'react4xp'),);
            expect(actualOutput.SRC_R4X).to.equal(path.join(TEST_OUTPUT_ROOT, 'src', 'main', 'resources', 'react4xp'));
        });




        it("allows direct override of selected values", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "override_direct_constants.json");

            buildConstants(
                DIR_NAME,
                {
                    SITE_SUBFOLDER: "thisWasPreviouslySite",
                    outputFileName,
                    //verbose: true,
                }
            );

            const actualOutput = deepFreeze(require(outputFileName));

            // Just sampling a few unchanged ones
            expect(actualOutput.LIBRARY_NAME).to.equal(EXPECTED_DEFAULT_OUTPUT.LIBRARY_NAME);
            expect(actualOutput.EXTERNALS).to.deep.equal(EXPECTED_DEFAULT_OUTPUT.EXTERNALS);

            // The two directly changed ones
            expect(actualOutput.SITE_SUBFOLDER).to.equal("thisWasPreviouslySite");
        });


        it("changes derived values from overriden ones", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "override_derived_constants.json");

            buildConstants(
                DIR_NAME,
                {
                    R4X_HOME: "thisWasPreviouslyReact4xp",
                    SITE_SUBFOLDER: "thisWasPreviouslySite",
                    outputFileName,
                    //verbose: true
                }
            );

            const actualOutput = deepFreeze(require(outputFileName));

            // Just sampling a few unchanged ones
            expect(actualOutput.LIBRARY_NAME).to.equal(EXPECTED_DEFAULT_OUTPUT.LIBRARY_NAME);
            expect(actualOutput.EXTERNALS).to.deep.equal(EXPECTED_DEFAULT_OUTPUT.EXTERNALS);
            expect(actualOutput.RELATIVE_BUILD_R4X).to.equal(EXPECTED_DEFAULT_OUTPUT.RELATIVE_BUILD_R4X);

            // All the derived changes:
            expect(actualOutput.SRC_R4X).to.equal(path.join(DIR_NAME, 'src', 'main', 'resources', 'thisWasPreviouslyReact4xp'));
            expect(actualOutput.SRC_SITE).to.equal(path.join(DIR_NAME, 'src', 'main', 'resources', 'thisWasPreviouslySite'));
        });



        it("can override specific derived values without changing the basic ones", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "override_specific_constants.json");

            buildConstants(
                DIR_NAME,
                {
                    SRC_SITE: "thisShouldBeAnEntireOverwrittenSrcSitePath",
                    outputFileName,
                    //verbose: true
                }
            );

            const actualOutput = deepFreeze(require(outputFileName));

            // Just sampling a few unchanged ones
            expect(actualOutput.LIBRARY_NAME).to.equal(EXPECTED_DEFAULT_OUTPUT.LIBRARY_NAME);
            expect(actualOutput.EXTERNALS).to.deep.equal(EXPECTED_DEFAULT_OUTPUT.EXTERNALS);
            expect(actualOutput.RELATIVE_BUILD_R4X).to.equal(EXPECTED_DEFAULT_OUTPUT.RELATIVE_BUILD_R4X);
            expect(actualOutput.SRC_R4X).to.equal(EXPECTED_DEFAULT_OUTPUT.SRC_R4X);
            // ...and notably:
            expect(actualOutput.SITE_SUBFOLDER).to.equal(EXPECTED_DEFAULT_OUTPUT.SITE_SUBFOLDER);

            // All the derived changes:
            expect(actualOutput.SRC_SITE).to.equal("thisShouldBeAnEntireOverwrittenSrcSitePath");
        });


        it("can also accept the 'overrides' parameter as a JSON-parseable string", ()=>{
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "override_jsonstring_constants.json");

            const overrides = '{' +
                '"SITE_SUBFOLDER": "C:\\\\a\\\\windows\\\\path\\\\that\\\\was\\\\previously\\\\site", ' +
                '"EXTERNALS": {' +
                '"foo": "foofoo",' +
                '"bar": "barbar"' +
                '},' +
                '"outputFileName": ' + JSON.stringify(outputFileName) +
                // ', "verbose": true ' +
                '}';

            buildConstants(
                DIR_NAME,
                overrides,
            );

            const actualOutput = deepFreeze(require(outputFileName));

            // Just sampling a few unchanged ones
            expect(actualOutput.LIBRARY_NAME).to.equal(EXPECTED_DEFAULT_OUTPUT.LIBRARY_NAME);
            expect(actualOutput.BUILD_ENV).to.deep.equal(EXPECTED_DEFAULT_OUTPUT.BUILD_ENV);

            // The two directly changed ones
            expect(actualOutput.SITE_SUBFOLDER).to.equal("C:\\a\\windows\\path\\that\\was\\previously\\site");
            expect(actualOutput.EXTERNALS).to.deep.equal({
                foo: "foofoo",
                bar: "barbar",
            });
        });



        it("fails if overrides is an invalid JSON string", ()=>{
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "bad_jsonstring_constants.json");

            const overrides = '{' +
                '"SITE_SUBFOLDER: "thisWasPreviouslySite", ' +
                '"outputFileName": ' + JSON.stringify(outputFileName) +
                // ', "verbose": true ' +
                '}';

            expect(()=>{
                buildConstants(
                    DIR_NAME,
                    outputFileName,
                    overrides,
                );
            }).to.throw(Error);


            expect(fs.existsSync(outputFileName)).to.equal(false);
        });


        it("fails if overrides (JSON string or object) is valid but not object format", ()=>{
            const root = path.join(TEST_OUTPUT_ROOT, "extraleveltoavoidcollision");
            const outputFileName = path.join(root, "react4xp_constants.json");

            expect(()=>{
                buildConstants(
                    root,
                    '[ "EXTERNALS", "SITE_SUBFOLDER" ]',
                );
            }).to.throw(Error);

            expect(()=>{
                buildConstants(
                    root,
                    [ "EXTERNALS", "SITE_SUBFOLDER" ],
                );
            }).to.throw(Error);

            expect(()=>{
                buildConstants(
                    root,
                    42,
                );
            }).to.throw(Error);

            expect(()=>{
                buildConstants(
                    root,
                    true,
                );
            }).to.throw(Error);

            expect(fs.existsSync(outputFileName)).to.equal(false);
        });


        it("fails if rootDir points to a path that doesn't exist", ()=>{
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "noexist_constants.json");

            const noExistPath = path.join(TEST_OUTPUT_ROOT, "noExist");
            rimraf.sync(noExistPath);

            expect(()=>{
                buildConstants(
                    noExistPath,
                    {
                        outputFileName,
                        // verbose:true.
                    }
                );
            }).to.throw(Error);

            expect(fs.existsSync(outputFileName)).to.equal(false);

            expect(()=>{
                buildConstants(
                    undefined,
                    {
                        outputFileName,
                        // verbose:true.
                    }
                );
            }).to.throw(Error);
        });


        it("fails if rootDir points to a file", ()=>{
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "isfile_constants.json");

            const fileExistPath = path.join(TEST_OUTPUT_ROOT, "thisIsAFile");
            ensureTargetOutputPath(fileExistPath);
            fs.writeFileSync(fileExistPath, "Yep, a file all right.");

            expect(()=>{
                buildConstants(
                    fileExistPath,
                    {
                        outputFileName,
                        //verbose:true,
                    }
                );
            }).to.throw(Error);

            expect(fs.existsSync(outputFileName)).to.equal(false);
        });


        it("fails if overrides.outputFile points to a directory", ()=>{
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "thisisDirectory_constants.json");

            ensureTargetOutputPath(path.join(outputFileName, "dummy"), function () {});
            expect(fs.lstatSync(outputFileName).isDirectory()).to.equal(true);

            expect(()=>{
                buildConstants(
                    DIR_NAME,
                    {
                        outputFileName,
                        // verbose:true
                    },
                );
            }).to.throw(Error);

            expect(fs.lstatSync(outputFileName).isDirectory()).to.equal(true);
        });



        it("fails if overrides.outputFile has a parent path that's not a directory", ()=>{
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "thisIsAlsoAFile", "parentisfile_constants.json");

            const fileExistPath = path.join(TEST_OUTPUT_ROOT, "thisIsAlsoAFile");
            ensureTargetOutputPath(fileExistPath);
            fs.writeFileSync(fileExistPath, "Indeed, 'tis a file.");

            expect(()=>{
                buildConstants(
                    DIR_NAME,
                    {
                        outputFileName,
                        // verbose:true
                    },
                );
            }).to.throw(Error);

            expect(fs.existsSync(outputFileName)).to.equal(false);
        });

        it("adds nashorn-polyfill-specific values if there is a NASHORNPOLYFILLS_SOURCE field among the inputs", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "nashornsource_constants.json");

            buildConstants(
                DIR_NAME,
                {
                    NASHORNPOLYFILLS_SOURCE: "some/path/testPolyfills.es6",
                    outputFileName,
                    // verbose: true,
                }
            );

            const actualOutput = deepFreeze(require(outputFileName));
            // Just sampling a few unchanged ones
            expect(actualOutput.NASHORNPOLYFILLS_SOURCE).to.equal("some/path/testPolyfills.es6");   // override value
            expect(actualOutput.NASHORNPOLYFILLS_FILENAME).to.equal("nashornPolyfills");            // default value, since not in override
        });

        it("allows override of NASHORNPOLYFILLS_FILENAME if there is a NASHORNPOLYFILLS_SOURCE field among the inputs", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "nashornfilename_constants.json");

            buildConstants(
                DIR_NAME,
                {
                    NASHORNPOLYFILLS_SOURCE: "some/path/testPolyfills.es6",
                    NASHORNPOLYFILLS_FILENAME: "whyEvenChangeThis",
                    outputFileName,
                    // verbose: true,
                }
            );

            const actualOutput = deepFreeze(require(outputFileName));
            // Just sampling a few unchanged ones
            expect(actualOutput.NASHORNPOLYFILLS_SOURCE).to.equal("some/path/testPolyfills.es6");   // override value
            expect(actualOutput.NASHORNPOLYFILLS_FILENAME).to.equal("whyEvenChangeThis");           // override value
        });

        it("ignores override of NASHORNPOLYFILLS_FILENAME if there is no NASHORNPOLYFILLS_SOURCE field among the inputs", () => {
            const outputFileName = path.join(TEST_OUTPUT_ROOT, "deep", "path", "nashornnosource_constants.json");

            buildConstants(
                DIR_NAME,
                {
                    NASHORNPOLYFILLS_FILENAME: "whyEvenChangeThis",
                    outputFileName,
                    // verbose: true,
                }
            );

            const actualOutput = deepFreeze(require(outputFileName));
            // Just sampling a few unchanged ones
            expect(actualOutput.NASHORNPOLYFILLS_SOURCE).to.equal(undefined);
            expect(actualOutput.NASHORNPOLYFILLS_FILENAME).to.equal(undefined);
        });
    });
});
