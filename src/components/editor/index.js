import React, { useEffect, useState } from "react";
import BraftEditor from "braft-editor";
import "braft-editor/dist/index.css";
import "./index.css";

const TextEditor = function (props) {
    const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null));

    const handleChange = (editorState) => {
        setEditorState(editorState);
    }

    useEffect(() => {
        if (props.content === undefined) return;
        setEditorState(BraftEditor.createEditorState(props.content));
    }, [props.content])

    return (
        <div className="my-component">
            <BraftEditor
                value={editorState} // 编辑器的内容
                onChange={handleChange}
                onBlur={() => { // 当失去焦点后把具体内容返回给父组件
                    props.getContent(editorState.toHTML());
                }}
                placeholder={props.placeholder}
            />
        </div>
    )
}

export default TextEditor;