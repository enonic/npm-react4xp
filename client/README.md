# react4xp-runtime-client

Used by a an [Enonic XP](https://developer.enonic.com/) root project, builds an asset used by the browser at buildtime.

Supplies source code and a webpack setup to compile it.

## Usage

**Not really intended for separate installation or use.** Part of
the [react4xp NPM bundle](https://www.npmjs.com/package/react4xp). Better start with
the [React4xp introduction](https://developer.enonic.com/templates/react4xp).

## API: webpack build

The webpack config takes two CLI arguments, mandatory from the root project. These are one the form of `--env X=...`,
where X is any of the capital-letter keys below.

- `REACT4XP_CONFIG_FILE`: root-project-relative path to a react4xp-project constant-values JSON file.
  - This file follows the format of, and is usually produced in the project
    by, [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants).
  - The used values from it can be overriden by CLI env arguments: `BUILD_R4X`, `LIBRARY_NAME`, `BUILD_ENV`
    , `CHUNK_CONTENTHASH`, `CLIENT_CHUNKS_FILENAME`.
- `ROOT`: absolute path to the root project

## API: client runtime

In a standard react4xp setup, [lib-react4xp](https://github.com/enonic/lib-react4xp) serves the built client asset from
the service `react4xp-client`. The lib also offers `render` controller-functions, that add a call to
this `react4xp-client` URL, to the page contribution.

That client asset adds an object to the global namespace in the browser: `React4xp` (or whatever the value
of `LIBRARY_NAME` is). This object will contain the entries, under a key corresponding to their jsxPath.

In addition to those, there is `React4xp.CLIENT`, which exposes three methods. These methods are also automatically
called in the browser when using the `render` controller functions, but should you ever need them they are:

### render

This corresponds to (and calls under the hood) [ReactDOM's render](https://reactjs.org/docs/react-dom.html#render)
function:

```javascript
React4xp.CLIENT.render(Component, targetId, props, isPage, hasRegions);
```

- `Component` (string or object, mandatory): jsxPath of a react4xp entry, or a reference to that object in the React4xp
  namespace: `React4xp[jsxPath]`.
- `targetId` (string, mandatory): unique DOM id of the container where the entry will be rendered.
- `props` (serializable object, optional): top-level data used by the entry
- `isPage` (truthy/falsy, optional): truthy flags that the entry is the view of a page controller.
- `hasRegions` (truthy/falsy, optional): truthy flags that the entry contains XP regions and that CLIENT may need to
  postprocess them.

NOTE: `render` expects all necessary assets to already be loaded and run (this also happens automatically when using the
controller function `render`): the entry asset, all its dependencies
and [react/react-dom themselves](https://www.npmjs.com/package/react4xp-runtime-externals).

### hydrate

This corresponds to (and calls under the hood) [ReactDOM's hydrate](https://reactjs.org/docs/react-dom.html#hydrate)
function.

```javascript
React4xp.CLIENT.hydrate(Component, targetId, props, isPage, hasRegions);
```

It's simply the hydrate version of `React4xp.CLIENT.render` - the signature and arguments are the same.

Obviously, in addition to expecting assets to be loaded and run, it also expects an existing server-side-rendered DOM
inside the target container element. Again, this is handled by the controller function `render`.

### renderWithDependencies

This is purely a utility function for cases where the controller function `render` has _not_ already taken care of
things, but you need to render a react4xp entry from the client alone. Based on which entry or entries are requested, a
service from lib-react4xp is called to find all required assets for the entries and their dependencies, then those are
loaded, and finally `React4xp.CLIENT.render` is called for each of them.

```javascript
React4xp.CLIENT.renderWithDependencies(entriesWithTargetIdsAndProps, callback, serviceUrlRoot);
```

- `entriesWithTargetIdsAndProps` (object, mandatory): keys in this object are are entry names (string: jsxPath) and the
  values are objects with a mandatory `targetId` attribute and an optional `props` attribute - which is a regular
  serializable object of any shape. Entries are loaded on the page in the order of the entry name keys.
- `callback` (function, optional): called after the entire call chain is complete.
- `serviceUrlRoot` (string, kinda-sorta-optional): root of the URL to the lib-react4xp's services - e.g. your app.
  - For example, if they have the URLs `/_/service/my.app/react4xp/` and `/_/service/my.app/react4xp-dependencies/`,
    then `serviceRootUrl` should be `/_/service/my.app` - _without_ a trailing slash.
  - You can skip this argument ONLY IF you define the constant SERVICE_URL_ROOT in global namespace before this call.

