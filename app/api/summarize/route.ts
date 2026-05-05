import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json({ error: "No videoId" }, { status: 400 });
    }

    // 🔹 Transcript fetch
    let text = "";

    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      text = transcriptData.map((item: any) => item.text).join(" ");
    } catch {
      return NextResponse.json(
        { error: "Transcript not available" },
        { status: 400 }
      );
    }

    // 🔹 Groq AI call
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
           messages: [
        {
          role: "system",
          content: `
Summarize the YouTube video into clear bullet points with explanation.

Rules:
- Use bullet points (start with "- ")
- Each point should explain the concept in 2-3 lines
- Keep language simple and easy to understand
- Do NOT write long paragraphs
- Cover main concepts only
- Maximum 6-8 points
`,
        },
        {
          role: "user",
          content: text.slice(0, 3000),
        },
      ],
    });

    return NextResponse.json({
      summary: response.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}