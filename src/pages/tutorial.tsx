import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WindowFrame } from "@/components/window-frame";
import { MainTitleBar } from "@/components/main-title-bar";

export default function TutorialPage() {
  const [num1, setNum1] = useState<string>("");
  const [num2, setNum2] = useState<string>("");
  const [result, setResult] = useState<string>("");

  async function handleAdd() {
    try {
      // Call the Rust backend command
      const sum = await invoke<number>("add_numbers", {
        a: parseInt(num1),
        b: parseInt(num2),
      });
      setResult(`Result: ${sum}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  }

  return (
    <WindowFrame titleBar={<MainTitleBar/>}>
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Simple Calculator</CardTitle>
            <CardDescription>
              This demonstrates frontend-backend communication in Tauri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Number</label>
              <Input
                type="number"
                placeholder="Enter first number"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Second Number</label>
              <Input
                type="number"
                placeholder="Enter second number"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
              />
            </div>

            <Button onClick={handleAdd} className="w-full">
              Add Numbers
            </Button>

            {result && (
              <div className="rounded-md bg-muted p-4 text-center">
                <p className="text-lg font-semibold">{result}</p>
              </div>
            )}

            <div className="rounded-md border p-4 text-sm">
              <p className="font-semibold mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Frontend (React) captures input values</li>
                <li>Calls <code className="bg-muted px-1">invoke("add_numbers")</code></li>
                <li>Backend (Rust) performs the calculation</li>
                <li>Returns result to frontend</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </WindowFrame>
  );
}
