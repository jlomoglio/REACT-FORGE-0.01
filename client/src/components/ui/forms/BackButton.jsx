export default function BackButton({ onClick, label}) {
    // STYLES
    const button = `
        h-[40px] px-7 mt-2 mb-5 
        text-md px-4 py-3 rounded
        flex items-center justify-center
        select-none cursor-pointer shadow-md
        bg-[#fff] text-[#5a5a5a] border border-[#ccc]
    `

    return (
        <div className={button} onClick={onClick}>
            {label}
        </div>
    );
}