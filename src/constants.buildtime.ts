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

export const FILE_NAME_R4X_CONFIG_JSON = 'react4xp.config.json';
export const FILE_NAME_R4X_PROPERTIES = 'react4xp.properties';
