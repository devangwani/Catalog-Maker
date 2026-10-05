import fs from 'node:fs/promises';
const base=process.argv[2];if(!base||!base.startsWith('https://'))throw Error('Pass the verified published catalog origin as the argument.');
const names=['Contour Indigo','Heritage Garnet','Forma Botanical'];const cats=['Abstract','Traditional','Geometric'];
const csv=rows=>rows.map(row=>row.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
const shop=[['Handle','Title','Body (HTML)','Vendor','Product Category','Type','Tags','Published','Option1 Name','Option1 Value','Variant SKU','Variant Grams','Variant Inventory Tracker','Variant Inventory Qty','Variant Inventory Policy','Variant Fulfillment Service','Variant Price','Variant Requires Shipping','Variant Taxable','Image Src','Image Position','Status']];
const woo=[['Type','SKU','Name','Published','Is featured?','Visibility in catalog','Short description','Description','In stock?','Stock','Regular price','Categories','Images']];
for(let i=0;i<50;i++){const name=names[i%3]+' Store Sample '+String(i+1).padStart(2,'0');const sku='CM-DEMO-'+String(i+1).padStart(3,'0');const price=3800+i*50;const image=base+'/images/rug-'+(i%3)+'-detail.webp';const desc='Fictional demonstration product for Catalog Maker integration testing. AI-generated sample photograph. Do not use as a real listing.';
 shop.push(['cm-demo-'+(i+1),name,desc,'Catalog Maker','',cats[i%3],'catalog-maker-demo','TRUE','Title','Default Title',sku,0,'shopify',i%9?20:0,'deny','manual',price,'TRUE','TRUE',image,1,'active']);
 woo.push(['simple',sku,name,1,0,'visible',desc,desc,i%9?1:0,i%9?20:0,price,cats[i%3],image]);}
await fs.mkdir('public/demo-products',{recursive:true});await fs.writeFile('public/demo-products/shopify-50-products.csv',csv(shop));await fs.writeFile('public/demo-products/woocommerce-50-products.csv',csv(woo));console.log('Created two 50-product import files.');
