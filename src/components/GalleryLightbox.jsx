import React,{useEffect,useRef,useState} from 'react';
import {X,ChevronLeft,ChevronRight,ZoomIn,ZoomOut} from 'lucide-react';
import {ArchiveImage} from './GalleryGrid';
import {useLanguage} from '../Language';
export default function GalleryLightbox({photos,index,setIndex,onClose}){
 const {t,local}=useLanguage();const dialog=useRef();const startX=useRef(null);const [zoom,setZoom]=useState(false);const closeRef=useRef(onClose);closeRef.current=onClose;
 const move=delta=>{setZoom(false);setIndex(i=>(i+delta+photos.length)%photos.length)};
 useEffect(()=>{const el=dialog.current;const previous=document.activeElement;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';el.showModal();return()=>{el.close();document.body.style.overflow=overflow;previous?.focus()}},[]);
 useEffect(()=>{setZoom(false)},[index]);
 return <dialog ref={dialog} className="lightbox" aria-label={t('gallery')} onCancel={e=>{e.preventDefault();closeRef.current()}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}}}>
 <div className="lightbox-toolbar"><span>{index+1} / {photos.length}</span><div><button onClick={()=>setZoom(!zoom)} aria-label={t('zoom')} aria-pressed={zoom}>{zoom?<ZoomOut/>:<ZoomIn/>}</button><button autoFocus onClick={onClose} aria-label={t('close')}><X/></button></div></div>
 <div className={'lightbox-image '+(zoom?'zoomed':'')} onTouchStart={e=>startX.current=e.touches[0].clientX} onTouchEnd={e=>{if(startX.current===null)return;const delta=e.changedTouches[0].clientX-startX.current;if(Math.abs(delta)>55&&!zoom)move(delta>0?-1:1);startX.current=null}}><ArchiveImage key={photos[index].id} photo={photos[index]} loading="eager" fetchPriority="high"/></div>
 {photos.length>1&&<><button className="lightbox-prev" aria-label={t('previous')} onClick={()=>move(-1)}><ChevronLeft/></button><button className="lightbox-next" aria-label={t('next')} onClick={()=>move(1)}><ChevronRight/></button></>}
 <div className="lightbox-caption" aria-live="polite"><strong>{local(photos[index].title)}</strong><p>{photos[index].year} · {local(photos[index].caption)}</p></div></dialog>
}
