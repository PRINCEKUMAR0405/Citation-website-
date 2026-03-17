import { NextRequest, NextResponse } from "next/server";

const SUGGESTIONS = [
  "According to recent studies (Author, Year), this phenomenon demonstrates significant implications for the field...",
  "As argued by leading researchers (Smith et al., 2023), the evidence strongly suggests that...",
  "Building on earlier work by foundational scholars (Johnson & Lee, 2022), this analysis reveals...",
  "Consistent with the theoretical framework proposed by (Brown, 2023), the data indicate...",
  "In a landmark study, (Williams et al., 2024) demonstrated the critical importance of...",
  "The empirical evidence gathered by (Chen & Park, 2023) supports the hypothesis that...",
  "Drawing on the comprehensive meta-analysis conducted by (Taylor et al., 2022)...",
  "Recent advancements in the field, as documented by (Garcia, 2024), suggest a paradigm shift in...",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
    let suggestion: string;
    
    if (!text || text.length < 50) {
      suggestion = "Start your academic writing with a strong thesis statement that clearly outlines your argument. For example: 'This paper examines... (Author, Year) demonstrating that...'";
    } else {
      const index = text.length % SUGGESTIONS.length;
      suggestion = SUGGESTIONS[index];
    }
    
    return NextResponse.json({ suggestion, model: "mock-ai" });
  } catch {
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}
