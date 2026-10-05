import {db,hash,upsertStatements} from './catalog-data';
import {readConnection,importShopify,importWoo,SourceError} from './store-connectors';
import type {Normalized} from './catalog-types';
export async function synchronize(source:string){if(!['shopify','woocommerce','demo-shopify','demo-woocommerce'].includes(source))throw new SourceError('Choose a supported product source.');
 const now=Date.now();const lock=await db().prepare('INSERT INTO sync_locks(source,expires_at) VALUES(?,?) ON CONFLICT(source) DO UPDATE SET expires_at=excluded.expires_at WHERE sync_locks.expires_at<?').bind(source,now+30*60*1000,now).run();if(!lock.meta.changes)throw new SourceError('A synchronization for this store is already running.');
 const id=crypto.randomUUID();await db().prepare('INSERT INTO sync_runs(id,source,status,started_at) VALUES(?,?,?,?)').bind(id,source,'running',new Date().toISOString()).run();
 try{let items:Normalized[];
 if(source.startsWith('demo-')){const f=await db().prepare('SELECT payload FROM fixtures WHERE source=?').bind(source).all<any>();items=f.results.map((r:any)=>JSON.parse(r.payload));}
 else {const c=await readConnection(source);if(!c)throw new SourceError('Connect this store before importing products.');items=source==='shopify'?await importShopify(c):await importWoo(c);}
 const seen=new Set();for(const p of items){if(seen.has(p.externalId))throw new SourceError('Duplicate product identifiers were returned. No changes were saved.');seen.add(p.externalId);if(!p.name||!Number.isFinite(p.price)||p.price<0)throw new SourceError('A source product has an invalid name or price. No changes were saved.');}
 const old=await db().prepare('SELECT external_id,fingerprint FROM products WHERE source=?').bind(source).all<any>();const map=new Map(old.results.map((r:any)=>[r.external_id,r.fingerprint]));let added=0,updated=0,unchanged=0;
 for(const p of items){if(!map.has(p.externalId))added++;else if(map.get(p.externalId)!==await hash(p))updated++;else unchanged++;}
 const statements=await upsertStatements(items);
 // Retain removed source records but mark them unavailable. Source failures never execute this batch.
 for(const r of old.results)if(!seen.has(r.external_id))statements.push(db().prepare('UPDATE products SET available=0,updated_at=? WHERE source=? AND external_id=?').bind(new Date().toISOString(),source,r.external_id));
 statements.push(db().prepare('UPDATE sync_runs SET status=?,finished_at=?,added=?,updated=?,unchanged=? WHERE id=?').bind('succeeded',new Date().toISOString(),added,updated,unchanged,id));
 await db().batch(statements);return {id,added,updated,unchanged,total:items.length};
 }catch(e){const msg=e instanceof SourceError?e.message:'Synchronization could not finish. The existing catalog was preserved.';console.error('Synchronization failed',source,e instanceof SourceError?msg:'Internal storage error');await db().prepare('UPDATE sync_runs SET status=?,finished_at=?,error=? WHERE id=?').bind('failed',new Date().toISOString(),msg,id).run();throw new SourceError(msg);
 }finally{await db().prepare('DELETE FROM sync_locks WHERE source=?').bind(source).run();}}
