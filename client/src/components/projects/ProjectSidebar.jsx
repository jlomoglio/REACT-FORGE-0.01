import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Menu } from 'lucide-react'

export default function ProjectSidebar({ projects, selected, onSelect }) {
	const [menuCollapsed, setMenuCollapsed] = useState(false)
	const navigate = useNavigate()

	function collapseMenu() {
		setMenuCollapsed(!menuCollapsed)
	}

	return (
		<aside className={`${!menuCollapsed ? 'w-56' : 'w-13'} bg-[#2C2B2B] text-white flex flex-col h-full border-r border-r-[#6D6C6C]`}>
			<div className="px-4 py-2 text-[1.2rem] font-[300] border-b border-gray-700 flex relative">
			{!menuCollapsed && 'Your Projects' }
				<span 
					className="absolute right-[15px] top-[15px] cursor-pointer"
					onClick={collapseMenu}
				>
					<Menu size={20} />
				</span>
			</div>
			{!menuCollapsed && (
				<nav className="flex-1 overflow-y-auto">
					{projects.map((project, index) => (
						<div
							key={project.name + "_" + index}
							className={`block w-full text-left px-4 py-2 cursor-pointer text-white hover:bg-gray-00 ${selected === project.name ? 'bg-[#4b4747]' : ''}`}
							onClick={() => {
								onSelect(project.name) 
								navigate('project_details')
							}}
							title={project.path}
						>
							{project.name}
						</div>
					))}
				</nav>
			)}
		</aside>
	)
}


