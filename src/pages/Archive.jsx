import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {publications} from '../data/publications';
import PublicationCard from '../components/PublicationCard';
import {useLanguage} from '../Language';
export default function Archive(){const {t}=useLanguage();return <div className="container document-page"><div className="page-heading"><span className="eyebrow">{t('record')}</span><h1>{t('publications')}</h1><p className="lead">{t('archiveIntro')}</p></div><div className="publication-list">{publications.map(p=><PublicationCard key={p.id} publication={p}/>)}</div><Link className="text-link" to="/gallery">{t('gallery')}<ArrowUpRight size={18}/></Link></div>}
