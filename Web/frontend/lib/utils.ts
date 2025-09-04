export function getYouTubeVideoId(url: string): string {
  let videoId = "";
  try {
    if (url.includes("youtu.be/")) {
      videoId = new URL(url).pathname.substring(1);
    } else if (url.includes("youtubetrimmer.com")) {
      const parsedUrl = new URL(url);
      videoId = parsedUrl.searchParams.get("v") || "";
    } else if (url.includes("youtube.com/watch")) {
      const parsedUrl = new URL(url);
      videoId = parsedUrl.searchParams.get("v") || "";
    }
  } catch (error) {
    console.error("Error parsing video URL:", error);
    return "";
  }
  return videoId.split("?")[0].split("&")[0];
}
