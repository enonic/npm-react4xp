// Transpiles nashorn polyfill from, among other things, npm libraries.
const {
  statSync
} = require("fs");

const {
  isAbsolute,
  join,
  resolve
} = require('path');

const {
  DIR_PATH_RELATIVE_BUILD_ASSETS_R4X,
  FILE_NAME_R4X_PROPERTIES
} = require('../dist/constants.buildtime');

const {FILE_STEM_NASHORNPOLYFILLS_USERADDED} = require('../dist/constants.runtime');
const {getProperties} = require("../dist/properties/getProperties");
const {cleanAnyDoublequotes} = require('../dist/util/cleanAnyDoublequotes');
const {isSet} = require("../dist/util/isSet");
const {makeVerboseLogger} = require('../dist/util/makeVerboseLogger');


module.exports = (env) => {
  env = env || {}; // eslint-disable-line no-param-reassign

  const DIR_PATH_ABSOLUTE_PROJECT = cleanAnyDoublequotes("DIR_PATH_ABSOLUTE_PROJECT", env.DIR_PATH_ABSOLUTE_PROJECT || process.cwd());
  if (!isAbsolute(DIR_PATH_ABSOLUTE_PROJECT)) {
    throw new Error(`env.DIR_PATH_ABSOLUTE_PROJECT:${DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
  }

  const DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X);
  const FILE_PATH_ABSOLUTE_SRC_NASHORNPOLYFILLS_DEFAULT = join(__dirname, 'nashornPolyfills.es6');

  let {
    BUILD_ENV = 'production',
    NASHORNPOLYFILLS_SOURCE,
    VERBOSE = false
  } = env;
  //console.debug('BUILD_ENV', BUILD_ENV);
  //console.debug('NASHORNPOLYFILLS_SOURCE', NASHORNPOLYFILLS_SOURCE);
  //console.debug('VERBOSE', VERBOSE);

  const FILE_PATH_ABSOLUTE_R4X_PROPERTIES = join(DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_R4X_PROPERTIES);
  const stats = statSync(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
  if (stats.isFile()) {
    const properties = getProperties(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
    //console.debug('nashornPolyfills/webpack.config.js properties', properties);
    if (isSet(properties.buildEnv)) {
      BUILD_ENV = cleanAnyDoublequotes('buildEnv', properties.buildEnv);
    }
    if (isSet(properties.nashornPolyfillsSource)) {
      NASHORNPOLYFILLS_SOURCE = cleanAnyDoublequotes('nashornPolyfillsSource', properties.nashornPolyfillsSource);
    }
    if (isSet(properties.verbose)) {
      VERBOSE = cleanAnyDoublequotes('verbose', properties.verbose) !== 'false';
    }
  } // if react4xp.properties
  //console.debug('BUILD_ENV', BUILD_ENV);
  //console.debug('NASHORNPOLYFILLS_SOURCE', NASHORNPOLYFILLS_SOURCE);
  //console.debug('VERBOSE', VERBOSE);

  const verboseLog = makeVerboseLogger(VERBOSE);

  if (
    isSet(NASHORNPOLYFILLS_SOURCE) &&
    !isAbsolute(NASHORNPOLYFILLS_SOURCE)
  ) {
    NASHORNPOLYFILLS_SOURCE = join(
      DIR_PATH_ABSOLUTE_PROJECT,
      NASHORNPOLYFILLS_SOURCE
    );
  }

  verboseLog(
    `Adding custom nashorn polyfills: compiling ${NASHORNPOLYFILLS_SOURCE} --> ${join(DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, FILE_STEM_NASHORNPOLYFILLS_USERADDED)}`
  );

  const entry = {}
  if (isSet(NASHORNPOLYFILLS_SOURCE)) {
    entry[FILE_STEM_NASHORNPOLYFILLS_USERADDED] = NASHORNPOLYFILLS_SOURCE
  }

  const webpackConfigObjectNashornPolyfills = {
    entry,

    mode: BUILD_ENV,

    module: {
      rules: [
        {
          test: /\.es6$/,
          //exclude: /node_modules/,
          exclude: [ // It takes time to transpile, if you know they don't need transpilation to run in Enonic you may list them here:
    				/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
    				/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
    			],
          use: {
            loader: "babel-loader",
            options: {
              babelrc: false,
              comments: false,
              compact: BUILD_ENV !== "development",
              minified: BUILD_ENV !== "development",
              presets: [
                "@babel/preset-react",
                "@babel/preset-env"
              ],
              plugins: [
                "@babel/plugin-proposal-object-rest-spread",
                "@babel/plugin-transform-arrow-functions",
                '@babel/plugin-transform-block-scoping' // transpile 'const' and 'let to 'var'
              ],
            },
          },
        },
      ],
    }, // module

    optimization: {
  		minimize: BUILD_ENV !== "development"
  	},

    output: {
      path: DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X,

      filename: "[name].js", // No need for contenthash as this is serverside

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
      //libraryTarget: 'commonjs-module' // 7870B // ReferenceError: "module" is not defined
      libraryTarget: 'commonjs-static' // 7907B
      //libraryTarget: 'commonjs2' // 7870B // ReferenceError: "module" is not defined

      /*library: {  // 7893B Trying out what is used in buildComponents, also transpiles 'const' and 'let' to 'var'
        name: "[name]",
        type: "var",
      }*/

      // To make UMD build available on both browsers and Node.js, set output.globalObject option to 'this'.
      /*libraryTarget: 'umd', // 8111B
      globalObject: 'this'*/

      /*libraryTarget: 'umd2', // 8111B
      globalObject: 'this'*/
    }, // output

    resolve: {
      extensions: [".es6", ".js", ".jsx"],
      modules: [
        resolve(DIR_PATH_ABSOLUTE_PROJECT, 'node_modules'),
        'node_modules'
      ]
    }
  }; // webpackConfigObjectNashornPolyfills
  //console.debug('webpackConfigObjectNashornPolyfills', webpackConfigObjectNashornPolyfills);
  return webpackConfigObjectNashornPolyfills;
};
