import { useState, useEffect, useRef } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Plus,
    PanelLeftOpen,
    PanelRightOpen,
    Search,
    ArchiveRestore,
    Notebook,
    File
} from 'lucide-react'
import NoteEditor from './NoteEditor'
import classNames from 'classnames'
import { getEmptyEditorState } from '../../utils/noteEditor'
import ConfirmSoftDeleteNotebookModal from './ConfirmSoftDeleteNotebookModal'
import ConfirmSoftDeleteNoteModal from './ConfirmSoftDeleteNoteModal'
import ConfirmDeleteNotebookModal from './ConfirmDeleteNotebookModal'
import ConfirmDeleteNoteModal from './ConfirmDeleteNoteModal'
import { Trash2 } from 'lucide-react'



export default function NoteBookLayout({ selectedProject }) {
    const [notebookVisible, setNotebookVisible] = useState(true)
    const toggleNotebook = () => setNotebookVisible(prev => !prev)

    const [notebooks, setNotebooks] = useState([])
    const [selectedNotebookId, setSelectedNotebookId] = useState(null)
    const [isAddingNotebook, setIsAddingNotebook] = useState(false)
    const [newNotebookName, setNewNotebookName] = useState('')
    const [renamingNotebookId, setRenamingNotebookId] = useState(null)
    const [renameNotebookValue, setRenameNotebookValue] = useState('')
    const [dropdownNotebookId, setDropdownNotebookId] = useState('')
    const [notebookId, setNotebookId] = useState('')
    const [notebookName, setNotebookName] = useState('')
    const [showConfirmSoftDeleteNotebook, setShowConfirmSoftDeleteNotebook] = useState(false)
    const [showConfirmDeleteNotebook, setShowConfirmDeleteNotebook] = useState(false)
    const [trashedNotebooks, setTrashedNotebooks] = useState([])

    const [notesByNotebook, setNotesByNotebook] = useState({})
    const [selectedNoteId, setSelectedNoteId] = useState(null)
    const [isAddingNote, setIsAddingNote] = useState(false)
    const [newNoteName, setNewNoteName] = useState('')
    const [renamingNoteId, setRenamingNoteId] = useState(null)
    const [renameValue, setRenameValue] = useState('')
    const [dropdownNoteId, setDropdownNoteId] = useState('')
    const [trashedNotes, setTrashedNotes] = useState([])
    const [showConfirmSoftDeleteNote, setShowConfirmSoftDeleteNote] = useState(false)
    const [showConfirmDeleteNote, setShowConfirmDeleteNote] = useState(false)

    const [noteId, setNoteId] = useState('')
    const [noteName, setNoteName] = useState('')

    const [trashOpen, setTrashOpen] = useState(false)


    const currentNotes = notesByNotebook[selectedNotebookId] || []

    const noteListRef = useRef(null)
    const notebookListRef = useRef(null)
    const notebookDropDownRef = useRef(null)
    const noteDropdownRef = useRef(null)
    const notesDropDownRef = useRef(null)

    /**
     * NOTEBOOKS CODE
     */
    useEffect(() => {
        fetchNotebooks()
        fetchTrashedNotes()
    }, [selectedProject])

    useEffect(() => {
        if (selectedProject?.path) {
            fetchTrashedNotebooks()
        }
    }, [selectedProject?.path])


    useEffect(() => {
        if (!selectedNotebookId) return

        const loadNotes = async () => {
            const notebook = await window.electron.invoke('get-notebook', {
                projectId: selectedProject.path,
                notebookId: selectedNotebookId
            })

            if (notebook) {
                setNotesByNotebook(prev => ({
                    ...prev,
                    [selectedNotebookId]: notebook.notes || [],
                }))
                if (!selectedNoteId && notebook.notes?.length > 0) {
                    setSelectedNoteId(notebook.notes[0].id)
                }
            }
        }

        loadNotes()
    }, [selectedNotebookId])

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                dropdownNotebookId &&
                notebookDropDownRef.current &&
                !notebookDropDownRef.current.contains(e.target)
            ) {
                setDropdownNotebookId(null)
            }

            if (
                dropdownNoteId &&
                noteDropdownRef.current &&
                !noteDropdownRef.current.contains(e.target)
            ) {
                setDropdownNoteId(null)
            }
        }

        window.addEventListener('mousedown', handleClickOutside)
        return () => {
            window.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownNotebookId, dropdownNoteId])

    const fetchNotebooks = async () => {
        if (!selectedProject?.path) return

        const allNotebooks = await window.electron.invoke('get-notebooks', {
            projectId: selectedProject.path,
            includeTrashed: false
        })

        const filtered = allNotebooks.filter(nb => nb.projectId === selectedProject.path)

        setNotebooks(filtered)

        // Preserve selected notebook if it still exists
        const stillExists = filtered.find(n => n.id === selectedNotebookId)

        if (stillExists) {
            setSelectedNotebookId(stillExists.id)
        } else {
            setSelectedNotebookId(filtered[0]?.id || null)
        }
    }

    const fetchTrashedNotebooks = async () => {
        if (!selectedProject?.path) return

        const trashList = await window.electron.invoke('get-notebooks', {
            projectId: selectedProject.path,
            includeTrashed: true,
        })

        setTrashedNotebooks(trashList.filter(n => n.trashed))
    }

    const handleAddNotebook = () => {
        setIsAddingNotebook(true)
        setNewNotebookName('')
    }

    const handleNotebookNameChange = (e) => {
        setNewNotebookName(e.target.value)
    }

    const handleNotebookSubmit = async () => {
        if (newNotebookName.trim() === '') {
            setIsAddingNotebook(false)
            return
        }

        const newNotebook = await window.electron.invoke('notebook-create', {
            projectId: selectedProject.path,
            name: newNotebookName.trim()
        })

        const updatedList = await window.electron.invoke('get-notebooks', {
            projectId: selectedProject.path,
            includeTrashed: false
        })

        setNotebooks(updatedList)
        setSelectedNotebookId(newNotebook.id)
        setIsAddingNotebook(false)
        setNewNotebookName('')
    }

    const handleNotebookCancel = () => {
        setIsAddingNotebook(false)
        setNewNotebookName('')
    }

    async function handleNotebookRenameSubmit(notebookId) {
        const newName = renameNotebookValue.trim()
        if (!newName) return

        try {
            await window.electron.invoke('rename-notebook', {
                projectId: selectedProject.path,
                notebookId, // ✅ use the scoped state value
                newName: renameNotebookValue.trim(),
            })

            await fetchNotebooks()
            setRenamingNotebookId(null)
            setRenameNotebookValue('')
        } catch (err) {
            console.error('[❌ rename-notebook failed]', err)
        }
    }


    async function handleSoftDeleteNotebook(notebookId) {
        setShowConfirmSoftDeleteNotebook(false)

        if (!selectedProject?.path) return

        await window.electron.invoke('soft-delete-notebook', {
            projectId: selectedProject.path,
            notebookId,
        })

        // Refresh notebook list (non-trashed)
        const updatedList = await window.electron.invoke('get-notebooks', {
            projectId: selectedProject.path,
            includeTrashed: false
        })
        setNotebooks(updatedList)

        // Deselect notebook if it was active
        if (selectedNotebookId === notebookId) {
            setSelectedNotebookId(null)
            setSelectedNoteId(null)
        }

        // Refresh trash view (if shown)
        const allNotebooks = await window.electron.invoke('get-notebooks', {
            projectId: selectedProject.path,
            includeTrashed: true
        })

        const trashed = allNotebooks.filter(n => n.trashed)
        setTrashedNotebooks(trashed)
    }

    const handleDeleteNotebook = async (notebookId) => {
        setShowConfirmDeleteNotebook(false)
        if (!selectedProject?.path) return

        try {
            await window.electron.invoke('delete-notebook', {
                projectId: selectedProject.path,
                notebookId,
            })

            await fetchNotebooks()
            await fetchTrashedNotebooks()
        } catch (err) {
            console.error('[❌ delete-notebook failed]', err)
        }
    }


    /**
     * NOTES CODE
     */

    useEffect(() => {
        async function loadNotesForSelectedNotebook() {
            if (!selectedNotebookId || !selectedProject?.path) return

            try {
                const notebook = await window.electron.invoke('get-notebook', {
                    projectId: selectedProject.path,
                    notebookId: selectedNotebookId
                })

                setNotesByNotebook(prev => ({
                    ...prev,
                    [selectedNotebookId]: notebook.notes || [],
                }))
            } catch (err) {
                console.error('[⚠️ Failed to load notebook]', err)
            }
        }

        loadNotesForSelectedNotebook()
    }, [selectedNotebookId, selectedProject])

    useEffect(() => {
        function handleClickOutside(e) {
            if (notesDropDownRef.current && !notesDropDownRef.current.contains(e.target)) {
                setDropdownNoteId(null)
            }
        }

        if (dropdownNoteId) {
            window.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            window.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownNoteId])


    const handleAddNote = () => {
        setIsAddingNote(true)
        setNewNoteName('')
    }

    const handleNoteNameChange = (e) => {
        setNewNoteName(e.target.value)
    }

    const handleNoteSubmit = async () => {
        if (newNoteName.trim() === '') {
            setIsAddingNote(false)
            return
        }

        const newNote = {
            id: `note-${Date.now()}`,
            name: newNoteName.trim(),
            created: Date.now(),
            content: getEmptyEditorState()
        }

        await window.electron.invoke('create-note', {
            projectId: selectedProject.id,
            notebookId: selectedNotebookId,
            note: newNote
        })

        setNotesByNotebook(prev => ({
            ...prev,
            [selectedNotebookId]: [...(prev[selectedNotebookId] || []), newNote],
        }))

        setSelectedNoteId(newNote.id)
        setIsAddingNote(false)
        setNewNoteName('')
    }

    const handleNoteCancel = () => {
        setIsAddingNote(false)
        setNewNoteName('')
        setDropdownNoteId(null)
    }

    const handleRenameNote = (noteId) => {
        const note = notesByNotebook[selectedNotebookId]?.find(n => n.id === noteId)

        if (!note) return
        setRenamingNoteId(noteId)
        setRenameValue(note.name)
        setDropdownNoteId(null)
    }

    const handleDeleteNote = async () => {
        setShowConfirmDeleteNote(false)
        try {
            await window.electron.invoke('delete-note', {
                projectId: selectedProject.path,
                notebookId,
                noteId,
            })

            // ✅ Remove from trash list in UI
            setTrashedNotes(prev => prev.filter(n => n.id !== noteId))

            // ✅ Clear right-side editor if the deleted note was selected
            if (selectedTrashNoteId === noteId) {
                setSelectedTrashNoteId(null)
                setEditorContent(null) // or whatever clears the preview
            }


        } catch (err) {
            console.error('❌ Failed to delete note permanently', err)
        }
    }


    const handleSoftDeleteNote = async () => {
        setShowConfirmSoftDeleteNote(false)

        if (!selectedProject?.path || !notebookId || !noteId) return

        // 1. Soft-delete the note on disk
        await window.electron.invoke('soft-delete-note', {
            projectId: selectedProject.path,
            notebookId,
            noteId,
        })

        // 2. Reload the updated notebook
        const updatedNotebook = await window.electron.invoke('get-notebook', {
            projectId: selectedProject.path,
            notebookId,
        })

        // 3. Determine next note to select (not trashed)
        const visibleNotes = updatedNotebook.notes.filter(n => !n.trashed)
        const deletedIndex = updatedNotebook.notes.findIndex(n => n.id === noteId)

        let nextNote = null
        if (visibleNotes.length > 0) {
            if (deletedIndex < visibleNotes.length) {
                nextNote = visibleNotes[deletedIndex] || visibleNotes[visibleNotes.length - 1]
            } else {
                nextNote = visibleNotes[visibleNotes.length - 1]
            }
        }

        setSelectedNoteId(nextNote?.id || null)

        // 4. Update in-memory note list
        setNotesByNotebook(prev => ({
            ...prev,
            [notebookId]: updatedNotebook.notes,
        }))

        // 5. Refresh UI
        await fetchNotebooks()
        await fetchTrashedNotes()
        setDropdownNoteId(null)
    }

    const handleRenameSubmit = (noteId) => {
        if (renameValue.trim() === '') return

        // Deselect the current note if it's the one being deleted
        if (selectedNoteId === noteId) {
            setSelectedNoteId(null)
        }

        setNotesByNotebook(prev => {
            const updated = prev[selectedNotebookId].map(n =>
                n.id === noteId ? { ...n, name: renameValue.trim() } : n
            )

            const updatedNotebook = {
                ...notebooks.find(n => n.id === selectedNotebookId),
                notes: updated,
            }

            if (updatedNotebook?.id && selectedProject?.path) {
                console.log("setNotesByNotebook | updatedNotebook | save-notebook = ", updatedNotebook)
                if (updatedNotebook?.id && selectedProject?.path) {
                    window.electron.invoke('save-notebook', {
                        projectId: selectedProject.path,
                        notebook: updatedNotebook
                    })
                }
            }

            return {
                ...prev,
                [selectedNotebookId]: updated
            }
        })

        setRenamingNoteId(null)
        setRenameValue('')
    }

    const fetchTrashedNotes = async () => {
        if (!selectedProject?.path) {
            console.warn('[🧹] No selected project path!')
            return
        }

        let all = []

        try {
            all = await window.electron.invoke('get-notebooks', {
                projectId: selectedProject.path,
                includeTrashed: true
            })
        } catch (err) {
            console.error('[🧹] Failed to fetch notebooks:', err)
            return
        }

        const seen = new Set()
        const trashed = []

        for (const nb of all) {
            if (nb.trashed) continue

            for (const note of nb.notes || []) {
                if (note.trashed && !seen.has(note.id)) {
                    seen.add(note.id)
                    trashed.push({
                        ...note,
                        notebookId: nb.id,
                        notebookName: nb.name,
                    })
                }
            }
        }

        setTrashedNotes([...trashed])
    }





    return (
        <>
        <div className="absolute top-0 left-[50px] bottom-0 right-0 flex overflow-y-hidden">
            {notebookVisible && (
                <div className={`w-[600px] ${notebooks.length > 0 && 'border-r border-[#6D6C6C]'} flex flex-row relative`}>
                    {/* NOTEBOOKS */}
                    <div className="w-[300px] border-r border-[#6D6C6C] mt-[0px]">
                        <div className='w-full h-[46px] border-b border-[#6D6C6C] py-[18px] pl-3 font-bold flex flex-row relative'>
                            <span className='text-xs'>NOTEBOOKS</span>
                            <Plus size={18} className='absolute right-2 cursor-pointer' onClick={handleAddNotebook} />
                        </div>

                        <div className="p-2 text-sm relative" ref={notebookListRef}>
                            {notebooks.map(notebook => {
                                return (
                                    <div key={notebook.id} ref={dropdownNotebookId === notebook.id ? notebookDropDownRef : null} className="mb-1">
                                        {renamingNotebookId === notebook.id ? (
                                            <form onSubmit={(e) => {
                                                e.preventDefault()
                                                handleNotebookRenameSubmit(notebook.id)
                                            }}>
                                                <input
                                                    autoFocus
                                                    value={renameNotebookValue}
                                                    onChange={(e) => setRenameNotebookValue(e.target.value)}
                                                    className="w-full px-2 py-1 text-sm bg-[#1e1e1e] text-white border border-[#555] rounded"
                                                />
                                                <div className="mt-2 flex gap-2">
                                                    <button type="submit" className="text-sm px-2 py-1 bg-blue-600 text-white rounded">Save</button>
                                                    <button
                                                        type="button"
                                                        className="text-sm px-2 py-1 bg-gray-600 text-white rounded"
                                                        onClick={() => {
                                                            setRenamingNotebookId(null)
                                                            setRenameNotebookValue('')
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div
                                                onClick={() => setSelectedNotebookId(notebook.id)}
                                                className={classNames(
                                                    'px-2 py-2 rounded cursor-pointer truncate flex items-center justify-between',
                                                    {
                                                        'bg-[#007acc] text-white': notebook.id === selectedNotebookId,
                                                        'hover:bg-[#2c2c2c] text-gray-300': notebook.id !== selectedNotebookId
                                                    }
                                                )}
                                            >
                                                <span>{notebook.name}</span>
                                                <button onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDropdownNotebookId(notebook.id)
                                                }}>
                                                    ⋮
                                                </button>
                                                {dropdownNotebookId === notebook.id && (
                                                    <div ref={notebookDropDownRef} className="absolute right-0 mt-1 w-40 z-50 bg-[#1f1f1f] text-white rounded shadow-lg border border-[#333]">
                                                        <div
                                                            className="px-4 py-2 hover:bg-[#333] cursor-pointer"
                                                            onClick={() => {
                                                                setRenamingNotebookId(notebook.id)
                                                                setRenameNotebookValue(notebook.name)
                                                                setDropdownNotebookId(null)
                                                            }}
                                                        >
                                                            ✏️ Rename Notebook
                                                        </div>
                                                        <div
                                                            className="px-4 py-2 hover:bg-[#333] cursor-pointer"
                                                            onClick={() => {
                                                                setNotebookId(notebook.id)
                                                                setNotebookName(notebook.name)
                                                                setShowConfirmSoftDeleteNotebook(true)
                                                                setDropdownNotebookId(null)
                                                            }}
                                                        >
                                                            🗑️ Move to trash
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}


                            {isAddingNotebook && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        handleNotebookSubmit()
                                    }}
                                    className='mb-3'
                                >
                                    <input
                                        autoFocus
                                        value={newNotebookName}
                                        onChange={handleNotebookNameChange}
                                        className="w-full px-2 py-1 mt-1 text-sm bg-[#1e1e1e] text-white border border-[#555] rounded"
                                        placeholder="New Notebook"
                                    />
                                    <div className="mt-2 flex gap-2">
                                        <button type="submit" className="text-sm px-2 py-1 bg-blue-600 text-white rounded">Add</button>
                                        <button type="button" className="text-sm px-2 py-1 bg-gray-600 text-white rounded" onClick={handleNotebookCancel}>Cancel</button>
                                    </div>
                                </form>
                            )}

                            {/* TRASH CAN */}
                            <div
                                className={`px-1 py-2 cursor-pointer truncate flex items-row hover:bg-[#2c2c2c]
                                    text-gray-300 relative ${notebooks.length > 0 && 'border-t border-gray-400'} pt-2`}
                                onClick={() => setTrashOpen(!trashOpen)}
                            >
                                {trashOpen ? <ChevronDown /> : <ChevronRight />}
                                <Trash2 size={20} className="mt-[1px]" />
                                <span className='ml-2 mt-[2px]'>Trash</span>
                                <span className="absolute right-1 mt-[2px]">{trashedNotebooks.length + trashedNotes.length}</span>
                            </div>
                            {trashOpen && (
                                <>
                                    {/* No Trash Items */}
                                    {trashedNotebooks.length === 0 && trashedNotes.length === 0 && (
                                        <div>
                                            <span className='ml-2'>There are no items in the trash.</span>
                                        </div>
                                    )}

                                    {/* Trashed Notebooks */}
                                    {trashedNotebooks.map(notebook => (
                                        <div
                                            key={notebook.id}
                                            className='py-4 rounded border border-gray-500 my-2 relative cursor-pointer flex flex-col'
                                        >
                                            <span className='ml-2 flex gap-2'>
                                                <Notebook size={16} className='mt-[2px]' />
                                                {notebook.name || 'Untitled Notebook'}
                                            </span>
                                            <button onClick={(e) => {
                                                e.stopPropagation()
                                                setDropdownNotebookId(notebook.id)
                                            }} className='absolute right-2 cursor-pointer'>
                                                ⋮
                                            </button>

                                            {dropdownNotebookId === notebook.id && (
                                                <div className="absolute right-0 mt-1 z-[5000] bg-[#2e2e2e] text-white rounded shadow-lg border border-[#333] w-[250px]">
                                                    <div
                                                        ref={notebookDropDownRef}
                                                        className="px-4 py-2 hover:bg-[#333] cursor-pointer flex"
                                                        onMouseDown={async () => {
                                                            await window.electron.invoke('restore-notebook', {
                                                                projectId: selectedProject.path,
                                                                notebookId: notebook.id,
                                                            })

                                                            await fetchNotebooks()
                                                            await fetchTrashedNotebooks()

                                                            // 🔥 Delay state set to ensure fresh notebook list is in memory
                                                            setTimeout(() => {
                                                                setSelectedNotebookId(notebook.id)
                                                            }, 0)

                                                            setDropdownNotebookId(null)
                                                        }}
                                                    >
                                                        <ArchiveRestore size={14} className="mt-[3px] mr-2 ml-1" /> Restore Notebook
                                                    </div>
                                                    <div
                                                        className="px-4 py-2 hover:bg-[#333] cursor-pointer w-[250px]"
                                                        onMouseDown={() => {
                                                            setNotebookId(notebook.id)
                                                            setNotebookName(notebook.name)
                                                            setDropdownNotebookId(null)
                                                            setShowConfirmDeleteNotebook(true)
                                                        }}
                                                    >
                                                        🗑️ Delete Notebook
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Trashed Notes */}
                                    {trashedNotes.length > 0 && (
                                        <>
                                            {Object.entries(
                                                trashedNotes.reduce((acc, note) => {
                                                    acc[note.notebookId] = acc[note.notebookId] || {
                                                        notebookName: note.notebookName,
                                                        notes: []
                                                    }
                                                    acc[note.notebookId].notes.push(note)
                                                    return acc
                                                }, {})
                                            ).map(([notebookId, { notebookName, notes }]) => (
                                                <div key={notebookId} className="mb-4">
                                                    {notes.map(note => (
                                                        <div
                                                            key={note.id}
                                                            className='py-4 rounded border border-gray-500 my-2 relative cursor-pointer flex flex-col'
                                                        >
                                                            <span className='ml-2 flex flex-row gap-2'>
                                                                <File size={16} className='mt-[2px]' />
                                                                {note.name || 'Untitled Note'}
                                                            </span>
                                                            <p className='ml-2 text-[.7rem] text-gray-400'>Notebook: {notebookName}</p>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setDropdownNoteId(note.id)
                                                                }}
                                                                className='absolute right-2 cursor-pointer top-6 flex flex-col'
                                                            >
                                                                ⋮
                                                            </button>

                                                            {dropdownNoteId === note.id && (
                                                                <div className="absolute right-0 mt-1 bg-[#2e2e2e] text-white rounded shadow-lg border border-[#333] w-[250px] z-[500]">
                                                                    <div
                                                                        ref={noteDropdownRef}
                                                                        className="px-4 py-2 hover:bg-[#333] cursor-pointer flex"
                                                                        onMouseDown={async () => {
                                                                            console.log('[🧠 Restoring Note]', note)

                                                                            await window.electron.invoke('restore-note', {
                                                                                projectId: selectedProject.path,
                                                                                notebookId: note.notebookId,
                                                                                noteId: note.id,
                                                                            })

                                                                            // Re-fetch full notebooks list
                                                                            const [allNotebooks, restoredNotebook] = await Promise.all([
                                                                                window.electron.invoke('get-notebooks', {
                                                                                    projectId: selectedProject.path,
                                                                                    includeTrashed: false
                                                                                }),
                                                                                window.electron.invoke('get-notebook', {
                                                                                    projectId: selectedProject.path,
                                                                                    notebookId: note.notebookId
                                                                                })
                                                                            ])

                                                                            // Forcefully replace both states
                                                                            setNotebooks([...allNotebooks])
                                                                            setNotesByNotebook(prev => {
                                                                                const updated = { ...prev }
                                                                                updated[note.notebookId] = [...restoredNotebook.notes]
                                                                                return updated
                                                                            })

                                                                            setSelectedNotebookId(note.notebookId)
                                                                            setSelectedNoteId(note.id)

                                                                            await fetchTrashedNotes()
                                                                            setDropdownNoteId(null)
                                                                        }}

                                                                    >
                                                                        <ArchiveRestore size={14} className="mt-[3px] mr-2 ml-1" /> Restore Note
                                                                    </div>
                                                                    <div
                                                                        className="px-4 py-2 hover:bg-[#333] cursor-pointer"
                                                                        onMouseDown={() => {
                                                                            setNoteId(note.id)
                                                                            setNoteName(note.name)
                                                                            setNotebookId(selectedNotebookId)
                                                                            setShowConfirmDeleteNote(true)
                                                                            setDropdownNoteId(null)
                                                                        }}
                                                                    >
                                                                        🗑️ Delete Note
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </>
                                    )}

                                </>
                            )}
                        </div>
                    </div>

                    {/* NOTES */}
                    {notebooks.length > 0 && (
                        <div className="w-[300px] relative mt-4">
                            <div className='w-full h-[30px] border-b border-[#6D6C6C] py-[3px] pl-2 font-bold flex flex-row relative'>
                                <span className='text-xs'>NOTES</span>
                                <Plus size={18} className='absolute right-2 cursor-pointer' onClick={handleAddNote} />
                            </div>

                            <div className="p-2 text-sm relative" ref={noteListRef}>
                                {currentNotes.map(note => (
                                    <div key={note.id} ref={dropdownNoteId === note.id ? notesDropDownRef : null} className="mb-1">
                                        {renamingNoteId === note.id ? (
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault()
                                                    handleRenameSubmit(note.id)
                                                }}
                                            >
                                                <input
                                                    autoFocus
                                                    value={renameValue}
                                                    onChange={(e) => setRenameValue(e.target.value)}
                                                    className="w-full px-2 py-1 text-sm bg-[#1e1e1e] text-white border border-[#555] rounded"
                                                />
                                                <div className="mt-2 flex gap-2">
                                                    <button type="submit" className="text-sm px-2 py-1 bg-blue-600 text-white rounded">
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-sm px-2 py-1 bg-gray-600 text-white rounded"
                                                        onClick={() => {
                                                            setRenamingNoteId(null)
                                                            setRenameValue('')
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div
                                                onClick={() => setSelectedNoteId(note.id)}
                                                title={new Date(note.created).toLocaleString()}
                                                className={classNames(
                                                    'px-3 py-2 rounded cursor-pointer truncate flex justify-between items-center',
                                                    {
                                                        'bg-[#535557] text-white': note.id === selectedNoteId,
                                                        'hover:bg-[#2c2c2c] text-gray-300': note.id !== selectedNoteId,
                                                    }
                                                )}
                                            >
                                                <div className="flex flex-col">
                                                    <span className='text-[1rem] font-bold'>{note.name}</span>
                                                    <p className='text-[.8rem]'>{new Date(note.created).toLocaleDateString()}</p>
                                                </div>

                                                <button
                                                    className="ml-2 px-2 text-white hover:text-blue-400 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setDropdownNoteId(note.id)
                                                    }}
                                                >
                                                    ⋮
                                                </button>

                                                {dropdownNoteId === note.id && (
                                                    <div className="absolute right-0 mt-1 bg-[#2e2e2e] border border-[#444] rounded shadow-lg z-50">
                                                        <div
                                                            className="px-4 py-2 hover:bg-[#333] cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRenameNote(note.id)
                                                            }}
                                                        >
                                                            ✏️ Rename
                                                        </div>
                                                        <div
                                                            className="px-4 py-2 hover:bg-[#333] cursor-pointer"
                                                            onClick={() => {
                                                                setNoteId(note.id)
                                                                setNoteName(note.name)
                                                                setNotebookId(selectedNotebookId) // or note.notebookId if in trash view
                                                                setShowConfirmSoftDeleteNote(true)
                                                                setDropdownNoteId(null)
                                                            }}
                                                        >
                                                            🗑️ Move to trash
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isAddingNote && (
                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        handleNoteSubmit()
                                    }}>
                                        <input
                                            autoFocus
                                            value={newNoteName}
                                            onChange={handleNoteNameChange}
                                            className="w-full px-2 py-1 mt-1 text-sm bg-[#1e1e1e] text-white border border-[#555] rounded"
                                            placeholder="New Note"
                                        />
                                        <div className="mt-2 flex gap-2">
                                            <button type="submit" className="text-sm px-2 py-1 bg-blue-600 text-white rounded">Add</button>
                                            <button type="button" className="text-sm px-2 py-1 bg-gray-600 text-white rounded" onClick={handleNoteCancel}>Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* NOTE EDITOR */}
            {notebooks.length > 0 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className='w-full h-[30px] border-b border-[#6D6C6C] py-0 px-2 relative text-center mt-4'>
                        <div className="absolute left-2 top-[0px]">
                            {notebookVisible ? (
                                <PanelRightOpen size={20} onClick={toggleNotebook} className='cursor-pointer' />
                            ) : (
                                <PanelLeftOpen size={20} onClick={toggleNotebook} className='cursor-pointer' />
                            )}
                        </div>
                        <div className='text-[1.1rem] mt-[-5px] font-medium'>
                            {notesByNotebook[selectedNotebookId]?.find(n => n.id === selectedNoteId)?.name || 'No Note'}
                        </div>
                    </div>

                    <NoteEditor
                        key={selectedNoteId} // ← THIS forces a fresh Lexical instance
                        note={currentNotes.find(n => n.id === selectedNoteId)}
                        updateNoteContent={(noteId, json) => {
                            setNotesByNotebook(prev => {
                                const prevNotes = prev[selectedNotebookId] || []
                                const existingNote = prevNotes.find(n => n.id === noteId)

                                if (!existingNote) return prev

                                // Skip if content hasn't changed
                                if (JSON.stringify(existingNote.content) === JSON.stringify(json)) {
                                    return prev
                                }

                                // Skip saving if the note is trashed
                                if (existingNote.trashed) return prev

                                const updatedNotes = prevNotes.map(n =>
                                    n.id === noteId ? { ...n, content: json } : n
                                )

                                const baseNotebook = notebooks.find(n => n.id === selectedNotebookId)
                                if (!baseNotebook) return prev

                                const updatedNotebook = {
                                    ...baseNotebook,
                                    notes: updatedNotes
                                }

                                // ✅ Guard again before saving
                                if (!updatedNotes.find(n => n.id === noteId)?.trashed) {
                                    window.electron.invoke('save-notebook', {
                                        projectId: selectedProject.path,
                                        notebook: updatedNotebook
                                    })
                                }

                                return {
                                    ...prev,
                                    [selectedNotebookId]: updatedNotes
                                }
                            })

                        }}

                    />
                </div>
            )}

            {/* NO NOTEBOOK VIEW */}
            {notebooks.length === 0 && (
                <div className="w-full flex flex-row justify-center relative ml-[-200px]">
                    <div className='text-4xl mt-[200px] flex flex-col text-center'>
                        <span>You have no notebooks</span>
                        <p
                            className='text-[1.5rem] text-[#51a2ff] mt-[60px] cursor-pointer hover:text-[#8ec5ff]'
                            onClick={handleAddNotebook}
                        >
                            Create a new notebook
                        </p>
                    </div>
                </div>
            )}

            {showConfirmSoftDeleteNotebook && (
                <ConfirmSoftDeleteNotebookModal
                    onCancel={() => setShowConfirmSoftDeleteNotebook(false)}
                    onConfirm={() => handleSoftDeleteNotebook(notebookId)}
                    notebookId={notebookId}
                    notebookName={notebookName}
                    isOpen={showConfirmSoftDeleteNotebook}
                />
            )}

            {showConfirmSoftDeleteNote && (
                <ConfirmSoftDeleteNoteModal
                    isOpen={true}
                    noteName={noteName}
                    noteId={noteId}
                    onCancel={() => setShowConfirmSoftDeleteNote(false)}
                    onConfirm={handleSoftDeleteNote}
                />
            )}

            {/* {showConfirmDeleteNotebook && ( */}
            <ConfirmDeleteNotebookModal
                isOpen={showConfirmDeleteNotebook}
                notebookId={notebookId}
                notebookName={notebookName}
                onCancel={() => setShowConfirmDeleteNotebook(false)}
                onConfirm={handleDeleteNotebook}

            />
            {/* )} */}


            {showConfirmDeleteNote && (
                <ConfirmDeleteNoteModal
                    isOpen={showConfirmDeleteNote}
                    noteName={noteName}
                    noteId={noteId}
                    onCancel={() => setShowConfirmDeleteNote(false)}
                    onConfirm={handleDeleteNote}
                />
            )}
        </div>
        </>
    )
}
