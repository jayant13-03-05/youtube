export const runtime = "nodejs";

import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function extractVideoId(url: string) {
  try {
    // youtu.be link
    if (url.includes("youtu.be")) {
      return url.split("youtu.be/")[1].split("?")[0];
    }

    // youtube.com/watch?v=
    const urlObj = new URL(url);
    return urlObj.searchParams.get("v");
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    console.log("API HIT");

    console.log(
      process.env.GROQ_API_KEY
        ? "KEY FOUND"
        : "KEY MISSING"
    );

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);

    console.log("VIDEO ID:", videoId);

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    let text = "";

    try {
      console.log("FETCHING TRANSCRIPT");

      const transcriptData =
        await YoutubeTranscript.fetchTranscript(
          videoId
        );

      console.log("TRANSCRIPT SUCCESS");

      text = transcriptData
        .map((item: any) => item.text)
        .join(" ");

      if (!text) {
        return NextResponse.json(
          { error: "Transcript empty" },
          { status: 400 }
        );
      }

    } catch (err) {
      console.error("TRANSCRIPT ERROR:", err);

      return NextResponse.json(
        {
          error:
            "Transcript not available for this video",
        },
        { status: 400 }
      );
    }

    console.log("CALLING GROQ");

    const response =
      await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "Summarize this YouTube video in simple Hindi.",
          },
          {
            role: "user",
            content: text.slice(0, 5000),
          },
        ],
      });

    console.log("GROQ SUCCESS");

    return NextResponse.json({
      summary:
        response.choices[0].message.content,
    });

  } catch (error) {
    console.error("MAIN ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}