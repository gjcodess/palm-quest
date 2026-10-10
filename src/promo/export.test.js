import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { crc32, encodeRgbPng } from './export.js';

test('PNG export decodes as 24-bit RGB with exact dimensions and pixel values', async () => {
  const rgba=new Uint8Array([255,0,0,255, 0,255,0,255, 0,0,255,255, 17,34,51,255]);
  const blob=await encodeRgbPng(rgba,2,2);
  const bytes=Buffer.from(await blob.arrayBuffer());
  const metadata=await sharp(bytes).metadata();
  assert.equal(metadata.width,2);
  assert.equal(metadata.height,2);
  assert.equal(metadata.channels,3);
  assert.equal(metadata.hasAlpha,false);
  const pixels=await sharp(bytes).raw().toBuffer();
  assert.deepEqual([...pixels],[255,0,0,0,255,0,0,0,255,17,34,51]);
});

test('export checksums match the standard CRC-32 test vector', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')),0xcbf43926);
});
