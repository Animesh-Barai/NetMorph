import React from "react";
import Editor, { EditorProps, loader } from "@monaco-editor/react";

// Configure monaco to load from local node_modules if needed, 
// but by default @monaco-editor/react uses a CDN for fast setup.
interface CodeEditorProps extends EditorProps {
  containerClassName?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  height = "300px", 
  language = "python", 
  theme = "vs-dark",
  options = {},
  containerClassName,
  ...props 
}) => {
  const defaultOptions: EditorProps["options"] = {
    minimap: { enabled: false },
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
    lineNumbers: "on",
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    ...options
  };

  return (
    <div className={`rounded-sm overflow-hidden border border-surface-high/50 bg-[#1e1e1e] ${containerClassName}`}>
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
