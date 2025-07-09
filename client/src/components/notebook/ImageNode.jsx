// components/notebook/ImageNode.js
import { DecoratorNode } from 'lexical'
import * as React from 'react'
import ImageComponent from './ImageComponent'

export class ImageNode extends DecoratorNode {
	constructor(src, altText = '', key) {
		super(key)
		this.__src = src
		this.__altText = altText
	}

	static getType() {
		return 'image'
	}

	static clone(node) {
		return new ImageNode(node.__src, node.__altText, node.__key)
	}

	static importJSON({ src, altText }) {
		return new ImageNode(src, altText)
	}

	exportJSON() {
		return {
			type: 'image',
			version: 1,
			src: this.__src,
			altText: this.__altText,
		}
	}

	createDOM() {
		const span = document.createElement('span')
		return span
	}

	updateDOM() {
		return false
	}

	decorate() {
		return <ImageComponent src={this.__src} altText={this.__altText} />
	}
}

export function $createImageNode(src, altText = '') {
	return new ImageNode(src, altText)
}
