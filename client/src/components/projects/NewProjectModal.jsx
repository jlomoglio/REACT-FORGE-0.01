import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Folder } from 'lucide-react'

export default function NewProjectModal({
	isOpen,
	onClose,
	onProgressUpdate,
	onShowProgress,
	onHideProgress,
	setProgressPercent,
	onProjectCreated
}) {
	const [formData, setFormData] = useState({
		projectName: '',
		description: '',
		location: '',
		projectType: '',
		reactPort: '',
		apiPort: ''
	})

	const [projectNameError, setProjectNameError] = useState(false)
	const [duplicateProjectError, setDuplicateProjectError] = useState(false)
	const [projectDescriptionError, setProjectDescriptionError] = useState(false)
	const [projectLocationError, setProjectLocationError] = useState(false)
	const [projectTypeError, setProjectTypeError] = useState(false)
	const [reactPortError, setReactPortError] = useState(false)
	const [apiPortError, setApiPortError] = useState(false)

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

	function isValidPort(value) {
		const num = parseInt(value, 10)
		return !isNaN(num) && num >= 1024 && num <= 65535
	}

	async function handleCreateProject() {
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
		if (formData.projectType.trim() === '') {
			setProjectTypeError(true)
			hasError = true
		} else {
			setProjectTypeError(false)
		}
		if (formData.reactPort && !isValidPort(formData.reactPort)) {
			setReactPortError(true)
			hasError = true
		} else {
			setReactPortError(false)
		}
		if (formData.apiPort && !isValidPort(formData.apiPort)) {
			setApiPortError(true)
			hasError = true
		} else {
			setApiPortError(false)
		}
		if (hasError) return

		// ✅ Close modal first
		onClose()

		// ✅ Show progress
		setTimeout(() => {
			onShowProgress()
			setProgressPercent(5)
			onProgressUpdate('Copying files...')
			simulateProgress()
		}, 200) // slight delay to allow modal to disappear

		// ✅ Run async operation
		const result = await window.electron.invoke('create-project', formData)

		// ✅ Update UI
		onProgressUpdate('Installing dependencies...')

		setTimeout(() => {
			setProgressPercent(100)
			onProgressUpdate('Done!')

			setTimeout(() => {
				setProgressPercent(0)
				onHideProgress()
			}, 1200)
		}, 1000)

		if (result.success && onProjectCreated) {
			const finalPath = `${formData.location}/${formData.projectName}`

			// Save to file
			await window.electron.invoke('add-project', {
				name: formData.projectName,
				path: finalPath
			})

			onProjectCreated({
				name: formData.projectName,
				path: finalPath
			})
		}

		if (!result.success) {
			console.error('❌ Failed to create project:', result.error)
			if (result.error?.includes('already exists')) {
				setDuplicateProjectError(true)
				setShowProgressDialog(false)
				setProgressPercent(0)
				return
			}
			return
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
									New Project
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

									{/* Project Type */}
									<div>
										<label className="block text-sm font-medium text-white">
											Template Type
											{projectTypeError && <span className='text-red-600 pl-2'>(Required)</span>}
										</label>
										<select
											name="projectType"
											value={formData.projectType}
											onChange={handleChange}
											onFocus={() => setProjectTypeError(false)}
											className="mt-1 w-full rounded border border-gray-500 bg-[#2c2b2b] text-white px-3 py-2"
										>
											<option value="">Select one</option>
											<option value="react">React Project</option>
											<option value="react-api">React Project & API</option>
											<option value="electron-react">Electron React Project</option>
											<option value="electron-react-api">Electron React Project & API</option>
										</select>
									</div>

									{/* Ports */}
									<div className="flex space-x-4">
										<div className="flex-1">
											<label className="block text-sm font-medium text-white">
												React Port
												{reactPortError && <span className="text-red-600 pl-2">(1024–65535 only)</span>}
											</label>
											<input
												type="text"
												name="reactPort"
												value={formData.reactPort}
												onChange={handleChange}
												placeholder="Default 5173"
												className="mt-1 w-full rounded border border-gray-500 bg-[#2c2b2b] text-white px-3 py-2"
											/>
										</div>
										<div className="flex-1">
											<label className="block text-sm font-medium text-white">
												API Port
												{apiPortError && <span className="text-red-600 pl-2">(1024–65535 only)</span>}
											</label>
											<input
												type="text"
												name="apiPort"
												value={formData.apiPort}
												onChange={handleChange}
												placeholder="Default 5000"
												className="mt-1 w-full rounded border border-gray-500 bg-[#2c2b2b] text-white px-3 py-2"
											/>
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
											onClick={handleCreateProject}
											className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-500"
										>
											Create Project
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
