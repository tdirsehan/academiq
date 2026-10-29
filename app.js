const modal=document.getElementById('demoModal');
const frame=document.getElementById('demoFrame');
const modalTitle=document.getElementById('demoTitle');
const fullDemo=document.getElementById('fullDemo');
let returnFocus=null;

const allowedModules=new Map([
  ['https://tdirsehan.github.io/academiq/research-question-builder/','Research Question Builder'],
  ['https://tdirsehan.github.io/academiq/title2doi/','Title2DOI'],
  ['https://tdirsehan.github.io/academic-prompt-generator/','Academic Prompt Generator'],
  ['https://tdirsehan.github.io/academiq/data2analysis/','Data2Analysis'],
  ['https://tdirsehan.github.io/abstract2keywords/','Abstract2Keywords'],
  ['https://tdirsehan.github.io/abstract2title/','Abstract2Title'],
  ['https://tdirsehan.github.io/abstract2journal/','Abstract2Journal'],
  ['https://tdirsehan.github.io/abstract2coverletter/','Abstract2CoverLetter'],
  ['https://tdirsehan.github.io/review-splitter/','Review Splitter']
]);
function openDemo(name,url){
  if(!allowedModules.has(url))return;
  returnFocus=document.activeElement;
  name=allowedModules.get(url);
  modalTitle.textContent=name;
  fullDemo.href=url;
  frame.src=url;
  frame.title=name;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  document.getElementById('closeDemoButton')?.focus?.();
}

function closeDemo(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  frame.src='about:blank';
  returnFocus?.focus?.();
}

document.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-demo-url]');
  if(trigger){
    openDemo(trigger.dataset.demoName,trigger.dataset.demoUrl);
  }
  if(e.target===modal){
    closeDemo();
  }
});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&modal.classList.contains('open')){
    closeDemo();
  }
});

window.openDemo=openDemo;
window.closeDemo=closeDemo;


document.getElementById('closeDemoButton')?.addEventListener('click',closeDemo);

const toolCards=[...(document.querySelectorAll?.('.tool-card')||[])];
const filterButtons=[...(document.querySelectorAll?.('[data-filter]')||[])];
const toolSearch=document.getElementById('toolSearch');
let selectedStage='all';
function filterTools(){
  const term=(toolSearch?.value||'').trim().toLocaleLowerCase();
  let visible=0;
  for(const card of toolCards){
    const matches=(selectedStage==='all'||card.dataset.category===selectedStage)&&card.textContent.toLocaleLowerCase().includes(term);
    card.hidden=!matches;if(matches)visible++;
  }
  const count=document.getElementById('toolCount');if(count)count.textContent=visible===toolCards.length?toolCards.length+' tools for your research':visible+' of '+toolCards.length+' tools';
  const empty=document.getElementById('noTools');if(empty)empty.hidden=visible>0;
  for(const button of filterButtons){const active=button.dataset.filter===selectedStage;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}
}
for(const button of filterButtons)button.addEventListener('click',()=>{selectedStage=button.dataset.filter;filterTools();});
toolSearch?.addEventListener('input',filterTools);
document.getElementById('resetTools')?.addEventListener('click',()=>{selectedStage='all';toolSearch.value='';filterTools();toolSearch.focus();});
const menuToggle=document.getElementById('menuToggle');
function closeMenu(){document.querySelector?.('.site-header')?.classList.remove('menu-open');menuToggle?.setAttribute('aria-expanded','false');menuToggle?.setAttribute('aria-label','Open navigation');}
menuToggle?.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';document.querySelector('.site-header').classList.toggle('menu-open',open);menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
document.querySelectorAll?.('#primaryNav a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.querySelector?.('.bank-link')?.addEventListener('click',()=>{document.getElementById('bankDetails').open=true;});
