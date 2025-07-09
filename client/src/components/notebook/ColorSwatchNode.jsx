import { DecoratorNode } from 'lexical'
import * as React from 'react'

function ColorSwatchComponent({ color }) {
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: '6px',
				lineHeight: 1, // tightly pack vertical alignment
				verticalAlign: 'middle',
				marginLeft: '5px'
			}}
		>
			<span
				style={{
					display: 'inline-block',
					width: '14px',
					height: '14px',
					borderRadius: '4px',
					backgroundColor: color,
					border: '1px solid #888',
					flexShrink: 0,
					position: 'relative',
					top: '-1px',
				}}
			/>
			<span
				style={{
					fontSize: '16px',
					color: '#ccc',
					position: 'relative',
					top: '-1px',
				}}
			>
				{color}
			</span>
		</span>

	)
}

export class ColorSwatchNode extends DecoratorNode {
	static getType() {
		return 'color-swatch'
	}

	static clone(node) {
		return new ColorSwatchNode(node.__color, node.__key)
	}

	constructor(color, key) {
		super(key)
		this.__color = color
	}

	static isInline() {
		return true
	}

	createDOM() {
		return document.createElement('span')
	}

	updateDOM(prevNode, dom) {
		return this.__color !== prevNode.__color
	}

	decorate() {
		return <ColorSwatchComponent color={this.__color} />
	}

	exportJSON() {
		return {
			type: 'color-swatch',
			version: 1,
			color: this.__color,
		}
	}

	static importJSON(json) {
		return new ColorSwatchNode(json.color)
	}
}

export function $createColorSwatchNode(color) {
	return new ColorSwatchNode(color)
}
