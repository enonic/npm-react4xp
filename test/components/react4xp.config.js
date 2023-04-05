module.exports = {
	chunkDirs: [
		'aChunkDirInsideReact4xpDir',
		'../aChunkDirOutsideReact4xpDir'
	],
	entryDirs: [
		'anEntryDirInsideR4xDir',
		'../anEntryDirOutsideR4xDir'
	],
	globals: { // Needed for SSR (automatically added to externals)
		lodash: '_',
		// DON'T comment in this line, it was used when editing globals.spec.mjs
		// '@mui/material/Button': 'MaterialUIButton',
	}
}
