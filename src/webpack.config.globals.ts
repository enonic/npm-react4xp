/* eslint-disable no-console */

// This webpack config builds a globals library, which by default contains react
// and react-dom.
//
// Which additional dependencies are inserted into the globals library, depends
// on the `globals` property in the react4xp.config.js file.
//
// The `globals` property must be an object on the webpack externals format
// { "libraryname": "ReferenceInCode", ... } e.g. { "react-dom": "ReactDOM" }.


import type {Environment} from './index.d';


import {statSync} from 'fs';

import {
	isAbsolute,
	join,
	resolve
} from 'path';

import Chunks2json from 'chunks-2-json-webpack-plugin';
import FileManagerPlugin from 'filemanager-webpack-plugin';
//import * as CoreWebPlugin from '@mrhenry/core-web';

import {
	DIR_PATH_RELATIVE_BUILD_ASSETS_R4X,
	GLOBALS_DEFAULT,
	FILE_NAME_R4X_CONFIG_JS
} from './constants.buildtime';

import {GLOBALS_FILENAME} from './constants.runtime';

import {generateTempES6SourceAndGetFilename} from './globals/generateTempES6SourceAndGetFilename';

import {makeVerboseLogger} from './util/makeVerboseLogger';
import webpackLogLevel, {
	R4X_BUILD_LOG_LEVEL,
	WEBPACK_STATS_LOG_LEVEL
} from './util/webpackLogLevel';
//import {toStr} from './util/toStr';


// TODO: Find a good pattern to control output name for chunks,
// allowing for multi-chunks and still doing it in one pass (only one globals.json)

