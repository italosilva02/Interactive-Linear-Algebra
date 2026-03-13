'use strict';

const PALETTE = ['#8b7bff','#3dffd8','#ff6b82','#ffb347','#6aff9e','#6ab8ff','#e76aff','#ffe46a'];

let currentMode   = '2d_lines';
let uniqueId      = 0;
let plotReady     = false;
let cardMinimized = false;
let isDark        = true;

/* ─── THEME ─── */
function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeIcon').textContent = isDark ? '☀' : '☾';
  plotReady = false; renderPlot();
}
function TH() {
  return isDark
    ? { bg:'#08080d', paper:'#08080d', grid:'rgba(255,255,255,0.07)', zero:'rgba(255,255,255,0.18)', text:'#7070b0', sceneBg:'#0b0b14' }
    : { bg:'#ffffff', paper:'#eef0f8', grid:'rgba(0,0,0,0.06)',        zero:'rgba(0,0,0,0.18)',        text:'#7070a0', sceneBg:'#eaecf8' };
}

/* ─── TABS ─── */
function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-${tab}`).classList.add('active');
  if (tab === 'viz') setTimeout(renderPlot, 60);
}

/* ─── MODE ─── */
function onModeChange(val) {
  currentMode = val;
  const is3d = val !== '2d_lines', isSurf = val === '3d_surface';
  document.getElementById('cameraControls').classList.toggle('hidden', !is3d || isSurf);
  document.getElementById('surfaceControls').classList.toggle('hidden', !isSurf);
  document.getElementById('objectControls').classList.toggle('hidden', isSurf);
  document.getElementById('inputsContainer').innerHTML = '';
  uniqueId = 0; plotReady = false;
  if (!isSurf) { createInputRow('geom'); createInputRow('geom'); }
  renderPlot();
}

/* ─── INPUT ROWS ─── */
function createInputRow(type) {
  const container = document.getElementById('inputsContainer');
  if (!container) return;
  const id = ++uniqueId;
  const cidx = container.querySelectorAll('.item-row').length % PALETTE.length;
  const color = PALETTE[cidx];
  const div = document.createElement('div');
  div.id = `item-${id}`;

  if (type === 'scalar') {
    div.className = 'item-row item-scalar';
    div.innerHTML = `
      <div class="item-header">
        <div class="item-title"><span style="color:var(--accent);font-size:15px">λ</span> Escalar ${id}</div>
        <button class="item-remove" onclick="removeItem('item-${id}')">×</button>
      </div>
      <div class="field-group">
        <span class="coord-label">Fator λ</span>
        <input class="coord-input scalar-val" type="number" step="any" value="2" oninput="debounceRender()">
      </div>`;
  } else if (currentMode === '2d_lines') {
    div.className = 'item-row item-geom';
    div.innerHTML = `
      <div class="item-header">
        <div class="item-title"><span class="swatch" style="background:${color}"></span><span class="lbl">Reta ${id}</span></div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="copy-vec-btn" onclick="copyVector(this,'item-${id}')">↗ copiar</button>
          <button class="item-remove" onclick="removeItem('item-${id}')">×</button>
        </div>
      </div>
      <div class="coords-row">
        <div class="coord-group"><span class="coord-label">X₁</span><input class="coord-input x1" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
        <div class="coord-group"><span class="coord-label">Y₁</span><input class="coord-input y1" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
        <div class="coord-group"><span class="coord-label">X₂</span><input class="coord-input x2" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
        <div class="coord-group"><span class="coord-label">Y₂</span><input class="coord-input y2" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
      </div>`;
  } else if (currentMode === '3d_points') {
    div.className = 'item-row item-geom';
    div.innerHTML = `
      <div class="item-header">
        <div class="item-title"><span class="swatch" style="background:${color}"></span><span class="lbl">Ponto ${id}</span></div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="copy-vec-btn" onclick="copyVector(this,'item-${id}')">↗ copiar</button>
          <button class="item-remove" onclick="removeItem('item-${id}')">×</button>
        </div>
      </div>
      <div class="point-coords">
        <div class="coord-group"><span class="coord-label">X</span><input class="coord-input px" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
        <div class="coord-group"><span class="coord-label">Y</span><input class="coord-input py" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
        <div class="coord-group"><span class="coord-label">Z</span><input class="coord-input pz" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
      </div>`;
  } else if (currentMode === '3d_lines') {
    div.className = 'item-row item-geom';
    div.innerHTML = `
      <div class="item-header">
        <div class="item-title"><span class="swatch" style="background:${color}"></span><span class="lbl">Reta ${id}</span></div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="copy-vec-btn" onclick="copyVector(this,'item-${id}')">↗ copiar</button>
          <button class="item-remove" onclick="removeItem('item-${id}')">×</button>
        </div>
      </div>
      <div class="coords-row">
        <div class="coord-group"><span class="coord-label">X₁</span><input class="coord-input x1" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
        <div class="coord-group"><span class="coord-label">Y₁</span><input class="coord-input y1" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
        <div class="coord-group"><span class="coord-label">Z₁</span><input class="coord-input z1" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
      </div>
      <div class="coords-row" style="margin-top:5px">
        <div class="coord-group"><span class="coord-label">X₂</span><input class="coord-input x2" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
        <div class="coord-group"><span class="coord-label">Y₂</span><input class="coord-input y2" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
        <div class="coord-group"><span class="coord-label">Z₂</span><input class="coord-input z2" type="number" step="any" value="${rnd()}" oninput="debounceRender()"></div>
      </div>`;
  }
  container.appendChild(div);
  refreshLabels(); debounceRender();
}

/* ─── COPY VECTOR ─── */
function copyVector(btn, itemId) {
  const el = document.getElementById(itemId); if (!el) return;
  let vecStr = '';
  if (currentMode === '2d_lines') {
    const x1=+el.querySelector('.x1').value||0, y1=+el.querySelector('.y1').value||0;
    const x2=+el.querySelector('.x2').value||0, y2=+el.querySelector('.y2').value||0;
    vecStr = `${x2-x1}, ${y2-y1}`;
  } else if (currentMode === '3d_points') {
    vecStr = `${+el.querySelector('.px').value||0}, ${+el.querySelector('.py').value||0}, ${+el.querySelector('.pz').value||0}`;
  } else if (currentMode === '3d_lines') {
    const x1=+el.querySelector('.x1').value||0, y1=+el.querySelector('.y1').value||0, z1=+el.querySelector('.z1').value||0;
    const x2=+el.querySelector('.x2').value||0, y2=+el.querySelector('.y2').value||0, z2=+el.querySelector('.z2').value||0;
    vecStr = `${x2-x1}, ${y2-y1}, ${z2-z1}`;
  }
  if (!vecStr) return;
  const vecA = document.getElementById('vecA'), vecB = document.getElementById('vecB');
  if (!vecA.value) vecA.value = vecStr; else vecB.value = vecStr;
  btn.textContent = '✓ copiado'; btn.classList.add('copied');
  setTimeout(() => { btn.textContent = '↗ copiar'; btn.classList.remove('copied'); }, 1600);
}

function removeItem(id) { const el=document.getElementById(id); if(el){el.remove();refreshLabels();debounceRender();} }

function refreshLabels() {
  document.querySelectorAll('.item-row.item-geom').forEach((row,i) => {
    const sw=row.querySelector('.swatch'), lbl=row.querySelector('.lbl'), c=PALETTE[i%PALETTE.length];
    if(sw) sw.style.background=c;
    if(lbl) lbl.textContent=(currentMode==='3d_points'?'Ponto':'Reta')+' '+(i+1);
  });
}

function rnd() { return Math.floor(Math.random()*14)-5; }

/* ─── CAMERA ─── */
function setCamera(view) {
  const eyes={perspective:{x:1.5,y:1.5,z:1.2},xy:{x:.001,y:.001,z:2.5},xz:{x:.001,y:-2.5,z:.001},yz:{x:2.5,y:.001,z:.001}};
  Plotly.relayout('plot',{'scene.camera.eye':eyes[view]||eyes.perspective});
}

/* ─── DEBOUNCE ─── */
let debTimer;
function debounceRender(){clearTimeout(debTimer);debTimer=setTimeout(renderPlot,160);}

/* ─── MATH CARD ─── */
function toggleMathCard(){
  cardMinimized=!cardMinimized;
  document.getElementById('mathCardBody').style.display=cardMinimized?'none':'';
  document.querySelector('.math-card-min').textContent=cardMinimized?'+':'−';
}
function initDraggable(){
  const card=document.getElementById('mathCard'), handle=document.getElementById('mathCardDragHandle');
  let ox=0,oy=0,tx=0,ty=0;
  handle.onmousedown=e=>{
    if(e.target.tagName==='BUTTON') return;
    ox=e.clientX; oy=e.clientY;
    document.onmousemove=ev=>{tx+=ev.clientX-ox;ty+=ev.clientY-oy;ox=ev.clientX;oy=ev.clientY;card.style.right='auto';card.style.top='auto';card.style.transform=`translate(${tx}px,${ty}px)`;};
    document.onmouseup=()=>{document.onmousemove=null;document.onmouseup=null;};
  };
}

/* ─── HELPERS ─── */
function avg(a){return a.length?a.reduce((s,v)=>s+v,0)/a.length:0;}
function cov(xs,ys){if(xs.length<2)return 0;const mx=avg(xs),my=avg(ys);return xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/(xs.length-1);}

/* ─── METRICS CARD ─── */
function buildMetricsCard(items, lam) {
  const geom=[...items].filter(i=>i.classList.contains('item-geom'));
  const card=document.getElementById('mathCard'), body=document.getElementById('mathCardBody');
  if(!geom.length){card.classList.add('hidden');return;}
  let html='';

  /* 2D */
  if (currentMode==='2d_lines') {
    geom.forEach((el,i)=>{
      const x1=+el.querySelector('.x1').value||0,y1=+el.querySelector('.y1').value||0;
      const x2=+el.querySelector('.x2').value||0,y2=+el.querySelector('.y2').value||0;
      const c=PALETTE[i%PALETTE.length], vx=x2-x1, vy=y2-y1;
      const mod=Math.sqrt(vx*vx+vy*vy), ang=(Math.atan2(vy,vx)*180/Math.PI).toFixed(2);
      html+=`<div class="metric-card" style="--mc-color:${c}">
        <div class="metric-card-header"><div class="metric-title">Reta ${i+1}</div></div>
        <div class="metric-row"><span class="metric-label">Origem P₁</span><span class="metric-value">(${x1}, ${y1})</span></div>
        <div class="metric-row"><span class="metric-label">Destino P₂</span><span class="metric-value">(${x2}, ${y2})</span></div>
        <div class="metric-row"><span class="metric-label">Vetor diretor v</span><span class="metric-value">(${vx}, ${vy})</span></div>
        <div class="metric-row"><span class="metric-label">Módulo |v|</span><span class="metric-value">${mod.toFixed(4)}</span></div>
        <div class="metric-row"><span class="metric-label">Ângulo θ</span><span class="metric-value">${ang}°</span></div>
        <div class="metric-formula"><span class="formula-step">Vetor diretor:</span>
