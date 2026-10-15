import React from 'react';
import {ArrowUpRight,Download} from 'lucide-react';
import {assetUrl} from '../assetUrl';
import {useLanguage} from '../Language';
export default function PublicationCard({publication}){const {t,local}=useLanguage();return <article className="publication"><a className="publication-cover" href={assetUrl(publication.pdf)} target="_blank" rel="noreferrer" aria-label={t('read')}><img src={assetUrl(publication.cover)} decoding="async" alt={local(publication.title)} loading="lazy"/></a><div><div className="eyebrow">{t('reportLabel')}</div><h2>{local(publication.title)}</h2><div className="period">{local(publication.period)}</div><p>{local(publication.description)}</p><div className="actions"><a className="button" href={assetUrl(publication.pdf)} target="_blank" rel="noreferrer">{t('read')}<ArrowUpRight size={18}/></a><a className="text-link" href={publication.pdf} download>{t('download')}<Download size={16}/></a></div></div></article>}
