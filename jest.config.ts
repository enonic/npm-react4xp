export default {
	collectCoverageFrom: [
		'src/**/*.ts'
	],

	coveragePathIgnorePatterns: [
		'/node_modules/',

		// Running coverage on untested files fails when these files are included:
		'src/client/hydrate.ts',
		'src/client/render.ts',

		'/test/',
	],

	// In order for tests to work on all files, we have to use v8 coverage provider.
	// coverageProvider: 'v8', // Changes Uncovered Lines

	// preset: 'ts-jest/presets/js-with-babel-legacy',
	// preset: 'ts-jest/presets/js-with-babel',

	// testEnvironment: 'jsdom', // Doesn't change Uncovered Lines
	testEnvironment: 'node',

	testMatch: [
		'<rootDir>/test/**/*.(spec|test).{ts,tsx}'
	],

	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'ts-jest',
			{
				// module: 'esnext', // Nope, doesn't fix test error: TS2821: Import assertions are only supported when the '--module' option is set to 'esnext' or 'nodenext'.
				tsconfig: 'test/tsconfig.json'
			}
		]
	},

	// transformIgnorePatterns: [
	// 	'/node_modules/(?!@enonic/mock-xp/src)',
	// ]
}