v = P₂ − P₁ = (${x2}−${x1}, ${y2}−${y1}) = <b>(${vx}, ${vy})</b>

<span class="formula-step">Módulo:</span>
|v| = √(${vx}²+${vy}²)
    = √(${vx*vx}+${vy*vy})
    = <b>${mod.toFixed(4)}</b>

<span class="formula-step">Ângulo:</span>
θ = atan2(${vy}, ${vx}) = <b>${ang}°</b></div>`;
      if(lam!==1){
        const svx=(vx*lam).toFixed(2),svy=(vy*lam).toFixed(2),sm=(mod*Math.abs(lam)).toFixed(4);
        const sx2=(x1+vx*lam).toFixed(2),sy2=(y1+vy*lam).toFixed(2);
        html+=`<div class="scalar-section">
          <div class="scalar-section-title">λ = ${lam} aplicado</div>
          <div class="metric-row"><span class="metric-label">v' = λ·v</span><span class="metric-value">(${svx}, ${svy})</span></div>
          <div class="metric-row"><span class="metric-label">Novo destino</span><span class="metric-value">(${sx2}, ${sy2})</span></div>
          <div class="metric-row"><span class="metric-label">|v'| = |λ|·|v|</span><span class="metric-value">${sm}</span></div>
          <div class="metric-formula"><span class="formula-step">Escalonamento:</span>
