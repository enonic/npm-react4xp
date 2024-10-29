import type { LoaderContext } from 'webpack';
import type { Environment } from './index.d';
import type {
	EntrySet,
	SymlinksUnderR4xRoot
} from './buildComponents/index.d';

import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { StatsWriterPlugin } from 'webpack-stats-plugin';

import {
	isAbsolute,
	join,
	parse,
	resolve,
	sep
} from 'path';
import {
	basename as posixBasename
} from 'node:path/posix';

import { statSync } from 'fs';

import {
	DIR_PATH_RELATIVE_BUILD_ASSETS_R4X,
	DIR_PATH_RELATIVE_SRC_MAIN_RESOURCES,
	DIR_PATH_RELATIVE_SRC_R4X,
	DIR_PATH_RELATIVE_SRC_SITE,
	GLOBALS_DEFAULT,
	FILE_NAME_R4X_CONFIG_JS,
	FILE_NAME_WEBPACK_CONFIG_R4X_JS
} from './constants.buildtime';
import {
	COMPONENT_STATS_FILENAME,
	ENTRIES_FILENAME,
	LIBRARY_NAME
} from './constants.runtime';
import { getEntries } from './buildComponents/getEntries';
import { makeExclusionsRegexpString } from './buildComponents/makeExclusionsRegexpString';
import { normalizeDirList } from './buildComponents/normalizeDirList';
import { camelize } from './util/camelize';
import { isSet } from './util/isSet';
import { makeVerboseLogger } from './util/makeVerboseLogger';
// import { toStr } from './util/toStr';
import webpackLogLevel, {
	R4X_BUILD_LOG_LEVEL,
	WEBPACK_STATS_LOG_LEVEL
} from './util/webpackLogLevel';
import { ucFirst } from './util/ucFirst';
import { regexpEscape } from './util/regexpEscape';


const slashCode = "/".charCodeAt(0);
const backslashCode = "\\".charCodeAt(0);

const isInside = (path: string, parent: string) => {
	if (!path.startsWith(parent)) return false;
	if (path.length === parent.length) return true;
	const charCode = path.charCodeAt(parent.length);
	return charCode === slashCode || charCode === backslashCode;
};


