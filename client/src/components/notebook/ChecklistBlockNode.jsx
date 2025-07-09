import { DecoratorNode } from 'lexical'
import ChecklistBlockWidget from '@/components/notebook/ChecklistBlockWidget'

// export class ChecklistBlockNode extends DecoratorNode {
//     static getType() {
//         return 'checklist-block'
//     }

//     static clone(node) {
//         return new ChecklistBlockNode([...node.__items], node.__key)
//     }

//     static importJSON({ items }) {
//         return new ChecklistBlockNode(Array.isArray(items) ? items : [])
//     }

//     exportJSON() {
//         return {
//             type: 'checklist-block',
//             version: 1,
//             items: this.__items
//         }
//     }

//     constructor(items = [], key) {
//         super(key)
//         this.__items = Array.isArray(items) ? items : []
//     }

//     createDOM() {
//         const dom = document.createElement('div')
//         dom.contentEditable = 'false' // ✅ REQUIRED
//         dom.className = 'notebook-widget checklist-block-node'
//         return dom
//     }

//     updateDOM() {
//         return false
//     }

//     getItems() {
//         return this.__items
//     }

//     setItems(newItems) {
//         const writable = this.getWritable()
//         writable.__items = newItems
//     }

//     decorate() {
//         return (
//             <ChecklistBlockWidget
//                 items={this.__items}
//                 nodeKey={this.getKey()}
//             />
//         )
//     }

//     isInline() {
//         return false
//     }

//     isTopLevel() {
//         return true
//     }
// }


export class ChecklistBlockNode extends DecoratorNode {
	static getType() {
		return 'checklist-block'
	}

	static clone(node) {
		return new ChecklistBlockNode([...node.__items], node.__key)
	}

	constructor(items = [], key) {
		super(key)
		this.__items = Array.isArray(items) ? items : []
	}

	// Ensures Lexical knows this is a block
	isInline() {
		return false
	}

	isTopLevel() {
		return true
	}

	createDOM() {
		const dom = document.createElement('div')
		dom.contentEditable = 'false'
		dom.className = 'checklist-block-node'
		return dom
	}

	updateDOM() {
		return false
	}

	decorate() {
		return (
			<ChecklistBlockWidget
				items={this.__items}
				nodeKey={this.getKey()}
			/>
		)
	}

	exportJSON() {
		return {
			type: 'checklist-block',
			version: 1,
			items: this.__items
		}
	}

	static importJSON(serializedNode) {
		const { items } = serializedNode
		return new ChecklistBlockNode(Array.isArray(items) ? items : [])
	}

	getItems() {
		return this.__items
	}

	setItems(newItems) {
		const writable = this.getWritable()
		writable.__items = Array.isArray(newItems) ? newItems : []
	}
}