v' = ${lam}·(${vx}, ${vy}) = (${svx}, ${svy})
Destino' = P₁ + v' = (${x1}+${svx}, ${y1}+${svy}) = (${sx2}, ${sy2})
|v'| = |${lam}|·${mod.toFixed(4)} = <b>${sm}</b></div>
        </div>`;
      }
      html+=`</div>`;
    });
    if(geom.length>=2){
      const [e0,e1]=[geom[0],geom[1]];
      const p0x=+e0.querySelector('.x1').value||0,p0y=+e0.querySelector('.y1').value||0;
      const p1x=+e1.querySelector('.x1').value||0,p1y=+e1.querySelector('.y1').value||0;
      const u0x=+e0.querySelector('.x2').value-p0x, u0y=+e0.querySelector('.y2').value-p0y;
      const u1x=+e1.querySelector('.x2').value-p1x, u1y=+e1.querySelector('.y2').value-p1y;
      const l2=Math.sqrt((p0x-p1x)**2+(p0y-p1y)**2);
      const l1=Math.abs(p0x-p1x)+Math.abs(p0y-p1y);
      const dot=u0x*u1x+u0y*u1y;
      const cosA=dot/(Math.sqrt(u0x**2+u0y**2)*Math.sqrt(u1x**2+u1y**2)||1);
      const angBetween=(Math.acos(Math.max(-1,Math.min(1,cosA)))*180/Math.PI).toFixed(2);
      html+=`<div class="metric-card relation">
        <div class="metric-title" style="color:var(--accent-2);margin-bottom:12px">Relação Reta 1 × Reta 2</div>
        <div class="metric-row"><span class="metric-label">d(P₁, P₂) — Euclidiana L₂</span><span class="metric-value" style="color:var(--accent-2)">${l2.toFixed(4)}</span></div>
        <div class="metric-row"><span class="metric-label">d(P₁, P₂) — Manhattan L₁</span><span class="metric-value" style="color:var(--accent-2)">${l1.toFixed(4)}</span></div>
        <div class="metric-row"><span class="metric-label">Produto escalar u·v</span><span class="metric-value" style="color:var(--accent-2)">${dot.toFixed(4)}</span></div>
        <div class="metric-row"><span class="metric-label">Ângulo entre retas</span><span class="metric-value" style="color:var(--accent-2)">${angBetween}°</span></div>
        <div class="metric-formula" style="--mc-color:var(--accent-2)"><span class="formula-step">L₂:</span>
d = √((${p0x}−${p1x})²+(${p0y}−${p1y})²) = <b>${l2.toFixed(4)}</b>

<span class="formula-step">u·v:</span>
= ${u0x}·${u1x} + ${u0y}·${u1y} = <b>${dot.toFixed(4)}</b>

<span class="formula-step">Ângulo:</span>
cos⁻¹(u·v / |u||v|) = <b>${angBetween}°</b></div>
      </div>`;
    }
  }

  /* 3D POINTS */
  else if(currentMode==='3d_points'){
    const pts=geom.map((el,i)=>({x:+el.querySelector('.px').value||0,y:+el.querySelector('.py').value||0,z:+el.querySelector('.pz').value||0,c:PALETTE[i%PALETTE.length],i}));
    pts.forEach(p=>{
      const mod=Math.sqrt(p.x**2+p.y**2+p.z**2);
      html+=`<div class="metric-card" style="--mc-color:${p.c}">
        <div class="metric-card-header"><div class="metric-title">Ponto ${p.i+1}</div></div>
        <div class="metric-row"><span class="metric-label">Coordenadas</span><span class="metric-value">(${p.x}, ${p.y}, ${p.z})</span></div>
        <div class="metric-row"><span class="metric-label">|OP| da origem</span><span class="metric-value">${mod.toFixed(4)}</span></div>
        <div class="metric-formula"><span class="formula-step">Distância à origem:</span>
