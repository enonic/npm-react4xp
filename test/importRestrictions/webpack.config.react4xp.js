const rspack = require('@rspack/core');

module.exports = function(env, config) {
	config.module.rules = [
		...(config.module.rules || []),
		{
			test: /\.((sa|sc|c))ss$/i,
			use: [
				rspack.CssExtractRspackPlugin.loader,
				{
					loader: 'css-loader',
					options: {
						importLoaders: 1,
						modules: { auto: true }
					}
				},
				{
					loader: 'sass-loader',
					options: {
						sassOptions: {
							outputStyle: 'compressed'
						}
					}
				}
			]
		}, {
			test: /\.styl$/,
			use: [
				rspack.CssExtractRspackPlugin.loader,
				{
					loader: "css-loader",
					options: {
						importLoaders: 1,
						modules: { auto: true }
					}
				},
				{
					loader: 'stylus-loader',
					options: {
						stylusOptions: {
							compress: true
						}
					}
				}
			]
		},
	]
	config.plugins = [
		...(config.plugins || []),
		new rspack.CssExtractRspackPlugin({
			filename: '[name].css',
			chunkFilename: '[id].[contenthash:9].css'
		})
	]

	return config;
}
