import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'public', 'favicon.png');
const iconDir = path.join(root, 'build-resources');
const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');

// ICO accepts PNG image entries. Include small sizes for the taskbar and 256px
// for Explorer so Windows does not have to shrink one large bitmap everywhere.
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

console.log('Generated Windows and Android icons from public/favicon.png');
