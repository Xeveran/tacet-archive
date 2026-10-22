(() => {
  'use strict';
  const STORAGE_KEY = 'tacetArchive_v1';
  const ELEMENTS = ['Aero', 'Glacio', 'Fusion', 'Electro', 'Havoc', 'Spectro'];
  const ELEMENT_COLORS = { Aero: '#a3c9bb', Glacio: '#8cc9ed', Fusion: '#eea18b', Electro: '#c6a3ed', Havoc: '#e58ca5', Spectro: '#ebd68f' };
  const GAME_DB = window.TACET_GAME_DB || { characters:[], weapons:[], items:[], expItems:[], curves:{} };
  const CATALOG = GAME_DB.characters.map(c => ({ name:c.name, element:c.element, weapon:c.weaponType, rarity:c.rarity }));
  const WEAPON_CATALOG = GAME_DB.weapons || [];
  const LEVEL_BREAKPOINTS = ['1','20','20◆','40','40◆','50','50◆','60','60◆','70','70◆','80','80◆','90'];
  const INVENTORY_TYPES = ['All material groups','Free Materials','Waveplates Materials','Development Material','Resource','Skill Upgrade Material'];
  const DEFAULT_OWNED = [
    { name:'Jinhsi', level:90, chain:2, weapon:'Broadblade', element:'Spectro', rarity:5, status:'Built', role:'Main DPS', notes:'', forte:10 },
    { name:'Shorekeeper', level:90, chain:1, weapon:'Rectifier', element:'Spectro', rarity:5, status:'Built', role:'Support', notes:'', forte:8 },
    { name:'Changli', level:90, chain:1, weapon:'Sword', element:'Fusion', rarity:5, status:'Building', role:'Main DPS', notes:'Finish skill investment', forte:9 },
    { name:'Camellya', level:90, chain:1, weapon:'Sword', element:'Havoc', rarity:5, status:'Built', role:'Main DPS', notes:'', forte:10 },
    { name:'Carlotta', level:80, chain:1, weapon:'Pistols', element:'Glacio', rarity:5, status:'Building', role:'Main DPS', notes:'Ascend to 90', forte:8 },
    { name:'Zani', level:80, chain:1, weapon:'Gauntlets', element:'Spectro', rarity:5, status:'Building', role:'Main DPS', notes:'', forte:8 },
    { name:'Cartethyia', level:90, chain:1, weapon:'Sword', element:'Aero', rarity:5, status:'Built', role:'Main DPS', notes:'', forte:10 },
    { name:'Mornye', level:80, chain:1, weapon:'Broadblade', element:'Fusion', rarity:5, status:'Building', role:'Support', notes:'', forte:8 },
    { name:'Chisa', level:80, chain:1, weapon:'Sword', element:'Havoc', rarity:5, status:'Building', role:'Sub DPS', notes:'', forte:8 },
    { name:'Suisui', level:80, chain:0, weapon:'Rectifier', element:'Glacio', rarity:5, status:'Building', role:'Support', notes:'', forte:7 },
    { name:'Jiyan', level:80, chain:1, weapon:'Broadblade', element:'Aero', rarity:5, status:'Building', role:'Main DPS', notes:'', forte:8 },
    { name:'Iuno', level:70, chain:0, weapon:'Gauntlets', element:'Aero', rarity:5, status:'Planned', role:'Sub DPS', notes:'', forte:6 }
  ];
  const DEFAULT_STATE = {
    account: { name:'Rover', uid:'' },
    resonators: DEFAULT_OWNED,
    weapons: [
      { id:'w1', name:'Red Spring', level:90, goalLevel:90, rarity:5, type:'Sword', status:'Built', assigned:'Camellya', includeInPlanner:true, notes:'' },
      { id:'w2', name:'Blazing Justice', level:80, goalLevel:90, rarity:5, type:'Gauntlets', status:'Building', assigned:'Zani', includeInPlanner:true, notes:'Ascend to 90' },
      { id:'w3', name:"Firstlight's Herald", level:70, goalLevel:90, rarity:5, type:'Sword', status:'Building', assigned:'Chisa', includeInPlanner:true, notes:'' }
    ],
    goals: [
      { id:'g1', name:'Carlotta', objective:'Raise Resonator to Lv. 90', category:'Resonator', status:'In progress', progress:70, note:'Gather remaining ascension materials' },
      { id:'g2', name:'Mornye', objective:'Upgrade key Forte skills', category:'Skills', status:'Planned', progress:20, note:'' }
    ],
    materials: {},
    resources: { 'Shell Credits': 2845000 },
    settings: { showHints:true }
  };
  let state = loadState();
  let activePage = 'overview';
  let resonatorFilter = 'All';
  let resonatorSearch = '';
  let weaponSearch = '';
  let inventorySearch = '';
  let inventoryType = 'All material groups';
  let plannerShowComplete = false;
  let modalKind = null;

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return normalizeState(clone(DEFAULT_STATE));
      const parsed = JSON.parse(stored);
      return normalizeState(parsed);
    } catch { return normalizeState(clone(DEFAULT_STATE)); }
  }
  function levelNumber(value) {
    const n = Number.parseInt(String(value ?? '1').replace(/◆/g, ''), 10);
    return Number.isFinite(n) ? n : 1;
  }
  function levelIndex(value) {
    const text = String(value ?? '1');
    const exact = LEVEL_BREAKPOINTS.indexOf(text);
    if (exact >= 0) return exact;
    const numeric = String(levelNumber(text));
    const plain = LEVEL_BREAKPOINTS.indexOf(numeric);
    if (plain >= 0) return plain;
    let best = 0;
    for (let i = 1; i < LEVEL_BREAKPOINTS.length; i++) {
      const d = Math.abs(levelNumber(LEVEL_BREAKPOINTS[i]) - levelNumber(text));
      const bd = Math.abs(levelNumber(LEVEL_BREAKPOINTS[best]) - levelNumber(text));
      if (d < bd || (d === bd && (text.includes('◆') ? (LEVEL_BREAKPOINTS[i].includes('◆') && !LEVEL_BREAKPOINTS[best].includes('◆')) : (!LEVEL_BREAKPOINTS[i].includes('◆') && LEVEL_BREAKPOINTS[best].includes('◆'))))) best = i;
    }
    return best;
  }
  function normalizedBreakpoint(value, fallback='1') {
    if (value == null || value === '') return normalizedBreakpoint(fallback, '1');
    const text = String(value);
    if (LEVEL_BREAKPOINTS.includes(text)) return text;
    const numeric = String(levelNumber(text));
    if (LEVEL_BREAKPOINTS.includes(numeric)) return numeric;
    return LEVEL_BREAKPOINTS[levelIndex(text)] || '1';
  }
  function levelAfter(a, b) { return levelIndex(a) > levelIndex(b); }
  function maxLevelStep(a, b) { return levelAfter(a, b) ? normalizedBreakpoint(a) : normalizedBreakpoint(b); }
  function normalizeState(input) {
    const parsed = input || {};
    const clean = { ...parsed };
    delete clean.echoes; delete clean.convene; delete clean.tasks;
    const base = clone(DEFAULT_STATE);
    const resonators = (Array.isArray(parsed.resonators) ? parsed.resonators : clone(DEFAULT_STATE.resonators)).map(r => {
      const level = normalizedBreakpoint(r.level, '1');
      const target = r.goalLevel != null ? normalizedBreakpoint(r.goalLevel, level) : (r.status === 'Built' ? level : '90');
      return { ...r, level, goalLevel: maxLevelStep(level, target), includeInPlanner: r.includeInPlanner !== false };
    });
    const weapons = (Array.isArray(parsed.weapons) ? parsed.weapons : clone(DEFAULT_STATE.weapons)).map((w,i) => {
      const level = normalizedBreakpoint(w.level, '1');
      const target = w.goalLevel != null ? normalizedBreakpoint(w.goalLevel, level) : (w.status === 'Built' ? level : '90');
      return { ...w, id:w.id || `w_migrated_${i}_${String(w.name||'weapon').replace(/\W/g,'')}`, level, goalLevel:maxLevelStep(level,target), includeInPlanner:w.includeInPlanner !== false, rarity:Number(w.rarity)===4?4:5 };
    });
    const goals = (Array.isArray(parsed.goals) ? parsed.goals : clone(DEFAULT_STATE.goals)).filter(g => g.category !== 'Echoes');
    const parsedCredits = Number(parsed.resources?.['Shell Credits']);
    return {
      ...base, ...clean,
      account: { ...base.account, ...(parsed.account || {}) },
      resonators, weapons, goals,
      materials: { ...(parsed.materials || {}) },
      resources: { 'Shell Credits': Number.isFinite(parsedCredits) ? Math.max(0, parsedCredits) : base.resources['Shell Credits'] },
      settings: { ...base.settings, ...(parsed.settings || {}) }
    };
  }
  function saveState(showToast = false) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { toast('Could not save locally. Export a backup and free browser storage.', true); }
    updateSidebarCounts();
    if (showToast) toast('Changes saved in this browser.');
  }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function fmt(num) { return Number(num || 0).toLocaleString('en-US'); }
  function id(prefix='id') { return prefix + '_' + Math.random().toString(36).slice(2,9); }
  function initials(name) { return String(name).replace(/\s*\(.*?\)/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('').toUpperCase(); }
  function elementColor(el) { return ELEMENT_COLORS[el] || '#b0b8c4'; }
  function resByName(name) { return state.resonators.find(r => r.name === name); }
  function catalogByName(name) { return CATALOG.find(r => r.name === name || (name === 'Shorekeeper' && r.name === 'The Shorekeeper')); }
  function weaponByName(name) { return WEAPON_CATALOG.find(w => w.name.toLowerCase() === String(name||'').toLowerCase()); }
  function allRoster() { return [...state.resonators].sort((a,b) => a.name.localeCompare(b.name)); }
  function toast(message, error=false) {
    const region = document.getElementById('toastRegion'); const node = document.createElement('div');
    node.className = 'toast' + (error ? ' error' : ''); node.textContent = message; region.appendChild(node);
    setTimeout(() => node.remove(), 3300);
  }
  const CHARACTER_ASCENSION = [
    { from:20,to:40, enemyTier:0,enemyQty:4,boss:0,local:0,credits:5000 },
    { from:40,to:50, enemyTier:1,enemyQty:4,boss:3,local:4,credits:10000 },
    { from:50,to:60, enemyTier:1,enemyQty:8,boss:6,local:8,credits:15000 },
    { from:60,to:70, enemyTier:2,enemyQty:4,boss:9,local:12,credits:20000 },
    { from:70,to:80, enemyTier:2,enemyQty:8,boss:12,local:16,credits:40000 },
    { from:80,to:90, enemyTier:3,enemyQty:4,boss:16,local:20,credits:80000 }
  ];
  const WEAPON_ASCENSION = [
    { from:20,to:40, enemyTier:0,enemyQty4:5,enemyQty5:6,weaponTier:-1,weaponQty4:0,weaponQty5:0,credits4:8000,credits5:10000 },
    { from:40,to:50, enemyTier:1,enemyQty4:5,enemyQty5:6,weaponTier:0,weaponQty4:5,weaponQty5:6,credits4:16000,credits5:20000 },
    { from:50,to:60, enemyTier:2,enemyQty4:4,enemyQty5:4,weaponTier:1,weaponQty4:7,weaponQty5:8,credits4:32000,credits5:40000 },
    { from:60,to:70, enemyTier:2,enemyQty4:5,enemyQty5:6,weaponTier:2,weaponQty4:5,weaponQty5:6,credits4:48000,credits5:60000 },
    { from:70,to:80, enemyTier:3,enemyQty4:4,enemyQty5:4,weaponTier:3,weaponQty4:7,weaponQty5:8,credits4:64000,credits5:80000 },
    { from:80,to:90, enemyTier:3,enemyQty4:7,enemyQty5:8,weaponTier:3,weaponQty4:10,weaponQty5:12,credits4:96000,credits5:120000 }
  ];
  function characterData(r) { return (GAME_DB.characters||[]).find(c => c.name === r.name || (r.name === 'Shorekeeper' && c.name === 'The Shorekeeper')); }
  function weaponData(w) { return (GAME_DB.weapons||[]).find(x => x.name.toLowerCase() === String(w.name||'').toLowerCase()); }
  function curveValue(curve, level) {
    const n = levelNumber(level);
    const points = Object.entries(curve || {}).map(([k,v]) => ({ level:Number(k), value:Number(v)||0 })).filter(p => Number.isFinite(p.level)).sort((a,b)=>a.level-b.level);
    if (!points.length) return 0;
    const exact = points.find(p=>p.level===n); if (exact) return exact.value;
    let lower = points[0], upper = points[points.length-1];
    for (const point of points) {
      if (point.level < n) lower = point;
      if (point.level > n) { upper = point; break; }
    }
    if (upper.level === lower.level) return lower.value;
    return Math.round(lower.value + (upper.value-lower.value) * ((n-lower.level)/(upper.level-lower.level)));
  }
  function crossedAscension(fromStep, toStep, ascensionLevel) {
    const markerIndex = levelIndex(`${ascensionLevel}◆`);
    return levelIndex(fromStep) < markerIndex && levelIndex(toStep) >= markerIndex;
  }
  function itemGroup(item) {
    const type = String(item?.type || 'Other Materials');
    if (type.includes('(Free)')) return 'Free Materials';
    if (type.includes('(Waveplates)')) return 'Waveplates Materials';
    return type;
  }
  function assetSlug(name) {
    return String(name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }
  function assetImage(folder, name, className='') {
    const src = `assets/images/${folder}/${assetSlug(name)}.png`;
    return `<img class="${className}" src="${src}" alt="" loading="lazy" onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">`;
  }
  function itemByName(name) { return (GAME_DB.items || []).find(x => x.name === name); }
  function inventoryGroupItems(items) { return items.reduce((groups,item)=>{const group=itemGroup(item);(groups[group] ||= []).push(item);return groups;},{}); }

  function addBreakdownItem(map, itemName, amount, stage) {
    const item = String(itemName || '').trim(); const qty = Number(amount)||0;
    if (!item || qty <= 0) return;
    if (!map[item]) map[item] = { name:item, quantity:0, stages:[] };
    map[item].quantity += qty;
    if (stage) map[item].stages.push({ stage, quantity:qty });
  }
  function expBreakdown(points, weapon=false) {
    let remainder = Math.max(0, Math.round(points/1000)*1000); const result = {};
    const prefix = weapon ? 'Energy Core' : 'Resonance Potion';
    const rows = [
      { name:`Premium ${prefix}`, value:20000 }, { name:`Advanced ${prefix}`, value:8000 },
      { name:`Medium ${prefix}`, value:3000 }, { name:`Basic ${prefix}`, value:1000 }
    ];
    rows.forEach(x => { const qty = Math.floor(remainder/x.value); if (qty) { result[x.name]=qty; remainder-=qty*x.value; } });
    if (remainder > 0) result[`Basic ${prefix}`]=(result[`Basic ${prefix}`]||0)+Math.ceil(remainder/1000);
    return result;
  }
  function calculateResonatorRequirements(r) {
    const out = {}; const db = characterData(r); const from = normalizedBreakpoint(r.level,'1'); const to = normalizedBreakpoint(r.goalLevel,from);
    const fromIdx = levelIndex(from), toIdx = levelIndex(to); const fromNum = levelNumber(from), toNum = levelNumber(to);
    if (toIdx <= fromIdx) return out;
    const curves = GAME_DB.curves || {};
    const xp = Math.max(0,curveValue(curves.characterExp,toNum)-curveValue(curves.characterExp,fromNum));
    Object.entries(expBreakdown(xp,false)).forEach(([name,qty])=>addBreakdownItem(out,name,qty,`Level ${from} → ${to}`));
    addBreakdownItem(out,'Shell Credit',Math.max(0,curveValue(curves.characterCredit,toNum)-curveValue(curves.characterCredit,fromNum)),`Level ${from} → ${to} leveling`);
    CHARACTER_ASCENSION.forEach(stage=>{
      if (!crossedAscension(from,to,stage.from)) return;
      if (db) {
        addBreakdownItem(out,db.enemyMats[stage.enemyTier],stage.enemyQty,`Ascend at Lv. ${stage.from}`);
        addBreakdownItem(out,db.bossMat,stage.boss,`Ascend at Lv. ${stage.from}`);
        addBreakdownItem(out,db.localMat,stage.local,`Ascend at Lv. ${stage.from}`);
      }
      addBreakdownItem(out,'Shell Credit',stage.credits,`Ascend at Lv. ${stage.from}`);
    });
    return out;
  }
  function calculateWeaponRequirements(w) {
    const out = {}; const db = weaponData(w); const from = normalizedBreakpoint(w.level,'1'); const to = normalizedBreakpoint(w.goalLevel,from);
    const fromIdx = levelIndex(from), toIdx = levelIndex(to); const fromNum = levelNumber(from), toNum = levelNumber(to);
    if (toIdx <= fromIdx) return out;
    const rarity = Number(db?.rarity || w.rarity) === 4 ? 4 : 5; const curves=GAME_DB.curves||{};
    const xpCurve = rarity===4 ? curves.weaponExp4 : curves.weaponExp5; const creditCurve = rarity===4 ? curves.weaponCredit4 : curves.weaponCredit5;
    const xp=Math.max(0,curveValue(xpCurve,toNum)-curveValue(xpCurve,fromNum));
    Object.entries(expBreakdown(xp,true)).forEach(([name,qty])=>addBreakdownItem(out,name,qty,`Level ${from} → ${to}`));
    addBreakdownItem(out,'Shell Credit',Math.max(0,curveValue(creditCurve,toNum)-curveValue(creditCurve,fromNum)),`Level ${from} → ${to} leveling`);
    WEAPON_ASCENSION.forEach(stage=>{
      if (!crossedAscension(from,to,stage.from)) return;
      if (db) {
        const enemyQty=rarity===4?stage.enemyQty4:stage.enemyQty5;
        addBreakdownItem(out,db.enemyMats[stage.enemyTier],enemyQty,`Ascend at Lv. ${stage.from}`);
        const weaponQty=rarity===4?stage.weaponQty4:stage.weaponQty5;
        if (stage.weaponTier >= 0) addBreakdownItem(out,db.weaponMats[stage.weaponTier],weaponQty,`Ascend at Lv. ${stage.from}`);
      }
      addBreakdownItem(out,'Shell Credit',rarity===4?stage.credits4:stage.credits5,`Ascend at Lv. ${stage.from}`);
    });
    return out;
  }
  function inventoryOwned(itemName) {
    if (itemName === 'Shell Credit') return Math.max(0,Number(state.resources?.['Shell Credits'])||0);
    if (Object.prototype.hasOwnProperty.call(state.materials||{},itemName)) return Math.max(0,Number(state.materials[itemName])||0);
    return 0;
  }
  function allPlanningUnits() {
    const res = state.resonators.filter(r=>r.includeInPlanner!==false && levelAfter(r.goalLevel,r.level)).map(r=>({ ...r, unitType:'resonator', plannerId:`res:${r.name}`, breakdown:calculateResonatorRequirements(r) }));
    const weapons = (state.weapons||[]).filter(w=>w.includeInPlanner!==false && levelAfter(w.goalLevel,w.level)).map(w=>({ ...w, unitType:'weapon', plannerId:`weapon:${w.id||w.name}`, breakdown:calculateWeaponRequirements(w) }));
    return [...res,...weapons];
  }
  function aggregateRequirements(units=allPlanningUnits()) {
    const aggregate = {};
    units.forEach(unit=>Object.values(unit.breakdown).forEach(item=>{
      if (!aggregate[item.name]) aggregate[item.name]={name:item.name,required:0,sources:[],stages:[]};
      aggregate[item.name].required += item.quantity;
      aggregate[item.name].stages.push(...item.stages);
      if (!aggregate[item.name].sources.some(x=>x.plannerId===unit.plannerId)) aggregate[item.name].sources.push(unit);
    }));
    return Object.values(aggregate).map(item=>({...item,owned:inventoryOwned(item.name),remaining:Math.max(0,item.required-inventoryOwned(item.name)),type:itemGroup(itemByName(item.name)||{type:'Universal Currency'})})).sort((a,b)=>b.remaining-a.remaining || a.name.localeCompare(b.name));
  }
  function breakdownMarkup(breakdown) {
    const rows=Object.values(breakdown).filter(x=>x.quantity>0).sort((a,b)=>a.name.localeCompare(b.name));
    if(!rows.length)return '<p class="form-hint">No upgrade items needed for the selected level range.</p>';
    return `<div class="breakdown-list">${rows.map(x=>`<div class="breakdown-row"><span>${esc(x.name)}<small>${[...new Set(x.stages.map(s=>s.stage))].join(' · ')}</small></span><strong>×${fmt(x.quantity)}</strong></div>`).join('')}</div>`;
  }
  function materialUnitIcon(unit) {
    const isWeapon=unit.unitType==='weapon'; const col=isWeapon?'#dfb877':elementColor(unit.element); const folder=isWeapon?'weapons':'resonators';
    return `<span class="need-by-icon ${isWeapon?'weapon-icon':''}" style="--unit-color:${col}" title="${esc(unit.name)} · Lv. ${esc(unit.level)} → ${esc(unit.goalLevel)}" aria-label="${esc(unit.name)}"><span class="need-by-placeholder">${esc(initials(unit.name))}</span>${assetImage(folder,unit.name,'need-by-art')}</span>`;
  }
  function plannerUnitBreakdown(unit) {
    return `<details class="unit-breakdown"><summary>Required items <span>${Object.keys(unit.breakdown).length}</span></summary>${breakdownMarkup(unit.breakdown)}</details>`;
  }
  function updateSidebarCounts() {
    document.getElementById('resonatorNavCount').textContent = state.resonators.length;
    const weaponCount=document.getElementById('weaponNavCount'); if(weaponCount) weaponCount.textContent = state.weapons.length;
    document.getElementById('accountNameTop').textContent = state.account.name || 'Rover';
  }
  function titleFor(page) { return ({overview:'OVERVIEW',resonators:'RESONATORS',weapons:'WEAPONS',planner:'PLANNER',inventory:'INVENTORY',settings:'SETTINGS & DATA'})[page] || 'OVERVIEW'; }
  function setPage(page) {
    activePage = page;
    document.querySelectorAll('.nav-item[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    document.getElementById('breadcrumbPage').textContent = titleFor(page);
    document.getElementById('sidebar').classList.remove('mobile-open');
    renderPage(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function pageHeading(eyebrow, title, desc, actions='') { return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${desc}</p></div><div class="heading-actions">${actions}</div></div>`; }
  function button(label, attrs='', kind='') { return `<button class="btn ${kind}" ${attrs}>${label}</button>`; }
  function statusPill(status) { const cls = status === 'Built' || status === 'Complete' ? 'mint' : status === 'Building' || status === 'In progress' ? 'gold' : status === 'Planned' ? 'gray' : 'red'; return `<span class="pill ${cls}">${esc(status)}</span>`; }
  function resCard(r, showBreakdown=false) {
    const color = elementColor(r.element); const built = r.status === 'Built'; const advancing=levelAfter(r.goalLevel,r.level);
    const card=`<button class="res-card" data-edit-res="${esc(r.name)}" style="--element:${color}" aria-label="Edit ${esc(r.name)}">
      <div class="res-art"><span class="rarity-stars">${'✦'.repeat(Math.max(1,Math.min(5,Number(r.rarity)||5)))}</span><span class="res-status">${esc(r.status || 'Planned')}</span><span class="res-glyph">${esc(initials(r.name))}</span>${assetImage('resonators',r.name,'res-portrait')}</div>
      <div class="res-card-copy"><div class="res-card-name"><span>${esc(r.name)}</span><span class="res-card-level">Lv. ${esc(normalizedBreakpoint(r.level,'1'))}${advancing?` → ${esc(normalizedBreakpoint(r.goalLevel,r.level))}`:''}</span></div><div class="res-card-sub"><span><i class="element-dot" style="--element:${color}"></i>${esc(r.element || 'Unknown')}</span><span>${built ? 'Build ready' : (r.role || 'Unassigned')}</span></div></div>
    </button>`;
    if (!showBreakdown) return card;
    const detail=calculateResonatorRequirements(r);
    return `<div class="unit-stack">${card}${advancing?`<details class="unit-breakdown"><summary>${esc(r.level)} → ${esc(r.goalLevel)} materials <span>${Object.keys(detail).length}</span></summary>${breakdownMarkup(detail)}</details>`:''}</div>`;
  }
  function weaponCard(w, showBreakdown=true) {
    const db=weaponData(w); const rarity=Number(db?.rarity||w.rarity)||5; const type=db?.type||w.type||'Unknown';
    const br=calculateWeaponRequirements(w); const advancing=levelAfter(w.goalLevel,w.level);
    const mappingMissing=!db || !db.enemyMats?.some(Boolean) || !db.weaponMats?.some(Boolean);
    const mappingNotice=!showBreakdown||!advancing?'':mappingMissing?`<p class="form-hint material-mapping-warning">${db?'The supplied workbook has no ascension-material mapping for this weapon.':'No matching catalog entry: only EXP and Shell Credits can be calculated.'}</p>`:'';
    return `<div class="unit-stack weapon-stack"><button class="weapon-card" data-edit-weapon="${esc(w.id||w.name)}" aria-label="Edit ${esc(w.name)}"><div class="weapon-art"><span class="rarity-stars">${'✦'.repeat(rarity)}</span><span class="weapon-type">${esc(type)}</span><span class="weapon-glyph">${esc(initials(w.name))}</span>${assetImage('weapons',w.name,'weapon-portrait')}</div><div class="weapon-card-copy"><div class="res-card-name"><span>${esc(w.name)}</span><span class="res-card-level">Lv. ${esc(normalizedBreakpoint(w.level,'1'))}${advancing?` → ${esc(normalizedBreakpoint(w.goalLevel,w.level))}`:''}</span></div><div class="res-card-sub"><span>${rarity}★ ${esc(type)}</span><span>${esc(w.assigned||w.status||'Unassigned')}</span></div></div></button>${showBreakdown&&advancing?`<details class="unit-breakdown"><summary>${esc(w.level)} → ${esc(w.goalLevel)} materials <span>${Object.keys(br).length}</span></summary>${breakdownMarkup(br)}</details>${mappingNotice}`:''}</div>`;
  }
  function goalMarkup(goal) { const done = goal.status === 'Complete'; return `<div class="goal-line"><div class="goal-icon">${goal.category === 'Skills' ? '✧' : goal.category === 'Weapon' ? '▱' : '⌁'}</div><div class="goal-main"><strong>${esc(goal.name)} · ${esc(goal.objective)}</strong><small>${esc(goal.note || goal.category || 'Build target')}</small><div class="progress-track" style="margin-top:8px"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,Number(goal.progress)||0))}%"></div></div></div><span class="goal-state ${done?'done':''}">${esc(goal.status)}</span><button class="icon-text-button" data-edit-goal="${esc(goal.id)}" aria-label="Edit goal">⋯</button></div>`; }
  function renderOverview() {
    const owned = state.resonators.length; const built = state.resonators.filter(r=>r.status==='Built').length;
    const rosterPreview = [...state.resonators].sort((a,b) => levelNumber(b.level)-levelNumber(a.level)).slice(0,6);
    const recentGoals = state.goals.slice(0,3);
    const plannedCount=allPlanningUnits().length; const plannedMaterials=aggregateRequirements(); const shortages=plannedMaterials.filter(x=>x.remaining>0).length;
    return `${pageHeading('TACET FIELD OPERATIONS','Tune your next <span style="color:var(--accent)">resonance.</span>','Your command center for Resonator and Weapon builds, material planning, and account goals.',button('＋ Add Resonator','data-action="add-resonator"','primary'))}
      <section class="hero-panel"><div class="hero-copy"><div class="hero-tag"><span>✦</span> YOUR PERSONAL ARCHIVE</div><h2>Make every material <span>count.</span></h2><p>Track Resonators and Weapons, see upgrade material requirements, and keep your next build on course.</p><div class="hero-actions">${button('Open Planner','data-nav="planner"','primary')}${button('Manage roster','data-nav="resonators"')}</div></div><div class="hero-orbit" aria-hidden="true">✧</div></section>
      <div class="grid stats-grid">
        <article class="stat-card"><div class="stat-top"><span class="stat-label">Resonators owned</span><span class="stat-icon">✧</span></div><div class="stat-value">${owned}<span class="stat-denominator"> / ${CATALOG.length}+</span></div><div class="stat-foot"><span class="positive">${built} built</span><span>· roster tracked</span></div></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-label">Weapons tracked</span><span class="stat-icon">▱</span></div><div class="stat-value">${state.weapons.length}<span class="stat-denominator"> / ${WEAPON_CATALOG.length}</span></div><div class="stat-foot"><span>${state.weapons.filter(w=>w.status==='Built').length} built</span><span>· weapons</span></div></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-label">Builds in Planner</span><span class="stat-icon">⌘</span></div><div class="stat-value">${plannedCount}</div><div class="stat-foot"><span>Resonators and Weapons</span></div></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-label">Material shortages</span><span class="stat-icon">▦</span></div><div class="stat-value">${shortages}</div><div class="stat-foot"><span>item types still to collect</span></div></article>
      </div>
      <div class="grid columns-2">
        <section class="section-card"><div class="section-head"><div><h2>Your Resonators</h2><p>Your most-developed units, at a glance.</p></div><div class="right"><button class="link-button" data-nav="resonators">View roster ↗</button></div></div><div class="section-body">${rosterPreview.length ? `<div class="resonator-grid">${rosterPreview.map(r=>resCard(r,false)).join('')}</div>` : emptyState('No Resonators yet','Add a Resonator to start building your archive.','＋ Add Resonator','data-action="add-resonator"')}</div></section>
        <section class="section-card"><div class="section-head"><div><h2>Build queue</h2><p>What you're working toward next.</p></div><button class="link-button" data-nav="planner">View Planner ↗</button></div><div class="section-body"><div class="quick-goals">${recentGoals.length ? recentGoals.map(goalMarkup).join('') : '<p class="muted-text">No goals yet. Create one in the Planner.</p>'}</div>${button('＋ Create a build goal','data-action="add-goal"','full')}</div></section>
      </div>`;
  }
  function emptyState(title, desc, btnLabel='', attrs='') { return `<div class="empty-state"><div class="empty-glyph">◈</div><h3>${title}</h3><p>${desc}</p>${btnLabel?button(btnLabel,attrs,'primary'):''}</div>`; }
  function renderResonators() {
    const q = resonatorSearch.toLowerCase(); let list = allRoster().filter(r => r.name.toLowerCase().includes(q) || (r.role||'').toLowerCase().includes(q) || (r.weapon||'').toLowerCase().includes(q));
    if (resonatorFilter !== 'All') list = list.filter(r => r.element === resonatorFilter || r.status === resonatorFilter);
    const actions = `${button('＋ Add custom','data-action="add-resonator"')}${button('＋ From catalog','data-action="catalog-resonator"','primary')}`;
    return `${pageHeading('YOUR ROSTER','Resonator archive','Track current and target levels, Resonance Chains, roles, and calculated level-up materials.',actions)}
      <div class="tool-row"><div class="filter-group">${['All',...ELEMENTS,'Built','Building','Planned'].map(f=>`<button class="filter-chip ${resonatorFilter===f?'active':''}" data-res-filter="${esc(f)}">${esc(f)}</button>`).join('')}</div><span class="muted-text tracked-count">${list.length} Resonator${list.length===1?'':'s'} tracked</span></div>
      ${list.length ? `<div class="resonator-grid roster-grid">${list.map(r=>resCard(r,true)).join('')}</div>` : emptyState('No matches found','Try another search or filter, or add a custom Resonator.','＋ Add Resonator','data-action="add-resonator"')}`;
  }
  function renderWeapons() {
    const q=weaponSearch.toLowerCase(); const list=(state.weapons||[]).filter(w=>[w.name,w.type,w.assigned,w.status].some(x=>String(x||'').toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name));
    return `${pageHeading('WEAPON ARCHIVE','Weapons tracker','Track equipped weapons, rarity, current/target levels, and exact ascension materials.',`${button('＋ Add weapon','data-action="add-weapon"','primary')}`)}
      <div class="tool-row"><span class="form-hint">${list.length} weapon${list.length===1?'':'s'} tracked · select any card to edit its level target</span><span class="pill mint">${WEAPON_CATALOG.length} catalog entries</span></div>
      ${list.length?`<div class="weapon-grid">${list.map(w=>weaponCard(w,true)).join('')}</div>`:emptyState('No weapons tracked','Add a weapon from the catalog by entering its name.','＋ Add weapon','data-action="add-weapon"')}`;
  }
  function renderPlanner() {
    const units=allPlanningUnits(); const items=aggregateRequirements(units); const missingTypes=items.filter(x=>x.remaining>0).length; const completeGoals=state.goals.filter(g=>g.status==='Complete'); const activeGoals=state.goals.filter(g=>g.status!=='Complete');
    const materials=items.filter(x=>x.required>0); const visibleMaterials=plannerShowComplete?materials:materials.filter(x=>x.remaining>0);
    const materialSection=!materials.length?emptyState('No builds need materials yet','Raise a target level above the current level on a Resonator or Weapon card to populate the collective plan.','Manage Resonators','data-nav="resonators"'):!visibleMaterials.length?emptyState('All tracked materials are covered','Every planned item is fully covered by the inventory counts. Turn on “Show fully stocked items” to review the full requirement list.'): `<div class="material-grid">${visibleMaterials.map(item=>`<article class="material-card"><div class="material-card-top"><div class="material-symbol item-symbol"><span class="item-symbol-placeholder">${esc(initials(item.name))}</span>${assetImage('materials',item.name,'material-portrait')}</div><span class="material-type">${esc(item.type)}</span></div><h3>${esc(item.name)}</h3><div class="material-amounts"><div><small>Total needed</small><strong>${fmt(item.required)}</strong></div><div><small>In inventory</small><strong>${fmt(item.owned)}</strong></div><div class="${item.remaining?'amount-missing':'amount-complete'}"><small>${item.remaining?'Need to farm':'Surplus'}</small><strong>${fmt(item.remaining?item.remaining:Math.max(0,item.owned-item.required))}</strong></div></div><div class="material-progress"><span style="width:${Math.min(100,item.required?item.owned/item.required*100:100)}%"></span></div><div class="needed-by-label">Used by ${item.sources.length} build${item.sources.length===1?'':'s'}</div><div class="needed-by-icons">${item.sources.map(materialUnitIcon).join('')}</div><div class="material-card-foot"><span>${esc(item.type)}</span><button class="link-button" data-nav="inventory">Inventory ↗</button></div></article>`).join('')}</div>`;
    return `${pageHeading('PROGRESSION WORKBENCH','Planner','Select target levels on Resonator and Weapon cards. Requirements are combined across every included build, with owned inventory deducted.',`${button('＋ Add Resonator','data-action="add-resonator"')}${button('＋ Add weapon','data-action="add-weapon"','primary')}`)}
      <section class="planner-summary"><div><span class="eyebrow">COLLECTIVE REQUIREMENTS</span><h2>Materials for your next upgrades</h2><p>Icons under each item show which Resonators and Weapons need it. Adjust inventory counts to update what remains to farm.</p></div><div class="planner-summary-stats"><div><small>Builds included</small><strong>${units.length}</strong></div><div><small>Item types</small><strong>${materials.length}</strong></div><div><small>With shortages</small><strong>${missingTypes}</strong></div></div></section>
      <div class="planner-controls"><span class="form-hint">Calculations cover level EXP, leveling Shell Credits, and ascension materials through the selected target. Ascension materials are charged at the workbook’s listed ascension gates.</span><label class="checkbox-row"><input type="checkbox" id="showCompleteMaterials" ${plannerShowComplete?'checked':''}> Show fully stocked items</label></div>
      ${materialSection}
      <div class="grid columns-2 planner-lower"><section class="section-card"><div class="section-head"><div><h2>Build progress</h2><p>Optional notes and progress alongside the calculated material list.</p></div><span class="pill mint">${state.goals.length} goals</span></div><div class="section-body"><div class="detail-grid"><div class="detail-stat"><span>Active goals</span><strong>${activeGoals.length}</strong></div><div class="detail-stat"><span>Completed goals</span><strong>${completeGoals.length}</strong></div><div class="detail-stat"><span>Average active progress</span><strong>${activeGoals.length?Math.round(activeGoals.reduce((s,g)=>s+(Number(g.progress)||0),0)/activeGoals.length):100}%</strong></div><div class="detail-stat"><span>Builds included</span><strong>${units.length}</strong></div></div></div></section>
      <section class="section-card"><div class="section-head"><div><h2>Goal queue</h2><p>Add optional notes or Forte priorities.</p></div><button class="btn small" data-action="add-goal">＋ New goal</button></div><div class="section-body"><div class="quick-goals">${state.goals.length?state.goals.map(g=>`<div class="goal-line"><div class="goal-icon">${g.category==='Skills'?'✧':g.category==='Weapon'?'▱':'⌁'}</div><div class="goal-main"><strong>${esc(g.name)} · ${esc(g.objective)}</strong><small>${esc(g.note||g.category)}</small><div class="progress-track" style="margin-top:8px"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,Number(g.progress)||0))}%"></div></div><div class="progress-row"><span>${Number(g.progress)||0}% complete</span><span>${esc(g.category)}</span></div></div><div style="display:flex;align-items:center;gap:8px;flex-shrink:0">${statusPill(g.status)}<button class="icon-text-button" data-edit-goal="${esc(g.id)}" aria-label="Edit goal">✎</button></div></div>`).join(''):emptyState('Your queue is clear','Add a goal to start planning your next build.','＋ New goal','data-action="add-goal"')}</div></div></section></div>`;
  }
  function renderInventory() {
    const allItems=(GAME_DB.items||[]).filter(x=>x.name);
    const search=inventorySearch.trim().toLowerCase();
    const searchMatch=item=>!search || item.name.toLowerCase().includes(search) || String(item.sources||'').toLowerCase().includes(search) || itemGroup(item).toLowerCase().includes(search);
    const pinnedTypes=['Universal Currency','Resonator EXP Material','Weapon EXP Material'];
    const pinned=pinnedTypes.map(type=>({type,items:allItems.filter(x=>x.type===type && searchMatch(x))}));
    const otherItems=allItems.filter(x=>!pinnedTypes.includes(x.type) && searchMatch(x) && (inventoryType==='All material groups'||itemGroup(x)===inventoryType));
    const groupOrder=['Free Materials','Waveplates Materials','Development Material','Resource','Skill Upgrade Material','Other Materials'];
    const groups=inventoryGroupItems(otherItems);
    const otherSections=groupOrder.filter(group=>groups[group]?.length).map(group=>inventorySection(group,groups[group])).join('');
    const pinnedSections=pinned.map(group=>inventorySection(group.type,group.items,true)).join('');
    const pinnedCount=pinned.reduce((sum,g)=>sum+g.items.length,0);
    return `${pageHeading('MATERIAL STORAGE','Inventory','Track upgrade materials visually. Owned quantities are deducted from the Planner automatically.',button('Clear material counts','data-action="reset-inventory"'))}
      <section class="inventory-pinned-groups">${pinnedSections}</section>
      <section class="section-card inventory-material-section"><div class="section-head"><div><h2>Upgrade materials</h2><p>Free drops, location resources, boss materials, and Waveplates-gated items.</p></div><span class="pill mint">${otherItems.length} items</span></div><div class="section-body"><div class="inventory-tools"><input class="input-control" id="inventorySearch" type="search" placeholder="Search materials…" value="${esc(inventorySearch)}"><select class="select-control" id="inventoryType">${INVENTORY_TYPES.map(t=>`<option value="${esc(t)}" ${inventoryType===t?'selected':''}>${esc(t)}</option>`).join('')}</select><span class="form-hint">${otherItems.length} shown</span></div>${otherSections||'<p class="form-hint">No materials match this filter.</p>'}</div></section>
      <div class="notice inventory-note"><strong>Image placeholders:</strong> add item icons to <code>assets/images/materials/</code> using the filename slug shown in the README. Until then, compact initials placeholders are shown.</div>`;
  }
  function inventorySection(title, items, pinned=false) {
    const rows=items.map(item=>{
      const owned=inventoryOwned(item.name); const imageName=item.name; const itemType=itemGroup(item);
      return `<article class="inventory-item ${pinned?'inventory-item-pinned':''}" title="${esc(item.name)}${item.sources?` — ${esc(item.sources)}`:''}"><div class="inventory-item-image"><span class="inventory-item-placeholder">${esc(initials(item.name))}</span>${assetImage('materials',imageName,'inventory-item-art')}<span class="inventory-rarity">${item.rarity?`${item.rarity}★`:''}</span></div><div class="inventory-item-name">${esc(item.name)}</div><div class="inventory-item-count"><input type="number" min="0" step="1" value="${owned}" data-material="${esc(item.name)}" aria-label="Owned ${esc(item.name)}"><span>owned</span></div></article>`;
    }).join('');
    return `<section class="inventory-group ${pinned?'inventory-group-pinned':''}"><div class="inventory-group-head"><h3>${esc(title)}</h3><span>${items.length} items</span></div>${items.length?`<div class="inventory-material-grid ${pinned?'pinned-item-grid':''}">${rows}</div>`:`<p class="inventory-empty">No matching items.</p>`}</section>`;
  }
  function renderSettings() {
    return `${pageHeading('ARCHIVE PREFERENCES','Settings & data','Control your local profile and protect your planner data.')}
      <div class="settings-grid"><section class="section-card"><div class="section-head"><div><h2>Profile settings</h2><p>Personalize how this archive is labeled.</p></div></div><div class="section-body"><form id="profileForm" class="modal-form"><div class="form-grid"><div class="form-field span-2"><label for="accountName">Profile name</label><input class="input-control" id="accountName" name="accountName" maxlength="40" value="${esc(state.account.name)}" required></div><div class="form-field span-2"><label for="accountUid">Optional account note / UID</label><input class="input-control" id="accountUid" name="accountUid" maxlength="80" value="${esc(state.account.uid||'')}" placeholder="Only stored in this browser"></div></div><div class="form-actions"><button class="btn primary" type="submit">Save profile</button></div></form></div></section>
      <section class="section-card"><div class="section-head"><div><h2>Backup & portability</h2><p>Move your archive or keep a safe copy.</p></div></div><div class="section-body"><div class="settings-row"><div><strong>Export archive</strong><small>Download Resonators, Weapons, goals, and material inventory as JSON.</small></div><button class="btn" data-action="export">Export JSON</button></div><div class="settings-row"><div><strong>Import archive</strong><small>Restore from a previous Tacet Archive JSON backup.</small></div><button class="btn" data-action="import">Import JSON</button></div><div class="settings-row"><div><strong>Reset local archive</strong><small>Replace current data with the starter sample. Export first if you want to keep a copy.</small></div><button class="btn danger" data-action="reset-all">Reset</button></div></div></section></div>
      <section class="section-card" style="margin-top:15px"><div class="section-head"><div><h2>About this project</h2><p>Designed for static hosting on GitHub Pages.</p></div><span class="pill mint">Offline-friendly</span></div><div class="section-body"><div class="notice">Tacet Archive is a fan-made, local-first planner inspired by the high-level information architecture of game companion sites. It is not affiliated with Kuro Games. Game names and trademarks belong to their respective owners. Character roster data is editable and should be reviewed as new Resonators release.</div><div class="settings-buttons"><button class="btn" data-action="export">⇩ Download backup</button><button class="btn" data-action="import">⇧ Restore backup</button></div></div></section>`;
  }
  function renderPage() {
    const root = document.getElementById('pageContent');
    const views = { overview:renderOverview, resonators:renderResonators, weapons:renderWeapons, planner:renderPlanner, inventory:renderInventory, settings:renderSettings };
    root.innerHTML = (views[activePage] || renderOverview)();
    updateSidebarCounts();
  }

  function showModal(kind, data={}) {
    modalKind=kind; const body=document.getElementById('modalBody'); const title=document.getElementById('modalTitle'); const eyebrow=document.getElementById('modalEyebrow'); let html='';
    if(kind==='resonator') {
      const isEdit=Boolean(data.name); const r=data.name?resByName(data.name):null; title.textContent=isEdit?`Edit ${r?.name||data.name}`:'Add Resonator'; eyebrow.textContent='RESONATOR LEVEL TARGET';
      const base=r||{name:'',level:'1',goalLevel:'90',chain:0,element:'Spectro',weapon:'Sword',rarity:5,status:'Planned',role:'Main DPS',notes:'',forte:1,includeInPlanner:true};
      const targetLevels=LEVEL_BREAKPOINTS.filter(l=>levelIndex(l)>=levelIndex(base.level||'1'));
      html=`<form id="modalForm" class="modal-form"><input type="hidden" name="originalName" value="${esc(r?.name||'')}"><div class="form-grid">
        <div class="form-field span-2"><label for="resName">Resonator name</label><input class="input-control" id="resName" name="name" maxlength="60" value="${esc(base.name)}" required ${isEdit?'readonly':''}></div>
        <div class="form-field"><label for="resElement">Element</label><select class="select-control" id="resElement" name="element">${[...ELEMENTS,'Unknown'].map(x=>`<option value="${x}" ${base.element===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resWeapon">Weapon type</label><select class="select-control" id="resWeapon" name="weapon">${['Sword','Broadblade','Pistols','Gauntlets','Rectifier','Unknown'].map(x=>`<option value="${x}" ${base.weapon===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resLevel">Current level</label><select class="select-control" id="resLevel" name="level">${LEVEL_BREAKPOINTS.map(l=>`<option value="${l}" ${normalizedBreakpoint(base.level,'1')===l?'selected':''}>Lv. ${l}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resGoalLevel">Target level</label><select class="select-control" id="resGoalLevel" name="goalLevel">${targetLevels.map(l=>`<option value="${l}" ${normalizedBreakpoint(base.goalLevel||base.level,base.level)===l?'selected':''}>Lv. ${l}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resChain">Resonance Chain</label><input class="input-control" type="number" id="resChain" name="chain" min="0" max="6" value="${Number(base.chain)||0}"></div>
        <div class="form-field"><label for="resRarity">Rarity</label><select class="select-control" name="rarity" id="resRarity"><option value="5" ${Number(base.rarity)===5?'selected':''}>5-star</option><option value="4" ${Number(base.rarity)===4?'selected':''}>4-star</option></select></div>
        <div class="form-field"><label for="resStatus">Build status</label><select class="select-control" id="resStatus" name="status">${['Built','Building','Planned','Unbuilt'].map(x=>`<option ${base.status===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resRole">Role / priority</label><select class="select-control" name="role" id="resRole">${['Main DPS','Sub DPS','Support','Healer','Hybrid','Unassigned'].map(x=>`<option ${base.role===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resForte">Key Forte level (reference)</label><input class="input-control" type="number" name="forte" id="resForte" min="1" max="10" value="${Number(base.forte)||1}"></div>
        <div class="form-field span-2"><label for="resNotes">Notes</label><textarea class="textarea-control" rows="2" id="resNotes" name="notes" maxlength="500" placeholder="Build notes or priority skills…">${esc(base.notes||'')}</textarea></div>
        <div class="form-field span-2"><label class="checkbox-row"><input type="checkbox" name="includeInPlanner" ${base.includeInPlanner!==false?'checked':''}> Include this level target in Planner</label></div>
        </div><div class="form-hint" style="margin-top:10px">Level requirements include EXP, Shell Credits, and ascension materials at the documented ascension gates.</div><div class="form-actions">${isEdit?`<button class="btn danger" type="button" data-delete-res="${esc(r.name)}">Remove</button>`:''}<button class="btn" type="button" data-close-modal>Cancel</button><button class="btn primary" type="submit">Save Resonator</button></div></form>`;
    } else if(kind==='catalog') {
      title.textContent='Add from catalog'; eyebrow.textContent='RESONATOR CATALOG'; const available=CATALOG.filter(c=>!state.resonators.some(r=>r.name===c.name));
      html=`<form id="modalForm" class="modal-form"><div class="form-field"><label for="catalogName">Select a Resonator</label><select class="select-control" name="catalogName" id="catalogName" required>${available.map(c=>`<option value="${esc(c.name)}">${esc(c.name)} · ${esc(c.element)} · ${c.rarity}★</option>`).join('')}</select>${available.length?'':'<span class="form-hint">All catalog entries are already in your roster. Add a custom entry instead.</span>'}</div><div class="form-hint" style="margin-top:12px">New entries default to Lv. 1 → 90. Edit the card to set the target breakpoint.</div><div class="form-actions"><button class="btn" type="button" data-close-modal>Cancel</button><button class="btn primary" type="submit" ${available.length?'':'disabled'}>Add to roster</button></div></form>`;
    } else if(kind==='weapon') {
      const w=data.weaponId?state.weapons.find(x=>x.id===data.weaponId):null; title.textContent=w?`Edit ${w.name}`:'Add weapon'; eyebrow.textContent='WEAPON LEVEL TARGET';
      const base=w||{id:'',name:'',level:'1',goalLevel:'90',rarity:5,type:'Sword',status:'Planned',assigned:'Unassigned',includeInPlanner:true,notes:''}; const targetLevels=LEVEL_BREAKPOINTS.filter(l=>levelIndex(l)>=levelIndex(base.level||'1'));
      html=`<form id="modalForm" class="modal-form"><input type="hidden" name="weaponId" value="${esc(w?.id||'')}"><div class="form-grid">
        <div class="form-field span-2"><label for="weaponName">Weapon name</label><input class="input-control" id="weaponName" name="name" list="weaponNames" maxlength="80" value="${esc(base.name)}" placeholder="Choose or enter a weapon name" required><datalist id="weaponNames">${WEAPON_CATALOG.map(x=>`<option value="${esc(x.name)}"></option>`).join('')}</datalist><span class="form-hint">Catalog names auto-fill rarity, type, and material families.</span></div>
        <div class="form-field"><label for="weaponType">Weapon type</label><select class="select-control" id="weaponType" name="type">${['Sword','Broadblade','Pistols','Gauntlets','Rectifier','Unknown'].map(x=>`<option value="${x}" ${(weaponData(base)?.type||base.type)===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="weaponRarity">Rarity</label><select class="select-control" id="weaponRarity" name="rarity"><option value="5" ${Number(weaponData(base)?.rarity||base.rarity)===5?'selected':''}>5-star</option><option value="4" ${Number(weaponData(base)?.rarity||base.rarity)===4?'selected':''}>4-star</option></select></div>
        <div class="form-field"><label for="weaponLevel">Current level</label><select class="select-control" id="weaponLevel" name="level">${LEVEL_BREAKPOINTS.map(l=>`<option value="${l}" ${normalizedBreakpoint(base.level,'1')===l?'selected':''}>Lv. ${l}</option>`).join('')}</select></div>
        <div class="form-field"><label for="weaponGoalLevel">Target level</label><select class="select-control" id="weaponGoalLevel" name="goalLevel">${targetLevels.map(l=>`<option value="${l}" ${normalizedBreakpoint(base.goalLevel||base.level,base.level)===l?'selected':''}>Lv. ${l}</option>`).join('')}</select></div>
        <div class="form-field"><label for="weaponStatus">Build status</label><select class="select-control" name="status" id="weaponStatus">${['Built','Building','Planned','Unbuilt'].map(x=>`<option ${base.status===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="weaponAssigned">Assigned Resonator</label><select class="select-control" name="assigned" id="weaponAssigned">${['Unassigned',...state.resonators.map(r=>r.name)].filter((x,i,a)=>a.indexOf(x)===i).map(x=>`<option ${base.assigned===x?'selected':''}>${esc(x)}</option>`).join('')}</select></div>
        <div class="form-field span-2"><label for="weaponNotes">Notes</label><textarea class="textarea-control" rows="2" id="weaponNotes" name="notes" maxlength="400">${esc(base.notes||'')}</textarea></div>
        <div class="form-field span-2"><label class="checkbox-row"><input type="checkbox" name="includeInPlanner" ${base.includeInPlanner!==false?'checked':''}> Include this level target in Planner</label></div>
        <div class="form-hint span-2" style="margin-top:0">Level EXP and Shell Credit requirements use the supplied workbook's cumulative totals; ascension materials are added at the listed ascension gates.</div>
        </div><div class="form-actions">${w?`<button class="btn danger" type="button" data-delete-weapon="${esc(w.id)}">Remove</button>`:''}<button class="btn" type="button" data-close-modal>Cancel</button><button class="btn primary" type="submit">Save weapon</button></div></form>`;
    } else if(kind==='goal') {
      const g=data.goalId?state.goals.find(x=>x.id===data.goalId):null; title.textContent=g?'Edit build goal':'Create build goal'; eyebrow.textContent='PROGRESSION PLAN'; const b=g||{name:state.resonators[0]?.name||'',objective:data.category==='Weapon'?'Raise Weapon to Lv. 90':'Raise Resonator to Lv. 90',category:data.category||'Resonator',status:'Planned',progress:0,note:''};
      const names=[...state.resonators.map(r=>r.name),...(state.weapons||[]).map(w=>w.name),...CATALOG.map(r=>r.name),...WEAPON_CATALOG.map(w=>w.name)].filter((x,i,a)=>a.indexOf(x)===i);
      html=`<form id="modalForm" class="modal-form"><input type="hidden" name="goalId" value="${esc(g?.id||'')}"><div class="form-grid"><div class="form-field"><label for="goalName">Resonator / Weapon / target name</label><input class="input-control" name="name" id="goalName" list="goalNames" value="${esc(b.name)}" maxlength="80" required><datalist id="goalNames">${names.map(n=>`<option value="${esc(n)}"></option>`).join('')}</datalist></div><div class="form-field"><label for="goalCategory">Goal category</label><select class="select-control" name="category" id="goalCategory">${['Resonator','Skills','Weapon','Other'].map(x=>`<option ${b.category===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="form-field span-2"><label for="goalObjective">Goal</label><input class="input-control" name="objective" id="goalObjective" maxlength="100" value="${esc(b.objective)}" required></div><div class="form-field"><label for="goalStatus">Status</label><select class="select-control" name="status" id="goalStatus">${['Planned','In progress','Complete','On hold'].map(x=>`<option ${b.status===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="form-field"><label for="goalProgress">Progress (%)</label><input class="input-control" type="number" name="progress" id="goalProgress" min="0" max="100" value="${Number(b.progress)||0}"></div><div class="form-field span-2"><label for="goalNote">Notes</label><textarea class="textarea-control" name="note" id="goalNote" rows="3" maxlength="500" placeholder="Priority, missing items, reminders…">${esc(b.note||'')}</textarea></div></div><div class="form-actions">${g?`<button class="btn danger" type="button" data-delete-goal="${esc(g.id)}">Delete</button>`:''}<button class="btn" type="button" data-close-modal>Cancel</button><button class="btn primary" type="submit">Save goal</button></div></form>`;
    }
    body.innerHTML=html; const backdrop=document.getElementById('modalBackdrop'); backdrop.hidden=false;
    const firstInput=body.querySelector('input:not([type=hidden]), select, textarea'); if(firstInput)setTimeout(()=>firstInput.focus(),10);
  }
  function closeModal() { document.getElementById('modalBackdrop').hidden = true; modalKind = null; }
  function handleModalSubmit(form) {
    const fd=new FormData(form); const val=name=>fd.get(name); const checked=name=>form.elements[name]?.checked||false;
    if(modalKind==='resonator') {
      const name=String(val('name')||'').trim(); if(!name)return; const original=String(val('originalName')||''); const level=normalizedBreakpoint(val('level'),1);
      const r={name,element:val('element'),weapon:val('weapon'),level,goalLevel:maxLevelStep(level,normalizedBreakpoint(val('goalLevel'),level)),includeInPlanner:checked('includeInPlanner'),chain:clamp(val('chain'),0,6),rarity:Number(val('rarity'))===4?4:5,status:val('status'),role:val('role'),forte:clamp(val('forte'),1,10),notes:String(val('notes')||'').trim()};
      if(original){const idx=state.resonators.findIndex(x=>x.name===original);if(idx>=0)state.resonators[idx]={...state.resonators[idx],...r};}
      else {if(resByName(name)){toast('That Resonator is already in your roster.',true);return;}state.resonators.push(r);}
      saveState();closeModal();renderPage();toast(original?'Resonator updated.':'Resonator added to roster.');
    } else if(modalKind==='catalog') {
      const c=catalogByName(String(val('catalogName'))); if(!c)return; if(resByName(c.name)){toast('Already in roster.',true);return;}
      state.resonators.push({...c,level:'1',goalLevel:'90',includeInPlanner:true,chain:0,status:'Planned',role:'Unassigned',notes:'',forte:1});saveState();closeModal();renderPage();toast(`${c.name} added to roster.`);
    } else if(modalKind==='weapon') {
      const name=String(val('name')||'').trim(); if(!name)return; const wId=String(val('weaponId')||'')||id('w'); const existing=state.weapons.find(x=>x.id===wId); const db=weaponByName(name);
      if(state.weapons.some(x=>x.name.toLowerCase()===name.toLowerCase()&&x.id!==wId)){toast('That weapon is already tracked.',true);return;}
      const level=normalizedBreakpoint(val('level'),1); const weapon={id:wId,name,level,goalLevel:maxLevelStep(level,normalizedBreakpoint(val('goalLevel'),level)),rarity:Number(db?.rarity||val('rarity'))===4?4:5,type:db?.type||String(val('type')||'Unknown'),status:String(val('status')||'Planned'),assigned:String(val('assigned')||'Unassigned'),includeInPlanner:checked('includeInPlanner'),notes:String(val('notes')||'').trim()};
      if(existing){const idx=state.weapons.findIndex(x=>x.id===wId);state.weapons[idx]=weapon;}else state.weapons.push(weapon);
      saveState();closeModal();renderPage();toast(existing?'Weapon updated.':'Weapon added to tracker.');
    } else if(modalKind==='goal') {
      const g={id:String(val('goalId')||'')||id('g'),name:String(val('name')||'').trim(),category:String(val('category')||'Other'),objective:String(val('objective')||'').trim(),status:String(val('status')||'Planned'),progress:clamp(val('progress'),0,100),note:String(val('note')||'').trim()};
      if(!g.name||!g.objective)return;if(g.status==='Complete')g.progress=100;const idx=state.goals.findIndex(x=>x.id===g.id);if(idx>=0)state.goals[idx]=g;else state.goals.unshift(g);saveState();closeModal();renderPage();toast('Build goal saved.');
    }
  }
  function clamp(v,min,max){ const n=Number(v); return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n))):min; }
  function exportData() {
    const data = { app:'Tacet Archive', schemaVersion:2, exportedAt:new Date().toISOString(), state };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=`tacet-archive-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Archive backup downloaded.');
  }
  function importData(file) {
    if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try {
        const raw=JSON.parse(String(reader.result)); const incoming=raw.state||raw;
        if(!incoming||!Array.isArray(incoming.resonators)||!incoming.resources)throw new Error('This does not look like a Tacet Archive backup.');
        if(!confirm('Import this archive and replace the data currently saved in this browser?'))return;
        state=normalizeState(incoming); saveState(); renderPage(); toast('Archive imported successfully.');
      } catch(e) { toast(e.message||'Could not read that backup file.',true); }
    };
    reader.onerror=()=>toast('Could not read the selected file.',true); reader.readAsText(file);
  }
  function action(name) {
    if(name==='add-resonator')showModal('resonator');
    else if(name==='catalog-resonator')showModal('catalog');
    else if(name==='add-weapon')showModal('weapon');
    else if(name==='add-goal')showModal('goal');
    else if(name==='export')exportData();
    else if(name==='import')document.getElementById('importFile').click();
    else if(name==='reset-inventory'){if(confirm('Clear every tracked material count? This does not change Resonator or Weapon targets.')){state.materials={};state.resources['Shell Credits']=0;saveState();renderPage();toast('Material counts cleared.');}}
    else if(name==='reset-all'){if(confirm('Replace all current data with the starter sample? This cannot be undone unless you exported a backup.')){state=normalizeState(clone(DEFAULT_STATE));saveState();setPage('overview');toast('Starter archive restored.');}}
  }
  document.addEventListener('click', e => {
    const nav=e.target.closest('[data-page],[data-nav]'); if(nav){setPage(nav.dataset.page||nav.dataset.nav);return;}
    const act=e.target.closest('[data-action]'); if(act){action(act.dataset.action);return;}
    const addFrom=e.target.closest('[data-template-goal]'); if(addFrom){showModal('goal',{category:addFrom.dataset.templateGoal});return;}
    const filter=e.target.closest('[data-res-filter]'); if(filter){resonatorFilter=filter.dataset.resFilter;renderPage();return;}
    const res=e.target.closest('[data-edit-res]'); if(res){showModal('resonator',{name:res.dataset.editRes});return;}
    const weapon=e.target.closest('[data-edit-weapon]'); if(weapon){showModal('weapon',{weaponId:weapon.dataset.editWeapon});return;}
    const goal=e.target.closest('[data-edit-goal]'); if(goal){showModal('goal',{goalId:goal.dataset.editGoal});return;}
    const delRes=e.target.closest('[data-delete-res]'); if(delRes){const name=delRes.dataset.deleteRes;if(confirm(`Remove ${name} from your Resonator roster?`)){state.resonators=state.resonators.filter(r=>r.name!==name);saveState();closeModal();renderPage();toast('Resonator removed.');}return;}
    const delWeapon=e.target.closest('[data-delete-weapon]'); if(delWeapon){const wid=delWeapon.dataset.deleteWeapon;const target=state.weapons.find(w=>w.id===wid);if(confirm(`Remove ${target?.name||'this weapon'} from your tracker?`)){state.weapons=state.weapons.filter(w=>w.id!==wid);saveState();closeModal();renderPage();toast('Weapon removed.');}return;}
    const delGoal=e.target.closest('[data-delete-goal]'); if(delGoal){if(confirm('Delete this build goal?')){state.goals=state.goals.filter(g=>g.id!==delGoal.dataset.deleteGoal);saveState();closeModal();renderPage();toast('Goal deleted.');}return;}
    if(e.target.closest('[data-close-modal]') || e.target.id==='closeModal'){closeModal();return;}
    if(e.target.id==='modalBackdrop'){closeModal();return;}
  });
  document.addEventListener('submit', e => {
    if(e.target.id==='modalForm'){e.preventDefault();handleModalSubmit(e.target);}
    if(e.target.id==='profileForm'){e.preventDefault();state.account.name=String(new FormData(e.target).get('accountName')||'Rover').trim()||'Rover';state.account.uid=String(new FormData(e.target).get('accountUid')||'').trim();saveState();renderPage();toast('Profile saved.');}
  });
  document.addEventListener('change', e => {
    const material=e.target.closest('[data-material]'); if(material){const name=material.dataset.material;const amount=clamp(material.value,0,999999999);if(name==='Shell Credit'){state.resources['Shell Credits']=amount;delete state.materials[name];}else state.materials[name]=amount;saveState();renderPage();toast(`${name} inventory updated.`);return;}
    if(e.target.id==='inventoryType'){inventoryType=e.target.value;renderPage();return;}
    if(e.target.id==='showCompleteMaterials'){plannerShowComplete=e.target.checked;renderPage();return;}
    if(e.target.id==='weaponName'){
      const db=weaponByName(e.target.value);if(db){const type=document.getElementById('weaponType');const rarity=document.getElementById('weaponRarity');if(type)type.value=db.type;if(rarity)rarity.value=String(db.rarity);}
      return;
    }
    if(e.target.id==='resLevel'){
      const current=normalizedBreakpoint(e.target.value,'1'); const goal=document.getElementById('resGoalLevel');if(goal){const old=normalizedBreakpoint(goal.value,current);goal.innerHTML=LEVEL_BREAKPOINTS.filter(l=>levelIndex(l)>=levelIndex(current)).map(l=>`<option value="${l}" ${l===maxLevelStep(current,old)?'selected':''}>Lv. ${l}</option>`).join('');}return;
    }
    if(e.target.id==='weaponLevel'){
      const current=normalizedBreakpoint(e.target.value,'1'); const goal=document.getElementById('weaponGoalLevel');if(goal){const old=normalizedBreakpoint(goal.value,current);goal.innerHTML=LEVEL_BREAKPOINTS.filter(l=>levelIndex(l)>=levelIndex(current)).map(l=>`<option value="${l}" ${l===maxLevelStep(current,old)?'selected':''}>Lv. ${l}</option>`).join('');}return;
    }
  });
  document.addEventListener('input', e => {
    if(e.target.id==='globalSearch'){
      const value=e.target.value; const targetPage=activePage==='weapons'?'weapons':'resonators';
      if(targetPage==='weapons')weaponSearch=value;else resonatorSearch=value;
      if(activePage!==targetPage){setPage(targetPage);}else renderPage();
      const input=document.getElementById('globalSearch');if(input){input.value=value;input.focus();input.setSelectionRange(value.length,value.length);}return;
    }
    if(e.target.id==='inventorySearch'){
      const value=e.target.value;const pos=value.length;inventorySearch=value;renderPage();const input=document.getElementById('inventorySearch');if(input){input.focus();input.setSelectionRange(pos,pos);}
    }
  });
  document.getElementById('mobileMenu').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('mobile-open'));
  document.getElementById('exportTop').addEventListener('click',exportData);
  document.getElementById('sidebarBackup').addEventListener('click',exportData);
  document.getElementById('importFile').addEventListener('change',e=>{importData(e.target.files?.[0]);e.target.value='';});
  document.getElementById('closeModal').addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();document.getElementById('globalSearch').focus();}});
  updateSidebarCounts();renderPage();
})();
