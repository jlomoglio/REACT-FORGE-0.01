export default function Settings() {
	return (
		<div className="">
			<div className="text-xl font-semibold">Settings</div>

			<button onClick={async () => {
				const result = await window.electron.invoke('show-folder-dialog')
				if (result.canceled || !result.path) return
				await window.electron.setDefaultRepoPath(result.path)
				alert('✅ Default repo path updated.')
			}}>
				Set Default Repo Folder
			</button>
		</div>
	)
}