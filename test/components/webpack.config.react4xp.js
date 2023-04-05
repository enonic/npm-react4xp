module.exports = function(env, config) {
	config.externals = {
		...config.externals,

		// TODO: support nested object syntax, maybe even function?
		// '@mui/material': {
		// 	root: 'MaterialUI',
		// 	commonjs2: 'material-ui',
		// 	commonjs: 'material-ui',
		// 	amd: 'MaterialUI',
		// 	umd: 'MaterialUI',
		// }

		// This doesn't work MaterialUI is undefined
		//'@mui/material': 'MaterialUI',

		// This works:
		'@mui/material/Button': 'MaterialUIButton',
	}
	// This makes 'npm link' symlinks in node_modules work:
	// eslint-disable-next-line no-param-reassign
	config.resolve.symlinks = true;
	return config;
};
