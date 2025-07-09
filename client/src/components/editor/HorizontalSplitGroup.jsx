import {
	PanelGroup,
	Panel,
	PanelResizeHandle,
} from 'react-resizable-panels'
import { useEditorLayoutStore } from '@/state/editorLayoutState'
import VerticalSplitPane from './VerticalSplitPane'
import { useMemo, Fragment } from 'react'

export default function HorizontalSplitGroup() {
	const layout = useEditorLayoutStore(state => state.layout)
	const { panes } = useEditorLayoutStore()

	const paneMap = useMemo(
		() => Object.fromEntries(panes.map(p => [p.id, p])),
		[panes]
	)

	const groups = useMemo(() => {
		return layout
			.filter(group => group && Array.isArray(group.vertical))
			.map(group => {
				const resolvedPanes = group.vertical
					.map(p => paneMap[p.id])
					.filter(Boolean) // remove undefined
				return resolvedPanes.length > 0 ? resolvedPanes : null
			})
			.filter(Boolean)
	}, [layout, paneMap])

	const sizes = useMemo(() => {
		const count = groups.length || 1
		return Array(count).fill(100 / count)
	}, [groups.length])

	if (groups.length === 0) {
		console.warn('[🚫 HorizontalSplitGroup] No valid groups')
		return null
	}

	return groups.length === 1 ? (
		<VerticalSplitPane panes={groups[0]} />
	) : (
		<PanelGroup direction="horizontal" className="w-full h-full" id="horizontal-group">
			{groups.map((groupPanes, i) => (
				<Fragment key={`group-${i}`}>
					<Panel key={`group-${i}`} minSize={20} order={i}>
						<VerticalSplitPane panes={groupPanes} />
					</Panel>
					{i < groups.length - 1 && (
						<PanelResizeHandle className="group w-[4px] cursor-col-resize">
							<div className="w-full h-full bg-[#333] group-hover:bg-blue-500" />
						</PanelResizeHandle>
					)}
				</Fragment>
			))}
		</PanelGroup>
	)
}

