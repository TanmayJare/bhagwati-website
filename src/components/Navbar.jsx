import React,{useState,useEffect} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {Menu,X,ChevronDown,ArrowUpRight} from 'lucide-react';
import {assetUrl} from '../assetUrl';
import {useLanguage} from '../Language';
export default function Navbar(){
 const {lang,setLang,t}=useLanguage();const [open,setOpen]=useState(false);const location=useLocation();
 useEffect(()=>setOpen(false),[location.pathname]);
 return <header className="navbar"><div className="nav-inner"><Link className="brand" to="/" aria-label={t('home')}><img src={assetUrl('/images/bhagavati-logo.svg')} alt="श्री भगवती देवी" width="56" height="56"/><span>श्री भगवती प्रतिष्ठान<small>{lang==='en'?'NALEGHAR · MALGUND · RATNAGIRI':'नळेघर · मालगुंड · रत्नागिरी'}</small></span></Link><button className="language" onClick={()=>setLang(lang==='en'?'mr':'en')} aria-label={lang==='en'?'मराठीमध्ये वाचा':'Read in English'}>{lang==='en'?'मराठी':'English'}</button><button className="mobile-toggle" aria-label={t('menu')} aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav id="main-navigation" className={open?'navigation open':'navigation'} aria-label={t('menu')}>
 <details className="nav-dropdown" key={'story'+location.pathname}><summary>{t('story')}<ChevronDown size={12}/></summary><div><Link to="/heritage">{t('heritage')}</Link><Link to="/about">{t('about')}</Link><Link to="/community">{t('community')}</Link></div></details>
 <details className="nav-dropdown" key={'temple'+location.pathname}><summary>{t('temple')}<ChevronDown size={12}/></summary><div><Link to="/kuldevi">{t('kuldevi')}</Link><Link to="/traditions">{t('traditions')}</Link></div></details>
 <details className="nav-dropdown" key={'archive'+location.pathname}><summary>{t('archive')}<ChevronDown size={12}/></summary><div><Link to="/gallery">{t('gallery')}</Link><Link to="/archive">{t('publications')}</Link></div></details>
 <Link to="/visit">{t('visit')}</Link><Link to="/donate" className="nav-donate">{t('donate')}<ArrowUpRight size={15}/></Link></nav></div></header>;
}
