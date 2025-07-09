export default function StyleGuideWidget({ color, label, code }) {
	return (
		<div className="flex flex-row w-[300px] h-[40px]">
			<div className={`w-[40px] h-[40px] mr-2`} style={{ backgroundColor: color }}></div>
			<div className="flex flex-col">
				<span className="text-[1rem] text-white font-medium mt-[-3px]">{label}</span>
				<span className="text-[.85rem] text-white mt-[-3px]">{code}</span>
			</div>
		</div>
	)
}
