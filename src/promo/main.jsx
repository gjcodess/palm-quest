import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fredoka/700.css';
import '@fontsource/quicksand/600.css';
import '@fontsource/quicksand/700.css';
import { FORMATS, THEMES, TEMPLATES } from './templates';
import { renderPromo } from './render';
import { canvasPng, downloadBlob, makeZip } from './export';
import './studio.css';

const DRAFT_KEY = 'palmquest_promo_drafts_v1';
const defaults = () => Object.fromEntries(TEMPLATES.map(t => [t.id,{headline:t.headline,description:t.description,selected:true}]));
function readDrafts() {
  const fallback = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    for (const template of TEMPLATES) {
      const value = saved?.[template.id];
      if (value && typeof value.headline === 'string' && typeof value.description === 'string') {
        fallback[template.id] = { headline:value.headline.slice(0,110),description:value.description.slice(0,220),selected:value.selected !== false };
      }
    }
  } catch { /* New or invalid draft: use the default copy. */ }
  return fallback;
}

function PromoCard({template,index,draft,format,theme,layout,onChange,onReady,onDownload,onError,busy}) {
  const canvasRef=useRef(null), renderId=useRef(0);
  const [ready,setReady]=useState(false), [error,setError]=useState('');
  useEffect(() => {
    const id=++renderId.current;
    setReady(false); setError(''); onReady(template.id,null);
    const buffer=document.createElement('canvas');
    renderPromo(buffer,template,draft,format,theme,layout).then(() => {
      if (renderId.current !== id) return;
      const canvas=canvasRef.current;
      canvas.width=buffer.width; canvas.height=buffer.height;
      canvas.getContext('2d',{alpha:false}).drawImage(buffer,0,0);
      setReady(true); onReady(template.id,canvas);
    }).catch(err => { if (renderId.current === id) {setError(err.message); onError(err.message);} });
    return () => {renderId.current++;};
  },[draft.headline,draft.description,draft.image,draft.image2,format,theme,layout]);

  async function upload(event, field = 'image') {
    const file=event.target.files?.[0];
    event.target.value='';
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) {onError('Choose a PNG, JPEG, or WebP screenshot.'); return;}
    if (file.size > 20*1024*1024) {onError('Choose a screenshot under 20 MB.'); return;}
    const reader=new FileReader();
    reader.onload=() => onChange(template.id,{[field]:reader.result});
    reader.onerror=() => onError('The screenshot could not be read. Please try again.');
    reader.readAsDataURL(file);
  }

  return <article className="promo-card">
    <div className="card-heading"><h2><span>{String(index+1).padStart(2,'0')}</span> {template.name}</h2>
      <label className="pick"><input type="checkbox" aria-label={`Include ${template.name} in set`} checked={draft.selected} onChange={e => onChange(template.id,{selected:e.target.checked})}/><span>Include</span></label>
    </div>
    <div className={`canvas-wrap ${format}`}>
      <canvas ref={canvasRef} role="img" aria-label={`${template.name}: ${draft.headline.replace(/\n/g,' ')}. ${FORMATS[format].width} by ${FORMATS[format].height} preview`}/>
      {!ready && <div className="render-status">{error || 'Preparing your preview…'}</div>}
    </div>
    <div className="card-fields">
      <label htmlFor={`${template.id}-headline`}>Headline <span>{draft.headline.length}/110</span></label>
      <textarea id={`${template.id}-headline`} disabled={busy} rows="2" maxLength="110" value={draft.headline} onChange={e=>onChange(template.id,{headline:e.target.value})}/>
      <label htmlFor={`${template.id}-description`}>Description <span>{draft.description.length}/220</span></label>
      <textarea id={`${template.id}-description`} disabled={busy} rows="3" maxLength="220" value={draft.description} onChange={e=>onChange(template.id,{description:e.target.value})}/>
      <div className="image-actions"><label className="upload-button">{format==='tallPortrait' && layout==='promo'?'Replace screenshot 1':'Replace screenshot'}<input disabled={busy} aria-label={`Replace ${template.name} screenshot`} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e)}/></label>
        {draft.image && <button className="text-button" onClick={()=>onChange(template.id,{image:undefined})}>Use original</button>}
      </div>
      {format==='tallPortrait' && layout==='promo' && <div className="image-actions"><label className="upload-button">Replace screenshot 2<input disabled={busy} aria-label={`Replace ${template.name} second screenshot`} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e,'image2')}/></label>
        {draft.image2 && <button disabled={busy} className="text-button" onClick={()=>onChange(template.id,{image2:undefined})}>Use original second screenshot</button>}
      </div>}
      <button className="download-button" disabled={!ready || busy} onClick={()=>onDownload(template.id)}>↓ Download PNG <span>{FORMATS[format].width} × {FORMATS[format].height}</span></button>
    </div>
  </article>;
}

