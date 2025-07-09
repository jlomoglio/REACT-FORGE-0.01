import { ChevronDown, AlignJustify } from 'lucide-react'

export default function StashesSection({ stashes = [], onApply, onPop, onDrop }) {
	return (
		<div className="px-4 pt-3 overflow-y-auto h-full">
			<div className="space-y-2">
				{stashes.map((stash, idx) => (
					<div key={idx} className="flex justify-between items-center gap-2">
						<div className="flex items-center gap-2">
							<ChevronDown size={14} />
							<AlignJustify size={14} />
							<span>{stash.message}</span>
						</div>
						<span className="text-xs text-gray-400">{stash.time}</span>
					</div>
				))}
			</div>
			<div className="flex gap-2 justify-center mt-4">
				<button className="px-4 bg-[#424242] text-sm" onClick={onApply}>Apply</button>
				<button className="px-4 bg-[#424242] text-sm" onClick={onPop}>Pop</button>
				<button className="px-4 bg-[#424242] text-sm" onClick={onDrop}>Drop</button>
			</div>
		</div>
	)
}

