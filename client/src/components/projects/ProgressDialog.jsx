import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'

export default function ProgressDialog({ isOpen, status = 'Working', progress = 0 }) {
	const [dotCount, setDotCount] = useState(1)

	useEffect(() => {
		if (!isOpen) return

		const interval = setInterval(() => {
			setDotCount(prev => (prev % 3) + 1)
		}, 400)

		return () => clearInterval(interval)
	}, [isOpen])

	const baseStatus = status.replace(/\.*$/, '')

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-[1000]" onClose={() => { }}>
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/40" />
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
							<DialogPanel className="w-[400px] transform overflow-hidden rounded bg-[#2c2b2b] p-6 text-white shadow-xl border border-gray-500 transition-all">
								<DialogTitle className="text-lg font-bold mb-4">
									Creating Project
									<p className="text-sm font-[200]">This can take a few moments to process...</p>
								</DialogTitle>

								<div className="w-full h-4 bg-gray-700 rounded relative">
									<div
										className="h-4 bg-blue-500 rounded transition-all duration-500 ease-out"
										style={{ width: `${Math.max(progress, 1)}%` }}
									>
										<span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-white">
											{progress}%
										</span>
									</div>
								</div>

								<p className="text-center mt-4 text-sm text-gray-200">
									<span>{baseStatus}</span>
									<span className="inline-block w-[1.5ch] ml-[2px] text-gray-400">
										{'.'.repeat(dotCount)}
									</span>
								</p>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}
