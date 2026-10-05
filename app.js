
const KEY='cpuMissionHQ_v1';
const defaultState={xp:0,done:{},badges:[]};
function getState(){
  try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||'{}')}}
  catch(e){return {...defaultState}}
}
function saveState(s){localStorage.setItem(KEY,JSON.stringify(s));updateHUD()}
function updateHUD(){
  const s=getState();
  document.querySelectorAll('[data-xp]').forEach(el=>el.textContent=s.xp);
  const count=Object.keys(s.done||{}).length;
  document.querySelectorAll('[data-done]').forEach(el=>el.textContent=count);
  document.querySelectorAll('.progress-bar').forEach(el=>{
    const total=parseInt(el.dataset.total||'15',10);
    el.style.width=Math.min(100,(count/total)*100)+'%';
  });
}
function award(id,xp,badge){
  const s=getState();
  if(!s.done[id]){
    s.done[id]=true; s.xp+=xp;
    if(badge && !s.badges.includes(badge)) s.badges.push(badge);
    saveState(s);
    return true;
  }
  return false;
}
function mcq(btn, correct, id, xp, explanation=''){
  const box=btn.closest('.question');
  box.querySelectorAll('.option').forEach(b=>b.disabled=true);
  const ok=btn.dataset.value===correct;
  btn.classList.add(ok?'correct':'wrong');
  if(!ok){
    const right=[...box.querySelectorAll('.option')].find(b=>b.dataset.value===correct);
    if(right) right.classList.add('correct');
  }
  const f=box.querySelector('.feedback');
  f.textContent=(ok?'Correct. ':'Not quite. ')+explanation;
  f.className='feedback '+(ok?'correct-text':'wrong-text');
  if(ok && award(id,xp)){ f.innerHTML += ` <span class="scoreburst">+${xp} XP</span>`; }
}
function moveItem(btn,dir){
  const row=btn.closest('.row'), zone=row.parentElement;
  if(dir<0 && row.previousElementSibling) zone.insertBefore(row,row.previousElementSibling);
  if(dir>0 && row.nextElementSibling) zone.insertBefore(row.nextElementSibling,row);
}
function checkOrder(btn, answer, id, xp){
  const zone=btn.parentElement.querySelector('.sort-zone');
  const got=[...zone.querySelectorAll('.token')].map(x=>x.dataset.key).join(',');
  const f=btn.parentElement.querySelector('.feedback');
  const ok=got===answer.join(',');
  f.textContent=ok?'Sequence correct.':'Not yet — think about what must happen before the next step.';
  f.className='feedback '+(ok?'correct-text':'wrong-text');
  if(ok && award(id,xp)){f.innerHTML+=` <span class="scoreburst">+${xp} XP</span>`}
}
function shortCheck(btn, accepted, id, xp, hint=''){
  const box=btn.closest('.question'), input=box.querySelector('input');
  const v=input.value.trim().toLowerCase();
  const ok=accepted.some(a=>v.includes(a.toLowerCase()));
  const f=box.querySelector('.feedback');
  f.textContent=ok?'Accepted.':('Try again. '+hint);
  f.className='feedback '+(ok?'correct-text':'wrong-text');
  if(ok && award(id,xp)){f.innerHTML+=` <span class="scoreburst">+${xp} XP</span>`}
}
function resetProgress(){
  if(confirm('Reset all CPU Mission HQ progress on this device?')){
    localStorage.removeItem(KEY);location.reload()
  }
}
window.addEventListener('DOMContentLoaded',updateHUD);
