import {
    PanelGroup,
    Panel,
    PanelResizeHandle,
} from 'react-resizable-panels'
import EditorPane from './EditorPane'
import { Fragment } from 'react'

export default function VerticalSplitPane({ panes }) {
    if (!panes || panes.length === 0) return null

    return (
        <PanelGroup direction="vertical" className="w-full h-full" id={`vertical-group-${panes.map(p => p.id).join('-')}`}>
            {panes.map((pane, i) => (
                <Fragment key={pane.id}>
                    <Panel className="min-h-[100px]" id={pane.id} order={i}>
                        <EditorPane key={pane.id} pane={pane} />
                    </Panel>
                    {i < panes.length - 1 && (
                        <PanelResizeHandle
                            className="h-[6px] bg-[#4e4e4e] hover:bg-blue-500 transition-colors duration-200 cursor-row-resize"
                        />
                    )}
                </Fragment>
            ))}
        </PanelGroup>
    )
}
