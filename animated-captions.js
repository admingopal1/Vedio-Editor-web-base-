/* Animated captions: re-cuts subtitles into short 1-3 word pops with a bold style (Reels/Shorts look).
   Uses the editor's own globals: S, FONTS, makeText, push, calcDur, syncAll, toast. */
(()=>{
const STYLES={
 'Bold Pop':   {size:96,weight:900,color:['#ffffff'],bg:'',stroke:10,shadow:.5,ls:0,upper:false,words:2},
 'Yellow Impact':{size:104,weight:900,color:['#ffe600'],bg:'',stroke:10,shadow:0,ls:2,upper:true,words:2,font:6},
 'Karaoke Mix':{size:96,weight:900,color:['#ffffff','#ffe600','#22d3ee','#7cff6b'],bg:'',stroke:10,shadow:.4,ls:0,upper:true,words:2},
 'Neon Glow':  {size:88,weight:800,color:['#22d3ee'],bg:'',stroke:2,shadow:1,ls:4,upper:true,words:3},
 'Boxed':      {size:80,weight:800,color:['#ffffff'],bg:'#7c5cff',stroke:0,shadow:.2,ls:0,upper:false,words:3}};
function animate(name){
  const st=STYLES[name]||STYLES['Bold Pop'];
  const tracks=S.tracks.filter(t=>t.name==='Subs');
  if(!tracks.length||!tracks.some(t=>t.clips.length))return toast('Add subtitles first (Auto captions or import an SRT)','info');
  push();let made=0,ci=0;
  for(const tr of tracks){
    const out=[];
    for(const c of tr.clips.slice().sort((a,b)=>a.start-b.start)){
      const words=String(c.text.content||'').trim().split(/\s+/).filter(Boolean);
      if(!words.length)continue;
      const groups=[];for(let i=0;i<words.length;i+=st.words)groups.push(words.slice(i,i+st.words).join(' '));
      const total=groups.reduce((s,g)=>s+g.length,0)||1;let t=c.start;
      groups.forEach((g,gi)=>{
        const d=gi===groups.length-1?Math.max(.15,c.start+c.dur-t):Math.max(.15,c.dur*g.length/total);
        const pr={n:'Caption',t:{content:'',size:st.size,weight:st.weight,font:FONTS[st.font||0],color:'#fff',bg:st.bg,align:'center',stroke:st.stroke,shadow:st.shadow,anim:'pop',ls:st.ls},y:22};
        const n=makeText(pr,t);n.dur=d;n.text.content=st.upper?g.toUpperCase():g;
        n.text.color=st.color[ci++%st.color.length];out.push(n);t+=d;made++});
    }
    tr.clips=out}
  calcDur();syncAll();toast(made+' animated captions created','ok')}
// add a style picker + button to the Subtitles panel whenever it opens
new MutationObserver(()=>{
  const ref=document.getElementById('subSty');
  if(ref&&!document.getElementById('acRow')){
    const row=document.createElement('div');row.id='acRow';row.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0;font-size:12px;color:var(--dim)';
    row.innerHTML='<span>Animated captions</span><select id="acStyle" style="background:var(--bg2);color:var(--txt);border:1px solid var(--line);border-radius:8px;padding:6px">'+Object.keys(STYLES).map(k=>'<option>'+k+'</option>').join('')+'</select><button class="btn" id="acGo" type="button" style="width:auto;padding:6px 12px">✨ Animate</button>';
    const host=ref.parentNode;host.parentNode.insertBefore(row,host.nextSibling);
    row.querySelector('#acGo').onclick=()=>animate(row.querySelector('#acStyle').value)}
}).observe(document.body,{childList:true,subtree:true});
window.__animateCaptions=animate;
})();
