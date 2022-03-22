import * as propertiesReader from 'properties-reader';


export function getProperties(filePath :string) {
  const properties = propertiesReader(filePath).getAllProperties();
  //console.debug('properties', properties);
  return properties;
}
