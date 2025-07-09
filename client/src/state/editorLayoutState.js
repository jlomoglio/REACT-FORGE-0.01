import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { createFullTab } from '@/utils/tabs'

function createPane(id, tab) {
	if (!id || typeof id !== 'string') {
		console.warn('[⚠️ createPane received bad ID]', id)
	}
	if (tab?.id && typeof tab.id !== 'string') {
		console.warn('[⚠️ createPane received bad tab ID]', tab.id)
	}
	return {
		id,
		tabs: tab ? [tab] : [],
		activeTabPath: tab?.fullPath || tab?.path || null,
	}
}

export const useEditorLayoutStore = create((set, get) => ({
	focusedView: '',
	setFocusedView: (view) => set({ focusedView: view }),

	selectedNodePath: null,
	setSelectedNodePath: (path) => set({ selectedNodePath: path }),


	layout: [
		{ id: 'group-0', vertical: [createPane('pane-0')] }
	],
	panes: [createPane('pane-0')],
	focusedPaneId: 'pane-0',

	setFocusedPane: (paneId) => set({ focusedPaneId: paneId }),

	updatePane: (paneId, changes) => {
		set(state => ({
			panes: state.panes.map(p => p.id === paneId ? { ...p, ...changes } : p)
		}))
	},

	splitPane: ({ direction, sourcePaneId, tab }) => {
		const state = get()

		if (!sourcePaneId || typeof sourcePaneId !== 'string' || !/^pane-\w+/.test(sourcePaneId)) {
			console.error('[🛑 Invalid sourcePaneId in splitPane]', sourcePaneId)
			return
		}

		const layout = [...state.layout]
		const sourceGroup = layout.find(g => g.vertical?.some(p => p.id === sourcePaneId))

		if (!sourceGroup || !direction || !sourcePaneId || !tab) return



		const newPaneId = `pane-${nanoid(6)}`
		const newGroupId = `group-${nanoid(4)}`
		const fullTab = createFullTab(tab, tab.content ?? '', newPaneId)
		const newPane = createPane(newPaneId, fullTab)
		newPane.activeTabPath = fullTab.fullPath

		if (direction === 'right' || direction === 'left') {
			if (layout.length >= 3) return
			const insertIndex = direction === 'left' ? 0 : layout.length
			layout.splice(insertIndex, 0, { id: newGroupId, vertical: [newPane] })
		} else if (direction === 'up' || direction === 'down') {
			if (sourceGroup.vertical.length >= 3) return
			const insertIndex = direction === 'up' ? 0 : sourceGroup.vertical.length
			sourceGroup.vertical.splice(insertIndex, 0, newPane)
		}

		set({
			layout,
			panes: [...state.panes, newPane],
			focusedPaneId: newPaneId
		})

		// console.log('[🧠 Layout update | splitPane]', JSON.stringify(layout, null, 2))
		// //console.log('[🧱 Layout]', useEditorLayoutStore.getState().layout)
		// console.log('[🧱 Panes]', useEditorLayoutStore.getState().panes)

		return newPaneId
	},

	removeTab: (paneId, tabPath) => {
		// 🔥 Dispose Monaco model before doing anything else
		if (window.monaco?.editor) {
			const uri = window.monaco.Uri.file(tabPath)
			const model = window.monaco.editor.getModel(uri)
			if (model) {
				model.dispose()
				console.log('[🧹 Disposed model]', tabPath)
			}
		}

		set(state => {
			let panes = [...state.panes]
			let layout = [...state.layout]
			const paneIndex = panes.findIndex(p => p.id === paneId)
			if (paneIndex === -1) return {}

			const pane = panes[paneIndex]
			const wasActive = pane.activeTabPath === tabPath
			const remainingTabs = pane.tabs.filter(tab => tab.fullPath !== tabPath)

			if (remainingTabs.length === 0) {
				//window.unsetSelectedFile()
				panes.splice(paneIndex, 1)
				layout = layout.map(group => ({
					...group,
					vertical: group.vertical.filter(p => p.id !== paneId)
				})).filter(g => g.vertical.length > 0)
			} else {
				const fallbackTab = remainingTabs.at(-1)?.fullPath || null
				panes[paneIndex] = {
					...pane,
					tabs: remainingTabs,
					activeTabPath: wasActive ? fallbackTab : pane.activeTabPath
				}
			}

			let newFocus = state.focusedPaneId

			if (!panes.some(p => p.id === state.focusedPaneId)) {
				// Try to focus a sibling pane in the same vertical group
				const currentGroup = layout.find(group =>
					group.vertical.some(p => p.id === paneId)
				)
				const paneIndexInGroup = currentGroup?.vertical.findIndex(p => p.id === paneId)

				const siblingPane =
					currentGroup?.vertical[paneIndexInGroup - 1] ||
					currentGroup?.vertical[paneIndexInGroup + 1]

				if (siblingPane) {
					newFocus = siblingPane.id
				} else {
					// If no vertical siblings, fallback to another group (horizontal)
					const otherGroup = layout.find(group => group.id !== currentGroup?.id)
					newFocus = otherGroup?.vertical[0]?.id || 'pane-0'
				}
			}

			return {
				layout,
				panes,
				focusedPaneId: newFocus
			}
		})

		setTimeout(() => {
			const layout = get().layout
			const updatedPanes = get().panes.map(p => {
				const activeValid = p.tabs.some(t => t.fullPath === p.activeTabPath)
				return {
					...p,
					activeTabPath: activeValid ? p.activeTabPath : p.tabs.at(-1)?.fullPath || null
				}
			})

			set({
				layout: cleanLayout(layout, updatedPanes),
				panes: updatedPanes,
			})
		}, 10)
	},

	moveTabToPane: (tabId, fromPaneId, toPaneId, targetIndex = null) => {
		console.log('[🧠 moveTabToPane]', { tabId, fromPaneId, toPaneId, targetIndex })

		if (!tabId || !fromPaneId || !toPaneId) {
			console.warn('🚨 Invalid args to moveTabToPane:', { tabId, fromPaneId, toPaneId })
			return
		}

		set(state => {
			const fromPane = state.panes.find(p => p.id === fromPaneId)
			const toPane = state.panes.find(p => p.id === toPaneId)
			if (!fromPane || !toPane) return {}

			const tabIndex = fromPane.tabs.findIndex(t => t.id === tabId)
			if (tabIndex === -1) return {}

			const [tab] = fromPane.tabs.splice(tabIndex, 1)

			// Prevent duplicate
			if (toPane.tabs.find(t => t.id === tab.id)) return {}

			tab.pane = toPaneId

			// Insert at position or push
			if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= toPane.tabs.length) {
				toPane.tabs.splice(targetIndex, 0, tab)
			} else {
				toPane.tabs.push(tab)
			}

			// Reset activeTabPath
			if (fromPane.activeTabPath === tab.fullPath) {
				fromPane.activeTabPath = fromPane.tabs.at(-1)?.fullPath || null
			}
			toPane.activeTabPath = tab.fullPath

			return {
				panes: [...state.panes],
				focusedPaneId: toPaneId
			}
		})
	},


	reorderTabWithinPane: (paneId, tabId, targetTabId) => {
		console.log('[🔀 reorderTabWithinPane]', { paneId, tabId, targetTabId })

		set(state => {
			const pane = state.panes.find(p => p.id === paneId)
			if (!pane) return {}

			const fromIndex = pane.tabs.findIndex(t => t.id === tabId)
			const toIndex = pane.tabs.findIndex(t => t.id === targetTabId)

			if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return {}

			const updatedTabs = [...pane.tabs]
			const [movedTab] = updatedTabs.splice(fromIndex, 1)
			updatedTabs.splice(toIndex, 0, movedTab)

			return {
				panes: state.panes.map(p =>
					p.id === paneId
						? { ...p, tabs: updatedTabs }
						: p
				)
			}
		})
	}
}))

export const getSplitCountsByGroup = () => {
	const state = useEditorLayoutStore.getState()
	return {
		horizontal: state.layout.length,
		vertical: state.layout.reduce((max, g) => Math.max(max, g.vertical?.length || 1), 1)
	}
}

export const collapseToSinglePane = () => {
	useEditorLayoutStore.setState({
		layout: [
			{
				id: 'group-0',
				vertical: [createPane('pane-0')]
			}
		],
		panes: [createPane('pane-0')],
		focusedPaneId: 'pane-0'
	})
}

export const hasAnyOpenTabs = () => {
	const { layout } = useEditorLayoutStore.getState()
	return layout.some(group => group.vertical?.some(pane => pane.tabs.length > 0))
}

export const useOpenTabCount = () => {
	return useEditorLayoutStore(state => {
		return state.layout.reduce((count, group) => {
			return count + (group.vertical?.reduce((inner, pane) => inner + (pane.tabs?.length || 0), 0) || 0)
		}, 0)
	})
}

function cleanLayout(layout, panes) {
	return layout.map(group => {
		const vertical = group.vertical.filter(p => panes.some(x => x.id === p.id))
		return { ...group, vertical }
	}).filter(group => group.vertical.length > 0)
}
