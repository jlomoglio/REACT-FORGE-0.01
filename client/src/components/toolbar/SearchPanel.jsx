import { useState } from "react"
import { 
	RefreshCcw, 
	ListX, 
	CopyMinus, 
	CaseSensitive, 
	CaseUpper, 
	WholeWord, 
	Regex,
	ReplaceAll,
	Columns2
} from 'lucide-react'

export default function SearchPanel() {
	const [search, setSearch] = useState()
	const [replace, setReplace] = useState()
	const [include, setInclude] = useState([])
	const [exclude, setExclude] = useState()

	return (
		<>
			<div className='w-full h-[30px] px-4 py-3 select-none mb-6 flex flex-row gap-3 relative'>
				<div>SEARCH</div>
				<div className="flex flex-row gap-3 py-1 absolute right-4">
					<RefreshCcw
						size={18}
						className="hover:text-white cursor-pointer"
						title="New Folder..."
						onClick={() => setCreatingFolderInPath('')}
					/>
					<ListX
						size={18}
						className="hover:text-white cursor-pointer"
						title="New Folder..."
						onClick={() => setCreatingFolderInPath('')}
					/>
					<CopyMinus
						size={18}
						className="hover:text-white cursor-pointer"
						title="New Folder..."
						onClick={() => setCreatingFolderInPath('')}
					/>
				</div>
			</div>

			<div className="px-3 space-y-4">
				{/* Search */}
				<div className="relative">
					<input
						type="text"
						name="search"
						value={search}
						onChange={() => setSearch()}
						className="mt-1 w-full rounded bg-[#3f3f46] text-white px-3 py-2"
						placeholder="Search"
					/>
					<div className="flex flex-row absolute right-3 top-3 z-50 gap-2">
						<CaseSensitive
							size={20}
							className="hover:text-white cursor-pointer mt-[2px]"
							title="New Folder..."
							onClick={() => setCreatingFolderInPath('')}
						/>
						<WholeWord
							size={20}
							className="hover:text-white cursor-pointer mt-[2px]"
							title="New Folder..."
							onClick={() => setCreatingFolderInPath('')}
						/>
						<Regex
							size={20}
							className="hover:text-white cursor-pointer mt-[2px]"
							title="New Folder..."
							onClick={() => setCreatingFolderInPath('')}
						/>
					</div>
				</div>

				{/* Replace */}
				<div className="relative">
					<div className="flex flex-row relative">
						<input
							type="text"
							name="replace"
							value={replace}
							onChange={() => setReplace()}
							className="mt-1 w-full rounded bg-[#3f3f46] text-white px-3 py-2 mr-3"
							placeholder="Replace"
						/>
						<div className="flex flex-row absolute right-[45px] top-3 z-50 gap-2">
							<CaseUpper
								size={20}
								className="hover:text-white cursor-pointer mt-[2px]"
								title="New Folder..."
								onClick={() => setCreatingFolderInPath('')}
							/>
						</div>
					
						<ReplaceAll
							size={30}
							className="hover:text-white cursor-pointer mt-[8px]"
							title="New Folder..."
							onClick={() => setCreatingFolderInPath('')}
						/>
					</div>
				</div>

				{/* Files - Include */}
				<div className="relative">
					<div className="flex flex-col">
						<label htmlFor="include">Files to include</label>
						<input
							type="text"
							name="include"
							value={include}
							onChange={() => setSearch()}
							className="mt-1 w-full rounded bg-[#3f3f46] text-white px-3 py-2"
						/>
					</div>
					<div className="flex flex-row absolute right-2 top-9 z-50 gap-2">
						<Columns2
							size={20}
							className="hover:text-white cursor-pointer mt-[2px]"
							title="New Folder..."
							onClick={() => setCreatingFolderInPath('')}
						/>
					</div>
				</div>

				{/* Files - Exclude */}
				<div className="relative">
					<div className="flex flex-col">
						<label htmlFor="exclude">Files to exclude</label>
						<input
							type="text"
							name="exclude"
							value={exclude}
							onChange={() => setSearch()}
							className="mt-1 w-full rounded bg-[#3f3f46] text-white px-3 py-2"
						/>
					</div>
				</div>
			</div>


		</>
	)
} 