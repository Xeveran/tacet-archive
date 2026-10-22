(() => {
  'use strict';
  const STORAGE_KEY = 'tacetArchive_v1';
  const ELEMENTS = ['Aero', 'Glacio', 'Fusion', 'Electro', 'Havoc', 'Spectro'];
  const ELEMENT_COLORS = { Aero: '#a3c9bb', Glacio: '#8cc9ed', Fusion: '#eea18b', Electro: '#c6a3ed', Havoc: '#e58ca5', Spectro: '#ebd68f' };
  const CATALOG = [
    ['Rover (Spectro)','Spectro','Sword',5],['Rover (Havoc)','Havoc','Sword',5],['Yangyang','Aero','Sword',4],['Chixia','Fusion','Pistols',4],['Baizhi','Glacio','Rectifier',4],['Sanhua','Glacio','Sword',4],['Aalto','Aero','Pistols',4],['Yuanwu','Electro','Gauntlets',4],['Mortefi','Fusion','Pistols',4],['Taoqi','Havoc','Broadblade',4],['Danjin','Havoc','Sword',4],['Youhu','Glacio','Gauntlets',4],['Jianxin','Aero','Gauntlets',5],['Encore','Fusion','Rectifier',5],['Verina','Spectro','Rectifier',5],['Lingyang','Glacio','Gauntlets',5],['Calcharo','Electro','Broadblade',5],['Jiyan','Aero','Broadblade',5],['Yinlin','Electro','Rectifier',5],['Jinhsi','Spectro','Broadblade',5],['Changli','Fusion','Sword',5],['Zhezhi','Glacio','Rectifier',5],['Xiangli Yao','Electro','Gauntlets',5],['Shorekeeper','Spectro','Rectifier',5],['Camellya','Havoc','Sword',5],['Carlotta','Glacio','Pistols',5],['Roccia','Havoc','Gauntlets',5],['Brant','Fusion','Sword',5],['Phoebe','Spectro','Rectifier',5],['Zani','Spectro','Gauntlets',5],['Cantarella','Havoc','Rectifier',5],['Ciaccona','Aero','Pistols',5],['Lupa','Fusion','Broadblade',5],['Cartethyia','Aero','Sword',5],['Phrolova','Havoc','Rectifier',5],['Galbrena','Fusion','Pistols',5],['Augusta','Electro','Broadblade',5],['Iuno','Aero','Gauntlets',5],['Qiuyuan','Aero','Sword',5],['Chisa','Havoc','Sword',5],['Lynae','Spectro','Pistols',5],['Mornye','Fusion','Broadblade',5],['Aemeath','Fusion','Sword',5],['Luuk Herssen','Spectro','Gauntlets',5],['Hiyuki','Glacio','Sword',5],['Denia','Unknown','Unknown',5],['Sigrika','Aero','Gauntlets',5],['Suisui','Glacio','Rectifier',5],['Yangyang: Xuanling','Havoc','Sword',5],['Lucilla','Glacio','Rectifier',5],['Hsin','Havoc','Unknown',5],['Jingran','Unknown','Unknown',5],['Qingxiao','Unknown','Unknown',5]
  ].map(([name, element, weapon, rarity]) => ({ name, element, weapon, rarity }));
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
  const DEFAULT_TASKS = [
    { id:'d1', title:'Spend Waveplates', detail:'Use stamina on the highest-priority material', reward:'EXP / mats', done:false, cadence:'Daily' },
    { id:'d2', title:'Complete daily activity', detail:'Claim your  daily activity rewards', reward:'Astrite', done:false, cadence:'Daily' },
    { id:'d3', title:'Check limited-time events', detail:'Claim event rewards before they expire', reward:'Rewards', done:false, cadence:'Daily' },
    { id:'w1', title:'Clear weekly bosses', detail:'Use your weekly challenge attempts', reward:'Boss mats', done:false, cadence:'Weekly' },
    { id:'w2', title:'Tacet Field runs', detail:'Farm a few Echoes for your current build', reward:'Echo EXP', done:false, cadence:'Weekly' }
  ];
  const DEFAULT_STATE = {
    account: { name:'Rover', uid:'' },
    resonators: DEFAULT_OWNED,
    goals: [
      { id:'g1', name:'Carlotta', objective:'Ascend Resonator to Lv. 90', category:'Resonator', status:'In progress', progress:70, note:'Gather remaining ascension materials' },
      { id:'g2', name:'Chisa', objective:'Tune Echo set', category:'Echoes', status:'In progress', progress:45, note:'Prioritize Crit Rate and Energy Regen' },
      { id:'g3', name:'Mornye', objective:'Upgrade key Forte skills', category:'Skills', status:'Planned', progress:20, note:'' }
    ],
    echoes: [
      { id:'e1', name:'Reminiscence: Threnodian', cost:4, set:'Midnight Veil', main:'Crit. Rate', stats:['Crit. DMG +14.8%','ATK +9.2%','Energy Regen +6.8%'], assigned:'Camellya', locked:true },
      { id:'e2', name:'Crownless', cost:4, set:'Havoc Eclipse', main:'Crit. DMG', stats:['Crit. Rate +9.3%','ATK +10.4%','Basic ATK +7.1%'], assigned:'Unassigned', locked:false },
      { id:'e3', name:'Jué', cost:4, set:'Celestial Light', main:'Crit. Rate', stats:['Crit. DMG +14.8%','Resonance Skill +7.1%','ATK +8.6%'], assigned:'Jinhsi', locked:true }
    ],
    resources: { 'Astrite': 15840, 'Shell Credits': 2845000, 'Premium Tuners': 126, 'Advanced Sealed Tubes': 48, 'Waveplates': 120, 'Crystal Solvent': 18, 'Lustrous Tide': 37, 'Radiant Tide': 22 },
    convene: {
      character: { label:'Featured Resonator', pity:42, guarantee:false, pulls:0, fiveStars:0 },
      weapon: { label:'Featured Weapon', pity:27, guarantee:true, pulls:0, fiveStars:0 },
      standard: { label:'Standard Convene', pity:61, guarantee:false, pulls:0, fiveStars:0 }
    },
    tasks: DEFAULT_TASKS,
    settings: { showHints:true }
  };
  let state = loadState();
  let activePage = 'overview';
  let resonatorFilter = 'All';
  let resonatorSearch = '';
  let modalKind = null;

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return clone(DEFAULT_STATE);
      const parsed = JSON.parse(stored);
      return { ...clone(DEFAULT_STATE), ...parsed,
        account: { ...clone(DEFAULT_STATE.account), ...(parsed.account || {}) },
        resonators: Array.isArray(parsed.resonators) ? parsed.resonators : clone(DEFAULT_STATE.resonators),
        goals: Array.isArray(parsed.goals) ? parsed.goals : clone(DEFAULT_STATE.goals),
        echoes: Array.isArray(parsed.echoes) ? parsed.echoes : clone(DEFAULT_STATE.echoes),
        resources: { ...clone(DEFAULT_STATE.resources), ...(parsed.resources || {}) },
        convene: { ...clone(DEFAULT_STATE.convene), ...(parsed.convene || {}) },
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : clone(DEFAULT_STATE.tasks)
      };
    } catch { return clone(DEFAULT_STATE); }
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
  function catalogByName(name) { return CATALOG.find(r => r.name === name); }
  function allRoster() { return [...state.resonators].sort((a,b) => a.name.localeCompare(b.name)); }
  function toast(message, error=false) {
    const region = document.getElementById('toastRegion'); const node = document.createElement('div');
    node.className = 'toast' + (error ? ' error' : ''); node.textContent = message; region.appendChild(node);
    setTimeout(() => node.remove(), 3300);
  }
  function updateSidebarCounts() {
    document.getElementById('resonatorNavCount').textContent = state.resonators.length;
    document.getElementById('echoNavCount').textContent = state.echoes.length;
    document.getElementById('accountNameTop').textContent = state.account.name || 'Rover';
  }
  function titleFor(page) { return ({overview:'OVERVIEW',resonators:'RESONATORS',planner:'BUILD PLANNER',echoes:'ECHO VAULT',convene:'CONVENE LOG',routine:'DAILY ROUTINE',inventory:'INVENTORY',settings:'SETTINGS & DATA'})[page] || 'OVERVIEW'; }
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
  function resCard(r) {
    const color = elementColor(r.element); const built = r.status === 'Built';
    return `<button class="res-card" data-edit-res="${esc(r.name)}" style="--element:${color}" aria-label="Edit ${esc(r.name)}">
      <div class="res-art"><span class="rarity-stars">${'✦'.repeat(Math.max(1,Math.min(5,Number(r.rarity)||5)))}</span><span class="res-status">${esc(r.status || 'Planned')}</span><span class="res-glyph">${esc(initials(r.name))}</span></div>
      <div class="res-card-copy"><div class="res-card-name"><span>${esc(r.name)}</span><span class="res-card-level">Lv. ${Number(r.level)||1}</span></div><div class="res-card-sub"><span><i class="element-dot" style="--element:${color}"></i>${esc(r.element || 'Unknown')}</span><span>${built ? 'Build ready' : (r.role || 'Unassigned')}</span></div></div>
    </button>`;
  }
  function taskMarkup(task) { return `<label class="routine-item ${task.done ? 'done' : ''}"><input class="check-box" type="checkbox" data-task="${esc(task.id)}" ${task.done?'checked':''}><span class="routine-text"><strong>${esc(task.title)}</strong><small>${esc(task.detail || '')}</small></span><span class="routine-reward">${esc(task.reward || '')}</span></label>`; }
  function goalMarkup(goal) { const done = goal.status === 'Complete'; return `<div class="goal-line"><div class="goal-icon">${goal.category === 'Echoes' ? '◉' : goal.category === 'Skills' ? '✧' : '⌁'}</div><div class="goal-main"><strong>${esc(goal.name)} · ${esc(goal.objective)}</strong><small>${esc(goal.note || goal.category || 'Build target')}</small><div class="progress-track" style="margin-top:8px"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,Number(goal.progress)||0))}%"></div></div></div><span class="goal-state ${done?'done':''}">${esc(goal.status)}</span><button class="icon-text-button" data-edit-goal="${esc(goal.id)}" aria-label="Edit goal">⋯</button></div>`; }
  function renderOverview() {
    const owned = state.resonators.length; const built = state.resonators.filter(r=>r.status==='Built').length;
    const completed = state.tasks.filter(t=>t.cadence==='Daily' && t.done).length; const dailyTotal = state.tasks.filter(t=>t.cadence==='Daily').length;
    const waves = Number(state.resources['Waveplates']||0); const astrites = Number(state.resources['Astrite']||0);
    const rosterPreview = [...state.resonators].sort((a,b) => (b.level||1)-(a.level||1)).slice(0,6);
    const recentGoals = state.goals.slice(0,3);
    return `${pageHeading('TACET FIELD OPERATIONS','Tune your next <span style="color:var(--accent)">resonance.</span>','Your command center for Resonator builds, Echo sets, and long-term account goals.',button('＋ Add Resonator','data-action="add-resonator"','primary'))}
      <section class="hero-panel"><div class="hero-copy"><div class="hero-tag"><span>✦</span> YOUR PERSONAL ARCHIVE</div><h2>Make every waveplate <span>count.</span></h2><p>Track the Resonators you own, keep your next build on course, and organize your Echo collection — all in one place.</p><div class="hero-actions">${button('Open build planner','data-nav="planner"','primary')}${button('Manage roster','data-nav="resonators"')}</div></div><div class="hero-orbit" aria-hidden="true">✧</div></section>
      <div class="grid stats-grid">
        <article class="stat-card"><div class="stat-top"><span class="stat-label">Resonators owned</span><span class="stat-icon">✧</span></div><div class="stat-value">${owned}<span style="font-size:13px;color:#718191;font-weight:600"> / ${CATALOG.length}+</span></div><div class="stat-foot"><span class="positive">${built} built</span><span>· roster tracked</span></div></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-label">Waveplates</span><span class="stat-icon">◉</span></div><div class="stat-value">${fmt(waves)}<span style="font-size:13px;color:#718191;font-weight:600"> / 240</span></div><div class="stat-foot"><span>${waves >= 220 ? 'Nearly capped' : 'Spend on your next goal'}</span></div></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-label">Astrite reserve</span><span class="stat-icon">✦</span></div><div class="stat-value">${fmt(astrites)}</div><div class="stat-foot"><span>Local account estimate</span></div></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-label">Echoes archived</span><span class="stat-icon">◈</span></div><div class="stat-value">${state.echoes.length}</div><div class="stat-foot"><span>${state.echoes.filter(e=>e.locked).length} marked as locked</span></div></article>
      </div>
      <div class="grid columns-2">
        <section class="section-card"><div class="section-head"><div><h2>Your Resonators</h2><p>Your most-developed units, at a glance.</p></div><div class="right"><button class="link-button" data-nav="resonators">View roster ↗</button></div></div><div class="section-body">${rosterPreview.length ? `<div class="resonator-grid">${rosterPreview.map(resCard).join('')}</div>` : emptyState('No Resonators yet','Add a Resonator to start building your archive.','＋ Add Resonator','data-action="add-resonator"')}</div></section>
        <div class="grid" style="gap:15px"><section class="section-card"><div class="section-head"><div><h2>Daily checklist</h2><p>Small steps, steady progress.</p></div><span class="pill mint">${completed}/${dailyTotal}</span></div><div class="section-body"><div class="progress-row"><span>Daily completion</span><strong>${dailyTotal ? Math.round(completed/dailyTotal*100) : 0}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${dailyTotal?completed/dailyTotal*100:0}%"></div></div><div class="routine-list" style="margin-top:7px">${state.tasks.filter(t=>t.cadence==='Daily').map(taskMarkup).join('')}</div><button class="btn full" style="margin-top:10px" data-nav="routine">Open full routine ↗</button></div></section>
        <section class="section-card"><div class="section-head"><div><h2>Build queue</h2><p>What you're working toward next.</p></div><button class="link-button" data-nav="planner">View all ↗</button></div><div class="section-body"><div class="quick-goals">${recentGoals.length ? recentGoals.map(goalMarkup).join('') : '<p class="muted-text">No goals yet. Create one in the build planner.</p>'}</div>${button('＋ Create a build goal','data-action="add-goal"','full')}</div></section></div>
      </div>`;
  }
  function emptyState(title, desc, btnLabel='', attrs='') { return `<div class="empty-state"><div class="empty-glyph">◈</div><h3>${title}</h3><p>${desc}</p>${btnLabel?button(btnLabel,attrs,'primary'):''}</div>`; }
  function renderResonators() {
    const q = resonatorSearch.toLowerCase(); let list = allRoster().filter(r => r.name.toLowerCase().includes(q) || (r.role||'').toLowerCase().includes(q) || (r.weapon||'').toLowerCase().includes(q));
    if (resonatorFilter !== 'All') list = list.filter(r => r.element === resonatorFilter || r.status === resonatorFilter);
    const actions = `${button('＋ Add custom','data-action="add-resonator"')}${button('＋ From catalog','data-action="catalog-resonator"','primary')}`;
    return `${pageHeading('YOUR ROSTER','Resonator archive','Track levels, Resonance Chains, build status, and notes for every unit.',actions)}
      <div class="tool-row"><div class="filter-group">${['All',...ELEMENTS,'Built','Building','Planned'].map(f=>`<button class="filter-chip ${resonatorFilter===f?'active':''}" data-res-filter="${esc(f)}">${esc(f)}</button>`).join('')}</div><span style="color:var(--muted);font-size:10px">${list.length} Resonator${list.length===1?'':'s'} tracked</span></div>
      ${list.length ? `<div class="resonator-grid roster-grid">${list.map(resCard).join('')}</div>` : emptyState('No matches found','Try another search or filter, or add a custom Resonator.','＋ Add Resonator','data-action="add-resonator"')}`;
  }
  function renderPlanner() {
    const activeGoals = state.goals.filter(g=>g.status!=='Complete'); const completeGoals = state.goals.filter(g=>g.status==='Complete');
    return `${pageHeading('PROGRESSION WORKBENCH','Build planner','Set a target for each Resonator and track the work from planned to complete.',button('＋ New goal','data-action="add-goal"','primary'))}
      <div class="grid columns-2" style="margin-bottom:16px"><section class="section-card"><div class="section-head"><div><h2>Build progress</h2><p>Progress is yours to define and update.</p></div><span class="pill mint">${state.goals.length} goals</span></div><div class="section-body"><div class="detail-grid"><div class="detail-stat"><span>Active goals</span><strong>${activeGoals.length}</strong></div><div class="detail-stat"><span>Completed goals</span><strong>${completeGoals.length}</strong></div><div class="detail-stat"><span>Average active progress</span><strong>${activeGoals.length ? Math.round(activeGoals.reduce((s,g)=>s+(Number(g.progress)||0),0)/activeGoals.length) : 100}%</strong></div><div class="detail-stat"><span>Resonators being built</span><strong>${state.resonators.filter(r=>r.status==='Building').length}</strong></div></div><div class="notice" style="margin-top:13px"><strong>Planner note:</strong> material totals are not auto-calculated in this starter version. Add notes for the items you still need and update goals as you farm.</div></div></section>
      <section class="section-card"><div class="section-head"><div><h2>Quick add</h2><p>Common targets to put in your queue.</p></div></div><div class="section-body"><div class="quick-goals"><div class="goal-line"><div class="goal-icon">⌁</div><div class="goal-main"><strong>Level & ascension</strong><small>Character level, ascension, and EXP.</small></div><button class="btn small" data-template-goal="Resonator">Add</button></div><div class="goal-line"><div class="goal-icon">✧</div><div class="goal-main"><strong>Forte investment</strong><small>Track skill levels and priority order.</small></div><button class="btn small" data-template-goal="Skills">Add</button></div><div class="goal-line"><div class="goal-icon">◉</div><div class="goal-main"><strong>Echo optimization</strong><small>Set targets for main stats and tuning.</small></div><button class="btn small" data-template-goal="Echoes">Add</button></div></div></div></section></div>
      <section class="section-card"><div class="section-head"><div><h2>Goal queue</h2><p>Click the edit control to adjust progress, status, or notes.</p></div><div class="right"><span class="pill gold">${activeGoals.length} active</span></div></div><div class="section-body"><div class="quick-goals">${state.goals.length ? state.goals.map(g=>`<div class="goal-line"><div class="goal-icon">${g.category==='Echoes'?'◉':g.category==='Skills'?'✧':'⌁'}</div><div class="goal-main"><strong>${esc(g.name)} · ${esc(g.objective)}</strong><small>${esc(g.note||g.category)}</small><div class="progress-track" style="margin-top:8px"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,Number(g.progress)||0))}%"></div></div><div class="progress-row"><span>${Number(g.progress)||0}% complete</span><span>${esc(g.category)}</span></div></div><div style="display:flex;align-items:center;gap:8px;flex-shrink:0">${statusPill(g.status)}<button class="icon-text-button" data-edit-goal="${esc(g.id)}" aria-label="Edit goal">✎</button></div></div>`).join('') : emptyState('Your queue is clear','Add a goal to start planning your next build.','＋ New goal','data-action="add-goal"')}</div></div></section>`;
  }
  function echoCard(e) { return `<article class="echo-card"><div class="echo-top"><div style="display:flex;gap:10px;min-width:0"><div class="echo-emblem">◈</div><div style="min-width:0"><div class="echo-title">${esc(e.name)}</div><div class="echo-sub">${esc(e.set)} · Cost ${esc(e.cost)}</div></div></div><button class="icon-text-button" data-delete-echo="${esc(e.id)}" title="Delete Echo">×</button></div><div class="echo-stats"><span class="echo-stat">Main · ${esc(e.main)}</span>${(e.stats||[]).map(s=>`<span class="echo-stat">${esc(s)}</span>`).join('')}</div><div class="echo-bottom"><small>${e.assigned && e.assigned!=='Unassigned'?'Equipped: '+esc(e.assigned):'Unassigned'}${e.locked?' · <span style="color:var(--gold)">Locked</span>':''}</small><button class="link-button" data-edit-echo="${esc(e.id)}">Edit ↗</button></div></article>`; }
  function renderEchoes() {
    return `${pageHeading('TACET FIELD ARCHIVE','Echo vault','Keep a quick reference of promising Echoes, sets, main stats, and who they are reserved for.',button('＋ Add Echo','data-action="add-echo"','primary'))}
      <div class="grid stats-grid"><article class="stat-card"><div class="stat-top"><span class="stat-label">Echoes tracked</span><span class="stat-icon">◈</span></div><div class="stat-value">${state.echoes.length}</div><div class="stat-foot">Across all saved sets</div></article><article class="stat-card"><div class="stat-top"><span class="stat-label">Locked / reserved</span><span class="stat-icon">⌑</span></div><div class="stat-value">${state.echoes.filter(e=>e.locked).length}</div><div class="stat-foot">Protected from accidental use</div></article><article class="stat-card"><div class="stat-top"><span class="stat-label">Equipped / assigned</span><span class="stat-icon">✧</span></div><div class="stat-value">${state.echoes.filter(e=>e.assigned && e.assigned!=='Unassigned').length}</div><div class="stat-foot">Linked to a Resonator</div></article><article class="stat-card"><div class="stat-top"><span class="stat-label">Echo sets</span><span class="stat-icon">⌘</span></div><div class="stat-value">${new Set(state.echoes.map(e=>e.set)).size}</div><div class="stat-foot">Distinct set labels</div></article></div>
      <div class="tool-row"><div class="filter-group"><span class="filter-chip active">All Echoes</span><span class="filter-chip">5-cost</span><span class="filter-chip">Locked</span></div><span class="form-hint">Manual archive · not connected to game data</span></div>
      ${state.echoes.length ? `<div class="echo-grid">${state.echoes.map(echoCard).join('')}</div>` : emptyState('No Echoes archived','Add an Echo to start collecting the pieces you want to keep.','＋ Add Echo','data-action="add-echo"')}`;
  }
  function renderConvene() {
    const cards = Object.entries(state.convene).map(([key,cfg])=>`<section class="pity-card"><div class="pity-head"><div class="pity-logo">✦</div><div><h3>${esc(cfg.label || key)}</h3><p>Track pity and wishes manually.</p></div></div><div class="pity-body"><div class="pity-number">${Number(cfg.pity)||0}<small> / ${key==='weapon'?'80':'80'}</small></div><div class="pity-track"><span style="width:${Math.max(0,Math.min(100,(Number(cfg.pity)||0)/80*100))}%"></span></div><div class="pity-foot"><span>${80-(Number(cfg.pity)||0)} until 80-pity threshold</span><span>${Number(cfg.pulls)||0} pulls logged here</span></div><div class="pity-inputs"><div class="form-field"><label>Current pity</label><input class="input-control" type="number" min="0" max="80" data-pity="${key}" value="${Number(cfg.pity)||0}"></div><div class="form-field"><label>Total pulls logged</label><input class="input-control" type="number" min="0" data-pulls="${key}" value="${Number(cfg.pulls)||0}"></div></div><label class="checkbox-row"><input type="checkbox" data-guarantee="${key}" ${cfg.guarantee?'checked':''}> Next 5-star is guaranteed featured</label><div class="pity-actions"><button class="btn primary" data-add-pull="${key}">＋ Log 1 pull</button><button class="btn" data-reset-pity="${key}">Reset pity</button></div></div></section>`).join('');
    return `${pageHeading('CONVENE RECORDS','Convene tracker','A simple local record of your banner pity, pull totals, and featured guarantee status.',button('Reset session counters','data-action="reset-convene"'))}
      <div class="notice" style="margin-bottom:16px"><strong>Tracking note:</strong> these counters are manual and stored locally. Verify them against your in-game Convene history; the app does not import pull history or predict future results.</div>
      <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:14px">${cards}</div>`;
  }
  function renderRoutine() {
    const daily = state.tasks.filter(t=>t.cadence==='Daily'), weekly = state.tasks.filter(t=>t.cadence==='Weekly'); const dDone=daily.filter(t=>t.done).length, wDone=weekly.filter(t=>t.done).length;
    return `${pageHeading('DAILY OPERATIONS','Routine tracker','Keep the important repeatable activities visible, without leaving the planner.',`<button class="btn" data-action="reset-daily">↻ Reset daily</button><button class="btn primary" data-action="add-task">＋ Add task</button>`)}
      <div class="grid columns-2"><section class="section-card"><div class="section-head"><div><h2>Daily priorities</h2><p>Reset when the daily server reset rolls around.</p></div><span class="pill mint">${dDone}/${daily.length}</span></div><div class="section-body"><div class="progress-row"><span>Daily completion</span><strong>${daily.length?Math.round(dDone/daily.length*100):0}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${daily.length?dDone/daily.length*100:0}%"></div></div><div class="routine-list" style="margin-top:9px">${daily.map(t=>`${taskMarkup(t)}<button class="icon-text-button" data-edit-task="${esc(t.id)}" style="align-self:flex-start;margin-left:24px">Edit</button>`).join('')}</div></div></section>
      <section class="section-card"><div class="section-head"><div><h2>Weekly priorities</h2><p>Keep your weekly rewards from slipping by.</p></div><span class="pill gold">${wDone}/${weekly.length}</span></div><div class="section-body"><div class="routine-list">${weekly.map(t=>`${taskMarkup(t)}<button class="icon-text-button" data-edit-task="${esc(t.id)}" style="align-self:flex-start;margin-left:24px">Edit</button>`).join('')}</div><button class="btn full" style="margin-top:12px" data-action="reset-weekly">↻ Reset weekly tasks</button></div></section></div>
      <p class="form-hint" style="margin-top:13px">Tasks are convenience reminders, not synced to Wuthering Waves. Completing a task here does not claim in-game rewards.</p>`;
  }
  function renderInventory() {
    const resources = Object.entries(state.resources);
    const descriptions = {'Astrite':'Premium summon currency','Shell Credits':'General upgrade currency','Premium Tuners':'Echo substat tuning','Advanced Sealed Tubes':'Echo EXP materials','Waveplates':'Stamina available to spend','Crystal Solvent':'Waveplate refresh item','Lustrous Tide':'Standard Convene currency','Radiant Tide':'Featured Convene currency'};
    return `${pageHeading('RESOURCE LEDGER','Inventory','Maintain your own counts for currencies and upgrade materials. Edit any amount to keep your plan current.',button('Restore sample values','data-action="reset-inventory"'))}
      <div class="resource-grid">${resources.map(([name,value])=>`<article class="resource-card"><div class="resource-symbol">${name==='Astrite'?'✦':name==='Waveplates'?'◉':name.includes('Tide')?'✧':name==='Shell Credits'?'◈':'▦'}</div><label for="resource-${esc(name)}">${esc(name)}</label><div class="resource-qty"><input id="resource-${esc(name)}" type="number" min="0" step="1" data-resource="${esc(name)}" value="${Number(value)||0}" aria-label="${esc(name)} amount"><small>units</small></div><div class="resource-desc">${esc(descriptions[name]||'Tracked material')}</div></article>`).join('')}</div>
      <div class="notice" style="margin-top:16px"><strong>Good to know:</strong> resource counts are entered manually. This version does not scan screenshots, access game files, or calculate exact upgrade material requirements.</div>`;
  }
  function renderSettings() {
    return `${pageHeading('ARCHIVE PREFERENCES','Settings & data','Control your local profile and protect your planner data.')}
      <div class="settings-grid"><section class="section-card"><div class="section-head"><div><h2>Profile settings</h2><p>Personalize how this archive is labeled.</p></div></div><div class="section-body"><form id="profileForm" class="modal-form"><div class="form-grid"><div class="form-field span-2"><label for="accountName">Profile name</label><input class="input-control" id="accountName" name="accountName" maxlength="40" value="${esc(state.account.name)}" required></div><div class="form-field span-2"><label for="accountUid">Optional account note / UID</label><input class="input-control" id="accountUid" name="accountUid" maxlength="80" value="${esc(state.account.uid||'')}" placeholder="Only stored in this browser"></div></div><div class="form-actions"><button class="btn primary" type="submit">Save profile</button></div></form></div></section>
      <section class="section-card"><div class="section-head"><div><h2>Backup & portability</h2><p>Move your archive or keep a safe copy.</p></div></div><div class="section-body"><div class="settings-row"><div><strong>Export archive</strong><small>Download Resonators, goals, Echoes, inventory, and routine as JSON.</small></div><button class="btn" data-action="export">Export JSON</button></div><div class="settings-row"><div><strong>Import archive</strong><small>Restore from a previous Tacet Archive JSON backup.</small></div><button class="btn" data-action="import">Import JSON</button></div><div class="settings-row"><div><strong>Reset local archive</strong><small>Replace current data with the starter sample. Export first if you want to keep a copy.</small></div><button class="btn danger" data-action="reset-all">Reset</button></div></div></section></div>
      <section class="section-card" style="margin-top:15px"><div class="section-head"><div><h2>About this project</h2><p>Designed for static hosting on GitHub Pages.</p></div><span class="pill mint">Offline-friendly</span></div><div class="section-body"><div class="notice">Tacet Archive is a fan-made, local-first planner inspired by the high-level information architecture of game companion sites. It is not affiliated with Kuro Games. Game names and trademarks belong to their respective owners. Character roster data is editable and should be reviewed as new Resonators release.</div><div class="settings-buttons"><button class="btn" data-action="export">⇩ Download backup</button><button class="btn" data-action="import">⇧ Restore backup</button></div></div></section>`;
  }
  function renderPage() {
    const root = document.getElementById('pageContent');
    const views = { overview:renderOverview, resonators:renderResonators, planner:renderPlanner, echoes:renderEchoes, convene:renderConvene, routine:renderRoutine, inventory:renderInventory, settings:renderSettings };
    root.innerHTML = (views[activePage] || renderOverview)();
    updateSidebarCounts();
  }

  function showModal(kind, data={}) {
    modalKind = kind; const body = document.getElementById('modalBody'); const title = document.getElementById('modalTitle'); const eyebrow = document.getElementById('modalEyebrow');
    let html = '';
    if (kind === 'resonator') {
      const isEdit = Boolean(data.name); const r = data.name ? resByName(data.name) : null;
      title.textContent = isEdit ? `Edit ${r?.name || data.name}` : 'Add Resonator'; eyebrow.textContent = 'ROSTER ENTRY';
      const base = r || { name:'', level:1, chain:0, element:'Spectro', weapon:'Sword', rarity:5, status:'Planned', role:'Main DPS', notes:'', forte:1 };
      const existingNames = new Set(state.resonators.map(x=>x.name));
      html = `<form id="modalForm" class="modal-form"><input type="hidden" name="originalName" value="${esc(r?.name||'')}"><div class="form-grid">
        <div class="form-field span-2"><label for="resName">Resonator name</label><input class="input-control" id="resName" name="name" maxlength="60" value="${esc(base.name)}" required ${isEdit?'readonly':''}></div>
        <div class="form-field"><label for="resElement">Element</label><select class="select-control" id="resElement" name="element">${[...ELEMENTS,'Unknown'].map(x=>`<option ${base.element===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resWeapon">Weapon type</label><select class="select-control" id="resWeapon" name="weapon">${['Sword','Broadblade','Pistols','Gauntlets','Rectifier','Unknown'].map(x=>`<option ${base.weapon===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resLevel">Level</label><input class="input-control" type="number" id="resLevel" name="level" min="1" max="90" value="${Number(base.level)||1}" required></div>
        <div class="form-field"><label for="resChain">Resonance Chain</label><input class="input-control" type="number" id="resChain" name="chain" min="0" max="6" value="${Number(base.chain)||0}"></div>
        <div class="form-field"><label for="resRarity">Rarity</label><select class="select-control" name="rarity" id="resRarity"><option value="5" ${Number(base.rarity)===5?'selected':''}>5-star</option><option value="4" ${Number(base.rarity)===4?'selected':''}>4-star</option></select></div>
        <div class="form-field"><label for="resStatus">Build status</label><select class="select-control" id="resStatus" name="status">${['Built','Building','Planned','Unbuilt'].map(x=>`<option ${base.status===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resRole">Role / priority</label><select class="select-control" name="role" id="resRole">${['Main DPS','Sub DPS','Support','Healer','Hybrid','Unassigned'].map(x=>`<option ${base.role===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="form-field"><label for="resForte">Key Forte level (reference)</label><input class="input-control" type="number" name="forte" id="resForte" min="1" max="10" value="${Number(base.forte)||1}"></div>
        <div class="form-field span-2"><label for="resNotes">Notes</label><textarea class="textarea-control" rows="2" id="resNotes" name="notes" maxlength="500" placeholder="Build notes, priority skills, weapon...">${esc(base.notes||'')}</textarea></div>
        </div><div class="form-actions">${isEdit?'<button class="btn danger" type="button" data-delete-res="'+esc(r.name)+'">Remove</button>':''}<button class="btn" type="button" data-close-modal>Cancel</button><button class="btn primary" type="submit">Save Resonator</button></div></form>`;
    } else if (kind === 'catalog') {
      title.textContent = 'Add from catalog'; eyebrow.textContent = 'RESONATOR CATALOG';
      const available = CATALOG.filter(c=>!state.resonators.some(r=>r.name===c.name));
      html = `<form id="modalForm" class="modal-form"><div class="form-field"><label for="catalogName">Select a Resonator</label><select class="select-control" name="catalogName" id="catalogName" required>${available.map(c=>`<option value="${esc(c.name)}">${esc(c.name)} · ${esc(c.element)} · ${c.rarity}★</option>`).join('')}</select>${available.length?'':'<span class="form-hint">All catalog entries are already in your roster. Add a custom entry instead.</span>'}</div><div class="form-hint" style="margin-top:12px">After adding, open the Resonator card to update level, Chain, and build status.</div><div class="form-actions"><button class="btn" type="button" data-close-modal>Cancel</button><button class="btn primary" type="submit" ${available.length?'':'disabled'}>Add to roster</button></div></form>`;
    } else if (kind === 'goal') {
      const g = data.goalId ? state.goals.find(x=>x.id===data.goalId) : null; title.textContent = g ? 'Edit build goal' : 'Create build goal'; eyebrow.textContent = 'PROGRESSION PLAN';
      const b = g || { name:state.resonators[0]?.name||'', objective:'Raise Resonator to Lv. 90', category:data.category||'Resonator', status:'Planned', progress:0, note:'' };
      html = `<form id="modalForm" class="modal-form"><input type="hidden" name="goalId" value="${esc(g?.id||'')}"><div class="form-grid"><div class="form-field"><label for="goalName">Resonator / target name</label><input class="input-control" name="name" id="goalName" list="resonatorNames" value="${esc(b.name)}" maxlength="60" required><datalist id="resonatorNames">${[...state.resonators.map(r=>r.name),...CATALOG.map(r=>r.name)].filter((x,i,a)=>a.indexOf(x)===i).map(n=>`<option value="${esc(n)}"></option>`).join('')}</datalist></div><div class="form-field"><label for="goalCategory">Goal category</label><select class="select-control" name="category" id="goalCategory">${['Resonator','Skills','Weapon','Echoes','Other'].map(x=>`<option ${b.category===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="form-field span-2"><label for="goalObjective">Goal</label><input class="input-control" name="objective" id="goalObjective" maxlength="100" value="${esc(b.objective)}" required></div><div class="form-field"><label for="goalStatus">Status</label><select class="select-control" name="status" id="goalStatus">${['Planned','In progress','Complete','On hold'].map(x=>`<option ${b.status===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="form-field"><label for="goalProgress">Progress (%)</label><input class="input-control" type="number" name="progress" id="goalProgress" min="0" max="100" value="${Number(b.progress)||0}"></div><div class="form-field span-2"><label for="goalNote">Notes / missing materials</label><textarea class="textarea-control" name="note" id="goalNote" rows="3" maxlength="500" placeholder="What do you still need?">${esc(b.note||'')}</textarea></div></div><div class="form-actions">${g?`<button class="btn danger" type="button" data-delete-goal="${esc(g.id)}">Delete</button>`:''}<button class="btn" type="button" data-close-modal>Cancel</button><button class="btn primary" type="submit">Save goal</button></div></form>`;
    } else if (kind === 'echo') {
      const e = data.echoId ? state.echoes.find(x=>x.id===data.echoId) : null; title.textContent = e ? 'Edit Echo entry' : 'Add Echo'; eyebrow.textContent = 'ECHO VAULT';
      const b = e || { name:'',cost:4,set:'',main:'Crit. Rate',stats:[],assigned:'Unassigned',locked:false };
      html = `<form id="modalForm" class="modal-form"><input type="hidden" name="echoId" value="${esc(e?.id||'')}"><div class="form-grid"><div class="form-field span-2"><label for="echoName">Echo name</label><input class="input-control" name="name" id="echoName" maxlength="80" value="${esc(b.name)}" required></div><div class="form-field"><label for="echoCost">Cost</label><select class="select-control" name="cost" id="echoCost">${[1,3,4].map(x=>`<option value="${x}" ${Number(b.cost)===x?'selected':''}>${x}-cost</option>`).join('')}</select></div><div class="form-field"><label for="echoSet">Sonata / set</label><input class="input-control" name="set" id="echoSet" maxlength="80" value="${esc(b.set)}" required></div><div class="form-field span-2"><label for="echoMain">Main stat</label><input class="input-control" name="main" id="echoMain" maxlength="80" value="${esc(b.main)}" required placeholder="Crit. Rate, ATK%, Healing Bonus..."></div><div class="form-field span-2"><label for="echoStats">Substats (one per line or comma-separated)</label><textarea class="textarea-control" name="stats" id="echoStats" rows="3" maxlength="500" placeholder="Crit. DMG +14.8%, ATK +9.2%">${esc((b.stats||[]).join('\n'))}</textarea></div><div class="form-field"><label for="echoAssigned">Assigned Resonator</label><select class="select-control" name="assigned" id="echoAssigned">${['Unassigned',...state.resonators.map(r=>r.name)].filter((x,i,a)=>a.indexOf(x)===i).map(x=>`<option ${b.assigned===x?'selected':''}>${esc(x)}</option>`).join('')}</select></div><div class="form-field"><label>Protection</label><label class="checkbox-row" style="min-height:36px"><input type="checkbox" name="locked" ${b.locked?'checked':''}> Mark as locked / reserved</label></div></div><div class="form-actions">${e?`<button class="btn danger" type="button" data-delete-echo="${esc(e.id)}">Delete</button>`:''}<button class="btn" type="button" data-close-modal>Cancel</button><button class="btn primary" type="submit">Save Echo</button></div></form>`;
    } else if (kind === 'task') {
      const t = data.taskId ? state.tasks.find(x=>x.id===data.taskId) : null; title.textContent = t ? 'Edit routine task' : 'Add routine task'; eyebrow.textContent = 'OPERATIONS CHECKLIST'; const b=t||{title:'',detail:'',reward:'',cadence:'Daily',done:false};
      html = `<form id="modalForm" class="modal-form"><input type="hidden" name="taskId" value="${esc(t?.id||'')}"><div class="form-grid"><div class="form-field span-2"><label for="taskTitle">Task name</label><input class="input-control" name="title" id="taskTitle" maxlength="90" value="${esc(b.title)}" required></div><div class="form-field span-2"><label for="taskDetail">Description</label><input class="input-control" name="detail" id="taskDetail" maxlength="180" value="${esc(b.detail)}"></div><div class="form-field"><label for="taskCadence">Cadence</label><select class="select-control" name="cadence" id="taskCadence"><option ${b.cadence==='Daily'?'selected':''}>Daily</option><option ${b.cadence==='Weekly'?'selected':''}>Weekly</option></select></div><div class="form-field"><label for="taskReward">Reward / category</label><input class="input-control" name="reward" id="taskReward" maxlength="40" value="${esc(b.reward)}"></div></div><div class="form-actions">${t?`<button class="btn danger" type="button" data-delete-task="${esc(t.id)}">Delete</button>`:''}<button class="btn" type="button" data-close-modal>Cancel</button><button class="btn primary" type="submit">Save task</button></div></form>`;
    }
    body.innerHTML = html;
    const backdrop = document.getElementById('modalBackdrop'); backdrop.hidden = false;
    const firstInput = body.querySelector('input:not([type=hidden]), select, textarea'); if (firstInput) setTimeout(()=>firstInput.focus(),10);
  }
  function closeModal() { document.getElementById('modalBackdrop').hidden = true; modalKind = null; }
  function handleModalSubmit(form) {
    const fd = new FormData(form); const val = name => fd.get(name); const checked = name => form.elements[name]?.checked || false;
    if (modalKind === 'resonator') {
      const name = String(val('name')||'').trim(); if (!name) return;
      const original = String(val('originalName')||''); const r = { name, element:val('element'), weapon:val('weapon'), level:clamp(val('level'),1,90), chain:clamp(val('chain'),0,6), rarity:Number(val('rarity'))===4?4:5, status:val('status'), role:val('role'), forte:clamp(val('forte'),1,10), notes:String(val('notes')||'').trim() };
      if (original) { const idx=state.resonators.findIndex(x=>x.name===original); if(idx>=0) state.resonators[idx]={...state.resonators[idx],...r}; }
      else { if(resByName(name)){toast('That Resonator is already in your roster.',true);return;} state.resonators.push(r); }
      saveState(); closeModal(); renderPage(); toast(original?'Resonator updated.':'Resonator added to roster.');
    } else if (modalKind === 'catalog') {
      const c = catalogByName(String(val('catalogName'))); if(!c)return; if(resByName(c.name)){toast('Already in roster.',true);return;}
      state.resonators.push({...c,level:1,chain:0,status:'Planned',role:'Unassigned',notes:'',forte:1}); saveState(); closeModal(); renderPage(); toast(`${c.name} added to roster.`);
    } else if (modalKind === 'goal') {
      const g = { id:String(val('goalId')||'')||id('g'), name:String(val('name')||'').trim(), category:String(val('category')||'Other'), objective:String(val('objective')||'').trim(), status:String(val('status')||'Planned'), progress:clamp(val('progress'),0,100), note:String(val('note')||'').trim() };
      if(!g.name||!g.objective)return; if(g.status==='Complete')g.progress=100;
      const idx=state.goals.findIndex(x=>x.id===g.id); if(idx>=0)state.goals[idx]=g;else state.goals.unshift(g); saveState(); closeModal(); renderPage(); toast('Build goal saved.');
    } else if (modalKind === 'echo') {
      const e = { id:String(val('echoId')||'')||id('e'), name:String(val('name')||'').trim(), cost:Number(val('cost'))||4, set:String(val('set')||'').trim(), main:String(val('main')||'').trim(), stats:String(val('stats')||'').split(/[\n,]+/).map(x=>x.trim()).filter(Boolean).slice(0,10), assigned:String(val('assigned')||'Unassigned'), locked:checked('locked') };
      if(!e.name||!e.set||!e.main)return; const idx=state.echoes.findIndex(x=>x.id===e.id);if(idx>=0)state.echoes[idx]=e;else state.echoes.unshift(e);saveState();closeModal();renderPage();toast('Echo entry saved.');
    } else if (modalKind === 'task') {
      const t = { id:String(val('taskId')||'')||id('t'), title:String(val('title')||'').trim(), detail:String(val('detail')||'').trim(), cadence:String(val('cadence')||'Daily'), reward:String(val('reward')||'').trim(), done:false };
      const idx=state.tasks.findIndex(x=>x.id===t.id); if(idx>=0){t.done=state.tasks[idx].done;state.tasks[idx]=t;}else state.tasks.push(t);saveState();closeModal();renderPage();toast('Routine task saved.');
    }
  }
  function clamp(v,min,max){ const n=Number(v); return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n))):min; }
  function exportData() {
    const data = { app:'Tacet Archive', schemaVersion:1, exportedAt:new Date().toISOString(), state };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=`tacet-archive-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Archive backup downloaded.');
  }
  function importData(file) {
    if(!file)return; const reader=new FileReader(); reader.onload=()=>{try{const raw=JSON.parse(String(reader.result));const incoming=raw.state||raw;if(!incoming||!Array.isArray(incoming.resonators)||!incoming.resources||!incoming.convene)throw new Error('This does not look like a Tacet Archive backup.');if(!confirm('Import this archive and replace the data currently saved in this browser?'))return;state={...clone(DEFAULT_STATE),...incoming,account:{...clone(DEFAULT_STATE.account),...(incoming.account||{})},resources:{...clone(DEFAULT_STATE.resources,...incoming.resources)},convene:{...clone(DEFAULT_STATE.convene,...incoming.convene)}};saveState();renderPage();toast('Archive imported successfully.');}catch(e){toast(e.message||'Could not read that backup file.',true);}}; reader.onerror=()=>toast('Could not read the selected file.',true);reader.readAsText(file);
  }
  function action(name, target) {
    if(name==='add-resonator')showModal('resonator');
    else if(name==='catalog-resonator')showModal('catalog');
    else if(name==='add-goal')showModal('goal');
    else if(name==='add-echo')showModal('echo');
    else if(name==='add-task')showModal('task');
    else if(name==='export')exportData();
    else if(name==='import')document.getElementById('importFile').click();
    else if(name==='reset-daily'){state.tasks=state.tasks.map(t=>t.cadence==='Daily'?{...t,done:false}:t);saveState();renderPage();toast('Daily tasks reset.');}
    else if(name==='reset-weekly'){state.tasks=state.tasks.map(t=>t.cadence==='Weekly'?{...t,done:false}:t);saveState();renderPage();toast('Weekly tasks reset.');}
    else if(name==='reset-inventory'){state.resources={...state.resources,...clone(DEFAULT_STATE.resources)};saveState();renderPage();toast('Sample resource values restored.');}
    else if(name==='reset-convene'){if(confirm('Reset pull totals and pity values for all tracked banner types?')){Object.keys(state.convene).forEach(k=>{state.convene[k].pity=0;state.convene[k].pulls=0;state.convene[k].fiveStars=0;});saveState();renderPage();toast('Convene counters reset.');}}
    else if(name==='reset-all'){if(confirm('Replace all current data with the starter sample? This cannot be undone unless you exported a backup.')){state=clone(DEFAULT_STATE);saveState();setPage('overview');toast('Starter archive restored.');}}
  }

  document.addEventListener('click', e => {
    const nav=e.target.closest('[data-page],[data-nav]'); if(nav){setPage(nav.dataset.page||nav.dataset.nav);return;}
    const act=e.target.closest('[data-action]');if(act){action(act.dataset.action);return;}
    const addFrom=e.target.closest('[data-template-goal]');if(addFrom){showModal('goal',{category:addFrom.dataset.templateGoal});return;}
    const filter=e.target.closest('[data-res-filter]');if(filter){resonatorFilter=filter.dataset.resFilter;renderPage();return;}
    const res=e.target.closest('[data-edit-res]');if(res){showModal('resonator',{name:res.dataset.editRes});return;}
    const goal=e.target.closest('[data-edit-goal]');if(goal){showModal('goal',{goalId:goal.dataset.editGoal});return;}
    const echo=e.target.closest('[data-edit-echo]');if(echo){showModal('echo',{echoId:echo.dataset.editEcho});return;}
    const task=e.target.closest('[data-edit-task]');if(task){showModal('task',{taskId:task.dataset.editTask});return;}
    const delRes=e.target.closest('[data-delete-res]');if(delRes){const name=delRes.dataset.deleteRes;if(confirm(`Remove ${name} from your roster? Related goals and Echo assignments will remain.`)){state.resonators=state.resonators.filter(r=>r.name!==name);saveState();closeModal();renderPage();toast('Resonator removed.');}return;}
    const delGoal=e.target.closest('[data-delete-goal]');if(delGoal){if(confirm('Delete this build goal?')){state.goals=state.goals.filter(g=>g.id!==delGoal.dataset.deleteGoal);saveState();closeModal();renderPage();toast('Goal deleted.');}return;}
    const delEcho=e.target.closest('[data-delete-echo]');if(delEcho){if(confirm('Delete this Echo from the archive?')){state.echoes=state.echoes.filter(x=>x.id!==delEcho.dataset.deleteEcho);saveState();if(modalKind==='echo')closeModal();renderPage();toast('Echo removed.');}return;}
    const delTask=e.target.closest('[data-delete-task]');if(delTask){if(confirm('Delete this routine task?')){state.tasks=state.tasks.filter(t=>t.id!==delTask.dataset.deleteTask);saveState();closeModal();renderPage();toast('Task deleted.');}return;}
    const addPull=e.target.closest('[data-add-pull]');if(addPull){const cfg=state.convene[addPull.dataset.addPull];if(cfg){cfg.pulls=(Number(cfg.pulls)||0)+1;cfg.pity=(Number(cfg.pity)||0)+1;if(cfg.pity>=80){cfg.pity=0;cfg.fiveStars=(Number(cfg.fiveStars)||0)+1;toast('Pity reached the configured threshold. Check your in-game result and guarantee state.');}saveState();renderPage();}return;}
    const resetPity=e.target.closest('[data-reset-pity]');if(resetPity){const cfg=state.convene[resetPity.dataset.resetPity];if(cfg && confirm(`Reset pity for ${cfg.label}?`)){cfg.pity=0;saveState();renderPage();toast('Pity reset.');}return;}
    if(e.target.closest('[data-close-modal]') || e.target.id==='closeModal'){closeModal();return;}
    if(e.target.id==='modalBackdrop'){closeModal();return;}
  });
  document.addEventListener('submit', e => {
    if(e.target.id==='modalForm'){e.preventDefault();handleModalSubmit(e.target);}
    if(e.target.id==='profileForm'){e.preventDefault();state.account.name=String(new FormData(e.target).get('accountName')||'Rover').trim()||'Rover';state.account.uid=String(new FormData(e.target).get('accountUid')||'').trim();saveState();renderPage();toast('Profile saved.');}
  });
  document.addEventListener('change', e => {
    const t=e.target.closest('[data-task]');if(t){const task=state.tasks.find(x=>x.id===t.dataset.task);if(task)task.done=t.checked;saveState();renderPage();return;}
    const p=e.target.closest('[data-pity]');if(p){const cfg=state.convene[p.dataset.pity];if(cfg){cfg.pity=clamp(p.value,0,80);saveState();renderPage();}return;}
    const pulls=e.target.closest('[data-pulls]');if(pulls){const cfg=state.convene[pulls.dataset.pulls];if(cfg){cfg.pulls=clamp(pulls.value,0,999999);saveState();renderPage();}return;}
    const guarantee=e.target.closest('[data-guarantee]');if(guarantee){const cfg=state.convene[guarantee.dataset.guarantee];if(cfg){cfg.guarantee=guarantee.checked;saveState();toast('Guarantee status updated.');}return;}
    const resource=e.target.closest('[data-resource]');if(resource){state.resources[resource.dataset.resource]=clamp(resource.value,0,999999999);saveState();toast(`${resource.dataset.resource} updated.`);return;}
  });
  document.addEventListener('input', e => {
    if(e.target.id==='globalSearch'){resonatorSearch=e.target.value;if(activePage!=='resonators'){setPage('resonators');const input=document.getElementById('globalSearch');if(input){input.value=resonatorSearch;input.focus();}}else renderPage();}
  });
  document.getElementById('mobileMenu').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('mobile-open'));
  document.getElementById('exportTop').addEventListener('click',exportData);
  document.getElementById('sidebarBackup').addEventListener('click',exportData);
  document.getElementById('importFile').addEventListener('change',e=>{importData(e.target.files?.[0]);e.target.value='';});
  document.getElementById('closeModal').addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();document.getElementById('globalSearch').focus();}});
  updateSidebarCounts();renderPage();
})();
