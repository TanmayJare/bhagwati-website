import React from 'react';
import {committee} from '../data/committee';
import {assetUrl} from '../assetUrl';
import {useLanguage} from '../Language';
export default function Community(){const {t,local,lang}=useLanguage();return <div className="container document-page"><div className="page-heading"><span className="eyebrow">2026 · {t('members')}</span><h1>{t('communityTitle')}</h1><p className="lead">{t('communityIntro')}</p></div><div className="committee-grid">{committee.map((p,i)=><article className={'person '+(i<3?'office-bearer':'')} key={p.name}><div className="eyebrow">{local(p.role)}</div><h3>{p.name}</h3>{lang==='en'&&<p>{p.englishName}</p>}</article>)}</div><p className="source-note">{t('committeeNote')}</p><a className="text-link" href={assetUrl('/documents/annual-report-2025-26.pdf')+'#page=2'} target="_blank" rel="noreferrer">{t('original')} ↗</a></div>}
