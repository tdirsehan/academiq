/* Data2Analysis — computer-assisted thematic analysis add-on */
(() => {
  let lastThematicResult = null;

  const style = document.createElement('style');
  style.textContent = `
    .theme-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:14px}
    .theme-editor{border:1px solid var(--line);border-radius:16px;padding:16px;background:#fff}
    .theme-editor label{display:block;font-size:10px;font-weight:850;color:#475569;margin:0 0 5px}
    .theme-editor input,.theme-editor textarea{width:100%;border:1px solid var(--line-strong);border-radius:10px;padding:9px 10px;color:var(--text);background:#fff;outline:none}
    .theme-editor input:focus,.theme-editor textarea:focus{border-color:#93b4ee;box-shadow:0 0 0 3px rgba(37,99,235,.08)}
    .theme-editor textarea{min-height:74px;resize:vertical}
    .theme-meta{display:flex;gap:8px;flex-wrap:wrap;margin:11px 0}
    .theme-meta span,.code-chip{display:inline-flex;padding:5px 8px;border-radius:999px;background:#f8fafc;border:1px solid var(--line);font-size:9px;font-weight:750;color:#64748b}
    .theme-codes{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 12px}
    .theme-quote{padding:10px 11px;margin-top:8px;border-left:3px solid #bfdbfe;background:#f8fafc;border-radius:0 10px 10px 0;color:#475569;font-size:11px;line-height:1.55}
    .theme-actions{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
    .theme-actions button{border:0;border-radius:10px;background:var(--navy);color:#fff;padding:10px 12px;font-size:10px;font-weight:850;cursor:pointer}
    .theme-actions button.secondary{background:#fff;color:var(--text);border:1px solid var(--line-strong)}
    .methodology-box{margin-top:14px;padding:13px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;color:#854d0e;font-size:11px;line-height:1.55}
    .review-list{margin:8px 0 0;padding-left:18px;color:#475569;font-size:11px;line-height:1.6}
    @media(max-width:800px){.theme-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  methodInfo.thematic = [
    'Computer-assisted thematic analysis',
    'Generate initial codes, cluster them into candidate themes, retrieve supporting passages, and review/edit the resulting thematic structure.'
  ];

  const originalDiagnose = diagnose;
  diagnose = function(){
    originalDiagnose();
    if(vars('text').length){
      const el = $('classificationReason');
      if(el && !/thematic analysis/i.test(el.textContent)) el.textContent += ' Computer-assisted thematic analysis is available for detected text variables.';
    }
  };

  const originalBuildRecommendations = buildRecommendations;
  buildRecommendations = function(){
    originalBuildRecommendations();
    const text = vars('text');
    if(!text.length) return;
    const grid = $('recommendGrid');
    if(grid.querySelector('[data-method="thematic"]')) return;
    const card = document.createElement('article');
    card.className = 'recommend';
    card.innerHTML = `<span class="tag">Qualitative</span><h3>Computer-assisted thematic analysis</h3><p>Generate initial data-driven codes, candidate themes, theme coverage and supporting passages, then edit the theme names and definitions.</p><button data-method="thematic">Use this analysis</button>`;
    grid.appendChild(card);
    card.querySelector('button').addEventListener('click',()=>selectMethod('thematic'));
  };

  const originalSelectMethod = selectMethod;
  selectMethod = function(method){
    if(method !== 'thematic') return originalSelectMethod(method);
    currentMethod = method;
    const text = vars('text');
    $('analysisIntro').textContent = `${methodInfo.thematic[0]}: ${methodInfo.thematic[1]}`;
    $('analysisControls').innerHTML = `
      <div class="method-note">This is a data-driven, computer-assisted first-cycle coding and candidate-theme workflow. The researcher should review, rename, merge, split, reject and interpret themes before reporting them.</div>
      <div class="control-group"><label>Text variable</label><select id="v1">${opt(text)}</select></div>
      <div class="control-group"><label>Maximum candidate themes</label><select id="themeCount"><option value="3">3</option><option value="4" selected>4</option><option value="5">5</option><option value="6">6</option></select></div>
      <button class="run-btn" id="runBtn">Run thematic analysis</button>`;
    $('analysisSection').classList.remove('hidden');
    $('resultPlaceholder').style.display='block';
    $('analysisResults').innerHTML='';
    $('runBtn').addEventListener('click',runCurrent);
    $('analysisSection').scrollIntoView({behavior:'smooth',block:'start'});
  };

  const originalRunCurrent = runCurrent;
  runCurrent = function(){
    if(currentMethod !== 'thematic') return originalRunCurrent();
    try{
      const name = $('v1')?.value;
      const maxThemes = Number($('themeCount')?.value || 4);
      const result = buildThematicAnalysis(name,maxThemes);
      lastThematicResult = result;
      $('resultPlaceholder').style.display='none';
      $('analysisResults').innerHTML = renderThematic(result,name);
      bindThematicActions();
    }catch(e){
      $('resultPlaceholder').style.display='none';
      $('analysisResults').innerHTML=`<div class="warning">${esc(e.message||e)}</div>`;
    }
  };

  function jaccard(a,b){
    let inter=0;
    a.forEach(x=>{if(b.has(x)) inter++});
    const union=a.size+b.size-inter;
    return union?inter/union:0;
  }

  function phraseTokens(tokens){
    const out=[];
    for(let i=0;i<tokens.length-1;i++) out.push(`${tokens[i]} ${tokens[i+1]}`);
    return out;
  }

  function collectCodes(docs){
    const term = new Map(), phrase = new Map();
    const add=(map,label,di)=>{
      if(!map.has(label)) map.set(label,{label,docs:new Set(),mentions:0});
      const item=map.get(label); item.docs.add(di); item.mentions++;
    };
    docs.forEach((d,di)=>{
      const tokens=tokenize(d.text);
      tokens.forEach(w=>add(term,w,di));
      phraseTokens(tokens).forEach(p=>add(phrase,p,di));
    });
    const N=docs.length;
    const minDf=N>=8?2:1;
    const score=x=>{
      const df=x.docs.size;
      const idf=Math.log((N+1)/(df+.5))+1;
      return df*idf*(1+Math.log(1+x.mentions));
    };
    let codes=[
      ...[...term.values()].filter(x=>x.docs.size>=minDf && x.docs.size/N<=.88).map(x=>({...x,kind:'term',score:score(x)})),
      ...[...phrase.values()].filter(x=>x.docs.size>=(N>=6?2:1) && x.docs.size/N<=.72).map(x=>({...x,kind:'phrase',score:score(x)*1.12}))
    ].sort((a,b)=>b.score-a.score);
    if(codes.length<8){
      codes=[
        ...[...term.values()].filter(x=>x.docs.size>=minDf).map(x=>({...x,kind:'term',score:score(x)})),
        ...[...phrase.values()].filter(x=>x.docs.size>=(N>=6?2:1)).map(x=>({...x,kind:'phrase',score:score(x)*1.08}))
      ].sort((a,b)=>b.score-a.score);
    }
    const selected=[];
    for(const c of codes){
      if(selected.length>=32) break;
      if(c.kind==='term' && selected.some(s=>s.kind==='phrase' && s.label.split(' ').includes(c.label) && jaccard(s.docs,c.docs)>.92)) continue;
      selected.push(c);
    }
    return selected;
  }

  function chooseSeeds(codes,k){
    if(!codes.length) return [];
    const seeds=[codes[0]];
    while(seeds.length<k && seeds.length<codes.length){
      let best=null,bestScore=-Infinity;
      for(const c of codes){
        if(seeds.includes(c)) continue;
        const maxSim=Math.max(...seeds.map(s=>jaccard(c.docs,s.docs)));
        const diversity=.2+(1-maxSim);
        const value=c.score*diversity;
        if(value>bestScore){best=c;bestScore=value}
      }
      if(!best) break;
      seeds.push(best);
    }
    return seeds;
  }

  function clusterCodes(codes,maxThemes){
    const k=Math.min(maxThemes,Math.max(1,Math.min(codes.length, codes.length<6?2:Math.round(Math.sqrt(codes.length)))));
    const seeds=chooseSeeds(codes,k);
    const themes=seeds.map((seed,i)=>({id:i,seed,codes:[seed]}));
    for(const code of codes){
      if(seeds.includes(code)) continue;
      let best=themes[0],bestSim=-1;
      for(const theme of themes){
        const sims=theme.codes.slice(0,5).map(c=>jaccard(code.docs,c.docs));
        const sim=sims.length?Math.max(...sims):0;
        if(sim>bestSim){best=theme;bestSim=sim}
      }
      if(bestSim===0) best=themes.slice().sort((a,b)=>a.codes.length-b.codes.length)[0];
      best.codes.push(code);
    }
    themes.forEach(t=>t.codes.sort((a,b)=>b.score-a.score));
    return themes;
  }

  function titleCase(s){
    return String(s).split(/\s+/).map(w=>w?`${w.charAt(0).toLocaleUpperCase('tr-TR')}${w.slice(1)}`:'').join(' ');
  }

  function themeCoverage(theme){
    const set=new Set();
    theme.codes.forEach(c=>c.docs.forEach(d=>set.add(d)));
    return set;
  }

  function candidateName(theme){
    const labels=[];
    for(const c of theme.codes){
      const candidate=titleCase(c.label);
      if(!labels.some(x=>x.includes(candidate)||candidate.includes(x))) labels.push(candidate);
      if(labels.length===2) break;
    }
    return labels.join(' / ') || 'Candidate Theme';
  }

  function representativeQuotes(theme,docs){
    return docs.map((d,di)=>{
      const hits=theme.codes.reduce((s,c)=>s+(c.docs.has(di)?1:0),0);
      return {text:d.text,hits,di};
    }).filter(x=>x.hits).sort((a,b)=>b.hits-a.hits || a.text.length-b.text.length).slice(0,2);
  }

  function buildThematicAnalysis(name,maxThemes){
    if(!name) throw new Error('Choose a text variable.');
    const docs=rows.map((r,i)=>({row:i+1,text:clean(r[name])})).filter(d=>d.text);
    if(docs.length<3) throw new Error('At least three usable text records are recommended for candidate thematic analysis.');
    const codes=collectCodes(docs);
    if(codes.length<2) throw new Error('Not enough recurring lexical material was found to generate candidate codes and themes.');
    const themes=clusterCodes(codes,maxThemes).map(theme=>{
      const coverage=themeCoverage(theme);
      const name=candidateName(theme);
      const topCodes=theme.codes.slice(0,8).map(c=>c.label);
      const description=`Candidate pattern organised around ${topCodes.slice(0,4).join(', ')}. It appears across ${coverage.size} of ${docs.length} text records and should be reviewed for shared meaning, internal coherence and distinction from other themes.`;
      return {...theme,name,description,coverage,quotes:representativeQuotes(theme,docs)};
    });
    return {docs,codes,themes,source:name};
  }

  function renderThematic(result,name){
    const {docs,codes,themes}=result;
    const themeCards=themes.map((t,i)=>`<article class="theme-editor" data-theme="${i}">
      <label>Candidate theme name — editable</label>
      <input class="theme-name" value="${esc(t.name)}">
      <div class="theme-meta"><span>${t.coverage.size}/${docs.length} records</span><span>${fmt(t.coverage.size/docs.length*100,1)}% coverage</span><span>${t.codes.length} codes</span></div>
      <label>Working definition — editable</label>
      <textarea class="theme-desc">${esc(t.description)}</textarea>
      <div class="theme-codes">${t.codes.slice(0,10).map(c=>`<span class="code-chip">${esc(c.label)}</span>`).join('')}</div>
      <strong style="font-size:11px">Supporting passages</strong>
      ${t.quotes.map(q=>`<div class="theme-quote">${esc(q.text.length>420?q.text.slice(0,417)+'…':q.text)}</div>`).join('') || '<div class="theme-quote">No representative passage found.</div>'}
    </article>`).join('');

    const codeRows=codes.map(c=>{
      const ti=themes.findIndex(t=>t.codes.includes(c));
      return `<tr><td>${esc(c.label)}</td><td>${esc(c.kind)}</td><td>${c.docs.size}</td><td>${c.mentions}</td><td>${esc(themes[ti]?.name||'—')}</td></tr>`;
    }).join('');

    return `<div class="stat-cards"><div class="stat-card"><strong>${docs.length}</strong><span>Text records</span></div><div class="stat-card"><strong>${codes.length}</strong><span>Initial codes</span></div><div class="stat-card"><strong>${themes.length}</strong><span>Candidate themes</span></div></div>
      <div class="methodology-box"><strong>Methodological status:</strong> this output is a computer-assisted, data-driven candidate thematic analysis. It automates lexical first-cycle coding and co-occurrence clustering; it does not independently establish latent meaning or replace researcher reflexivity. Before publication, review the source material, negative cases, theme boundaries, naming and interpretation.</div>
      <div class="result-block"><h3>${esc(name)} — candidate thematic structure</h3><div class="theme-grid">${themeCards}</div></div>
      <div class="theme-actions"><button id="copyThemesBtn">Copy thematic summary</button><button class="secondary" id="downloadCodebookBtn">Download codebook CSV</button></div>
      <div class="result-block"><h3>Initial codebook</h3><div class="table-wrap"><table><thead><tr><th>Initial code</th><th>Type</th><th>Records</th><th>Mentions</th><th>Candidate theme</th></tr></thead><tbody>${codeRows}</tbody></table></div></div>
      <div class="result-block"><h3>Researcher review checklist</h3><ul class="review-list"><li>Read all passages assigned to each candidate theme, not only the examples shown.</li><li>Check whether codes express a shared pattern of meaning rather than merely sharing vocabulary.</li><li>Look for contradictory and negative cases.</li><li>Merge overlapping themes and split internally inconsistent themes.</li><li>Rename themes so the title captures the analytic idea, not just a topic word.</li><li>Write the final interpretation from the research question, context and full dataset.</li></ul></div>`;
  }

  function currentThemeNames(){
    return [...document.querySelectorAll('.theme-editor')].map(card=>({
      index:Number(card.dataset.theme),
      name:card.querySelector('.theme-name')?.value.trim()||'Untitled theme',
      description:card.querySelector('.theme-desc')?.value.trim()||''
    }));
  }

  function bindThematicActions(){
    $('copyThemesBtn')?.addEventListener('click',async()=>{
      const edited=currentThemeNames();
      const text=edited.map((t,i)=>{
        const original=lastThematicResult.themes[t.index];
        const codes=original.codes.slice(0,10).map(c=>c.label).join(', ');
        const quotes=original.quotes.map(q=>`“${q.text}”`).join('\n');
        return `Theme ${i+1}: ${t.name}\nDefinition: ${t.description}\nCodes: ${codes}\nCoverage: ${original.coverage.size}/${lastThematicResult.docs.length}\nIllustrative passages:\n${quotes}`;
      }).join('\n\n');
      try{await navigator.clipboard.writeText(text); const b=$('copyThemesBtn');b.textContent='Copied';setTimeout(()=>b.textContent='Copy thematic summary',1200)}catch{alert('Copy was blocked by the browser. Select and copy the result manually.')}
    });
    $('downloadCodebookBtn')?.addEventListener('click',()=>{
      if(!lastThematicResult) return;
      const names=currentThemeNames();
      const themeName=i=>names.find(x=>x.index===i)?.name||lastThematicResult.themes[i]?.name||'';
      const lines=[['Initial code','Type','Records','Mentions','Candidate theme']];
      lastThematicResult.codes.forEach(c=>{
        const ti=lastThematicResult.themes.findIndex(t=>t.codes.includes(c));
        lines.push([c.label,c.kind,c.docs.size,c.mentions,themeName(ti)]);
      });
      const csv=lines.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Data2Analysis_thematic_codebook.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    });
  }
})();
