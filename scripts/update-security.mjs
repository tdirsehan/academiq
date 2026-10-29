import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const hash=bytes=>'sha384-'+createHash('sha384').update(bytes).digest('base64');
function htmlFiles(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.name.startsWith('.')?[]:entry.isDirectory()?htmlFiles(resolve(directory,entry.name)):entry.name.endsWith('.html')?[resolve(directory,entry.name)]:[]);}
for(const file of htmlFiles(root)){
  let html=readFileSync(file,'utf8');
  html=html.replace(/\s*<meta (?:http-equiv="Content-Security-Policy"|name="referrer")[^>]*>/gi,'');
  const scriptHashes=[];
  html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(full,attributes,body)=>{
    const src=attributes.match(/\bsrc="([^"]+)"/i)?.[1];
    if(src){if(/^https?:/i.test(src))throw new Error('External runtime script in '+file);const integrity=hash(readFileSync(resolve(dirname(file),src)));scriptHashes.push(integrity);attributes=attributes.replace(/\s+(?:integrity|crossorigin)="[^"]*"/gi,'');return `<script${attributes} integrity="${integrity}">${body}</script>`;}
    scriptHashes.push(hash(Buffer.from(body)));return full;
  });
  html=html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/gi,full=>{const href=full.match(/\bhref="([^"]+)"/i)?.[1];if(!href||/^https?:/i.test(href))throw new Error('Unexpected stylesheet');return full.replace(/\s+integrity="[^"]*"/i,'').replace(/>$/,` integrity="${hash(readFileSync(resolve(dirname(file),href)))}">`);});
  const isHome=file===resolve(root,'index.html'),social=file.endsWith('social-analyzer.html')||file.endsWith('social-analyzer/index.html');
  const csp=["default-src 'none'",'script-src '+(scriptHashes.length?scriptHashes.map(h=>`'${h}'`).join(' '):"'none'"),"script-src-attr 'none'","style-src 'self' 'unsafe-inline'","img-src 'self' data:","font-src 'none'",social?'connect-src https://www.googleapis.com https://api.apify.com':"connect-src 'none'","object-src 'none'","base-uri 'none'","form-action 'none'",isHome?'frame-src '+[...html.matchAll(/data-demo-url="([^"]+)"/g)].map(m=>m[1]).join(' '):"frame-src 'none'",file.includes('/data2analysis/')?"worker-src 'self'":"worker-src 'none'","manifest-src 'none'"].join('; ');
  html=html.replace(/(<meta charset="[^"]+">)/i,`$1\n<meta http-equiv="Content-Security-Policy" content="${csp}">\n<meta name="referrer" content="no-referrer">`);
  if(/\son[a-z]+="/i.test(html))throw new Error('Inline event handler remains in '+file);
  writeFileSync(file,html);
}
console.log('Updated CSP and resource integrity for all HTML pages.');
