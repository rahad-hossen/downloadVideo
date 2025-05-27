const express = require("express");
const ytdlp = require("yt-dlp-exec");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

app.get("/check", (req, res) => {
  exec("yt-dlp --version && ffmpeg -version", (error, stdout, stderr) => {
    if (error) return res.status(500).send(`Error: ${error.message}`);
    if (stderr) return res.status(500).send(`Stderr: ${stderr}`);
    res.send(`Installed Versions:\n${stdout}`);
  });
});

app.post("/download", async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).send("No URL provided");

  const tempFile = `/tmp/temp_${Date.now()}.mp4`;

  try {
    await ytdlp(videoUrl, {
      output: tempFile,
      format: "bestvideo+bestaudio/best",
      mergeOutputFormat: "mp4",
      cookies: 'cookies.txt'
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
    console.error("Download failed:", err);
    res.status(500).send("Download failed: " + err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
