import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const citations = await prisma.citation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(citations);
  } catch {
    return NextResponse.json({ error: "Failed to fetch citations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, authors, year, source, volume, issue, pages, doi, url, publisher, format, text, type } = body;
    
    if (!title || !authors || !text) {
      return NextResponse.json({ error: "Title, authors, and text are required" }, { status: 400 });
    }

    const citation = await prisma.citation.create({
      data: {
        title,
        authors,
        year: year || "",
        source: source || null,
        volume: volume || null,
        issue: issue || null,
        pages: pages || null,
        doi: doi || null,
        url: url || null,
        publisher: publisher || null,
        format: format || "APA",
        text,
        type: type || "article",
      },
    });
    
    return NextResponse.json(citation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create citation" }, { status: 500 });
  }
}
