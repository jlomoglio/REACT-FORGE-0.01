// components/Tooltip.jsx
import { useState } from 'react'

export default function Tooltip({ children, content, position = "top" }) {
	const [show, setShow] = useState(false)

	return (
		<div
			className="relative inline-block"
			onMouseEnter={() => setShow(true)}
			onMouseLeave={() => setShow(false)}
		>
			{children}
			{show && (
				<div
					className={`absolute z-50 px-2 py-1 text-xs whitespace-nowrap bg-[#1E1E1E] text-white border border-gray-600 rounded shadow-md
						${position === 'top' ? 'bottom-full mb-1 right-[-30px] -translate-x-1' : ''}
					`}
				>
					{content}
				</div>
			)}
		</div>
	)
}
