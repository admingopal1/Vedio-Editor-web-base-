/* Remove background (images): runs a portrait-matting model (MODNet, Apache-2.0) in the browser via Transformers.js.
   Works best on photos of people. The result is a transparent PNG that replaces the selected image clip's media (undo with Ctrl+Z). */
(()=>{
const LIB='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2/+esm',MODEL='Xenova/modnet';
let net;
async function load(cb){
  if(!net){const T=await import(LIB);net={T,model:await T.AutoModel.from_pretrained(MODEL,{progress_callback:cb}),proc:await T.AutoProcessor.from_pretrained(MODEL)}}
  return net}
function applyAlpha(rgba,mask){for(let i=0;i<mask.length;i++)rgba[i*4+3]=mask[i];return rgba} // mask: 1 byte per pixel
async function removeBg(btn){
  const c=sel();
  if(!c)return toast('Select an image clip first','info');
  if(c.type==='video')return toast('Background removal works on image clips for now. For video, use Chroma key.','info');
  if(c.type!=='image')return toast('Select an image clip first','info');
  const m=media(c.mediaId);if(!m||!m.url)return toast('Image not available','err');
  const label=btn.innerHTML;btn.disabled=true;
  try{
    toast('Loading AI model (first time ~25 MB)…','info');
    const {T,model,proc}=await load(p=>{if(p.status==='progress')btn.lastChild.textContent=' Model '+Math.round(p.progress||0)+'%'});
    btn.lastChild.textContent=' Removing…';
    const img=await T.RawImage.fromURL(m.url);
    const {pixel_values}=await proc(img);
    const {output}=await model({input:pixel_values});
    const mask=await T.RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(img.width,img.height);
    const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;
    const cx=cv.getContext('2d');cx.drawImage(m.el,0,0,cv.width,cv.height);
    const d=cx.getImageData(0,0,cv.width,cv.height);applyAlpha(d.data,mask.data);cx.putImageData(d,0,0);
    const blob=await new Promise(r=>cv.toBlob(r,'image/png'));if(!blob)throw new Error('encode failed');
    const url=URL.createObjectURL(blob),el=new Image();el.src=url;await new Promise(r=>{el.onload=r;el.onerror=r});
    push();
    const nm={id:uid(),name:m.name+' (no bg)',type:'image',url,dur:5,w:cv.width,h:cv.height,thumb:url,strip:null,peaks:null,size:blob.size,file:new File([blob],m.name+'-nobg.png',{type:'image/png'}),el};
    S.media.push(nm);c.mediaId=nm.id;renderLib();syncAll();toast('Background removed','ok');
  }catch(e){console.error(e);toast('Background removal failed – check your internet connection','err')}
  finally{btn.disabled=false;btn.innerHTML=label}}
const anchor=document.getElementById('bCutBeat')||document.getElementById('bBeat');
if(anchor&&!document.getElementById('bRmBg')){
  const b=document.createElement('button');b.className=anchor.className;b.id='bRmBg';b.type='button';
  b.setAttribute('data-tip','Remove the background of the selected image (AI, in your browser)');
  b.innerHTML='<svg class="i"><use href="#i-image"/></svg> Remove BG';
  b.onclick=()=>removeBg(b);anchor.parentNode.insertBefore(b,anchor.nextSibling)}
window.__applyAlpha=applyAlpha;
})();
