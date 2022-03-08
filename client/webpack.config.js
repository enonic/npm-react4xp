// Webpack for transpiling React4xp "frontend core":
// The React4xp (not-third-party) core functionality for running in the client,
// necessary for components to run/render.

/* global __filename, process, __dirname */

const path = require('path');
const {makeVerboseLogger, cleanAnyDoublequotes} = require("../util");

const Chunks2json = require('chunks-2-json-webpack-plugin');
const webpack = require('webpack');


module.exports = env => {
  env = env || {};

  const overridden = (Object.keys(env).length !== 1 && Object.keys(env)[0] !== "REACT4XP_CONFIG_FILE");

  // Gets the following constants from the config file UNLESS they are overridden by an env parameter, which takes priority:
  const {
    BUILD_R4X, LIBRARY_NAME, BUILD_ENV, CHUNK_CONTENTHASH, CLIENT_CHUNKS_FILENAME, VERBOSE,

  } = Object.assign(
    {},
    env,
    env.REACT4XP_CONFIG_FILE ?
      require(path.join(process.cwd(), env.REACT4XP_CONFIG_FILE)) :
      {}
  );

  const verboseLog = makeVerboseLogger(VERBOSE);

  // Optional root from which to look for node_modules
  const ROOT = cleanAnyDoublequotes("ROOT", env.ROOT || __dirname);
  verboseLog(ROOT, "ROOT", 1);

  const buildR4X = cleanAnyDoublequotes("BUILD_R4X", BUILD_R4X);
  verboseLog(buildR4X, "buildR4X", 1);

  const libraryName = cleanAnyDoublequotes("LIBRARY_NAME", LIBRARY_NAME);
  verboseLog(libraryName, "libraryName", 1);

  if (overridden) {
    verboseLog({
      buildR4X, libraryName, BUILD_ENV, CHUNK_CONTENTHASH, CLIENT_CHUNKS_FILENAME, ROOT,
    }, "Client build config overridden at " + __filename, 1);
  }

  // Decides whether or not to hash filenames of the produced asset, and the length of the hash
  const chunkFileName = (!CHUNK_CONTENTHASH) ?
    "[name].js" :
    isNaN(CHUNK_CONTENTHASH) ?
      CHUNK_CONTENTHASH :
      `[name].[contenthash:${parseInt(CHUNK_CONTENTHASH)}].js`;

  const outputConfig = {
    mode: BUILD_ENV,

    entry: {
      'react4xpClient': path.join(__dirname, 'react4xpClient.es6'),
    },

    output: {
      path: buildR4X,  // <-- Sets the base url for plugins and other target dirs.
      filename: chunkFileName,
      library: {
        name: [libraryName, 'CLIENT'],
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
      modules: [path.resolve(ROOT, "node_modules")],
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
      new Chunks2json({outputDir: buildR4X, filename: CLIENT_CHUNKS_FILENAME}),
      new webpack.DefinePlugin({
        LIBRARY_NAME: JSON.stringify(libraryName),
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
