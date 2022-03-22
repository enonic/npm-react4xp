// TODO: New general comment explanation!

/*
There is a file 'react4xp.properties' which exists at the Enonic XP application project.projectdir.

The 'react4xp.properties' file is used to build resources/main/lib/enonic/react4xp/react4xp_constants.json,
which is used by lib-react4xp during runtime.

The 'react4xp_constants.json' is also used when building components.

The 'react4xp.properties' file may define where an overrideComponentWebpack file exists.
The 'overrideComponentWebpack' file is only used when building components.
In this webpack.config.js file it's the same as OVERRIDE_COMPONENT_WEBPACK.
*/

const StatsPlugin = require("stats-webpack-plugin");

const {
  isAbsolute,
  join,
  parse,
  resolve,
  sep
} = require("path");

const {
  existsSync,
  lstatSync,
  readlinkSync,
  realpathSync,
  statSync
} = require("fs");

const {getProperties} = require("../dist/properties/getProperties");

const {
  cleanAnyDoublequotes,
  makeVerboseLogger
} = require("../util");

const React4xpEntriesAndChunks = require("./entriesandchunks");

const {
  COMPONENT_STATS_FILENAME,
  ENTRIES_FILENAME,
  LIBRARY_NAME
} = require('../dist/constants.runtime');

const {
  DIR_PATH_RELATIVE_BUILD_ASSETS_R4X,
  FILE_NAME_R4X_PROPERTIES
} = require('../dist/constants.buildtime');

// Turns a comma-separated list of subdirectories below the root React4xp source folder (SRC_R4X, usually .../resources/react4xp/)
// into an array of unique, verified, absolute-path'd and OS-compliant folder names.
// Halts on errors, displays warnings, skips items that are not found.
const normalizeDirList = (
  commaSepDirList,
  singularLabel,
  SRC_R4X,
  symlinksUnderReact4xpRoot,
  VERBOSE
) =>
  (commaSepDirList || "").trim()
    ? Array.from(
        new Set(
          commaSepDirList
            .trim()
            .replace(/[\\/]/g, sep)
            .replace(/[´`'"]/g, "")
            .split(",")

            .map((item) => (item || "").trim())
            .filter((item) => !!item)
            .map((item) => item.replace(/[\\/]$/, ""))
            .map((orig) => {
              let dir = resolve(join(SRC_R4X, orig));

              let realDir = null;
              try {
                realDir = realpathSync(dir);
              } catch (e) {
                if (VERBOSE) {
                  console.warn(
                    `Warning - error message dump for ${singularLabel} '${orig}':\n--------`
                  );
                  console.warn(e);
                }
                console.warn(
                  `${
                    VERBOSE ? "-------->" : "Warning:"
                  } skipping ${singularLabel} '${orig}' from react4xp.properties${
                    !VERBOSE
                      ? " - it probably just doesn't exist. If you're sure it exists, there may be another problem - run the build again with verbose option in react4xp.properties for full error dump"
                      : ""
                  }.`
                );
                return null;
              }

              let symlinkTargetDir = null;
              let lstat = lstatSync(dir);
              while (lstat.isSymbolicLink()) {
                symlinkTargetDir = readlinkSync(dir);
                dir = resolve(dir, "..", symlinkTargetDir);

                if (existsSync(dir)) {
                  if (dir.startsWith(SRC_R4X)) {
                    // eslint-disable-next-line no-param-reassign
                    symlinksUnderReact4xpRoot[orig] = true;
                  }
                  lstat = lstatSync(dir);
                } else {
                  throw Error(
                    `${singularLabel.replace(/^\w/, (c) =>
                      c.toUpperCase()
                    )} '${orig}' from react4xp.properties leads by resolved symlink(s) to '${dir}', which was not found.`
                  );
                }
              }

              lstat = lstatSync(realDir);
              if (!lstat.isDirectory()) {
                throw Error(
                  `Can't add ${singularLabel} '${orig}' from react4xp.properties - ${realDir} was found but is not a directory.`
                );
              }

              return realDir;
            })
            .filter((dir) => !!dir)
        )
      )
    : [];

const makeExclusionsRegexpString = (currentDir, otherDirs, verboseLog) =>
  otherDirs
    .filter((dir) => dir !== currentDir && dir.startsWith(currentDir))
    .map((dir) => dir.slice(currentDir.length))
    .map((d) => {
      let dir = d;
      if (dir.startsWith(sep)) {
        dir = dir.slice(1);
      }
      if (dir.endsWith(sep)) {
        dir = dir.slice(0, dir.length - 1);
      }
      verboseLog(`\tExcluding '${dir}' relative to '${currentDir}'`);
      return dir;
    })
    // TODO: escape characters in folder names that actually are regexp characters
    .join("|")
    .trim();

// -------------------------------------------------------------

