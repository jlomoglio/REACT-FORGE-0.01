import { useState, useEffect } from 'react'
import { Files, Search, Notebook, Github, Library, FileText, Code2 } from 'lucide-react'
import classNames from 'classnames'
import { useEditorLayoutStore } from '@/state/editorLayoutState'
import { createFullTab } from '@/utils/tabs'

import ExplorerPanel from './components/toolbar/ExplorerPanel'
import SearchPanel from './components/toolbar/SearchPanel'
import Welcome from '@/views/Welcome'
import NotebookLayout from './components/notebook/NoteBookLayout'
import GithubPanel from './components/github/GithubPanel'
import ReactLibraryPanel from './components/library/ReactLibraryPanel'
import DocsPanel from './components/docs/DocsPanel'
import HorizontalSplitGroup from './components/editor/HorizontalSplitGroup'
import NewProjectModal from './components/projects/NewProjectModal'
import ProgressDialog from './components/projects/ProgressDialog'
import OpenProjectModal from './components/projects/OpenProjectModal'
import ImportProjectModal from './components/projects/ImportProjectModal'
import RemoveProjectModal from './components/projects/RemoveProjectModal'
import ConfirmRemoveProjectModal from './components/projects/ConfirmRemoveProjectModal'
import ConfirmRemoveProjectsModal from './components/projects/ConfirmRemoveProjectsModal'

import SidebarIcon from './components/toolbar/SidebarIcon'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useOpenTabCount } from '@/state/editorLayoutState'

