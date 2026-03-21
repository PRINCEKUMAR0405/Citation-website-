"use client";

import { useState } from "react";
import { Copy, Check, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { generateAllFormats, type CitationData, type GeneratedCitation } from "@/lib/citation-formats";

const defaultForm: CitationData = {
  title: "",
  authors: "",
  year: "",
  source: "",
  volume: "",
  issue: "",
  pages: "",
  doi: "",
  url: "",
  publisher: "",
  type: "article",
};

export default function CitationsPage() {
  const [form, setForm] = useState<CitationData>(defaultForm);
  const [citations, setCitations] = useState<GeneratedCitation | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof CitationData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setCitations(null);
  };

  const handleGenerate = () => {
    if (!form.title || !form.authors) return;
    setCitations(generateAllFormats(form));
  };

  const handleCopy = async (format: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async (format: string, text: string) => {
    setSaving(true);
    try {
      await fetch("/api/citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, format, text }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Citation Generator</h1>
          <p className="text-muted-foreground text-sm">Generate citations in APA, MLA, Chicago, and Harvard formats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Source Details</CardTitle>
            <CardDescription>Enter the details of your source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Source Type</Label>
              <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Journal Article</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="conference">Conference Paper</SelectItem>
                  <SelectItem value="thesis">Thesis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Enter source title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Authors * (semicolon-separated)</Label>
              <Input
                placeholder="e.g. John Smith; Jane Doe"
                value={form.authors}
                onChange={(e) => handleChange("authors", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  placeholder="e.g. 2024"
                  value={form.year}
                  onChange={(e) => handleChange("year", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Pages</Label>
                <Input
                  placeholder="e.g. 45-67"
                  value={form.pages}
                  onChange={(e) => handleChange("pages", e.target.value)}
                />
              </div>
            </div>

            {form.type === "article" && (
              <>
                <div className="space-y-2">
                  <Label>Journal / Source</Label>
                  <Input
                    placeholder="Journal name"
                    value={form.source}
                    onChange={(e) => handleChange("source", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Volume</Label>
                    <Input
                      placeholder="e.g. 12"
                      value={form.volume}
                      onChange={(e) => handleChange("volume", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue</Label>
                    <Input
                      placeholder="e.g. 3"
                      value={form.issue}
                      onChange={(e) => handleChange("issue", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {form.type === "book" && (
              <div className="space-y-2">
                <Label>Publisher</Label>
                <Input
                  placeholder="Publisher name"
                  value={form.publisher}
                  onChange={(e) => handleChange("publisher", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>DOI</Label>
              <Input
                placeholder="e.g. 10.1000/xyz123"
                value={form.doi}
                onChange={(e) => handleChange("doi", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                placeholder="https://..."
                value={form.url}
                onChange={(e) => handleChange("url", e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={!form.title || !form.authors}
            >
              Generate Citations
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {citations ? (
            <Card>
              <CardHeader>
                <CardTitle>Generated Citations</CardTitle>
                <CardDescription>Click copy to use a citation format</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="APA">
                  <TabsList className="grid grid-cols-4 w-full">
                    {Object.keys(citations).map((fmt) => (
                      <TabsTrigger key={fmt} value={fmt}>{fmt}</TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(citations).map(([fmt, text]) => (
                    <TabsContent key={fmt} value={fmt} className="mt-4">
                      <div className="relative rounded-lg border bg-muted/30 p-4 pr-24">
                        <p className="text-sm leading-relaxed font-mono">{text}</p>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(fmt, text)}
                            className="h-8 w-8 p-0"
                          >
                            {copied === fmt ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSave(fmt, text)}
                            disabled={saving}
                            className="h-8 w-8 p-0"
                          >
                            {saved ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Click the plus icon to save to your bibliography
                      </p>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl p-12 text-center">
              <div>
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Fill in the form and click Generate Citations</p>
              </div>
            </div>
          )}

          {/* Format Guide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Format Quick Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { fmt: "APA", desc: "Psychology, Education, Sciences" },
                { fmt: "MLA", desc: "Literature, Humanities" },
                { fmt: "Chicago", desc: "History, Arts, Social Sciences" },
                { fmt: "Harvard", desc: "Business, Economics, Sciences" },
              ].map((item) => (
                <div key={item.fmt} className="flex items-center justify-between">
                  <Badge variant="outline">{item.fmt}</Badge>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
