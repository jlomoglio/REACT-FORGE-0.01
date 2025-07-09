let monacoInstance = null
const modelMap = new Map()
const lastKnownContentMap = {}

export function initMonaco(monaco) {
	if (!monacoInstance) monacoInstance = monaco
}

function ensureMonaco() {
	if (!monacoInstance) throw new Error('Monaco not initialized')
	return monacoInstance
}

export function setLastKnownContent(filePath, content) {
	lastKnownContentMap[filePath] = content
}

export function getLastKnownContent(filePath) {
	return lastKnownContentMap[filePath] || ''
}

export function getModelForPath(filePath) {
	const monaco = ensureMonaco()
	const uri = monaco.Uri.file(filePath)
	return monaco.editor.getModel(uri) || modelMap.get(filePath)
}

export function setModelForPath(filePath, model) {
	modelMap.set(filePath, model)
}

export function hasModel(filePath) {
	return modelMap.has(filePath)
}

export function createModel(filePath, content = '', language = 'javascript') {
	const monaco = ensureMonaco()
	const uri = monaco.Uri.file(filePath)

	let model = monaco.editor.getModel(uri)
	if (model && !model.isDisposed?.()) return model

	model = monaco.editor.createModel(content, language, uri)
	modelMap.set(filePath, model)
	return model
}

export function disposeModel(filePath) {
	const model = getModelForPath(filePath)
	if (model && !model.isDisposed?.()) {
		model.dispose()
		modelMap.delete(filePath)
	}
}
