/* ===== Subject-wise time + daily subject targets ===== */
(function(){
const stl=document.createElement('style');
stl.textContent='.sbs{display:block;width:100%;margin:-4px 0 12px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--ink);font:inherit;font-size:14px}';
document.head.appendChild(stl);
function subs(){S.dsub=S.dsub||{};S.stg=S.stg||{};S.hid=Array.isArray(S.hid)?S.hid:[];S.subjects=Array.isArray(S.subjects)?S.subjects:[];const a=S.subjects.slice();(S.sub||[]).forEach(s=>{if(s&&a.indexOf(s)<0)a.push(s)});return a.filter(s=>S.hid.indexOf(s)<0)}
function unhide(v){S.hid=(S.hid||[]).filter(x=>x!==v)}
const subFor=(d,g)=>(S.dsub||{})[d+':'+g]||(S.sub||[])[g]||'';

/* Today tab: subject dropdown under each Warrior */
function inject(){
  const L0=subs();
  document.querySelectorAll('#list .rw').forEach((w,g)=>{
    const mi=w.querySelector('.mi');if(!mi)return;
    const v=subFor(cur,g),L=(v&&L0.indexOf(v)<0)?L0.concat([v]):L0,s=document.createElement('select');
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
    unhide(v);if(subs().indexOf(v)<0)S.subjects.push(v)
  }
  if(v)S.dsub[k]=v;else delete S.dsub[k];
  save();render()
});

/* Dashboard: Time by subject */
function subDash(c){
  const D=c.D,G=c.G,ti=todayIdx(),el=Math.max(0,Math.min(D,ti)),T={},TD={};
  for(let d=1;d<=D;d++)for(let g=0;g<G;g++){
    const m=am(d,g);if(!m)continue;
    const k=subFor(d,g)||'No subject';
    T[k]=(T[k]||0)+m;if(d===ti)TD[k]=(TD[k]||0)+m
  }
  subs();
  const ks=Object.keys(T);Object.keys(S.stg).forEach(k=>{if(S.stg[k]>0&&ks.indexOf(k)<0)ks.push(k)});
  if(!ks.length)return;
  ks.sort((a,b)=>(T[b]||0)-(T[a]||0));
  const days=nf(1,el),todayOk=ti>=1&&ti<=D;
  const rows=ks.map(k=>{
    const t=+S.stg[k]||0,tot=T[k]||0,td=TD[k]||0;
    let tdTxt='';
    if(todayOk&&(td||t))tdTxt='<span>Today '+dur(td)+(t&&!fri(ti)?' · '+pct(td/t):fri(ti)&&td?' · free day':'')+'</span>';
    if(t>0)return row(esc(k)+'<em class="tg">'+dur(t)+'/day</em>',days?tot/(t*days):0,'<span>⏱ '+dur(tot)+'</span>'+tdTxt);
    return row(esc(k),0,'<span>No daily target (set in Settings)</span>'+tdTxt).replace('<b>0%</b>','<b>'+dur(tot)+'</b>')
  }).join('');
  const html='<h3>Time by subject</h3><div class="card">'+rows+'</div><p class="foot" style="text-align:left">% = time ÷ (daily target × days so far). Fridays are bonus when Friday mode is on.</p>';
  const h=[...$('dash').querySelectorAll('h3')].find(x=>/^Goal performance/.test(x.textContent));
  if(h)h.insertAdjacentHTML('beforebegin',html)
}

/* Settings: daily target per subject */
function stRender(){
  let box=$('stg');
  if(!box){
    const h=[...document.querySelectorAll('#v3 h3')].find(x=>/^Cloud sync/.test(x.textContent));
    if(!h)return;
    h.insertAdjacentHTML('beforebegin','<h3>Subject targets <span class="lgd">daily target (min)</span></h3><div id="stg"></div>');
    box=$('stg');
    box.addEventListener('change',e=>{
      const i=e.target.dataset.st;if(i===undefined)return;
      const name=subs()[+i];if(!name)return;
      const v=Math.max(0,Math.min(1440,Math.round(+e.target.value)||0));
      if(v)S.stg[name]=v;else delete S.stg[name];
      save();render()
    });
    box.addEventListener('click',e=>{
      if(!e.target.closest('#sta'))return;
      const v=$('stn').value.trim().slice(0,40);if(!v)return;
      unhide(v);if(subs().indexOf(v)<0)S.subjects.push(v);
      save();stRender();render()
    });
    box.addEventListener('click',e=>{
      const b=e.target.closest('[data-sdel]');if(!b)return;
      const name=subs()[+b.dataset.sdel];if(!name)return;
      if(!confirm('Delete subject "'+name+'"? Past time already logged under it stays in the dashboard.'))return;
      S.subjects=S.subjects.filter(x=>x!==name);
      if(S.hid.indexOf(name)<0)S.hid.push(name);
      delete S.stg[name];
      save();stRender();render()
    })
  }
  const L=subs();
  box.innerHTML=(L.length?L.map((k,i)=>'<div class="f"><span>'+esc(k)+'</span><input class="tmi" type="number" inputmode="numeric" min="0" max="1440" data-st="'+i+'" placeholder="0" value="'+(S.stg[k]||'')+'"><button data-sdel="'+i+'" aria-label="Delete subject" style="width:40px;flex:none;color:var(--bad);font-size:20px">×</button></div>').join(''):'<p class="np">No subjects yet. Add one below or from the Today tab.</p>')+'<div class="gi2" style="margin-top:10px"><input id="stn" placeholder="New subject name" maxlength="40"></div><div class="act"><button id="sta">+ Add subject</button></div>'
}

const _rd=renderDash;renderDash=function(c){_rd(c);try{subDash(c)}catch(e){}};
const _r=render;render=function(){_r();inject()};
const _rs=renderSettings;renderSettings=function(){_rs();try{stRender()}catch(e){}};
const _rx=rx;rx=function(o,i){const r=_rx(o,i);if(o===S.mins&&S.dsub)S.dsub=_rx(S.dsub,i);return r};
render();
})();
