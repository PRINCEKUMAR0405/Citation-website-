"use client";

import { useState } from "react";
import { Search, ExternalLink, BookOpen, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Source {
  id: string;
  title: string;
  authors: string;
  year: string;
  source: string;
  type: string;
  doi?: string;
  url?: string;
  abstract: string;
  citations: number;
}

const MOCK_SOURCES: Source[] = [
  {
    id: "1",
    title: "Deep Learning for Natural Language Processing: A Comprehensive Survey",
    authors: "Zhang Wei; Li Ming; Johnson Alice",
    year: "2023",
    source: "Journal of Artificial Intelligence Research",
    type: "article",
    doi: "10.1613/jair.1.14123",
    abstract: "This paper presents a comprehensive survey of deep learning techniques applied to natural language processing tasks...",
    citations: 342,
  },
  {
    id: "2",
    title: "The Impact of Social Media on Academic Performance",
    authors: "Smith John; Williams Sarah",
    year: "2022",
    source: "Educational Psychology Review",
    type: "article",
    doi: "10.1007/s10648-022-09645-1",
    abstract: "This study examines the relationship between social media usage and academic performance among university students...",
    citations: 187,
  },
  {
    id: "3",
    title: "Climate Change and Biodiversity Loss: A Global Perspective",
    authors: "Green Emma; Brown David; White Peter",
    year: "2023",
    source: "Nature Climate Change",
    type: "article",
    doi: "10.1038/s41558-023-01608-5",
    abstract: "We analyze the accelerating loss of biodiversity driven by climate change across multiple ecosystems...",
    citations: 521,
  },
  {
    id: "4",
    title: "Artificial Intelligence in Healthcare: Applications and Challenges",
    authors: "Patel Raj; Kumar Anita; Lee James",
    year: "2024",
    source: "JAMA Network Open",
    type: "article",
    doi: "10.1001/jamanetworkopen.2024.00000",
    abstract: "A systematic review of AI applications in clinical settings, including diagnostic tools and treatment planning...",
    citations: 89,
  },
  {
    id: "5",
    title: "Quantum Computing: Principles and Practical Applications",
    authors: "Einstein Albert; Bohr Niels",
    year: "2023",
    source: "Physical Review Letters",
    type: "book",
    abstract: "A comprehensive introduction to quantum computing, covering fundamental principles and emerging applications...",
    citations: 1205,
  },
  {
    id: "6",
    title: "Machine Learning in Financial Markets",
    authors: "Buffett Warren; Simons James",
    year: "2024",
    source: "Journal of Finance",
    type: "article",
    doi: "10.1111/jofi.13456",
    abstract: "We examine the growing role of machine learning algorithms in predicting market movements and portfolio optimization...",
    citations: 267,
  },
];

export default function SourcesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [results, setResults] = useState<Source[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [citeAdded, setCiteAdded] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const filtered = MOCK_SOURCES.filter((s) => {
      const matchQuery =
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.authors.toLowerCase().includes(query.toLowerCase()) ||
        s.source.toLowerCase().includes(query.toLowerCase()) ||
        s.abstract.toLowerCase().includes(query.toLowerCase());
      const matchFilter = filter === "all" || s.type === filter;
      return matchQuery && matchFilter;
    });
    setResults(filtered);
    setSearched(true);
    setLoading(false);
  };

  const handleCite = async (source: Source) => {
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source),
      });
      const data = await res.json();
      setCiteAdded(data.id || source.id);
      setTimeout(() => setCiteAdded(null), 2000);
    } catch {
      setCiteAdded(source.id);
      setTimeout(() => setCiteAdded(null), 2000);
    }
  };

  const typeIcon = (type: string) => {
    if (type === "book") return <BookOpen className="h-4 w-4" />;
    if (type === "website") return <Globe className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Source Finder</h1>
          <p className="text-muted-foreground text-sm">Search academic papers, books, and journals</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by title, author, journal..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="book">Books</SelectItem>
                <SelectItem value="website">Websites</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          {results.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No sources found. Try different keywords.</p>
            </div>
          ) : (
            results.map((source) => (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {typeIcon(source.type)}
                          {source.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{source.year}</span>
                        <span className="text-xs text-muted-foreground">· {source.citations} citations</span>
                      </div>
                      <h3 className="font-semibold mb-1">{source.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{source.authors.replace(/;/g, ", ")}</p>
                      <p className="text-sm text-primary font-medium mb-2">{source.source}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{source.abstract}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button size="sm" onClick={() => handleCite(source)}>
                        {citeAdded === source.id ? "Added" : "Cite"}
                      </Button>
                      {source.doi && (
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`https://doi.org/${source.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> DOI
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {!searched && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-lg font-medium mb-1">Search Academic Sources</p>
          <p className="text-muted-foreground">Enter keywords to find papers, books, and articles</p>
        </div>
      )}
    </div>
  );
}
