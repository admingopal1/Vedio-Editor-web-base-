/* Templates: 8 extra text styles in the Text tab + a Templates button with ready-made multi-clip titles
   (YouTube intro, Reels hook, lower third, end card, breaking news, countdown). Uses the editor's globals. */
(()=>{
const base={size:80,weight:800,font:FONTS[0],color:'#ffffff',bg:'',align:'center',stroke:0,shadow:.4,anim:'pop',ls:0};
const P=(n,t,o={})=>({n,t:{...base,content:n,...t},...o});
// 1) extra styles in the Text tab (TXPRE is the editor's own preset list)
const EXTRA=[
 P('Reels Hook',{content:'WAIT FOR IT…',size:120,weight:900,font:FONTS[2],color:'#ffe600',stroke:10,shadow:0},{y:-26}),
 P('Subscribe',{content:'SUBSCRIBE',size:64,weight:900,bg:'#e11d48',anim:'slide'},{y:30}),
 P('Breaking News',{content:'BREAKING NEWS',size:52,weight:900,bg:'#e11d48',anim:'slide',align:'left'},{x:-22,y:30}),
 P('Chapter Title',{content:'CHAPTER 1',size:96,weight:900,font:FONTS[6],ls:6,anim:'fade'}),
 P('Hashtag',{content:'#YourTag',size:64,weight:800,color:'#22d3ee',stroke:2,shadow:.8,anim:'slide'},{y:30}),
 P('Link in Bio',{content:'LINK IN BIO',size:58,weight:900,color:'#07080d',bg:'#ffe600',anim:'bounce'},{y:32}),
 P('Quote',{content:'“Your quote here”',size:78,weight:400,font:FONTS[1],ls:1,anim:'fade'}),
 P('Part Tag',{content:'PART 1',size:54,weight:800,bg:'rgba(0,0,0,.6)',anim:'fade'},{y:-34})];
if(!TXPRE.some(p=>p.n==='Reels Hook')){TXPRE.push(...EXTRA);try{renderLib()}catch(e){}}
// 2) multi-clip templates: [text, start offset, duration, style, x, y]
const C=(c,s,d,t,x,y)=>({c,s,d,t,x:x||0,y:y||0});
const TEMPLATES=[
 {n:'YouTube Intro',d:'Channel name + subscribe bar',L:[C('YOUR CHANNEL',0,3.2,{size:130,weight:900,font:FONTS[6],shadow:.6},0,-4),C('Subscribe for more',.6,2.6,{size:54,weight:700,bg:'#e11d48',anim:'slide'},0,20)]},
 {n:'Reels Hook',d:'Big hook line + part tag',L:[C('WAIT FOR IT…',0,2.4,{size:120,weight:900,font:FONTS[2],color:'#ffe600',stroke:10,shadow:0},0,-24),C('PART 1',0,3,{size:54,weight:800,bg:'rgba(0,0,0,.6)',anim:'fade'},0,-36)]},
 {n:'Lower Third',d:'Name and role/handle, bottom left',L:[C('Your Name',0,4,{size:56,weight:800,bg:'#7c5cff',anim:'slide',align:'left'},-24,30),C('Your role or @handle',.2,3.8,{size:34,weight:600,bg:'rgba(0,0,0,.6)',anim:'slide',align:'left'},-24,38)]},
 {n:'End Card',d:'Thanks + like/comment/subscribe',L:[C('THANKS FOR WATCHING',0,5,{size:84,weight:900,font:FONTS[6]},0,-8),C('LIKE • COMMENT • SUBSCRIBE',.5,4.5,{size:44,weight:800,bg:'#e11d48',anim:'slide'},0,18)]},
 {n:'Breaking News',d:'Red tag + headline bar',L:[C('BREAKING',0,5,{size:50,weight:900,bg:'#e11d48',anim:'slide',align:'left'},-22,24),C('Your headline goes here',.25,4.75,{size:54,weight:700,bg:'rgba(10,15,40,.85)',anim:'slide',align:'left'},-22,34)]},
 {n:'Countdown 3-2-1',d:'Three one-second numbers',L:[C('3',0,1,{size:260,weight:900,font:FONTS[2],color:'#ffe600',stroke:12,shadow:0,anim:'zoom'}),C('2',1,1,{size:260,weight:900,font:FONTS[2],color:'#22d3ee',stroke:12,shadow:0,anim:'zoom'}),C('1',2,1,{size:260,weight:900,font:FONTS[2],color:'#ff4d6d',stroke:12,shadow:0,anim:'zoom'})]}];
function addTemplate(i){
  const T=TEMPLATES[i];if(!T)return;
  push();const tr=newTrack('visual','Template');S.tracks.unshift(tr);let first=null;
  for(const q of T.L){
    const c=makeText(P(T.n,{...q.t,content:q.c},{x:q.x,y:q.y}),S.time+q.s);
    c.dur=q.d;c.text.content=q.c;if(!first)first=c;tr.clips.push(c)}
  S.sel=first.id;calcDur();syncAll();toast(T.n+' added at the playhead – click a clip to edit its text','ok')}
function openPanel(){
  let p=document.getElementById('tplPanel');if(p){p.remove();return}
  p=document.createElement('div');p.id='tplPanel';p.style.cssText='position:fixed;inset:0;z-index:9990;background:rgba(0,0,0,.6);display:grid;place-items:center';
  p.innerHTML='<div style="background:var(--bg1,#12141c);color:var(--txt,#e7e9f2);border:1px solid var(--line,#262a3a);border-radius:14px;padding:18px;width:min(460px,92vw);max-height:82vh;overflow:auto"><h3 style="margin:0 0 4px">Templates</h3><p style="margin:0 0 12px;font-size:12px;color:var(--dim,#8b90a3)">Adds ready-made animated titles at the playhead. Click a clip afterwards to edit the text.</p>'+
   TEMPLATES.map((t,i)=>'<button class="btn" data-tpl="'+i+'" type="button" style="display:block;width:100%;text-align:left;margin:6px 0;padding:10px 12px"><b>'+t.n+'</b><br><span style="font-size:12px;opacity:.7">'+t.d+'</span></button>').join('')+
   '<div style="text-align:right;margin-top:10px"><button class="btn" id="tplX" type="button" style="width:auto;padding:8px 16px">Close</button></div></div>';
  document.body.appendChild(p);
  p.onclick=e=>{const b=e.target.closest('[data-tpl]');if(b){addTemplate(+b.dataset.tpl);p.remove()}else if(e.target===p||e.target.id==='tplX')p.remove()}}
const anchor=document.getElementById('bRmBg')||document.getElementById('bCutBeat')||document.getElementById('bBeat');
if(anchor&&!document.getElementById('bTpl')){
  const b=document.createElement('button');b.className=anchor.className;b.id='bTpl';b.type='button';
  b.setAttribute('data-tip','Ready-made animated titles and templates');
  b.innerHTML='<svg class="i"><use href="#i-text"/></svg> Templates';b.onclick=openPanel;anchor.parentNode.insertBefore(b,anchor.nextSibling)}
window.__addTemplate=addTemplate;
})();
