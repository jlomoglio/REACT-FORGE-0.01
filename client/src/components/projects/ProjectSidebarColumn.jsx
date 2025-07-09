// ProjectSidebarColumn.jsx
import { useState } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ProjectSidebarColumn({ panels }) {
	const [collapsed, setCollapsed] = useState(panels.map(() => false))

	const toggleCollapsed = (index) => {
		const updated = [...collapsed]
		updated[index] = !updated[index]
		setCollapsed(updated)
	}

	return (
		<div className="flex flex-col h-full overflow-hidden select-none">
			{panels.map((panel, i) => {
				const isCollapsed = collapsed[i]
				const isLast = i === panels.length - 1

				const style = isCollapsed
					? { height: '32px', flexShrink: 0 }
					: isLast
						? { flexGrow: 1, minHeight: '40px', overflow: 'hidden' } // File Tree fills remaining space, no collapse toggle
						: { flexShrink: 0, minHeight: '200px', overflow: 'hidden' } // Branches gets a bit more height

				return (
					<div key={panel.id + '-container'} className="flex flex-col border-b border-[#6D6C6C]" style={style}>
						{!isLast && (
							<div
								className="flex items-center justify-between px-4 py-2 bg-[#1F1F1F] cursor-pointer"
								onClick={() => toggleCollapsed(i)}
							>
								<div className="font-semibold tracking-wide text-sm">{panel.title}</div>
								<ChevronUp size={16} />
							</div>
						)}
						{!isCollapsed && (
							<div className="overflow-y-auto flex-1">
								{panel.content}
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}