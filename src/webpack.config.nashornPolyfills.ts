// Transpiles nashorn polyfill from, among other things, npm libraries.
import type {Environment} from './index.d';


import {statSync} from 'fs';

import {
  isAbsolute,
  join,
  resolve
} from 'path';

import {
  DIR_PATH_RELATIVE_BUILD_LIB_R4X,
  DIR_PATH_RELATIVE_SRC_MAIN_RESOURCES,
  FILE_NAME_R4X_NASHORN_POLYFILLS
} from './constants.buildtime';

import {makeVerboseLogger} from './util/makeVerboseLogger';
import logLevelFromGradle, {
	GRADLE_LOG_LEVEL,
	WEBPACK_STATS_LOG_LEVEL
} from './util/logLevelFromGradle';


const FILE_STEM_NASHORNPOLYFILLS_USERADDED = 'nashornPolyfills.userAdded';


module.exports = (env: Environment = {}) => {
	const DIR_PATH_ABSOLUTE_PROJECT = process.env.DIR_PATH_ABSOLUTE_PROJECT;

	if (!isAbsolute(DIR_PATH_ABSOLUTE_PROJECT)) {
		throw new Error(`env.DIR_PATH_ABSOLUTE_PROJECT:${DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
	}

	const DIR_PATH_ABSOLUTE_BUILD_SYSTEM = resolve(__dirname, '..');
	//console.debug('DIR_PATH_ABSOLUTE_BUILD_SYSTEM', DIR_PATH_ABSOLUTE_BUILD_SYSTEM);

	const DIR_PATH_ABSOLUTE_BUILD_LIB_R4X = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_LIB_R4X);

	const WEBPACK_MODE = process.env.NODE_ENV || 'production';
	const DEVMODE = WEBPACK_MODE !== "production";
	const LOG_LEVEL = logLevelFromGradle(process.env.GRADLE_LOG_LEVEL as GRADLE_LOG_LEVEL);

	const verboseLog = makeVerboseLogger([
		WEBPACK_STATS_LOG_LEVEL.LOG,
		WEBPACK_STATS_LOG_LEVEL.VERBOSE
	].includes(LOG_LEVEL));

	const filePathAbsoluteR4xNashornPolyfills = join(
		DIR_PATH_ABSOLUTE_PROJECT,
		DIR_PATH_RELATIVE_SRC_MAIN_RESOURCES,
		FILE_NAME_R4X_NASHORN_POLYFILLS
	);
	//verboseLog(filePathAbsoluteR4xNashornPolyfills, 'filePathAbsoluteR4xNashornPolyfills');

	const entry = {}
	try {
		const statsR4xNashornPolyfills = statSync(filePathAbsoluteR4xNashornPolyfills);
		if (statsR4xNashornPolyfills.isFile()) {
		verboseLog(
			`Adding custom nashorn polyfills: compiling ${filePathAbsoluteR4xNashornPolyfills} --> ${join(DIR_PATH_ABSOLUTE_BUILD_LIB_R4X, FILE_STEM_NASHORNPOLYFILLS_USERADDED)}`
		);
		entry[FILE_STEM_NASHORNPOLYFILLS_USERADDED] = filePathAbsoluteR4xNashornPolyfills;
		}
	} catch (e) {
		console.info(`${filePathAbsoluteR4xNashornPolyfills} not found, which is fine :)`)
	}

	const webpackConfigObjectNashornPolyfills = {
		context: DIR_PATH_ABSOLUTE_PROJECT, // Used as default for resolve.roots

		entry,

		mode: WEBPACK_MODE,

		module: {
		rules: [
			{
			test: /\.es6$/,

			// I don't think we can exclude much, everything must be able to run:
			// * server-side (Nashorn/Graal-JS) and
			// * client-side (Browsers).
			//exclude: /node_modules/,

			// It takes time to transpile, if you know they don't need
			// transpilation to run in Enonic XP (Nashorn/Graal-JS) you may list
			// them here:
			exclude: [
						/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
						/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
					],

			use: {
				loader: 'babel-loader',
				options: {
				babelrc: false,
				comments: false,
				compact: !DEVMODE,
				minified: !DEVMODE,
				presets: [
					'@babel/preset-react',
					'@babel/preset-env'
				],
				plugins: [
					'@babel/plugin-proposal-object-rest-spread',
					'@babel/plugin-transform-arrow-functions',
					'@babel/plugin-transform-block-scoping', // transpile 'const' and 'let to 'var'
					'@babel/plugin-transform-typeof-symbol',
				],
				},
			},
			},
		],
		}, // module

		optimization: {
			minimize: !DEVMODE
		},

		output: {
		path: DIR_PATH_ABSOLUTE_BUILD_LIB_R4X,

		filename: '[name].js', // No need for contenthash as this is serverside

		environment: {
			arrowFunction: false,
			bigIntLiteral: false,

			// Whether the environment supports const and let for variable declarations.
			const: false, // Not enough to transpile 'const' and 'let' to 'var'

			destructuring: false,
			dynamicImport: false,
			forOf: false,
			module: false,
			optionalChaining: true,
			templateLiteral: false
		},

		// In order for 'const' and 'let' to be transpiled to 'var',
		// library or libraryTarget must be set!

		//libraryTarget: 'commonjs' // 7963B
		//libraryTarget: 'commonjs-module' // 7870B // ReferenceError: 'module' is not defined
		libraryTarget: 'commonjs-static' // 7907B
		//libraryTarget: 'commonjs2' // 7870B // ReferenceError: 'module' is not defined

		/*library: {  // 7893B Trying out what is used in buildComponents, also transpiles 'const' and 'let' to 'var'
			name: '[name]',
			type: 'var',
		}*/

		// To make UMD build available on both browsers and Node.js, set output.globalObject option to 'this'.
		/*libraryTarget: 'umd', // 8111B
		globalObject: 'this'*/

		/*libraryTarget: 'umd2', // 8111B
		globalObject: 'this'*/
		}, // output

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
			resolve(DIR_PATH_ABSOLUTE_PROJECT, 'node_modules'),

			// To resolve node_modules installed under the build system
			resolve(DIR_PATH_ABSOLUTE_BUILD_SYSTEM, 'node_modules'),
			//'node_modules'
		],
		/*roots: [ // Works, but maybe modules is more specific
			// A list of directories where requests of server-relative URLs
			// (starting with '/') are resolved, defaults to context configuration
			// option. On non-Windows systems these requests are resolved as an
			// absolute path first.
			DIR_PATH_ABSOLUTE_PROJECT, // same as context
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

	}; // webpackConfigObjectNashornPolyfills
	//console.debug('webpackConfigObjectNashornPolyfills', webpackConfigObjectNashornPolyfills);
	return webpackConfigObjectNashornPolyfills;
};