|OP| = √(x²+y²+z²)
     = √(${p.x}²+${p.y}²+${p.z}²)
     = √(${p.x**2}+${p.y**2}+${p.z**2})
     = <b>${mod.toFixed(4)}</b></div>`;
      if(lam!==1){
        const sx=(p.x*lam).toFixed(3),sy=(p.y*lam).toFixed(3),sz=(p.z*lam).toFixed(3);
        const sm=Math.sqrt((p.x*lam)**2+(p.y*lam)**2+(p.z*lam)**2);
        html+=`<div class="scalar-section">
          <div class="scalar-section-title">λ = ${lam} aplicado</div>
          <div class="metric-row"><span class="metric-label">P' = λ·P</span><span class="metric-value">(${sx}, ${sy}, ${sz})</span></div>
          <div class="metric-row"><span class="metric-label">|OP'|</span><span class="metric-value">${sm.toFixed(4)}</span></div>
          <div class="metric-formula"><span class="formula-step">Escalonamento:</span>
P' = ${lam}·(${p.x}, ${p.y}, ${p.z}) = (${sx}, ${sy}, ${sz})
|OP'| = |λ|·|OP| = |${lam}|·${mod.toFixed(4)} = <b>${sm.toFixed(4)}</b></div>
        </div>`;
      }
      html+=`</div>`;
    });
    if(pts.length>=2){
      const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),zs=pts.map(p=>p.z);
      const c3=[avg(xs).toFixed(2),avg(ys).toFixed(2),avg(zs).toFixed(2)];
      const l2_01=Math.sqrt((xs[0]-xs[1])**2+(ys[0]-ys[1])**2+(zs[0]-zs[1])**2);
      const l1_01=Math.abs(xs[0]-xs[1])+Math.abs(ys[0]-ys[1])+Math.abs(zs[0]-zs[1]);
      html+=`<div class="metric-card relation">
        <div class="metric-title" style="color:var(--accent-2);margin-bottom:12px">Análise da Nuvem</div>
        <div class="metric-row"><span class="metric-label">Centróide</span><span class="metric-value" style="color:var(--accent-2)">(${c3.join(', ')})</span></div>
        <div class="metric-row"><span class="metric-label">d(P1,P2) — L₂</span><span class="metric-value" style="color:var(--accent-2)">${l2_01.toFixed(4)}</span></div>
        <div class="metric-row"><span class="metric-label">d(P1,P2) — L₁</span><span class="metric-value" style="color:var(--accent-2)">${l1_01.toFixed(4)}</span></div>
        <div class="metric-row"><span class="metric-label">Cov(X,Y)</span><span class="metric-value" style="color:var(--accent-2)">${cov(xs,ys).toFixed(4)}</span></div>
        <div class="metric-row"><span class="metric-label">Cov(X,Z)</span><span class="metric-value" style="color:var(--accent-2)">${cov(xs,zs).toFixed(4)}</span></div>
        <div class="metric-formula" style="--mc-color:var(--accent-2)"><span class="formula-step">L₂(P1,P2):</span>
d = √((${xs[0]}−${xs[1]})²+(${ys[0]}−${ys[1]})²+(${zs[0]}−${zs[1]})²)
  = <b>${l2_01.toFixed(4)}</b>

<span class="formula-step">Centróide:</span>
C = (Σx/n, Σy/n, Σz/n) = <b>(${c3.join(', ')})</b></div>
      </div>`;
    }
  }

  /* 3D LINES */
  else if(currentMode==='3d_lines'){
    geom.forEach((el,i)=>{
      const x1=+el.querySelector('.x1').value||0,y1=+el.querySelector('.y1').value||0,z1=+el.querySelector('.z1').value||0;
      const x2=+el.querySelector('.x2').value||0,y2=+el.querySelector('.y2').value||0,z2=+el.querySelector('.z2').value||0;
      const c=PALETTE[i%PALETTE.length], vx=x2-x1,vy=y2-y1,vz=z2-z1;
      const mod=Math.sqrt(vx*vx+vy*vy+vz*vz);
      html+=`<div class="metric-card" style="--mc-color:${c}">
        <div class="metric-card-header"><div class="metric-title">Reta ${i+1} — 3D</div></div>
        <div class="metric-row"><span class="metric-label">Ponto P₁</span><span class="metric-value">(${x1}, ${y1}, ${z1})</span></div>
        <div class="metric-row"><span class="metric-label">Ponto P₂</span><span class="metric-value">(${x2}, ${y2}, ${z2})</span></div>
        <div class="metric-row"><span class="metric-label">Vetor diretor v</span><span class="metric-value">(${vx}, ${vy}, ${vz})</span></div>
        <div class="metric-row"><span class="metric-label">Comprimento |v|</span><span class="metric-value">${mod.toFixed(4)}</span></div>
        <div class="metric-formula"><span class="formula-step">Vetor diretor:</span>
v = P₂ − P₁ = (${x2}−${x1}, ${y2}−${y1}, ${z2}−${z1})
  = <b>(${vx}, ${vy}, ${vz})</b>

<span class="formula-step">Comprimento (módulo):</span>
|v| = √(${vx}²+${vy}²+${vz}²)
    = √(${vx*vx}+${vy*vy}+${vz*vz})
    = <b>${mod.toFixed(4)}</b>

