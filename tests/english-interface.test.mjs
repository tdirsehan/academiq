import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('English UI markup and Title2DOI messages contain no untranslated Turkish copy',()=>{
 for(const path of ['title2doi/index.html','social-analyzer.html','social-analyzer/index.html']){
  const html=read(path);assert.match(html,/<html lang="en">/);
  const visible=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  assert.doesNotMatch(visible,/[çÇğĞıİöÖşŞüÜ]/,path);
  assert.doesNotMatch(visible,/\b(?:Lutfen|Baslik|Temizle|Kaydet)\b/i,path);
 }
 assert.doesNotMatch(read('title2doi/app.js'),/[çÇğĞıİöÖşŞüÜ]/);
});
test('Social Analyzer demo, summary, table and error states use English while multilingual analysis remains available',async()=>{
 const elements=new Map();
 const element=key=>{if(!elements.has(key))elements.set(key,{value:key==='#sent'?'all':key==='#sort'?'date':'',textContent:'',innerHTML:'',style:{},className:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){}});return elements.get(key);};
 const context=vm.createContext({document:{querySelector:element,querySelectorAll:()=>[]},URL,console});
 const script=read('social-analyzer.html').match(/<script>([\s\S]*?)<\/script>/)[1];
 vm.runInContext(script,context);
 element('#demo').onclick();
 assert.equal(element('#nComments').textContent,'5');
 assert.match(element('#status').textContent,/5 comments analyzed/);
 assert.match(element('#summary').innerHTML,/unique authors were analyzed/);
 assert.match(element('#tbody').innerHTML,/Positive|Negative|Neutral/);
 for(const key of ['#summary','#signals','#tbody','#keywords'])assert.doesNotMatch(element(key).innerHTML,/[çÇğĞıİöÖşŞüÜ]/);
 element('#ytKey').value='';await element('#run').onclick();
 assert.equal(element('#status').textContent,'Enter a YouTube API key.');
 assert.equal(vm.runInContext("classify('güzel ve faydalı')",context),'positive');
 assert.equal(read('social-analyzer.html'),read('social-analyzer/index.html'));
});
