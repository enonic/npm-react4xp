# react4xp-runtime-nashornpolyfills

Supplies a JS file intended to run through the react4xp server-side rendering engine, polyfilling nashorn with a set of
JS functionality needed to render react on the server side. Also supplies a webpack config for compiling this JS file to
the location expected by the react4xp runtime.

Groundwork is laid here for developers to add more nashorn polyfilling code, which should automatically be added to the
SSR engine. This needs more testing, might work or not - for now, regard it as a future feature.

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
same name as below (and are better described!). The values can be changed as parameters to
react4xp-runtime-nashornpolyfills, but apart from the mandatory `REACT4XP_CONFIG_FILE`, **it's recommended to override
these parameters in _react4xp-buildconstants_ instead**. Use the same-name input parameters there. That will affect the
general config file instead of only this package's behavior, the rest is handled for you (as long as you use the gradle
setup from the starter, see for example the gradle-basic-setup section in the README
of [lib-react4xp](https://github.com/enonic/lib-react4xp)).

### Parameters

See the caveat above, but if you want to override any parameters locally to this package, these are:

- `REACT4XP_CONFIG_FILE`: mandatory webpack CLI argument: the name of a shared general react4xp config file.

- `BUILD_R4X`: absolute path to target folder into which the nashorn-polyfills assets will be compiled along with other
  react4xp assets - and where the runtime will be looking for them.

- `NASHORNPOLYFILLS_SOURCE`: the nashornpolyfills package supplies a standard polyfills setup. But with this parameter
  you can point to an uncompiled source file with _additional_ polyfill code. Path with file name and extension,
  relative to the root project.

- `NASHORNPOLYFILLS_FILENAME`: name of compiled output file for the additional nashorn polyfilling. No path or file
  extension, only file name.
