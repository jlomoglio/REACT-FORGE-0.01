import noSelectPackage from '../../assets/no_selected_packages_image.png'

export default function LibraryDetails({
    selectedProject,
    setTerminalLogs,
    setShowTerminal,
    selectedLibrary,
    setTerminalState,
    installedLibraries,
    refreshInstalledPackages
}) {
    if (!selectedLibrary) {
        return (
            <div className="px-6 py-4 text-gray-400 text-3xl italic flex justify-center mt-[100px]">
                <img src={noSelectPackage} alt="" />
            </div>
        )
    }

    const lib = selectedLibrary

    const isInstalled = installedLibraries.some(installed =>
        installed.name?.toLowerCase() === selectedLibrary.name.toLowerCase()
    )


    const handleInstall = async () => {
        if (!selectedProject?.path || !lib?.name) return

        setTerminalState({
            show: false,
            logs: [],
            projectPath: selectedProject.path,
            packageName: lib.name,
            isInstalling: true,
            action: 'install'
        })

        // force unmount before remount
        setTimeout(() => {
            setTerminalState(prev => ({
                ...prev,
                show: true,
                logs: [`> Installing ${lib.name}...`]
            }))
        }, 0)

        await window.electron.invoke('install-react-library', {
            projectPath: selectedProject.path,
            packageName: lib.name
        })
    }

    const handleUninstall = async () => {
        if (!selectedProject?.path || !lib?.name) return

        setTerminalState({
            show: true,
            logs: [],
            projectPath: selectedProject.path,
            packageName: lib.name,
            isInstalling: true,
            action: 'uninstall'
        })

        await window.electron.invoke('uninstall-react-library', {
            projectPath: selectedProject.path,
            packageName: lib.name,
        })

        await refreshInstalledPackages()
    }



    return (
        <div className="p-6">
            <div className="px-6 py-4 text-white">
                <h2 className="text-xl font-bold mb-1">{lib.name}</h2>
                <p className="text-sm text-gray-400 mb-3">{lib.description || 'No description provided.'}</p>

                {/* Install Command */}
                <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Install:</div>
                    <div className="bg-[#2a2a2a] p-2 rounded text-sm font-mono flex justify-between items-center">
                        <span>{`npm install ${lib.name}`}</span>
                        <button
                            onClick={() => navigator.clipboard.writeText(lib.npm || `npm install ${lib.name}`)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                            title="Copy to clipboard"
                        >
                            Copy
                        </button>
                    </div>
                </div>

                {/* Version & Metrics */}
                <div className="flex gap-4 text-sm mb-4">
                    {lib.version && <span>📦 v{lib.version}</span>}
                    {lib.downloads && <span>⬇️ {Math.round(lib.downloads * 1000)} downloads</span>}
                    {lib.stars && <span>⭐ {Math.round(lib.stars * 1000)} stars</span>}
                </div>

                {/* Links */}
                <div className="flex gap-4 text-sm mb-4">
                    {lib.homepage && (
                        <a href={lib.homepage} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                            Homepage
                        </a>
                    )}
                    {lib.repository && (
                        <a href={lib.repository} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                            Repository
                        </a>
                    )}
                </div>

                {/* Tags */}
                {lib.tags?.length > 0 && (
                    <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-1">Tags:</div>
                        <div className="flex flex-wrap gap-2">
                            {lib.tags.map(tag => (
                                <span key={`${tag}-${Math.floor(Date.now() /1000)}`} className="bg-[#333] text-xs px-2 py-1 rounded text-gray-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* BUTTONS */}
                <div className="mt-[50px]">
                    {!isInstalled && (
                        <button
                            className="px-6 py-2 bg-blue-600 rounded cursor-pointer"
                            onClick={handleInstall}
                        >
                            Install
                        </button>
                    )}

                    {isInstalled && (
                        <button
                            className="px-6 py-2 bg-red-600 rounded cursor-pointer"
                            onClick={handleUninstall}
                        >
                            Uninstall
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
