// Transpiles nashorn polyfill from, among other things, npm libraries.
import type {Environment} from './index.d';


import {statSync} from 'fs';

import {
  isAbsolute,
  join,
  resolve
} from 'path';

import {
  DIR_PATH_RELATIVE_BUILD_ASSETS_R4X,
  FILE_NAME_R4X_PROPERTIES
} from './constants.buildtime';

import {FILE_STEM_NASHORNPOLYFILLS_USERADDED} from './constants.runtime';
import {getProperties} from './properties/getProperties';
import {cleanAnyDoublequotes} from './util/cleanAnyDoublequotes';
import {isSet} from './util/isSet';
import {makeVerboseLogger} from './util/makeVerboseLogger';


module.exports = (env :Environment = {}) => {
  const DIR_PATH_ABSOLUTE_PROJECT = cleanAnyDoublequotes('DIR_PATH_ABSOLUTE_PROJECT', env.DIR_PATH_ABSOLUTE_PROJECT || process.cwd());
  if (!isAbsolute(DIR_PATH_ABSOLUTE_PROJECT)) {
    throw new Error(`env.DIR_PATH_ABSOLUTE_PROJECT:${DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
  }

  const DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X = join(DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X);
  //const FILE_PATH_ABSOLUTE_SRC_NASHORNPOLYFILLS_DEFAULT = join(__dirname, 'nashornPolyfills.es6');


  const environmentObj = {
    buildEnvString: 'production',
    nashornPolyfillsSourceString: null,
    isVerbose: false
  };
  //console.debug('environmentObj', environmentObj);


  const FILE_PATH_ABSOLUTE_R4X_PROPERTIES = join(DIR_PATH_ABSOLUTE_PROJECT, FILE_NAME_R4X_PROPERTIES);
  const stats = statSync(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
  if (stats.isFile()) {
    const properties = getProperties(FILE_PATH_ABSOLUTE_R4X_PROPERTIES);
    //console.debug('nashornPolyfills/webpack.config.js properties', properties);
    if (isSet(properties.buildEnv)) {
      environmentObj.buildEnvString = cleanAnyDoublequotes('buildEnv', properties.buildEnv);
    }
    if (isSet(properties.nashornPolyfillsSource)) {
      environmentObj.nashornPolyfillsSourceString = cleanAnyDoublequotes('nashornPolyfillsSource', properties.nashornPolyfillsSource);
    }
    if (isSet(properties.verbose)) {
      environmentObj.isVerbose = cleanAnyDoublequotes('verbose', properties.verbose) !== 'false';
    }
  } // if react4xp.properties
  //console.debug('environmentObj', environmentObj);


  if (isSet(env.BUILD_ENV)) {
    environmentObj.buildEnvString = env.BUILD_ENV;
  }
  if (isSet(env.NASHORNPOLYFILLS_SOURCE)) {
    environmentObj.nashornPolyfillsSourceString = env.NASHORNPOLYFILLS_SOURCE;
  }
  if (isSet(env.VERBOSE)) {
    environmentObj.isVerbose = env.VERBOSE !== 'false';
  }
  //console.debug('environmentObj', environmentObj);


  const verboseLog = makeVerboseLogger(environmentObj.isVerbose);

  if (
    isSet(environmentObj.nashornPolyfillsSourceString) &&
    !isAbsolute(environmentObj.nashornPolyfillsSourceString)
  ) {
    environmentObj.nashornPolyfillsSourceString = join(
      DIR_PATH_ABSOLUTE_PROJECT,
      environmentObj.nashornPolyfillsSourceString
    );
  }

  verboseLog(
    `Adding custom nashorn polyfills: compiling ${environmentObj.nashornPolyfillsSourceString} --> ${join(DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X, FILE_STEM_NASHORNPOLYFILLS_USERADDED)}`
  );

  const entry = {}
  if (isSet(environmentObj.nashornPolyfillsSourceString)) {
    entry[FILE_STEM_NASHORNPOLYFILLS_USERADDED] = environmentObj.nashornPolyfillsSourceString
  }

  const webpackConfigObjectNashornPolyfills = {
    entry,

    mode: environmentObj.buildEnvString,

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
            loader: 'babel-loader',
            options: {
              babelrc: false,
              comments: false,
              compact: environmentObj.buildEnvString !== 'development',
              minified: environmentObj.buildEnvString !== 'development',
              presets: [
                '@babel/preset-react',
                '@babel/preset-env'
              ],
              plugins: [
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-transform-arrow-functions',
                '@babel/plugin-transform-block-scoping' // transpile 'const' and 'let to 'var'
              ],
            },
          },
        },
      ],
    }, // module

    optimization: {
  		minimize: environmentObj.buildEnvString !== 'development'
  	},

    output: {
      path: DIR_PATH_ABSOLUTE_BUILD_ASSETS_R4X,

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
      extensions: ['.es6', '.js', '.jsx'],
      modules: [
        resolve(DIR_PATH_ABSOLUTE_PROJECT, 'node_modules'),
        'node_modules'
      ]
    }
  }; // webpackConfigObjectNashornPolyfills
  //console.debug('webpackConfigObjectNashornPolyfills', webpackConfigObjectNashornPolyfills);
  return webpackConfigObjectNashornPolyfills;
};
