import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Images,ArrowUpRight,ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import {galleryPhotos} from '../data/gallery';
import {selectedHomepagePhotoIds,homepagePhotoConfig as config} from '../data/selectedPhotos';
import {useLanguage} from '../Language';
import GalleryGrid,{ArchiveImage} from './GalleryGrid';
import GalleryLightbox from './GalleryLightbox';
import RotatingCollage from './RotatingCollage';
const photos=[...new Set(selectedHomepagePhotoIds)].map(id=>galleryPhotos.find(p=>p.id===id)).filter(Boolean);
export default function HomepagePhotos(){
 const {t,local}=useLanguage();const [slide,setSlide]=useState(0);const [index,setIndex]=useState(null);const [hover,setHover]=useState(false);const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const move=delta=>setSlide(s=>(s+delta+photos.length)%photos.length);
 const indicatorStart=Math.max(0,Math.min(slide-2,photos.length-5));
 useEffect(()=>{if(config.mode!=='carousel'||!config.autoplay||paused||hover||index!==null||photos.length<2)return;const timer=setInterval(()=>setSlide(s=>(s+1)%photos.length),Math.max(config.interval,1000));return()=>clearInterval(timer)},[paused,hover,index]);
 return <><div className="section-heading"><div><span className="eyebrow">{t('selected')}</span><h2>{t('glimpses')}</h2><p>{t('glimpsesText')}</p></div><Link to="/gallery" className="text-link">{t('viewGallery')}<ArrowUpRight size={18}/></Link></div>
 {!photos.length?<div className="empty-state selected-empty"><Images size={34} strokeWidth={1}/><h3>{t('emptySelected')}</h3><p>{t('emptySelectedText')}</p><Link className="text-link" to="/archive">{t('original')}<ArrowUpRight size={16}/></Link></div>:config.mode==='collage'?<RotatingCollage photos={photos} config={config} onSelect={setIndex} viewerOpen={index!==null}/>:config.mode==='carousel'?<div className={'carousel transition-'+config.transition} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setHover(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setHover(false)}} aria-roledescription="carousel" aria-label={t('glimpses')}><button className="slide" onClick={()=>setIndex(slide)}><ArchiveImage key={photos[slide].id} photo={photos[slide]}/><span>{local(photos[slide].title)} · {photos[slide].year}</span></button><div className="carousel-controls">{config.showArrows&&<><button aria-label={t('previous')} onClick={()=>move(-1)}><ChevronLeft/></button><button aria-label={t('next')} onClick={()=>move(1)}><ChevronRight/></button></>}{config.showIndicators&&<div className="dots">{photos.slice(indicatorStart,indicatorStart+5).map((p,offset)=>{const i=indicatorStart+offset;return <button key={p.id} className={i===slide?'active':''} onClick={()=>setSlide(i)} aria-label={`${i+1}`} aria-pressed={i===slide}/>})}<span className="photo-progress">{slide+1} / {photos.length}</span></div>}{config.autoplay&&<button onClick={()=>setPaused(!paused)} aria-label={paused?t('play'):t('reduced')}>{paused?<Play size={18}/>:<Pause size={18}/>}</button>}</div></div>:<GalleryGrid photos={photos} onSelect={setIndex} mode={config.mode}/>}
 {index!==null&&<GalleryLightbox photos={photos} index={index} setIndex={setIndex} onClose={()=>setIndex(null)}/>}</>
}
