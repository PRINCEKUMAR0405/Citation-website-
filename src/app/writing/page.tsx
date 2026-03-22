"use client";

import { useState, useRef } from "react";
import { PenTool, Sparkles, Copy, RefreshCw, Upload, Link as LinkIcon, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // New state for document upload and citation extraction
  const [documentUrl, setDocumentUrl] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [extractingCitations, setExtractingCitations] = useState(false);
  const [extractedCitations, setExtractedCitations] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle URL upload
  const handleUrlUpload = async () => {
    if (!documentUrl.trim()) return;

    setUploadingDoc(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const formData = new FormData();
      formData.append("url", documentUrl);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload document");

      const document = await res.json();
      setUploadStatus({
        type: "success",
        message: "Document uploaded successfully! Extracting citations...",
      });

      // Extract citations from the uploaded document
      await extractCitations(document.id);
      setDocumentUrl("");
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Failed to upload document. Please check the URL and try again.",
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  // Handle PDF file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload PDF");

      const document = await res.json();
      setUploadStatus({
        type: "success",
        message: "PDF uploaded successfully! Extracting citations...",
      });

      // Extract citations from the uploaded document
      await extractCitations(document.id);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Failed to upload PDF. Please try again.",
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  // Handle text content upload
  const handleTextExtract = async () => {
    if (!text.trim()) return;

    setExtractingCitations(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/extract-citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Failed to extract citations");

      const data = await res.json();
      setExtractedCitations(data.citations || []);
      setUploadStatus({
        type: "success",
        message: `Found ${data.summary.totalCitations} citations! ${data.summary.validUrls} valid sources verified.`,
      });
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Failed to extract citations from text.",
      });
    } finally {
      setExtractingCitations(false);
    }
  };

  // Extract citations from document
  const extractCitations = async (documentId: string) => {
    setExtractingCitations(true);

    try {
      const res = await fetch("/api/extract-citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (!res.ok) throw new Error("Failed to extract citations");

      const data = await res.json();
      setExtractedCitations(data.citations || []);
      setUploadStatus({
        type: "success",
        message: `Found ${data.summary.totalCitations} citations! ${data.summary.validUrls} valid sources verified.`,
      });
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Failed to extract citations.",
      });
    } finally {
      setExtractingCitations(false);
    }
  };

  // Save extracted citation to bibliography
  const handleSaveCitation = async (citation: any) => {
    try {
      const res = await fetch("/api/citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: citation.title,
          authors: citation.authors,
          year: citation.year,
          pages: citation.pages,
          type: citation.type,
          format: "APA",
          text: `${citation.authors} (${citation.year}). ${citation.title}.`,
        }),
      });

      if (res.ok) {
        alert("Citation saved to bibliography!");
      }
    } catch (error) {
      alert("Failed to save citation");
    }
  };


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
          {/* Document Upload Section */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-500" />
                Auto-Extract Citations from Documents
              </CardTitle>
              <CardDescription className="text-xs">
                Upload a document URL, PDF file, or paste text to automatically find and validate citations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="doc-url">Document URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="doc-url"
                        placeholder="https://example.com/research-paper.html"
                        value={documentUrl}
                        onChange={(e) => setDocumentUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUrlUpload()}
                      />
                      <Button
                        onClick={handleUrlUpload}
                        disabled={uploadingDoc || !documentUrl.trim()}
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        {uploadingDoc ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pdf" className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="pdf-file">Upload PDF File</Label>
                    <div className="flex gap-2">
                      <Input
                        id="pdf-file"
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={uploadingDoc}
                      />
                      <Button disabled={uploadingDoc} onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-1" />
                        {uploadingDoc ? "Uploading..." : "Browse"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-3">
                  <div className="space-y-2">
                    <Label>Extract from Current Document</Label>
                    <p className="text-xs text-muted-foreground">
                      Extract citations from the text you've written below
                    </p>
                    <Button
                      onClick={handleTextExtract}
                      disabled={extractingCitations || !text.trim()}
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {extractingCitations ? "Extracting..." : "Extract Citations"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {uploadStatus.type && (
                <div
                  className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm ${
                    uploadStatus.type === "success"
                      ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {uploadStatus.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {uploadStatus.message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted Citations Display */}
          {extractedCitations.length > 0 && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Extracted Citations ({extractedCitations.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  AI-verified sources from your document. Click to save to bibliography.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {extractedCitations.map((citation, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{citation.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {citation.authors} ({citation.year})
                          {citation.pages && `, pp. ${citation.pages}`}
                        </p>
                        {citation.confidence && (
                          <Badge
                            variant="outline"
                            className="text-xs mt-1"
                          >
                            {Math.round(citation.confidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSaveCitation(citation)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Existing Document Editor */}
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
