/* ===== Subject-wise time ===== */
(function(){
const stl=document.createElement('style');
stl.textContent='.sbs{display:block;width:100%;margin:-4px 0 12px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--ink);font:inherit;font-size:14px}';
document.head.appendChild(stl);
function subs(){S.dsub=S.dsub||{};S.subjects=Array.isArray(S.subjects)?S.subjects:[];const a=S.subjects.slice();(S.sub||[]).forEach(s=>{if(s&&a.indexOf(s)<0)a.push(s)});return a}
const subFor=(d,g)=>(S.dsub||{})[d+':'+g]||(S.sub||[])[g]||'';
function inject(){
  const L=subs();
  document.querySelectorAll('#list .rw').forEach((w,g)=>{
    const mi=w.querySelector('.mi');if(!mi)return;
    const v=subFor(cur,g),s=document.createElement('select');
    s.className='sbs';s.dataset.ds=g;
    s.innerHTML='<option value="">📚 Which subject did you study?</option>'+L.map(x=>'<option'+(x===v?' selected':'')+'>'+esc(x)+'</option>').join('')+'<option value="__new">＋ New subject…</option>';
    mi.after(s)
  })
}
$('list').addEventListener('change',e=>{
  const s=e.target.closest('.sbs');if(!s)return;
  const g=+s.dataset.ds,k=cur+':'+g;let v=s.value;S.dsub=S.dsub||{};
  if(v==='__new'){
    v=(prompt('New subject name:')||'').trim().slice(0,40);
    if(!v){render();return}
    if(subs().indexOf(v)<0)S.subjects.push(v)
  }
  if(v)S.dsub[k]=v;else delete S.dsub[k];
  save();render()
});
function subDash(c){
  const D=c.D,G=c.G,ti=todayIdx(),T={},TD={};let tot=0;
  for(let d=1;d<=D;d++)for(let g=0;g<G;g++){
    const m=am(d,g);if(!m)continue;
    const k=subFor(d,g)||'No subject';
    T[k]=(T[k]||0)+m;tot+=m;if(d===ti)TD[k]=(TD[k]||0)+m
  }
  const ks=Object.keys(T).sort((a,b)=>T[b]-T[a]);if(!ks.length)return;
  const html='<h3>Time by subject</h3><div class="card">'+ks.map(k=>row(esc(k),T[k]/tot,'<span>⏱ '+dur(T[k])+'</span>'+(TD[k]?'<span>Today '+dur(TD[k])+'</span>':''))).join('')+'</div>';
  const h=[...$('dash').querySelectorAll('h3')].find(x=>/^Goal performance/.test(x.textContent));
  if(h)h.insertAdjacentHTML('beforebegin',html)
}
const _rd=renderDash;renderDash=function(c){_rd(c);try{subDash(c)}catch(e){}};
const _r=render;render=function(){_r();inject()};
const _rx=rx;rx=function(o,i){const r=_rx(o,i);if(o===S.mins&&S.dsub)S.dsub=_rx(S.dsub,i);return r};
render();
})();
