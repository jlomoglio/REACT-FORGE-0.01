import { DecoratorNode } from 'lexical'
import React from 'react'
import StyleGuideWidget from './StyleGuideWidget'

export class StyleGuideNode extends DecoratorNode {
	static getType() {
		return 'style-guide'
	}

	static clone(node) {
		return new StyleGuideNode(node.__color, node.__label, node.__code, node.__key)
	}

	static importJSON(serializedNode) {
		const { color, label, code } = serializedNode
		return new StyleGuideNode(color, label, code)
	}

	exportJSON() {
		return {
			type: 'style-guide',
			version: 1,
			color: this.__color,
			label: this.__label,
			code: this.__code,
		}
	}

	constructor(color, label, code, key) {
		super(key)
		this.__color = color
		this.__label = label
		this.__code = code
	}

	createDOM() {
		const container = document.createElement('div')
		return container
	}

	updateDOM() {
		return false
	}

	decorate() {
		return (
			<StyleGuideWidget
				color={this.__color}
				label={this.__label}
				code={this.__code}
			/>
		)
	}
}
