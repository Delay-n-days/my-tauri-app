import { useState } from "react";
import Editor from "@monaco-editor/react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { Button } from "@/components/ui/button";
import { FolderOpen, Save, FileCode } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function EditorPage() {
  const [code, setCode] = useState<string>("# Open a Python file to start editing\n");
  const [fileName, setFileName] = useState<string>("");
  const [filePath, setFilePath] = useState<string>("");
  const [language, setLanguage] = useState<string>("python");

  const handleOpenFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Python Files",
            extensions: ["py"],
          },
          {
            name: "All Files",
            extensions: ["*"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        const content = await readTextFile(selected);
        setCode(content);
        setFilePath(selected);

        // Extract file name from path
        const parts = selected.split(/[\\/]/);
        const name = parts[parts.length - 1];
        setFileName(name);

        // Detect language from extension
        const ext = name.split(".").pop()?.toLowerCase();
        const langMap: Record<string, string> = {
          py: "python",
          js: "javascript",
          ts: "typescript",
          jsx: "javascript",
          tsx: "typescript",
          json: "json",
          html: "html",
          css: "css",
          md: "markdown",
          rs: "rust",
          go: "go",
          java: "java",
          cpp: "cpp",
          c: "c",
        };
        setLanguage(langMap[ext || ""] || "plaintext");

        toast.success(`File opened: ${name}`);
      }
    } catch (error) {
      toast.error(`Failed to open file: ${error}`);
    }
  };

  const handleSaveFile = async () => {
    if (!filePath) {
      toast.error("No file opened to save");
      return;
    }

    try {
      await writeTextFile(filePath, code);
      toast.success("File saved successfully");
    } catch (error) {
      toast.error(`Failed to save file: ${error}`);
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2">
          <Button onClick={handleOpenFile} variant="outline" size="sm">
            <FolderOpen className="mr-2 h-4 w-4" />
            Open File
          </Button>
          <Button
            onClick={handleSaveFile}
            variant="outline"
            size="sm"
            disabled={!filePath}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            {fileName ? (
              <>
                <FileCode className="h-4 w-4" />
                <span>{fileName}</span>
                <span className="text-xs">({language})</span>
              </>
            ) : (
              <span>No file opened</span>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              lineNumbers: "on",
              renderWhitespace: "selection",
              tabSize: 4,
            }}
          />
        </div>
      </div>
    </>
  );
}
