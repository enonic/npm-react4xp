import {R4X_TARGETSUBDIR} from './constants.runtime';

export const DIR_PATH_RELATIVE_SRC_MAIN_RESOURCES = 'src/main/resources';
export const DIR_PATH_RELATIVE_SRC_R4X = `${DIR_PATH_RELATIVE_SRC_MAIN_RESOURCES}/react4xp`;
export const DIR_PATH_RELATIVE_SRC_SITE = `${DIR_PATH_RELATIVE_SRC_MAIN_RESOURCES}/site`;

export const DIR_PATH_RELATIVE_BUILD_RESOURCES_MAIN = 'build/resources/main';

export const DIR_PATH_RELATIVE_BUILD_ASSETS_R4X = `${DIR_PATH_RELATIVE_BUILD_RESOURCES_MAIN}/${R4X_TARGETSUBDIR}`;

export const EXTERNALS_DEFAULT = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/server': 'ReactDOMServer',
};

export const FILE_NAME_R4X_CONFIG_JS = 'react4xp.config.js';
export const FILE_NAME_R4X_NASHORN_POLYFILLS = 'react4xpNashornPolyfills.es6';
export const FILE_NAME_WEBPACK_CONFIG_R4X_JS = 'webpack.config.react4xp.js';
