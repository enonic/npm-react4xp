export enum R4X_BUILD_LOG_LEVEL {
	'QUIET' = 'QUIET', // 0
	'ERROR' = 'ERROR', // 1
	'WARN' = 'WARN', // 2
	'LIFECYCLE' = 'LIFECYCLE', // 3
	'INFO' = 'INFO', // 4
	'DEBUG' = 'DEBUG', // 5
}

export enum WEBPACK_STATS_LOG_LEVEL {
	// https://webpack.js.org/configuration/stats/#statslogging
	// https://webpack.js.org/configuration/other-options/#level
	'NONE' = 'none', // disable logging
	'ERROR' = 'error', // errors only
	'WARN' = 'warn', // errors and warnings only
	'INFO' = 'info', // errors, warnings, and info messages
	'LOG' = 'log', // errors, warnings, info messages, log messages, groups, clears. Collapsed groups are displayed in a collapsed state
	'VERBOSE' = 'verbose', // log everything except debug and trace
	// https://webpack.js.org/configuration/stats/#statsloggingdebug
	// https://webpack.js.org/configuration/stats/#statsloggingtrace
}


export default function webpackLogLevel(r4xBuildLogLevel = R4X_BUILD_LOG_LEVEL.LIFECYCLE) {
	switch (r4xBuildLogLevel) {
		case R4X_BUILD_LOG_LEVEL.QUIET:
			return WEBPACK_STATS_LOG_LEVEL.NONE; // disable logging
		case R4X_BUILD_LOG_LEVEL.ERROR: return WEBPACK_STATS_LOG_LEVEL.ERROR; // errors only
		case R4X_BUILD_LOG_LEVEL.WARN: return WEBPACK_STATS_LOG_LEVEL.WARN; // errors and warnings only
		case R4X_BUILD_LOG_LEVEL.LIFECYCLE: // default in gradle
			return WEBPACK_STATS_LOG_LEVEL.INFO; // errors, warnings, and info messages
		case R4X_BUILD_LOG_LEVEL.INFO:
			return WEBPACK_STATS_LOG_LEVEL.LOG; // errors, warnings, info messages, log messages, groups, clears. Collapsed groups are displayed in a collapsed state
		case R4X_BUILD_LOG_LEVEL.DEBUG:
			return WEBPACK_STATS_LOG_LEVEL.VERBOSE; // log everything except debug and trace
		default:
			console.warn(`Unknown log level '${r4xBuildLogLevel}' falling back to default log level 'info'`)
			return WEBPACK_STATS_LOG_LEVEL.INFO;
	}
}
