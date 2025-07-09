import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { $getNodeByKey } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Maximize2, Minimize2 } from 'lucide-react'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'

export default function CustomCodeComponent({ nodeKey, code = '', language: languageProp = 'js' }) {
    const [language, setLanguage] = useState(() => languageProp || 'js')
    const [editor] = useLexicalComposerContext()
    const [value, setValue] = useState(code)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [editorHeight, setEditorHeight] = useState(200)
    const editorRef = useRef(null)
    const monacoRef = useRef(null)

    const languageMap = {
        js: 'javascript',
        jsx: 'html',
        ts: 'typescript',
        tsx: 'typescriptreact',
        html: 'html',
        css: 'css',
        json: 'json',
        bash: 'bash',
        markdown: 'markdown'
    }

    const languageLabels = {
        js: 'JavaScript',
        jsx: 'JSX',
        ts: 'TypeScript',
        tsx: 'TSX',
        html: 'HTML',
        css: 'CSS',
        json: 'JSON',
        bash: 'Bash',
        markdown: 'Markdown',
    }

    const resolvedLang = languageMap[language] || language

    useEffect(() => {
        setValue(code)
    }, [code])

    const handleChange = (newValue) => {
        setValue(newValue)
        editor.update(() => {
            const node = $getNodeByKey(nodeKey)
            if (node && typeof node.setCode === 'function') {
                node.setCode(newValue || '')
            }
        })
    }

    const handleEditorDidMount = (editorInstance, monaco) => {
        editorRef.current = editorInstance
        monacoRef.current = monaco

        // Force language if needed
        const model = editorInstance.getModel()
        if (model) {
            monaco.editor.setModelLanguage(model, 'javascript')
        }

        // 🔥 Register JSX tokenizer override
        monaco.languages.setMonarchTokensProvider('javascript', {
            defaultToken: '',
            tokenPostfix: '.js',

            keywords: [
                'break', 'case', 'catch', 'class', 'const',
                'continue', 'debugger', 'default', 'delete', 'do', 'else',
                'export', 'extends', 'false', 'finally', 'for', 'from', 'function',
                'if', 'import', 'in', 'instanceof', 'new', 'null', 'return',
                'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var',
                'void', 'while', 'with', 'yield', 'async', 'await', 'static'
            ],

            typeKeywords: ['any', 'boolean', 'number', 'object', 'string', 'undefined'],

            brackets: [
                ['{', '}', 'delimiter.curly'],
                ['[', ']', 'delimiter.square'],
                ['(', ')', 'delimiter.parenthesis']
            ],

            // Include JSX-specific rules
            operators: [
                '=', '>', '<', '!', '~', '?', ':',
                '==', '<=', '>=', '!=', '&&', '||', '++', '--',
                '+', '-', '*', '/', '&', '|', '^', '%', '<<',
                '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
                '^=', '%=', '<<=', '>>=', '>>>='
            ],

            // Regex identifiers
            symbols: /[=><!~?:&|+\-*\/\^%]+/,

            // Catches JSX tags
            escapes: /\\(?:[abfnrtv\\"'0-9xuU])/,

            tokenizer: {
                root: [
                    // JSX tags
                    [/<\/?/, { token: 'delimiter.angle', next: '@jsx' }],
                    // identifiers and keywords
                    [/[a-z_$][\w$]*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],
                    [/[A-Z][\w\$]*/, 'type.identifier'],  // types
                    { include: '@whitespace' },

                    // delimiters and operators
                    [/[{}()\[\]]/, '@brackets'],
                    [/[<>](?!@symbols)/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'operator',
                            '@default': ''
                        }
                    }],

                    // numbers
                    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    [/\d+/, 'number'],

                    // strings
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
                    [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
                    [/"/, 'string', '@string_double'],
                    [/'/, 'string', '@string_single'],
                ],

                whitespace: [
                    [/[ \t\r\n]+/, ''],
                    [/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],
                    [/\/\*/, 'comment', '@comment'],
                    [/\/\/.*$/, 'comment'],
                ],

                comment: [
                    [/[^\/*]+/, 'comment'],
                    [/\*\//, 'comment', '@pop'],
                    [/[\/*]/, 'comment']
                ],

                jsdoc: [
                    [/[^\/*]+/, 'comment.doc'],
                    [/\*\//, 'comment.doc', '@pop'],
                    [/[\/*]/, 'comment.doc']
                ],

                string_double: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/"/, 'string', '@pop']
                ],

                string_single: [
                    [/[^\\']+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/'/, 'string', '@pop']
                ],

                jsx: [
                    [/[a-zA-Z0-9\-]+/, 'type.identifier'],
                    [/=/, 'operator'],
                    [/"/, 'string', '@string_double'],
                    [/'/, 'string', '@string_single'],
                    [/\/?>/, { token: 'delimiter.angle', next: '@pop' }],
                ]
            }
        })

        // Trigger height
        const updateHeight = () => {
            const contentHeight = editorInstance.getContentHeight()
            setEditorHeight(contentHeight + 16)
        }

        editorInstance.onDidContentSizeChange(updateHeight)
        updateHeight()
    }

    useEffect(() => {
        const handleResize = () => {
            editorRef.current?.layout()
        }

        window.addEventListener('resize', handleResize)
        handleResize() // force layout on mount

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const timeout = setTimeout(() => {
            editorRef.current?.layout()
        }, 300)

        return () => clearTimeout(timeout)
    }, [editorHeight])

    useEffect(() => {
        if (!editorRef.current || !monacoRef.current) return

        const model = editorRef.current.getModel()
        const newLang = languageMap[language] || 'plaintext'

        if (model && monacoRef.current.editor.setModelLanguage) {
            monacoRef.current.editor.setModelLanguage(model, newLang)
        }
    }, [language])



    return (
        <div
            className="relative w-full overflow-hidden border border-[#a1a1a1] rounded mt-4 mb-6"
            style={{
                height: isCollapsed ? 100 : editorHeight,
            }}
        >
            <div className="absolute top-1 right-10 z-10">
                <select
                    value={language}
                    onChange={(e) => {
                        const newLang = e.target.value
                        setLanguage(newLang)
                        editor.update(() => {
                            const node = $getNodeByKey(nodeKey)
                            if (node && typeof node.setLanguage === 'function') {
                                node.setLanguage(newLang)
                            }
                        })
                    }}
                    className="bg-black text-white text-xs px-2 py-1 border border-[#a1a1a1] rounded"
                >
                    {Object.entries(languageLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Expand/Collapse Icon */}
            <button
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="absolute top-[5px] right-2 z-10 bg-black text-white p-1 rounded hover:bg-white hover:text-black transition"
            >
                {isCollapsed ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>

            <div className="w-full max-w-full overflow-x-hidden overflow-y-auto">
                <Editor
                    value={value}
                    height={editorHeight + 'px'}
                    language={languageMap[language] || 'plainText'}
                    theme="vs-dark"
                    onChange={handleChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        padding: { top: 8, bottom: 8 },
                        lineNumbers: 'on',
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    )
}
