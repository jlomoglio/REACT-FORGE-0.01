import { useState } from 'react'
import { Cog } from 'lucide-react'

export default function LibsPanel() {
    const [formData, setFormData] = useState()

    function handleChange(e) {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}


    return (
        <>
            <div className='w-full h-[30px] px-4 py-3 select-none'>
                REACT LIBRAIES
            </div>

            {/* Libray Type */}
            <div className='px-5 mt-4'>
                <label className="block text-sm font-medium text-white">
                    Library Type
                </label>
                <select
                    name="projectType"
                    value={formData}
                    onChange={handleChange}
                    className="mt-1 w-full rounded border border-gray-500 bg-[#2c2b2b] text-white px-3 py-2"
                >
                    <option value="">Select one</option>
                    <option value="react">Icons</option>
                    <option value="react-api">Components</option>
                    <option value="electron-react">Animation</option>
                    <option value="electron-react-api">Drag and Drop</option>
                    <option value="electron-react-api">Graphs and Charts</option>
                    <option value="electron-react-api">Datebase</option>
                </select>
            </div>
        </>
    )
}


function LibItem({ label, icon, description, url, onClick }) {
	return (
		<div className="flex flex-row">
            <div className="w-[50px]">
                {icon}
            </div>
            <div className="flex-1 flex-col">
                <div>{label}</div>
                <p>{description}</p>
                <div className='flex flex-row'>
                    <a href={url} target='_blank'>Visit</a>
                    <Cog size={20} />
                </div>
                  
            </div>
		</div>
	)
}