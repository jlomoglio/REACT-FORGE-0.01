import DevForgeLogo from '../assets/icons/devforge_logo.svg'
import AddProjectIcon from '../assets/icons/new_project.svg'
import OpenProjectIcon from '../assets/icons/open_project.svg'
import ImportProjectIcon from '../assets/icons/import_project.svg'

export default function Welcome() {
    function handleNewProjectModal() {
        window.dispatchEvent(new CustomEvent('menu:new-project'))
    }

    function handleOpenProjectModal() {
        window.dispatchEvent(new CustomEvent('menu:open-project'))
    }

    function handleImportProjectModal() {
        window.dispatchEvent(new CustomEvent('menu:import-project'))
    }

    return (
        <div className="ml-30 mt-20 select-none flex flex-row">
            {/* Left Panel */}
            <div className='w-[500px]'>
                <div className="flex flex-row text-7xl ml-[-10px] select-none">
                    {/* <img src={DevForgeLogo} alt="DevForge Logo" className="w-[80px] h-[80px] mt-[10px]" /> */}
                    <span className="mt-4">ReactForge</span>
                </div>
                <p className="text-xl mt-3">React project development, reimagined</p>

                <div className="mt-6">
                    <p className="text-[1.4rem]">Start</p>
                    <ul className="mt-2">
                        <li
                            className="flex flex-row gap-2 text-[#0D99FF] cursor-pointer"
                            onClick={handleNewProjectModal}
                        >
                            <img src={AddProjectIcon} alt="New Project" className="w-5 h-5 mt-[2px]" /> New Project...
                        </li>
                        <li
                            className="flex flex-row gap-2 text-[#0D99FF] mt-4 cursor-pointer"
                            onClick={handleOpenProjectModal}
                        >
                            <img src={OpenProjectIcon} alt="Open Project" className="w-5 h-5 mt-[2px]" /> Open Project...
                        </li>
                        <li
                            className="flex flex-row gap-2 text-[#0D99FF] mt-4 cursor-pointer"
                            onClick={handleImportProjectModal}
                        >
                            <img src={ImportProjectIcon} alt="Import Project" className="w-5 h-5 mt-[2px]" /> Import Project...
                        </li>
                    </ul>
                </div>

                <div className="mt-6">
                    <p className="text-[1.4rem]">Recent Projects</p>
                    <ul className="mt-2">
                        <li className="text-[#0D99FF] cursor-pointer hover:underline">EasyLiquorPOS v2.5</li>
                        <li className="text-[#0D99FF] mt-4 cursor-pointer hover:underline">EasyLiquorPOS Container v2</li>
                        <li className="text-[#0D99FF] mt-4 cursor-pointer hover:underline">More...</li>
                    </ul>
                </div>
            </div>

            {/* Right Panel */}
            <div className='flex-1 flex-col'>
                <div className="flex flex-col text-7xl ml-[-10px] mt-[150px] select-none mr-[100px]">
                    <p className="text-[1.4rem]">Tutorials</p>

                    <div className="max-w-[650px] px-6 py-4 mt-4 bg-neutral-700 flex-1 flex-col rounded-md">
                        <p className="text-[1.2rem] font-medium">Getting started with RectForge</p>
                        <p className="text-[1rem] py-2">
                            Get to know the editor, learn the basics, and start building projects.
                        </p>
                    </div>

                    <div className="max-w-[650px] px-6 py-4 mt-4 bg-neutral-700 flex-1 flex-col rounded-md">
                        <p className="text-[1.2rem] font-medium">Learn the fundamentals</p>
                    </div>

                    <div className="max-w-[650px] px-6 py-4 mt-4 bg-neutral-700 flex-1 flex-col rounded-md">
                        <p className="text-[1.2rem] font-medium">Get started with React Development</p>
                        <p className="text-[1rem] py-2">
                            Your first steps to setup a React project with all the powerful tools and features that react has to offer.
                        </p>
                    </div>
                </div>

                <div className="text-[#0D99FF] mt-4 cursor-pointer hover:underline">More...</div>
            </div>
        </div>
    )
}
