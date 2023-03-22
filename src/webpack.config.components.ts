import type {Environment} from './index.d';
import type {
  EntrySet,
  SymlinksUnderR4xRoot
} from './buildComponents/index.d';


import { StatsWriterPlugin } from 'webpack-stats-plugin';

import {
  isAbsolute,
  join,
  parse,
  resolve,
  sep
} from 'path';

import {statSync} from 'fs';

import {
  DIR_PATH_RELATIVE_BUILD_ASSETS_R4X,
  DIR_PATH_RELATIVE_SRC_R4X,
  DIR_PATH_RELATIVE_SRC_SITE,
  EXTERNALS_DEFAULT,
  FILE_NAME_R4X_CONFIG_JS,
  FILE_NAME_WEBPACK_CONFIG_R4X_JS
} from './constants.buildtime';

import {
  COMPONENT_STATS_FILENAME,
  ENTRIES_FILENAME,
  LIBRARY_NAME
} from './constants.runtime';

import {getEntries} from './buildComponents/getEntries';
import {makeExclusionsRegexpString} from './buildComponents/makeExclusionsRegexpString';
import {normalizeDirList} from './buildComponents/normalizeDirList';

import {camelize} from './util/camelize';
import {cleanAnyDoublequotes} from './util/cleanAnyDoublequotes';
import {isSet} from './util/isSet';
import {makeVerboseLogger} from './util/makeVerboseLogger';
import getAppName from './util/getAppName';
//import {toStr} from './util/toStr';
import {ucFirst} from './util/ucFirst';


