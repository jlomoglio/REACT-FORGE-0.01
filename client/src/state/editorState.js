// editorState.js
import { useSyncExternalStore } from 'react'

let lastSnapshot = null

export const editorState = {
	activeFilePath: null,
	focusedPane: 'left',
	leftTabs: [],
	rightTabs: [],
	activeLeftFilePath: null,
	activeRightFilePath: null,
	subscribers: new Set(),

	subscribe(fn) {
		this.subscribers.add(fn)
		return () => this.subscribers.delete(fn)
	},

	getSnapshot() {
		if (lastSnapshot) return lastSnapshot
		lastSnapshot = {
			activeFilePath: this.activeFilePath,
			focusedPane: this.focusedPane,
			leftTabs: [...this.leftTabs],
			rightTabs: [...this.rightTabs],
			activeLeftFilePath: this.activeLeftFilePath,
			activeRightFilePath: this.activeRightFilePath
		}
		return lastSnapshot
	}
}

export const editorActions = {
	update(updates) {
		if (!updates || typeof updates !== 'object') {
			console.error('❌ Invalid update call:', updates)
			return
		}

		Object.assign(editorState, updates)
		lastSnapshot = null
		editorState.subscribers.forEach(fn => fn())
	},

	reset() {
		this.update({
			activeFilePath: null,
			focusedPane: 'left',
			leftTabs: [],
			rightTabs: [],
			activeLeftFilePath: null,
			activeRightFilePath: null
		})
	}
}

export function useEditorState() {
	return useSyncExternalStore(
		editorState.subscribe.bind(editorState),
		() => editorState.getSnapshot()
	)
}
