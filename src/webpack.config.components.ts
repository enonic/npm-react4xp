// TODO: New general comment explanation!

/*
There is a file 'react4xp.properties' which exists at the Enonic XP application project.projectdir.

The 'react4xp.properties' file may define where an overrideComponentWebpack file exists.
The 'overrideComponentWebpack' file is only used when building components.
*/
import type {Environment} from './index.d';
import type {
  EntrySet,
  SymlinksUnderR4xRoot
} from './buildComponents/index.d';


import * as StatsPlugin from 'stats-webpack-plugin';

import {
  isAbsolute,
  join,
  parse,
  resolve,
  sep
} from 'path';

import {
  mkdirSync,
  openSync,
  statSync,
  writeSync
} from 'fs';

import {
  DIR_PATH_RELATIVE_BUILD_ASSETS_R4X,
  DIR_PATH_RELATIVE_SRC_R4X,
  DIR_PATH_RELATIVE_SRC_SITE,
  EXTERNALS_DEFAULT,
  FILE_NAME_R4X_CONFIG_JSON,
  FILE_NAME_R4X_PROPERTIES
} from './constants.buildtime';

import {
  COMPONENT_STATS_FILENAME,
  ENTRIES_FILENAME,
  FILE_NAME_R4X_RUNTIME_SETTINGS,
  LIBRARY_NAME
} from './constants.runtime';

import {getEntries} from './buildComponents/getEntries';
import {makeExclusionsRegexpString} from './buildComponents/makeExclusionsRegexpString';
import {normalizeDirList} from './buildComponents/normalizeDirList';

import {getProperties} from './properties/getProperties';

import {cleanAnyDoublequotes} from './util/cleanAnyDoublequotes';
import {isSet} from './util/isSet';
import {makeVerboseLogger} from './util/makeVerboseLogger';
import {toStr} from './util/toStr';


