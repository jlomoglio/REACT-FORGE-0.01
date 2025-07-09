// ✅ Updated RepoDetails.jsx layout
import { useState } from 'react'

export default function RepoDetails({ repoName }) {
	const [statusList, setStatusList] = useState({ created: [], modified: [], deleted: [], not_added: [] })
	const [trackedFiles, setTrackedFiles] = useState([])
	const [statusMessage, setStatusMessage] = useState('')

	async function handleCheckStatus() {
		const result = await window.electron.invoke('get-repo-status', repoName)
		if (result.success) {
			setStatusList(result.status)
			setStatusMessage('✅ Status loaded')
		} else {
			setStatusMessage(`❌ ${result.error}`)
		}
	}

	async function handleCommitPush() {
		const message = prompt('Enter commit message:')
		if (!message) return
		const result = await window.electron.invoke('commit-and-push', { repoName, message })
		setStatusMessage(result.success ? '✅ Pushed!' : `❌ ${result.error}`)
	}

	async function handleShowTracked() {
		const result = await window.electron.getTrackedFiles(repoName)
		if (result.success) {
			setTrackedFiles(result.files)
			setStatusMessage('📄 Showing all tracked files')
		} else {
			setStatusMessage(`❌ ${result.error}`)
		}
	}

	const renderSection = (label, items, color = 'gray') =>
		items.length > 0 && (
			<div className="mb-4">
				<h4 className={`font-semibold text-${color}-600 mb-1`}>{label}</h4>
				<ul className="bg-white rounded border">
					{items.map((file, i) => (
						<li key={i} className="px-3 py-1 text-sm border-b last:border-0 text-gray-800">
							📄 {file}
						</li>
					))}
				</ul>
			</div>
		)

	return (
		<div>
			<h2 className="text-xl font-bold mb-4">{repoName}</h2>

			<div className="space-x-2 mb-4">
				<button onClick={handleCheckStatus} className="px-3 py-1 bg-gray-700 text-white rounded">Check Status</button>
				<button onClick={handleCommitPush} className="px-3 py-1 bg-green-600 text-white rounded">Commit & Push</button>
				<button onClick={handleShowTracked} className="px-3 py-1 bg-indigo-600 text-white rounded">Show Tracked Files</button>
			</div>

			{statusMessage && <p className="text-sm italic text-gray-600 mb-2">{statusMessage}</p>}

			{renderSection('Created', statusList.created, 'blue')}
			{renderSection('Modified', statusList.modified, 'yellow')}
			{renderSection('Deleted', statusList.deleted, 'red')}
			{renderSection('Untracked', statusList.not_added, 'purple')}

			{trackedFiles.length > 0 && (
				<div>
					<h4 className="font-semibold text-gray-800 mb-1">Tracked Files</h4>
					<ul className="bg-white rounded border">
						{trackedFiles.map((file, i) => (
							<li key={i} className="px-3 py-1 text-sm border-b last:border-0 text-gray-800">📄 {file}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}
