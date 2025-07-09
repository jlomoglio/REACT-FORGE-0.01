
export default function SidebarIcon({ label, icon, active, show, onClick, disabled }) {
	const isActive = active === label && show && !disabled

	if(onClick) 

	return (
		<div
			className={`
				w-[50px] h-[40px] mt-2 px-2 py-1 
				${isActive ? 'border-l-[3px] border-l-[#1f1fc7] text-white' : 'border-l-[3px] border-l-transparent'}
				${disabled ? 'text-gray-600 cursor-not-allowed' : 'text-[#a1a1a1] hover:text-white cursor-pointer'}
			`}
			onClick={!disabled ? () => onClick(label) : null }
		>
			{icon}
		</div>
	)
}