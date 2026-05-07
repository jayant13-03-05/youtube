export const runtime = "nodejs";

import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log("API HIT");

    console.log(
      process.env.GROQ_API_KEY ? "KEY FOUND" : "KEY MISSING"
    );

    const { videoId } = await req.json();

    console.log("VIDEO ID:", videoId);

    if (!videoId) {
      return NextResponse.json(
        { error: "No videoId" },
        { status: 400 }
      );
    }

    let text = "";

    try {
      console.log("FETCHING TRANSCRIPT");

      const transcriptData =
        await YoutubeTranscript.fetchTranscript(videoId);

      console.log("TRANSCRIPT SUCCESS");

      text = transcriptData
        .map((item: any) => item.text)
        .join(" ");

    } catch (err) {
      console.error("TRANSCRIPT ERROR:", err);

      return NextResponse.json(
        { error: "Transcript not available" },
        { status: 400 }
      );
    }

    console.log("CALLING GROQ");

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Summarize this video",
        },
        {
          role: "user",
          content: text.slice(0, 3000),
        },
      ],
    });

    console.log("GROQ SUCCESS");

    return NextResponse.json({
      summary: response.choices[0].message.content,
    });

  } catch (error) {
    console.error("MAIN ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}