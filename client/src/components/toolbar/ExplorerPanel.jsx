import { useState, useEffect, useRef, useMemo } from 'react'
import classNames from 'classnames'
import { ChevronDown, ChevronRight, RefreshCcw, FilePlus, FolderPlus, CopyMinus } from 'lucide-react'
import FileTreeContextMenu from '../projects/FileTreeContextMenu'
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

const noop = () => { }

function sortTree(nodes) {
	return nodes.slice().sort((a, b) => {
		if (a.type === b.type) return a.name.localeCompare(b.name)
		return a.type === 'folder' ? -1 : 1
	})
}

function buildFileTree(items) {
	const root = []

	items.forEach((item, idx) => {
		const parts = item.name.split('/')
		let current = root

		parts.forEach((part, index) => {
			const fullPath = parts.slice(0, index + 1).join('/')
			let node = current.find(n => n.name === part)

			if (!node) {
				node = {
					name: part,
					path: fullPath,
					type: index === parts.length - 1 ? item.type : 'folder',
					children: []
				}
				current.push(node)
			}

			current = node.children
		})
	})

	return sortTree(root)
}



/**
 * 
 * FILENODE FUNCTIONAL COMPONENT
 * 
 */
function FileNode({
	node,
	depth = 0,
	onSelect,
	renamingPath,
	renameValue,
	setRenameValue,
	setRenamingPath,
	selectedProject,
	refreshStatus,
	onContextMenu,
	contextPath,
	creatingInPath,
	newFileName,
	setNewFileName,
	setCreatingInPath,
	creatingFolderInPath,
	setCreatingFolderInPath,
	newFolderName,
	setNewFolderName,
	expandedPaths,
	setExpandedPaths,
	selectedNodePath,
	setSelectedNodePath,
}) {
	if (!node || typeof node !== 'object') {
		console.warn('⚠️ Invalid node:', node)
		return null
	}

	const focusedView = useEditorLayoutStore(state => state.focusedView)
	const isFolder = node.type === 'folder'
	const paddingLeft = depth * 14 + 4
	const isRenaming = renamingPath === node.path
	const isOpen = expandedPaths.has(node.path)

	const isEditorFocused = focusedView === 'editor'
	const isSelected = node.path === selectedNodePath


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

	const inputRef = useRef(null)

	useEffect(() => {
		if (inputRef.current) {
			const dotIndex = renameValue.lastIndexOf('.')
			const end = dotIndex > 0 ? dotIndex : renameValue.length
			inputRef.current.setSelectionRange(0, end)
		}
	}, [])

	useEffect(() => {
		if (creatingInPath === node.path && isFolder && !isOpen) {
			const newSet = new Set(expandedPaths)
			newSet.add(node.path)
			setExpandedPaths(newSet)
		}
	}, [creatingInPath, node.path])


	function getFileExtension(filename) {
		const parts = filename.split('.')
		return parts.length > 1 ? parts.pop().toLowerCase() : ''
	}

	const ext = getFileExtension(node.name)
	const icon = fileIcons[ext] || fileIcons.default

	return (
		<div>
			<div
				className={classNames(
					'flex items-center cursor-pointer select-none py-[1px] text-[1rem] w-full',
					'hover:bg-[#3A3A3A]',
					isSelected && isEditorFocused
						? 'bg-[#524f4f] hover:bg-[#524f4f] text-white'
						: isSelected && !isEditorFocused
							? 'bg-[rgba(9,71,113,0.75)] hover:bg-[rgba(9,71,113,0.75)] outline-1 outline-blue-500 text-white'
							: 'hover:bg-[#2A2D2E] border-l-[#2A2D2E]',
					node.path === contextPath && 'outline-1 outline-blue-500 bg-transparent hover:bg-transparent'
				)}
				style={{ paddingLeft: '12px', width: '100% !important' }}
				onClick={() => {
					if (isRenaming) return
					setSelectedNodePath(node.path)
					if (isFolder) {
						const newSet = new Set(expandedPaths)
						if (isOpen) newSet.delete(node.path)
						else newSet.add(node.path)
						setExpandedPaths(newSet)
					} else {
						onSelect(node)
					}
				}}
				onContextMenu={(e) => onContextMenu?.(e, node)}
			>
				<div className="flex items-center gap-2 w-full">
					<span className="w-[20px] flex justify-center items-center">
						{isFolder ? (isOpen ? <ChevronDown /> : <ChevronRight />) : icon}
					</span>

					{isRenaming ? (
						<input
							autoFocus
							ref={inputRef}
							value={renameValue}
							onChange={(e) => setRenameValue(e.target.value)}
							onBlur={async () => {
								const oldPath = `${selectedProject.path}/${node.path}`
								const newPath = `${selectedProject.path}/${node.path.replace(/[^/]+$/, renameValue)}`
								const res = await window.electron.invoke('rename-path', { oldPath, newPath })
								if (res.success) {
									setRenamingPath(null)
									refreshStatus?.()
								} else {
									console.error('Rename failed:', res.error)
								}
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') e.target.blur()
								if (e.key === 'Escape') setRenamingPath(null)
							}}
							className="w-full bg-transparent text-white border border-[#6D6C6C] focus:outline-none 
								focus:ring-1 focus:ring-[#6D6C6C] px-1 py-1 text-sm"
						/>

					) : (
						<span className="truncate text-sm py-1">{node.name}</span>
					)}
				</div>
			</div>


			{isFolder && isOpen && (
				<div>
					{sortTree(node.children).map((child, i) => (
						<FileNode
							key={i}
							node={child}
							depth={depth + 1}
							onSelect={onSelect}
							renamingPath={renamingPath}
							renameValue={renameValue}
							setRenameValue={setRenameValue}
							setRenamingPath={setRenamingPath}
							selectedProject={selectedProject}
							refreshStatus={refreshStatus}
							onContextMenu={onContextMenu}
							contextPath={contextPath}
							creatingInPath={creatingInPath}
							newFileName={newFileName}
							setNewFileName={setNewFileName}
							setCreatingInPath={setCreatingInPath}
							expandedPaths={expandedPaths}
							setExpandedPaths={setExpandedPaths}
							selectedNodePath={selectedNodePath}
							setSelectedNodePath={setSelectedNodePath}
							focusedView={focusedView}
						/>
					))}

					{creatingInPath === node.path && (
						<div style={{ paddingLeft: `${(depth + 1) * 14 + 4}px` }} className="flex items-center gap-2 px-4 py-1">
							<span className="w-[20px] flex justify-center items-center">
								<img src={FileIcon} alt="FILE" className="w-4 h-4" />
							</span>
							<input
								autoFocus
								value={newFileName}
								onChange={(e) => setNewFileName(e.target.value)}
								onBlur={() => {
									setCreatingInPath(null)
									setNewFileName('')
								}}
								onKeyDown={async (e) => {
									if (!newFileName.trim()) return

									if (e.key === 'Enter') {
										const base = creatingInPath ? `${selectedProject.path}/${creatingInPath}` : selectedProject.path
										const fullPath = `${base}/${newFileName}`.replace(/\/+/g, '/')

										const res = await window.electron.invoke('create-file', { path: fullPath })
										if (res.success) {
											setCreatingInPath(null)
											setNewFileName('')
											refreshStatus?.()

											// auto-open new file
											const readRes = await window.electron.invoke('read-file', fullPath)
											if (readRes.success) {
												onSelect({
													name: newFileName,
													path: `${creatingInPath}/${newFileName}`.replace(/\/+/g, '/'),
													content: readRes.content
												})
											}
										} else {
											console.error('Failed to create file:', res.error)
										}
									} else if (e.key === 'Escape') {
										setCreatingInPath(null)
										setNewFileName('')
									}
								}}
								className="w-[180px] bg-transparent text-white border border-[#6D6C6C] focus:outline-none 
									focus:ring-1 focus:ring-[#6D6C6C] px-1 py-1 text-sm"
							/>
						</div>
					)}

					{creatingInPath === '' && (
						<div className="flex items-center gap-2 px-4 py-1">
							<span className="w-[20px] flex justify-center items-center">
								<img src={FileIcon} alt="FILE" className="w-4 h-4" />
							</span>
							<input
								autoFocus
								value={newFileName}
								onChange={(e) => setNewFileName(e.target.value)}
								onBlur={() => {
									setCreatingInPath(null)
									setNewFileName('')
								}}
								onKeyDown={async (e) => {
									if (!newFileName.trim()) return

									if (e.key === 'Enter') {
										const base = localProject.path
										const fullPath = `${base}/${newFileName}`.replace(/\/+/g, '/')

										const res = await window.electron.invoke('create-file', { path: fullPath })
										if (res.success) {
											setCreatingInPath(null)
											setNewFileName('')
											await loadFiles()
										} else {
											console.error('Failed to create file:', res.error)
										}
									} else if (e.key === 'Escape') {
										setCreatingInPath(null)
										setNewFileName('')
									}
								}}
								className="w-[180px] bg-transparent text-white border border-[#6D6C6C] focus:outline-none 
									focus:ring-1 focus:ring-[#6D6C6C] px-1 py-1 text-sm"
							/>
						</div>
					)}


					{creatingFolderInPath === node.path && (
						<div
							style={{ paddingLeft: `${(depth + 1) * 14 + 4}px` }}
							className="flex items-center gap-2 px-4 py-1"
						>
							<span className="w-[20px] flex justify-center items-center">📁</span>
							<input
								autoFocus
								value={newFolderName}
								onChange={(e) => setNewFolderName(e.target.value)}
								onKeyDown={async (e) => {
									if (!newFolderName.trim()) return

									if (e.key === 'Enter') {
										const base = creatingFolderInPath
											? `${selectedProject.path}/${creatingFolderInPath}`
											: selectedProject.path
										const fullPath = `${base}/${newFolderName}`.replace(/\/+/g, '/')

										const res = await window.electron.invoke('create-folder', {
											folder: fullPath
										})

										if (!res.success) {
											console.error('Failed to create folder:', res.error)
										}

										setCreatingFolderInPath(null)
										setNewFolderName('')
										refreshStatus?.()
									} else if (e.key === 'Escape') {
										setCreatingFolderInPath(null)
										setNewFolderName('')
									}
								}}
								className="w-[180px] bg-transparent text-white border border-[#6D6C6C] focus:outline-none 
									focus:ring-1 focus:ring-[#6D6C6C] px-1 py-1 text-sm"
							/>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

/**
 * 
 * EXPLORER COMPONENT
 * 
 * 
 */
export default function ExplorerPanel({
	initialProject,
	activeFile,
	setOpenFiles,
	setActiveFile,
	onFileOpen
}) {
	const [localProject, setLocalProject] = useState(initialProject || null)
	const [projectFiles, setProjectFiles] = useState([])
	const [contextMenu, setContextMenu] = useState()
	const [renamingPath, setRenamingPath] = useState(null)
	const [renameValue, setRenameValue] = useState('')
	const [creatingInPath, setCreatingInPath] = useState(null) // e.g. 'src/components'
	const [newFileName, setNewFileName] = useState('')
	const [creatingFolderInPath, setCreatingFolderInPath] = useState(null)
	const [newFolderName, setNewFolderName] = useState('')
	const [expandedPaths, setExpandedPaths] = useState(new Set())
	const [selectedNodePath, setSelectedNodePath] = useState(null)
	const [hasProjects, setHasProjects] = useState(true)

	const explorerRef = useRef()

	const setFocusedView = useEditorLayoutStore(state => state.setFocusedView)
	const contextPath = contextMenu?.file?.path

	const tree = useMemo(() => {
		if (!Array.isArray(projectFiles) || projectFiles.length === 0) return []
		return buildFileTree(projectFiles)
	}, [projectFiles])


	useEffect(() => {
		window.electron.invoke('get-projects')
			.then((projects) => {
				setHasProjects(projects.length > 0)
			})
			.catch(() => {
				setHasProjects(false)
			})
	}, [])

	useEffect(() => {
		if (initialProject) {
			setLocalProject(initialProject)
		}
		else {
			setLocalProject(null)
			setProjectFiles([]) // ✅ Clear tree
		}
	}, [initialProject])

	useEffect(() => {
		setLocalProject(initialProject || null)
	}, [initialProject])

	useEffect(() => {
		if (!localProject) return
		loadFiles()
	}, [localProject])

	function handleOpenProjectModal() {
		window.dispatchEvent(new CustomEvent('menu:open-project'))
	}

	function handleOpenImportModal() {
		window.dispatchEvent(new CustomEvent('menu:import-project'))
	}

	const handleContextMenuAction = async (action, file) => {
		setContextMenu(null)

		switch (action) {
			case 'openFile': {
				const res = await window.electron.invoke('read-file', {
					repoName: localProject.name,
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

			case 'newFile': {
				setCreatingInPath(file?.path || '')
				setNewFileName('') // Reset input
				break
			}

			case 'newFolder': {
				setCreatingFolderInPath(file?.path || '')
				setNewFolderName('')
				break
			}

			case 'renameFile':
			case 'renameFolder': {
				setRenameValue(file.name)
				setRenamingPath(file.path)
				break
			}

			case 'deleteFile':
			case 'deleteFolder': {
				if (!file || typeof file.path !== 'string') {
					console.warn('🛑 Skipping delete: Invalid file.path', file)
					return
				}

				const fullPath = `${localProject.path}/${file.path}`.replace(/\\/g, '/')
				const normalizedPath = fullPath

				try {
					const res = await window.electron.invoke('delete-item', {
						projectPath: localProject.path,
						path: file.path
					})

					if (!res.success) {
						console.error('❌ Delete failed:', res.error)
					} else {
						window.dispatchEvent(new CustomEvent('editor:close-tab', {
							detail: { path: normalizedPath }
						}))

						if (
							typeof setActiveFile === 'function' &&
							typeof activeFile === 'string' &&
							activeFile.replace(/\\/g, '/') === normalizedPath
						) {
							setActiveFile(null)
						}

						await new Promise(res => setTimeout(res, 100))
						await loadFiles()
					}
				} catch (err) {
					console.error('🔥 Delete threw error:', err)
				}

				break
			}

		}
	}

	const loadFiles = async () => {
		if (!localProject?.path) return

		const res = await window.electron.invoke('read-directory-recursive', localProject.path)

		if (res.success) {
			setProjectFiles(res.files)
		} else {
			console.error('❌ Could not load files for project:', localProject.path)
			console.error('📛 Error:', res.error)

			// Reset UI state
			setProjectFiles([])
			setLocalProject(null)

			// Optionally remove from persistent storage
			await window.electron.invoke('remove-project', localProject.path)

			// Trigger open modal
			window.dispatchEvent(new CustomEvent('menu:open-project'))
		}
	}


	function handleCollapseAll() {
		setExpandedPaths(new Set()) // clear all expanded folder paths
	}



	return (
		<div className="h-full flex flex-col overflow-hidden">
			<div className="flex items-center justify-between px-4 py-2 bg-[#1F1F1F] relative">
				<div className="text-sm font-semibold select-none">EXPLORER</div>
			</div>

			{!localProject && (
				<>
					{hasProjects ? (
						<div className="p-6 space-y-4">
							<p className="text-sm text-gray-300 select-none">No project is currently open.</p>
							<button
								disabled={!hasProjects}
								onClick={handleOpenProjectModal}
								className={
									`flex flex-row px-4 py-2 justify-center w-full rounded select-none
									'bg-blue-600 text-white hover:bg-blue-500 cursor-pointer bg-blue-600
									`
								}

							>
								Open Project
							</button>
							<p className="text-xs text-gray-400 select-none">
								Opening a project will close the current project and all open editors.
							</p>
						</div>
					) : (
						<div className="p-6 space-y-4">
							<p className="text-sm text-gray-300 select-none">There are no projects.</p>
							<button
								disabled={!hasProjects}
								onClick={handleOpenProjectModal}
								className="flex flex-row px-4 py-2 justify-center w-full bg-blue-600 text-white rounded 
									cursor-pointer hover:bg-blue-500  select-none"
							>
								New Project
							</button>
							<p className="text-xs text-gray-400 select-none">
								Create a new project to begin developing.
							</p>
						</div>
					)}

					<div className="p-6 space-y-4">
						<p className="text-sm text-gray-300 select-none">You can import an existing project.</p>
						<div
							className="flex flex-row px-4 py-2 justify-center w-full bg-blue-600 text-white rounded 
							cursor-pointer hover:bg-blue-500  select-none"
							onClick={handleOpenImportModal}
						>
							Import Project
						</div>
					</div>
				</>
			)}

			<div className="pt-2 pb-6 pr-2 px-0 text-md flex-1 relative">
				{localProject && (
					<div className="flex items-center justify-between px-2 mb-2">
						<div className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-[10px]">
							{localProject?.name}
						</div>

						<div className="text-gray-400 flex flex-row gap-2">
							<FilePlus
								size={16}
								className="hover:text-white cursor-pointer"
								title="New File..."
								onClick={() => {
									if (!localProject) return

									let targetPath = ''

									if (contextPath) {
										// Use projectFiles to determine if it's a file or folder
										const node = projectFiles.find(p => p.name === contextPath)
										if (node) {
											targetPath = node.type === 'folder'
												? node.name             // selected folder
												: node.name.split('/').slice(0, -1).join('/') // file → parent folder
										}
									}

									// Force empty string if invalid
									if (!targetPath || targetPath === '.') {
										targetPath = ''
									}

									console.log('📂 Final targetPath =', targetPath)

									setCreatingInPath(targetPath)
									setNewFileName('')
								}}
							/>
							<FolderPlus
								size={16}
								className="hover:text-white cursor-pointer"
								title="New Folder..."
								onClick={() => setCreatingFolderInPath('')}
							/>
							<RefreshCcw
								size={16}
								className="hover:text-white cursor-pointer"
								title="Refresh Explorer"
								onClick={() => {
									setContextMenu(null)
									loadFiles()
								}}
							/>
							<CopyMinus
								size={16}
								className="hover:text-white cursor-pointer"
								title="Collapse Folders"
								onClick={handleCollapseAll}
							/>
						</div>
					</div>
				)}

				<div
					className='overflow-y-auto custom-scrollbar absolute top-[40px] bottom-0 w-full'
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							setSelectedNodePath(null)
							setContextMenu(null)
						}
					}}
					ref={explorerRef}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
				>
					{tree.map((node, idx) => (
						<FileNode
							key={idx}
							node={node}
							depth={0}
							onSelect={(file) =>
								onFileOpen({ ...file, targetPaneId: useEditorLayoutStore.getState().focusedPaneId })
							}
							activeFile={activeFile}
							selectedProject={localProject}
							onContextMenu={(e, file) => {
								e.preventDefault()
								if (!file || !file.path) {
									console.warn('🛑 Context menu invoked with invalid file:', file)
									return
								}
								setContextMenu({
									x: e.clientX,
									y: e.clientY,
									file: {
										name: file.name,
										path: file.path,
										type: file.type
									}
								})
							}}
							contextPath={contextPath}
							renamingPath={renamingPath}
							renameValue={renameValue}
							setRenameValue={setRenameValue}
							setRenamingPath={setRenamingPath}
							refreshStatus={loadFiles}
							creatingInPath={creatingInPath}
							newFileName={newFileName}
							setNewFileName={setNewFileName}
							setCreatingInPath={setCreatingInPath}
							creatingFolderInPath={creatingFolderInPath}
							setCreatingFolderInPath={setCreatingFolderInPath}
							newFolderName={newFolderName}
							setNewFolderName={setNewFolderName}
							expandedPaths={expandedPaths}
							setExpandedPaths={setExpandedPaths}
							selectedNodePath={selectedNodePath}
							setSelectedNodePath={setSelectedNodePath}
						/>
					))}

					{creatingInPath === '' && (
						<div className="flex items-center gap-2 px-4 py-1">
							<span className="w-[20px] flex justify-center items-center">
								<img src={FileIcon} alt="FILE" className="w-4 h-4" />
							</span>
							<input
								autoFocus
								value={newFileName}
								onChange={(e) => setNewFileName(e.target.value)}
								onBlur={() => {
									setCreatingInPath(null)
									setNewFileName('')
								}}
								onKeyDown={async (e) => {
									if (!newFileName.trim()) return

									if (e.key === 'Enter') {
										const fullPath = `${localProject.path}/${newFileName}`.replace(/\/+/g, '/')

										const res = await window.electron.invoke('create-file', { path: fullPath })
										if (res.success) {
											setCreatingInPath(null)
											setNewFileName('')
											await loadFiles()
										} else {
											console.error('Failed to create file:', res.error)
										}
									} else if (e.key === 'Escape') {
										setCreatingInPath(null)
										setNewFileName('')
									}
								}}
								className="w-[180px] bg-transparent text-white border border-[#6D6C6C] focus:outline-none 
									focus:ring-1 focus:ring-[#6D6C6C] px-1 py-1 text-sm"
							/>
						</div>
					)}

				</div>

				<div
					className="w-full h-full"
					onClick={() => {
						setContextMenu(null)
						setCreatingInPath(null)
						setNewFileName('')
						setCreatingFolderInPath(null)
						setNewFolderName('')
					}}
				/>
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