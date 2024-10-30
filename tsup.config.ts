import { defineConfig } from 'tsup';

export default defineConfig(() => ({
	bundle: true,
	entry: [
		'src/constants.buildtime.ts',
		'src/constants.runtime.ts',
		'src/index.ts',
		'src/webpack.config.components.ts',
		'src/webpack.config.globals.ts',
		'src/webpack.config.nashornPolyfills.ts'
	],
	format: [
		'cjs',
		// Even though rspack supports ESM, getting everything working is too much work, if even possible.
		// 'esm' // __dirname and __filename are not defined in ES modules
	],
	noExternal: [
		'globby', // Make sure this EcmaScript module is included in the commonjs bundle
	],
	platform: 'node',
	outDir: 'dist',
	target: 'ES2015',
	splitting: false, // Default is true
	tsconfig: './tsconfig.dist.json',
}));
