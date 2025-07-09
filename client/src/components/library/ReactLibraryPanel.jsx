import { useEffect, useState, useMemo, useRef } from 'react'
import { X, SquareChevronRight, SquareChevronLeft, ListX } from 'lucide-react'
import classNames from 'classnames'
import LibraryDetails from './LibraryDetails'
import InstallOutputTerminal from './InstallOutputTerminal'


export default function ReactLibraryCategoryPanel({ selectedProject }) {
    const [allLibraries, setAllLibraries] = useState([])
    const [activeCategory, setActiveCategory] = useState(null)
    const [selectedLibrary, setSelectedLibrary] = useState(null)
    const [validSubcategories, setValidSubcategories] = useState(new Set())
    const [availableTags, setAvailableTags] = useState([])
    const [structuredTags, setStructuredTags] = useState([])
    const [activeTab, setActiveTab] = useState('Installed')
    const [showLibraries, setShowLibraries] = useState(false)
    const [aiResults, setAiResults] = useState([])
    const [installedLibraries, setInstalledLibraries] = useState([])
    const [showTerminal, setShowTerminal] = useState(false)
    const [terminalLogs, setTerminalLogs] = useState([])
    const [terminalState, setTerminalState] = useState({
        show: false,
        logs: [],
        projectPath: '',
        packageName: '',
        isInstalling: true,
        action: 'install'
    })
    const [isLoadingInstalled, setIsLoadingInstalled] = useState(false)

    const searchInput = useRef()
    const installedCacheRef = useRef({})

    const refreshInstalledPackages = async () => {
        if (!selectedProject?.path) return
        const deps = await window.electron.invoke('read-installed-packages', selectedProject.path)
        const names = Object.keys(deps || {})
        const enriched = names.map(name => ({ name }))
        setInstalledLibraries(enriched)
    }


    useEffect(() => {
        if (activeTab === 'Installed' && selectedProject?.path) {
            window.electron.invoke('read-installed-packages', selectedProject.path)
                .then(async (deps) => {
                    const names = Object.keys(deps || {})
                    const enriched = await window.electron.invoke('ai-lookup-installed-libraries', names)
                    setInstalledLibraries(enriched)
                })
        }
    }, [activeTab, selectedProject])

    useEffect(() => {
        if (activeTab === 'Community') {
            setAiResults([])
        }
    }, [activeTab])

    useEffect(() => {
        let counter = 0
        const handleOutput = (line) => {
            setTerminalState(prev => {
                if (prev.logs.includes(line)) return prev // skip duplicates
                return {
                    ...prev,
                    logs: [...prev.logs, line]
                }
            })
        }

        window.electron.removeAllListeners?.('terminal-output')
        window.electron.receive('terminal-output', handleOutput)

        return () => {
            window.electron.removeListener?.('terminal-output', handleOutput)
        }
    }, [])

    useEffect(() => {
        if (activeTab === 'Installed' && selectedProject?.path) {
            setIsLoadingInstalled(true)
            window.electron.invoke('read-installed-packages', selectedProject.path)
                .then((deps) => {
                    const names = Object.keys(deps || {})
                    setInstalledLibraries(names.map(name => ({ name })))
                })
                .finally(() => setIsLoadingInstalled(false))
        }
    }, [activeTab, selectedProject])

    useEffect(() => {
        if (activeTab === 'Installed' && selectedProject?.path) {
            const cacheKey = selectedProject.path
            if (installedCacheRef.current[cacheKey]) {
                setInstalledLibraries(installedCacheRef.current[cacheKey])
                return
            }

            setIsLoadingInstalled(true)
            window.electron.invoke('read-installed-packages', selectedProject.path)
                .then((deps) => {
                    const names = Object.keys(deps || {})
                    const libs = names.map(name => ({ name }))
                    setInstalledLibraries(libs)
                    installedCacheRef.current[cacheKey] = libs
                })
                .finally(() => setIsLoadingInstalled(false))
        }
    }, [activeTab, selectedProject])


    const handleTagClick = async (tag) => {
        setActiveTag(tag)
        setShowTags(false)
        setShowLibraries(true)

        const { libs } = await window.electron.invoke('get-react-libraries', tag)
        libs.sort((a, b) => a.name.localeCompare(b.name))
        setFilteredLibraries(libs)
    }

    // AI SEARCH
    const handleAiSearch = async (term) => {
        if (!term.trim()) {
            setAiResults([]) // Reset on empty search
            return
        }

        const res = await window.electron.invoke('ai-search-libraries', term)

        if (res.success) {
            setAiResults(res.data) // or whatever state you use
        } else {
            console.error('[❌ AI Search Error]', res.error)
        }
    }

    return (
        <>
            <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-[380px] h-full flex flex-col bg-[#1c1c1c] border-r border-[#4b4b4b]">
                    {/* Header + Search */}
                    <div className="p-3 shrink-0 relative">
                        <h2 className="text-white font-bold text-sm mb-3">React Packages</h2>
                        <input
                            ref={searchInput}
                            type="text"
                            placeholder="Search repositories"
                            onChange={(e) => {
                                const value = e.target.value
                                handleAiSearch(value)

                                if (value.trim() === '') {
                                    setAiResults([])
                                    return
                                }
                            }}
                            disabled={activeTab === 'Installed'}
                            className="w-full px-3 py-2 text-sm bg-[#2a2a2a] text-white rounded mb-2"
                        />
                        {activeTab === 'Community' && (
                            <button
                                title="Clear Search Results"
                                className="absolute right-5 top-[52px] cursor-pointer text-gray-400 hover:text-white"
                                onClick={() => {
                                    if (searchInput.current) searchInput.current.value = ''
                                    setAiResults([])
                                    setShowLibraries(false)
                                    setSelectedLibrary(null) 
                                }}
                            >
                                <ListX size={20} />
                            </button>
                        )}
                    </div>

                    {/* TABS */}
                    <div className="w-full h-[40px] border-b border-[#4b4b4b] flex flex-row mt-[-15px]">
                        {/* Installed */}
                        <div
                            className={`w-1/2 text-center py-2 cursor-pointer ${activeTab === "Installed" && 'border-blue-600 border-b-[3px]'}`}
                            onClick={() => setActiveTab('Installed')}
                        >
                            <span className="text-[.8rem] font-medium">INSTALED</span>
                        </div>

                        {/* Community */}
                        <div
                            className={`w-1/2 text-center py-2  cursor-pointer ${activeTab === "Community" && 'border-blue-600 border-b-[3px]'}`}
                            onClick={() => setActiveTab('Community')}
                        >
                            <span className="text-[.8rem] font-medium">COMMUNITY</span>
                        </div>
                    </div>

                    {activeTab === "Community" && (
                        <>
                            {/* Available Libraries Section */}
                            <div className='flex-1 flex-col overflow-y-auto mb-[30px]'>
                                <div className="space-y-2 px-3 pb-8 flex flex-col">
                                    {aiResults.map((lib, index) => {
                                        const normalize = str => str?.trim().toLowerCase()

                                        const isInstalled = installedLibraries.some(installed =>
                                            installed.name?.toLowerCase() === lib.name.toLowerCase()
                                        )

                                        return (
                                            <div
                                                key={`${lib.name}-${index}`}
                                                className="p-2 bg-[#2a2a2a] rounded hover:bg-[#333] cursor-pointer"
                                                onClick={() => setSelectedLibrary(lib)}
                                            >
                                                <div className="text-white text-sm font-medium relative">
                                                    {lib.name}
                                                    {isInstalled && (
                                                        <div className="absolute right-0 top-1 text-[.7rem] text-green-500">
                                                            Installed
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400">{lib.description}</div>
                                            </div>
                                        )
                                    })}

                                    {aiResults.length === 0 && (
                                        <div className="text-lg text-gray-500 ml-2 mt-4 text-center">No libraries found.</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Installed' && (
                        <div className="flex-1 overflow-y-auto mb-[30px] space-y-2 px-3 pb-8">
                            <div className='mt-3'>
                                {isLoadingInstalled ? (
                                    <div className="text-gray-500 text-sm italic">Loading installed libraries...</div>
                                ) : (
                                    installedLibraries.map((lib, index) => (
                                        <div
                                            key={`installed-${lib.name}-${index}`}
                                            className="p-2 bg-[#2a2a2a] rounded hover:bg-[#333] cursor-pointer mb-2"
                                            onClick={() => setSelectedLibrary(lib)}
                                        >
                                            <div className="text-white text-sm font-medium">{lib.name}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel */}
                <div className="flex-1 bg-[#1a1a1a] pl-6 flex flex-col">
                    <LibraryDetails
                        selectedLibrary={selectedLibrary}
                        selectedProject={selectedProject}
                        setTerminalLogs={setTerminalLogs}
                        setShowTerminal={setShowTerminal}
                        setTerminalState={setTerminalState}
                        installedLibraries={installedLibraries}
                        refreshInstalledPackages={refreshInstalledPackages}
                    />
                </div>
            </div>

            {/* TERMINAL */}
            {terminalState.show && (
                <InstallOutputTerminal
                    key="install-terminal"
                    logs={terminalState.logs}
                    onClose={() => setTerminalState(prev => ({ ...prev, show: false }))}
                    projectPath={terminalState.projectPath}
                    packageName={terminalState.packageName}
                    action={terminalState.action}
                />
            )}
        </>
    )
}
