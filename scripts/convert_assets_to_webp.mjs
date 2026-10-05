import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('.');
const assetsDir = path.join(root, 'public', 'assets');
const imagesDir = path.join(root, 'public', 'images');
const stagingDir = path.join(root, 'public', 'assets_webp');
const archiveDir = path.join(root, 'docs', 'archive-raw-assets', 'original_highres');

if (!fs.existsSync(stagingDir)) fs.mkdirSync(stagingDir, { recursive: true });
if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

async function convertImage(srcPath, outName) {
  const isBg = outName.startsWith('bg_') || outName.startsWith('he_lab');
  const maxDim = isBg ? 1920 : 1024;
  const quality = isBg ? 82 : 80;

  const destPath = path.join(stagingDir, outName);
  await sharp(srcPath)
    .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(destPath);
}

async function run() {
  console.log('Starting WebP conversion...');
  const assetFiles = fs.readdirSync(assetsDir).filter(f => /\.(png|jpe?g)$/i.test(f));
  const imageFiles = fs.existsSync(imagesDir) 
    ? fs.readdirSync(imagesDir).filter(f => /\.(png|jpe?g)$/i.test(f))
    : [];

  const processed = new Set();
  let totalOrigBytes = 0;
  let totalNewBytes = 0;

  // Process all files in public/assets
  for (const file of assetFiles) {
    const srcPath = path.join(assetsDir, file);
    totalOrigBytes += fs.statSync(srcPath).size;
    const baseName = path.parse(file).name;
    const webpName = `${baseName}.webp`;

    await convertImage(srcPath, webpName);
    processed.add(file);
    processed.add(`${baseName}.png`);
    processed.add(`${baseName}.jpg`);
  }

  // Process any unique files in public/images
  for (const file of imageFiles) {
    const baseName = path.parse(file).name;
    if (processed.has(file) || processed.has(`${baseName}.png`) || processed.has(`${baseName}.jpg`)) {
      continue;
    }
    const srcPath = path.join(imagesDir, file);
    totalOrigBytes += fs.statSync(srcPath).size;
    const webpName = `${baseName}.webp`;

    await convertImage(srcPath, webpName);
    processed.add(file);
  }

  // Generate ing_all_purpose_flour.webp from ing_bread_flour if missing
  const breadFlourSrc = path.join(assetsDir, 'ing_bread_flour.png');
  if (fs.existsSync(breadFlourSrc) && !fs.existsSync(path.join(stagingDir, 'ing_all_purpose_flour.webp'))) {
    await convertImage(breadFlourSrc, 'ing_all_purpose_flour.webp');
    console.log('Created ing_all_purpose_flour.webp from ing_bread_flour.png');
  }

  // Preserve cursor pngs for standard CSS cursor compatibility
  for (const cur of ['cursor_32.png', 'cursor_hover_32.png']) {
    const p = path.join(assetsDir, cur);
    if (fs.existsSync(p)) {
      fs.copyFileSync(p, path.join(stagingDir, cur));
    }
  }

  const generated = fs.readdirSync(stagingDir);
  for (const f of generated) {
    totalNewBytes += fs.statSync(path.join(stagingDir, f)).size;
  }

  console.log(`Converted ${generated.length} files to WebP.`);
  console.log(`Original total: ${(totalOrigBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized WebP: ${(totalNewBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Size Reduction: ${((1 - totalNewBytes / totalOrigBytes) * 100).toFixed(1)}%`);
}

run().catch(err => {
  console.error('Error during conversion:', err);
  process.exit(1);
});
