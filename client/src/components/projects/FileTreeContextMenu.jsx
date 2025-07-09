import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'

export default function FileTreeContextMenu({ x, y, file, onClose, onAction }) {
	const menuRef = useRef(null)
	const isTooLow = y > window.innerHeight - 400
	const top = isTooLow ? y - 400 : y

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				onClose()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [onClose])

	// ✅ Moved inside the component
	const isFolder = file?.type === 'folder'
	{/* NEED TO HOOK THESE UP */}
	const dynamicMenuItems = isFolder
		? [
			{ label: 'New File…', action: 'newFile' },
			{ label: 'New Folder…', action: 'newFolder' },
			'divider',
			{ label: 'Rename…', action: 'renameFolder' },
			{ label: 'Delete', action: 'deleteFolder' },
		]
		: [
			{ label: 'Rename…', action: 'renameFile' },
			{ label: 'Delete', action: 'deleteFile' },
		]

	return createPortal(
		<div
			ref={menuRef}
			className="fixed z-[9999] w-[230px] bg-[#1E1E1E] border border-gray-600 rounded shadow-md text-sm"
			style={{ top, left: x }}
		>
			{dynamicMenuItems.map((item, idx) => {
				if (item === 'divider') {
					return <div key={idx} className="border-t border-gray-700 my-1" />
				}

				const isOpenChanges = item.action === 'openChanges'
				const isDisabled = isOpenChanges && !file?.isChanged

				return (
					<button
						key={idx}
						onClick={() => {
							if (!isDisabled) onAction(item.action, file)
						}}
						disabled={isDisabled}
						className={classNames(
							"w-full text-left px-4 py-2",
							isDisabled
								? "text-gray-500 cursor-not-allowed"
								: "text-[#e2e8f0] hover:bg-[#333]"
						)}
					>
						{item.label}
					</button>
				)
			})}
		</div>,
		document.body
	)
}
