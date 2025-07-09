import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
	$getSelection,
	$createParagraphNode,
	$createTextNode,
	$insertNodes,
	$getNodeByKey
} from 'lexical'
import { useEffect, useRef, useState } from 'react'

export default function ChecklistBlockWidget({ nodeKey, items }) {
	const [editor] = useLexicalComposerContext()
	const [todoItems, setTodoItems] = useState(items || [])
	const inputRefs = useRef([])
	const emptyCountRef = useRef(0)

	useEffect(() => {
		if (Array.isArray(items)) {
			setTodoItems(items.map(i => ({
				label: i.label || '',
				checked: !!i.checked
			})))
		} else {
			setTodoItems([{ label: '', checked: false }])
		}
	}, [items])

	const updateNode = (newItems) => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey)
			if (node) {
				const writable = node.getWritable()
				writable.__items = newItems
			}
		})
	}

	const handleToggle = (index) => {
		const updated = [...todoItems]
		updated[index].checked = !updated[index].checked
		setTodoItems(updated)
		updateNode(updated)
	}

	const handleLabelChange = (index, value) => {
		const updated = [...todoItems]
		updated[index].label = value
		setTodoItems(updated)

		if (value.trim() !== '') {
			emptyCountRef.current = 0
		}

		editor.update(() => {
			const node = $getNodeByKey(nodeKey)
			if (node) {
				node.setItems(updated)
			}
		})
	}

	const handleDeleteItem = (index) => {
		const updated = [...todoItems]
		updated.splice(index, 1)
		setTodoItems(updated)
		updateNode(updated)
	}

	const handleAddItem = () => {
		const updated = [...todoItems, { label: '', checked: false }]
		setTodoItems(updated)
		updateNode(updated)
	}

	useEffect(() => {
		if (todoItems.length === 0 && inputRefs.current[0]) {
			inputRefs.current[0].focus()
		}
	}, [todoItems])

	useEffect(() => {
		if (todoItems.length > 0) {
			const last = inputRefs.current[todoItems.length - 1]
			if (last && document.activeElement !== last) {
				last.focus()
			}
		}
	}, [todoItems])

	useEffect(() => {
		if (!Array.isArray(items) || items.length === 0) {
			// If inserted empty somehow, seed one item
			const fallback = [{ label: '', checked: false }]
			setTodoItems(fallback)

			editor.update(() => {
				const node = $getNodeByKey(nodeKey)
				if (node && node.setItems) {
					node.setItems(fallback)
				}
			})
		} else {
			setTodoItems(items)
		}
	}, [items])

	return (
		<div className="mt-2 mb-6 w-full p-2">
			{todoItems.map((item, index) => (
				<div key={index} className="flex items-start gap-2 mb-1">
					<input
						type="checkbox"
						checked={item.checked}
						onChange={() => handleToggle(index)}
						className="mt-[2px] cursor-pointer w-[18px] h-[18px]"
					/>
					<input
						ref={(el) => {
							if (el) inputRefs.current[index] = el
						}}
						autoFocus={index === 0 && todoItems.length === 1}
						value={item.label || ''}
						onChange={(e) => handleLabelChange(index, e.target.value)}
						placeholder="To-do item..."
						className={`bg-transparent outline-none text-white min-w-[200px] px-2 flex-1 focus:border-blue-400 ${item.checked ? 'line-through text-gray-400' : ''
							}`}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault()

								const label = todoItems[index].label.trim()
								console.log(`[🔁 ENTER] label="${label}" | streak=${emptyCountRef.current}`)

								if (label === '') {
									emptyCountRef.current += 1
								} else {
									emptyCountRef.current = 0
								}

								if (emptyCountRef.current >= 2) {
									console.log('[✅ Exiting checklist]')
									emptyCountRef.current = 0

									editor.update(() => {
										const paragraph = $createParagraphNode()
										paragraph.append($createTextNode(''))
										$insertNodes([paragraph])
									})

									return
								}

								handleAddItem()
							}
							else if (e.key === 'Backspace' && todoItems[index].label === '') {
								e.preventDefault()
								emptyCountRef.current = 0
								handleDeleteItem(index)

								setTimeout(() => {
									const prev = inputRefs.current[index - 1]
									prev?.focus()
								}, 0)
							}
						}}
					/>
				</div>
			))}
		</div>
	)
}

