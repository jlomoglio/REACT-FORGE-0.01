import { useState } from 'react'
import classNames from 'classnames'
import { ChevronDown, ChevronRight, Plus, RefreshCcw } from 'lucide-react'
import Tooltip from '../ui/Tooltip'
import FileTreeContextMenu from './FileTreeContextMenu'

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

function sortTree(nodes) {
	return nodes.slice().sort((a, b) => {
		if (a.type === b.type) return a.name.localeCompare(b.name)
		return a.type === 'folder' ? -1 : 1
	})
}

function buildFileTree(paths) {
	const root = []

	paths.forEach(path => {
		const parts = path.split('/')
		let current = root

		parts.forEach((part, index) => {
			let node = current.find(n => n.name === part)
			const fullPath = parts.slice(0, index + 1).join('/')

			if (!node) {
				node = {
					name: part,
					path: fullPath,
					type: index === parts.length - 1 ? 'file' : 'folder',
					children: []
				}
				current.push(node)
			}
			current = node.children
		})
	})

	return sortTree(root)
}

function FileNode({
	node,
	depth = 0,
	onSelect,
	activeFile,
	changes = [],
	staged = [],
	refreshStatus,
	selectedProject,
	onContextMenu,
	contextPath
}) {
	const [open, setOpen] = useState(false)
	const isFolder = node.type === 'folder'
	const isSelected = node.type === 'file' && node.path === activeFile
	const isChanged = changes.some(f => f.name === node.path)
	const isStaged = staged.some(f => f.name === node.path)

	const fileIcons = {
		jsx: <img src={JsxIcon} alt="JSX" className="w-4 h-4" />,
		js: <img src={JsIcon} alt="JS" className="w-4 h-4" />,
		css: <img src={CssIcon} alt="CSS" className="w-4 h-4" />,
		html: <img src={HtmlIcon} alt="HTML" className="w-4 h-4" />,
		json: <img src={JsonIcon} alt="JSON" className="w-4 h-4" />,
		gitignore: <img src={GitIcon} alt="GIT" className="w-4 h-4" />,
		md: <img src={MdIcon} alt="MD" className="w-4 h-4" />,
		txt: <img src={TxtIcon} alt="TXT" className="w-4 h-4" />,
		db: <img src={DbIcon} alt="DB" className="w-4 h-4" />,
		csv: <img src={CsvIcon} alt="CSV" className="w-4 h-4" />,
		zip: <img src={ZipIcon} alt="ZIP" className="w-4 h-4" />,
		pdf: <img src={PdfIcon} alt="PDF" className="w-4 h-4" />,
		gif: <img src={GifIcon} alt="GIF" className="w-4 h-4" />,
		png: <img src={PngIcon} alt="PNG" className="w-4 h-4" />,
		jpg: <img src={JpgIcon} alt="JPG" className="w-4 h-4" />,
		svg: <img src={SvgIcon} alt="SVG" className="w-4 h-4" />,
		webp: <img src={WebpIcon} alt="WEBP" className="w-4 h-4" />,
		default: <img src={FileIcon} alt="FILE" className="w-4 h-4" />
	}

	function getFileExtension(filename) {
		const parts = filename.split('.')
		return parts.length > 1 ? parts.pop().toLowerCase() : ''
	}

	const ext = getFileExtension(node.name)
	const icon = fileIcons[ext] || fileIcons.default

	const handleClick = () => {
		if (isFolder) setOpen(!open)
		else onSelect(node)
	}

	return (
		<div>
			<div
				onClick={handleClick}
				onContextMenu={(e) => onContextMenu?.(e, node)}
				className={classNames(
					'flex items-center cursor-pointer select-none py-[6px] text-[1rem] w-full px-4',
					isSelected ? 'bg-[rgba(13,92,238,0.39)] border border-[rgba(13,92,238,1)] text-white' : 'hover:bg-[#3A3A3A]',
					node.path === contextPath && 'outline-1 outline-blue-500'
				)}
				style={{ paddingLeft: `${depth * 14 + 4}px` }}
			>
				<div className="flex flex-row w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="w-[20px] flex justify-center items-center">
							{isFolder ? (open ? <ChevronDown /> : <ChevronRight />) : icon}
						</span>
						<span className={`truncate text-sm ${isChanged ? 'text-yellow-400' : ''}`}>
							{node.name}
						</span>
					</div>

					{!isFolder && (
						<div className="flex items-center gap-2">
							{isChanged && !isStaged && (
								<Tooltip content="Stage Chnages">
									<Plus
										size={14}
										className="text-gray-400 hover:text-blue-400 cursor-pointer"
										onClick={async (e) => {
											e.stopPropagation()
											const res = await window.electron.invoke('stage-file', {
												repoName: selectedProject.name,
												file: node.path
											})
											if (res.success) {
												await refreshStatus()
											} else {
												console.error('Stage failed:', res.error)
											}
										}}
									/>
								</Tooltip>
							)}

							{isStaged ? (
								<span className="text-green-400 text-xs font-semibold border border-green-500 px-1 rounded">
									M
								</span>
							) : isChanged ? (
								<span className="text-yellow-400 font-bold text-xs">M</span>
							) : null}
						</div>
					)}
				</div>
			</div>

			{isFolder && open && (
				<div>
					{sortTree(node.children).map((child, i) => (
						<FileNode
							key={i}
							node={child}
							activeFile={activeFile}
							depth={depth + 1}
							onSelect={onSelect}
							changes={changes}
							staged={staged}
							refreshStatus={refreshStatus}
							selectedProject={selectedProject}
							onContextMenu={onContextMenu}
							contextPath={contextPath}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export default function FileTreeSection({
	files = [],
	activeFile,
	changes = [],
	staged = [],
	activeTab,
	onTabChange,
	onFileSelect,
	selectedProject,
	refreshStatus,
	openFiles,
	setOpenFiles,
	setActiveFile
}) {
	const [contextMenu, setContextMenu] = useState()
	const contextPath = contextMenu?.file?.path
	const tree = buildFileTree(files.map(f => f.name))

	const handleContextMenuAction = async (action, file) => {
		setContextMenu(null)

		switch (action) {
			case 'openFile': {
				const res = await window.electron.invoke('read-file', {
					repoName: selectedProject.name,
					file: file.path
				})

				if (res.success) {
					setOpenFiles(prev => [...prev, {
						name: file.name,
						path: file.path,
						content: res.content
					}])
					setActiveFile(file.path)
				} else {
					console.error("Read error:", res.error)
				}
				break
			}
			case 'stageFile':
				await window.electron.invoke('stage-file', {
					repoName: selectedProject.name,
					file: file.path
				})
				await refreshStatus()
				break

			case 'revealInExplorer':
				await window.electron.invoke('reveal-in-explorer', file.path)
				break

			case 'copyFullPath':
				await window.electron.invoke('copy-to-clipboard', file.path)
				break
		}
	}

	return (
		<div className="h-full flex flex-col overflow-hidden border-t border-t-[#6D6C6C]">
			<div className="flex items-center justify-between px-4 py-2 border-t border-t-[#6D6C6C] bg-[#1F1F1F] relative">
				<div className="text-sm font-semibold">FILE TREE</div>
				<div onClick={refreshStatus} className="text-gray-400 hover:text-blue-400 absolute right-[10px] cursor-pointer">
					<RefreshCcw size={16} />
				</div>
			</div>

			<div className="overflow-y-auto pt-2 pb-6 pr-2 px-2 text-md flex-1 custom-scrollbar">
				{tree.map((node, idx) => (
					<FileNode
						key={idx}
						node={node}
						depth={0}
						onSelect={async (file) => {
							const res = await window.electron.invoke('read-file', {
								repoName: selectedProject.name,
								file: file.path
							})

							if (res.success) {
								setOpenFiles(prev => [...prev, {
									name: file.name,
									path: file.path,
									content: res.content
								}])
								setActiveFile(file.path)
							} else {
								console.error("Read error:", res.error)
							}
						}}
						activeFile={activeFile}
						changes={changes}
						staged={staged}
						refreshStatus={refreshStatus}
						selectedProject={selectedProject}
						onContextMenu={(e, file) => {
							e.preventDefault()
							setContextMenu({
								x: e.clientX,
								y: e.clientY,
								file: {
									...file,
									isChanged: changes.some(c => c.name === file.path)
								}
							})
						}}
						contextPath={contextPath}
					/>
				))}
			</div>

			{contextMenu && (
				<FileTreeContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					file={contextMenu.file}
					onClose={() => setContextMenu(null)}
					onAction={handleContextMenuAction}
				/>
			)}
		</div>
	)
}
