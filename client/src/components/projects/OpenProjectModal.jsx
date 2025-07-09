import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { X } from 'lucide-react'

export default function OpenProjectModal({ isOpen, onClose, onProjectSelect, projects = [] }) {
    const [selected, setSelected] = useState(null)

    function handleNewProjectModal() {
        window.dispatchEvent(new CustomEvent('menu:new-project'))
        onClose()
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[1000]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-xl rounded bg-[#1e1e1e] p-6 text-white shadow-xl border border-gray-600">
                                <DialogTitle className="text-xl font-bold mb-4 flex flex-row relative">
                                    Projects
                                    <div className="absolute right-4 py-1 cursor-pointer" onClick={() => onClose()}>
                                        <X size={24} />
                                    </div>
                                </DialogTitle>

                                {projects.length === 0 ? (
                                    <>
                                        <div className="p-6 space-y-4">
                                            <p className="text-sm text-gray-300 select-none">There are no projects yet.</p>
                                            <div
                                                className="flex flex-row px-4 py-2 justify-center w-full bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-500  select-none"
                                                onClick={handleNewProjectModal}
                                            >
                                                Add Project
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <p className="text-sm text-gray-300 select-none">You can also import an existing project.</p>
                                            <div
                                                className="flex flex-row px-4 py-2 justify-center w-full bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-500  select-none"
                                            >
                                                Import Project
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ul className="space-y-1 max-h-[300px] overflow-auto custom-scrollbar">
                                            {projects.map((project, i) => (
                                                <li
                                                    key={i}
                                                    className={`px-4 py-2 rounded cursor-pointer ${selected?.path === project.path ? 'bg-blue-600' : 'hover:bg-[#333]'}`}
                                                    onClick={() => setSelected(project)}
                                                >
                                                    {project.name}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="pt-4 flex justify-end space-x-3">
                                            <button
                                                onClick={onClose}
                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selected) {
                                                        onProjectSelect(selected)
                                                        onClose()
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
                                                disabled={!selected}
                                            >
                                                Open Project
                                            </button>
                                        </div>
                                    </>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
