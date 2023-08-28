import React from 'react';
// import AnotherEntryInAnEntryDirOutsideR4xDir from './anotherEntryInAnEntryDirOutsideR4xDir'; // Works
import AnotherEntryInAnEntryDirOutsideR4xDir from '/anEntryDirOutsideR4xDir/anotherEntryInAnEntryDirOutsideR4xDir'; // Also works

export default function AnEntryInAnEntryDirOutsideR4xDir() {
	return (<>
		<div>anEntryInAnEntryDirOutsideR4xDir</div>
		<AnotherEntryInAnEntryDirOutsideR4xDir/>
	</>);
}
