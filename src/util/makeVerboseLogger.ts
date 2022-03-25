import {print} from 'q-i';


export const makeVerboseLogger = (VERBOSE :boolean) => (VERBOSE)
  ? (
    item :unknown,
    label? :string,
    stringify :boolean|number = false
  ) => {
    if (typeof item === 'object') {
      if (label) {
        console.log(label + ":");
      }
      print(item, {maxItems: Infinity});

    } else if (stringify) {
      console.log((label ? label + " " : "") + "(" + (typeof item) + "): " + JSON.stringify(item));
    } else {
      console.log((label ? label + ": " : "") + item);
    }
  }
  : () => {
  }
