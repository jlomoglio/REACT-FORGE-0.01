import { useEffect } from 'react'

export default function EditorContextMenu({ x, y, onAction, onClose }) {
	useEffect(() => {
		const handleClickOutside = () => onClose()
		window.addEventListener('click', handleClickOutside)
		return () => window.removeEventListener('click', handleClickOutside)
	}, [onClose])

	return (
		<div
			style={{ top: y, left: x }}
			className="fixed bg-[#1F1F1F] text-white border border-gray-600 rounded w-[220px] shadow-lg z-50 text-sm"
		>
			{/* Group 1 */}
			<MenuItem label="Select All" action="selectAll" onAction={onAction} />
			<MenuItem label="Find" action="find" onAction={onAction} />
			<MenuItem label="Find Next" action="findNext" onAction={onAction} />
			<Divider />

			{/* Group 2 */}
			<MenuItem label="Fold All" action="foldAll" onAction={onAction} />
			<MenuItem label="Unfold All" action="unfoldAll" onAction={onAction} />
			<Divider />

			{/* Group 3 */}
			<MenuItem label="Format Document" action="format" onAction={onAction} />
			<Divider />

			{/* Group 4 */}
			<MenuItem label="Increase Font Size" action="fontIncrease" onAction={onAction} />
			<MenuItem label="Decrease Font Size" action="fontDecrease" onAction={onAction} />
			<Divider />

			{/* Group 5 */}
			<MenuItem label="Cut" action="cut" onAction={onAction} />
			<MenuItem label="Copy" action="copy" onAction={onAction} />
			<MenuItem label="Paste" action="paste" onAction={onAction} />
		</div>
	)
}

function MenuItem({ label, action, onAction }) {
	return (
		<div
			className="px-4 py-2 hover:bg-blue-600 cursor-pointer"
			onClick={() => onAction(action)}
		>
			{label}
		</div>
	)
}

function Divider() {
	return <div className="border-t border-gray-600 my-1" />
}
