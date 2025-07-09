import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { X } from 'lucide-react'

export default function RemoveProjectModal({ isOpen, onClose, projects = [], onConfirm }) {
	const [selectedProjects, setSelectedProjects] = useState([])

	function toggleSelection(project) {
		setSelectedProjects(prev =>
			prev.some(p => p.path === project.path)
				? prev.filter(p => p.path !== project.path)
				: [...prev, project]
		)
	}

	function handleRemove() {
		if (selectedProjects.length === 0) return
		onConfirm(selectedProjects)
		onClose()
	}

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-[1000]" onClose={onClose}>
				<TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
					<div className="fixed inset-0 bg-black/50" />
				</TransitionChild>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" leave="ease-in duration-200" leaveTo="opacity-0 scale-95" enterTo="opacity-100 scale-100">
							<DialogPanel className="w-full max-w-xl rounded bg-[#1e1e1e] p-6 text-white shadow-xl border border-gray-600">
								<DialogTitle className="text-xl font-bold mb-4 flex flex-row relative">
									Remove Projects
									<div className="absolute right-4 py-1 cursor-pointer" onClick={onClose}>
										<X size={24} />
									</div>
								</DialogTitle>

								{projects.length === 0 ? (
									<p className="text-sm text-gray-300">There are no projects to remove.</p>
								) : (
									<ul className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar pr-2">
										{projects.map((project, i) => (
											<li key={i} className="flex items-center space-x-3 bg-[#2a2a2a] p-2 rounded hover:bg-[#333]">
												<input
													type="checkbox"
													checked={selectedProjects.some(p => p.path === project.path)}
													onChange={() => toggleSelection(project)}
												/>
												<span>{project.name}</span>
											</li>
										))}
									</ul>
								)}

								<div className="pt-4 flex justify-end space-x-3">
									<button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white">
										Cancel
									</button>
									<button
										onClick={handleRemove}
										className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
										disabled={selectedProjects.length === 0}
									>
										Remove Selected
									</button>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}
