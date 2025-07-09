import { useState, useEffect } from 'react'
import { useEditorLayoutStore } from '@/state/editorLayoutState'
import MonacoEditor from './MonacoEditor'
import TabsBar from './TabsBar'
import Welcome from '@/views/Welcome'

export default function EditorPane({ pane }) {
	const [activeTab, setActiveTab] = useState(() => pane.tabs.at(-1) || null)
	const removeTab = useEditorLayoutStore(state => state.removeTab)
	const focusedPaneId = useEditorLayoutStore(state => state.focusedPaneId)
	const setFocusedPane = useEditorLayoutStore(state => state.setFocusedPane)

	useEffect(() => {
		// Only set activeTab if there’s no valid one already
		if (!activeTab || !pane.tabs.find(t => t.fullPath === activeTab.fullPath)) {
			const lastTab = pane.tabs.at(-1)
			if (lastTab) {
				setActiveTab(lastTab)
			}
		}
	}, [pane.tabs, activeTab])

	const handleTabClick = (tab) => {
		useEditorLayoutStore.getState().updatePane(pane.id, {
			activeTabPath: tab.fullPath
		})
		useEditorLayoutStore.getState().setFocusedPane(pane.id)
		useEditorLayoutStore.getState().setSelectedNodePath?.(tab.fullPath) // optional sync to explorer
	}

	const handleCloseTab = (tabPath) => {
		removeTab(pane.id, tabPath)
		if (activeTab?.fullPath === tabPath) {
			setActiveTab(pane.tabs.filter(t => t.fullPath !== tabPath).at(-1) || null)
		}
	}

	const handleSplitTab = (direction, tab, sourcePaneId) => {
		if (!tab || !sourcePaneId) {
			console.warn('[❌ Missing split params in handleSplitTab]', { tab, sourcePaneId })
			return
		}
		useEditorLayoutStore.getState().splitPane({ direction, sourcePaneId, tab })
	}

	const getLanguage = (filePath = '') => {
		const ext = filePath.split('.').pop()
		return {
			js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
			json: 'json', html: 'html', css: 'css', md: 'markdown', txt: 'plaintext'
		}[ext] || 'plaintext'
	}

	// const handleTabDrop = (tabId, fromPaneId, toPaneId, targetTabId) => {
	// 	const store = useEditorLayoutStore.getState()

	// 	if (fromPaneId === toPaneId) {
	// 		store.reorderTabWithinPane?.(toPaneId, tabId, targetTabId)
	// 	} else {
	// 		store.moveTabToPane?.(tabId, fromPaneId, toPaneId)
	// 	}
	// }

	const handleTabDrop = (tabId, fromPaneId, toPaneId, targetIndex) => {
		useEditorLayoutStore.getState().moveTabToPane(tabId, fromPaneId, toPaneId, targetIndex)
	}

	return (
		<div className="flex flex-col w-full h-full bg-[#2C2B2B] border-t border-t-[#6D6C6C]">
			<TabsBar
				paneId={pane.id}
				tabs={pane.tabs}
				activeFilePath={pane.activeTabPath}
				focusedPane={focusedPaneId}
				onTabClick={handleTabClick}
				onCloseTab={handleCloseTab}
				onTabDrop={handleTabDrop}
				onSplitTab={handleSplitTab}
			//onSelectAll={handleSelectAll}
			//onCopyAll={handleCopyAll}
			/>
			<div className="flex-1 relative">
				{pane.tabs.length === 0 ? (
					<Welcome />
				) : (
					pane.tabs.map(tab =>
						tab.fullPath === pane.activeTabPath && (
							<MonacoEditor
								key={tab.id}
								filePath={tab.fullPath}
								content={tab.content}
								language={tab.language}
								paneId={pane.id}
							/>
						)
					)
				)}
			</div>
		</div>
	)
}
