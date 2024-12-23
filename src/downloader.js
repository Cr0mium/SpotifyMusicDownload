import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Paths
const binaryPath = "/Users/chini/code/webDev/Backend/MusicDownloader/my_env/bin/yt-dlp";
const ffmpegPath = "/opt/homebrew/bin/ffmpeg";
const downloadFolder = "/Users/chini/Downloads/songs";

// Ensure the download folder exists
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder, { recursive: true });
}

// Exportable function to download audio
export async function downloadSong(songName) {
  return new Promise((resolve, reject) => {
    const outputTemplate = path.join(downloadFolder, `${songName.name}.%(ext)s`);
    const searchQuery = `ytsearch:${songName.name} ${songName.artist} official audio`;
    const minDuration = Math.max(0, songName.duration - 5); // Prevent negative durations
    const maxDuration = songName.duration + 5;

    // yt-dlp arguments
    const args = [
      searchQuery,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '--ffmpeg-location', ffmpegPath,
      '--output', outputTemplate,
      // '--embed-thumbnail',
      '--match-filter', `duration <= ${maxDuration} & duration >= ${minDuration}`,
      '--verbose'
    ];

    console.log('Executing yt-dlp with arguments:', args);

    // Spawn yt-dlp process
    const ytProcess = spawn(binaryPath, args);

    // Capture standard output and error
    ytProcess.stdout.on('data', (data) => {
      console.log(`yt-dlp stdout: ${data}`);
    });

    ytProcess.stderr.on('data', (data) => {
      console.error(`yt-dlp stderr: ${data}`);
    });

    // Handle process completion
    ytProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Downloaded: ${songName.name}`);
        resolve(`Downloaded: ${songName.name}`);
      } else {
        const errorMessage = `yt-dlp process exited with code ${code}`;
        console.error(errorMessage);
        reject(new Error(errorMessage));
      }
    });

    // Handle process errors
    ytProcess.on('error', (err) => {
      console.error('yt-dlp failed to start:', err);
      reject(err);
    });
  });
}
