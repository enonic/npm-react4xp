module.exports = function(env, config) {
  // This makes 'npm link' symlinks in node_modules work:
  // eslint-disable-next-line no-param-reassign
  config.resolve.symlinks = true;
  return config;
};
