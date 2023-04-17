import manifestPlugin from 'esbuild-plugin-manifest';
import { isAbsolute, join } from 'path';
// import { print } from 'q-i';
import { defineConfig, type Options } from 'tsup';
import { DIR_PATH_RELATIVE_BUILD_ASSETS_R4X } from './src/constants.buildtime';
import { LIBRARY_NAME } from './src/constants.runtime';
import { camelize } from './src/util/camelize';
import { ucFirst } from './src/util/ucFirst';


interface MyOptions extends Options {
	env?: {
		R4X_APP_NAME?: string
		R4X_CLIENT_NAME?: string
		R4X_DIR_PATH_ABSOLUTE_PROJECT?: string
		R4X_LIBRARY_NAME?: string
	}
}


export default defineConfig((options: MyOptions) => {
	// print(options, { maxItems: Infinity });
	const R4X_DIR_PATH_ABSOLUTE_PROJECT = process.env.R4X_DIR_PATH_ABSOLUTE_PROJECT
	if (!R4X_DIR_PATH_ABSOLUTE_PROJECT || !isAbsolute(R4X_DIR_PATH_ABSOLUTE_PROJECT)) {
		throw new Error(`env.R4X_DIR_PATH_ABSOLUTE_PROJECT:${R4X_DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
	}

	if (!process.env.R4X_APP_NAME) {
		throw new Error(`System environment variable $R4X_APP_NAME is required!`);
	}
	// print(appName);
	// print(LIBRARY_NAME);
	if (!options.env) {
		options.env = {};
	}
	options.env.R4X_APP_NAME = process.env.R4X_APP_NAME;
	options.env.R4X_LIBRARY_NAME = `${ucFirst(camelize(process.env.R4X_APP_NAME,/\./g))}${LIBRARY_NAME}`;
	options.env.R4X_CLIENT_NAME = `${options.env.R4X_LIBRARY_NAME}Client`;
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
		outDir: join(R4X_DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X),
		target: 'es2015',
		tsconfig: 'tsconfig.executor.json'
	};
});
