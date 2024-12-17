import { create } from 'youtube-dl-exec';
import path from 'path';
// Specify paths


const binaryPath = "/Users/chini/code/webDev/Backend/MusicDownloader/my_env/bin/yt-dlp";
const ffmpegPath = "/opt/homebrew/bin/ffmpeg";
const downloadFolder = "/Users/chini/Downloads/songs";

// Ensure the download folder exists
import fs from 'fs';
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder, { recursive: true });
}


// Create yt-dlp instance
const youtubedl = create(binaryPath);
// Output template for MP3
const outputTemplate = path.join(downloadFolder, '%(title)s_%(id)s.%(ext)s');

// Options for downloading and converting to MP3
const options = {
  dumpSingleJson: true,
  extractAudio: true,          // Extract audio from the video
  audioFormat: 'aac',          // Convert to MP3
  audioQuality: 0,             // Best audio quality
  ffmpegLocation: ffmpegPath,  // Specify ffmpeg binary location
  output: outputTemplate,      // Output file template
  verbose: true,                // Enable verbose logging
};

// // Test download
youtubedl('ytsearch:Hips dont lie', options)
  .then(output => {
    console.log('Download and conversion successful:', output);
  })
  .catch(err => {
    console.error('Error:', err);
  });
