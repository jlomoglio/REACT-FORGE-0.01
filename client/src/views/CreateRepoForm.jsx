import { useState } from 'react'

export default function CreateRepoForm({ onDone }) {
	const [token, setToken] = useState('')
	const [repoName, setRepoName] = useState('')
	const [description, setDescription] = useState('')
	const [isPrivate, setIsPrivate] = useState(true)
	const [message, setMessage] = useState('')

	async function handleCreateRepo() {
		setMessage('Creating repo...')

		const result = await window.electron.invoke('create-github-repo', {
			token,
			repoName,
			description,
			isPrivate
		})

		if (!result.success) {
			setMessage(`❌ Error creating repo: ${result.error}`)
			return
		}

		const repoUrl = result.repo.clone_url
		setMessage(`✅ Repo created: ${result.repo.full_name}\nCloning...`)

		const cloneResult = await window.electron.invoke('clone-repo', repoUrl)

		if (!cloneResult.success) {
			setMessage(`✅ Repo created, but clone failed: ${cloneResult.error}`)
		} else {
			setMessage(`✅ Repo created and cloned to ${cloneResult.repoPath}`)
			onDone(repoName) // return the name of the created repo
		}
	}

	return (
		<div className="space-y-3">
			<input type="text" className="w-full p-2 border" placeholder="GitHub Token" value={token} onChange={(e) => setToken(e.target.value)} />
			<input type="text" className="w-full p-2 border" placeholder="Repository Name" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
			<input type="text" className="w-full p-2 border" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
			<label className="block">
				<input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} /> Private Repo
			</label>
			<button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleCreateRepo}>Create</button>
			{message && <p className="text-sm">{message}</p>}
		</div>
	)
}