module.exports = (env :Environment = {}) => {
  const DIR_PATH_ABSOLUTE_PROJECT = cleanAnyDoublequotes("DIR_PATH_ABSOLUTE_PROJECT", env.DIR_PATH_ABSOLUTE_PROJECT || process.cwd());
  if (!isAbsolute(DIR_PATH_ABSOLUTE_PROJECT)) {
    throw new Error(`env.DIR_PATH_ABSOLUTE_PROJECT:${DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
  }

  const DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X);

  let {
    BUILD_ENV = 'production',
    CHUNK_DIRS,
    ENTRY_DIRS,
    ENTRY_EXT = 'jsx,tsx,js,ts,es6,es',
    VERBOSE = false
  } = env;
  //console.debug('BUILD_ENV', BUILD_ENV);
  //console.debug('VERBOSE', VERBOSE);

  let EXTERNALS = EXTERNALS_DEFAULT;
  //console.debug('EXTERNALS', EXTERNALS);
  const FILE_PATH_ABSOLUTE_R4X_CONFIG_JSON = join(DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_R4X_CONFIG_JSON);
  const configJsonStats = statSync(FILE_PATH_ABSOLUTE_R4X_CONFIG_JSON);
  if (configJsonStats.isFile()) {
    const config = require(FILE_PATH_ABSOLUTE_R4X_CONFIG_JSON);
    //console.debug('config', config);
    if (config.externals) {
      EXTERNALS = Object.assign(config.externals, EXTERNALS);
    }
  } // if FILE_NAME_R4X_CONFIG_JSON
  //console.debug('EXTERNALS', EXTERNALS);

  const runtimeSettingsLibR4x = {
    SSR_LAZYLOAD: true,
    SSR_ENGINE_SETTINGS: 0,
    SSR_MAX_THREADS: null
  };

  let overrideComponentWebpack :string;
  const FILE_PATH_ABSOLUTE_R4X_PROPERTIES = join(DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_R4X_PROPERTIES);
  const stats = statSync(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
  if (stats.isFile()) {
    const properties = getProperties(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
    //console.debug('properties', properties);

    if (isSet(properties.buildEnv)) {
      BUILD_ENV = cleanAnyDoublequotes('buildEnv', properties.buildEnv);
    }

    if (isSet(properties.chunkDirs)) {
      CHUNK_DIRS = cleanAnyDoublequotes('chunkDirs', properties.chunkDirs);
    }

    if (isSet(properties.entryDirs)) {
      ENTRY_DIRS = cleanAnyDoublequotes('entryDirs', properties.entryDirs);
    }

    if (isSet(properties.entryExtensions)) {
      ENTRY_EXT = cleanAnyDoublequotes('entryExtensions', properties.entryExtensions);
    }

    if (isSet(properties.ssrLazyload)) {
      runtimeSettingsLibR4x.SSR_LAZYLOAD = properties.ssrLazyload !== 'false';
    }
    if (isSet(properties.ssrSettings)) {
      const int = parseInt(properties.ssrSettings);
      runtimeSettingsLibR4x.SSR_ENGINE_SETTINGS = `${int}` === properties.ssrSettings ? int : properties.ssrSettings;
    }
    if (isSet(properties.ssrMaxThreads)) {
      runtimeSettingsLibR4x.SSR_MAX_THREADS = parseInt(properties.ssrMaxThreads);
    }

    if (!isAbsolute(properties.overrideComponentWebpack)) {
      properties.overrideComponentWebpack = join(DIR_PATH_ABSOLUTE_PROJECT, properties.overrideComponentWebpack);
    }
    overrideComponentWebpack = properties.overrideComponentWebpack;

    if (isSet(properties.verbose)) {
      VERBOSE = cleanAnyDoublequotes('verbose', properties.verbose) !== 'false';
    }
  }  // if react4xp.properties
  //console.debug('runtimeSettingsLibR4x', runtimeSettingsLibR4x);

  //console.debug('DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X', DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X);
  mkdirSync(DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, {recursive: true});

  //console.debug('FILE_NAME_R4X_RUNTIME_SETTINGS', FILE_NAME_R4X_RUNTIME_SETTINGS);
  const FILE_PATH_ABSOLUTE_R4X_RUNTIME_SETTINGS = join(DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, FILE_NAME_R4X_RUNTIME_SETTINGS);
  //console.debug('FILE_PATH_ABSOLUTE_R4X_RUNTIME_SETTINGS', FILE_PATH_ABSOLUTE_R4X_RUNTIME_SETTINGS);

  const fileDescriptorOverwriteMode = openSync(FILE_PATH_ABSOLUTE_R4X_RUNTIME_SETTINGS, 'w');
  writeSync(fileDescriptorOverwriteMode, JSON.stringify(runtimeSettingsLibR4x));

  const DIR_PATH_ABSOLUTE_SRC_R4X = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_SRC_R4X);
  //console.debug('DIR_PATH_ABSOLUTE_SRC_R4X', DIR_PATH_ABSOLUTE_SRC_R4X);

  const DIR_PATH_ABSOLUTE_SRC_SITE = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_SRC_SITE);
  //console.debug('DIR_PATH_ABSOLUTE_SRC_SITE', DIR_PATH_ABSOLUTE_SRC_SITE);

  const DEVMODE = BUILD_ENV !== "production";

  const verboseLog = makeVerboseLogger(VERBOSE);

  verboseLog(DIR_PATH_ABSOLUTE_PROJECT, "DIR_PATH_ABSOLUTE_PROJECT", 1);

  // TODO: Probably more consistent if this too is a master config file property. Add to react4xp-buildconstants and import above from env.REACT4XP_CONFIG_FILE.
  let overrideCallback = (_, config) => config;
  if (overrideComponentWebpack) {

    // eslint-disable-next-line import/no-dynamic-require, global-require
    const overridden = require(overrideComponentWebpack);
    //console.debug('overridden', overridden); // function

    if (typeof overridden === "object") {
      overrideCallback = () => overridden;
    } else if (typeof overridden === "function") {
      overrideCallback = overridden;
    } else {
      throw Error(
        `Optional overrideComponentWebpack (${overrideComponentWebpack}) doesn't seem to default-export an object or a (env, config) => config function. Should either export a webpack-config-style object directly, OR take an env object and a webpack-config-type object 'config' as arguments, then manipulate or replace config, then return it.`
      );
    }
  }

  // -------------------------------------  Okay, settings and context are parsed. Let's go:

  let symlinksUnderReact4xpRootObject = {} as SymlinksUnderR4xRoot;

  const chunkDirs = normalizeDirList(
    CHUNK_DIRS,
    "chunkDir",
    DIR_PATH_ABSOLUTE_SRC_R4X,
    symlinksUnderReact4xpRootObject,
    VERBOSE
  );

  const entryDirs = normalizeDirList(
    ENTRY_DIRS,
    "entryDir",
    DIR_PATH_ABSOLUTE_SRC_R4X,
    symlinksUnderReact4xpRootObject,
    VERBOSE
  );

  verboseLog(CHUNK_DIRS, "\n\n---\nCHUNK_DIRS", 1);
  verboseLog(chunkDirs, "--> chunkDirs", 1);
  verboseLog(ENTRY_DIRS, "\n\n---\nENTRY_DIRS", 1);
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
      } chunkDir(s) / entryDir(s) in react4xp.properties are symlinks that lead inside the folder structure below the React4xp root (${DIR_PATH_ABSOLUTE_SRC_R4X}). This could cause a mess in React4xp's entry/chunk structure, so I hope you know what you're doing. These are: '${
        symlinksUnderReact4xpRootArray.join("', '")}'`
    );
  }
  const duplicates = chunkDirs.filter((dir) => entryDirs.indexOf(dir) !== -1);
  if (duplicates.length) {
    throw Error(
      `${
        duplicates.length
      } directories in react4xp.properties are listed both as chunkDirs and entryDirs. Bad items are: '${duplicates.join(
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
      } chunkDir(s) in react4xp.properties are illegal or too general. For chunkDirs, avoid 'src/main/resources/site' in general, and direct references to its parent directories. Bad items are: '${badChunkDirs.join(
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
      } entryDir(s) in react4xp.properties are too general. For entryDirs, avoid direct references to the XP folder 'src/main/resources/' or its direct parent directories. Bad items are: '${badEntryDirs.join(
        "', '"
      )}'`
    );
  }

  // ------------------- Build the entry list:

  // Normalize and clean the entry extensions list:
  const entryExtensions = ENTRY_EXT
    .trim()
    .replace(/[´`'"]/g, "")
    .split(",")
    .map((ext) => ext.trim())
    .map((ext) => ext.replace(/^\./, ""))
    .filter((ext) => !!ext);

  // Build the entries
  const entrySets :Array<EntrySet> = [
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
      sourceExtensions: entryExtensions,
    })),
  ];

  //console.debug('entrySets', toStr(entrySets));
  //console.debug('ENTRIES_FILENAME', ENTRIES_FILENAME); // entries.json
  const entries = getEntries(
    entrySets,
    DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X,
    ENTRIES_FILENAME,
    verboseLog
  );
  //console.debug('entries', entries);

  // ------------------------------------------- Entries are generated. Error reporting and verbose output:

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
      `react4xp-build-components can't continue. The sub-package react4xp-build-entriesandchunks seems to have produced malformed 'entries' data, using the entrysets above. Run the build with verbose=true in react4xp.properties for more info. Expected an object, but got ${
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
      )}). Tip: the combination of entryDirs and entryExtensions in react4xp.properties was resolved to the entrySets above. Check the content of those directories, with those file extensions. Add entry source files, adjust react4xp.properties, or run the build with verbose=true in react4xp.properties for more info.`
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
  const cacheGroups = {
    vendors: {
      name: "vendors",
      enforce: true,
      test: "[\\\\/]node_modules[\\\\/]((?!(react4xp-regions)).)[\\\\/]?",
      chunks: "all",
      priority: 100,
    },
    templates: {
      name: "templates",
      enforce: true,
      test: "[\\\\/]node_modules[\\\\/]react4xp-regions[\\\\/]?",
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
    devtool: DEVMODE ? "source-map" : false,

    entry: entries,

    externals: EXTERNALS,

    mode: BUILD_ENV,

    module: {
      rules: [
        {
          // Babel for building static assets. Excluding node_modules BUT ALLOWING node_modules/@enonic/react-components
          test: /\.((jsx?)|(es6))$/,
          exclude: /(?=.*[\\/]node_modules[\\/](?!@enonic[\\/]react-components))^(\w+)$/,
          use: {
            loader: "babel-loader",
            options: {
              compact: !DEVMODE,
              presets: ["@babel/preset-react", "@babel/preset-env"],
              plugins: [
                "@babel/plugin-transform-arrow-functions",
                "@babel/plugin-proposal-object-rest-spread",
              ],
            },
          },
        },
      ],
    }, // module


    optimization: {
      splitChunks: {
        name: false,
        cacheGroups,
      },
    },

    output: {
      path: DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, // <-- Sets the base url for plugins and other target dirs. Note the use of {{assetUrl}} in index.html (or index.ejs).
      filename: '[name].[contenthash].js',
      library: {
        name: [LIBRARY_NAME, "[name]"],
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
      new StatsPlugin(COMPONENT_STATS_FILENAME, {
        // Display the entry points with the corresponding bundles
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
      }),
    ], // plugins

    resolve: {
      extensions: [".es6", ".js", ".jsx"],
      modules: [resolve(DIR_PATH_ABSOLUTE_PROJECT, 'node_modules')]
    }
  };

  const outputConfig = overrideCallback(env, config);

  verboseLog(
    outputConfig,
    "\n-------------------- react4xp-build-components - webpack config output"
  );

  return outputConfig;
};
