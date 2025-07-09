import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'

export default function ConfirmRemoveProjectsModal({ isOpen, project, onCancel, onConfirm }) {
	if (!project) return null

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-[1000]" onClose={onCancel}>
				<TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
					<div className="fixed inset-0 bg-black/50" />
				</TransitionChild>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" leave="ease-in duration-200" leaveTo="opacity-0 scale-95" enterTo="opacity-100 scale-100">
							<DialogPanel className="w-full max-w-md transform rounded bg-[#1e1e1e] p-6 text-white shadow-xl border border-gray-600 transition-all">
								<DialogTitle className="text-lg font-bold mb-4">Remove Projects</DialogTitle>
								<p className="text-sm text-gray-300 mb-6">
									Are you sure you want to remove <strong>{project.name}</strong> from your workspace? This does <u>not</u> delete the project from disk.
								</p>
								<div className="flex justify-end gap-4">
									<button onClick={onCancel} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
										Cancel
									</button>
									<button onClick={() => onConfirm(project)} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded">
										Remove
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
