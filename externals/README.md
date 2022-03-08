# react4xp-runtime-externals

Part of the [react4xp NPM bundle](https://www.npmjs.com/package/react4xp). **Not really meant for separate installation
or use.**
Better start with the [React4xp introduction](https://developer.enonic.com/templates/react4xp).

## Introduction

### About webpack externals

[Webpack externals](https://webpack.js.org/configuration/externals/) is a way to keep certain dependencies out of
compilation, putting them aside and telling compiled code that it can expect (the results from) those dependencies to be
available in global namespace at runtime.

Take for example, a collection of react component source files (which all could start with `import React from 'react`).
By compiling them with a webpack config that has an attribute `externals: {"react": "React"},` the compiler will _not_
compile React into the output JS, and won't throw a tantrum if react isn't available from node_modules. That way, the
final web page can import react from outside the bundle, from a CDN - or similar.

### What does this package do?

This is an example of that _"or similar"_ part. `react4xp-runtime-externals` supplies a webpack config for compiling a
JS bundle that _only_ consists of the dependencies that are marked as externals.

By default, the react4xp externals are **react** and **react-dom**. This is tweakable, controlled by the `EXTERNALS`
attribute/parameter in [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants).

So basically, running the compiled output bundle in a browser is equivalent to getting react/react-dom from a CDN. But
in addition, this package plugs into the backend flow of react4xp, supplying necessary externals to the server-side
rendering engine.

Note that **this package does not supply built-in react or react-dom!** By design, it's expected to be used by a root
react4xp project that supplies those by itself.

### Why not just use a CDN?

For a purely client-side react app in XP, you probably could. It should be as easy as skipping this package in the
setup.

But getting the backend SSR engine to run react/react-dom is _much_ easier with this package than setting it up
yourself. And more importantly: the parent XP project gets to decide the react/react-dom versions for the backend and
the frontend, defined in one single place (`package.json`). This ensures that react is kept in sync: the server always
renders react components with the same react version as the client side. And since react is only imported in one place,
some errors are prevented that may occur when different _instances_ of react/react-dom are accidentally used at once.

## API and context

The parent project using this package will run the `webpack.config.js` supplied here, and is expected to supply its own
versions of the packages in the `EXTERNALS` object - by default react and react-dom.

Since `react4xp-runtime-externals` are only declaring react and react-dom as peerDependencies, the parent project gets
to decide the used versions in its `package.json`.

The webpack config takes one or more CLI arguments. These are one the form of `--env X=Y`, where X is any of the _
capital-letter_ keys below (X is the parameter name, Y is the value, usually a string - but if it's an object then Y is
expected to be a valid _JSON string_)

**The usual caveat about these parameters:** these are among a set of working default values that come
from [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants), where all the parameters have the
same name as below (and are better described!). The values can be changed as parameters to react4xp-runtime-externals,
but apart from the mandatory `REACT4XP_CONFIG_FILE`, **it's recommended to override these parameters in _
react4xp-buildconstants_ instead**. Use the same-name input parameters there. That will affect the general config file
instead of only this package's behavior, the rest is handled for you (as long as you use the gradle setup from the
starter, see for example the gradle-basic-setup section in the README
of [lib-react4xp](https://github.com/enonic/lib-react4xp)).

### Webpack parameters

- `REACT4XP_CONFIG_FILE` is a mandatory webpack CLI argument: the name of a shared general react4xp config file.

- `EXTERNALS` is the main point of interest. By react4xp's default it looks like this:
  ```json
      {
        "react": "React",
        "react-dom": "ReactDOM",
        "react-dom/server": "ReactDOMServer"
      }
  ```
  ...where the objects are import source names in JS and the values are their name in the global namespace after
  importing (e.g. the familiar `import React from 'react'`).

- `EXTERNALS_CHUNKS_FILENAME` and `CHUNK_CONTENTHASH`: results in the output asset file
  name `externals.<contenthash>.js`.

### Output

Produces a JS asset: `build/resources/main/assets/react4xp/externals.<contenthash>.js`.

This is used both by the serverside and clientside renderer (and since it creates `React` and `ReactDOM` in the client's
namespace, other non-react4xp components can also use it - no need for an additional CDN). When using `render`
from `lib-react4xp`, this is automatically handled.

Content-hashed for caching and cache-busting, and also produces a housekeeping JSON file that lets the runtime know the
hashed name of the asset.
