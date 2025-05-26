const express = require("express");
const ytdlp = require("yt-dlp-exec");
const fs = require("fs");

const app = express();
// এখানে fixed port এর পরিবর্তে environment variable থেকে Port নিবে
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

app.post("/download", async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).send("No URL provided");

  const tempFile = `temp_${Date.now()}.mp4`;

  try {
    await ytdlp(videoUrl, {
      output: tempFile,
      format: "bestvideo+bestaudio/best",
      mergeOutputFormat: "mp4"
      // ⚠️ ffmpegLocation লাগবে না, কারণ Docker এর ভেতর ffmpeg থাকবেই
    });

    res.download(tempFile, (err) => {
      if (err) {
        console.error("Download error:", err);
      }

      fs.unlink(tempFile, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Download failed");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
