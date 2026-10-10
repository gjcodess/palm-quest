// PNG exports use RGB color type 2 (24-bit, no alpha), as required for Play assets.
export const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const bytes = new Uint8Array(data.length + 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, data.length);
  bytes.set(new TextEncoder().encode(type), 4);
  bytes.set(data, 8);
  view.setUint32(bytes.length - 4, crc32(bytes.subarray(4, bytes.length - 4)));
  return bytes;
};

export const encodeRgbPng = async (rgba, width, height) => {
  const rows = new Uint8Array(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) {
    let dest = y * (width * 3 + 1) + 1; // Filter byte stays 0.
    for (let x = 0; x < width; x++) {
      const source = (y * width + x) * 4;
      rows[dest++] = rgba[source];
      rows[dest++] = rgba[source + 1];
      rows[dest++] = rgba[source + 2];
    }
  }
  const compressed = new Uint8Array(await new Response(new Blob([rows]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header[8] = 8;
  header[9] = 2;
  return new Blob([new Uint8Array([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', compressed), chunk('IEND', new Uint8Array())], { type: 'image/png' });
};

export const canvasPng = (canvas) => encodeRgbPng(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data, canvas.width, canvas.height);

// Store-only ZIP keeps downloads dependency-free and works without a server.
export const makeZip = async (files) => {
  const parts = [], directory = [];
  let offset = 0, directorySize = 0;
  for (const file of files) {
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const name = new TextEncoder().encode(file.name);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0,0x04034b50,true); lv.setUint16(4,20,true);
    lv.setUint16(12,33,true); lv.setUint32(14,crc,true);
    lv.setUint32(18,data.length,true); lv.setUint32(22,data.length,true);
    lv.setUint16(26,name.length,true); local.set(name,30);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0,0x02014b50,true); cv.setUint16(4,20,true); cv.setUint16(6,20,true);
    cv.setUint16(14,33,true); cv.setUint32(16,crc,true);
    cv.setUint32(20,data.length,true); cv.setUint32(24,data.length,true);
    cv.setUint16(28,name.length,true); cv.setUint32(42,offset,true); central.set(name,46);
    parts.push(local,data); directory.push(central);
    offset += local.length + data.length; directorySize += central.length;
  }
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0,0x06054b50,true); ev.setUint16(8,files.length,true); ev.setUint16(10,files.length,true);
  ev.setUint32(12,directorySize,true); ev.setUint32(16,offset,true);
  return new Blob([...parts,...directory,end],{type:'application/zip'});
};

export const downloadBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};
