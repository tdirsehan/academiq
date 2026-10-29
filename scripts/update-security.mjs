import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const hash=bytes=>'sha384-'+createHash('sha384').update(bytes).digest('base64');
const version=bytes=>createHash('sha384').update(bytes).digest('hex').slice(0,16);
const limitsPath=resolve(root,'data2analysis/import-limits.js'),workerPath=resolve(root,'data2analysis/import-worker.js'),appPath=resolve(root,'data2analysis/app.js');
let worker=readFileSync(workerPath,'utf8').replace(/import-limits\.js(?:\?v=[a-f0-9]+)?/g,'import-limits.js?v='+version(readFileSync(limitsPath)));
writeFileSync(workerPath,worker);
writeFileSync(appPath,readFileSync(appPath,'utf8').replace(/import-worker\.js(?:\?v=[a-f0-9]+)?/g,'import-worker.js?v='+version(Buffer.from(worker))));
function htmlFiles(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.name.startsWith('.')?[]:entry.isDirectory()?htmlFiles(resolve(directory,entry.name)):entry.name.endsWith('.html')?[resolve(directory,entry.name)]:[]);}
for(const file of htmlFiles(root)){
  let html=readFileSync(file,'utf8');
  html=html.replace(/\s*<meta (?:http-equiv="Content-Security-Policy"|name="referrer")[^>]*>/gi,'');
  const scriptHashes=[];
  html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(full,attributes,body)=>{
    const src=attributes.match(/\bsrc="([^"]+)"/i)?.[1];
    if(src){const asset=src.split('?')[0];if(/^https?:/i.test(src))throw new Error('External runtime script in '+file);const bytes=readFileSync(resolve(dirname(file),asset)),integrity=hash(bytes);scriptHashes.push(integrity);attributes=attributes.replace(/\s+(?:integrity|crossorigin)="[^"]*"/gi,'').replace(/\bsrc="[^"]+"/i,'src="'+asset+'?v='+version(bytes)+'"');return `<script${attributes} integrity="${integrity}">${body}</script>`;}
    scriptHashes.push(hash(Buffer.from(body)));return full;
  });
  html=html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/gi,full=>{const href=full.match(/\bhref="([^"]+)"/i)?.[1],asset=href?.split('?')[0];if(!asset||/^https?:/i.test(asset))throw new Error('Unexpected stylesheet');const bytes=readFileSync(resolve(dirname(file),asset));return full.replace(/\bhref="[^"]+"/i,'href="'+asset+'?v='+version(bytes)+'"').replace(/\s+integrity="[^"]*"/i,'').replace(/>$/,` integrity="${hash(bytes)}">`);});
  const isHome=file===resolve(root,'index.html'),social=file.endsWith('social-analyzer.html')||file.endsWith('social-analyzer/index.html');
  const csp=["default-src 'none'",'script-src '+(scriptHashes.length?scriptHashes.map(h=>`'${h}'`).join(' '):"'none'"),"script-src-attr 'none'","style-src 'self' 'unsafe-inline'","img-src 'self' data:","font-src 'none'",social?'connect-src https://www.googleapis.com https://api.apify.com':"connect-src 'none'","object-src 'none'","base-uri 'none'","form-action 'none'",isHome?'frame-src '+[...html.matchAll(/data-demo-url="([^"]+)"/g)].map(m=>m[1]).join(' '):"frame-src 'none'",file.includes('/data2analysis/')?"worker-src 'self'":"worker-src 'none'","manifest-src 'none'"].join('; ');
  html=html.replace(/(<meta charset="[^"]+">)/i,`$1\n<meta http-equiv="Content-Security-Policy" content="${csp}">\n<meta name="referrer" content="no-referrer">`);
  if(/\son[a-z]+="/i.test(html))throw new Error('Inline event handler remains in '+file);
  writeFileSync(file,html);
}
console.log('Updated CSP and resource integrity for all HTML pages.');
