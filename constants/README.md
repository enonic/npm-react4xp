# react4xp-buildconstants

Supplies a script for the first step in a react4xp build: builds a JSON file with environment-specific constants that
need to be maintained and shared between buildtime and runtime.

Fetches values from the environment and has default values, so it can be used in a fire-and-forget manner. If you
need/want to mess around, or your project must be very specifically set up, these constants can be overridden. The most
stable way to do that is to set the values **in the script's input** - if possibly targeting the the basic-level
constants, not the higher-level ones that are derived by combining the basic ones.

## Usage

**Not really intended for separate installation or use.** Part of
the [react4xp NPM bundle](https://www.npmjs.com/package/react4xp). Better start with
the [React4xp introduction](https://developer.enonic.com/templates/react4xp).

## API

In Node context:

```javascript
const buildConstants = require('react4xp-buildconstants');
buildConstants(rootDir, overrides);
```

CLI context:

```
npx react4xp-buildconstants rootDir overrides
```

In both these signatures, the parameters are:

- `rootDir` (mandatory string): absolute path; the root directory of the React4XP project. Must exist.
- `overrides` (optional. JSON object, or a single JSON-parsable string): Override the value(s) of output attributes by
  adding the same key and a new value in this object. As said before, target as basic values as possible.

Keys in the `overrides` object (and the default values they'll get if not overridden) are:

- `R4X_HOME` ("react4xp"): Main source code folder, home of core (non-XP-specific) React4xp source code
- `SRC_MAIN` (derived: `rootDir` + "/src/main/resources"): Absolute base source code folder. By default, the parent
  folder of `R4X_HOME` and `SITE_SUBFOLDER`, but that's up to you.
- `R4X_TARGETSUBDIR` ("assets/react4xp"): relative target runtime folder, into which React4xp components and runtime
  stuffs are compiled. Derives `RELATIVE_BUILD_R4X`.
- `SUBFOLDER_BUILD_MAIN` ("build/resources/main"): Base pre-JAR folder for building, relative to
  rootDir. `RELATIVE_BUILD_R4X` _must_ be below this folder.
- `BUILD_ENV` ("development"): environment variable for production or development.
- `LIBRARY_NAME` ("React4xp"): name of the runtime JS library, used for calls in both the client and during serverside
  rendering.
- `SITE_SUBFOLDER` ("site"): name of the subfolder where the Enonic XP site structure is found (
  below `<SRC_MAIN>/resources/`).
- `SRC_SITE` (derived: `SRC_MAIN` + `SITE_SUBFOLDER`, should be "<rootDir>/src/main/resources/site"): absolute path to
  the folder where the XP site structure is found.
- `SRC_R4X` (derived: `SRC_MAIN` + `R4X_HOME`, usually "<rootDir>/src/main/resources/react4xp"): absolute path to the
  main react4xp source folder, home of core (non-XP-specific) React4xp source code.
- `RELATIVE_BUILD_R4X` (derived: `SUBFOLDER_BUILD_MAIN` + `R4X_TARGETSUBDIR`, usually "
  build/resources/main/assets/react4xp"): relative path to the target react4xp build folder.
- `BUILD_MAIN` (derived: `<rootDir>` + `SUBFOLDER_BUILD_MAIN`, usually "<rootDir>/build/resources/main"): absolute path
  to the main target buildtime folder (pre-JAR).
- `BUILD_R4X` (derived: `BUILD_MAIN` + `R4X_TARGETSUBDIR`, usually "<rootDir>/build/resources/main/assets/react4xp"):
  absolute path to target folder into which the React4xp core assets and all React components will be built - both
  entries and shared chunks - along with the "housekeeping files".
- `CHUNK_CONTENTHASH` (9): Content hash length in the dependency chunk filenames, sets webpack's output.chunkFilename.
  Set to something falsy to omit hashing entirely. Can also be an integer-parseable string such as "9", or a full
  webpack's output.chunkFilename setting string such as "[name].[hash:8].js".
- `SSR_LAZYLOAD` (`true`) Main switch for SSR nashorn asset lazy-loading.
- `SSR_ENGINE_SETTINGS` (`0`) [Nashorn engine settings](https://github.com/JetBrains/jdk8u_nashorn/blob/master/src/jdk/nashorn/internal/runtime/resources/Options.properties)
  for the SSR renderer. A pure number above 0 sets only caching size, changing the number X in the setting
  string `"--persistent-code-cache --class-cache-size=X"`. 0 (or less) however switches the persistent code cache and **
  all other engine settings off**, running with no caching. Can also be a non-number string to completely override the
  settings strings and add your own from scratch. `0` is chosen as the default value because this is an experimental
  java feature, and has shown signs of instability in some react4xp projects - as well as not really delivering that
  much performance gain.
- `EXTERNALS` (`{ "react": "React", "react-dom": "ReactDOM", "react-dom/server": "ReactDOMServer" }`): [webpack externals](https://webpack.js.org/configuration/externals/)
  JSON object. These are libraries you want react4xp to rely on, runtime-available in the client by these names, but _
  also_ available to other (non-react4xp) client-side code. Adding them like this makes react4xp build a
  single `externals.<contenthash>.js` chunk asset - which react4xp _also_ runs as part of the server-side rendering
  engine. The advantage to this over just using CDN's: the parent XP project gets to decide the react(-dom) versions in
  one single place, ensuring that react is kept in sync: the server alsways renders react components with the same react
  version as the client side.

Some more attributes are names for some "housekeeping files" that sync up the buildtime with the runtime. The first four
are auto-built files that summarize the dynamic output from different React4xp built steps, allowing the runtime to
handle dependencies that have hashed and unpredictable names, as well as tracing chunk dependencies for each specific
entry component...

- `CLIENT_CHUNKS_FILENAME` ("chunks.client.json"),
- `EXTERNALS_CHUNKS_FILENAME` ("chunks.externals.json"),
- `ENTRIES_FILENAME` ("entries.json"),
- `COMPONENT_STATS_FILENAME` ("stats.components.json")

The last file names are used to run code on the backend on app startup, to polyfill the nashorn engine so it can render
Server-Side React (SSR is a native function of React that is made to run on node, not nashorn - therefore some
polyfilling is needed):

- `NASHORNPOLYFILLS_SOURCE` (No default value, since lib-react4xp comes with a basic nashorn polyfill by default and
  will run the most common scenarios without anything else): used to point to an uncompiled source file with additional
  polyfill code, signalling that react4xp should compile and run this in addition to the built-in one. Path with file
  name and extension, relative to the root project (`rootDir`).
- `NASHORNPOLYFILLS_FILENAME` ("nashornPolyfills"): name of compiled output file for the extra nashorn polyfilling. No
  path or file extension, only file name.

Three more parameters can be set in the overrides object - won't change the output but adjust behavior when running:

- `outputFileName` ("react4xp_constants.json"): Running react4xp-buildconstants needs to build 2 identical versions of
  the constants file: the base file used in buildtime, and and a copy put into the predicted build folder where the
  react4xp XP runtime lib will be imported (lib-react4xp-runtime). Setting the outputFileName here lets you specify
  where the base file will be built. Path relative to the project folder, and filename.
- `verbose`: More logging when true
- `overwriteConstantsFile`: Will overwrite already existing output JSON file if true

Slashes depend on file system, should work correctly out of the box. Use your system's appropriate paths when
overriding.

## Output

A JSON file (name: see `outputFileName` above) containing an object with the final values of these attributes from
above:

```
{
        BUILD_ENV,
        LIBRARY_NAME,
        R4X_HOME, SITE_SUBFOLDER, SRC_SITE,
        R4X_TARGETSUBDIR, SRC_R4X,
        RELATIVE_BUILD_R4X, BUILD_MAIN, BUILD_R4X,
        CHUNK_CONTENTHASH,
        CLIENT_CHUNKS_FILENAME, EXTERNALS_CHUNKS_FILENAME, ENTRIES_FILENAME, COMPONENT_STATS_FILENAME,
        EXTERNALS
}
```

