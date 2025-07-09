import { ChevronUp, ChevronDown } from 'lucide-react'

export default function ResizableCollapsiblePanel({
	title,
	height,
	collapsed,
	onToggle,
	children
}) {
	const minHeight = 32

	return (
		<div
			className="flex flex-col overflow-hidden"
			style={{
				flexBasis: collapsed ? '32px' : `${height}%`,
				flexShrink: 0,
				flexGrow: 0,
			}}
		>
			<div
				className="flex items-center justify-between px-4 py-1 bg-[#1F1F1F] cursor-pointer select-none"
				onClick={onToggle}
			>
				<div className="font-semibold tracking-wide">{title}</div>
				{collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
			</div>

			<div className={`flex-1 ${collapsed ? 'hidden' : 'block'} overflow-y-auto`}>
				{children}
			</div>
		</div>
	)
}
