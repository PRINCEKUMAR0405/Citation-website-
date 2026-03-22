import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Dynamic import for pdf-parse to avoid build issues
async function parsePDF(buffer: Buffer): Promise<{ text: string }> {
  const pdfParse = await import("pdf-parse");
  // pdf-parse exports the function directly, not as default
  const parse = (pdfParse as any).default || pdfParse;
  return await parse(buffer);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const url = formData.get("url") as string | null;
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;

    let content = "";
    let title = "";
    let type = "text";

    // Handle URL
    if (url) {
      try {
        const response = await fetch(url);
        const html = await response.text();

        // Extract title from HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = titleMatch ? titleMatch[1].trim() : url;

        // Simple text extraction (remove HTML tags)
        content = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        type = "url";
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to fetch URL content" },
          { status: 400 }
        );
      }
    }
    // Handle PDF file
    else if (file) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await parsePDF(buffer);
        content = data.text;
        title = file.name.replace(".pdf", "");
        type = "pdf";
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to parse PDF file" },
          { status: 400 }
        );
      }
    }
    // Handle plain text
    else if (text) {
      content = text;
      title = "Text Document";
      type = "text";
    } else {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    // Create document in database
    const document = await prisma.document.create({
      data: {
        title,
        content,
        url: url || undefined,
        type,
        status: "pending",
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
