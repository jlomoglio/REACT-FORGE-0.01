import { useRef, useState } from "react"
import { $insertNodes } from 'lexical'
import { StyleGuideNode } from './StyleGuideNode'

const colorNames = [
    'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky',
    'blue', 'indigo', 'violet', 'purple', 'pink', 'rose', 'stone', 'gray', 'zinc', 'slate'
]

const shades = ['950', '900', '800', '700', '600', '500', '400', '300'] // top → bottom, dark to light

const hex = [
    { color: 'red', code: ['#450a0a', '#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'] },
    { color: 'orange', code: ['#431407', '#7c2d12', '#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74'] },
    { color: 'amber', code: ['#451a03', '#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fde68a'] },
    { color: 'yellow', code: ['#422006', '#713f12', '#854d0e', '#a16207', '#ca8a04', '#eab308', '#facc15', '#fde047'] },
    { color: 'lime', code: ['#365314', '#4d7c0f', '#65a30d', '#84cc16', '#a3e635', '#bef264', '#d9f99d', '#ecfccb'] },
    { color: 'green', code: ['#052e16', '#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'] },
    { color: 'emerald', code: ['#022c22', '#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'] },
    { color: 'teal', code: ['#042f2e', '#134e4a', '#115e59', '#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'] },
    { color: 'cyan', code: ['#083344', '#164e63', '#155e75', '#0e7490', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'] },
    { color: 'sky', code: ['#082f49', '#0c4a6e', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'] },
    { color: 'blue', code: ['#172554', '#1e40af', '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'] },
    { color: 'indigo', code: ['#1e1b4b', '#312e81', '#3730a3', '#4338ca', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'] },
    { color: 'violet', code: ['#2e1065', '#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'] },
    { color: 'purple', code: ['#3b0764', '#581c87', '#6b21a8', '#7e22ce', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe'] },
    { color: 'pink', code: ['#500724', '#831843', '#9d174d', '#be185d', '#db2777', '#ec4899', '#f472b6', '#f9a8d4'] },
    { color: 'rose', code: ['#4c0519', '#881337', '#9f1239', '#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'] },
    { color: 'stone', code: ['#1c1917', '#292524', '#44403c', '#57534e', '#78716c', '#a8a29e', '#d6d3d1', '#e7e5e4'] },
    { color: 'gray', code: ['#111827', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'] },
    { color: 'zinc', code: ['#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'] },
    { color: 'slate', code: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'] }
]

const rgb = [
    { color: 'red', code: ['70,8,9', '127,29,29', '153,27,27', '185,28,28', '220,38,38', '239,68,68', '248,113,113', '252,165,165'] },
    { color: 'orange', code: ['67,20,7', '124,45,18', '154,52,18', '194,65,12', '234,88,12', '249,115,22', '251,146,60', '253,186,116'] },
    { color: 'amber', code: ['69,26,3', '120,53,15', '146,64,14', '180,83,9', '217,119,6', '245,158,11', '251,191,36', '253,230,138'] },
    { color: 'yellow', code: ['66,32,6', '113,63,18', '133,77,14', '161,98,7', '202,138,4', '234,179,8', '250,204,21', '253,224,71'] },
    { color: 'lime', code: ['54,83,20', '77,124,15', '101,163,13', '132,204,22', '163,230,53', '190,242,100', '217,249,157', '236,252,203'] },
    { color: 'green', code: ['5,46,22', '20,83,45', '22,101,52', '21,128,61', '22,163,74', '34,197,94', '74,222,128', '134,239,172'] },
    { color: 'emerald', code: ['2,44,34', '6,78,59', '6,95,70', '4,120,87', '5,150,105', '16,185,129', '52,211,153', '110,231,183'] },
    { color: 'teal', code: ['4,47,46', '19,78,74', '17,94,89', '15,118,110', '13,148,136', '20,184,166', '45,212,191', '94,234,212'] },
    { color: 'cyan', code: ['8,51,68', '22,78,99', '21,94,117', '14,116,144', '6,182,212', '34,211,238', '103,232,249', '165,243,252'] },
    { color: 'sky', code: ['8,47,73', '12,74,110', '3,105,161', '2,132,199', '14,165,233', '56,189,248', '125,211,252', '186,230,253'] },
    { color: 'blue', code: ['23,37,84', '30,64,175', '30,58,138', '29,78,216', '37,99,235', '59,130,246', '96,165,250', '147,197,253'] },
    { color: 'indigo', code: ['30,27,75', '49,46,129', '55,48,163', '67,56,202', '79,70,229', '99,102,241', '129,140,248', '165,180,252'] },
    { color: 'violet', code: ['46,16,101', '76,29,149', '91,33,182', '109,40,217', '124,58,237', '139,92,246', '167,139,250', '196,181,253'] },
    { color: 'purple', code: ['59,7,100', '88,28,135', '107,33,168', '126,34,206', '147,51,234', '168,85,247', '192,132,252', '216,180,254'] },
    { color: 'pink', code: ['80,7,36', '131,24,67', '157,23,77', '190,24,93', '219,39,119', '236,72,153', '244,114,182', '249,168,212'] },
    { color: 'rose', code: ['76,5,25', '136,19,55', '159,18,57', '190,18,60', '225,29,72', '244,63,94', '251,113,133', '253,164,175'] },
    { color: 'stone', code: ['28,25,23', '41,37,36', '68,64,60', '87,83,78', '120,113,108', '168,162,158', '214,211,209', '231,229,228'] },
    { color: 'gray', code: ['17,24,39', '31,41,55', '55,65,81', '75,85,99', '107,114,128', '156,163,175', '209,213,219', '229,231,235'] },
    { color: 'zinc', code: ['24,24,27', '39,39,42', '63,63,70', '82,82,91', '113,113,122', '161,161,170', '212,212,216', '228,228,231'] },
    {
        color: 'slate', code: [
            '15,23,42',   // 950
            '30,41,59',   // 900
            '51,65,85',   // 800
            '71,85,105',  // 700
            '100,116,139',// 600
            '148,163,184',// 500
            '203,213,225',// 400
            '226,232,240' // 300
        ]
    }
]

export default function ColorPicker({ onInsert, onClose }) {
    const button = `px-3 py-2 rounded bg-[#79716b] cursor-pointer`

    // Drag state
    const pickerRef = useRef(null)
    const [position, setPosition] = useState({ x: 100, y: 100 })

    // Color state
    const [selectedColor, setSelectedColor] = useState(null)
    const [selectedShade, setSelectedShade] = useState(null)
    const [colorCodeType, setColorCodeType] = useState('hex')

    const isDragging = useRef(false)
    const offset = useRef({ x: 0, y: 0 })
    const colorCodeInput = useRef()
    const labelInput = useRef()


    const updateColorCodeInput = (color, shadeIndex) => {
        const hexCode = hex.find(h => h.color === color)?.code?.[shadeIndex] || ''
        const rgbCode = rgb.find(r => r.color === color)?.code?.[shadeIndex] || ''

        if (colorCodeType === 'hex') {
            colorCodeInput.current.value = hexCode
        } else {
            colorCodeInput.current.value = `rgb(${rgbCode})`
        }
    }

    const handleInsert = () => {
        if (!selectedColor || !selectedShade) return
        const shadeIndex = shades.indexOf(selectedShade)

        const hexCode = hex.find(h => h.color === selectedColor)?.code?.[shadeIndex] || ''
        const rgbCode = rgb.find(r => r.color === selectedColor)?.code?.[shadeIndex] || ''

        const label = labelInput.current?.value || ''
        const code = colorCodeType === 'hex' ? hexCode : `rgb(${rgbCode})`
        const color = colorCodeType === 'hex' ? hexCode : rgbCode

        onInsert?.({ color, label, code, format: colorCodeType })

        // 🔒 Close the ColorPicker after insertion
        onClose?.()
    }

    const handleMouseDown = (e) => {
        isDragging.current = true
        offset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        }
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
    }

    const handleMouseMove = (e) => {
        if (!isDragging.current) return
        setPosition({
            x: e.clientX - offset.current.x,
            y: e.clientY - offset.current.y,
        })
    }

    const handleMouseUp = () => {
        isDragging.current = false
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
    }


    return (
        <div
            ref={pickerRef}
            className="z-[9999] fixed rounded-md bg-[#3a3534] h-[700px] w-[1400px] shadow-2xl"
            style={{ top: position.y, left: position.x }}
        >
            {/* HEADER */}
            <div
                className="w-full bg-[#0f0f0f] py-1 rounded-tl-md rounded-tr-md text-center text-white text-[1rem] cursor-move select-none"
                onMouseDown={handleMouseDown}
            >
                Style Guide Color Picker
            </div>

            {/* COLORR NAMES */}
            <div className="w-full px-2">
                <div className="grid grid-cols-20 gap-[2px] text-[.7rem] px-4 mt-2 text-center">
                    {colorNames.map((name) => (
                        <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                    ))}
                </div>
            </div>

            {/* COLOR SWATCHES */}
            <div className="w-full px-2">
                <div className="grid grid-cols-20 gap-[2px] p-4">
                    {colorNames.map((color) => (
                        <div key={color} className="flex flex-col gap-[2px]">
                            {shades.map((shade, shadeIndex) => {
                                const isSelected = selectedColor === color && selectedShade === shade
                                const className = `bg-${color}-${shade}`

                                return (
                                    <div
                                        key={`${color}-${shade}`}
                                        className={`${className} w-14 h-14 my-1 rounded-sm border border-black/10 cursor-pointer ${isSelected ? 'ring-2 ring-white' : ''
                                            }`}
                                        onClick={() => {
                                            setSelectedColor(color)
                                            setSelectedShade(shade)
                                            updateColorCodeInput(color, shadeIndex)

                                            // const hexCode = hex.find(h => h.color === color)?.code?.[shadeIndex] || ''
                                            // const rgbCode = rgb.find(r => r.color === color)?.code?.[shadeIndex] || ''
                                            // colorCodeInput.current.value = `${hexCode} / rgb(${rgbCode})`
                                        }}
                                    />
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* FOOTER */}
            <div className=" flex flex-row relative">
                {/* Swatch Type */}
                <div className="flex flex-col ml-5">
                    <div className="ml-1 py-1">Color Code Type</div>
                    <select
                        className="bg-[#262626] px-2 py-2 w-[130px] outline-0 cursor-pointer rounded"
                        value={colorCodeType}
                        onChange={(e) => {
                            setColorCodeType(e.target.value.toLowerCase())
                            // Re-populate input if a swatch is already selected
                            if (selectedColor && selectedShade) {
                                const shadeIndex = shades.indexOf(selectedShade)
                                updateColorCodeInput(selectedColor, shadeIndex)
                            }
                        }}
                    >
                        <option value="hex">HEX</option>
                        <option value="rgb">RGB</option>
                    </select>
                </div>

                {/* Widget Label */}
                <div className="flex flex-col ml-5">
                    <div className="ml-1 py-1">Label</div>
                    <input ref={labelInput} className="bg-[#262626] px-3 py-2 w-[300px] outline-0 rounded" />
                </div>

                {/* Swatch Type */}
                <div className="flex flex-col ml-5">
                    <div className="ml-1 py-1">Swatch Type</div>
                    <select className="bg-[#262626] px-2 py-2 w-[100px] outline-0 cursor-pointer rounded">
                        <option value="">Solid</option>
                        <option value="">Outline</option>
                    </select>
                </div>

                {/* Color Code */}
                <div className="flex flex-col ml-5">
                    <div className="ml-1 py-1">Color Code</div>
                    <input ref={colorCodeInput} className="bg-[#262626] px-3 py-2 w-[200px] outline-0 rounded" readOnly />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 absolute right-6 top-7">
                    <button className={button} onClick={handleInsert}>Insert</button>
                    <button className={button} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}
