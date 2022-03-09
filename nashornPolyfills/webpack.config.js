// Transpiles nashorn polyfill from, among other things, npm libraries.

const path = require("path");
const { makeVerboseLogger, cleanAnyDoublequotes } = require("../util");

module.exports = (env) => {
  env = env || {}; // eslint-disable-line no-param-reassign

  let { BUILD_R4X } = env;
  let BUILD_ENV = env.BUILD_ENV || "production";
  let { NASHORNPOLYFILLS_FILENAME } = env;
  let { verbose } = env;

  let { NASHORNPOLYFILLS_SOURCE } = env; // || path.join(__dirname, 'nashornPolyfills.es6');

  if (env.REACT4XP_CONFIG_FILE) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const config = require(path.join(
        process.cwd(),
        env.REACT4XP_CONFIG_FILE
      ));
      BUILD_R4X = BUILD_R4X || config.BUILD_R4X;
      BUILD_ENV = BUILD_ENV || config.BUILD_ENV;
      NASHORNPOLYFILLS_SOURCE =
        NASHORNPOLYFILLS_SOURCE || config.NASHORNPOLYFILLS_SOURCE;
      NASHORNPOLYFILLS_FILENAME = config.NASHORNPOLYFILLS_FILENAME;
      verbose = verbose || config.verbose;
    } catch (e) {
      console.error(e);
    }
  }

  const verboseLog = makeVerboseLogger(verbose);

  if (`${NASHORNPOLYFILLS_SOURCE || ""}`.trim() === "") {
    throw Error(
      `react4xp-runtime-nashornpolyfills: no source filename is set (NASHORNPOLYFILLS_SOURCE). Check react4xp-runtime-nashornpolyfills build setup, for env parameters${
        env.REACT4XP_CONFIG_FILE
          ? ` or in the master config file (${env.REACT4XP_CONFIG_FILE}, usually built by react4xp-buildconstants)`
          : ""
      }.`
    );
  }

  BUILD_R4X = cleanAnyDoublequotes("BUILD_R4X", BUILD_R4X);

  if (`${BUILD_R4X || ""}`.trim() === "") {
    throw Error(
      `Can't build nashorn polyfills from source (${NASHORNPOLYFILLS_SOURCE}): missing build path (BUILD_R4X). Check react4xp-runtime-nashornpolyfills build setup, for env parameters${
        env.REACT4XP_CONFIG_FILE
          ? ` or in the master config file (${env.REACT4XP_CONFIG_FILE}, usually built by react4xp-buildconstants)`
          : ""
      }.`
    );
  }

  if (`${NASHORNPOLYFILLS_FILENAME || ""}`.trim() === "") {
    throw Error(
      `Can't build nashorn polyfills from source (${NASHORNPOLYFILLS_SOURCE}): missing target filename (NASHORNPOLYFILLS_FILENAME). Check react4xp-runtime-nashornpolyfills build setup, for env parameters${
        env.REACT4XP_CONFIG_FILE
          ? ` or in the master config file (${env.REACT4XP_CONFIG_FILE}, usually built by react4xp-buildconstants)`
          : ""
      }.`
    );
  }

  verboseLog(
    `Adding custom nashorn polyfills: compiling ${path.join(
      process.cwd(),
      NASHORNPOLYFILLS_SOURCE
    )} --> ${path.join(BUILD_R4X, NASHORNPOLYFILLS_FILENAME)}`
  );

  return {
    mode: BUILD_ENV,

    entry: {
      [NASHORNPOLYFILLS_FILENAME]: path.join(
        process.cwd(),
        NASHORNPOLYFILLS_SOURCE
      ),
    },
    optimization: {
  		minimize: BUILD_ENV !== "development"
  	},
    output: {
      path: BUILD_R4X,
      filename: "[name].js",
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
      //libraryTarget: 'commonjs-static' // 7907B
      //libraryTarget: 'commonjs2' // 7870B // ReferenceError: "module" is not defined

      library: {  // 7893B Trying out what is used in buildComponents, also transpiles 'const' and 'let' to 'var'
        name: "[name]",
        type: "var",
      }

      // To make UMD build available on both browsers and Node.js, set output.globalObject option to 'this'.
      /*libraryTarget: 'umd', // 8111B
      globalObject: 'this'*/

      /*libraryTarget: 'umd2', // 8111B
      globalObject: 'this'*/
    },

    resolve: {
      extensions: [".es6", ".js", ".jsx"],
    },
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
    },
  };
};
