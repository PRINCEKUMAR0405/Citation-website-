"use client";

import { useState, useEffect, useCallback } from "react";
import { Library, Download, Trash2, Edit, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Citation {
  id: string;
  title: string;
  authors: string;
  year: string;
  format: string;
  text: string;
  type: string;
  createdAt: string;
}

export default function BibliographyPage() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const fetchCitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/citations");
      const data = await res.json();
      setCitations(Array.isArray(data) ? data : []);
    } catch {
      setCitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCitations();
  }, [fetchCitations]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/citations/${id}`, { method: "DELETE" });
      setCitations((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silently fail
    }
  };

  const handleEdit = (citation: Citation) => {
    setEditingId(citation.id);
    setEditText(citation.text);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await fetch(`/api/citations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText }),
      });
      setCitations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, text: editText } : c))
      );
      setEditingId(null);
    } catch {
      setEditingId(null);
    }
  };

  const filteredCitations = citations.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.authors.toLowerCase().includes(search.toLowerCase());
    const matchFormat = formatFilter === "all" || c.format === formatFilter;
    return matchSearch && matchFormat;
  });

  const handleExport = () => {
    if (filteredCitations.length === 0) return;
    const content = filteredCitations.map((c, i) => `[${i + 1}] ${c.text}`).join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bibliography.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Library className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bibliography Manager</h1>
            <p className="text-muted-foreground text-sm">Organize and export your citations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCitations}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={handleExport} disabled={filteredCitations.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search citations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="APA">APA</SelectItem>
            <SelectItem value="MLA">MLA</SelectItem>
            <SelectItem value="Chicago">Chicago</SelectItem>
            <SelectItem value="Harvard">Harvard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["APA", "MLA", "Chicago", "Harvard"].map((fmt) => (
          <Card key={fmt}>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold">
                {citations.filter((c) => c.format === fmt).length}
              </p>
              <p className="text-sm text-muted-foreground">{fmt} citations</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading citations...</p>
        </div>
      ) : filteredCitations.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Library className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-lg font-medium mb-1">No citations yet</p>
          <p className="text-muted-foreground text-sm mb-4">
            Generate citations and save them to your bibliography
          </p>
          <Button asChild variant="outline">
            <a href="/citations">Go to Citation Generator</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCitations.map((citation, index) => (
            <Card key={citation.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">[{index + 1}]</span>
                      <Badge variant="outline" className="text-xs">{citation.format}</Badge>
                      <Badge variant="secondary" className="text-xs">{citation.type}</Badge>
                    </div>
                    {editingId === citation.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(citation.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-mono leading-relaxed">{citation.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {citation.authors} · {citation.year} · Added {new Date(citation.createdAt).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                  {editingId !== citation.id && (
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(citation)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(citation.id)} className="h-8 w-8 p-0 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
