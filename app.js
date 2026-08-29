const modal=document.getElementById('demoModal');
const frame=document.getElementById('demoFrame');
const modalTitle=document.getElementById('demoTitle');
const fullDemo=document.getElementById('fullDemo');
const toast=document.getElementById('toast');

function openDemo(name,url){
  modalTitle.textContent=name;
  fullDemo.href=url;
  frame.src=url;
  modal.classList.add('open');
  document.body.style.overflow='hidden';
}

function closeDemo(){
  modal.classList.remove('open');
  document.body.style.overflow='';
  frame.src='about:blank';
}

document.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-demo-url]');
  if(trigger){openDemo(trigger.dataset.demoName,trigger.dataset.demoUrl)}
  if(e.target===modal){closeDemo()}
});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&modal.classList.contains('open')) closeDemo();
});

function buildInquiry(){
  const institution=document.getElementById('institution').value.trim()||'[Institution]';
  const role=document.getElementById('role').value||'[Role / unit]';
  const size=document.getElementById('size').value||'[Expected user group]';
  const modules=[...document.querySelectorAll('input[name="modules"]:checked')].map(x=>x.value);
  const note=document.getElementById('note').value.trim();
  const moduleText=modules.length?modules.join(', '):'All six modules';
  const message=`Institutional Pilot Enquiry\n\nInstitution: ${institution}\nUnit / role: ${role}\nExpected user group: ${size}\nModules of interest: ${moduleText}\nPilot preference: 30-day institutional evaluation\n${note?`Additional note: ${note}\n`:''}\nWe would like to discuss a limited institutional pilot of Academic AI Toolkit and, if appropriate, a tailored annual institutional licence.`;
  const box=document.getElementById('generatedInquiry');
  box.textContent=message;
  box.style.display='block';
  box.dataset.message=message;
}

async function copyInquiry(){
  const box=document.getElementById('generatedInquiry');
  if(!box.dataset.message) buildInquiry();
  try{
    await navigator.clipboard.writeText(box.dataset.message||box.textContent);
    showToast('Pilot enquiry copied');
  }catch(e){
    showToast('Select and copy the generated enquiry');
  }
}

function showToast(text){
  toast.textContent=text;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>toast.classList.remove('show'),1800);
}

window.openDemo=openDemo;
window.closeDemo=closeDemo;
window.buildInquiry=buildInquiry;
window.copyInquiry=copyInquiry;
