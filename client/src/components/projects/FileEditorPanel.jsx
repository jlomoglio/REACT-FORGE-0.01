// Basic Monaco Editor integration with tabbed file viewing
import { useState } from 'react'
import Editor from '@monaco-editor/react'

export default function FileEditorPanel() {
	const [tabs, setTabs] = useState([]) // [{ path, name, content }]
	const [activeTab, setActiveTab] = useState(null)

	const openFile = async (filePath) => {
		if (tabs.some(t => t.path === filePath)) {
			setActiveTab(filePath)
			return
		}

		const res = await window.electron.invoke('read-file', filePath)
		if (res.success) {
			const newTab = {
				path: filePath,
				name: filePath.split('/').pop(),
				content: res.content
			}
			setTabs(prev => [...prev, newTab])
			setActiveTab(filePath)
		} else {
			console.error('Failed to open file:', res.error)
		}
	}

	const handleEditorChange = (value) => {
		setTabs(prev => prev.map(tab =>
			tab.path === activeTab ? { ...tab, content: value } : tab
		))
	}

	return (
		<div className="flex flex-col h-full w-full">
			<div className="flex bg-[#1f1f1f] border-b border-[#333]">
				{tabs.map(tab => (
					<div
						key={tab.path}
						className={`px-4 py-2 cursor-pointer text-sm border-r border-[#333] ${activeTab === tab.path ? 'bg-[#2c2c2c]' : ''}`}
						onClick={() => setActiveTab(tab.path)}
					>
						{tab.name}
					</div>
				))}
			</div>

			<div className="flex-1">
				{activeTab && (
					<Editor
						height="100%"
						defaultLanguage="javascript"
						theme="vs-dark"
						value={tabs.find(t => t.path === activeTab)?.content}
						onChange={handleEditorChange}
						options={{
							fontSize: 14,
							minimap: { enabled: false },
							automaticLayout: true,
							scrollBeyondLastLine: false
						}}
					/>
				)}
			</div>
		</div>
	)
}
