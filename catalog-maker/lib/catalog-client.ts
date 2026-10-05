import type {Product} from './catalog-types';
export const money=(p:Pick<Product,'price'|'currency'>)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:p.currency,maximumFractionDigits:0}).format(p.price);
export function thumb(src:string,width=480){if(src.startsWith('/images/')||src.startsWith('/api/images/'))return src.replace('-detail.webp','-thumb.webp');try{const u=new URL(src);if(u.hostname.endsWith('cdn.shopify.com'))u.searchParams.set('width',String(width));return u.toString();}catch{return src;}}
export async function api(url:string,options?:RequestInit){const r=await fetch(url,options);const data:any=await r.json();if(!r.ok)throw new Error(data.error||'Please try again.');return data;}
export async function mutate(data:unknown){return api('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});}
