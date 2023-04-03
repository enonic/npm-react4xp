import manifestPlugin from 'esbuild-plugin-manifest';
import { isAbsolute, join } from 'path';
// import { print } from 'q-i';
import { defineConfig, type Options } from 'tsup';
import { LIBRARY_NAME } from './src/constants.runtime';


interface MyOptions extends Options {
	env?: {
		APP_NAME?: string
		R4X_DIR_PATH_ABSOLUTE_PROJECT?: string
		LIBRARY_NAME?: string
	}
}


export default defineConfig((options: MyOptions) => {
	// print(options, { maxItems: Infinity });
	const R4X_DIR_PATH_ABSOLUTE_PROJECT = process.env.R4X_DIR_PATH_ABSOLUTE_PROJECT
	if (!R4X_DIR_PATH_ABSOLUTE_PROJECT || !isAbsolute(R4X_DIR_PATH_ABSOLUTE_PROJECT)) {
		throw new Error(`env.R4X_DIR_PATH_ABSOLUTE_PROJECT:${R4X_DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
	}

	const appName = process.env.R4X_APP_NAME;
	if (!appName) {
		throw new Error(`System environment variable $R4X_APP_NAME is required!`);
	}
	// print(appName);
	// print(LIBRARY_NAME);
	if (!options.env) {
		options.env = {};
	}
	options.env.APP_NAME = appName;
	options.env.LIBRARY_NAME = LIBRARY_NAME;
	// print(options, { maxItems: Infinity });

	return {
		entry: {
			'executor': 'src/executor.ts'
		},
		esbuildPlugins: [
			manifestPlugin({
				extensionless: 'input',
				filename: 'executor.manifest.json',
				generate: (entries) => {
					return {
						'executor.js': entries['executor']
					};
				},
				shortNames: true
			})
		],
		platform: 'browser',
		outDir: join(R4X_DIR_PATH_ABSOLUTE_PROJECT, 'build/resources/main/assets/react4xp/'),
		target: 'es2015',
		tsconfig: 'tsconfig.executor.json'
	};
});
