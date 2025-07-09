// LUCIDE ICONS DEPENDENCIES
import { RotateCcw } from "lucide-react"

export default function ResetButton({ onClick }) {
    // STYLES
    const button = `
        w-[40px] h-[40px] rounded-md flex items-center justify-center
        bg-[#fff] shadow-md cursor-pointer bg-[#1f2937] border border-[#ccc]
    `

    return (
        <div 
            className={button}
            onClick={onClick}
            onKeyDown={(e) => e.key === "Enter" && handleClick()} 
        >
            <RotateCcw size={25} strokeWidth={3} color="#5a5a5a" />
        </div>
    )
}