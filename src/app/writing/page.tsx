"use client";

import { useState, useRef } from "react";
import { PenTool, Sparkles, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AI_SUGGESTIONS = [
  "According to recent research (Author, Year), this finding demonstrates...",
  "Studies have shown that (Smith et al., 2023) the correlation between...",
  "As noted by leading experts in the field (Johnson & Lee, 2024)...",
  "The empirical evidence suggests (Brown, 2022) a significant relationship...",
  "A systematic review by (Williams et al., 2023) found that...",
];

const WRITING_TIPS = [
  { tip: "Use active voice", example: "The researcher conducted → is better than → The study was conducted" },
  { tip: "Be specific with citations", example: "Include page numbers for direct quotes" },
  { tip: "Integrate citations smoothly", example: "Avoid starting sentences with citation markers" },
  { tip: "Vary citation placement", example: "Place citations at the beginning, middle, or end" },
];

export default function WritingPage() {
  const [text, setText] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAISuggest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setSuggestion(data.suggestion);
    } catch {
      const random = AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)];
      setSuggestion(random);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertSuggestion = () => {
    if (!suggestion) return;
    const newText = text + (text ? "\n\n" : "") + suggestion;
    setText(newText);
    setSuggestion("");
    textareaRef.current?.focus();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const citationCount = (text.match(/\(.*?\d{4}.*?\)/g) || []).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <PenTool className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Writing Assistant</h1>
          <p className="text-muted-foreground text-sm">AI-powered writing help with citation suggestions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Document Editor</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{wordCount} words</Badge>
                  <Badge variant="outline">{citationCount} citations</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={textareaRef}
                placeholder="Start writing your academic paper here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-muted-foreground">{charCount} characters</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} disabled={!text}>
                    <Copy className="h-4 w-4 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={handleAISuggest} disabled={loading}>
                    <Sparkles className="h-4 w-4 mr-1" />
                    {loading ? "Thinking..." : "AI Suggest"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {suggestion && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 mb-3 italic">
                  {suggestion}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleInsertSuggestion}>Insert into Document</Button>
                  <Button size="sm" variant="outline" onClick={handleAISuggest} disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-1" />Try Another
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSuggestion("")}>Dismiss</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Citation Formats</CardTitle>
              <CardDescription className="text-xs">Common citation patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { format: "APA In-text", example: "(Smith, 2023, p. 45)" },
                { format: "MLA In-text", example: "(Smith 45)" },
                { format: "Chicago", example: "(Smith 2023, 45)" },
                { format: "Harvard", example: "(Smith, 2023: 45)" },
              ].map((item) => (
                <div key={item.format} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{item.format}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">{item.example}</code>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {WRITING_TIPS.map((tip, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-xs font-medium mb-0.5">{tip.tip}</p>
                  <p className="text-xs text-muted-foreground">{tip.example}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