module.exports = (env: Environment = {}) => {
  const DIR_PATH_ABSOLUTE_PROJECT = cleanAnyDoublequotes("DIR_PATH_ABSOLUTE_PROJECT", env.DIR_PATH_ABSOLUTE_PROJECT || process.cwd());
  if (!isAbsolute(DIR_PATH_ABSOLUTE_PROJECT)) {
    throw new Error(`env.DIR_PATH_ABSOLUTE_PROJECT:${DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
  }

  const DIR_PATH_ABSOLUTE_BUILD_SYSTEM = resolve(__dirname, '..');
  //console.debug('DIR_PATH_ABSOLUTE_BUILD_SYSTEM', DIR_PATH_ABSOLUTE_BUILD_SYSTEM);

  const DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X);


  const environmentObj = {
    buildEnvString: 'production',
    chunkDirsStringArray: [],
    entryDirsStringArray: [],
    entryExtStringArray: ['jsx', 'tsx', 'ts', 'es6', 'es', 'js'],
    isVerbose: false
  } as {
    buildEnvString: string
    chunkDirsStringArray: string[]
    entryDirsStringArray: string[]
    entryExtStringArray: string[]
    isVerbose: boolean
  };
  //console.debug('environmentObj', environmentObj);

  const appName = ucFirst(camelize(getAppName(DIR_PATH_ABSOLUTE_PROJECT), /\./g));

  let EXTERNALS = EXTERNALS_DEFAULT;
  //console.debug('EXTERNALS', EXTERNALS);
  const FILE_PATH_ABSOLUTE_R4X_CONFIG_JS = join(DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_R4X_CONFIG_JS);
  //console.debug('FILE_PATH_ABSOLUTE_R4X_CONFIG_JS', FILE_PATH_ABSOLUTE_R4X_CONFIG_JS);

  try {
    const configJsStats = statSync(FILE_PATH_ABSOLUTE_R4X_CONFIG_JS);
    //console.debug('configJsStats', configJsStats);
    if (configJsStats.isFile()) {
      const config = require(FILE_PATH_ABSOLUTE_R4X_CONFIG_JS) as {
        chunkDirs: string[]
        entryDirs: string[]
        entryExtensions: string[]
        externals: object
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
      if (config.externals) {
        EXTERNALS = Object.assign(config.externals, EXTERNALS);
      }
    } // if FILE_NAME_R4X_CONFIG_JS
    //console.debug('EXTERNALS', EXTERNALS);
  } catch (e) {
    //console.debug('e', e);
    console.info(`${FILE_PATH_ABSOLUTE_R4X_CONFIG_JS} not found, which is fine :)`)
  }

  if (isSet(env.BUILD_ENV)) {
    environmentObj.buildEnvString = env.BUILD_ENV;
  }
  /*if (isSet(env.CHUNK_DIRS)) {
    environmentObj.chunkDirsStringArray = env.CHUNK_DIRS;
  }
  if (isSet(env.ENTRY_DIRS)) {
    environmentObj.entryDirsStringArray = env.ENTRY_DIRS;
  }
  if (isSet(env.ENTRY_EXT)) {
    environmentObj.entryExtStringArray = env.ENTRY_EXT;
  }*/
  if (isSet(env.VERBOSE)) {
    environmentObj.isVerbose = env.VERBOSE !== 'false';
  }
  //console.debug('environmentObj', environmentObj);


  const DIR_PATH_ABSOLUTE_SRC_R4X = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_SRC_R4X);
  //console.debug('DIR_PATH_ABSOLUTE_SRC_R4X', DIR_PATH_ABSOLUTE_SRC_R4X);

  const DIR_PATH_ABSOLUTE_SRC_SITE = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_SRC_SITE);
  //console.debug('DIR_PATH_ABSOLUTE_SRC_SITE', DIR_PATH_ABSOLUTE_SRC_SITE);

  const DEVMODE = environmentObj.buildEnvString !== "production";

  const verboseLog = makeVerboseLogger(environmentObj.isVerbose);

  verboseLog(DIR_PATH_ABSOLUTE_PROJECT, 'DIR_PATH_ABSOLUTE_PROJECT');

  let overrideCallback = (_, config: object) => config;

  const filePathAbsoluteWebpackOverride = join(DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_WEBPACK_CONFIG_R4X_JS);
  verboseLog(filePathAbsoluteWebpackOverride, 'filePathAbsoluteWebpackOverride');
  try {
    const webpackConfigR4xStats = statSync(filePathAbsoluteWebpackOverride);
    if (webpackConfigR4xStats.isFile()) {

        // eslint-disable-next-line import/no-dynamic-require, global-require
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

  let symlinksUnderReact4xpRootObject = {} as SymlinksUnderR4xRoot;

  const chunkDirs = normalizeDirList(
    environmentObj.chunkDirsStringArray.join(','),
    "chunkDir",
    DIR_PATH_ABSOLUTE_SRC_R4X,
    symlinksUnderReact4xpRootObject,
    environmentObj.isVerbose
  );

  const entryDirs = normalizeDirList(
    environmentObj.entryDirsStringArray.join(','),
    "entryDir",
    DIR_PATH_ABSOLUTE_SRC_R4X,
    symlinksUnderReact4xpRootObject,
    environmentObj.isVerbose
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
        DIR_PATH_ABSOLUTE_PROJECT || process.cwd(),
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
  verboseLog(entrySets, "\n\n---\entrySets", 1);

  //console.debug('entrySets', toStr(entrySets));
  //console.debug('ENTRIES_FILENAME', ENTRIES_FILENAME); // entries.json
  const entries = getEntries(
    entrySets,
    DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X,
    ENTRIES_FILENAME,
    verboseLog
  );
  //console.debug('entries', entries);

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
          ? `array[${entries.length}]`
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
      )}). Tip: the combination of entryDirs and entryExtStringArrayensions in react4xp.config.js was resolved to the entrySets above. Check the content of those directories, with those file extensions. Add entry source files, adjust react4xp.config.js, or run the build with -i for more info.`
    );
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
      name: "vendors",
      enforce: true,
      test: allFilesUnderNodeModulesExceptFilesUnderEnonicReactComponents,
      chunks: "all",
      priority: 100,
    },
    templates: {
      name: "templates",
      enforce: true,
      test: anyFilesUnderEnonicReactComponents,
      chunks: "all",
      priority: 99,
    },
    react4xp: {
      name: "react4xp",
      enforce: true,
      chunks: "all",
      priority: 1,
      test: `${DIR_PATH_ABSOLUTE_SRC_R4X}${
        react4xpExclusions
          ? `[\\\\/]((?!(${react4xpExclusions})).)[\\\\/]?`
          : ""
      }`,
    },
  };

  // Add new cacheGroups, excluding (by regexp) both other chunknames and entrydirs
  const takenNames = ["vendors", "templates", "react4xp"];
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

    const chunkExclusions = makeExclusionsRegexpString(
      chunkDir,
      detectedTargetDirs,
      verboseLog
    );
    const test = `${chunkDir}${
      chunkExclusions ? `[\\\\/]((?!(${chunkExclusions})).)[\\\\/]?` : ""
    }`;

    cacheGroups[name] = {
      name,
      test,
      enforce: true,
      chunks: "all",
      priority: 1,
    };
  });

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

  const config = {
    context: DIR_PATH_ABSOLUTE_PROJECT, // Used as default for resolve.roots

    devtool: DEVMODE ? "source-map" : false,

    entry: entries,

    externals: EXTERNALS,

    mode: environmentObj.buildEnvString,

    module: {
      rules: [
        {
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

          use: {
            loader: "babel-loader",
            options: {
              compact: !DEVMODE,
              presets: [
                '@babel/preset-typescript',
                "@babel/preset-react",
                "@babel/preset-env"
              ],
              plugins: [
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-transform-arrow-functions',
                '@babel/plugin-transform-typeof-symbol',
              ],
            },
          },
        },
      ],
    }, // module


    optimization: {
      // chunkIds: 'named', // TODO
      splitChunks: {
        name: false,
        cacheGroups,
      },
    },

    output: {
      path: DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, // <-- Sets the base url for plugins and other target dirs. Note the use of {{assetUrl}} in index.html (or index.ejs).
      filename: DEVMODE ? '[name].js' : '[name].[contenthash].js',
      library: {
        name: [`${appName}${LIBRARY_NAME}`,"[name]"],
        type: "var",
      },
      globalObject: "window",
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
      new StatsWriterPlugin({
        filename: COMPONENT_STATS_FILENAME,
        stats: {
          entrypoints: true, // <-- THE IMPORTANT ONE, FOR DEPENDENCY TRACKING!
          errors: true,
          warnings: true,

          // Everything else switched off:
          assets: false,
          builtAt: false,
          cached: false,
          cachedAssets: false,
          children: false,
          chunks: false,
          chunkGroups: false,
          chunkModules: false,
          chunkOrigins: false,
          depth: false,
          env: false,
          errorDetails: false,
          hash: false,
          modules: false,
          moduleTrace: false,
          performance: false,
          providedExports: false,
          publicPath: false,
          reasons: false,
          source: false,
          timings: false,
          usedExports: false,
          version: false,
        }
      })
    ], // plugins

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
