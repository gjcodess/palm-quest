import { FORMATS, THEMES } from './templates';

const imageCache = new Map();
const loadImage = (src) => {
  if (!imageCache.has(src)) imageCache.set(src, new Promise((resolve,reject) => {
    const img = new Image();
    img.onload = () => { if (src.startsWith('data:')) imageCache.delete(src); resolve(img); };
    img.onerror = () => { imageCache.delete(src); reject(new Error('An image could not load. Restore the screenshot or choose another image.')); };
    img.src = src;
  }));
  return imageCache.get(src);
};

function wrap(ctx, text, width) {
  return text.split('\n').flatMap(paragraph => {
    const lines = []; let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (ctx.measureText(word).width > width) {
        if (line) { lines.push(line); line = ''; }
        let fragment = '';
        for (const char of word) {
          if (ctx.measureText(fragment + char).width > width && fragment) { lines.push(fragment); fragment = ''; }
          fragment += char;
        }
        line = fragment;
      } else if (line && ctx.measureText(line + ' ' + word).width > width) {
        lines.push(line); line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    lines.push(line); return lines;
  });
}

function textBlock(ctx, text, x, y, width, height, size, family, color, weight = 700) {
  let lines;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    lines = wrap(ctx,text,width);
    if (lines.length * size * 1.15 <= height) break;
    size -= 1;
  } while (size > 1);
  ctx.fillStyle = color; ctx.textBaseline = 'top';
  lines.forEach((line,i) => ctx.fillText(line,x,y+i*size*1.15));
  return lines.length * size * 1.15;
}

const contain = (ctx,img,x,y,w,h) => {
  const scale = Math.min(w/img.width,h/img.height);
  ctx.drawImage(img,x+(w-img.width*scale)/2,y+(h-img.height*scale)/2,img.width*scale,img.height*scale);
};

function screenshot(ctx,img,x,y,w,h) {
  // Fit the complete screenshot. Landscape gameplay is never cropped into portrait.
  ctx.save(); ctx.shadowColor='#00000040'; ctx.shadowBlur=35; ctx.shadowOffsetY=18;
  ctx.fillStyle='#fdf9ef'; ctx.beginPath(); ctx.roundRect(x-10,y-10,w+20,h+20,24); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(x,y,w,h,16); ctx.clip();
  ctx.fillStyle='#fdf9ef'; ctx.fillRect(x,y,w,h); contain(ctx,img,x,y,w,h); ctx.restore();
}

