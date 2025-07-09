export function createFullTab(file, content = '', paneId = '', overrides = {}) {
	const fullPath = file.fullPath || `${file.basePath}/${file.path}`.replace(/\\/g, '/')

	return {
		id: `${file.path}-${paneId}-${Date.now()}`,
		label: file.name || file.path.split('/').pop(),
		path: file.path,
		fullPath,
		content,
		type: 'code',
		pane: paneId,
		...file,
		...overrides
	}
}
