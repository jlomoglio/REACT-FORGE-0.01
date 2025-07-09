import { useState } from 'react'
import { File, Minus } from 'lucide-react'
import Tooltip from '../ui/Tooltip'

export default function CommitPanel({ selectedProject, stagedFiles = [], onCommit, onCommitPush, onUndo, refreshStatus }) {
	const [commitMessage, setCommitMessage] = useState("")

	return (
		<div className="flex gap-4 h-full">
			<div className="w-[250px] border-r border-r-[#6D6C6C] pt-4">
				<h3 className="text-sm font-semibold mb-2 ml-4 text-gray-300">STAGED FILES</h3>
				<ul className="space-y-1">
					{stagedFiles.map((file, idx) => (
						<li key={idx} className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#3A3A3A] cursor-pointer">
							<div className="flex items-center gap-2">
								<File size={16} className="text-gray-400" />
								<span className="truncate">{file.name.split('/').pop()}</span>
							</div>
							<Tooltip content="Unstage file">
								<Minus
									size={16}
									className="text-gray-400 hover:text-red-400"
									onClick={async (e) => {
										e.stopPropagation()
										await window.electron.invoke('unstage-file', {
											repoName: selectedProject.name,
											file: file.name,
										})
										await refreshStatus()
									}}
								/>
							</Tooltip>
						</li>
					))}
				</ul>
			</div>

			<div className="flex-1 flex flex-col pt-4">
				<h3 className="text-sm font-semibold mb-2 text-gray-300">Commit Message</h3>
				<textarea
					className="w-full h-[120px] p-2 bg-[#1E1E1E] text-white border border-gray-600 rounded resize-none mb-4"
					placeholder="Write a commit message..."
					value={commitMessage}
					onChange={(e) => setCommitMessage(e.target.value)}
				/>
				<div className="flex gap-3">
					<button
						className="px-4 py-2  bg-[#404040] hover:bg-[#57534d] rounded text-white text-sm"
						onClick={() => onCommit(commitMessage)}
					>
						Commit
					</button>
					<button
						className="px-4 py-2  bg-[#404040] hover:bg-[#57534d] rounded text-white text-sm"
						onClick={() => onCommitPush(commitMessage)}
					>
						Commit & Push
					</button>
					<button
						className="px-4 py-2 bg-[#404040] hover:bg-[#57534d] rounded text-white text-sm"
						onClick={onUndo}
					>
						Undo Last Commit
					</button>
				</div>
			</div>
		</div>
	)
}
