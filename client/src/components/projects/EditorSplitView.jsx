import FileEditorTabs from './FileEditorTabs-OLD'

export default function EditorSplitView({ layout, groups, updateGroup }) {
	if (layout === 'split-horizontal') {
		return (
			<div className="flex w-full h-full">
				<div className="w-1/2 h-full border-r border-[#6D6C6C]">
					<FileEditorTabs
						groupId="left"
						openFiles={groups.left.openFiles}
						activeFile={groups.left.activeFile}
						setOpenFiles={(files) => updateGroup('left', { openFiles: files })}
						setActiveFile={(file) => updateGroup('left', { activeFile: file })}
					/>
				</div>
				<div className="w-1/2 h-full">
					<FileEditorTabs
						groupId="right"
						openFiles={groups.right.openFiles}
						activeFile={groups.right.activeFile}
						setOpenFiles={(files) => updateGroup('right', { openFiles: files })}
						setActiveFile={(file) => updateGroup('right', { activeFile: file })}
					/>
				</div>
			</div>
		)
	}

	return (
		<FileEditorTabs
			groupId="left"
			openFiles={groups.left.openFiles}
			activeFile={groups.left.activeFile}
			setOpenFiles={(files) => updateGroup('left', { openFiles: files })}
			setActiveFile={(file) => updateGroup('left', { activeFile: file })}
		/>
	)
}

