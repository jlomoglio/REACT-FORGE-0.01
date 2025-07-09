// APPLICATION DEPENDENCIES
import { useMemo, useState } from "react"

// LUCIDE ICONS DEPENDENCIES
import { Eye, Trash2, Pencil, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react"

// COMPONENT: DYNAMIC SCROLL TABLE
export default function DynamicScrollTable({ 
    data = [], 
    columns, 
    onAction,
    selectedRow, 
    tableWidth = "100%", 
    tableHeight = "dynamic",
    message,
    actions = [],
    rowSelect = false,
    selectedRowValue,
    actionColHeaderPaddingRight = "50px"
}) {
    const table = `bg-white rounded-lg shadow-md mt-0 overflow-hidden border border-[#ccc]`
    const tableHeader = `flex w-full h-[40px] bg-[#fff] text-[#5a5a5a] text-[1rem] rounded-t-md sticky top-0 z-10 border-b border-b-[#ccc] shadow-md`
    const headerCols = `p-2 pl-[10px] font-bold text-left cursor-pointer select-none border-r border-gray-200`
    const actionHeaderCol = `p-2 text-right font-bold pr-[${actionColHeaderPaddingRight}]`
    const tableRow = `flex w-full h-[40px] border-b border-b-[#E5E5E5] text-left text-[1.2rem] hover:bg-gray-50`
    const tableRowNoData = `flex w-full h-[40px] text-left text-[1rem] pl-[10px]`
    const tableRowCols = `p-2 pl-[20px] text-gray-700 text-[1rem] text-left`
    const actionRowColContainer = `p-2 flex justify-end gap-5 mt-[4px] pl-[20px] absolute right-[10px]`

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })

    const headers = useMemo(() => {
        return columns.map(col => ({
            key: col.key,
            label: col.label,
            width: col.width || "150px",
            render: col.render,
            tag: col.tag || false
        }))
    }, [columns])

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data
        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1
            return 0
        })
    }, [data, sortConfig])

    function handleSort(key) {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }))
    }

    function handleRowClick(row) {
        if (rowSelect) selectedRow(row.category)
    }

    return (
        <div 
            className={table}
            style={{ 
                width: tableWidth,
                display: "flex",
                flexDirection: "column",
                maxHeight: `calc(100vh - 30px)`,
                overflow: "hidden"
            }}
        >
            <div className={tableHeader}>
                {headers.map((col, index) => (
                    <div
                        key={col.key}
                        className={headerCols}
                        style={{ width: col.width, flexGrow: index === headers.length - 1 ? 1 : 0 }}
                        onClick={() => handleSort(col.key)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="truncate">{col.label}</span>
                            {sortConfig.key === col.key ? (
                                sortConfig.direction === "asc" ? 
                                    <ChevronUp size={18} strokeWidth={2.5} /> : 
                                    <ChevronDown size={18} strokeWidth={2.5} />
                            ) : (
                                <ChevronsUpDown size={18} strokeWidth={2.5} />
                            )}
                        </div>
                    </div>
                ))}
                {actions.length > 0 && <div className={actionHeaderCol} style={{ flex: 1, justifyContent: "flex-end", marginRight: "15px" }}>Actions</div>}
            </div>

            <div 
                className="overflow-y-scroll" 
                style={{
                    height: tableHeight === "dynamic" ? `calc(100vh - 250px)` : tableHeight,
                    minHeight: "200px",
                }}
            >
                {sortedData.length > 0 ? (
                    sortedData.map((row, index) => (
                        <div 
                            key={row.id || `row-${index}`} 
                            className={tableRow} 
                            onClick={(event) => handleRowClick(row)}
                            style={{
                                cursor: rowSelect ? "pointer" : "default",
                                backgroundColor: rowSelect && selectedRowValue === row.category ? "#BAE6FD" : "transparent"
                            }}
                        >
                            {headers.map((col, index) => (
                                <div
                                    key={col.key}
                                    className={tableRowCols}
                                    style={{
                                        width: col.width,
                                        paddingLeft: '12px',
                                        fontSize: '15px',
                                        flexGrow: index === headers.length - 1 ? 1 : 0 
                                    }}
                                >
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </div>
                            ))}
                            {actions.length > 0 && (
                                <div className="relative">
                                    <div className={actionRowColContainer}>
                                        {actions.includes("view") && 
                                            <Eye onClick={() => onAction("view", row.id)} size={20} strokeWidth={2.2} style={{ cursor: "pointer" }} />
                                        }
                                        {actions.includes("edit") && 
                                            <Pencil onClick={() => onAction("edit", row.id)} size={20} strokeWidth={2.2} style={{ cursor: "pointer" }} />
                                        }
                                        {actions.includes("delete") && 
                                            <Trash2 onClick={() => onAction("delete", row.id)} size={20} strokeWidth={2.2} style={{ cursor: "pointer" }} />
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className={tableRowNoData}>
                        <div className="p-4 text-center text-gray-500 w-full">
                            {message ? message : 'No data available'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
