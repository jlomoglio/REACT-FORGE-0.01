import { useState, useRef, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import classNames from 'classnames'
import EditorTabContextMenu from './EditorTabContextMenu'
import { useEditorLayoutStore } from '@/state/editorLayoutState'

import JsxIcon from '../../assets/icons/jsx.svg'
import JsIcon from '../../assets/icons/js.svg'
import CssIcon from '../../assets/icons/css.svg'
import HtmlIcon from '../../assets/icons/html.svg'
import JsonIcon from '../../assets/icons/json.svg'
import GitIcon from '../../assets/icons/git.svg'
import MdIcon from '../../assets/icons/md.svg'
import TxtIcon from '../../assets/icons/txt.svg'
import FileIcon from '../../assets/icons/file.svg'
import CsvIcon from '../../assets/icons/csv.svg'
import DbIcon from '../../assets/icons/db.svg'
import ZipIcon from '../../assets/icons/zip.svg'
import PdfIcon from '../../assets/icons/pdf.svg'
import PngIcon from '../../assets/icons/png.svg'
import GifIcon from '../../assets/icons/gif.svg'
import JpgIcon from '../../assets/icons/jpg.svg'
import SvgIcon from '../../assets/icons/svg.svg'
import WebpIcon from '../../assets/icons/webp.svg'

const iconMap = {
	js: JsIcon, jsx: JsxIcon, css: CssIcon, html: HtmlIcon, json: JsonIcon,
	gitignore: GitIcon, md: MdIcon, txt: TxtIcon, csv: CsvIcon, db: DbIcon,
	zip: ZipIcon, pdf: PdfIcon, png: PngIcon, gif: GifIcon, jpg: JpgIcon,
	svg: SvgIcon, webp: WebpIcon
}

export default function TabsBar({
	paneId,
	tabs = [],
	activeFilePath,
	focusedPane,
	onTabClick,
	onCloseTab,
	onTabDrop,
	onSplitTab,
	onSelectAll,
	onCopyAll
}) {
	const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, tab: null })
	const [draggingTabId, setDraggingTabId] = useState(null)
	const [dropIndex, setDropIndex] = useState(null)
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)

	const scrollRef = useRef(null)

	useEffect(() => {
		const updateScroll = () => {
			if (!scrollRef.current) return
			const el = scrollRef.current
			setCanScrollLeft(el.scrollLeft > 0)
			setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth)
		}
		updateScroll()
		scrollRef.current?.addEventListener('scroll', updateScroll)
		return () => scrollRef.current?.removeEventListener('scroll', updateScroll)
	}, [tabs])

	const layout = useEditorLayoutStore(state => state.layout)
	const group = useEditorLayoutStore(state => state.layout?.find(g => g.id === paneId || g.vertical?.some(p => p.id === paneId)))

	const getDropPosition = (e, tabIndex) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const offsetX = e.clientX - rect.left
		return offsetX < rect.width / 2 ? tabIndex : tabIndex + 1
	}

	const handleContextMenu = (e, tab, paneId) => {
		e.preventDefault()
		useEditorLayoutStore.getState().updatePane(paneId, { activeTabPath: tab.fullPath })
		useEditorLayoutStore.getState().setFocusedPane(paneId)
		setContextMenu({ visible: true, x: e.clientX, y: e.clientY, tab, paneId })
	}

	const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, tab: null })

	const getFileIcon = (filename = '') => {
		const ext = filename.split('.').pop().toLowerCase()
		return iconMap[ext] || FileIcon
	}

	const handleSplitTab = (direction, tab) => {
		if (!tab) return
		useEditorLayoutStore.getState().splitPane({ direction, sourcePaneId: paneId, tab })
	}

	const scrollBy = (dir) => {
		if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 150, behavior: 'smooth' })
	}

	return (
		<div className="w-full h-[50px] bg-[#202020] flex flex-col relative z-10">
			<div className="flex items-center h-[40px] border-b border-[#6D6C6C]">
				{canScrollLeft && (
					<button onClick={() => scrollBy(-1)} className="w-[30px] h-full text-white bg-[#1a1a1a] hover:bg-[#333]">
						<ChevronLeft size={16} />
					</button>
				)}

				<div
					ref={scrollRef}
					className="flex flex-1 overflow-x-auto overflow-x-auto scroll-container scroll-smooth"
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						const droppedTabId = e.dataTransfer.getData('tab/id')
						const fromPaneId = e.dataTransfer.getData('tab/fromGroup')
						if (droppedTabId && fromPaneId && dropIndex != null) {
							onTabDrop?.(droppedTabId, fromPaneId, paneId, dropIndex)
							setDropIndex(null)
						}
					}}
				>
					{tabs.map((tab, index) => {
						const isActive = tab.fullPath === activeFilePath
						const isFocused = paneId === focusedPane
						const tabClass = classNames(
							'group px-3 py-[6px] cursor-pointer flex items-center gap-2 border-r border-[#6D6C6C] h-[40px] relative select-none',
							{
								'bg-[#2C2C2C] text-white font-semibold border-t-2 border-t-blue-500 border-b-transparent': isActive && isFocused,
								'bg-[#2C2C2C] text-white font-semibold border-b-transparent': isActive && !isFocused,
								'bg-[#1F1F1F] text-gray-300 hover:bg-[#333] border-b border-[#6D6C6C]': !isActive || !isFocused
							}
						)

						return (
							<div
								key={`${tab.id}_${paneId}`}
								draggable
								onDragStart={(e) => {
									e.dataTransfer.setData('text/plain', '')
									e.dataTransfer.setData('tab/id', tab.id)
									e.dataTransfer.setData('tab/fromGroup', paneId)
									setDraggingTabId(tab.id)
								}}
								onDragEnter={(e) => {
									e.preventDefault()
									setDropIndex(getDropPosition(e, index))
								}}
								onDragOver={(e) => e.preventDefault()}
								onDrop={(e) => {
									e.preventDefault()
									const droppedTabId = e.dataTransfer.getData('tab/id')
									const fromPaneId = e.dataTransfer.getData('tab/fromGroup')
									if (droppedTabId && fromPaneId) {
										onTabDrop?.(droppedTabId, fromPaneId, paneId, getDropPosition(e, index))
										setDropIndex(null)
									}
								}}
								onContextMenu={(e) => handleContextMenu(e, tab, paneId)}
								onClick={() => onTabClick(tab)}
								className={tabClass}
							>
								{dropIndex === index && (
									<div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white z-50" />
								)}
								<img src={getFileIcon(tab.label)} alt="" className="w-6 h-6 shrink-0" />
								<span className="truncate flex-1">{tab.label}</span>
								<div
									onClick={(e) => {
										e.stopPropagation()
										onCloseTab(tab.fullPath || tab.id)
									}}
									className="ml-auto px-2"
								>
									<X size={16} className={classNames('text-white transition-opacity duration-100', {
											'opacity-100': isActive || tab.id === contextMenu.tab?.id,
											'group-hover:opacity-100': true,
											'opacity-0': !isActive
									})} />
								</div>
							</div>
						)
					})}
				</div>

				{canScrollRight && (
					<button onClick={() => scrollBy(1)} className="w-[30px] h-full text-white bg-[#1a1a1a] hover:bg-[#333]">
						<ChevronRight size={16} />
					</button>
				)}
			</div>

			<div className="w-full h-[10px] bg-[#2C2B2B]" />

			{contextMenu.visible && (
				<EditorTabContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					tab={contextMenu.tab}
					paneId={paneId}
					tabs={tabs}
					onClose={closeContextMenu}
					onSplit={(direction) => {
						handleSplitTab(direction, contextMenu.tab)
						closeContextMenu()
					}}
					onCloseTab={(tabId) => onCloseTab(paneId, tabId)}
					onSelectAll={onSelectAll}
					onCopyAll={onCopyAll}
					splitLimits={{ horizontal: layout.length, vertical: group?.vertical?.length || 1 }}
				/>
			)}
		</div>
	)
}