function Studio() {
  const [drafts,setDrafts]=useState(readDrafts);
  const [format,setFormat]=useState('landscape'), [theme,setTheme]=useState('forest');
  const [layout,setLayout]=useState('promo');
  const [status,setStatus]=useState('Ready to make your first impression.'), [busy,setBusy]=useState(false);
  const [readyCount,setReadyCount]=useState(0), [resetPending,setResetPending]=useState(false);
  const canvases=useRef({});
  const selected=TEMPLATES.filter(t=>drafts[t.id].selected);
  const readySelected=selected.every(t=>canvases.current[t.id]);

  useEffect(() => {
    try {
      const copy=Object.fromEntries(Object.entries(drafts).map(([key,{image,image2,...draft}])=>[key,draft]));
      localStorage.setItem(DRAFT_KEY,JSON.stringify(copy));
    } catch {setStatus('Your browser could not save captions. You can still download your images.');}
  },[drafts]);

  const change=(id,patch)=>setDrafts(prev=>({...prev,[id]:{...prev[id],...patch}}));
  const ready=(id,canvas)=>{canvases.current[id]=canvas; setReadyCount(Object.values(canvases.current).filter(Boolean).length);};
  const fileName=(id)=>`palmquest-${String(TEMPLATES.findIndex(t=>t.id===id)+1).padStart(2,'0')}-${id}-${format==='feature'?'promo':layout}-${FORMATS[format].width}x${FORMATS[format].height}.png`;
  async function download(id) {
    setBusy(true); setStatus('Preparing your full-resolution PNG…');
    try {downloadBlob(await canvasPng(canvases.current[id]),fileName(id)); setStatus('PNG downloaded. Your image is ready for review.');}
    catch(err){setStatus(`Could not export: ${err.message}`);} finally{setBusy(false);}
  }
  async function downloadSet() {
    if (!selected.length || !readySelected) return;
    setBusy(true); setStatus(`Preparing ${selected.length} images…`);
    try {
      const files=[];
      for (const template of selected) files.push({name:fileName(template.id),blob:await canvasPng(canvases.current[template.id])});
      downloadBlob(await makeZip(files),`palmquest-${format}-set.zip`);
      setStatus(`${files.length} full-resolution PNGs downloaded in a ZIP.`);
    } catch(err){setStatus(`Could not export: ${err.message}`);} finally{setBusy(false);}
  }

  return <>
    <header className="studio-header"><a href="../" className="wordmark">PALM<span>QUEST</span><small>CREATIVE STUDIO</small></a><a className="back-link" href="../" target="_blank" rel="noreferrer">Open game ↗</a></header>
    <main>
      <section className="hero"><div><p className="eyebrow">A LITTLE CURIOSITY. A GREAT FIRST IMPRESSION.</p><h1>Bring your laboratory<br/><em>to the store.</em></h1><p className="intro">Create a matching set of Google Play images with PALMQuest’s real screens. Make the words yours, choose a look, and export.</p></div>
        <div className="hero-art"><div className="art-ring"/><img src="../assets/teacher_mia_happy.webp" alt="Teacher Mia, your food science mentor"/><span className="art-label">Made for learning.<br/><strong>Ready to share.</strong></span></div>
      </section>
      <section className="controls" aria-label="Image settings">
        <label className="format-label" htmlFor="format">Export size<select id="format" value={format} disabled={busy} onChange={e=>{canvases.current={};setReadyCount(0);setFormat(e.target.value);}}>{Object.entries(FORMATS).map(([id,f])=><option key={id} value={id}>{f.label} · {f.width} × {f.height}</option>)}</select></label>
        <fieldset className="theme-picker"><legend>Color palette</legend>{Object.entries(THEMES).map(([id,t])=><button key={id} type="button" title={t.label} aria-label={t.label} aria-pressed={theme===id} disabled={busy} className={theme===id?'active':''} style={{'--swatch':t.bg}} onClick={()=>{canvases.current={};setReadyCount(0);setTheme(id);}}><span/>{t.label}</button>)}</fieldset>
        <button className="set-download" disabled={busy || !selected.length || !readySelected || !readyCount} onClick={downloadSet}>{busy?'Preparing…':`↓ Download set (${selected.length})`}</button>
      </section>
      <div className="helper"><p>24-bit PNG · solid background · full-resolution export</p><a href="https://support.google.com/googleplay/android-developer/answer/9866151?hl=en" target="_blank" rel="noreferrer">Google Play asset guidelines ↗</a></div>
      {format==='tallPortrait' && <div className="publishing-note format-note"><strong>1772 × 3840 uses the mobile game layout.</strong><p>PALMQuest runs sideways on phones, so the preview keeps that landscape screen inside this portrait poster. This tall poster exceeds Google Play’s 2:1 screenshot limit; choose 1080 × 1920 for the listing gallery.</p></div>}
      <div className="layout-choice"><label><input type="checkbox" checked={format!=='feature' && layout==='screenshot'} disabled={busy || format==='feature'} onChange={e=>{canvases.current={};setReadyCount(0);setLayout(e.target.checked?'screenshot':'promo');}}/> Screenshot only</label><span>Show the full game screen without captions or artwork. Recommended for tablet listings and gameplay-focused screenshots.</span></div>
      <div className="grid-heading"><div><p className="eyebrow">YOUR STORE STORY</p><h2>Six moments. One learning journey.</h2><p>Captions save in this browser. Replacement images stay in this tab.</p></div><button className="text-button" disabled={busy} onClick={()=>setResetPending(true)}>Reset captions & images</button></div>
      {resetPending && <div className="reset-confirm" role="group" aria-label="Reset confirmation"><p>Restore all six templates? This clears edited captions and replacement images.</p><button onClick={()=>{setDrafts(defaults());setResetPending(false);setStatus('Original captions and screenshots restored.');}}>Restore defaults</button><button onClick={()=>setResetPending(false)}>Keep editing</button></div>}
      <section className="promo-grid" aria-label="Promo image templates">{TEMPLATES.map((template,index)=><PromoCard key={template.id} {...{template,index,format,theme,busy}} layout={format==='feature'?'promo':layout} draft={drafts[template.id]} onChange={change} onReady={ready} onDownload={download} onError={setStatus}/>)}</section>
      <aside className="publishing-note"><strong>Before you upload</strong><p>Use the feature graphic for the store banner and screenshot formats for the screenshot gallery. These default screens were captured from the web build; replace them with APK captures if your device layout differs. Review the text and images before uploading to Play Console.</p></aside>
    </main>
    <footer><span className="wordmark">PALM<span>QUEST</span></span><p>A virtual laboratory for coconut palm cracker processing.</p><span>Created locally. Yours to share.</span></footer>
    <div className="status-bar" role="status" aria-live="polite"><span className={busy?'status-dot busy':'status-dot'}/>{status}</div>
  </>;
}

createRoot(document.getElementById('root')).render(<Studio/>);