<span class="formula-step">Equação paramétrica:</span>
r(t) = P₁ + t·v
r(t) = (${x1}, ${y1}, ${z1}) + t·(${vx}, ${vy}, ${vz})</div>
      </div>`;
    });
  }

  if(html){body.innerHTML=html;card.classList.remove('hidden');}
  else card.classList.add('hidden');
}

/* ─── SURFACE CARD ─── */
function buildSurfaceCard(fnStr,rMin,rMax,res,zs,ys,xs){
  const card=document.getElementById('mathCard'),body=document.getElementById('mathCardBody');
  const mid=Math.floor(res/2);
  const samplePts=[{xi:0,yi:0},{xi:Math.floor(res/4),yi:Math.floor(res/4)},{xi:mid,yi:mid},{xi:res,yi:res}];
  let zMin=Infinity,zMax=-Infinity;
  zs.forEach(row=>row.forEach(v=>{if(isFinite(v)){zMin=Math.min(zMin,v);zMax=Math.max(zMax,v);}}));

  let html=`<div class="metric-card surface-explain">
    <div class="metric-title" style="color:var(--accent-4);margin-bottom:12px">Como Z é calculado</div>
    <div class="metric-formula" style="--mc-color:var(--accent-4)"><span class="formula-step">Função:</span>
Z = f(x, y) = ${fnStr}

