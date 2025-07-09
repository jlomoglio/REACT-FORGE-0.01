// components/contextMenus/NoteContextMenu.jsx
export default function NoteContextMenu({ x, y, onRename, onDelete, onClose }) {
    console.log('[🧩 NoteContextMenu Mounted]')
	return (
		<div
			className="absolute z-[999999] bg-[#1f1f1f] text-white rounded shadow-lg w-40 border border-[#333] note-context-menu"
			style={{ top: y, left: x }}
			onClick={(e) => e.stopPropagation()}
		>
			<div
				className="px-4 py-2 hover:bg-[#333] cursor-pointer"
				onClick={() => {
                    console.log("RENAME NOTE")
                    console.log('onRename is:', typeof onRename)
					onRename?.()
					onClose?.()
				}}
			>
				✏️ Rename Note
			</div>
			<div
				className="px-4 py-2 hover:bg-[#333] cursor-pointer"
				onClick={() => {
                    console.log("DELETE NOTE")
					onDelete?.()
					onClose?.()
				}}
			>
				🗑️ Delete Note
			</div>
		</div>
	)
}
