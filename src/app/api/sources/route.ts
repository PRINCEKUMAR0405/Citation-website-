import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAllFormats } from "@/lib/citation-formats";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  
  return NextResponse.json({
    query,
    results: [],
    message: "Use the Source Finder UI to search for sources",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, authors, year, source, type, doi, url } = body;
    
    if (!title || !authors) {
      return NextResponse.json({ error: "Title and authors are required" }, { status: 400 });
    }

    const formats = generateAllFormats({ title, authors, year: year || "", source, type: type || "article", doi, url });
    
    const citation = await prisma.citation.create({
      data: {
        title,
        authors,
        year: year || "",
        source: source || null,
        doi: doi || null,
        url: url || null,
        format: "APA",
        text: formats.apa,
        type: type || "article",
      },
    });
    
    return NextResponse.json(citation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create source citation" }, { status: 500 });
  }
}
