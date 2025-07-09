import Editor from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'
import EditorContextMenu from './EditorContextMenu'
import { jsxTags } from '@/utils/jsxTagSnippets'
import { tailwindClasses } from '@/utils/tailwindFullClassList'
import { useEditorLayoutStore } from '@/state/editorLayoutState'
import * as babel from '@babel/parser'
import traverse from '@babel/traverse'
import monacoJsxHighlighterModule from 'monaco-jsx-highlighter'
import { nanoid } from 'nanoid'
import { validJsxTags } from '@/utils/jsxTagDictionary'

const MonacoJSXHighlighter = monacoJsxHighlighterModule.default || monacoJsxHighlighterModule

export default function MonacoEditor({ filePath, language = 'javascript', content = '' }) {
	const editorRef = useRef(null)
	const monacoRef = useRef(null)
	const lastContentRef = useRef(content)
	const saveTimeout = useRef(null)

	const [menuPos, setMenuPos] = useState(null)
	const [currentContent, setCurrentContent] = useState(content)
	const setFocusedView = useEditorLayoutStore(state => state.setFocusedView)

	const lastLoadedContentRef = useRef('')

	// 🧠 Sync on content change with debounce
	const handleChange = (value) => {
		setCurrentContent(value)
		clearTimeout(saveTimeout.current)
		saveTimeout.current = setTimeout(() => {
			window.electron.invoke('save-file', { path: filePath, content: value })
		}, 500)
	}

	// 🧠 Manual context menu trigger
	const showContextMenu = (x, y) => setMenuPos({ x, y })

	// 📥 Load file from disk
	const loadFileContent = async (editor, preserveView = false) => {
		if (!filePath || !editor) return
		const res = await window.electron.invoke('read-file', filePath)
		if (!res.success) return console.warn('❌ Load failed:', res.error)

		const model = editor.getModel()
		if (model) {
			const viewState = preserveView ? editor.saveViewState() : null
			model.setValue(res.content)
			if (viewState) editor.restoreViewState(viewState)
		}

		setCurrentContent(res.content)
		lastContentRef.current = res.content
	}

	// 🧠 Focus-based reload
	useEffect(() => {
		if (!editorRef.current || !filePath) return
		const disposable = editorRef.current.onDidFocusEditorWidget(() => {
			loadFileContent(editorRef.current, true)
		})
		return () => disposable.dispose()
	}, [filePath])

	// 🧠 Initial model setup on mount
	const handleEditorDidMount = async (editor, monaco) => {
		editorRef.current = editor
		monacoRef.current = monaco

		const uniqueUri = monaco.Uri.parse(`inmemory://model/${nanoid()}-${filePath}`)

		const res = await window.electron.invoke('read-file', filePath)
		if (!res.success) {
			console.error('❌ Failed to load file on mount:', filePath, '| Reason:', res.error)
			return
		}

		const model = monaco.editor.createModel(res.content, language, uniqueUri)
		editor.setModel(model)


		// START:  AUTO RENAME FUNCTIONALITY
		function debounce(func, delay) {
			let timer
			return function (...args) {
				clearTimeout(timer)
				timer = setTimeout(() => func.apply(this, args), delay)
			}
		}

		editor.onDidChangeModelContent(() => {
			const code = editor.getValue()
			let ast

			try {
				ast = babel.parse(code, {
					sourceType: 'module',
					plugins: ['jsx']
				})
			} catch (err) {
				console.warn('JSX Parse failed:', err.message)
				return
			}

			traverse(ast, {
				JSXElement(path) {
					const opening = path.node.openingElement
					const closing = path.node.closingElement

					if (!opening || !closing) return

					const openName = opening.name.name
					const closeName = closing.name.name

					if (openName !== closeName) {
						const model = editor.getModel()
						if (!model) return

						// Find range of closing tag
						const start = model.getPositionAt(closing.name.start)
						const end = model.getPositionAt(closing.name.end)

						editor.executeEdits('fix-closing-tag', [
							{
								range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
								text: openName,
							}
						])
					}
				}
			})
		})

		const runAutoRename = debounce(() => {
			try {
				const code = editor.getValue()
				const ast = babel.parse(code, {
					sourceType: 'module',
					plugins: ['jsx', 'typescript'],
					errorRecovery: true
				})

				traverse(ast, {
					JSXElement(path) {
						const opening = path.node.openingElement
						const closing = path.node.closingElement

						if (!opening || !closing || !opening.name || !closing.name) return

						const openTagName = opening.name.name
						const closeTagName = closing.name.name

						if (openTagName === closeTagName) return
						if (!validJsxTags.includes(openTagName) && !validJsxTags.includes(closeTagName)) return

						const model = editor.getModel()
						if (!model) return

						const edits = []

						const openStart = model.getPositionAt(opening.name.start)
						const openEnd = model.getPositionAt(opening.name.end)
						const closeStart = model.getPositionAt(closing.name.start)
						const closeEnd = model.getPositionAt(closing.name.end)

						edits.push({
							range: new monaco.Range(
								closeStart.lineNumber,
								closeStart.column,
								closeEnd.lineNumber,
								closeEnd.column
							),
							text: openTagName,
						})

						editor.executeEdits('auto-rename-jsx', edits)
					}
				})
			} catch (err) {
				// Silent fail — ignore incomplete tags
			}
		}, 300)

		editor.onDidChangeModelContent(runAutoRename)
		// END: AUTO RENAME FUNCTIONALITY



		lastLoadedContentRef.current = res.content

		editor.onDidFocusEditorWidget(() => {
			window.electron.invoke('read-file', filePath).then(res => {
				if (res.success) {
					const model = editor.getModel()
					if (model) {
						const viewState = editor.saveViewState()
						model.setValue(res.content)
						editor.restoreViewState(viewState)
						setCurrentContent(res.content)
					}
				} else {
					console.warn('❌ Failed to reload file on focus:', filePath)
				}
			})
		})

		editor.onMouseDown(() => {
			setFocusedView('editor')
		})

		// Ensure layout is correct
		setTimeout(() => editor.layout(), 0)

		// JSX Highlighter - Auto Rename Tag
		const highlighter = new MonacoJSXHighlighter(monaco, babel, traverse, editor)
		highlighter.highLightOnDidChangeModelContent()
		highlighter.addJSXCommentCommand()

		let lastContent = ''
		let renameDebounce = null

		editor.onDidChangeModelContent(() => {
			clearTimeout(renameDebounce)

			renameDebounce = setTimeout(() => {
				try {
					const model = editor.getModel()
					if (!model) return

					const code = model.getValue()

					// Skip if unchanged (could happen on undo/redo or no-op)
					if (code === lastContent) return

					lastContent = code

					// Parse and traverse JSX
					const ast = babel.parse(code, {
						sourceType: 'module',
						plugins: ['jsx']
					})

					traverse(ast, {
						JSXElement(path) {
							const { openingElement, closingElement } = path.node

							if (!openingElement || !closingElement) return
							if (!openingElement.name || !closingElement.name) return
							if (openingElement.name.name === closingElement.name.name) return

							const openName = openingElement.name.name
							const closeName = closingElement.name.name

							// Must be a valid JS identifier to safely rename
							if (!/^[a-zA-Z_][\w\-]*$/.test(openName)) return

							const model = editor.getModel()
							const openStart = model.getPositionAt(openingElement.name.start)
							const openEnd = model.getPositionAt(openingElement.name.end)
							const closeStart = model.getPositionAt(closingElement.name.start)
							const closeEnd = model.getPositionAt(closingElement.name.end)

							editor.executeEdits('auto-rename-tag', [
								{
									range: new monaco.Range(
										closeStart.lineNumber,
										closeStart.column,
										closeEnd.lineNumber,
										closeEnd.column
									),
									text: openName
								}
							])
						}
					})
				} catch (err) {
					// Ignore parse errors — user might still be typing
				}
			}, 600)
		})




		editor.onMouseDown(() => setFocusedView('editor'))
		editor.onContextMenu(e => {
			e.event.preventDefault()
			e.event.stopPropagation()
			showContextMenu(e.event.browserEvent.clientX, e.event.browserEvent.clientY)
		})

		monaco.languages.registerCompletionItemProvider('javascript', {
			triggerCharacters: ['c', 'o'],
			provideCompletionItems: () => ({
				suggestions: [
					{ label: 'className', kind: monaco.languages.CompletionItemKind.Property, insertText: 'className="$1"', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'JSX attribute' },
					{ label: 'onClick', kind: monaco.languages.CompletionItemKind.Property, insertText: 'onClick={() => {\n\t$1\n}}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'JSX attribute' },
					{ label: 'onChange', kind: monaco.languages.CompletionItemKind.Property, insertText: 'onChange={(e) => {\n\t$1\n}}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'JSX attribute' }
				]
			})
		})

		monaco.languages.registerCompletionItemProvider('javascript', {
			triggerCharacters: ['<'],
			provideCompletionItems: (model, position) => {
				const wordUntil = model.getWordUntilPosition(position)
				return {
					suggestions: jsxTags.map(tag => ({
						label: tag,
						kind: monaco.languages.CompletionItemKind.Snippet,
						insertText: `<${tag}>$1</${tag}>`,
						insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
						range: {
							startLineNumber: position.lineNumber,
							endLineNumber: position.lineNumber,
							startColumn: wordUntil.startColumn,
							endColumn: wordUntil.endColumn
						}
					}))
				}
			}
		})

		monaco.languages.registerCompletionItemProvider('javascript', {
			triggerCharacters: [' ', '"', "'"],
			provideCompletionItems: (model, position) => {
				const line = model.getLineContent(position.lineNumber)
				const wordUntil = model.getWordUntilPosition(position)
				const textBeforeCursor = line.slice(0, position.column)
				const inClassName = textBeforeCursor.includes('className="') || textBeforeCursor.includes("className='")

				if (!inClassName) return { suggestions: [] }

				return {
					suggestions: tailwindClasses.map(cls => ({
						label: cls,
						kind: monaco.languages.CompletionItemKind.Keyword,
						insertText: cls,
						range: {
							startLineNumber: position.lineNumber,
							endLineNumber: position.lineNumber,
							startColumn: wordUntil.startColumn,
							endColumn: wordUntil.endColumn
						}
					}))
				}
			}
		})
	}

	const handleMenuAction = (action) => {
		const editor = editorRef.current
		if (!editor) return

		editor.focus()
		const trigger = (cmd) => editor.trigger('contextMenu', cmd)

		switch (action) {
			case 'cut': trigger('editor.action.clipboardCutAction'); break
			case 'copy': trigger('editor.action.clipboardCopyAction'); break
			case 'paste': trigger('editor.action.clipboardPasteAction'); break
			case 'selectAll': trigger('editor.action.selectAll'); break
			case 'find': trigger('actions.find'); break
			case 'findNext': trigger('editor.action.nextMatchFindAction'); break
			case 'foldAll': trigger('editor.foldAll'); break
			case 'unfoldAll': trigger('editor.unfoldAll'); break
			case 'format': editor.getAction('editor.action.formatDocument').run().catch(err => console.error('Format failed:', err)); break
			case 'fontIncrease': editor.updateOptions({ fontSize: editor.getOption(monacoRef.current.editor.EditorOption.fontSize) + 1 }); break
			case 'fontDecrease': editor.updateOptions({ fontSize: editor.getOption(monacoRef.current.editor.EditorOption.fontSize) - 1 }); break
		}
		setMenuPos(null)
	}

	return (
		<>
			<Editor
				path={filePath}
				value={currentContent}
				theme="vs-dark"
				height="100%"
				width="100%"
				defaultLanguage={language}
				onMount={handleEditorDidMount}
				onChange={handleChange}
				options={{
					fontSize: 14,
					minimap: { enabled: false },
					wordWrap: 'on',
					scrollBeyondLastLine: true,
					contextmenu: false,
					tabSize: 4,
					formatOnType: true,
					formatOnPaste: true,
					autoClosingTags: true,
					autoClosingBrackets: 'always',
					autoClosingQuotes: 'always'
				}}
			/>
			{menuPos && (
				<EditorContextMenu
					x={menuPos.x}
					y={menuPos.y}
					onAction={handleMenuAction}
					onClose={() => setMenuPos(null)}
				/>
			)}
		</>
	)
}
