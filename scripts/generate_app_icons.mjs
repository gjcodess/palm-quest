import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'public', 'favicon.png');
const publicDir = path.join(root, 'public');
const iconDir = path.join(root, 'build-resources');
const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');

// 1. Windows ICO
const sizes = [16, 32, 48, 256];
const images = await Promise.all(sizes.map((size) =>
  sharp(source).resize(size, size).png().toBuffer()
));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  directory.writeUInt8(sizes[index] === 256 ? 0 : sizes[index], entry);
  directory.writeUInt8(sizes[index] === 256 ? 0 : sizes[index], entry + 1);
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await mkdir(iconDir, { recursive: true });
await writeFile(path.join(iconDir, 'app.ico'), Buffer.concat([directory, ...images]));

// 2. Android mipmaps
for (const [density, scale] of Object.entries({ mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 })) {
  const outputDir = path.join(resDir, `mipmap-${density}`);
  const launcherSize = Math.round(48 * scale);
  const adaptiveSize = Math.round(108 * scale);
  const artSize = Math.round(72 * scale);
  const inset = Math.round((adaptiveSize - artSize) / 2);
  const launcher = await sharp(source).resize(launcherSize, launcherSize).png().toBuffer();
  const foreground = await sharp({
    create: { width: adaptiveSize, height: adaptiveSize, channels: 4, background: '#00000000' },
  }).composite([{ input: await sharp(source).resize(artSize, artSize).png().toBuffer(), left: inset, top: inset }]).png().toBuffer();
  await writeFile(path.join(outputDir, 'ic_launcher.png'), launcher);
  await writeFile(path.join(outputDir, 'ic_launcher_round.png'), launcher);
  await writeFile(path.join(outputDir, 'ic_launcher_foreground.png'), foreground);
}

await writeFile(
  path.join(resDir, 'values', 'ic_launcher_background.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#006B50</color>\n</resources>\n',
);

// 3. PWA Icons (192, 512, maskable, apple-touch)
await sharp(source).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
await sharp(source).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
await sharp(source).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

const innerArt = await sharp(source).resize(410, 410).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#451a03' },
})
  .composite([{ input: innerArt, left: 51, top: 51 }])
  .png()
  .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));

console.log('Generated Windows, Android, and PWA icons successfully!');
