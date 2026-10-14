import fs from 'fs';
import path from 'path';
import https from 'https';

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const modelsDir = path.join(process.cwd(), 'public', 'models');

const files = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
         downloadFile(res.headers.location, dest).then(resolve).catch(reject);
         return;
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

(async () => {
  console.log("Downloading face-api models to /public/models...");
  for (const file of files) {
    const dest = path.join(modelsDir, file);
    if (fs.existsSync(dest)) {
      console.log(`Skipping ${file} - already exists.`);
      continue;
    }
    console.log(`Fetching ${file}...`);
    try {
      await downloadFile(baseUrl + file, dest);
    } catch (e) {
      console.error(`Failed to download ${file}:`, e);
    }
  }
  console.log("Download processes complete.");
})();
