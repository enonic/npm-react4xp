// Webpack for transpiling React4xp "frontend core":
// The React4xp (not-third-party) core functionality for running in the client,
// necessary for components to run/render.

/* global __filename, process, __dirname */

const path = require('path');
const {
  CLIENT_CHUNKS_FILENAME,
  LIBRARY_NAME
} = require('../dist/constants.runtime');
const {
  DIR_PATH_RELATIVE_BUILD_ASSETS_R4X
} = require('../dist/constants.buildtime');
const {makeVerboseLogger, cleanAnyDoublequotes} = require("../util");

const Chunks2json = require('chunks-2-json-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const webpack = require('webpack');


module.exports = env => {
  env = env || {};
  //console.debug('env', env);

  const DIR_PATH_ABSOLUTE_PROJECT = cleanAnyDoublequotes("DIR_PATH_ABSOLUTE_PROJECT", env.DIR_PATH_ABSOLUTE_PROJECT || process.cwd());
  if (!path.isAbsolute(DIR_PATH_ABSOLUTE_PROJECT)) {
    throw new Error(`env.DIR_PATH_ABSOLUTE_PROJECT:${DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
  }

  const DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X = path.join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X);

  const overridden = (Object.keys(env).length !== 1 && Object.keys(env)[0] !== "REACT4XP_CONFIG_FILE");
  //console.debug('overridden', overridden);

  // Gets the following constants from the config file UNLESS they are overridden by an env parameter, which takes priority:
  const {
    BUILD_ENV, VERBOSE
  } = Object.assign(
    {},
    env,
    env.REACT4XP_CONFIG_FILE ?
      require(path.isAbsolute(env.REACT4XP_CONFIG_FILE)
        ? env.REACT4XP_CONFIG_FILE
        : path.join(DIR_PATH_ABSOLUTE_PROJECT, env.REACT4XP_CONFIG_FILE)) :
      {}
  );
  //console.debug('BUILD_ENV', BUILD_ENV);
  //console.debug('VERBOSE', VERBOSE);

  const verboseLog = makeVerboseLogger(VERBOSE);

  verboseLog(DIR_PATH_ABSOLUTE_PROJECT, "DIR_PATH_ABSOLUTE_PROJECT", 1);

  verboseLog(DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, "DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X", 1);

  verboseLog(LIBRARY_NAME, "LIBRARY_NAME", 1);

  if (overridden) {
    verboseLog({
      DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X,
      LIBRARY_NAME,
      BUILD_ENV,
      CLIENT_CHUNKS_FILENAME,
      DIR_PATH_ABSOLUTE_PROJECT,
    }, "Client build config overridden at " + __filename, 1);
  }

  const outputConfig = {
    mode: BUILD_ENV,

    entry: {
      'react4xpClient': path.join(__dirname, 'react4xpClient.es6'),
    },

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
    },

    resolve: {
      extensions: ['.es6', '.js', '.jsx'],
      modules: [path.resolve(DIR_PATH_ABSOLUTE_PROJECT, 'node_modules')],
    },
    devtool: (BUILD_ENV === 'production') ? false : 'source-map',
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
    },

    // TODO: Replace hardcoded values with EXTERNALS from buildconstants!
    externals: {
      "react": "React",
      "react-dom": "ReactDOM",
      "react-dom/server": "ReactDOMServer",
    },

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
    ],
  };

  verboseLog(outputConfig, "Client build output config", 1);

  return outputConfig;
};
