/* Auto captions (Whisper in-browser) for GOPISUNA VIDEO STUDIO.
   Loaded after the main script, so it can use its globals: S, allClips, media, addSubs, toast. */
(()=>{
const LIB='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2/+esm';
const MODEL='Xenova/whisper-tiny'; // multilingual; use 'Xenova/whisper-base' or '-small' for better accuracy
let asr;
async function loadAsr(cb){
  if(!asr){const {pipeline}=await import(LIB);asr=await pipeline('automatic-speech-recognition',MODEL,{progress_callback:cb})}
  return asr}
async function pcm16k(file){
  const ab=await file.arrayBuffer();
  const buf=await new OfflineAudioContext(1,1,16000).decodeAudioData(ab); // resamples to 16 kHz mono
  return buf.getChannelData(0)}
async function autoCaptions(btn){
  const clips=allClips().filter(c=>(c.type==='video'||c.type==='audio')&&media(c.mediaId)&&media(c.mediaId).file);
  if(!clips.length)return toast('Add a video or audio clip first','info');
  const label=btn.textContent;btn.disabled=true;
  try{
    btn.textContent='Loading model…';toast('Loading speech model (first time ~40 MB)…','info');
    const rec=await loadAsr(p=>{if(p.status==='progress')btn.textContent='Model '+Math.round(p.progress||0)+'%'});
    const cues=[];
    for(let i=0;i<clips.length;i++){
      const c=clips[i],sp=c.speed||1;btn.textContent=`Transcribing ${i+1}/${clips.length}…`;
      const all=await pcm16k(media(c.mediaId).file);
      const seg=all.slice(Math.floor(c.in*16000),Math.floor(c.out*16000));
      if(seg.length<8000)continue;
      const r=await rec(seg,{return_timestamps:true,chunk_length_s:30,stride_length_s:5});
      for(const ch of r.chunks||[]){
        const t=(ch.text||'').trim();if(!t)continue;
        const s0=ch.timestamp[0]||0,e0=ch.timestamp[1]!=null?ch.timestamp[1]:s0+2;
        cues.push({s:c.start+s0/sp,e:c.start+e0/sp,t})}}
    if(!cues.length)return toast('No speech found','info');
    cues.sort((a,b)=>a.s-b.s);addSubs(cues,false);
  }catch(e){console.error(e);toast('Auto captions failed – check internet connection','err')}
  finally{btn.disabled=false;btn.textContent=label}}
// add the button to the Subtitles panel whenever it opens
new MutationObserver(()=>{
  const go=document.getElementById('subGo');
  if(go&&!document.getElementById('aiCap')){
    const b=document.createElement('button');b.id='aiCap';b.className=go.className;b.type='button';
    b.style.marginRight='8px';b.textContent='✨ Auto captions (AI)';b.onclick=()=>autoCaptions(b);
    go.parentNode.insertBefore(b,go)}
}).observe(document.body,{childList:true,subtree:true});
})();
