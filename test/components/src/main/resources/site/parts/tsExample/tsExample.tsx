import React from 'react';
import Button from '../../../react4xp/shared/Button';
import Header from '../../../react4xp/shared/Header';
import AComponentInAChunkDirInsideReact4xpDir from '../../../react4xp/AChunkDirInsideReact4xpDir/AComponentInAChunkDirInsideReact4xpDir';
import AComponentInAChunkDirOutsideReact4xpDir from '../../../AChunkDirOutsideReact4xpDir/AComponentInAChunkDirOutsideReact4xpDir';


function TsExample() {
	return (
		<>
			<AComponentInAChunkDirInsideReact4xpDir/>
			<AComponentInAChunkDirOutsideReact4xpDir/>
			<Button/>
			<Header/>
		</>
	);
}


export default TsExample;