module.exports = (env: Environment = {}) => {
	//console.debug('env', toStr(env));

	const R4X_DIR_PATH_ABSOLUTE_PROJECT = process.env.R4X_DIR_PATH_ABSOLUTE_PROJECT;
	if (!isAbsolute(R4X_DIR_PATH_ABSOLUTE_PROJECT)) {
		throw new Error(`System environment variable R4X_DIR_PATH_ABSOLUTE_PROJECT:${R4X_DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
	}

	const DIR_PATH_ABSOLUTE_BUILD_SYSTEM = resolve(__dirname, '..');
	//console.debug('DIR_PATH_ABSOLUTE_BUILD_SYSTEM', DIR_PATH_ABSOLUTE_BUILD_SYSTEM);

	const DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X = join(R4X_DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X);

	const WEBPACK_MODE = process.env.NODE_ENV || 'production';
	const DEVMODE = WEBPACK_MODE !== "production";
	const LOG_LEVEL = webpackLogLevel(process.env.R4X_BUILD_LOG_LEVEL as R4X_BUILD_LOG_LEVEL);

	const verboseLog = makeVerboseLogger([
		WEBPACK_STATS_LOG_LEVEL.LOG,
		WEBPACK_STATS_LOG_LEVEL.VERBOSE
	].includes(LOG_LEVEL));
	verboseLog(DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, 'DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X', 1);


	const LOADER = 'swc' as 'babel'|'swc';

	const environmentObj = {
		chunkDirsCommaString: null,
		entryDirsCommaString: null,
		entryExtCommaString: 'jsx,tsx,js,ts,es6,es',
	};
	//console.debug('environmentObj', environmentObj);


	let GLOBALS = GLOBALS_DEFAULT;
	verboseLog(GLOBALS, 'GLOBALS');

	const FILE_PATH_ABSOLUTE_R4X_CONFIG_JS = join(R4X_DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_R4X_CONFIG_JS);
	try {
		const configJsonStats = statSync(FILE_PATH_ABSOLUTE_R4X_CONFIG_JS);
		if (configJsonStats.isFile()) {
			const config = require(FILE_PATH_ABSOLUTE_R4X_CONFIG_JS);
			//console.debug('config', toStr(config));
			if (config.globals) {
				GLOBALS = Object.assign(config.globals, GLOBALS);
			}
		} // if FILE_NAME_R4X_CONFIG_JS
		verboseLog(GLOBALS, 'GLOBALS');
	} catch (e) {
		//console.debug('e', e);
		console.info(`${FILE_PATH_ABSOLUTE_R4X_CONFIG_JS} not found.`)
	}

	const tempFileName = generateTempES6SourceAndGetFilename(
		GLOBALS,
		join(__dirname, '_AUTOGENERATED_tmp_global_.es6')
	);
	//console.debug('tempFileName', tempFileName);

	const entry = tempFileName ? { globals: tempFileName } : {};
	// console.debug('entry', entry);

	const plugins = tempFileName
		? [
			//@ts-ignore
			new FileManagerPlugin({
				events: {
					onStart: {
						mkdir: [
							DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X // Chunks2json fails without this (when using npm explore)
						]
					}
				}
			}),
			//@ts-ignore
			/*new CoreWebPlugin({
			browsers: {
				chrome: "63",
				firefox: "57",
				edge: "18",
				opera: "57",
				safari: "12",
				ie: "11",
			}
			}),*/
			new Chunks2json({
				outputDir: DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X,
				filename: GLOBALS_FILENAME,
			}),
		]
		: undefined;

	return {
		context: R4X_DIR_PATH_ABSOLUTE_PROJECT, // Used as default for resolve.roots

		devtool: DEVMODE ? false : 'source-map',

		entry,

		mode: WEBPACK_MODE,

		module: {
			rules: [{
				test: /\.((jt)sx?|(es6?))$/, // js, ts, jsx, tsx, es, es6

				// I don't think we can exclude much, everything must be able to run:
				// * server-side (Nashorn/Graal-JS) and
				// * client-side (Browsers).
				//exclude: /node_modules/,

				// It takes time to transpile, if you know they don't need
				// transpilation to run in Enonic XP (Nashorn/Graal-JS) you may list
				// them here:
				exclude: [
					/[\\/]node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
					// /[\\/]node_modules[\\/]react[\\/]/, // TODO Perhaps react don't need to be transpiled
					// /[\\/]node_modules[\\/]react-dom[\\/]/, // TODO Perhaps react-dom don't need to be transpiled
					/[\\/]node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
				],

				use: [LOADER === 'babel' ? {
					loader: 'babel-loader',
					options: {
						babelrc: false,
						comments: DEVMODE,
						compact: !DEVMODE,
						minified: !DEVMODE,
						plugins: [
							'@babel/plugin-proposal-object-rest-spread',
							'@babel/plugin-transform-arrow-functions',
							'@babel/plugin-transform-typeof-symbol',
							//'@mrhenry/babel-plugin-core-web', // Did nothing
							//'@mrhenry/core-web'  // Also did nothing
							/*["@mrhenry/core-web", { // Again nothing!
							browsers: {
								chrome: "63",
								firefox: "57",
								edge: "18",
								opera: "57",
								safari: "12",
								ie: "11",
							}
							}]*/
						],
						presets: [
							'@babel/preset-typescript',
							'@babel/preset-react',
							// '@babel/preset-env'
							[
								"@babel/preset-env", {
									// https://webpack.js.org/guides/tree-shaking/#conclusion
									// Ensure no compilers transform your ES2015 module syntax into CommonJS modules (this is the default behavior of the popular Babel preset @babel/preset-env - see the documentation for more details).
									// https://babeljs.io/docs/babel-preset-env#modules
									// Enable transformation of ES module syntax to another module type. Note that cjs is just an alias for commonjs.
									// Setting this to false will preserve ES modules. Use this only if you intend to ship native ES Modules to browsers. If you are using a bundler with Babel, the default modules: "auto" is always preferred.
									modules: false,
								}
							]
						]
					},
				} : {
					loader: "swc-loader",
					options: {
						jsc: {
							parser: {
								dynamicImport: false,
								jsx: true,
								syntax: 'typescript',
								tsx: true
							},
							// target: 'es2015'
						},
						minify: !DEVMODE,
						// module: {
						// 	type: 'commonjs'
						// },
						sourceMaps: !DEVMODE,
					},
				}], // use
			}], // rules
		}, // module

		optimization: {
			minimize: !DEVMODE,
			usedExports: !DEVMODE, // Disable slow tree-shaking in dev mode
		},

		output: {
			path: DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, // <-- Sets the base url for plugins and other target dirs.
			filename: DEVMODE ? '[name].js' : '[name].[contenthash].js',
			environment: {
				arrowFunction: false,
				bigIntLiteral: false,
				const: false,
				destructuring: false,
				dynamicImport: false,
				forOf: false,
				module: false,
			},
		}, // output

		performance: {
			hints: false
		},

		plugins,

		resolve: {
			extensions: ['.ts', '.tsx', '.es6', '.es', '.jsx', '.js', '.json'],
			modules: [
				// Tell webpack what directories should be searched when resolving
				// modules.
				// Absolute and relative paths can both be used, but be aware that they
				// will behave a bit differently.
				// A relative path will be scanned similarly to how Node scans for
				// node_modules, by looking through the current directory as well as its
				// ancestors (i.e. ./node_modules, ../node_modules, and on).
				// With an absolute path, it will only search in the given directory.

				// To resolve node_modules installed under the app
				resolve(R4X_DIR_PATH_ABSOLUTE_PROJECT, 'node_modules'),

				// To resolve node_modules installed under the build system
				resolve(DIR_PATH_ABSOLUTE_BUILD_SYSTEM, 'node_modules'),
				//'node_modules'
			],
			/*roots: [ // Works, but maybe modules is more specific
				// A list of directories where requests of server-relative URLs
				// (starting with '/') are resolved, defaults to context configuration
				// option. On non-Windows systems these requests are resolved as an
				// absolute path first.
				R4X_DIR_PATH_ABSOLUTE_PROJECT, // same as context
				DIR_PATH_ABSOLUTE_BUILD_SYSTEM
			],*/
		}, // resolve

		stats: {
			colors: true,
			hash: false,
			logging: LOG_LEVEL,
			modules: false,
			moduleTrace: false,
			timings: false,
			version: false
		}, // stats

	}; // return
}; // module.exports
