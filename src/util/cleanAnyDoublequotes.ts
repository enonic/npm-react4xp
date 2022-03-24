export function cleanAnyDoublequotes(
  label :string,
  val :string
) {
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
