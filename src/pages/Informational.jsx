import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight,Flower2} from 'lucide-react';
import {content} from '../data/siteContent';
import {assetUrl} from '../assetUrl';
import {useLanguage} from '../Language';
export default function Informational({type}){const {local,t}=useLanguage();const page=content[type];return <div className="container document-page"><div className="page-heading"><span className="eyebrow">{local(page.eyebrow)}</span><h1>{local(page.title)}</h1><p className="lead">{local(page.intro)}</p></div><div className="document-layout"><aside><Flower2 size={48} strokeWidth={1}/><p>{t('source')}</p><a className="text-link" href={assetUrl('/documents/annual-report-2025-26.pdf')} target="_blank" rel="noreferrer">{t('original')}<ArrowUpRight size={16}/></a>{type==='kuldevi'&&<img className="deity-inset" src={assetUrl('/images/deity/bhagavati.png')} loading="lazy" decoding="async" alt="श्री भगवती देवी"/>}</aside><div>{page.sections.map((section,i)=><section className="text-section" key={i}><span className="eyebrow">0{i+1}</span><h2>{local(section.title)}</h2><p>{local(section.text)}</p></section>)}<Link to="/archive" className="button">{t('publications')}<ArrowUpRight size={18}/></Link></div></div></div>}
