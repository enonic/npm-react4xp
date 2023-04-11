module.exports = {
	chunkDirs: [
		'aChunkDirInsideReact4xpDir',
		'../aChunkDirOutsideReact4xpDir'
	],
	entryDirs: [
		'anEntryDirInsideR4xDir',
		'../anEntryDirOutsideR4xDir'
	],
	// Since jquery is only listed under externals and not globals,
	// it should not be bundled anywhere (globals nor vendors).
	externals: {
		jquery: 'jQuery'
	},
	globals: { // Needed for SSR (automatically added to externals)
		lodash: '_',
		// DON'T comment in this line, it was used when editing globals.spec.mjs
		// '@mui/material/Button': 'MaterialUIButton',
	}
}
