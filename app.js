const modal=document.getElementById('demoModal');
const frame=document.getElementById('demoFrame');
const modalTitle=document.getElementById('demoTitle');
const fullDemo=document.getElementById('fullDemo');

const allowedModules=new Map([
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
  name=allowedModules.get(url);
  modalTitle.textContent=name;
  fullDemo.href=url;
  frame.src=url;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}

function closeDemo(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  frame.src='about:blank';
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
