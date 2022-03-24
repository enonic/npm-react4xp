// UGLY WINDOWS FIX/HACK: normalize the sourcePath: replace all backslashes with forward-slashes.
// If it starts with 'X:\' (where X is any letter), it's fairly safe to assume it's an absolute windows path and backslashes are fair game.
// If not, it's probably impossible to know for sure that the path is not a valid POSIX path with a backslash in it?
// If so, log a warning.
export function normalizePath(pathString :string) {
  if (
    !new RegExp("^[a-zA-Z]:\\\\", "i").test(pathString) &&
    new RegExp("\\\\", "i").test(pathString)
  ) {
    console.warn(
      `Backslashes found in path (${JSON.stringify(
        pathString,
        null,
        2
      )}). Replacing with forward slashes.`
    );
  }
  return pathString.replace(/\\+/g, "/").replace(/\/+/g, "/");
}
