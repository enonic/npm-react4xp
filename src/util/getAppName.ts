import {readFileSync, statSync} from 'fs';
import {join} from 'path';
import {parse as parsePropertiesFile} from 'properties';


export default function getAppName(dirPathAbsoluteProject: string) {
  const filePathAbsoluteGradleProperties = join(dirPathAbsoluteProject, 'gradle.properties');
  try {
    const gradePropertiesStats = statSync(filePathAbsoluteGradleProperties);
    if (!gradePropertiesStats.isFile()) {
      throw new Error(`Not a file: ${filePathAbsoluteGradleProperties}!`);
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Something went wrong while trying to read:${filePathAbsoluteGradleProperties}!`);
  }

  const gradlePropertiesString = readFileSync(filePathAbsoluteGradleProperties, {encoding: 'utf8'});

  let gradlePropertiesObject: {
    appName: string
  };
  try {
    gradlePropertiesObject = parsePropertiesFile(gradlePropertiesString);
  } catch (e) {
    console.error(e);
    throw new Error(`Something went wrong when trying to read appName from ${filePathAbsoluteGradleProperties}!`);
  }
  if (!gradlePropertiesObject.appName) {
    throw new Error(`Something went wrong when trying to read appName from ${filePathAbsoluteGradleProperties}!`);
  }
  return gradlePropertiesObject.appName;
}
