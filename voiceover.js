/* Voiceover (text-to-speech): generates an English voice with SpeechT5 (MIT licence) in the browser
   via Transformers.js and adds it to the timeline as an audio clip. Hindi needs a different model (not included yet). */
(()=>{
const LIB='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2/+esm',MODEL='Xenova/speecht5_tts',
 SPK='https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';
let tts;
function splitText(s,max=200){ // sentence-aware chunks so long scripts do not overload the model
  const out=[];for(const sent of String(s).replace(/\s+/g,' ').trim().split(/(?<=[.!?])\s+/)){
    let t=sent;while(t.length>max){let k=t.lastIndexOf(',',max);if(k<40)k=t.lastIndexOf(' ',max);if(k<40)k=max;out.push(t.slice(0,k+1).trim());t=t.slice(k+1).trim()}
    if(t)out.push(t)}return out}
function encodeWav(f32,sr){
  const n=f32.length,buf=new ArrayBuffer(44+n*2),v=new DataView(buf),W=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  W(0,'RIFF');v.setUint32(4,36+n*2,true);W(8,'WAVE');W(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);W(36,'data');v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++){const x=Math.max(-1,Math.min(1,f32[i]));v.setInt16(44+i*2,x<0?x*0x8000:x*0x7fff,true)}
  return new Blob([buf],{type:'audio/wav'})}
async function load(cb){if(!tts){const {pipeline}=await import(LIB);tts=await pipeline('text-to-speech',MODEL,{dtype:'fp32',progress_callback:cb})}return tts}
async function generate(text,btn){
  const parts=splitText(text);if(!parts.length)return toast('Type some text first','info');
  const label=btn.textContent;btn.disabled=true;
  try{
    btn.textContent='Loading voice…';toast('Loading voice model (first time ~150 MB)…','info');
    const synth=await load(p=>{if(p.status==='progress')btn.textContent='Model '+Math.round(p.progress||0)+'%'});
    const chunks=[];let sr=16000;
    for(let i=0;i<parts.length;i++){
      btn.textContent=`Speaking ${i+1}/${parts.length}…`;
      const o=await synth(parts[i],{speaker_embeddings:SPK});sr=o.sampling_rate||sr;chunks.push(o.audio,new Float32Array(Math.round(sr*.25)))}
    const all=new Float32Array(chunks.reduce((s,c)=>s+c.length,0));let p=0;for(const c of chunks){all.set(c,p);p+=c.length}
    const file=new File([encodeWav(all,sr)],'voiceover.wav',{type:'audio/wav'});
    await addFiles([file]);const m=S.media.find(x=>x.file===file);
    if(!m)throw new Error('import failed');placeMedia(m.id,null,S.time);toast('Voiceover added to the timeline','ok');
    const pn=document.getElementById('voPanel');if(pn)pn.remove();
  }catch(e){console.error(e);toast('Voiceover failed – check your internet connection','err')}
  finally{btn.disabled=false;btn.textContent=label}}
function openPanel(){
  let p=document.getElementById('voPanel');if(p){p.remove();return}
  p=document.createElement('div');p.id='voPanel';p.style.cssText='position:fixed;inset:0;z-index:9990;background:rgba(0,0,0,.6);display:grid;place-items:center';
  p.innerHTML='<div style="background:var(--bg1,#12141c);color:var(--txt,#e7e9f2);border:1px solid var(--line,#262a3a);border-radius:14px;padding:18px;width:min(520px,92vw)"><h3 style="margin:0 0 4px">Voiceover (text to speech)</h3><p style="margin:0 0 10px;font-size:12px;color:var(--dim,#8b90a3)">English voice, generated in your browser. The audio is added at the playhead. Hindi is not supported yet.</p><textarea id="voTxt" rows="7" placeholder="Type or paste your script here…" style="width:100%;box-sizing:border-box;background:var(--bg2,#0c0e15);color:inherit;border:1px solid var(--line,#262a3a);border-radius:10px;padding:10px;font:inherit"></textarea><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button class="btn" id="voX" type="button" style="width:auto;padding:8px 16px">Close</button><button class="btn" id="voGo" type="button" style="width:auto;padding:8px 16px">🎙️ Generate</button></div></div>';
  document.body.appendChild(p);
  p.onclick=e=>{if(e.target===p||e.target.id==='voX')p.remove()};
  p.querySelector('#voGo').onclick=function(){generate(p.querySelector('#voTxt').value,this)}}
const anchor=document.getElementById('bTpl')||document.getElementById('bRmBg')||document.getElementById('bBeat');
if(anchor&&!document.getElementById('bVo')){
  const b=document.createElement('button');b.className=anchor.className;b.id='bVo';b.type='button';
  b.setAttribute('data-tip','Text to speech voiceover');
  b.innerHTML='<svg class="i"><use href="#i-music"/></svg> Voiceover';b.onclick=openPanel;anchor.parentNode.insertBefore(b,anchor.nextSibling)}
window.__vo={splitText,encodeWav};
})();
