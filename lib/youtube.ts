import { YoutubeTranscript } from "youtube-transcript";

// 🔹 URL se video ID nikalna
export function getVideoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    const videoId = parsedUrl.searchParams.get("v");
    if (videoId) return videoId;

    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1);
    }

    return null;
  } catch {
    return null;
  }
}

// 🔹 Transcript fetch karna
export async function getTranscript(videoId: string): Promise<string | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    const fullText = transcript.map((item: any) => item.text).join(" ");

    return fullText;
  } catch (error) {
    console.error("Transcript error:", error);
    return null;
  }
}