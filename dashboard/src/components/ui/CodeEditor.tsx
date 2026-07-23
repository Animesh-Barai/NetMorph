import React from "react";
import Editor, { EditorProps } from "@monaco-editor/react";

interface CodeEditorProps extends EditorProps {
  containerClassName?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  height = "300px", 
  language = "python", 
  theme = "vs-dark",
  options = {},
  containerClassName = "",
  readOnly = false,
  ...props 
}) => {
  const defaultOptions: EditorProps["options"] = {
    minimap: { enabled: false },
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
    lineNumbers: "on",
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: readOnly,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    ...options
  };

  return (
    <div className={`rounded-md overflow-hidden border border-surface-high/50 bg-[#1e1e1e] ${containerClassName}`}>
      <Editor
        height={height}
        language={language}
        theme={theme}
        options={defaultOptions}
        {...props}
      />
    </div>
  );
};

export default CodeEditor;
