// APPLICATION DEPENDENCIES
import { useRef } from "react"

// COMPONENT: INPUT GROUP
export default function InputGroup({ 
    ref,
    label, 
    type,
    name,
    value,
    onChange = () => {},
    onClick, 
    error, 
    required,
    disabled = false,
    placeholder,
}) {
    // STYLES
    const wrapper = `
        w-full h-[60px] flex flex-col justify-start p-[20px]
        mt-[10px] mb-[35px] relative
    `
    const labelText = `
        text-[#5a5a5] text-[1rem] font-[600]
        flex flex-row justify-start ml-[5px]
    `
    const input = `
        w-full bg-gray-100 px-4 py-2 rounded-md border ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
        border-gray-300 focus:outline-none focus:ring focus:ring-blue-500
    `
    
    const errorText = `
        text-red-500 text-sm ml-[10px] mt-[3px]
    `



    // RENDER JSX
    return (
        <div className={wrapper}>
            <div 
                className={labelText}
            >
                {label} 
                {required && <span className="ml-[5px] text-[1rem]">*</span>}
                {error && <span className={errorText}>{error}</span>}
            </div>
            <input 
                ref={ref}
                className={input}
                type={type} 
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClick={onClick}
                disabled={disabled}
                placeholder={placeholder}
            />
        </div>
    )
}