export default (env: Environment = {}) => {
	const R4X_DIR_PATH_ABSOLUTE_PROJECT = process.env.R4X_DIR_PATH_ABSOLUTE_PROJECT;
	if (!isAbsolute(R4X_DIR_PATH_ABSOLUTE_PROJECT)) {
		throw new Error(`System environment variable $R4X_DIR_PATH_ABSOLUTE_PROJECT:${R4X_DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
	}

	if (!process.env.R4X_APP_NAME) {
		throw new Error(`System environment variable $R4X_APP_NAME is required!`);
	}

	const DIR_PATH_ABSOLUTE_BUILD_SYSTEM = resolve(__dirname, '..');
	//console.debug('DIR_PATH_ABSOLUTE_BUILD_SYSTEM', DIR_PATH_ABSOLUTE_BUILD_SYSTEM);

	const DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X = join(R4X_DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X);

	const WEBPACK_MODE = process.env.NODE_ENV || 'production';
	const DEVMODE = WEBPACK_MODE !== "production";
	const LOG_LEVEL = webpackLogLevel(process.env.R4X_BUILD_LOG_LEVEL as R4X_BUILD_LOG_LEVEL);

	const environmentObj = {
		chunkDirsStringArray: [],
		entryDirsStringArray: [],
		entryExtStringArray: ['jsx', 'tsx', 'ts', 'es6', 'es', 'js'],
		entryExtWhiteListArray: [
			'd',
			'css', 'less', 'sass', 'scss', 'styl',
			'jpg', 'jpeg', 'gif', 'png', 'svg', 'webp',
		]
	} as {
		chunkDirsStringArray: string[]
		entryDirsStringArray: string[]
		entryExtStringArray: string[]
		entryExtWhiteListArray: string[]
	};

	const appName = ucFirst(camelize(process.env.R4X_APP_NAME, /\./g));

	let EXTERNALS = GLOBALS_DEFAULT;

	const FILE_PATH_ABSOLUTE_R4X_CONFIG_JS = join(R4X_DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_R4X_CONFIG_JS);
	//console.debug('FILE_PATH_ABSOLUTE_R4X_CONFIG_JS', FILE_PATH_ABSOLUTE_R4X_CONFIG_JS);

	try {
		const configJsStats = statSync(FILE_PATH_ABSOLUTE_R4X_CONFIG_JS);
		//console.debug('configJsStats', configJsStats);
		if (configJsStats.isFile()) {

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const config = require(FILE_PATH_ABSOLUTE_R4X_CONFIG_JS) as {
				chunkDirs: string[]
				entryDirs: string[]
				entryExtensions: string[]
				entryExtensionWhitelist: string[]
				externals: object
				globals: object
			};
			//console.debug('config', toStr(config));

			if (config.chunkDirs) {
				environmentObj.chunkDirsStringArray = config.chunkDirs;
			}
			if (isSet(config.entryDirs)) {
				environmentObj.entryDirsStringArray = config.entryDirs;
			}
			if (isSet(config.entryExtensions)) {
				environmentObj.entryExtStringArray = config.entryExtensions
				.map((ext) => ext.trim())
				.map((ext) => ext.replace(/^\./, ""))
				.filter((ext) => !!ext);;
			}
			if (isSet(config.entryExtensionWhitelist)) {
				environmentObj.entryExtWhiteListArray = config.entryExtensionWhitelist
				.map((ext) => ext.trim())
				.map((ext) => ext.replace(/^\./, ""))
				.filter((ext) => !!ext);;
			}
			if (config.globals) {
				EXTERNALS = Object.assign(config.globals, EXTERNALS);
			}
			if (config.externals) {
				EXTERNALS = Object.assign(config.externals, EXTERNALS);
			}
		} // if FILE_NAME_R4X_CONFIG_JS
	} catch (e) {
		//console.debug('e', e);
		console.info(`${FILE_PATH_ABSOLUTE_R4X_CONFIG_JS} not found, which is fine :)`)
	}

	const VERBOSE = [
		WEBPACK_STATS_LOG_LEVEL.LOG,
		WEBPACK_STATS_LOG_LEVEL.VERBOSE
	].includes(LOG_LEVEL);

	const verboseLog = makeVerboseLogger(VERBOSE);

	verboseLog(EXTERNALS, 'EXTERNALS');

	/*if (isSet(env.CHUNK_DIRS)) {
		environmentObj.chunkDirsStringArray = env.CHUNK_DIRS;
	}
	if (isSet(env.ENTRY_DIRS)) {
		environmentObj.entryDirsStringArray = env.ENTRY_DIRS;
	}
	if (isSet(env.ENTRY_EXT)) {
		environmentObj.entryExtStringArray = env.ENTRY_EXT;
	}*/
	//console.debug('environmentObj', environmentObj);


	const DIR_PATH_ABSOLUTE_SRC_R4X = join(R4X_DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_SRC_R4X);
	//console.debug('DIR_PATH_ABSOLUTE_SRC_R4X', DIR_PATH_ABSOLUTE_SRC_R4X);

	const DIR_PATH_ABSOLUTE_SRC_SITE = join(R4X_DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_SRC_SITE);
	//console.debug('DIR_PATH_ABSOLUTE_SRC_SITE', DIR_PATH_ABSOLUTE_SRC_SITE);

	verboseLog(R4X_DIR_PATH_ABSOLUTE_PROJECT, 'R4X_DIR_PATH_ABSOLUTE_PROJECT');

	let overrideCallback = (_, config: object) => config;

	const filePathAbsoluteWebpackOverride = join(R4X_DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_WEBPACK_CONFIG_R4X_JS);
	verboseLog(filePathAbsoluteWebpackOverride, 'filePathAbsoluteWebpackOverride');
	try {
		const webpackConfigR4xStats = statSync(filePathAbsoluteWebpackOverride);
		if (webpackConfigR4xStats.isFile()) {

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const overridden = require(filePathAbsoluteWebpackOverride);
			//console.debug('overridden', overridden); // function

			if (typeof overridden === "object") {
			overrideCallback = () => overridden;
			} else if (typeof overridden === "function") {
			overrideCallback = overridden;
			} else {
			throw Error(
				`Optional overrideComponentWebpack (${filePathAbsoluteWebpackOverride}) doesn't seem to default-export an object or a (env, config) => config function. Should either export a webpack-config-style object directly, OR take an env object and a webpack-config-type object 'config' as arguments, then manipulate or replace config, then return it.`
			);
			}
		}
	} catch (e) {
		//console.debug('e', e);
		console.info(`${filePathAbsoluteWebpackOverride} not found, which is fine :)`)
	}

	// -------------------------------------  Okay, settings and context are parsed. Let's go:

	const symlinksUnderReact4xpRootObject = {} as SymlinksUnderR4xRoot;

	const chunkDirs = normalizeDirList(
		environmentObj.chunkDirsStringArray.join(','),
		"chunkDir",
		DIR_PATH_ABSOLUTE_SRC_R4X,
		symlinksUnderReact4xpRootObject,
		VERBOSE
	);

	const entryDirs = normalizeDirList(
		environmentObj.entryDirsStringArray.join(','),
		"entryDir",
		DIR_PATH_ABSOLUTE_SRC_R4X,
		symlinksUnderReact4xpRootObject,
		VERBOSE
	);

	verboseLog(environmentObj.chunkDirsStringArray, "\n\n---\nchunkDirsStringArray", 1);
	verboseLog(chunkDirs, "--> chunkDirs", 1);
	verboseLog(environmentObj.entryDirsStringArray, "\n\n---\nentryDirsStringArray", 1);
	verboseLog(entryDirs, "--> entryDirs", 1);
	verboseLog("---\n");

	// -----------------------------------------------------------  Catching some likely troublemakers:

	//console.debug('symlinksUnderReact4xpRootObject', toStr(symlinksUnderReact4xpRootObject));
	const symlinksUnderReact4xpRootArray = Object.keys(symlinksUnderReact4xpRootObject).filter(
		(key) => !!symlinksUnderReact4xpRootObject[key]
	);
	if (symlinksUnderReact4xpRootArray.length) {
		console.warn(
		`Warning: ${
			symlinksUnderReact4xpRootArray.length
		} chunkDir(s) / entryDir(s) in react4xp.config.js are symlinks that lead inside the folder structure below the React4xp root (${DIR_PATH_ABSOLUTE_SRC_R4X}). This could cause a mess in React4xp's entry/chunk structure, so I hope you know what you're doing. These are: '${
			symlinksUnderReact4xpRootArray.join("', '")}'`
		);
	}
	const duplicates = chunkDirs.filter((dir) => entryDirs.indexOf(dir) !== -1);
	if (duplicates.length) {
		throw Error(
		`${
			duplicates.length
		} directories in ${FILE_PATH_ABSOLUTE_R4X_CONFIG_JS} are listed both as chunkDirs and entryDirs. Bad items are: '${duplicates.join(
			"', '"
		)}'`
		);
	}

	const siteParsed = parse(DIR_PATH_ABSOLUTE_SRC_SITE);
	const tooGeneralPaths = DIR_PATH_ABSOLUTE_SRC_SITE.split(sep).reduce((accum, current) => {
		const longestPath = accum.slice(-1)[0];
		if (longestPath === undefined) {
		return [siteParsed.root];
		}
		const dir = resolve(longestPath, current);
		if (dir !== DIR_PATH_ABSOLUTE_SRC_SITE) {
		accum.push(dir);
		}
		return accum;
	}, []);

	const badChunkDirs = chunkDirs.filter(
		(dir) =>
		dir === DIR_PATH_ABSOLUTE_SRC_SITE ||
		dir.startsWith(DIR_PATH_ABSOLUTE_SRC_SITE) ||
		tooGeneralPaths.indexOf(dir) !== -1
	);
	if (badChunkDirs.length) {
		throw Error(
		`${
			badChunkDirs.length
		} chunkDir(s) in react4xp.config.js are illegal or too general. For chunkDirs, avoid 'src/main/resources/site' in general, and direct references to its parent directories. Bad items are: '${badChunkDirs.join(
			"', '"
		)}'`
		);
	}
	const badEntryDirs = entryDirs.filter(
		(dir) => tooGeneralPaths.indexOf(dir) !== -1
	);
	if (badEntryDirs.length) {
		throw Error(
		`${
			badEntryDirs.length
		} entryDir(s) in react4xp.config.js are too general. For entryDirs, avoid direct references to the XP folder 'src/main/resources/' or its direct parent directories. Bad items are: '${badEntryDirs.join(
			"', '"
		)}'`
		);
	}

	// ------------------- Build the entry list:

	// Build the entries
	const entrySets: EntrySet[] = [
		{
			sourcePath: DIR_PATH_ABSOLUTE_SRC_SITE,
			sourceExtensions: ["jsx", "tsx"],
			targetSubDir: "site",
		},
		/*{
		sourcePath: join(
			R4X_DIR_PATH_ABSOLUTE_PROJECT || process.cwd(),
			"node_modules",
			"react4xp-regions",
			"entries"
		),
		sourceExtensions: ["jsx", "tsx", "js", "ts", "es6", "es"],
		},*/
		...entryDirs.map((entryDir) => ({
			sourcePath: entryDir,
			sourceExtensions: environmentObj.entryExtStringArray,
		})),
	];
	verboseLog(entrySets, "\n\n---entrySets", 1);

	// console.debug('entrySets', toStr(entrySets));
	// console.debug('ENTRIES_FILENAME', ENTRIES_FILENAME); // entries.json
	const entries = getEntries(
		entrySets,
		DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X,
		ENTRIES_FILENAME,
		verboseLog
	);
	// verboseLog(entries, 'entries');

	// ------------------------------------------- Entries are generated. Error reporting and isVerbose output:

	if (entries && typeof entries !== "object") {
		console.error(
		`react4xp-build-entriesandchunks used entrySets (${
			Array.isArray(entrySets)
			? `array[${entrySets.length}]`
			: typeof entrySets +
				(entrySets && typeof entrySets === "object"
				? ` with keys: ${JSON.stringify(Object.keys(entrySets))}`
				: "")
		}): ${JSON.stringify(entrySets, null, 2)}`
		);
		throw Error(
		`react4xp-build-components can't continue. The sub-package react4xp-build-entriesandchunks seems to have produced malformed 'entries' data, using the entrysets above. Run the build with -i for more info. Expected an object, but got ${
			Array.isArray(entries)
			? `array[${(entries as unknown[]).length}]`
			: typeof entries +
				(entries && typeof entries === "object"
				? ` with keys: ${JSON.stringify(Object.keys(entries))}`
				: "")
		}: ${JSON.stringify(entries)}`
		);
	}

	if (!entries || !Object.keys(entries).length) {
		console.error(
		`react4xp-build-entriesandchunks used entrySets (${
			Array.isArray(entrySets)
			? `array[${entrySets.length}]`
			: typeof entrySets +
				(entrySets && typeof entrySets === "object"
				? ` with keys: ${JSON.stringify(Object.keys(entrySets))}`
				: "")
		}): ${JSON.stringify(entrySets, null, 2)}`
		);
		throw Error(
		`react4xp-build-components can't continue - no entries were found (entries=${JSON.stringify(
			entries
		)}). Tip: the combination of entryDirs and entryExtensions in react4xp.config.js was resolved to the entrySets above. Check the content of those directories, with those file extensions. Add entry source files, adjust react4xp.config.js, or run the build with -i for more info.`
		);
	}

	// Case insensitive comparison bewteen chunkDirs and Object.keys(entries) in
	// order to avoid:
	// [webpack-cli] Error: Prevent writing to file that only differs in casing
	// or query string from already written file.
	// This will lead to a race-condition and corrupted files on
	// case-insensitive file systems.
	const entryKeys = Object.keys(entries);
	for (let i = 0; i < chunkDirs.length; i++) {
		const aChunkDir = chunkDirs[i].split(sep).slice(-1)[0];
		for (let j = 0; j < entryKeys.length; j++) {
			const anEntryKey = entryKeys[j];
			if (aChunkDir.toLowerCase() === anEntryKey.toLowerCase()) {
				throw new Error(`Entry name collision:${anEntryKey}!\nentry file:${entries[anEntryKey]}\nchunk  dir:${chunkDirs[i]}`);
			}
		}
	}

	verboseLog(entries, "\nreact4xp-build-components - entries", 1);

	// ------------------------------  Generated the webpack cacheGroups

	const detectedTargetDirs = [...entryDirs, ...chunkDirs];
	const react4xpExclusions = makeExclusionsRegexpString(
		DIR_PATH_ABSOLUTE_SRC_R4X,
		detectedTargetDirs,
		verboseLog
	);

	const allFilesUnderNodeModulesExceptFilesUnderEnonicReactComponents = /[\\/]node_modules[\\/](?!@enonic[\\/]react-components)./;
	const anyFilesUnderEnonicReactComponents = /[\\/]node_modules[\\/]@enonic[\\/]react-components/;

	// https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkschunks
	// splitChunks.chunks
	// This indicates which chunks will be selected for optimization.
	// When a string is provided, valid values are all, async, and initial.
	// Providing all can be particularly powerful, because it means that chunks
	// can be shared even between async and non-async chunks.
	//
	// https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroupscachegroupenforce
	// splitChunks.cacheGroups.{cacheGroup}.enforce
	// Tells webpack to ignore splitChunks.minSize, splitChunks.minChunks,
	// splitChunks.maxAsyncRequests and splitChunks.maxInitialRequests
	// options and always create chunks for this cache group.
	//
	// https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroupscachegrouppriority
	// splitChunks.cacheGroups.{cacheGroup}.priority
	// A module can belong to multiple cache groups.
	// The optimization will prefer the cache group with a higher priority.
	// The default groups have a negative priority to allow custom groups to take
	// higher priority (default value is 0 for custom groups).
	const cacheGroups = {
		vendors: {
			// chunks: "all",// splitChunks.cacheGroups.{cacheGroup}.chunks doesn't exist!
			enforce: true,
			filename: DEVMODE ? '[name].js' : '[name].[contenthash].js',
			name: "vendors",
			priority: 100,
			test: allFilesUnderNodeModulesExceptFilesUnderEnonicReactComponents,
			usedExports: !DEVMODE, // Disable slow tree-shaking in dev mode
		},
		templates: {
			// chunks: "all",// splitChunks.cacheGroups.{cacheGroup}.chunks doesn't exist!
			enforce: true,
			filename: DEVMODE ? '[name].js' : '[name].[contenthash].js',
			name: "templates",
			priority: 99,
			// reuseExistingChunk: true,
			test: anyFilesUnderEnonicReactComponents,
			usedExports: !DEVMODE, // Disable slow tree-shaking in dev mode
		},
	};

	// Add new cacheGroups, excluding (by regexp) both other chunknames and entrydirs
	const takenNames = [
		"client",
		"executor",
		"global",
		"react4xp",
		"templates",
		"vendors",
	];

	chunkDirs.forEach((chunkDir) => {
		let name = chunkDir.split(sep).slice(-1)[0];
		if (takenNames.indexOf(name) !== -1) {
			name = `react4xp_${chunkDir
				.slice(DIR_PATH_ABSOLUTE_SRC_R4X.length)
				.replace(new RegExp(sep, "g"), "__")}`;

			while (takenNames.indexOf(name) !== -1) {
				name += "_";
			}
		}
		takenNames.push(name);
		// verboseLog(takenNames, "\nreact4xp-build-components - takenNames", 1);

		const chunkExclusions = makeExclusionsRegexpString(
			chunkDir,
			detectedTargetDirs,
			verboseLog
		);
		const test = `${regexpEscape(chunkDir)}${
			// https://www.regular-expressions.info/lookaround.html
			// Negative lookahead is indispensable if you want to match something not followed by something else.
			//
			// https://www.regular-expressions.info/brackets.html
			// The question mark and the colon after the opening parenthesis are the syntax that creates a non-capturing group.
			//
			// This ensures that any chunk or entry dir inside this chunkdir is excluded from this chunk/bundle.
			chunkExclusions ? `[\\\\/](?!(?:${chunkExclusions})[\\\\/])` : "[\\\\/]"
		}`;

		cacheGroups[name] = {
			name,
			test,
			// https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroupscachegroupenforce
			// Tells webpack to ignore splitChunks.minSize,
			// splitChunks.minChunks, splitChunks.maxAsyncRequests and
			// splitChunks.maxInitialRequests options and always create chunks
			// for this cache group.
			enforce: true,
			// enforceSizeThreshold: 1,
			filename: DEVMODE ? '[name].js' : '[name].[contenthash].js',
			// minRemainingSize: 0,

			// chunks: "all", // splitChunks.cacheGroups.{cacheGroup}.chunks doesn't exist!

			priority: 2,

			// https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroupscachegroupreuseexistingchunk
			// If the current chunk contains modules already split out from the
			// main bundle, it will be reused instead of a new one being
			// generated. This can affect the resulting file name of the chunk.
			// reuseExistingChunk: true,

			usedExports: !DEVMODE, // Disable slow tree-shaking in dev mode
		};
	});

	cacheGroups['react4xp'] = {
		enforce: true,
		// enforceSizeThreshold: 1,
		filename: DEVMODE ? '[name].js' : '[name].[contenthash].js',
		// minRemainingSize: 0,
		name: "react4xp",
		// chunks: "all",// splitChunks.cacheGroups.{cacheGroup}.chunks doesn't exist!
		priority: 1,
		test: `${regexpEscape(DIR_PATH_ABSOLUTE_SRC_R4X)}${
			react4xpExclusions
				// https://www.regular-expressions.info/lookaround.html
				// Negative lookahead is indispensable if you want to match something not followed by something else.
				//
				// https://www.regular-expressions.info/brackets.html
				// The question mark and the colon after the opening parenthesis are the syntax that creates a non-capturing group.
				//
				// This ensures that any chunk or entry dir inside the SRC_R4X is excluded from the react4xp bundle/chunk.
				// Because the content of those folders become their own bundles/chunks.
				? `[\\\\/](?!(?:${react4xpExclusions})[\\\\/])`
				: "[\\\\/]"
		}`,
		// reuseExistingChunk: true,
		usedExports: !DEVMODE, // Disable slow tree-shaking in dev mode
	};

	// Finally, turn all generated regexp strings in each .test attribute into actual RegExp's:
	Object.keys(cacheGroups).forEach((key) => {
		cacheGroups[key] = {
		...cacheGroups[key],
		test:
			typeof cacheGroups[key].test === "string"
			? new RegExp(cacheGroups[key].test)
			: cacheGroups[key].test,
		};
	});

	// ------------------------------------------

	const restrictions = [DIR_PATH_ABSOLUTE_SRC_SITE].concat(entryDirs);

	const decider = (importPath: string, loaderContext: LoaderContext<Record<string, unknown>>) => new Promise((resolve, reject) => {
		loaderContext.resolve(loaderContext.context, importPath, (err, result: string) => {
			if (err !== null) {
				reject(err.message);
			} else {
				let matchesRestriction = false;
				for (const rule of restrictions) {
					if (isInside(result, rule)) {
						matchesRestriction = true;
						break;
					}
				} // for
				if (matchesRestriction) {
					const basename = posixBasename(importPath);
					const dotParts = basename.split('.');
					if (dotParts.length > 1) { // has extension
						const extension = dotParts.pop();
						if (environmentObj.entryExtWhiteListArray.includes(extension)) {
							resolve(true);
						} else {
							if (environmentObj.entryExtStringArray.includes(extension)) {
								reject(new Error(`Importing from React4XP entries is not allowed! Illegal import: "${importPath}". Please move shared code outside site and entrydirs.`));
							} else {
								console.warn(`Unknown extension: "${extension}" not in entryExtensions:"${environmentObj.entryExtStringArray.join(',')}" nor WHITELIST: "${environmentObj.entryExtWhiteListArray.join(',')}"`);
								resolve(true);
							}
						}
					} else { // no extension
						reject(new Error(`Importing from React4XP entries is not allowed! Illegal import: "${importPath}". Please move shared code outside site and entrydirs.`));
					}
				} else {
					resolve(true);
				}
			}
		});
	});

	const config = {
		context: R4X_DIR_PATH_ABSOLUTE_PROJECT, // Used as default for resolve.roots

		devtool: DEVMODE ? false : 'source-map',

		entry: entries,

		externals: EXTERNALS,

		mode: WEBPACK_MODE,

		module: {
			rules: [{
				// Babel for building static assets. Excluding node_modules BUT ALLOWING node_modules/@enonic/react-components
				test: /\.((j|t)sx?|es6?)$/,  // js, ts, jsx, tsx, es, es6

				// I don't think we can exclude much, everything must be able to run:
				// * server-side (Nashorn/Graal-JS) and
				// * client-side (Browsers).
				//exclude: allFilesUnderNodeModulesExceptFilesUnderEnonicReactComponents,

				// It takes time to transpile, if you know they don't need
				// transpilation to run in Enonic XP (Nashorn/Graal-JS) you may list
				// them here:
				exclude: [
					/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
					/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
				],

				use: [{
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
						// parallel: true,
						// https://swc.rs/docs/usage/swc-loader#with-babel-loader
						// When used with babel-loader, the parseMap option must be set to true.
						//parseMap: true,
						sourceMaps: !DEVMODE
					}
				},{
					loader: 'restrict-imports-loader',
					options: {
						severity: "error",
						rules: [
						{
							restricted: decider
						},
					  ],
					},
				  },], // use
			}], // rules
		}, // module


		optimization: {
			// https://webpack.js.org/configuration/optimization/#optimizationchunkids
			// deterministic: Short numeric ids which will not be changing between compilation. Good for long term caching. Enabled by default for production mode.
			// named: Readable ids for better debugging.
			chunkIds: DEVMODE ? 'named' : 'deterministic', // Named chunks gives weird names that starts with src_main_resources_*

			// By default concatenateModules is enabled in production mode and disabled elsewise
			// By default flagIncludedChunks is enabled in production mode and disabled elsewise.
			innerGraph: !DEVMODE, // tells webpack whether to conduct inner graph analysis for unused exports
			// By default mangleExports: 'deterministic' is enabled in production mode and disabled elsewise.
			mangleWasmImports: false, // I think false is the default, but doc is unclear.
			minimize: !DEVMODE,
			// minimizer // TODO?
			mergeDuplicateChunks: !DEVMODE, // Might be slow, so avoid in DEVMOVE
			moduleIds: DEVMODE ? 'named' : 'deterministic',
			removeAvailableModules: !DEVMODE,
			removeEmptyChunks: !DEVMODE,

			// Fix #216 webpack module cache is entry-local
			runtimeChunk: 'single',

			sideEffects: !DEVMODE,

			// The Build Performance documentation goes both ways regarding splitChunks.
			// We have discovered that runtime performance is really bad without splitChunks,
			// so we have decided to keep it in dev mode, even though build time might suffer a little.

			// https://webpack.js.org/guides/build-performance/#smaller--faster
			// Use the SplitChunksPlugin in Multi-Page Applications.

			// https://webpack.js.org/guides/build-performance/#avoid-production-specific-tooling
			// AggressiveSplittingPlugin

			// https://webpack.js.org/guides/build-performance/#avoid-extra-optimization-steps
			// These optimizations are performant for smaller codebases, but can be costly in larger ones

			// https://webpack.js.org/guides/code-splitting/
			// if used correctly, can have a major impact on load time

			// https://webpack.js.org/plugins/split-chunks-plugin/

			splitChunks: {
				// https://webpack.js.org/plugins/split-chunks-plugin/#splitchunksname
				// Providing false will keep the same name of the chunks so it doesn't change names unnecessarily.
				// It is the recommended value for production builds.
				chunks: 'all',
				// chunks: 'initial',
				name: false,
				cacheGroups,
			},
			usedExports: !DEVMODE, // Disable slow tree-shaking in dev mode
		},

		output: {
			path: DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, // <-- Sets the base url for plugins and other target dirs. Note the use of {{assetUrl}} in index.html (or index.ejs).

			// https://webpack.js.org/guides/build-performance/#output-without-path-info
			// this puts garbage collection pressure on projects that bundle thousands of modules
			// https://webpack.js.org/configuration/output/#outputpathinfo
			// defaults to true in development and false in production mode
			pathinfo: false, // We probably don't need this even in development mode?

			filename: DEVMODE ? '[name].js' : '[name].[contenthash].js',
			library: {
				name: [`${appName}${LIBRARY_NAME}`,"[name]"],
				type: "global",
			},
			globalObject: "globalThis",
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

		plugins: [
			new CaseSensitivePathsPlugin(),
			new StatsWriterPlugin({
				filename: COMPONENT_STATS_FILENAME,
				fields: [
					'assetsByChunkName',
					'assets',
					'entrypoints',
					'errors',
					'warnings',
				],
				transform(data) {
					data.assets = data.assets.map(({
						info,
						name
					}) => ({
						info,
						name
					}));

					const filteredEntrypoints = {};
					Object.keys(data.entrypoints).forEach((key) => {
						filteredEntrypoints[key] = {
							// name, // this is just the same as key
							assets: data.entrypoints[key].assets.map(({	name }) => ({ name })),
							auxiliaryAssets: data.entrypoints[key].auxiliaryAssets.map(({ name }) => ({ name })),
							// NOTE: Currently not using these for anything:
							// assetsSize
							// auxiliaryAssetsSize
							// childAssets
							// children
							// chunks
							// filteredAssets
							// filteredAuxiliaryAssets
							// isOverSizeLimit
						};
					});
					data.entrypoints = filteredEntrypoints;

					return JSON.stringify(data, null, 2);
				},
			})
		], // plugins

		resolve: {
			extensions: [
				'.tsx',
				'.jsx',
				'.ts',
				'.es6',
				'.es',
				'.js',
				'.json'
			],
			modules: [
				// Tell webpack what directories should be searched when
				// resolving modules.
				// Absolute and relative paths can both be used, but be aware
				// that they will behave a bit differently.
				// A relative path will be scanned similarly to how Node scans
				// for node_modules, by looking through the current directory as
				// well as its ancestors (i.e. ./node_modules, ../node_modules,
				// and on). With an absolute path, it will only search in the
				// given directory.

				// To resolve node_modules installed under the app
				resolve(R4X_DIR_PATH_ABSOLUTE_PROJECT, 'node_modules'),

				// To resolve node_modules installed under the build system
				resolve(DIR_PATH_ABSOLUTE_BUILD_SYSTEM, 'node_modules'),
				//'node_modules'
			],
			roots: [
				// A list of directories where requests of server-relative URLs
				// (starting with '/') are resolved, defaults to context configuration
				// option. On non-Windows systems these requests are resolved as an
				// absolute path first.
				resolve(R4X_DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_SRC_MAIN_RESOURCES)
			],
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

	};

	const outputConfig = overrideCallback(env, config);

	verboseLog(
		outputConfig,
		"\n-------------------- react4xp-build-components - webpack config output"
	);

	return outputConfig;
};
