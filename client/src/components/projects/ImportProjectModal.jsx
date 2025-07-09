import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Folder } from 'lucide-react'

export default function ImportProjectModal({
    isOpen,
    onClose,
    onProjectImported
}) {
    const [formData, setFormData] = useState({
        projectName: '',
        description: '',
        location: '',
    })

    const [projectNameError, setProjectNameError] = useState(false)
    const [duplicateProjectError, setDuplicateProjectError] = useState(false)
    const [projectDescriptionError, setProjectDescriptionError] = useState(false)
    const [projectLocationError, setProjectLocationError] = useState(false)

    function handleChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handlePickFolder() {
        const result = await window.electron.showFolderDialog()
        if (!result.canceled && result.path) {
            setFormData(prev => ({ ...prev, location: result.path }))
            setProjectLocationError(false)
        }
    }

    async function handleImportProject() {
        let hasError = false

        // ✅ Validate fields
        if (formData.projectName.trim() === '') {
            setProjectNameError(true)
            hasError = true
        } else {
            setProjectNameError(false)
        }
        if (formData.description.trim() === '') {
            setProjectDescriptionError(true)
            hasError = true
        } else {
            setProjectDescriptionError(false)
        }
        if (formData.location.trim() === '') {
            setProjectLocationError(true)
            hasError = true
        } else {
            setProjectLocationError(false)
        }

        if (hasError) return

        const existing = await window.electron.invoke('get-projects')
        const isDuplicate = existing.some(p => p.name === formData.projectName)
        if (isDuplicate) {
            setDuplicateProjectError(true)
            return
        }

        // ✅ Close modal first
        onClose()


        // ✅ Run async operation
        const result = await window.electron.invoke('import-project', formData)


        if (result.success && onProjectImported) {
            const finalPath = formData.location

            // Save to file
            await window.electron.invoke('add-project', {
                name: formData.projectName,
                path: finalPath
            })

            onProjectImported({
                name: formData.projectName,
                path: finalPath
            })
        }

        if (!result.success) {
            console.error('❌ Failed to create project:', result.error)
        }
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
                            leave="ease-in duration-200"
                            leaveTo="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                        >
                            <DialogPanel className="w-full max-w-3xl transform rounded bg-[#1e1e1e] p-6 text-left 
								align-middle shadow-xl transition-all border border-gray-600"
                            >
                                <DialogTitle className="text-xl font-bold mb-4 text-white">
                                    Import Project
                                </DialogTitle>

                                {/* FORM */}
                                <div className="flex flex-col space-y-4">
                                    {/* Project Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-white">
                                            Project Name
                                            {projectNameError && <span className='text-red-600 pl-2'>(Required)</span>}
                                            {duplicateProjectError && <span className='text-red-600 pl-2'>(Project with this name already exists)</span>}
                                        </label>
                                        <input
                                            type="text"
                                            name="projectName"
                                            value={formData.projectName}
                                            onChange={handleChange}
                                            onFocus={() => {
                                                setProjectNameError(false)
                                                setDuplicateProjectError(false)
                                            }}
                                            className="mt-1 w-full rounded border border-gray-500 bg-[#2c2b2b] text-white px-3 py-2"
                                        />
                                    </div>

                                    {/* Project Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-white">
                                            Project Description
                                            {projectDescriptionError && <span className='text-red-600 pl-2'>(Required)</span>}
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            onFocus={() => setProjectDescriptionError(false)}
                                            className="mt-1 w-full rounded border border-gray-500 bg-[#2c2b2b] text-white px-3 py-2"
                                        />
                                    </div>

                                    {/* Project Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-[2px]">
                                            Project Location
                                            {projectLocationError && <span className='text-red-600 pl-2'>(Required)</span>}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full rounded border border-gray-500 bg-[#2c2b2b] text-white px-3 py-2"
                                                readOnly
                                            />
                                            <div
                                                onClick={handlePickFolder}
                                                className='cursor-pointer'
                                            >
                                                <Folder size={44} className="text-white" />
                                            </div>
                                        </div>
                                    </div>


                                    {/* Actions */}
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={onClose}
                                            className="mr-4 px-4 py-2 rounded text-white bg-gray-700 hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleImportProject}
                                            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-500"
                                        >
                                            Import Project
                                        </button>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
