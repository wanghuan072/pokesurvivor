import { SITE_URL } from "./config.mjs";
const escape = value => String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
const header='<?xml version="1.0" encoding="UTF-8"?>\n';
const open='<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
const close='</urlset>\n';
export function sitemapParts(manifest) {
  const chunks=[];let rows=[],size=Buffer.byteLength(header+open+close);
  for(const entry of manifest.entries.filter(e=>e.indexable)) {
    const frequency=entry.path.startsWith("/legal/")?"yearly":["/updates","/rankings"].includes(entry.path)?"weekly":"monthly";
    const priority=entry.path==="/"?"1.0":entry.path.startsWith("/legal/")?"0.4":entry.path.startsWith("/guides/")?"0.6":"0.8";
    const xml=`  <url><loc>${escape(entry.canonicalUrl)}</loc><lastmod>${escape(entry.lastModified)}</lastmod><changefreq>${frequency}</changefreq><priority>${priority}</priority></url>\n`;
    const bytes=Buffer.byteLength(xml);
    if(bytes+Buffer.byteLength(header+open+close)>50*1024*1024)throw new Error("Single sitemap entry exceeds the protocol size limit");
    if(rows.length===50000 || size+bytes>50*1024*1024){chunks.push(rows);rows=[];size=Buffer.byteLength(header+open+close);}
    rows.push({xml,date:entry.lastModified});size+=bytes;
  }
  if(rows.length || !chunks.length)chunks.push(rows);
  const children=chunks.map((chunk,i)=>({name:`${i}.xml`,xml:header+open+chunk.map(r=>r.xml).join("")+close,lastModified:chunk.reduce((latest,r)=>r.date>latest?r.date:latest,"")}));
  const xml=children.length===1?children[0].xml:header+'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+children.map(c=>`  <sitemap><loc>${SITE_URL}/sitemaps/${c.name}</loc><lastmod>${c.lastModified}</lastmod></sitemap>\n`).join("")+'</sitemapindex>\n';
  return {xml,children:children.length>1?children:[]};
}