<span class="formula-step">Para cada ponto (x, y) no grid [${rMin}, ${rMax}]²:</span>
Z é avaliado substituindo x e y na função.</div>
    <div style="margin-top:12px;font-size:11px;font-weight:700;color:var(--text-2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;">Exemplos calculados:</div>`;

  samplePts.forEach(({xi,yi})=>{
    const xv=xs[xi]??0,yv=ys[yi]??0,zv=(zs[xi]&&zs[xi][yi]!==undefined)?zs[xi][yi]:0;
    html+=`<div class="metric-row"><span class="metric-label">f(${xv.toFixed(2)}, ${yv.toFixed(2)})</span><span class="metric-value" style="color:var(--accent-4)">z = ${zv.toFixed(4)}</span></div>`;
  });
  html+=`</div>`;

  html+=`<div class="metric-card">
    <div class="metric-title" style="margin-bottom:12px">Estatísticas da Superfície</div>
    <div class="metric-row"><span class="metric-label">Domínio X, Y</span><span class="metric-value">[${rMin}, ${rMax}]</span></div>
    <div class="metric-row"><span class="metric-label">Grid de pontos</span><span class="metric-value">${res+1} × ${res+1}</span></div>
    <div class="metric-row"><span class="metric-label">Z mínimo</span><span class="metric-value">${zMin.toFixed(4)}</span></div>
    <div class="metric-row"><span class="metric-label">Z máximo</span><span class="metric-value">${zMax.toFixed(4)}</span></div>
    <div class="metric-row"><span class="metric-label">Amplitude ΔZ</span><span class="metric-value">${(zMax-zMin).toFixed(4)}</span></div>
  </div>`;

  body.innerHTML=html; card.classList.remove('hidden');
}

/* ─── RENDER ─── */
function renderPlot(){
  const th=TH();
  const items=document.querySelectorAll('#inputsContainer .item-row');
  const scalars=[...items].filter(i=>i.classList.contains('item-scalar'));
  const lam=scalars.reduce((f,el)=>f*(+el.querySelector('.scalar-val').value||1),1);
  const statsEl=document.getElementById('statsBar');
  const data=[],anns=[];

  const base={paper_bgcolor:th.paper,plot_bgcolor:th.bg,font:{family:"'Space Grotesk',sans-serif",color:th.text,size:12},margin:{l:50,r:30,t:30,b:50},showlegend:false,annotations:anns,uirevision:'stable'};
  const ax2={gridcolor:th.grid,zerolinecolor:th.zero,zerolinewidth:1.5,tickfont:{color:th.text,size:11,family:"'Space Mono',monospace"}};
  const ax3={...ax2,backgroundcolor:th.sceneBg,showbackground:true,showspikes:false};

  /* SURFACE */
  if(currentMode==='3d_surface'){
    try{
      const fnStr=document.getElementById('surfaceFn').value||'sin(x)*cos(y)';
      const style=document.getElementById('surfaceStyle').value;
      const rMin=+document.getElementById('rangeMin').value||-6;
      const rMax=+document.getElementById('rangeMax').value||6;
      const res=+document.getElementById('surfaceRes').value||40;
      const step=(rMax-rMin)/res;
      const fn=math.compile(fnStr);
      const xs=[],ys=[],zs=[];
      for(let i=0;i<=res;i++){
        const xv=rMin+i*step;xs.push(xv);const row=[];
        for(let j=0;j<=res;j++){const yv=rMin+j*step;if(i===0)ys.push(yv);try{row.push(fn.evaluate({x:xv,y:yv}));}catch{row.push(0);}}
        zs.push(row);
      }
      const csDark=[[0,'#12003a'],[.25,'#4a1080'],[.5,'#8b7bff'],[.75,'#3dffd8'],[1,'#e8fff8']];
      const csLight=[[0,'#042c53'],[.25,'#185fa5'],[.5,'#378add'],[.75,'#97c459'],[1,'#faeeda']];
      const cs=isDark?csDark:csLight;
      if(style==='surface'||style==='both') data.push({type:'surface',x:xs,y:ys,z:zs,colorscale:cs,contours:{z:{show:true,usecolormap:true,highlightcolor:isDark?'#fff':'#000',project:{z:true}}},showscale:true,opacity:style==='both'?.85:1,hovertemplate:'x:%{x:.3f}<br>y:%{y:.3f}<br>z:%{z:.3f}<extra></extra>'});
      if(style==='wireframe'||style==='both') data.push({type:'surface',x:xs,y:ys,z:zs,colorscale:[[0,PALETTE[0]],[1,PALETTE[1]]],showscale:false,opacity:style==='both'?.2:.88,surfacecolor:zs.map(row=>row.map(()=>0)),hidesurface:style==='both',contours:{x:{show:true,color:isDark?'rgba(139,123,255,0.4)':'rgba(86,68,224,0.3)',width:1},y:{show:true,color:isDark?'rgba(61,255,216,0.4)':'rgba(10,170,138,0.3)',width:1},z:{show:false}},hovertemplate:'x:%{x:.3f}<br>y:%{y:.3f}<br>z:%{z:.3f}<extra></extra>'});
      buildSurfaceCard(fnStr,rMin,rMax,res,zs,ys,xs);
      draw(data,{...base,scene:{xaxis:{...ax3,title:{text:'X',font:{color:th.text,size:12}}},yaxis:{...ax3,title:{text:'Y',font:{color:th.text,size:12}}},zaxis:{...ax3,title:{text:'Z',font:{color:th.text,size:12}}},bgcolor:th.bg,camera:{eye:{x:1.5,y:1.5,z:1.2}}},margin:{l:0,r:0,t:20,b:0}});
      statsEl.innerHTML=`<div class="stat-chip">Z = f(x,y) = <span class="val">${fnStr}</span></div>`;
      return;
    }catch(e){statsEl.innerHTML=`<div class="stat-chip" style="color:var(--accent-3)">Erro: ${e.message}</div>`;return;}
  }

  /* 2D LINES */
  if(currentMode==='2d_lines'){
    const geom=[...items].filter(i=>i.classList.contains('item-geom'));
    let statsHTML='';
    geom.forEach((el,i)=>{
      const x1=+el.querySelector('.x1').value||0,y1=+el.querySelector('.y1').value||0;
      const x2=+el.querySelector('.x2').value||0,y2=+el.querySelector('.y2').value||0;
      const c=PALETTE[i%PALETTE.length],vx=x2-x1,vy=y2-y1;
      const mod=Math.sqrt(vx*vx+vy*vy);
      // glow + line
      data.push({x:[x1,x2],y:[y1,y2],type:'scatter',mode:'lines',line:{color:c,width:14},opacity:.1,hoverinfo:'skip'});
      data.push({x:[x1,x2],y:[y1,y2],type:'scatter',mode:'lines',line:{color:c,width:2.5},hoverinfo:'skip'});
      // start marker
      data.push({x:[x1],y:[y1],type:'scatter',mode:'markers',marker:{size:10,color:c,line:{color:th.bg,width:2}},hovertemplate:`<b>Reta ${i+1} — P₁</b><br>(${x1}, ${y1})<extra></extra>`});
      // arrow annotation
      anns.push({x:x2,y:y2,ax:x1,ay:y1,xref:'x',yref:'y',axref:'x',ayref:'y',showarrow:true,arrowhead:3,arrowsize:1.8,arrowwidth:2.8,arrowcolor:c});
      // end marker
      data.push({x:[x2],y:[y2],type:'scatter',mode:'markers',marker:{size:7,color:c,symbol:'circle-open',line:{color:c,width:2}},hovertemplate:`<b>Reta ${i+1} — P₂</b><br>(${x2}, ${y2})<extra></extra>`});
      // module label
      anns.push({x:(x1+x2)/2,y:(y1+y2)/2,text:`|v${i+1}|=${mod.toFixed(2)}`,showarrow:false,font:{color:c,size:12,family:"'Space Mono',monospace"},bgcolor:isDark?'rgba(8,8,13,0.82)':'rgba(255,255,255,0.92)',bordercolor:c,borderwidth:1,borderpad:4,xshift:8,yshift:8});
      // scalar ghost
      if(lam!==1){
        const sx2=x1+vx*lam,sy2=y1+vy*lam,sm=(mod*Math.abs(lam)).toFixed(2);
        data.push({x:[x1,sx2],y:[y1,sy2],type:'scatter',mode:'lines',line:{color:c,width:2,dash:'dash'},opacity:.45,hoverinfo:'skip'});
        data.push({x:[sx2],y:[sy2],type:'scatter',mode:'markers',marker:{size:8,color:c,opacity:.7},hovertemplate:`<b>λ=${lam}</b><br>(${sx2.toFixed(2)}, ${sy2.toFixed(2)})<extra></extra>`});
        anns.push({x:sx2,y:sy2,ax:x1,ay:y1,xref:'x',yref:'y',axref:'x',ayref:'y',showarrow:true,arrowhead:2,arrowsize:1.2,arrowwidth:2,arrowcolor:c,opacity:.4});
        anns.push({x:sx2,y:sy2,text:`|v'|=${sm}`,showarrow:false,font:{color:c,size:11,family:"'Space Mono',monospace"},bgcolor:isDark?'rgba(8,8,13,0.75)':'rgba(255,255,255,0.88)',bordercolor:c,borderwidth:1,borderpad:3,xshift:8,yshift:-16});
      }
      statsHTML+=`<div class="stat-chip"><span style="color:${c}">v${i+1}</span> |v|=<span class="val">${mod.toFixed(2)}</span></div>`;
    });
    statsEl.innerHTML=statsHTML;
    buildMetricsCard(items,lam);
    draw(data,{...base,xaxis:{...ax2},yaxis:{...ax2,scaleanchor:'x'}});
  }

  /* 3D POINTS */
  else if(currentMode==='3d_points'){
    const geom=[...items].filter(i=>i.classList.contains('item-geom'));
    const xs=[],ys=[],zs=[],clrs=[],lbls=[];
    geom.forEach((el,i)=>{xs.push(+el.querySelector('.px').value||0);ys.push(+el.querySelector('.py').value||0);zs.push(+el.querySelector('.pz').value||0);clrs.push(PALETTE[i%PALETTE.length]);lbls.push(`P${i+1}`);});
    // halos
    data.push({x:xs,y:ys,z:zs,type:'scatter3d',mode:'markers',marker:{size:20,color:clrs,opacity:.07},hoverinfo:'skip'});
    data.push({x:xs,y:ys,z:zs,type:'scatter3d',mode:'markers',marker:{size:13,color:clrs,opacity:.14},hoverinfo:'skip'});
    // axis projection lines per point
    xs.forEach((x,i)=>{
      const y=ys[i],z=zs[i];
      data.push({x:[x,0],y:[y,y],z:[z,z],type:'scatter3d',mode:'lines',line:{color:'#ff4466',width:2,dash:'dot'},opacity:.65,hoverinfo:'skip',name:`P${i+1}→X`});
      data.push({x:[x,x],y:[y,0],z:[z,z],type:'scatter3d',mode:'lines',line:{color:'#44ff88',width:2,dash:'dot'},opacity:.65,hoverinfo:'skip',name:`P${i+1}→Y`});
      data.push({x:[x,x],y:[y,y],z:[z,0],type:'scatter3d',mode:'lines',line:{color:'#4488ff',width:2,dash:'dot'},opacity:.65,hoverinfo:'skip',name:`P${i+1}→Z`});
    });
    // main
    data.push({x:xs,y:ys,z:zs,type:'scatter3d',mode:'markers+text',text:lbls,textposition:'top right',textfont:{family:"'Space Mono',monospace",size:13,color:clrs},marker:{size:11,color:clrs,line:{width:2,color:clrs.map(c=>c+'66')}},hovertemplate:'<b>%{text}</b><br>x=%{x}, y=%{y}, z=%{z}<br><i>Linhas: 🔴→X 🟢→Y 🔵→Z</i><extra></extra>'});
    // pair lines
    for(let a=0;a<xs.length-1;a++) for(let b=a+1;b<xs.length;b++){
      const d=Math.sqrt((xs[a]-xs[b])**2+(ys[a]-ys[b])**2+(zs[a]-zs[b])**2);
      const mc=PALETTE[a%PALETTE.length];
      data.push({x:[xs[a],xs[b]],y:[ys[a],ys[b]],z:[zs[a],zs[b]],type:'scatter3d',mode:'lines',line:{color:mc,width:2,dash:'dot'},opacity:.35,hoverinfo:'skip'});
      data.push({x:[(xs[a]+xs[b])/2],y:[(ys[a]+ys[b])/2],z:[(zs[a]+zs[b])/2],type:'scatter3d',mode:'text',text:[`d=${d.toFixed(2)}`],textfont:{color:mc,size:10,family:"'Space Mono',monospace"},hoverinfo:'skip'});
    }
    // scalar
    if(lam!==1){
      const sxs=xs.map(v=>v*lam),sys=ys.map(v=>v*lam),szs=zs.map(v=>v*lam);
      data.push({x:sxs,y:sys,z:szs,type:'scatter3d',mode:'markers',marker:{size:8,color:clrs,opacity:.5,symbol:'diamond'},hovertemplate:'λ=%{customdata}<br>(%{x:.2f},%{y:.2f},%{z:.2f})<extra></extra>',customdata:Array(xs.length).fill(lam)});
      xs.forEach((_,i)=>data.push({x:[xs[i],sxs[i]],y:[ys[i],sys[i]],z:[zs[i],szs[i]],type:'scatter3d',mode:'lines',line:{color:clrs[i],width:2,dash:'dot'},opacity:.3,hoverinfo:'skip'}));
    }
    statsEl.innerHTML=xs.map((_,i)=>`<div class="stat-chip"><span style="color:${clrs[i]}">P${i+1}</span> (<span class="val">${xs[i]}, ${ys[i]}, ${zs[i]}</span>)</div>`).join('');
    buildMetricsCard(items,lam);
    draw(data,{...base,scene:{xaxis:{...ax3,title:{text:'X',font:{color:th.text}}},yaxis:{...ax3,title:{text:'Y',font:{color:th.text}}},zaxis:{...ax3,title:{text:'Z',font:{color:th.text}}},bgcolor:th.bg,camera:{eye:{x:1.5,y:1.5,z:1.2}}},margin:{l:0,r:0,t:20,b:0}});
  }

  /* 3D LINES — with arrow cones showing direction */
  else if(currentMode==='3d_lines'){
    const geom=[...items].filter(i=>i.classList.contains('item-geom'));
    let statsHTML='';
    geom.forEach((el,i)=>{
      const x1=+el.querySelector('.x1').value||0,y1=+el.querySelector('.y1').value||0,z1=+el.querySelector('.z1').value||0;
      const x2=+el.querySelector('.x2').value||0,y2=+el.querySelector('.y2').value||0,z2=+el.querySelector('.z2').value||0;
      const c=PALETTE[i%PALETTE.length];
      const dx=x2-x1,dy=y2-y1,dz=z2-z1;
      const mod=Math.sqrt(dx*dx+dy*dy+dz*dz)||1;
      const ext=.45;
      const ex1=x1-dx*ext,ey1=y1-dy*ext,ez1=z1-dz*ext;
      const ex2=x2+dx*ext,ey2=y2+dy*ext,ez2=z2+dz*ext;
      const modFull=Math.sqrt(dx*dx+dy*dy+dz*dz);
      // glow
      data.push({x:[ex1,ex2],y:[ey1,ey2],z:[ez1,ez2],type:'scatter3d',mode:'lines',line:{color:c,width:18},opacity:.07,hoverinfo:'skip'});
      // ghost extension
      data.push({x:[ex1,ex2],y:[ey1,ey2],z:[ez1,ez2],type:'scatter3d',mode:'lines',line:{color:c,width:4},opacity:.22,hoverinfo:'skip'});
      // core
      data.push({x:[x1,x2],y:[y1,y2],z:[z1,z2],type:'scatter3d',mode:'lines',line:{color:c,width:6},name:`Reta ${i+1}`,hoverinfo:'skip'});
      // endpoints
      data.push({x:[x1,x2],y:[y1,y2],z:[z1,z2],type:'scatter3d',mode:'markers+text',text:[`P${i*2+1}`,`P${i*2+2}`],textposition:'top right',textfont:{color:c,size:11,family:"'Space Mono',monospace"},marker:{size:[9,7],color:[c,c],symbol:['circle','circle-open'],line:{width:2,color:c}},hovertemplate:`<b>Reta ${i+1}</b><br>(%{x:.2f}, %{y:.2f}, %{z:.2f})<extra></extra>`});
      // ARROW CONE at midpoint toward P2
      const normX=dx/mod,normY=dy/mod,normZ=dz/mod;
      const arrowT=0.65; // place arrow 65% along line
      const ax=x1+dx*arrowT,ay=y1+dy*arrowT,az=z1+dz*arrowT;
      data.push({type:'cone',x:[ax],y:[ay],z:[az],u:[normX],v:[normY],w:[normZ],sizemode:'absolute',sizeref:0.8,anchor:'tail',colorscale:[[0,c],[1,c]],showscale:false,opacity:.95,hoverinfo:'skip'});
      // midpoint label
      data.push({x:[(x1+x2)/2],y:[(y1+y2)/2],z:[(z1+z2)/2],type:'scatter3d',mode:'text',text:[`|v${i+1}|=${modFull.toFixed(2)}`],textfont:{color:c,size:10,family:"'Space Mono',monospace"},hoverinfo:'skip'});
      statsHTML+=`<div class="stat-chip"><span style="color:${c}">v${i+1}</span> |v|=<span class="val">${modFull.toFixed(2)}</span></div>`;
    });
    statsEl.innerHTML=statsHTML;
    buildMetricsCard(items,lam);
    draw(data,{...base,scene:{xaxis:{...ax3,title:{text:'X',font:{color:th.text}}},yaxis:{...ax3,title:{text:'Y',font:{color:th.text}}},zaxis:{...ax3,title:{text:'Z',font:{color:th.text}}},bgcolor:th.bg,camera:{eye:{x:1.5,y:1.5,z:1.2}}},margin:{l:0,r:0,t:20,b:0}});
  }
}

