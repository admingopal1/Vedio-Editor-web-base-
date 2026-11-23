/* Tells people when their project may not survive: private/incognito windows, blocked or tiny browser storage.
   Also shows a one-time tip that autosave is per-browser and that Save makes a backup file. */
(()=>{
const WARN='#f59e0b';
function banner(id,html,color){
  if(document.getElementById(id))return;
  const b=document.createElement('div');b.id=id;b.setAttribute('role','status');
  b.style.cssText='position:fixed;left:14px;bottom:14px;z-index:99998;max-width:min(380px,calc(100vw - 28px));background:var(--panel2,#171a26);color:var(--txt,#e7e9f2);border:1px solid '+(color||'var(--acc,#22d3ee)')+';border-radius:12px;padding:10px 12px;font-size:12.5px;line-height:1.45;box-shadow:0 10px 40px rgba(0,0,0,.5);display:flex;gap:10px;align-items:flex-start';
  b.innerHTML='<span style="flex:1">'+html+'</span><button type="button" aria-label="Dismiss" style="background:none;border:0;color:inherit;font-size:16px;cursor:pointer;line-height:1;padding:0 2px">×</button>';
  b.querySelector('button').onclick=()=>b.remove();document.body.appendChild(b)}
async function check(){
  let problem='';
  try{ // can we open the project database at all?
    await new Promise((res,rej)=>{const r=indexedDB.open('cutbox-probe',1);r.onsuccess=()=>{try{r.result.close();indexedDB.deleteDatabase('cutbox-probe')}catch(e){}res()};r.onerror=()=>rej(r.error);r.onblocked=()=>rej(new Error('blocked'))})
  }catch(e){problem='Your browser is blocking storage here (this is common in private windows), so <b>autosave will not work</b>. Press <b>Save</b> to download a backup file before you leave.'}
  if(!problem&&navigator.storage&&navigator.storage.estimate){
    try{const {quota}=await navigator.storage.estimate();
      if(quota&&quota<300*1024*1024)problem='Browser storage is very limited here (private window or low disk space). Large projects may not autosave. Press <b>Save</b> to keep a backup file.'}catch(e){}}
  if(problem)return banner('storageWarn','⚠️ '+problem,WARN);
  let seen=false;try{seen=localStorage.getItem('gvs-save-tip')==='1';localStorage.setItem('gvs-save-tip','1')}catch(e){}
  if(!seen)banner('saveTip','💾 Your project autosaves in <b>this browser only</b> (not in private/incognito windows). Press <b>Save</b> any time to download a backup file.')}
setTimeout(check,2500);
window.__storageCheck=check;
})();
