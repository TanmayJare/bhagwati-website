import React,{useEffect} from 'react';
import {Routes,Route,Link,useLocation} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Informational from './pages/Informational';
import Archive from './pages/Archive';
import Community from './pages/Community';
import Donate from './pages/Donate';
import Gallery from './pages/Gallery';
import {useLanguage} from './Language';
export default function App(){const {t,lang}=useLanguage();const location=useLocation();useEffect(()=>{window.scrollTo(0,0);const key=location.pathname.split('/')[1];document.title=(key?t(key)+' | ':'')+(lang==='mr'?'श्री भगवती प्रतिष्ठान':'Shri Bhagavati Pratishthan');document.querySelector('main')?.focus({preventScroll:true})},[location.pathname,lang]);return <><a className="skip-link" href="#main">{t('skip')}</a><Navbar/><main id="main" tabIndex={-1}><Routes><Route path="/" element={<Home/>}/>{['heritage','kuldevi','about','traditions','visit'].map(type=><Route key={type} path={'/'+type} element={<Informational type={type}/>}/>)}<Route path="/archive" element={<Archive/>}/><Route path="/community" element={<Community/>}/><Route path="/donate" element={<Donate/>}/><Route path="/gallery" element={<Gallery/>}/><Route path="/gallery/:year" element={<Gallery key={location.pathname}/>}/><Route path="*" element={<div className="container document-page"><h1>{t('notFound')}</h1><Link className="button" to="/">{t('backHome')}</Link></div>}/></Routes></main><Footer/></>}
