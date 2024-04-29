import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(

	// If ignores is used without any other keys in the configuration object,
	// then the patterns act as global ignores.
	{
		// An array of glob patterns indicating the files that the configuration
		// object should not apply to. If not specified, the configuration
		// object applies to all files matched by files.
		ignores: [
			'dist/**/*.*',
			'examples/**/*.*',
			'test/**/*.*',
			'**/*.cjs',
			// 'tsup.config.client.ts',
		],
	},

	eslint.configs.recommended,
	...tseslint.configs.recommended,

	{
		// An array of glob patterns indicating the files that the configuration
		// object should apply to. If not specified, the configuration object
		// applies to all files matched by any other configuration object.
		files: [
			'./src/**/*.ts'
		],


		rules: {
			'@typescript-eslint/no-unused-vars': [
				"warn",
				{
					"argsIgnorePattern": "^_"
				}
			]
		}
	}

);
