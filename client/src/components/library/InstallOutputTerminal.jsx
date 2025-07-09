import { useEffect, useRef, useState } from 'react'


export default function InstallOutputTerminal({
	logs = [],
	onClose,
	projectPath,
	packageName,
	action,
}) {
    const [isInstalling, setIsInstalling] = useState(true)
    const [spinner, setSpinner] = useState('|')
    const [visibleLogs, setVisibleLogs] = useState([])

    const incomingRef = useRef([])
    const terminalRef = useRef(null)
    const logIndexRef = useRef(0)
    const intervalRef = useRef(null)


    // Spinner animation
    useEffect(() => {
        if (!isInstalling) return
        const frames = ['|', '/', '-', '\\']
        let i = 0
        const interval = setInterval(() => {
            setSpinner(frames[i % frames.length])
            i++
        }, 100)
        return () => clearInterval(interval)
    }, [isInstalling])

    // Reveal logs line by line
    useEffect(() => {
        // kill any existing loop
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }

        incomingRef.current = [...logs]
        setVisibleLogs([])

        if (!logs.length) return

        let i = 0
        intervalRef.current = setInterval(() => {
            if (i >= incomingRef.current.length) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
                return
            }
            setVisibleLogs(prev => [...prev, incomingRef.current[i]])
            i++
        }, 500)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [logs])

    useEffect(() => {
        if (!isInstalling) return
        if (visibleLogs.length === logs.length) {
            const isDone = visibleLogs.some(line =>
                typeof line === 'string' &&
                line.toLowerCase().includes('done. exit code')
            )
            if (isDone) {
                setIsInstalling(false)
            }
        }
    }, [visibleLogs, logs, isInstalling])

    // Auto-scroll to bottom on new visible log
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
    }, [visibleLogs])


    return (
        <div
            className='absolute left-[430px] right-0 bottom-0 z-[500] h-[550px] border-t border-t-[#6D6C6C] 
				bg-[#2C2B2B] pt-[4px] pl-[10px] text-[.8rem] flex flex-col'
        >

            {/* Header */}
            <div className='w-full h-[35px] flex items-center justify-between px-4'>
                <span className='text-xs tracking-wide text-gray-300'>INSTALL LOG</span>
                <button onClick={onClose} className='text-xs text-gray-400 hover:text-white'>✖</button>
            </div>


            {/* Terminal Scrollable Log Output */}
            <div ref={terminalRef} className='flex-1 overflow-auto mb-[30px] text-[12px] text-gray-200 font-mono bg-[#1e1e1e] p-4 rounded'>
                <div className='px-4 pb-1 text-blue-300 font-mono text-[12px] ml-[-15px]'>
                    {`"${projectPath}"> npm ${action} ${packageName}`}
                </div>

                {/* Spinner on its own line */}
                {isInstalling && (
                    <div className="text-green-400 mb-1">{spinner}</div>
                )}

                {visibleLogs.map((line, i) => {
                    if (!line || typeof line !== 'string') return null // skip invalid lines

                    let color = 'text-gray-300'
                    let icon = null

                    if (line.includes('❌') || line.toLowerCase().includes('npm error')) {
                        color = 'text-red-400'
                        icon = '❌'
                    } else if (line.includes('⚠️')) {
                        color = 'text-yellow-400'
                        //icon = '⚠️'
                    } else if (line.includes('📦')) {
                        color = 'text-green-400'
                        //icon = '📦'
                    } else if (line.includes('🔍')) {
                        color = 'text-blue-400'
                        //icon = '🔍'
                    } else if (line.toLowerCase().includes('done. exit code')) {
                        const isSuccess = line.includes('0')
                        color = isSuccess ? 'text-green-400' : 'text-red-400'
                        icon = isSuccess ? '✅' : '❌'
                    }

                    return (
                        <div
                            key={`${i}-${line.slice(0, 10)}`}
                            className={`whitespace-pre-wrap leading-relaxed font-mono ${color}`}
                            style={{ animation: 'fadeInLine 0.2s ease-in' }}
                        >
                            {icon && <span className="mr-2">{icon}</span>}
                            {line}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


