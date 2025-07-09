import { ElementNode } from 'lexical'

export class HorizontalRuleNode extends ElementNode {
	static getType() {
		return 'horizontal-rule'
	}

	static clone(node) {
		return new HorizontalRuleNode(node.__key)
	}

	static importJSON() {
		return {
			// type info here
			type: 'horizontal-rule',
			version: 1,
		}
	}

	exportJSON() {
		return {
			type: 'horizontal-rule',
			version: 1,
		}
	}

	createDOM() {
		const hr = document.createElement('hr')
		hr.className = 'border-t border-[#555] my-4'
		return hr
	}

	updateDOM() {
		return false
	}
}

export function $createHorizontalRuleNode() {
	return new HorizontalRuleNode()
}
