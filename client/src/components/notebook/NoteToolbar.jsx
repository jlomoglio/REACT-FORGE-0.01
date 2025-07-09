import { useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    $getRoot
} from 'lexical'
import { $wrapNodeInElement } from '@lexical/utils'
import { createCommand } from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text'
import { ParagraphNode, $createParagraphNode } from 'lexical'
import { ListItemNode, ListNode } from '@lexical/list'
import { INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { FORMAT_ELEMENT_COMMAND, COMMAND_PRIORITY_EDITOR } from 'lexical'
import { $createCustomCodeNode } from '@/components/notebook/CustomCodeNode'
import { $insertNodes } from 'lexical'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { $createHorizontalRuleNode } from '@/components/notebook/HorizontalRuleNode'
import { $createImageNode } from './ImageNode'
import { INSERT_COLOR_TOKEN_COMMAND } from '@/utils/lexicalCommands'
import { INSERT_CHECK_LIST_COMMAND } from '@lexical/list'
import { ChecklistBlockNode } from './ChecklistBlockNode'


import { ListChecks } from 'lucide-react'
import BoldIcon from '../../assets/icons/notebook/bold.svg'
import ItalicIcon from '../../assets/icons/notebook/italic.svg'
import UnderlineIcon from '../../assets/icons/notebook/underline.svg'
import H1Icon from '../../assets/icons/notebook/h1.svg'
import H2Icon from '../../assets/icons/notebook/h2.svg'
import H3Icon from '../../assets/icons/notebook/h3.svg'
import ALeftIcon from '../../assets/icons/notebook/left.svg'
import ACenterIcon from '../../assets/icons/notebook/center.svg'
import ARightIcon from '../../assets/icons/notebook/right.svg'
import CheckboxIcon from '../../assets/icons/notebook/checkbox.svg'
import HLineIcon from '../../assets/icons/notebook/hline.svg'
import ImageIcon from '../../assets/icons/notebook/image.svg'
import LinkIcon from '../../assets/icons/notebook/link.svg'
import ListBulletIcon from '../../assets/icons/notebook/bullet_list.svg'
import ListCheckboxtIcon from '../../assets/icons/notebook/checkbox_list.svg'
import ListNumberIcon from '../../assets/icons/notebook/number_list.svg'
import CodeIcon from '../../assets/icons/notebook/code.svg'

export default function NoteToolbar({ onShowColorPicker }) {
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')

    const [editor] = useLexicalComposerContext()

    function applyHeading(level) {
        editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                const tag = `h${level}`
                $setBlocksType(selection, () => $createHeadingNode(tag))
            }
        })
    }

    function applyParagraph() {
        editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode())
            }
        })
    }

    const insertHR = () => {
        editor.update(() => {
            const hrNode = $createHorizontalRuleNode()
            $insertNodeToNearestRoot(hrNode)
        })
    }

    const insertChecklist = () => {
        editor.update(() => {
            const checklistBlock = new ChecklistBlockNode([
                { label: '', checked: false }
            ])
            $insertNodes([checklistBlock])
        })
    }

    const insertRawChecklist = () => {
        editor.update(() => {
            const node = new ChecklistBlockNode([
                { label: 'Test 1', checked: false },
                { label: 'Test 2', checked: true }
            ])
            $insertNodes([node])
        })
    }


    return (
        <div className="toolbar flex flex-row flex-wrap gap-1.5 py-0.5 px-2 border-b border-[#333] bg-[#1e1e1e]">

            {/* Formatting */}
            <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} title="Bold">
                <img src={BoldIcon} className="h-[15px]" />
            </button>
            <div className="w-[1px]" />
            <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} title="Italic">
                <img src={ItalicIcon} className="h-[15px]" />
            </button>
            <div className="w-[1px]" />
            <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} title="Underline">
                <img src={UnderlineIcon} className="h-[15px]" />
            </button>

            <div className="w-[10px]" />

            {/* Headings */}
            <button onClick={() => applyHeading(1)} title="Heading 1">
                <img src={H1Icon} className="h-[15px]" />
            </button>
            <div className="w-[1px]" />
            <button onClick={() => applyHeading(2)} title="Heading 2">
                <img src={H2Icon} className="h-[15px]" />
            </button>
            <div className="w-[1px]" />
            <button onClick={() => applyHeading(3)} title="Heading 3">
                <img src={H3Icon} className="h-[15px]" />
            </button>
            <button onClick={applyParagraph} title="Body Text">
                <span className="text-xs font-medium px-2 py-1 border border-[#555] rounded bg-[#2b2b2b] text-white">Body</span>
            </button>

            <div className="w-[10px]" />

            {/* Alignments */}
            <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} title="Align Left">
                <img src={ALeftIcon} className="h-[15px]" />
            </button>
            <div className="w-[1px]" />
            <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} title="Align Center">
                <img src={ACenterIcon} className="h-[15px]" />
            </button>
            <div className="w-[1px]" />
            <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} title="Align Right">
                <img src={ARightIcon} className="h-[15px]" />
            </button>

            <div className="w-[10px]" />

            {/* Lists */}
            <button onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)} title="Bullet List">
                <img src={ListBulletIcon} className="h-[15px]" />
            </button>
            <div className="w-[1px]" />
            <button onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)} title="Numbered List">
                <img src={ListNumberIcon} className="h-[15px]" />
            </button>
            <div className="w-[1px]" />
            <button onClick={insertChecklist} title="Checkbox List">
                <ListChecks />
            </button>


            <div className="w-[10px]" />

            {/* Code Block */}
            <button
                onClick={() => {
                    editor.update(() => {
                        const node = $createCustomCodeNode(`console.log('Hello world');`)
                        $insertNodes([node])
                    })
                }}
                title="Code Block"
            >
                <img src={CodeIcon} className="h-[15px]" />
            </button>

            <div className="w-[10px]" />

            {/* Divider */}
            <button onClick={insertHR} title="Horizontal Divider">
                <img src={HLineIcon} className="h-[5px] w-[20px]" />
            </button>

            <div className="w-[10px]" />

            {/* Image Upload */}
            <input
                type="file"
                accept="image/*"
                id="image-upload"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    const reader = new FileReader()
                    reader.onload = () => {
                        const src = reader.result
                        editor.update(() => {
                            const node = $createImageNode(src)
                            $insertNodes([node])
                        })
                    }
                    reader.readAsDataURL(file)

                    // Reset input so same file can be picked again
                    e.target.value = ''
                }}
            />
            <button onClick={() => document.getElementById('image-upload').click()} title="Image">
                <img src={ImageIcon} className="h-[15px]" />
            </button>

            <div className="w-[10px]" />

            {/* Style Guide Color Picker */}
            <button onClick={onShowColorPicker}>
                <span className="text-xs font-medium px-2 py-1 border border-[#555] rounded bg-[#2b2b2b] text-white">
                    Style Guide Widget
                </span>
            </button>


            <button onClick={insertRawChecklist}>Insert Raw Checklist</button>
        </div>
    )
}
