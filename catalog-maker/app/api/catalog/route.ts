import {db,ensureSamples,categories,getConfig,unpack,hash} from '@/lib/catalog-data';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{await ensureSamples();const u=new URL(request.url);const mode=u.searchParams.get('mode');let result:any;
 if(mode==='config')result=await getConfig();
 else if(mode==='categories')result=await categories();
 else if(mode==='detail'){const row=await db().prepare('SELECT p.*,c.name AS category_name FROM products p JOIN categories c ON c.id=p.category_id WHERE p.id=? AND p.suppressed=0 AND c.visible=1').bind(u.searchParams.get('id')).first<any>();if(!row)return Response.json({error:'Product not found.'},{status:404});const p=unpack(row);const related=await db().prepare('SELECT p.*,c.name AS category_name FROM products p JOIN categories c ON c.id=p.category_id WHERE p.category_id=? AND p.id<>? AND p.suppressed=0 AND c.visible=1 LIMIT 4').bind(p.categoryId,p.id).all();result={product:p,related:related.results.map(unpack)};}
 else {const q=(u.searchParams.get('q')||'').slice(0,100);const cat=u.searchParams.get('category');const ids=(u.searchParams.get('ids')||'').split(',').filter(Boolean).slice(0,100);const stock=u.searchParams.get('stock')==='1';const page=Math.max(1,Math.min(10000,Number(u.searchParams.get('page'))||1));const limit=Math.max(1,Math.min(100,Number(u.searchParams.get('limit'))||24));const conditions=['p.suppressed=0','c.visible=1'];const args:any[]=[];
 if(q){conditions.push('(instr(lower(p.name),lower(?))>0 OR instr(lower(p.sku),lower(?))>0)');args.push(q,q);}
 if(cat){conditions.push('p.category_id=?');args.push(cat);}if(stock)conditions.push('p.available=1');
 if(ids.length){conditions.push('p.id IN ('+ids.map(()=>'?').join(',')+')');args.push(...ids);}
 const where=' WHERE '+conditions.join(' AND ');const sort=u.searchParams.get('sort');const order=sort==='price-low'?'p.price ASC,p.id':sort==='price-high'?'p.price DESC,p.id':'p.name,p.id';
 const count=await db().prepare('SELECT COUNT(*) AS n FROM products p JOIN categories c ON c.id=p.category_id'+where).bind(...args).first<any>();
 const rows=await db().prepare('SELECT p.id,p.external_id,p.source,p.name,p.sku,p.price,p.currency,p.category_id,p.available,p.images,c.name AS category_name FROM products p JOIN categories c ON c.id=p.category_id'+where+' ORDER BY '+order+' LIMIT ? OFFSET ?').bind(...args,limit,(page-1)*limit).all<any>();
 result={products:rows.results.map((r:any)=>({id:r.id,externalId:r.external_id,source:r.source,name:r.name,sku:r.sku,price:r.price,currency:r.currency,categoryId:r.category_id,categoryName:r.category_name,available:!!r.available,images:JSON.parse(r.images).slice(0,1)})),total:count.n,page,limit};}
 const etag='"'+await hash(result)+'"';if(request.headers.get('if-none-match')===etag)return new Response(null,{status:304,headers:{ETag:etag}});
 return Response.json(result,{headers:{'Cache-Control':'public, max-age=0, must-revalidate',ETag:etag}});
 }catch(e){console.error('Catalog load failed',e);return Response.json({error:'The catalog is temporarily unavailable. Please try again.'},{status:503});}}