export async function renderPromo(canvas, template, draft, format, theme, layout = 'promo') {
  const spec = FORMATS[format], colors = THEMES[theme];
  const root = new URL('../', window.location.href).href;
  const twoScreens = format === 'tallPortrait' && layout === 'promo';
  const featureScreens = format === 'feature' ? await Promise.all([
    loadImage(draft.image || `${root}promo/${template.screenshot}-mobile.jpg`),
    ...['formulation', 'safety', 'sequence', 'review', 'preparation'].map(name => loadImage(`${root}promo/${name}-mobile.jpg`)),
  ]) : null;
  const [screen, art, secondScreen] = await Promise.all([
    loadImage(draft.image || `${root}promo/${template.screenshot}${spec.mobile ? '-mobile' : ''}.jpg`),
    loadImage(`${root}assets/${template.artwork}.webp`),
    twoScreens ? loadImage(draft.image2 || `${root}promo/${template.secondScreenshot}-mobile.jpg`) : Promise.resolve(null),
    document.fonts.load('700 48px Fredoka'), document.fonts.load('600 24px Quicksand'),
  ]);
  canvas.width = spec.width; canvas.height = spec.height;
  const ctx = canvas.getContext('2d', {alpha:false});
  if (featureScreens) {
    const w = 1024, h = 500;
    ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = colors.panel;
    for (let x = 16; x < w; x += 24) for (let y = 16; y < h; y += 24) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save(); ctx.beginPath(); ctx.rect(495, 0, 529, h); ctx.clip();
    ctx.translate(520, -30); ctx.rotate(-17 * Math.PI / 180);
    [...featureScreens, featureScreens[1], featureScreens[2]].forEach((img, i) => {
      const x = (i % 2) * 326, y = Math.floor(i / 2) * 168;
      screenshot(ctx, img, x, y, 298, 134);
    });
    ctx.restore();
    textBlock(ctx, 'PALM', 40, 35, 160, 60, 46, 'Fredoka', colors.ink);
    ctx.font = '700 46px Fredoka';
    textBlock(ctx, 'QUEST', 40 + ctx.measureText('PALM').width, 35, 180, 60, 46, 'Fredoka', colors.accent);
    textBlock(ctx, 'COCONUT PALM • FOOD SCIENCE', 42, 95, 425, 30, 14, 'Quicksand', colors.accent);
    textBlock(ctx, draft.headline, 40, 150, 430, 150, 48, 'Fredoka', colors.ink);
    textBlock(ctx, draft.description, 42, 315, 420, 80, 19, 'Quicksand', colors.muted, 600);
    contain(ctx, art, 40, 416, 52, 60);
    textBlock(ctx, 'PALMQuest Virtual Laboratory', 105, 423, 350, 30, 17, 'Quicksand', colors.ink);
    textBlock(ctx, 'Learn food science through play.', 105, 450, 350, 25, 14, 'Quicksand', colors.muted, 600);
    return canvas;
  }
  const portrait = spec.height > spec.width;
  const w = portrait ? 1080 : 1920;
  const h = spec.height * w / spec.width;
  ctx.scale(spec.width/w,spec.height/h);
  ctx.fillStyle=colors.bg; ctx.fillRect(0,0,w,h);
  if (layout === 'screenshot') {
    contain(ctx,screen,0,0,w,h);
    return canvas;
  }
  // Subtle palm-like arcs and a warm sun make the whole set feel connected.
  ctx.strokeStyle=colors.panel; ctx.lineWidth=2;
  for (let i=0;i<7;i++) { ctx.beginPath(); ctx.arc(w+120,h+130,300+i*100,0,Math.PI*2); ctx.stroke(); }
  ctx.fillStyle=colors.panel; ctx.beginPath(); ctx.arc(w-70,40,portrait?250:220,0,Math.PI*2); ctx.fill();
  const margin=portrait?72:90;
  textBlock(ctx,'PALM',margin,portrait?80:60,200,65,portrait?62:52,'Fredoka',colors.ink);
  ctx.font=`700 ${portrait?62:52}px Fredoka`;
  const palmWidth=ctx.measureText('PALM').width;
  textBlock(ctx,'QUEST',margin+palmWidth,portrait?80:60,230,65,portrait?62:52,'Fredoka',colors.accent);
  const leftWidth=portrait?936:680;
  textBlock(ctx,template.eyebrow,margin,portrait?202:165,leftWidth,55,portrait?25:23,'Quicksand',colors.accent);
  textBlock(ctx,draft.headline,margin,portrait?285:230,leftWidth,portrait?270:300,portrait?99:87,'Fredoka',colors.ink);
  textBlock(ctx,draft.description,margin,portrait?580:540,leftWidth,portrait?145:130,portrait?34:31,'Quicksand',colors.muted,600);
  if (portrait) {
    const tall = format === 'tallPortrait';
    const screenH=Math.min(tall?430:650,936 * screen.height / screen.width);
    screenshot(ctx,screen,72,tall?790:800,936,screenH);
    if (twoScreens) {
      const secondHeight=Math.min(430,936 * secondScreen.height / secondScreen.width);
      screenshot(ctx,secondScreen,72,1260,936,secondHeight);
      contain(ctx,art,390,h-540,300,300);
    } else {
      contain(ctx,art,330,Math.max(h-520,820+screenH),420,300);
    }
    textBlock(ctx,template.tag,72,h-170,936,75,30,'Quicksand',colors.accent);
    textBlock(ctx,'THE COCONUT PALM CRACKERS VIRTUAL LABORATORY',72,h-70,936,45,20,'Quicksand',colors.muted);
  } else {
    const sx=850, sw=980, sh=Math.min(h-300,sw*screen.height/screen.width);
    screenshot(ctx,screen,sx,(h-sh)/2+35,sw,sh);
    contain(ctx,art,margin,h-255,220,180);
    textBlock(ctx,template.tag,margin+245,h-205,430,100,28,'Quicksand',colors.accent);
    textBlock(ctx,'THE COCONUT PALM CRACKERS VIRTUAL LABORATORY',margin,h-55,1650,40,20,'Quicksand',colors.muted);
  }
  return canvas;
}
