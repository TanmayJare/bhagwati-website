import React, {createContext,useContext,useEffect,useState} from 'react';
import en from './locales/en.json';
import mr from './locales/mr.json';
const LanguageContext=createContext();
export function LanguageProvider({children}){
 const [lang,setLang]=useState(()=>{try{return localStorage.getItem('bhagavati-language')==='mr'?'mr':'en'}catch{return 'en'}});
 useEffect(()=>{document.documentElement.lang=lang;try{localStorage.setItem('bhagavati-language',lang)}catch{}},[lang]);
 const t=key=>(lang==='mr'?mr:en)[key]||key;
 const local=value=>typeof value==='string'?value:value?.[lang]||value?.en||'';
 return <LanguageContext.Provider value={{lang,setLang,t,local}}>{children}</LanguageContext.Provider>;
}
export const useLanguage=()=>useContext(LanguageContext);
