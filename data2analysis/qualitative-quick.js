/* Data2Analysis — quick qualitative analysis */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .quick-qual{padding-top:0}
    .quick-qual-card{border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.05);padding:22px}
    .quick-qual-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}
    .quick-qual-head h2{margin:4px 0 6px;font-size:25px;letter-spacing:-.035em}
    .quick-qual-head p{margin:0;color:var(--muted);font-size:12px;line-height:1.55;max-width:680px}
    .quick-qual-select{min-width:240px}
    .quick-qual-select label{display:block;font-size:10px;font-weight:850;color:#475569;margin-bottom:6px}
    .quick-qual-select select{width:100%;border:1px solid var(--line-strong);border-radius:10px;background:#fff;padding:10px 11px;color:var(--text)}
    .quick-choice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .quick-choice{display:flex;flex-direction:column;align-items:flex-start;text-align:left;min-height:125px;border:1px solid var(--line);border-radius:14px;background:#f8fafc;padding:15px;cursor:pointer;transition:.18s ease;color:var(--text)}
    .quick-choice:hover{transform:translateY(-2px);border-color:#b9ccec;background:#fff;box-shadow:0 10px 24px rgba(15,23,42,.06)}
    .quick-choice span{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--blue-soft);color:var(--blue);font-size:11px;font-weight:900;margin-bottom:11px}
    .quick-choice strong{font-size:13px;margin-bottom:4px}
    .quick-choice small{color:var(--muted);font-size:10px;line-height:1.45}
    .quick-result{display:none;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}
    .quick-result.open{display:block}
    .quick-result h3{font-size:17px;margin:0 0 12px}
    .quick-note{margin-top:12px;padding:10px 11px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;color:#854d0e;font-size:10px;line-height:1.55}
    .word-list{display:flex;gap:7px;flex-wrap:wrap}
    .word-pill{display:inline-flex;gap:5px;align-items:center;padding:7px 9px;border-radius:999px;background:#f8fafc;border:1px solid var(--line);font-size:10px;color:#475569}
    .word-pill b{color:var(--text)}
    .passage-card{padding:12px 13px;margin:9px 0;border:1px solid var(--line);border-radius:12px;background:#fff}
    .passage-card p{margin:0;color:#475569;font-size:11px;line-height:1.6}
    .passage-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
    .passage-meta span{padding:4px 7px;border-radius:999px;background:#f8fafc;border:1px solid var(--line);font-size:9px;color:#64748b}
    @media(max-width:800px){.quick-qual-head{display:grid}.quick-qual-select{min-width:0}.quick-choice-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const uploadSection = document.querySelector('.upload-panel')?.closest('section');
  if(uploadSection){
    const section = document.createElement('section');
    section.id = 'quickQualSection';
    section.className = 'section quick-qual hidden';
    section.innerHTML = `
      <div class="wrap">
        <div class="quick-qual-card">
          <div class="quick-qual-head">
            <div>
              <span class="step-label">Quick qualitative analysis</span>
              <h2>Choose what you want to see.</h2>
              <p>Select a text column, then run a simple qualitative exploration immediately.</p>
            </div>
            <div class="quick-qual-select">
              <label>Text variable</label>
              <select id="quickTextVariable"></select>
            </div>
          </div>
          <div class="quick-choice-grid">
            <button class="quick-choice" type="button" data-quick="frequency"><span>01</span><strong>Frequency</strong><small>Count repeated responses or values and show their percentages.</small></button>
            <button class="quick-choice" type="button" data-quick="words"><span>02</span><strong>Most Frequent Words</strong><small>Show the most-used meaningful words and how many records contain each word.</small></button>
            <button class="quick-choice" type="button" data-quick="passages"><span>03</span><strong>Meaningful Passages</strong><small>Surface information-rich passages containing distinctive and recurring terms.</small></button>
          </div>
          <div id="quickQualResult" class="quick-result"></div>
        </div>
      </div>`;
    uploadSection.insertAdjacentElement('afterend', section);
  }

  const originalDiagnose = diagnose;
  diagnose = function(){
    originalDiagnose();
    refreshQuickQualitative();
  };

  function quickTextColumns(){
    const text = vars('text');
    const cats = meta.filter(m=>m.type==='categorical' && m.valid && m.unique>2).map(m=>m.name);
    return [...new Set([...text,...cats])];
  }

  function refreshQuickQualitative(){
    const section = document.getElementById('quickQualSection');
    if(!section) return;
    const names = quickTextColumns();
    if(!names.length){
      section.classList.add('hidden');
      return;
    }
    const select = document.getElementById('quickTextVariable');
    select.innerHTML = names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
    section.classList.remove('hidden');
    const result = document.getElementById('quickQualResult');
    result.className='quick-result';
    result.innerHTML='';
  }

  function chosenName(){
    return document.getElementById('quickTextVariable')?.value;
  }

  function docsFor(name){
    return rows.map((r,i)=>({row:i+1,text:clean(r[name])})).filter(d=>d.text);
  }

  function runFrequencyQuick(name){
    const docs=docsFor(name);
    if(!docs.length) throw new Error('No usable values were found.');
    const counts=new Map();
    docs.forEach(d=>counts.set(d.text,(counts.get(d.text)||0)+1));
    const values=[...counts.entries()].sort((a,b)=>b[1]-a[1]);
    const repeated=values.filter(x=>x[1]>1).length;
    const body=values.slice(0,50).map(([value,count])=>`<tr><td>${esc(value.length>220?value.slice(0,217)+'…':value)}</td><td>${count}</td><td>${fmt(count/docs.length*100,1)}%</td></tr>`).join('');
    return `<h3>Frequency — ${esc(name)}</h3><div class="stat-cards"><div class="stat-card"><strong>${docs.length}</strong><span>Valid responses</span></div><div class="stat-card"><strong>${values.length}</strong><span>Unique values</span></div><div class="stat-card"><strong>${repeated}</strong><span>Repeated values</span></div></div><div class="table-wrap"><table><thead><tr><th>Response / value</th><th>N</th><th>%</th></tr></thead><tbody>${body}</tbody></table></div>${values.length===docs.length?'<div class="quick-note">All responses are unique. For open-ended text, “Most Frequent Words” or “Meaningful Passages” will usually be more informative than exact-response frequency.</div>':''}`;
  }

  function runWordsQuick(name){
    const docs=docsFor(name);
    if(!docs.length) throw new Error('No usable text was found.');
    const mentions=new Map(), docFreq=new Map();
    docs.forEach(d=>{
      const words=tokenize(d.text);
      const seen=new Set();
      words.forEach(w=>{
        mentions.set(w,(mentions.get(w)||0)+1);
        if(!seen.has(w)){docFreq.set(w,(docFreq.get(w)||0)+1);seen.add(w)}
      });
    });
    const list=[...mentions.entries()].map(([word,count])=>({word,count,df:docFreq.get(word)||0})).filter(x=>x.df>=Math.min(2,docs.length)).sort((a,b)=>b.count-a.count||b.df-a.df).slice(0,30);
    return `<h3>Most Frequent Words — ${esc(name)}</h3><div class="word-list">${list.map(x=>`<span class="word-pill"><b>${esc(x.word)}</b> ${x.count}× · ${x.df} record${x.df===1?'':'s'}</span>`).join('')}</div><div class="quick-note">Common stop words are removed. Word frequency indicates recurrence, not importance or meaning by itself.</div>`;
  }

  function runPassagesQuick(name){
    const docs=docsFor(name);
    if(docs.length<2) throw new Error('At least two text records are required.');
    const tokenDocs=docs.map(d=>tokenize(d.text));
    const df=new Map();
    tokenDocs.forEach(tokens=>new Set(tokens).forEach(w=>df.set(w,(df.get(w)||0)+1)));
    const N=docs.length;
    const scored=docs.map((d,i)=>{
      const tokens=tokenDocs[i];
      if(!tokens.length) return {...d,score:0,terms:[]};
      const counts=new Map(); tokens.forEach(w=>counts.set(w,(counts.get(w)||0)+1));
      const weighted=[...counts.entries()].map(([w,tf])=>({w,v:tf*(Math.log((N+1)/((df.get(w)||0)+.5))+1)})).sort((a,b)=>b.v-a.v);
      const recurrence=weighted.filter(x=>(df.get(x.w)||0)>=2);
      const useful=recurrence.length?recurrence:weighted;
      const score=useful.slice(0,8).reduce((s,x)=>s+x.v,0)/Math.sqrt(Math.max(tokens.length,1));
      return {...d,score,terms:useful.slice(0,4).map(x=>x.w)};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,10);
    return `<h3>Meaningful Passages — ${esc(name)}</h3>${scored.map((p,i)=>`<div class="passage-card"><p>${esc(p.text.length>650?p.text.slice(0,647)+'…':p.text)}</p><div class="passage-meta"><span>#${i+1}</span><span>Row ${p.row}</span>${p.terms.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div>`).join('')}<div class="quick-note">“Meaningful” here means algorithmically salient: passages are ranked by information-rich and distinctive recurring terms. This is a screening aid, not a substitute for interpretive qualitative reading.</div>`;
  }

  function runQuick(type){
    const name=chosenName();
    if(!name) return;
    const result=document.getElementById('quickQualResult');
    try{
      let html='';
      if(type==='frequency') html=runFrequencyQuick(name);
      if(type==='words') html=runWordsQuick(name);
      if(type==='passages') html=runPassagesQuick(name);
      result.innerHTML=html;
    }catch(e){
      result.innerHTML=`<div class="warning">${esc(e.message||e)}</div>`;
    }
    result.classList.add('open');
  }

  document.querySelectorAll('[data-quick]').forEach(btn=>btn.addEventListener('click',()=>runQuick(btn.dataset.quick)));
})();
