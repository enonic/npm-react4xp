# react4xp-build-components

React4xp compile-time, used by a an [Enonic XP](https://developer.enonic.com/) root project.

Supplies a webpack setup that:

- Locates React JSX source files in the folder structure:
  - under `src/main/resources/site/`,
  - under `node_modules/react4xp-regions` (see [react4xp-regions](https://www.npmjs.com/package/react4xp-regions)),
  - AND as defined by `entryDirs` and `chunkDirs` in the root project's file `react4xp.properties`,
- Compiles the primary JSX source files (_entries_) and their imported dependencies (_chunks_) into JS runtime assets:
  - `build/resources/main/assets/react4xp/*`
- Content-hashes the asset names of the dependencies,
- Produces a few extra housekeeping files, used internally by React4xp at runtime
  - primarily for listing the produced entry assets, and tracking their specific dependencies with content hashes:
  - `entries.json`
  - `stats.components.json`

This webpack setup is minimal by design. If you want to replace or modify it to inject your own react-compilation rules,
plugins etc,, use `OVERRIDE_COMPONENT_WEBPACK` or `overrideComponentWebpack` (see below).

## Usage

**Not really intended for separate installation or use!** Part of
the [react4xp NPM bundle](https://www.npmjs.com/package/react4xp). Better start with
the [React4xp introduction](https://developer.enonic.com/templates/react4xp).

## API

The webpack config takes one or more CLI arguments. These are one the form of `--env X=Y`, where X is any of the _
capital-letter_ keys below (X is the parameter name, Y is the value, usually a string - but if it's an object then Y is
expected to be a valid _JSON string_)

**The usual caveat about these parameters:** these are among a set of working default values that come
from [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants), where all the parameters have the
same name as below (and are better described!). The values can be changed as parameters to react4xp-build-components,
but apart from the mandatory `REACT4XP_CONFIG_FILE`, **it's recommended to override these parameters in _
react4xp-buildconstants_ instead**. Use the same-name input parameters there. That will affect the general config file
instead of only this package's behavior, the rest is handled for you (as long as you use the gradle setup from the
starter, see for example the gradle-basic-setup section in the README
of [lib-react4xp](https://github.com/enonic/lib-react4xp)).

### react4xp.properties

First, note that in the standard setup in [the react4xp starter](https://github.com/enonic/starter-react4xp) (or similar
setups), the most commonly changed values stem directly from the `react4xp.properties` file. It's way easier to handle
these values here (but that depends on the gradle setup. If that doesn't work for you, just use them the same way, but
with the capital-letter env keys below).

- `entryDirs`: additional folder names where webpack will look for entry files.
  - Comma-separated list of folder names, relative to the react4xp root `src/main/resources/react4xp/`.
  - By default, webpack is instructed to look for JSX entries under `src/main/resources/site/` and in
    the `react4xp-regions` package - and ENTRY_DIRS is used to add more folder paths to these. Since these folder paths
    are relative, entries can also be put outside of the react4xp root if you want.
  - Rules / behavior:
    - Each JSX source file under these folders will be treated separately, as _unique react4xp entries_, and each will
      be compiled into a separate entry asset - with its own _jsxPath_ and therefore are available to XP controllers and
      react4xp.
    - Each jsxPath will be relative to its closest parent entryDir, not relative to /react4xp/.
    - These folders will be ignored when building dependency chunks (take care to avoid direct overlaps with CHUNK_DIRS)
      .

- `chunkDirs`: folder names where source code is kept, that can be imported by entries.
  - Comma-separated list of folder names, relative to the react4xp root `src/main/resources/react4xp/` (can be outside
    that root too, just avoid overlapping with ENTRY_DIRS, `src/main/resources/site/` and anything under those).
  - The idea is to group dependencies (used by the JSX entries) that belong together, or will frequently be requested
    together from the client across several entries - e.g are used in some parts of a website but not others. They are
    content-hashed and _client-side cached_ for runtime performance. By grouping your secondary, nested components (or
    frameworks, custom code, any compiled dependency) like this, you get more control over optimized asset use.
  - Rules / behavior:
    - All files under each CHUNK_DIRS folder will be bundled by webpack into a common asset: one _dependency chunk_
      for each added CHUNK_DIR.
    - Each chunk will get the same name as the folder, and a hash: `<foldername>.<contenthash>.js`.
    - Default chunk dirs are the react4xp root `src/main/resources/react4xp/`, and `node_modules`. Anything imported
      into entries from folders below these (and not specified in CHUNK_DIRS) will be chunked into the default
      chunks: `react4xp.<contenthash>.js` and `vendors.<contenthash>.js`, respectively.
    - Anything imported from _anywhere else_ (i.e not in the default folders or in CHUNK_DIRS) will not be bundled into
      a chunk, but will be compiled into the entry asset itself. Beware of this; it can increase sizes and decrease
      performance.
    - Remember that `src/main/resources/site/` is treated as a default ENTRY_DIR. Any JSX code below this folder, even
      if it's just an imported dependency, will be interpreted as an entry. Luckily, entries can import other entries,
      so this will work fine. But you won't get the chunking optimization.

- `overrideComponentWebpack`: root-project-relative path to an optional JS file that _modifies or replaces_ the webpack
  config.
  - The JS file must export a function which _may_ take an `(env, config)` arg pair, and _must_ return a webpack config
    object.
  - `env` is webpack environment
  - `config` is the webpack config object from react4xp-build-components.
  - The returned object can be a modified version of `config`, or a new webpack config object.

- `buildEnv`: "production" or "development". Actually, any other value than "production" enables dev mode. Controls
  asset uglification etc.

- `verbose`: "true", or any other value/missing for false. Produces more output during build.

### Mandatory env values

- `REACT4XP_CONFIG_FILE`: root-project-relative path to a react4xp-project constant-values JSON file.
  - This file follows the format of, and is usually produced in the project
    by, [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants).
  - The used values from it can be overriden by CLI env arguments: `SRC_R4X`, `BUILD_R4X`, `SRC_SITE`, `LIBRARY_NAME`
    , `EXTERNALS`, `COMPONENT_STATS_FILENAME`, `CHUNK_CONTENTHASH`, `ENTRIES_FILENAME`.
- `ROOT`: absolute path to the root project

### Optional env values

These are the same as the camel-case properties under react4xp.properties above:

- `OVERRIDE_COMPONENT_WEBPACK`: see `overrideComponentWebpack`
- `ENTRY_DIRS`: see `entryDirs`
- `CHUNK_DIRS`: see `chunkDirs`
- `BUILD_ENV`: see `buildEnv`
- `VERBOSE`: see `verbose`