/* ─── DRAW ─── */
function draw(d,layout){
  const cfg={responsive:true,displayModeBar:false,scrollZoom:true};
  if(!plotReady){Plotly.newPlot('plot',d,layout,cfg);plotReady=true;}
  else Plotly.react('plot',d,layout,cfg);
}

/* ─── CALCULATOR ─── */
function parseVec(id){const s=document.getElementById(id).value;if(!s)return null;return s.split(',').map(n=>parseFloat(n.trim()));}
function calcVector(op){
  const box=document.getElementById('vecResult');
  try{
    const a=parseVec('vecA'),b=parseVec('vecB');
    if(!a||!b||a.length!==b.length) throw new Error('Vetores de mesma dimensão.');
    if(op==='add') box.textContent=`u + v = [${math.add(a,b).map(v=>v.toFixed(4)).join(', ')}]`;
    else if(op==='sub') box.textContent=`u - v = [${math.subtract(a,b).map(v=>v.toFixed(4)).join(', ')}]`;
    else if(op==='dot') box.textContent=`u · v = ${math.dot(a,b).toFixed(6)}`;
  }catch(e){box.textContent=`Erro: ${e.message}`;}
}
function calcDistance(){
  const box=document.getElementById('vecResult');
  try{
    const a=parseVec('vecA'),b=parseVec('vecB');
    if(!a||!b||a.length!==b.length) throw new Error('Vetores de mesma dimensão.');
    box.textContent=`L₂ (Euclidiana): ${math.distance(a,b).toFixed(6)}\nL₁ (Manhattan):  ${a.reduce((s,v,i)=>s+Math.abs(v-b[i]),0).toFixed(6)}`;
  }catch(e){box.textContent=`Erro: ${e.message}`;}
}
function calcMatrix(op){
  const box=document.getElementById('matResult');
  try{
    const m=JSON.parse(document.getElementById('matA').value);
    const sz=math.size(m);
    if(op==='transpose') box.textContent=`Aᵀ =\n${JSON.stringify(math.transpose(m)).replace(/],/g,'],\n ')}`;
    else if(op==='det'){if(sz[0]!==sz[1]){box.textContent=`Erro: matriz quadrada necessária.\nAtual: ${sz[0]}×${sz[1]}`;return;}box.textContent=`|A| = ${math.det(m).toFixed(6)}`;}
    else if(op==='shape') box.textContent=`Dimensões: ${sz[0]}×${sz[1]}\nTipo: ${sz[0]===sz[1]?'Quadrada':'Retangular'}\nElementos: ${sz[0]*sz[1]}`;
  }catch(e){box.textContent='Erro: JSON inválido. Ex: [[1,2],[3,4]]';}
}
function exportResults(){
  const v=document.getElementById('vecResult').textContent,m=document.getElementById('matResult').textContent;
  const blob=new Blob([`=== LinearViz Engine — Relatório ===\n\n[VETORES]\n${v}\n\n[MATRIZES]\n${m}`],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='linearviz.txt';a.click();URL.revokeObjectURL(a.href);
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded',()=>{
  initDraggable();
  createInputRow('geom');
  createInputRow('geom');
  setTimeout(renderPlot,80);
});
