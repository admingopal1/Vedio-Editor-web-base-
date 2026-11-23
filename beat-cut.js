/* Cut to beats: splits the selected clip at beat markers (every 1st / 2nd / 4th ...), one undo step.
   Run "Beats" on your music first so the markers exist. Uses the editor's globals. */
(()=>{
function cutToBeats(every){
  let c=sel();
  if(!c||(c.type!=='video'&&c.type!=='image'))c=allClips().find(x=>x.type==='video'||x.type==='image');
  if(!c)return toast('Select a video or image clip first','info');
  const m=[...new Set(S.markers.map(x=>+x))].sort((a,b)=>a-b).filter(t=>t>c.start+.15&&t<end(c)-.15);
  if(!m.length)return toast('No beat markers inside this clip. Select your music, press Beats, then try again','info');
  const picks=[];let last=-1;
  m.forEach((t,i)=>{if(i%every===0&&(last<0||t-last>=.2)){picks.push(t);last=t}});
  if(!picks.length)return toast('No usable beats found','info');
  push();
  for(const t of picks.reverse()){
    const tr=trackOf(c),off=t-c.start,d=dur(c);
    if(off<=.05||off>=d-.05)continue;
    const right=JSON.parse(JSON.stringify(c));right.id=uid();right.start=t;
    if(c.type==='video'||c.type==='audio')right.in=c.in+off*c.speed;else right.dur=d-off;
    right.kf=(c.kf||[]).map(k=>({...k,t:k.t-off})).filter(k=>k.t>=0);right.tin={type:'none',dur:.5};
    c.kf=(c.kf||[]).filter(k=>k.t<off);c.tout={type:'none',dur:.5};
    if(c.type==='video'||c.type==='audio')c.out=c.in+off*c.speed;else c.dur=off;
    tr.clips.push(right)}
  prune();calcDur();syncAll();toast('Cut at '+picks.length+' beats','ok')}
const b=document.getElementById('bBeat');
if(b&&!document.getElementById('bCutBeat')){
  const n=document.createElement('button');n.className=b.className;n.id='bCutBeat';n.type='button';
  n.setAttribute('data-tip','Cut the selected clip on the beat markers');
  n.innerHTML='<svg class="i"><use href="#i-cut"/></svg>Cut beats';
  n.onclick=()=>{const v=parseInt(prompt('Cut on every how many beats? (1 = every beat, 2 = every 2nd, 4 = every bar)','2'),10);if(v>0)cutToBeats(Math.min(v,32))};
  b.parentNode.insertBefore(n,b.nextSibling)}
window.__cutToBeats=cutToBeats;
})();
