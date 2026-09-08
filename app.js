const modal=document.getElementById('demoModal');
const frame=document.getElementById('demoFrame');
const modalTitle=document.getElementById('demoTitle');
const fullDemo=document.getElementById('fullDemo');

function openDemo(name,url){
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
