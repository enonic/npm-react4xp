# react4xp-npm

<img src="media/react4xp.svg" alt="React4xp logo" title="React4xp logo" width="160px">

[React4xp](https://developer.enonic.com/templates/react4xp) monorepo for the NPM dependency packages required by
both [lib-react4xp](https://github.com/enonic/lib-react4xp/) and parent projects running react4xp (for example
the [react4xp starter](https://market.enonic.com/vendors/enonic/react4xp-starter) and anything derived from it).


These packages (with this project's package names in _italics_) are:

- [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants) (_constants_)
- [react4xp-runtime-nashornpolyfills](https://www.npmjs.com/package/react4xp-runtime-nashornpolyfills) (_nashornpolyfills_)

Moved to it's own repository:

- [react4xp-regions](https://www.npmjs.com/package/react4xp-regions) (_regions_)

These packages don't need separate installation, they are bundled as dependencies of the
main [react4xp package](https://www.npmjs.com/package/react4xp) (_react4xp_).

<br/><br/>

## Usage

**Not intended for standalone installation or use.** See the docs of each unique package, in the links above.

<br/><br/>

## Development

You'll need Gradle 5+ (a 6.2.1 gradle wrapper is included), Java JDK 11, Enonic XP 7+, and Node.

Use **Node 12** for development in this project _and in all projects when using `npm link` for linking to these packages
locally_. Usually, that's when developing lib-react4xp.

Commands:
- `npm install` (or `gradlew npmInstall`): basic setup
- `npm clean`: remove npm folders
- `gradlew build`: build (includes npmInstall)
- `gradlew clean`: clean built files
- `gradlew test`: test build
- `gradlew npmLink`: for local development; testing these packages in consuming projects before releasing:
    - This runs `npm link` in all subpackages.
    - After this command, run the _/getlinks.sh_ bash script at the root (windows script is missing for now, sorry) _from the root of a consuming project (`/relative/path/getlinks.sh` etc) and **after** running `npm install` in that project.

### NPM packages
Under the _packages/_ folder are:
- one "mother packages", _react4xp_. This corresponds to the [react4xp NPM package](https://www.npmjs.com/package/react4xp).
- several subpackages.

The  _packages/react4xp_ mother package has 3 main purposes:
- It lists all _react4xp-*_ subpackages as `dependencies`, so that one version of the react4xp package imports and locks in a working combination of all the react4xp subpackages in any consuming project.
- It supplies the NPM dependencies for all the subpackages _in one place_ (*see the important part below*) so that subpackages can simply list them under `peerDependencies`.
- It supplies a few _.gradle_ files, which can be used to aid the react4xp build in a consuming project.

### IMPORTANT: NPM and maintainability

All the sub-packages mentioned above are dependencies of this main react4xp package. In addition _react4xp-buildconstants_ is a dependency of _react4xp-runtime-nashornpolyfills_:


**To avoid falling back into interdependency hell** (e.g. dependabot updating the same dependencies in different subpackages, which depend on one another and requiring a lot of extra work for maintaining!), follow these rules:

- As far as possible, none of the subpackages should _any_ `dependencies` or `devDependencies` in their _package.json_. Instead, this is handled by the _package.json_ files in the root project and _packages/react4xp/_, like this:
    - A **dependency** in a subpackage must be listed as a `peerDependency` in that package, and as a `dependency` in _packages/react4xp/packages.json_. It must also be listed in `devDependencies` (or `dependencies`) in the root project's _package.json_.
    - A **devDependency** in a subpackages must only be listed in `devDependencies` (or `dependencies`) in the root project's _package.json_.
- If **adding/removing subpackages**:
    - Update the list under `dependencies` in _packages/react4xp/package.json_.
- If a subpackage is a **dev-time dependency of another subpackage** (eg. in testing), it should be handled with symlinks (eg. to avoid that testing happens with the downloaded-from-NPM-version of the subpackage instead of actually using locally changed code).
    - [Symlink-dir](https://www.npmjs.com/package/symlink-dir) is used to automate this during dev build, in a crossplatform way and directly after `npm install`. See the `postinstall` scripts in the root _package.json_. The result should be this:
    - _All_ subpackages exist as symlinks to their folders, under _/packages/react4xp/node_modules_.
    - In addition, subpackages that are dev-time required by other subpackages, have similar symlinks under _/node_modules_.



### IMPORTANT: git

When committing to git, please follow the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)
pattern in your messages, at least use `feat:` and `BREAKING CHANGE`. Also leave tags and all versioning
to [lerna](https://github.com/lerna/lerna) with the _version_ NPM script (see below) - which depends on using git this
way.

### Terminal commands

#### NPM setup

**From the project root**, handles the entire file structure: triggers the same tasks in subprojects under /packages/,
where needed. Only sets up NPM basis, ready for [actual project building](#project-building).

- `npm run setup`: initial NPM install, run this first. When this is done, _node_modules_ have been installed across all
  subprojects, and interlinked.

- `npm run npmInstall` (or `gradlew npmInstall`): When `npm run setup` has been run once and _node_modules_ exists in
  the project root, using the `npmInstall` script updates and re-links the NPM packages but skips initial boilerplate
  setup to save a little time.

- `npm run clean`: NPM cleanup. Removes links and node_modules across all subprojects, including the project root. Does
  not clean up any files from the actual [project build](#project-building).

<a name="npm-structure"></a>

#### NPM structure

After the NPM script `npmInstall` (and `setup`, which runs it after installing boilerplate), the state is ready for
local development of this project _and_ for local development of lib-react4xp which uses all these projects - and
usually downloads them from NPM but can now use `npm link react4xp` etc for using these packages without having to
publish them to NPM before seeing them in action.

Thins ready state should be:

- All NPM packages for both main project setup _and all subprojects_ are found in _(project root)/node_modules_.
- _node_modules_ in all subpackages ar symlinked to _(project root)/node_modules_ (
  using [symlink-dir](https://www.npmjs.com/package/symlink-dir) for cross-platform symlinking).
- Each of the subprojects have their own symlink under _(project root)/node_modules_ - taking care of
  cross-dependencies.

> NOTE:
>
> This creates a **circular graph** of symlinks under _node_modules_ in the different packages. This is fine most of the time, but important to know for two reasons:
> 1. Occasionally, this will cause the error message `Maximum call stack size exceeded`, preventing further progress. If this happens, rebuild completely, in this order:
     >
- `gradlew clean`
>   - `npm run clean`
>   - `rm -rf node_modules build .gradle`
>   - `npm run setup`
>   - `gradlew build`
      >
      >     (or if these steps are hampered too, do it manually: delete _node_modules_ at root and in all packages and preferrably built files as described in each package's _package.json_, under `files`, before finally running setup and build again)
> 2. The packages must never be published with this circular graph. For this reason, the `versionAndPublish` task assumes it's at a ready-to-publish state (where everything is built and tested already: run `gradlew build test` first), and starts by wiping all these symlinks before proceding to publish.


<a name="project-building"></a>

#### Building

Again, these commands are only used **from the project root**:

- `gradlew build`: main build command: builds file structure ready for testing and publishing to NPM

- `gradlew test`: main test command

- `gradlew clean`: deletes everything built by gradle (but leaves the [NPM structure](#npm-structure) alone).

#### Publishing

- `gradlew versionAndPublish [ -Pdry ] [ -Pmessage='...' ]`: Auto-versions all changed packages, and publishes to NPM,
  after updating internal cross-dependency references. After committing your changes, run this to
  let [lerna](https://github.com/lerna/lerna) handle independent versioning in the packages, by tracking changes across
  them (use **[conventional-commit](https://www.conventionalcommits.org/en/v1.0.0/) flags** from your commit messages to
  track major:minor:patch versions), tagging the commit and auto-updating version tags everywhere. IMPORTANT: before
  running `version`, you should have run the `test` task. And after `versionAndPublish`, verify that the react4xp-*
  references in all packages/*/package-lock.json files are up-to-date (i.e. don't still refer to the previous versions
  for their dependencies). Further description in comments
  in [versionAndPublish.gradle](https://github.com/enonic/react4xp-npm/blob/master/versionAndPublish.gradle). Optional
  parameters:
  - `-Pdry`: dry-run
  - `-Pmessage='...'`: Common description of the entire release for all changed packages, will be used in commit
    messages to clarify and group the multiple commits that will occur during the process.