export default function App() {

	const [activePanel, setActivePanel] = useState('Explorer')
	const [showToolPanel, setShowToolPanel] = useState(true)
	const [activeView, setActiveView] = useState('Code')
	const [selectedProject, setSelectedProject] = useState(null)
	const [showNewProjectModal, setShowNewProjectModal] = useState(false)
	const [showImportProjectModal, setShowImportProjectModal] = useState(false)
	const [showOpenProjectModal, setShowOpenProjectModal] = useState(false)
	const [showRemoveProjectModal, setShowRemoveProjectModal] = useState(false)
	const [showConfirmRemoveProject, setShowConfirmRemoveProject] = useState(false)
	const [showConfirmRemoveProjects, setShowConfirmRemoveProjects] = useState(false)
	const [projectToRemove, setProjectToRemove] = useState(null)
	const [projectsToRemove, setProjectsToRemove] = useState([])
	const [projects, setProjects] = useState([])
	const [progressMessage, setProgressMessage] = useState('')
	const [progressPercent, setProgressPercent] = useState(0)
	const [showProgressDialog, setShowProgressDialog] = useState(false)


	const openTabCount = useEditorLayoutStore(s =>
		s.layout.reduce((count, group) =>
			count + group.vertical.reduce((paneTotal, p) => paneTotal + (p.tabs?.length || 0), 0)
			, 0)
	)

	const handleFileOpen = async (file) => {
		if (!file || typeof file !== 'object' || typeof file.path !== 'string') {
			console.warn('❌ Invalid file object or path:', file)
			return
		}

		const fullPath = `${selectedProject.path}/${file.path}`.replace(/\\/g, '/')

		const res = await window.electron.invoke('read-file', { path: fullPath })
		if (!res.success) {
			console.error('❌ Failed to read file:', res.error)
			return
		}

		const state = useEditorLayoutStore.getState()
		const currentLayout = state.layout || []
		const targetPaneId = state.focusedPaneId || 'pane-0'

		// Flatten all panes
		const allPanes = currentLayout.flatMap(g => g.vertical)
		const existingPane = allPanes.find(p =>
			p.tabs?.some(t => t.fullPath === fullPath)
		)

		if (existingPane) {
			// Focus + activate existing tab
			useEditorLayoutStore.setState(s => ({
				layout: s.layout.map(group => ({
					...group,
					vertical: group.vertical.map(p =>
						p.id === existingPane.id
							? { ...p, activeTabPath: fullPath }
							: p
					)
				})),
				focusedPaneId: existingPane.id
			}))
			setActiveView('Code')
			return
		}

		// Create full tab
		const fullTab = createFullTab({ ...file, fullPath }, res.content, targetPaneId)

		// Inject into layout
		useEditorLayoutStore.setState(s => {
			const newLayout = s.layout.map(group => ({
				...group,
				vertical: group.vertical.map(p => {
					if (p.id !== targetPaneId) return p

					const newTabs = [...(p.tabs || [])]
					if (!newTabs.some(t => t.fullPath === fullPath)) {
						newTabs.push(fullTab)
					}

					return {
						...p,
						tabs: newTabs,
						activeTabPath: fullTab.fullPath
					}
				})
			}))

			// Also update panes array
			const newPanes = s.panes.map(p =>
				p.id === targetPaneId
					? {
						...p,
						tabs: [...(p.tabs || []), fullTab],
						activeTabPath: fullTab.fullPath
					}
					: p
			)

			return {
				layout: newLayout,
				panes: newPanes,
				focusedPaneId: targetPaneId
			}
		})

		setActiveView('Code')
	}


	// Menu Events
	useEffect(() => {
		const handleMenuEvent = (event) => {
			const action = event.type.replace('menu:', '')
			switch (action) {
				case 'new-project': setShowNewProjectModal(true); break
				case 'open-project':
					setShowOpenProjectModal(true)
					break
				case 'import-project': setShowImportProjectModal(true); break
				case 'close-project': setSelectedProject(null); break
				case 'remove-project':
					window.electron.invoke('get-projects').then(setProjects)
					setShowRemoveProjectModal(true)
					break
				default:
					console.warn(`⚠️ No handler for ${action}`)
			}
		}

		const events = [
			'welcome', 'projects', 'new-project', 'open-project', 'import-project', 'close-project', 'remove-project', 'help'
		]

		events.forEach((event) => window.addEventListener(`menu:${event}`, handleMenuEvent))
		return () => events.forEach((event) => window.removeEventListener(`menu:${event}`, handleMenuEvent))
	}, [selectedProject])

	// Set Has Projects
	useEffect(() => {
		window.electron.invoke('set-has-project', !!selectedProject)
	}, [selectedProject])

	// Get Projects
	useEffect(() => {
		if (showOpenProjectModal) window.electron.invoke('get-projects').then(setProjects)
	}, [showOpenProjectModal])

	useEffect(() => {
		const layoutState = useEditorLayoutStore.getState()
		if (!layoutState.layout || layoutState.layout.length === 0) {
			console.warn('⚠️ No layout found. Seeding default layout.')
			useEditorLayoutStore.setState({
				layout: [{
					id: 'group-0',
					vertical: [
						{
							id: 'pane-0',
							tabs: [],
							activeTabPath: null
						}
					]
				}],
				focusedPaneId: 'pane-0'
			})
		}
	}, [])

	useEffect(() => {
		const layout = useEditorLayoutStore.getState().layout
		if (!layout || !Array.isArray(layout) || layout.length === 0) {
			console.warn('🧼 Resetting layout on boot')
			useEditorLayoutStore.getState().resetLayout?.()
		}
	}, [])

	useEffect(() => {
		const editorStore = useEditorLayoutStore.getState()

		const hasLayout = Array.isArray(editorStore.layout) && editorStore.layout.length > 0
		const hasPane = editorStore.layout?.[0]?.vertical?.[0]?.id

		if (!hasLayout || !hasPane) {
			console.warn('🧼 App boot: Seeding default layout manually')

			useEditorLayoutStore.setState({
				layout: [
					{
						id: 'group-0',
						vertical: [
							{
								id: 'pane-0',
								tabs: [],
								activeTabPath: null
							}
						]
					}
				],
				focusedPaneId: 'pane-0'
			})
		}
	}, [])


	async function confirmRemoveProject(project) {
		await window.electron.invoke('remove-project', project.path)
		setShowConfirmRemove(false)
		setProjectToRemove(null)
		if (selectedProject?.path === project.path) setSelectedProject(null)
		const updated = await window.electron.invoke('get-projects')
		setProjects(updated)
	}

	const loadToolPanel = (panel) => {
		if (activeView !== 'Code') return
		if (activePanel === panel && showToolPanel) {
			setShowToolPanel(false)
		} else {
			setActivePanel(panel)
			setShowToolPanel(true)
		}
	}

	const handleViewSwitch = (view) => {
		setActiveView(view)
		if (view === 'Code') {
			setShowToolPanel(true)
			setActivePanel('Explorer')
		} else {
			setShowToolPanel(false)
		}
	}

	const isCodeView = activeView === 'Code'

	return (
		<>
			<div className="w-screen h-screen bg-[#1e1e1e] text-white flex flex-row absolute top-0 left-0 right-0 bottom-[30px]">
				<div className="w-[50px] bg-[#2d2d2d] flex flex-col items-center py-2 border-r border-[#3b3b3b]">
					<div title="React Code Editor">
						<SidebarIcon
							label="Code"
							icon={<Code2 size={26} />}
							active={activeView}
							show={true}
							onClick={() => handleViewSwitch('Code')}
						/>
					</div>
					{isCodeView && (
						<div title="Search">
							<SidebarIcon
								label="Search"
								icon={<Search size={26} />}
								active={activePanel}
								show={true}
								onClick={loadToolPanel}
								disabled={!selectedProject}
							/>
						</div>
					)}

					{isCodeView && (
						<div title="Source Control">
							<SidebarIcon
								label="GitHub"
								icon={<Github size={26} />}
								active={activeView}
								show={true}
								onClick={() => handleViewSwitch('GitHub')}
								disabled={!selectedProject}
							/>
						</div>
					)}
					<div title="Notebook">
						<SidebarIcon
							label="Notebook"
							icon={<Notebook size={26} />}
							active={activeView}
							show={true}
							disabled={!selectedProject}
							onClick={() => handleViewSwitch('Notebook')}
						/>
					</div>
					<div title="React Packages">
						<SidebarIcon
							label="Library"
							icon={<Library size={26} />}
							active={activeView}
							show={true}
							disabled={!selectedProject}
							onClick={() => handleViewSwitch('Library')}
						/>
					</div>
				</div>

				<PanelGroup direction="horizontal" className="h-full w-full border-t border-[#79716b]">
					{isCodeView && showToolPanel && (
						<>
							<Panel
								defaultSize={15}
								minSize={15}
								maxSize={35}
								className="bg-[#252526] border-r border-[#3b3b3b]"
							>
								{activePanel === 'Explorer' && (
									<ExplorerPanel initialProject={selectedProject} onFileOpen={handleFileOpen} />
								)}
								{activePanel === 'Search' && <SearchPanel />}
							</Panel>

							<PanelResizeHandle className="group w-[4px] cursor-col-resize">
								<div className="w-full h-full bg-[#333] group-hover:bg-blue-500" />
							</PanelResizeHandle>
						</>
					)}

					<Panel className="flex-1 overflow-hidden">
						{activeView === 'Code' && (openTabCount > 0 ? <HorizontalSplitGroup /> : <Welcome />)}
						{activeView === 'Notebook' && <NotebookLayout selectedProject={selectedProject} />}
						{activeView === 'GitHub' && <GithubPanel />}
						{activeView === 'Library' && <ReactLibraryPanel selectedProject={selectedProject} />}
						{activeView === 'Docs' && <DocsPanel />}
					</Panel>
				</PanelGroup>
			</div>

			{/* Status Bar */}
			<div className="absolute left-0 right-0 bottom-0 z-[500] h-[30px] border-t border-t-[#6D6C6C] bg-[#2C2B2B] pt-[4px] pl-[10px] text-[.8rem]">
				<p>Status Bar</p>
			</div>


			<NewProjectModal
				isOpen={showNewProjectModal}
				onClose={() => setShowNewProjectModal(false)}
				onProgressUpdate={setProgressMessage}
				onShowProgress={() => setShowProgressDialog(true)}
				onHideProgress={() => setShowProgressDialog(false)}
				setProgressPercent={setProgressPercent}
				onProjectCreated={(project) => {
					setSelectedProject(project)
					setActivePanel('Explorer')
					setShowToolPanel(true)
					loadToolPanel('Explorer')
				}}
			/>

			<ImportProjectModal
				isOpen={showImportProjectModal}
				onClose={() => setShowImportProjectModal(false)}
				onProjectImported={(project) => {
					setSelectedProject(project)
					setActivePanel('Explorer')
					setShowToolPanel(true)
					loadToolPanel('Explorer')
				}}
			/>

			<OpenProjectModal
				isOpen={showOpenProjectModal}
				projects={projects} onClose={() => {
					setShowOpenProjectModal(false)
					setShowToolPanel(true)
				}}
				onProjectSelect={(project) => {
					setSelectedProject(project)
					setActivePanel('Explorer')
					setShowToolPanel(true)
					loadToolPanel('Explorer')
				}}
			/>

			<RemoveProjectModal
				isOpen={showRemoveProjectModal}
				projects={projects}
				onClose={() => setShowRemoveProjectModal(false)}
				onConfirm={(selected) => {
					if (selected.length === 1) {
						setProjectToRemove(selected[0])
						setShowConfirmRemoveProject(true)
					} else {
						setProjectToRemoves(selected)
						setShowConfirmRemoveProjects(true)
					}
				}}
			/>

			<ConfirmRemoveProjectsModal
				isOpen={showConfirmRemoveProjects}
				project={{ name: `${projectsToRemove.length} projects` }} // dummy for display
				onCancel={() => setShowConfirmRemoveProjects(false)}
				onConfirm={async () => {
					await Promise.all(
						projectsToRemove.map(p => window.electron.invoke('remove-project', p.path))
					)
					setShowConfirmRemoveProjects(false)
					setProjectsToRemoves([])
					const updated = await window.electron.invoke('get-projects')
					setProjects(updated)
				}}
			/>

			<ConfirmRemoveProjectsModal isOpen={showConfirmRemoveProjects} project={projectToRemove} onCancel={() => setShowConfirmRemoveProjects(false)} onConfirm={confirmRemoveProject} />

			<ProgressDialog isOpen={showProgressDialog} status={progressMessage} progress={progressPercent} />
		</>
	)
}
