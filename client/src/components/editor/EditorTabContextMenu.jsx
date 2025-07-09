import { useEditorLayoutStore, getSplitCountsByGroup } from '@/state/editorLayoutState'
import { useEffect } from 'react'
import classNames from 'classnames'

export default function EditorTabContextMenu({
	x,
	y,
	tab,
	paneId,
	tabs = [],
	onClose,
	onCloseTab,
	onCopyAll,
	onSelectAll,
	onSplit
}) {

	if (!tab || !paneId) {
		console.warn('[❌ Missing split params]', { tab, paneId })
		return
	}

	const layout = useEditorLayoutStore(state => state.layout)
	const { horizontal, verticalById } = getSplitCountsByGroup(layout)

	const isHorizontalMaxed = horizontal >= 3
	const isVerticalMaxed = verticalById?.[paneId] >= 2

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.ctrlKey && e.key === 'w') {
				e.preventDefault()
				onCloseTab?.(tab.id)
				onClose()
			}
			if (e.ctrlKey && e.key === 'a') {
				e.preventDefault()
				onSelectAll?.()
				onClose()
			}
			if (e.ctrlKey && e.key === 'c') {
				e.preventDefault()
				onCopyAll?.()
				onClose()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [tab, onCloseTab, onSelectAll, onCopyAll, onClose])

	return (
		<div
			style={{ top: y, left: x }}
			className="fixed z-50 bg-[#252526] border border-[#3c3c3c] shadow-lg text-sm text-white w-[230px]"
			onMouseLeave={onClose}
		>
			<div
				className="px-3 py-2 hover:bg-[#1447e6] cursor-pointer flex justify-between"
				onClick={() => {
					onCloseTab(tab.id)
					onClose()
				}}
			>
				<span>Close</span>
			</div>

			<div className="border-t border-[#3c3c3c]" />

			<div
				className="px-3 py-2 hover:bg-[#1447e6] cursor-pointer flex justify-between"
				onClick={() => {
					onSelectAll?.()
					onClose()
				}}
			>
				<span>Select All</span>
			</div>

			<div
				className="px-3 py-2 hover:bg-[#1447e6] cursor-pointer flex justify-between"
				onClick={() => {
					onCopyAll?.()
					onClose()
				}}
			>
				<span>Copy All</span>
			</div>

			<div className="border-t border-[#3c3c3c]" />

			{['right', 'left', 'down', 'up'].map(dir => {
				const isDisabled =
					(dir === 'left' || dir === 'right') ? isHorizontalMaxed :
						(dir === 'up' || dir === 'down') ? isVerticalMaxed : false

				return (
					<div
						key={dir}
						className={classNames(
							'px-3 py-2 flex justify-between',
							isDisabled ? 'text-gray-500 cursor-not-allowed' : 'hover:bg-[#1447e6] cursor-pointer'
						)}
						onClick={() => {
							if (!isDisabled) onSplit?.(dir, tab, paneId)
						}}
					>
						<span>{`Split ${dir.charAt(0).toUpperCase() + dir.slice(1)}`}</span>
					</div>
				)
			})}
		</div>
	)
}
