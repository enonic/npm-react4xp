const {print} = require("q-i");

module.exports = {
  makeVerboseLogger: (VERBOSE) => (VERBOSE)
    ? (item, label, stringify) => {
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
    },

  cleanAnyDoublequotes: (label, val) => {
    if (typeof val !== 'string') {
      return val;
    }
    if (val.startsWith('"')) {
      if (!val.endsWith('"')) {
        throw Error(
          `Inconsistent double-quote-wrapping on '${label}' value: ${JSON.stringify(
            val
          )}`
        );
      }
      return val.substring(1, val.length - 1);
    }
    if (val.endsWith('"')) {
      throw Error(
        `Inconsistent double-quote-wrapping on '${label}' value: ${JSON.stringify(
          val
        )}`
      );
    }
    return val;
  }
}
