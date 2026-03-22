import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Common patterns for extracting citations from academic text
const CITATION_PATTERNS = {
  // APA style: (Author, Year)
  apa: /\(([A-Z][a-z]+(?:\s+(?:et\s+al\.|&\s+[A-Z][a-z]+))?),\s*(\d{4})\)/g,
  // Direct quotes with page numbers
  withPages: /\(([A-Z][a-z]+(?:\s+(?:et\s+al\.|&\s+[A-Z][a-z]+))?),\s*(\d{4}),\s*p+\.\s*(\d+(?:-\d+)?)\)/g,
  // DOI patterns
  doi: /10\.\d{4,9}\/[-._;()\/:A-Z0-9]+/gi,
  // URLs
  url: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g,
};

// List of known academic domains for source validation
const ACADEMIC_DOMAINS = [
  "doi.org",
  "arxiv.org",
  "scholar.google.com",
  "jstor.org",
  "pubmed.ncbi.nlm.nih.gov",
  "ieee.org",
  "acm.org",
  "springer.com",
  "sciencedirect.com",
  "nature.com",
  "science.org",
  "aaas.org",
  "wiley.com",
  "tandfonline.com",
  "sagepub.com",
  "elsevier.com",
  "oup.com",
  "cambridge.org",
  "researchgate.net",
  "academia.edu",
];

// Known predatory or questionable publishers (simplified list)
const QUESTIONABLE_SOURCES = ["scirp.org", "waset.org", "omicsonline.org"];

interface ExtractedCitation {
  author: string;
  year: string;
  pages?: string;
  confidence: number;
  context: string;
}

function validateSource(url: string | null): {
  isValid: boolean;
  reason: string;
} {
  if (!url) {
    return { isValid: true, reason: "No URL to validate" };
  }

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    // Check if it's from a questionable source
    if (QUESTIONABLE_SOURCES.some((qs) => domain.includes(qs))) {
      return {
        isValid: false,
        reason: "Source is from a known questionable publisher",
      };
    }

    // Check if it's from a known academic domain
    if (ACADEMIC_DOMAINS.some((ad) => domain.includes(ad))) {
      return { isValid: true, reason: "Source is from a trusted academic domain" };
    }

    // Check for .edu or .gov domains
    if (domain.endsWith(".edu") || domain.endsWith(".gov")) {
      return { isValid: true, reason: "Source is from an educational or government domain" };
    }

    // Otherwise, mark as uncertain but valid
    return {
      isValid: true,
      reason: "Source could not be verified as academic, but not flagged as questionable",
    };
  } catch {
    return { isValid: false, reason: "Invalid URL format" };
  }
}

function extractCitations(text: string): ExtractedCitation[] {
  const citations: ExtractedCitation[] = [];
  const seen = new Set<string>();

  // Extract citations with page numbers
  const withPagesMatches = Array.from(text.matchAll(CITATION_PATTERNS.withPages));
  for (const match of withPagesMatches) {
    const [fullMatch, author, year, pages] = match;
    const key = `${author}-${year}`;

    if (!seen.has(key)) {
      seen.add(key);
      const index = match.index || 0;
      const context = text.slice(Math.max(0, index - 50), Math.min(text.length, index + 100));

      citations.push({
        author,
        year,
        pages,
        confidence: 0.9,
        context,
      });
    }
  }

  // Extract basic APA citations
  const apaMatches = Array.from(text.matchAll(CITATION_PATTERNS.apa));
  for (const match of apaMatches) {
    const [fullMatch, author, year] = match;
    const key = `${author}-${year}`;

    if (!seen.has(key)) {
      seen.add(key);
      const index = match.index || 0;
      const context = text.slice(Math.max(0, index - 50), Math.min(text.length, index + 100));

      citations.push({
        author,
        year,
        confidence: 0.8,
        context,
      });
    }
  }

  return citations;
}

function extractDOIs(text: string): string[] {
  const dois = Array.from(text.matchAll(CITATION_PATTERNS.doi));
  return [...new Set(dois.map((m) => m[0]))];
}

function extractURLs(text: string): string[] {
  const urls = Array.from(text.matchAll(CITATION_PATTERNS.url));
  return [...new Set(urls.map((m) => m[0]))];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, text } = body;

    let content = text;

    // If documentId is provided, fetch the document
    if (documentId) {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      content = document.content || "";
    }

    if (!content) {
      return NextResponse.json(
        { error: "No content to extract citations from" },
        { status: 400 }
      );
    }

    // Extract citations, DOIs, and URLs
    const citations = extractCitations(content);
    const dois = extractDOIs(content);
    const urls = extractURLs(content);

    // Validate URLs
    const validatedUrls = urls.map((url) => ({
      url,
      validation: validateSource(url),
    }));

    // Generate suggested citations based on extracted information
    const suggestedCitations = citations.map((citation) => ({
      title: `Research by ${citation.author}`,
      authors: citation.author.replace(/\s+et\s+al\./, " et al."),
      year: citation.year,
      pages: citation.pages,
      confidence: citation.confidence,
      context: citation.context,
      type: "article",
    }));

    // Update document if documentId was provided
    if (documentId) {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "processed",
          extractedSources: JSON.stringify({
            citations: suggestedCitations,
            dois,
            urls: validatedUrls,
          }),
        },
      });
    }

    return NextResponse.json({
      citations: suggestedCitations,
      dois,
      urls: validatedUrls,
      summary: {
        totalCitations: citations.length,
        totalDOIs: dois.length,
        totalUrls: urls.length,
        validUrls: validatedUrls.filter((u) => u.validation.isValid).length,
      },
    });
  } catch (error) {
    console.error("Citation extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract citations" },
      { status: 500 }
    );
  }
}
