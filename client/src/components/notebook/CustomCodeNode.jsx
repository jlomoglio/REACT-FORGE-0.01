import {
    DecoratorNode,
    $applyNodeReplacement
} from 'lexical'
import * as React from 'react'
import CustomCodeComponent from '@/components/notebook/CustomCodeComponent'

export class CustomCodeNode extends DecoratorNode {
    static getType() {
        return 'custom-code'
    }

    static clone(node) {
        return new CustomCodeNode(node.__code, node.__language, node.__key)
    }

    constructor(code = '', language = 'js', key) {
        super(key)
        this.__code = code
        this.__language = language
    }


    createDOM() {
        const dom = document.createElement('div')
        return dom
    }

    updateDOM() {
        return false
    }

    decorate(editor, config) {
        return <CustomCodeComponent
            nodeKey={this.getKey()}
            code={this.__code}
            language={this.__language || 'javascript'}
        />
    }

    getCode() {
        return this.__code
    }

    setCode(newCode) {
        this.getWritable().__code = newCode
    }

    setLanguage(newLang) {
        const writable = this.getWritable()
        writable.__language = newLang
    }

    getLanguage() {
        return this.__language
    }

    static importJSON(serializedNode) {
        const { code, language } = serializedNode
        return new CustomCodeNode(code, language)
    }

    exportJSON() {
        return {
            type: 'custom-code',
            version: 1,
            code: this.__code,
            language: this.__language
        }
    }
}

export function $createCustomCodeNode(code = '') {
    return $applyNodeReplacement(new CustomCodeNode(code))
}

export function $isCustomCodeNode(node) {
    return node instanceof CustomCodeNode
}
