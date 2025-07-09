import { useEffect, useState } from 'react'
import NoteToolbar from './NoteToolbar'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode } from '@lexical/rich-text'
import {
	ParagraphNode,
	TextNode,
	$createParagraphNode,
	$insertNodes,
	$getSelection,
	$isRangeSelection,
	$getRoot,
	COMMAND_PRIORITY_EDITOR
} from 'lexical'

import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { ListNode, ListItemNode } from '@lexical/list'
import {
	KEY_ENTER_COMMAND,
	$getNodeByKey
} from 'lexical'

import { CustomCodeNode } from './CustomCodeNode'
import { HorizontalRuleNode } from '@/components/notebook/HorizontalRuleNode'
import { ImageNode } from './ImageNode'
import { StyleGuideNode } from './StyleGuideNode'
import { ChecklistBlockNode } from './ChecklistBlockNode'
import ColorPicker from './ColorPicker'

function NoteEditorContent({ note, updateNoteContent }) {
	const [editor] = useLexicalComposerContext()
	const [showPicker, setShowPicker] = useState(false)

	useEffect(() => {
		if (!editor || !note?.content || typeof note.content !== 'object') return

		try {
			if (
				!note.content.root ||
				!Array.isArray(note.content.root.children) ||
				note.content.root.children.length === 0
			) {
				console.warn('⚠️ Skipping empty or malformed note content.')
				return
			}

			const newState = editor.parseEditorState(note.content)
			setTimeout(() => {
				editor.setEditorState(newState)
			}, 0)
		} catch (err) {
			console.error('❌ Failed to parse editor state:', err)
		}
	}, [editor, note?.id])

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			const json = editorState.toJSON()
			updateNoteContent(note.id, json)
		})
	}, [editor, note?.id])

	useEffect(() => {
		if (!editor) return

		return editor.registerCommand(
			KEY_ENTER_COMMAND,
			(event) => {
				const selection = $getSelection()

				// Only act if current block is a checklist
				if (
					$isRangeSelection(selection) &&
					selection.anchor.getNode()?.getParent()?.getType?.() === 'checklist'
				) {
					event.preventDefault()

					editor.update(() => {
						const newNode = new ChecklistNode()
						$insertNodes([newNode])

						// Force selection to the newly inserted node
						const domSelection = window.getSelection()
						const root = document.querySelector('[contenteditable="true"]')
						const lastNode = root?.lastChild
						if (lastNode) {
							const range = document.createRange()
							range.selectNodeContents(lastNode)
							range.collapse(true)
							domSelection.removeAllRanges()
							domSelection.addRange(range)
						}
					})

					return true
				}

				return false
			},
			COMMAND_PRIORITY_EDITOR
		)
	}, [editor])

	const handleInsertColorBlock = ({ color, label, code }) => {
		editor.update(() => {
			const node = new StyleGuideNode(color, label, code)
			$insertNodes([node])
		})
	}

	return (
		<>
			<NoteToolbar onShowColorPicker={() => setShowPicker(true)} />
			<div className="editor-container overflow-y-scroll mb-[30px]">
				<RichTextPlugin
					contentEditable={<ContentEditable className="editor-input" />}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<ListPlugin />
				<HistoryPlugin />
				{showPicker && (
					<ColorPicker
						onInsert={handleInsertColorBlock}
						onClose={() => setShowPicker(false)}
						onShow={() => setShowPicker(true)}
					/>
				)}
			</div>
		</>
	)
}

export default function NoteEditor({ note, updateNoteContent }) {
	if (!note) return null

	const initialConfig = {
		namespace: 'NotebookEditor',
		theme: {
			paragraph: 'editor-paragraph',
			heading: {
				h1: 'text-2xl font-bold mt-4 mb-2',
				h2: 'text-xl font-semibold mt-4 mb-2',
				h3: 'text-lg font-medium mt-3 mb-1'
			},
			text: {
				bold: 'font-bold',
				italic: 'italic',
				underline: 'underline',
				strikethrough: 'line-through',
				code: 'bg-[#2d2d2d] text-[#f92672] px-1 py-0.5 rounded text-sm font-mono'
			},
			align: {
				left: 'text-left',
				center: 'text-center',
				right: 'text-right'
			},
			list: {
				ul: 'list-disc list-inside pl-4',
				ol: 'list-decimal list-inside pl-4',
				listitem: 'mb-1',
				check: 'pl-1'
			}
		},
		onError(error) {
			console.error('Lexical error:', error)
		},
		nodes: [
			HeadingNode,
			ParagraphNode,
			ListNode,
			ListItemNode,
			TextNode,
			ChecklistBlockNode,
			CustomCodeNode,
			HorizontalRuleNode,
			ImageNode,
			StyleGuideNode
		]
	}

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<div className="editor-shell flex-1 relative overflow-auto">
				<NoteEditorContent note={note} updateNoteContent={updateNoteContent} />
			</div>
		</LexicalComposer>
	)
}
