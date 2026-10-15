import React,{useEffect,useRef,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {useLanguage} from '../Language';
import {ArchiveImage} from './GalleryGrid';
import {displayPhotoUrl} from '../assetUrl';

export default function RotatingCollage({photos,config,onSelect,viewerOpen}){
 const {t,local}=useLanguage();
 const [batch,setBatch]=useState(0);
 const [incoming,setIncoming]=useState(null);
 const [fading,setFading]=useState(false);
 const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const root=useRef();
 const [inView,setInView]=useState(false);
 const [visible,setVisible]=useState(()=>!document.hidden);
 const count=Math.min(6,photos.length);
 const batches=Math.ceil(photos.length/count);
 const duration=config.fadeDuration||1200;
 const indices=group=>Array.from({length:count},(_,slot)=>(group*count+slot)%photos.length);

 useEffect(()=>{
  const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:0.1});
  observer.observe(root.current);
  const changed=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',changed);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',changed)};
 },[]);

 useEffect(()=>{
  if(!config.autoplay||paused||viewerOpen||!inView||!visible||batches<2||incoming!==null)return;
  let cancelled=false;
  const timer=setTimeout(async()=>{
   const next=(batch+1)%batches;
   // Decode ahead so the next layer fades in with complete photographs.
   await Promise.all(indices(next).map(i=>new Promise(resolve=>{
    const image=new Image();image.src=displayPhotoUrl(photos[i]);
    image.decode().catch(()=>{}).then(resolve);
   })));
   if(!cancelled)setIncoming(next);
  },Math.max(5000,config.interval||7000));
  return()=>{cancelled=true;clearTimeout(timer)};
 },[batch,incoming,paused,viewerOpen,batches,inView,visible]);

 useEffect(()=>{
  if(incoming===null)return;
  let secondFrame;
  const frame=requestAnimationFrame(()=>{secondFrame=requestAnimationFrame(()=>setFading(true))});
  const timer=setTimeout(()=>{setBatch(incoming);setIncoming(null);setFading(false)},duration+250);
  return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(secondFrame);clearTimeout(timer)};
 },[incoming,duration]);

 function layer(group,entering=false){return <div className={`memory-collage-grid ${entering?'incoming':'current'} ${fading?'is-fading':''}`} aria-hidden={entering||undefined} inert={entering||undefined}>
  {indices(group).map((photoIndex,slot)=>{const photo=photos[photoIndex];return <button className={`memory-tile tile-${slot+1}`} key={slot} onClick={()=>onSelect(photoIndex)} aria-label={`${local(photo.title)} · ${photo.year}`}>
   <ArchiveImage photo={photo} thumbnail/><span className="memory-caption"><span>{photo.year}</span><strong>{local(photo.caption)||local(photo.title)}</strong></span>
  </button>})}
 </div>}
 return <div ref={root} className="memory-collage" style={{'--collage-fade':duration+'ms'}} aria-label={t('glimpses')}>
  <div className={`memory-collage-stage tiles-${count}`}>
   {layer(batch)}{incoming!==null&&layer(incoming,true)}
  </div>
  {config.autoplay&&batches>1&&<button className="collage-pause" onClick={()=>setPaused(!paused)} aria-label={paused?t('play'):t('reduced')}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>}
 </div>;
}
