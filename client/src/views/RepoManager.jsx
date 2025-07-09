import { useState, useEffect } from 'react'
import RepoSidebar from '../components/projects/ProjectSidebar'
import RepoDetails from './RepoDetails'
import CreateRepoForm from './CreateRepoForm'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export default function RepoManager() {
	const [repos, setRepos] = useState([])
	const [selectedRepo, setSelectedRepo] = useState(null)
	const [activity, setActivity] = useState('')
	const [showCreateModal, setShowCreateModal] = useState(false)

	useEffect(() => {
		refreshRepos()
	}, [])

	async function refreshRepos() {
		const data = await window.electron.invoke('get-local-repos')
		setRepos(data)
		if (data.length && !selectedRepo) {
			setSelectedRepo(data[0])
		}
	}

	async function handleTrackFolder() {
		const result = await window.electron.trackExistingFolder()
		if (result.success) {
			await refreshRepos()
		} else {
			alert(`❌ ${result.error}`)
		}
	}

	function handleRepoCreated(name) {
		setShowCreateModal(false)
		refreshRepos()
	}

	return (
		<div className="flex flex-col h-full m-0 p-0">
			<div className="flex flex-1 overflow-hidden">
				<RepoSidebar
					repos={repos}
					selected={selectedRepo?.name}
					onSelect={name => {
						const match = repos.find(r => r.name === name)
						setSelectedRepo(match)
					}}
				/>

				<main className="flex-1 p-4 overflow-y-auto">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-[1.5rem] font-bold">Repositories</h2>
						<div className="space-x-2">
							<button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setShowCreateModal(true)}>+ New Repo</button>
							<button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={handleTrackFolder}>📂 Track Folder</button>
						</div>
					</div>

					{selectedRepo ? (
						<RepoDetails repoName={selectedRepo.name} setActivity={setActivity} />
					) : (
						<div className="text-gray-500">Select a repository from the left panel.</div>
					)}
				</main>
			</div>

			{/* 🧠 Status Bar */}
			<div className="h-8 px-4 flex items-center text-sm bg-gray-900 text-gray-300 border-t border-gray-800">
				{selectedRepo ? (
					<>
						📁 {selectedRepo.name} — <span className="ml-2 truncate">{selectedRepo.path}</span>
						{activity && <span className="ml-auto italic text-blue-400">{activity}</span>}
					</>
				) : (
					<span>No repo selected</span>
				)}
			</div>

			{/* Create Repo Modal */}
			<Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} className="relative z-50">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
				<div className="fixed inset-0 flex items-center justify-center p-4">
					<DialogPanel className="w-full max-w-md rounded bg-white p-6">
						<DialogTitle className="text-lg font-bold mb-4">Create GitHub Repo</DialogTitle>
						<CreateRepoForm onDone={handleRepoCreated} />
					</DialogPanel>
				</div>
			</Dialog>
		</div>
	)
}