module.exports = (env = {}) => {
  const DIR_PATH_ABSOLUTE_PROJECT = cleanAnyDoublequotes("DIR_PATH_ABSOLUTE_PROJECT", env.DIR_PATH_ABSOLUTE_PROJECT || process.cwd());
  if (!isAbsolute(DIR_PATH_ABSOLUTE_PROJECT)) {
    throw new Error(`env.DIR_PATH_ABSOLUTE_PROJECT:${DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
  }

  const DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X);

  let overrideComponentWebpack;
  const FILE_PATH_ABSOLUTE_R4X_PROPERTIES = join(DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_R4X_PROPERTIES);
  const stats = statSync(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
  if (stats.isFile()) {
    const properties = getProperties(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
    if (!isAbsolute(properties.overrideComponentWebpack)) {
      properties.overrideComponentWebpack = join(DIR_PATH_ABSOLUTE_PROJECT, properties.overrideComponentWebpack);
    }
    overrideComponentWebpack = properties.overrideComponentWebpack;

    /*if (!isAbsolute(properties.masterConfigFileName)) {
      properties.masterConfigFileName = join(DIR_PATH_ABSOLUTE_PROJECT, properties.masterConfigFileName);
    }
    console.debug('properties', properties);*/
  }

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const react4xpConfig = require(
    isAbsolute(env.REACT4XP_CONFIG_FILE)
      ? env.REACT4XP_CONFIG_FILE
      : join(DIR_PATH_ABSOLUTE_PROJECT, env.REACT4XP_CONFIG_FILE)
    );

  const {
    SRC_R4X,
    BUILD_ENV,
    SRC_SITE,
    EXTERNALS
  } = react4xpConfig

  const DEVMODE = BUILD_ENV !== "production";

  const VERBOSE = `${env.VERBOSE || ""}`.trim().toLowerCase() === "true";
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

  let symlinksUnderReact4xpRoot = {};

  const chunkDirs = normalizeDirList(
    env.CHUNK_DIRS,
    "chunkDir",
    SRC_R4X,
    symlinksUnderReact4xpRoot,
    VERBOSE
  );

  const entryDirs = normalizeDirList(
    env.ENTRY_DIRS,
    "entryDir",
    SRC_R4X,
    symlinksUnderReact4xpRoot,
    VERBOSE
  );

  verboseLog(env.CHUNK_DIRS, "\n\n---\nenv.CHUNK_DIRS", 1);
  verboseLog(chunkDirs, "--> chunkDirs", 1);
  verboseLog(env.ENTRY_DIRS, "\n\n---\nenv.ENTRY_DIRS", 1);
  verboseLog(entryDirs, "--> entryDirs", 1);
  verboseLog("---\n");

  // -----------------------------------------------------------  Catching some likely troublemakers:

  symlinksUnderReact4xpRoot = Object.keys(symlinksUnderReact4xpRoot).filter(
    (key) => !!symlinksUnderReact4xpRoot[key]
  );
  if (symlinksUnderReact4xpRoot.length) {
    console.warn(
      `Warning: ${
        symlinksUnderReact4xpRoot.length
      } chunkDir(s) / entryDir(s) in react4xp.properties are symlinks that lead inside the folder structure below the React4xp root (${SRC_R4X}). This could cause a mess in React4xp's entry/chunk structure, so I hope you know what you're doing. These are: '${symlinksUnderReact4xpRoot.join(
        "', '"
      )}'`
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

  const siteParsed = parse(SRC_SITE);
  const tooGeneralPaths = SRC_SITE.split(sep).reduce((accum, current) => {
    const longestPath = accum.slice(-1)[0];
    if (longestPath === undefined) {
      return [siteParsed.root];
    }
    const dir = resolve(longestPath, current);
    if (dir !== SRC_SITE) {
      accum.push(dir);
    }
    return accum;
  }, []);

  const badChunkDirs = chunkDirs.filter(
    (dir) =>
      dir === SRC_SITE ||
      dir.startsWith(SRC_SITE) ||
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
  const entryExtensions = (env.ENTRY_EXT || "jsx,tsx,js,ts,es6,es")
    .trim()
    .replace(/[´`'"]/g, "")
    .split(",")
    .map((ext) => ext.trim())
    .map((ext) => ext.replace(/^\./, ""))
    .filter((ext) => !!ext);

  // Build the entries
  const entrySets = [
    {
      //sourcePath: SRC_SITE,
      //sourcePath: `./${SRC_SITE}`, // Relative
      sourcePath: resolve(process.cwd(), SRC_SITE), // Absolute
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

  //console.debug('entrySets', entrySets);
  //console.debug('ENTRIES_FILENAME', ENTRIES_FILENAME); // entries.json
  const entries = React4xpEntriesAndChunks.getEntries(
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
    SRC_R4X,
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
      test: `${SRC_R4X}${
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
        .slice(SRC_R4X.length)
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
    mode: BUILD_ENV,

    entry: entries,

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
    },

    resolve: {
      extensions: [".es6", ".js", ".jsx"]
    },

    devtool: DEVMODE ? "source-map" : false,

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
    },

    externals: EXTERNALS,

    optimization: {
      splitChunks: {
        name: false,
        cacheGroups,
      },
    },

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
    ],
  };

  const outputConfig = overrideCallback(env, config);

  verboseLog(
    outputConfig,
    "\n-------------------- react4xp-build-components - webpack config output"
  );

  return outputConfig;
};
