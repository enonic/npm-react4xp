# react4xp-runtime-nashornpolyfills

Supplies a webpack config for compiling a JS file intended to run through the
react4xp server-side rendering engine, polyfilling nashorn with a set of JS
functionality needed to render react on the server side.

Groundwork is laid here for developers to add more nashorn polyfilling code,
which should automatically be added to the SSR engine. This needs more testing,
might work or not - for now, regard it as a future feature.

### react4xp.properties

- `nashornPolyfillsSource`: the nashornpolyfills package supplies a standard polyfills setup. But with this parameter
  you can point to an uncompiled source file with _additional_ polyfill code. Path with file name and extension,
  relative to the root project.
