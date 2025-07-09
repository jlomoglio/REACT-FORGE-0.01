// LUCIDE ICONS DEPENDENCIES
import { ChevronDown } from "lucide-react"

// COMPONENT: SELECT GROUP
export default function SelectGroup({
    label, 
    labelColor, 
    name,
    space = "35px",
    options,
    selectText,
    onChange,
    value,
    error, 
    required,
    disabled = false,
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
    const labelTextWhite = `
        text-[#ffffff] text-[1rem] font-[600]
        flex flex-row justify-start 
    `
    const select = `
        w-full bg-gray-100 px-4 py-2 rounded-md border 
        border-gray-300 focus:outline-none focus:none
        rounded-lg text-[1rem] p-[0px] pl-[10px]
        text-[#5a5a5a] pr-[15px] mt-[5px]
        focus:border-[#60A5FA] appearance-none 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `
    const errorText = `
        text-red-500 text-sm ml-[10px] mt-[3px]
    `


    // RENDER JSX
    return (
        <div className={wrapper} style={{ marginBottom: space}}>
            <div 
                className={labelColor ? labelTextWhite : labelText}
            >
                {label} 
                {required && <span className="ml-[5px] text-[1rem]">*</span>}
                {error && <span className={errorText}>{error}</span>}
            </div>
            <div className="relative">
                <select
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={select}
                    style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
                    disabled={disabled}
                >
                    {/* 🔹 Optional "Select..." entry only if selectText is explicitly passed */}
                    {selectText && (
                        <option value="">{selectText}</option>
                    )}

                    {/* 🔹 Loop through actual options */}
                    {options.map((option, index) => (
                        <option key={`${option.value}-${index}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown 
                    size={15} 
                    strokeWidth={3} 
                    style={{
                        position: "absolute",
                        right: "15px",
                        top: "22px",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "#4b5563", // Tailwind `text-gray-600`
                        fontSize: "0.8rem"
                    }}
                />
            </div>
        </div>
    )
}