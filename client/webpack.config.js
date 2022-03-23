// Webpack for transpiling React4xp "frontend core":
// The React4xp (not-third-party) core functionality for running in the client,
// necessary for components to run/render.

/* global __filename, process, __dirname */

const {
  statSync
} = require('fs');

const {
  isAbsolute,
  join,
  resolve
} = require('path');

const {
  CLIENT_CHUNKS_FILENAME,
  LIBRARY_NAME
} = require('../dist/constants.runtime');
const {
  DIR_PATH_RELATIVE_BUILD_ASSETS_R4X,
  EXTERNALS_DEFAULT,
  FILE_NAME_R4X_CONFIG_JSON,
  FILE_NAME_R4X_PROPERTIES
} = require('../dist/constants.buildtime');
const {getProperties} = require("../dist/properties/getProperties");
const {isSet} = require("../dist/util/isSet");
const {makeVerboseLogger, cleanAnyDoublequotes} = require("../util");

const Chunks2json = require('chunks-2-json-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const webpack = require('webpack');


module.exports = env => {
  env = env || {};
  //console.debug('env', env);

  const DIR_PATH_ABSOLUTE_PROJECT = cleanAnyDoublequotes("DIR_PATH_ABSOLUTE_PROJECT", env.DIR_PATH_ABSOLUTE_PROJECT || process.cwd());
  if (!isAbsolute(DIR_PATH_ABSOLUTE_PROJECT)) {
    throw new Error(`env.DIR_PATH_ABSOLUTE_PROJECT:${DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
  }

  const DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X);

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

  let {
    BUILD_ENV = 'production',
    VERBOSE = false
  } = env;
  console.debug('BUILD_ENV', BUILD_ENV);
  console.debug('VERBOSE', VERBOSE);

  const FILE_PATH_ABSOLUTE_R4X_PROPERTIES = join(DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_R4X_PROPERTIES);
  const r4xPropertiesStats = statSync(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
  if (r4xPropertiesStats.isFile()) {
    const properties = getProperties(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
    //console.debug('properties', properties);

    if (isSet(properties.buildEnv)) {
      BUILD_ENV = cleanAnyDoublequotes('buildEnv', properties.buildEnv);
    }

    if (isSet(properties.verbose)) {
      VERBOSE = cleanAnyDoublequotes('verbose', properties.verbose) !== 'false';
    }
  } // if FILE_NAME_R4X_PROPERTIES
  console.debug('BUILD_ENV', BUILD_ENV);
  console.debug('VERBOSE', VERBOSE);

  const verboseLog = makeVerboseLogger(VERBOSE);

  verboseLog(DIR_PATH_ABSOLUTE_PROJECT, "DIR_PATH_ABSOLUTE_PROJECT", 1);

  verboseLog(DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, "DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X", 1);

  const outputConfig = {
    devtool: (BUILD_ENV === 'production') ? false : 'source-map',

    entry: {
      'react4xpClient': join(__dirname, 'react4xpClient.es6'),
    },

    externals: EXTERNALS,

    mode: BUILD_ENV,

    module: {
      rules: [
        {
          // Babel for building static assets
          test: /\.es6$/,
          exclude: /[\\/]node_modules[\\/]/,
          use: {
            loader: 'babel-loader',
            options: {
              compact: (BUILD_ENV === 'production'),
              presets: [
                "@babel/preset-react",
                "@babel/preset-env",
              ],
              plugins: [
                "@babel/plugin-transform-arrow-functions",
                "@babel/plugin-proposal-object-rest-spread",
              ],
            },
          },
        },
      ],
    }, // module

    output: {
      path: DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X,  // <-- Sets the base url for plugins and other target dirs.
      filename: '[name].[contenthash].js',
      library: {
        name: [LIBRARY_NAME, 'CLIENT'],
        type: 'var',
      },
      globalObject: 'window',
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
      new FileManagerPlugin({
        events: {
          onStart: {
            mkdir: [
              DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X // Chunks2json fails without this (when using npm explore)
            ]
          }
        }
      }),
      new Chunks2json({
        outputDir: DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X,
        filename: CLIENT_CHUNKS_FILENAME
      }),
      new webpack.DefinePlugin({
        LIBRARY_NAME,
        DEVMODE_WARN_AGAINST_CLIENTRENDERED_REGIONS: BUILD_ENV === 'production' ?
          '' :
          '\nregionPathsPostfilled.push(component.path);\n' +
          'if (!regionsRemaining[regionName] && regionPathsPostfilled.length) {\n' +
          '\tconsole.warn(`React4xp postfilled ${regionPathsPostfilled.length} component(s) because a region-containing ' +
          'React4xp entry was client-side rendered from an XP controller. Path(s): ' +
          '${JSON.stringify(regionPathsPostfilled.join(", "))}.\\n' +
          '\\nNOTE: This version of React4xp and/or XP don\'t support XP components that need page contributions inside ' +
          'client-rendered Regions. This includes React4xp entries in parts, etc. For now, avoid using React4xp client-side-' +
          'rendering for entries with Regions, or avoid inserting XP components that need page contributions to work into ' +
          'those Regions.\\n\\n' +
          'See: https://github.com/enonic/lib-react4xp/issues/38`);\n}',
      }),
    ], // plugins

    resolve: {
      extensions: ['.es6', '.js', '.jsx'],
      modules: [resolve(DIR_PATH_ABSOLUTE_PROJECT, 'node_modules')]
    }
  };

  verboseLog(outputConfig, "Client build output config", 1);

  return outputConfig;
};
