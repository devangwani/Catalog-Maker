import {env} from 'cloudflare:workers';
import type {Normalized,Product,Config} from './catalog-types';
export function db(){ if(!env.DB)throw new Error('Catalog storage is unavailable.'); return env.DB; }
export const defaultConfig:Config={name:'The Rug Edit',whatsapp:'',design:'gallery',currency:'INR'};
export function slug(s:string){return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'uncategorized';}
export function unpack(row:any):Product{ return {id:row.id,externalId:row.external_id,source:row.source,name:row.name,sku:row.sku,price:row.price,currency:row.currency,description:row.description,categoryId:row.category_id,categoryName:row.category_name,available:!!row.available,images:JSON.parse(row.images),variants:JSON.parse(row.variants),url:row.url,metadata:JSON.parse(row.metadata),updatedAt:row.updated_at}; }
export async function hash(data:unknown){const a=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(data)));return Array.from(new Uint8Array(a)).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function getConfig(){const r=await db().prepare('SELECT value FROM settings WHERE id=?').bind('catalog').first<any>();return r?JSON.parse(r.value):defaultConfig;}
export function fixtureProducts(source:string):Normalized[]{
 const names=['Contour Indigo','Heritage Garnet','Forma Botanical','Contour Slate','Heritage Saffron','Forma Ochre'];
 const categories=['Abstract','Traditional','Geometric'];
 return Array.from({length:50},(_,i)=>{let k=i%6;let price=3800+(i%10)*550;let n=names[k]+' '+String(Math.floor(i/6)+1).padStart(2,'0');
 return {externalId:String(i+1),source,name:n,sku:(source==='demo-shopify'?'DS':'DW')+'-'+String(i+1).padStart(3,'0'),price,currency:'INR',description:'An original sample rug for exploring the catalog. '+(k%3===0?'Soft wool pile with flowing abstract contours.':k%3===1?'Traditional medallion motifs with a richly textured finish.':'Woven geometric blocks in contrasting natural tones.')+' Available in two sample sizes. Product descriptions, prices and availability are fictional; photographs are AI generated.',categoryName:categories[k%3],categoryId:slug(categories[k%3]),available:i%9!==0,images:['/images/rug-'+(k%3)+'-detail.webp'],variants:[{id:String(i)+'-s',name:'120 × 180 cm',sku:'RUG-'+i+'-S',price,available:i%9!==0},{id:String(i)+'-l',name:'160 × 230 cm',sku:'RUG-'+i+'-L',price:price+2200,available:i%9!==0}],url:'',metadata:{material:'Wool blend (sample)',dimensions:'120 × 180 cm',sample:true,imageOrigin:'AI-generated sample photography'}};
 });
}
export async function upsertStatements(items:Normalized[]){const now=new Date().toISOString();const statements=[];const categoryIds=new Set<string>();
 for(const p of items){const fp=await hash(p);const id=p.source+':'+p.externalId;
 if(!categoryIds.has(p.categoryId)){statements.push(db().prepare('INSERT INTO categories(id,name,visible,sort_order) VALUES(?,?,1,0) ON CONFLICT(id) DO NOTHING').bind(p.categoryId,p.categoryName));categoryIds.add(p.categoryId);}
 statements.push(db().prepare(`INSERT INTO products(id,external_id,source,name,sku,price,currency,description,category_id,available,images,variants,url,metadata,fingerprint,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(source,external_id) DO UPDATE SET name=excluded.name,sku=excluded.sku,price=excluded.price,currency=excluded.currency,description=excluded.description,category_id=excluded.category_id,available=excluded.available,images=excluded.images,variants=excluded.variants,url=excluded.url,metadata=excluded.metadata,fingerprint=excluded.fingerprint,updated_at=excluded.updated_at WHERE products.fingerprint != excluded.fingerprint`).bind(id,p.externalId,p.source,p.name,p.sku,p.price,p.currency,p.description,p.categoryId,p.available?1:0,JSON.stringify(p.images),JSON.stringify(p.variants),p.url,JSON.stringify(p.metadata),fp,now));
 }return statements;
}
export async function ensureSamples(){const r=await db().prepare('SELECT id FROM settings WHERE id=?').bind('initialized').first();if(r)return;
 const items=[...fixtureProducts('demo-shopify'),...fixtureProducts('demo-woocommerce')];
 // A bounded, idempotent data seed. Schema changes are migration-owned.
 const stmts=await upsertStatements(items);
 for(const p of items)stmts.push(db().prepare('INSERT INTO fixtures(id,source,payload) VALUES(?,?,?) ON CONFLICT(id) DO NOTHING').bind(p.source+':'+p.externalId,p.source,JSON.stringify(p)));
 stmts.push(db().prepare('INSERT INTO settings(id,value) VALUES(?,?) ON CONFLICT(id) DO NOTHING').bind('catalog',JSON.stringify(defaultConfig)));
 stmts.push(db().prepare('INSERT INTO settings(id,value) VALUES(?,?) ON CONFLICT(id) DO NOTHING').bind('initialized','1'));
 await db().batch(stmts);
}
export async function categories(includeHidden=false){const rows=await db().prepare(`SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id=c.id AND p.suppressed=0) AS count FROM categories c ${includeHidden?'':'WHERE c.visible=1'} ORDER BY sort_order,name`).all<any>();return rows.results.map((c:any)=>({id:c.id,name:c.name,parentId:c.parent_id,visible:!!c.visible,sortOrder:c.sort_order,count:c.count}));}
