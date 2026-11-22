/* SyncMySkills onboarding: four short steps, then the first report.
   Answers are kept in sessionStorage (SMS.state) so "Save and exit" and refreshes don't lose them.
   TODO(api): save each step to the profile endpoint and fetch real results. */
(function(){
'use strict';
var $ = SMS.$, $$ = SMS.$$, st = SMS.state();
var form = $('#ob'), step = 1, TOTAL = 4;

var ROLES = ['Product Manager','Product Analyst','Associate Product Manager','Data Analyst','Data Scientist','Data Engineer','Analytics Engineer','Software Engineer','Frontend Engineer','Backend Engineer','Full-stack Engineer','Mobile Engineer','Machine Learning Engineer','DevOps Engineer','Site Reliability Engineer','QA Engineer','Security Engineer','UX Designer','Product Designer','UI Designer','UX Researcher','Business Analyst','Project Manager','Program Manager','Operations Manager','Marketing Manager','Growth Marketer','Content Strategist','SEO Specialist','Sales Development Representative','Account Executive','Customer Success Manager','HR Generalist','Recruiter','Financial Analyst','Management Consultant','Solutions Engineer','Technical Writer'];
var SUGG = {
  'Find my next role': ['Product Manager','Senior Data Analyst','Backend Engineer','Product Designer'],
  'Land my first job': ['Data Analyst','Associate Product Manager','Software Engineer','Business Analyst'],
  'Switch careers': ['UX Designer','Data Analyst','Product Manager','Customer Success Manager'],
  'Return to work': ['Project Manager','Operations Manager','Business Analyst','Recruiter'],
  '': ['Product Analyst','Data Analyst','Software Engineer','UX Designer']
};
var CITIES = [['Remote','Anywhere'],['London','United Kingdom'],['Manchester','United Kingdom'],['Dublin','Ireland'],['Berlin','Germany'],['Munich','Germany'],['Amsterdam','Netherlands'],['Paris','France'],['Lisbon','Portugal'],['Madrid','Spain'],['Barcelona','Spain'],['Stockholm','Sweden'],['Zurich','Switzerland'],['New York','United States'],['San Francisco','United States'],['Seattle','United States'],['Austin','United States'],['Toronto','Canada'],['Vancouver','Canada'],['Bengaluru','India'],['Mumbai','India'],['Hyderabad','India'],['Pune','India'],['Delhi NCR','India'],['Singapore','Singapore'],['Dubai','United Arab Emirates'],['Sydney','Australia'],['Melbourne','Australia'],['Tokyo','Japan']];

/* ---------- helpers ---------- */
var ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="8" r="6.4"/><path d="M8 4.8v3.6M8 11.1v.1"/></svg>';
function err(id, text){ var m = $('#' + id); if (!m) return !text; m.innerHTML = text ? ICON + '<span>' + text + '</span>' : ''; m.style.display = text ? 'flex' : 'none'; if (text) m.style.marginTop = '12px'; return !text; }
function lab(o){ return Array.isArray(o) ? o[0] : o; }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function val(name){ var i = $('input[name="' + name + '"]:checked'); return i ? i.value : ''; }
function vals(name){ return $$('input[name="' + name + '"]:checked').map(function(i){ return i.value; }); }

/* ---------- chip inputs with autocomplete ---------- */
function Chips(opts){
  var box = $(opts.box), input = $(opts.input), list = $(opts.list), sugg = $(opts.sugg), items = [], hi = -1, shown = [];
  function render(){
    $$('.ch', box).forEach(function(c){ c.remove(); });
    items.forEach(function(v, i){
      var c = document.createElement('span'); c.className = 'ch';
      c.innerHTML = esc(v) + '<button type="button" aria-label="Remove ' + esc(v) + '"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l6 6M9 3L3 9"/></svg></button>';
      $('button', c).onclick = function(){ items.splice(i, 1); render(); input.focus(); };
      box.insertBefore(c, input);
    });
    input.placeholder = items.length ? (items.length >= opts.max ? '' : 'Add another') : opts.ph;
    input.disabled = items.length >= opts.max;
    renderSugg(); opts.change(items.slice());
  }
  function add(v){
    v = (v || '').trim(); if (!v) return;
    var exists = items.some(function(x){ return x.toLowerCase() === v.toLowerCase(); });
    if (!exists && items.length < opts.max) items.push(v);
    input.value = ''; close(); render(); if (!input.disabled) input.focus();
  }
  function close(){ list.hidden = true; input.setAttribute('aria-expanded', 'false'); hi = -1; }
  function open(){
    var q = input.value.trim().toLowerCase();
    if (!q){ close(); return; }
    shown = opts.source().filter(function(o){ var t = lab(o).toLowerCase(); return t.indexOf(q) > -1 && items.indexOf(lab(o)) < 0; }).slice(0, 7);
    var free = shown.every(function(o){ return lab(o).toLowerCase() !== q; });
    list.innerHTML = shown.map(function(o, i){ return '<button type="button" role="option" data-i="' + i + '">' + esc(lab(o)) + (Array.isArray(o) && o[1] ? '<small>' + esc(o[1]) + '</small>' : '') + '</button>'; }).join('') +
      (free && opts.free ? '<button type="button" role="option" data-free="1">Add “' + esc(input.value.trim()) + '”</button>' : '');
    if (!list.innerHTML){ close(); return; }
    list.hidden = false; input.setAttribute('aria-expanded', 'true'); hi = 0; mark();
    $$('button', list).forEach(function(b){ b.onmousedown = function(e){ e.preventDefault(); pick(b); }; });
  }
  function pick(b){ if (b.dataset.free) add(input.value); else { var o = shown[+b.dataset.i]; add(lab(o)); } }
  function mark(){ $$('button', list).forEach(function(b, i){ b.classList.toggle('on', i === hi); }); }
  function renderSugg(){
    if (!sugg) return;
    var s = opts.suggest().filter(function(x){ return items.indexOf(x) < 0; }).slice(0, 5);
    sugg.innerHTML = s.length && items.length < opts.max ? '<span class="sl">Suggested:</span>' + s.map(function(x){ return '<button type="button">' + esc(x) + '</button>'; }).join('') : '';
    $$('button', sugg).forEach(function(b){ b.onclick = function(){ add(b.textContent); }; });
  }
  input.addEventListener('input', open);
  input.addEventListener('blur', function(){ setTimeout(close, 120); });
  input.addEventListener('keydown', function(e){
    var bs = $$('button', list);
    if (e.key === 'ArrowDown' && !list.hidden){ hi = Math.min(hi + 1, bs.length - 1); mark(); e.preventDefault(); }
    else if (e.key === 'ArrowUp' && !list.hidden){ hi = Math.max(hi - 1, 0); mark(); e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === ','){
      if (!input.value.trim()) return;        /* empty: let Enter submit the step */
      e.preventDefault(); e.stopPropagation();
      if (!list.hidden && bs[hi]) pick(bs[hi]); else if (opts.free) add(input.value);
    }
    else if (e.key === 'Escape'){ close(); }
    else if (e.key === 'Backspace' && !input.value && items.length){ items.pop(); render(); }
  });
  box.addEventListener('click', function(e){ if (e.target === box) input.focus(); });
  return { set: function(a){ items = (a || []).slice(0, opts.max); render(); }, get: function(){ return items.slice(); }, refresh: renderSugg };
}

var roles = Chips({ box:'#roleChips', input:'#roleIn', list:'#roleAc', sugg:'#roleSugg', max:5, free:true, ph:'Start typing, e.g. Product Analyst',
  source: function(){ return ROLES; }, suggest: function(){ return SUGG[val('goal')] || SUGG['']; },
  change: function(a){ st = SMS.state({ roles: a }); err('roleErr'); preview(); } });
var locs = Chips({ box:'#locChips', input:'#locIn', list:'#locAc', sugg:'#locSugg', max:6, free:false, ph:'Add a city or Remote',
  source: function(){ return CITIES; }, suggest: function(){ return ['Remote','London','New York','Berlin','Singapore','Bengaluru']; },
  change: function(a){ st = SMS.state({ locations: a }); err('locErr'); preview(); } });

/* ---------- résumé upload ---------- */
var drop = $('#drop'), file = $('#file');
['dragenter','dragover'].forEach(function(t){ drop.addEventListener(t, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
['dragleave','drop'].forEach(function(t){ drop.addEventListener(t, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
drop.addEventListener('drop', function(e){ if (e.dataTransfer.files[0]) takeFile(e.dataTransfer.files[0]); });
file.addEventListener('change', function(){ if (file.files[0]) takeFile(file.files[0]); });
function takeFile(f){
  var ext = (f.name.split('.').pop() || '').toLowerCase();
  if (['pdf','doc','docx'].indexOf(ext) < 0){ err('fileErr', 'That file type isn\'t supported. Upload a PDF or Word document.'); return; }
  if (f.size > 5 * 1024 * 1024){ err('fileErr', 'That file is over 5 MB. Try a smaller PDF.'); return; }
  err('fileErr');
  showFile(f.name, f.size, true);
  /* TODO(api): upload the file here and keep the returned id */
}
function showFile(name, size, animate){
  drop.hidden = true; $('#fileRow').hidden = false;
  var ext = (name.split('.').pop() || '').toUpperCase();
  $('#fileIc').textContent = ext === 'DOCX' ? 'DOC' : ext; $('#fileIc').className = 'fi' + (ext === 'PDF' ? '' : ' w');
  $('#fileName').textContent = name;
  var kb = size ? (size > 1048576 ? (size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(size / 1024)) + ' KB') : '';
  var bar = $('#fileBar'), meta = $('#fileMeta');
  if (animate && !SMS.RM){
    bar.style.width = '0'; meta.textContent = 'Uploading…' + (kb ? ' · ' + kb : '');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ bar.style.width = '100%'; }); });
    setTimeout(function(){ done(); }, 950);
  } else { bar.style.width = '100%'; done(); }
  function done(){ meta.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>Uploaded' + (kb ? ' · ' + kb : ''); }
  st = SMS.state({ fileName: name, fileSize: size || 0, noCv: false }); preview();
}
$('#fileRm').addEventListener('click', function(){
  file.value = ''; $('#fileRow').hidden = true; drop.hidden = false;
  st = SMS.state({ fileName: '', fileSize: 0 }); preview(); file.focus();
});
$('#li').addEventListener('input', function(){ err('fileErr'); st = SMS.state({ profile: this.value.trim(), noCv: false }); preview(); });

/* ---------- live preview ---------- */
function preview(){
  var name = st.name || '', first = name.split(' ')[0];
  $('#pvName').textContent = name || 'Your profile';
  $('#pvAv').textContent = (first[0] || 'Y').toUpperCase();
  var g = val('goal'); $('#pvGoal').textContent = g || "Tell us what you're looking for";
  function row(id, v, empty, tags){
    var el = $('#' + id), r = el.closest('.pv-row');
    if (tags && v.length){ el.className = 'v'; el.innerHTML = '<span class="tags">' + v.map(function(x){ return '<i>' + esc(x) + '</i>'; }).join('') + '</span>'; }
    else if (!tags && v){ el.className = 'v'; el.textContent = v; }
    else { el.className = 'v empty'; el.textContent = empty; }
    r.classList.toggle('set', tags ? !!v.length : !!v);
  }
  row('pvExp', val('exp'), 'Not set');
  row('pvCv', st.fileName || (st.profile ? st.profile.replace(/^https?:\/\/(www\.)?/, '') : '') || (st.noCv ? 'Building from your answers' : ''), 'Not added');
  row('pvRoles', st.roles || [], 'None yet', true);
  var l = (st.locations || []).slice(); if (l.length) row('pvLoc', l, '', true); else row('pvLoc', [], 'None yet', true);
  var pct = 10 + (g ? 15 : 0) + (val('exp') ? 15 : 0) + ((st.fileName || st.profile) ? 25 : st.noCv ? 10 : 0) + ((st.roles || []).length ? 20 : 0) + ((st.locations || []).length ? 15 : 0);
  $('#pvPct').textContent = pct + '%'; $('#pvBar').style.width = pct + '%';
}

/* ---------- step navigation ---------- */
function go(n, push){
  step = n;
  $$('[data-step]').forEach(function(s){ s.hidden = +s.dataset.step !== n; });
  var sec = $('[data-step="' + n + '"]'); sec.classList.remove('view'); void sec.offsetWidth; sec.classList.add('view');
  $$('#steps li').forEach(function(li, i){ li.classList.toggle('on', i + 1 === n); li.classList.toggle('done', i + 1 < n); if (i + 1 === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
  $('#prog').style.width = ((n - 1) / TOTAL * 100 + 6) + '%';
  $('#backBtn').hidden = n === 1;
  $('#skipBtn').hidden = n !== 2;
  $('.lbl', $('#nextBtn')).textContent = n === TOTAL ? 'See my matches' : 'Continue';
  if (n === 3) roles.refresh();
  st = SMS.state({ step: n });
  if (push !== false) history.pushState({ step: n }, '', '#step-' + n);
  window.scrollTo(0, 0);
  var h = $('h1', sec); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
}
function check(n){
  if (n === 1){
    var a = err('goalErr', val('goal') ? '' : 'Pick the option that fits best.');
    var b = err('expErr', val('exp') ? '' : 'Choose your experience level.');
    return a && b;
  }
  if (n === 2){
    var li = $('#li').value.trim();
    if (st.fileName || st.noCv) return true;
    if (li && !/linkedin\.com\/(in|pub)\/[^\/\s]+/i.test(li)){ err('fileErr', 'That doesn\'t look like a LinkedIn profile link. It should look like linkedin.com/in/your-name.'); return false; }
    if (li) return true;
    return err('fileErr', 'Add your résumé or LinkedIn profile, or choose "I don\'t have one yet".');
  }
  if (n === 3) return err('roleErr', roles.get().length ? '' : 'Add at least one role you\'re aiming for.');
  if (n === 4){
    var c = err('locErr', locs.get().length ? '' : 'Add at least one city, or Remote.');
    var d = err('modeErr', vals('mode').length ? '' : 'Pick at least one work setup.');
    return c && d;
  }
  return true;
}
form.addEventListener('submit', function(e){
  e.preventDefault();
  if (!check(step)){ var m = $('[data-step="' + step + '"] .msg[style*="flex"]'); if (m) m.scrollIntoView({ block: 'center', behavior: SMS.RM ? 'auto' : 'smooth' }); return; }
  if (step < TOTAL) go(step + 1); else analyse();
});
$('#backBtn').addEventListener('click', function(){ if (step > 1) go(step - 1); });
$('#skipBtn').addEventListener('click', function(){ st = SMS.state({ noCv: true, fileName: '', profile: '' }); err('fileErr'); preview(); go(3); });
window.addEventListener('popstate', function(e){
  if ($('#body').hidden){ return; }
  var n = e.state && e.state.step; if (n && n !== step) go(n, false);
});
$$('input[name="goal"],input[name="exp"]').forEach(function(i){ i.addEventListener('change', function(){
  st = SMS.state({ goal: val('goal'), exp: val('exp') }); err(i.name === 'goal' ? 'goalErr' : 'expErr'); preview(); roles.refresh();
}); });
$$('input[name="mode"],input[name="when"],#reloc').forEach(function(i){ i.addEventListener('change', function(){
  st = SMS.state({ mode: vals('mode'), when: val('when'), reloc: $('#reloc').checked }); err('modeErr');
}); });
$('#exit').addEventListener('click', function(){ SMS.state({ saved: true }); });

/* ---------- analysing → results ---------- */
function analyse(){
  /* TODO(api): submit the profile and poll for the report */
  $('#body').hidden = true; $('#analysing').hidden = false;
  $$('#steps li').forEach(function(li){ li.classList.remove('on'); li.classList.add('done'); });
  $('#prog').style.width = '100%';
  window.scrollTo(0, 0);
  var lis = $$('#anSteps li'), ring = $('#ring'), pct = $('#ringPct'), C = 364.4, i = 0, p = 0;
  var dur = SMS.RM ? 300 : 3600, t0 = performance.now();
  (function tick(t){
    p = Math.min(1, (t - t0) / dur);
    var e = 1 - Math.pow(1 - p, 2);
    ring.style.strokeDashoffset = C * (1 - e); pct.textContent = Math.round(e * 100) + '%';
    var k = Math.min(lis.length - 1, Math.floor(p * lis.length));
    lis.forEach(function(li, j){ li.classList.toggle('done', j < k || p === 1); li.classList.toggle('on', j === k && p < 1); });
    if (p < 1) requestAnimationFrame(tick); else setTimeout(results, 450);
  })(t0);
}
var COS = ['google','microsoft','amazon','meta','dropbox','deloitte'];
var GAPS = {
  def: ['Stakeholder management','SQL','Experimentation','Storytelling with data','System design'],
  'Product': ['Experimentation','Roadmapping','SQL','Pricing'],
  'Data': ['dbt','Experiment design','Python','Looker'],
  'Engineer': ['System design','Kubernetes','Observability','Go'],
  'Design': ['Design systems','Usability testing','Motion','Accessibility']
};
function results(){
  $('#analysing').hidden = true; $('#results').hidden = false; window.scrollTo(0, 0);
  var rs = (st.roles && st.roles.length ? st.roles : ['Product Analyst','Data Analyst']).slice();
  var ls = (st.locations && st.locations.length ? st.locations : ['Remote']).slice();
  var mode = (st.mode && st.mode.length ? st.mode : ['Hybrid']);
  var list = [], fits = [93, 89, 86];
  for (var i = 0; i < 3; i++){
    var role = rs[i % rs.length], loc = ls[i % ls.length], co = COS[i];
    var where = loc === 'Remote' ? 'Remote' : loc + ' · ' + mode[i % mode.length];
    list.push('<div class="role"><span class="co"><img src="/photos/logos/' + co + '.png" alt="' + co + '" style="height:' + SMS.logoH(co, 1300) + 'px"></span><span><b>' + (i === 1 ? 'Senior ' : '') + esc(role) + '</b><span>' + esc(where) + '</span></span><span class="fit"><b>' + fits[i] + '%</b><span>fit</span></span></div>');
  }
  $('#roles').innerHTML = list.join('');
  var key = Object.keys(GAPS).filter(function(k){ return rs.join(' ').indexOf(k) > -1; })[0] || 'def';
  $('#gaps').innerHTML = GAPS[key].map(function(g){ return '<i>' + esc(g) + '</i>'; }).join('');
  var first = (st.name || '').split(' ')[0];
  $('#resH').textContent = (first ? first + ', you' : 'You') + "'re a strong fit for 24 open roles";
  var n = 0, target = 78, el = $('#scoreN');
  (function up(){ n += 2; el.textContent = Math.min(n, target); if (n < target && !SMS.RM) requestAnimationFrame(up); else el.textContent = target; })();
  $('#dash').href = SMS.DASHBOARD_URL;
  $('#dash').focus({ preventScroll: true });
}
$('#editPrefs').addEventListener('click', function(){ $('#results').hidden = true; $('#body').hidden = false; go(3); });
document.addEventListener('keydown', function(e){ if (e.key === 'Enter' && !$('#results').hidden && document.activeElement === document.body) $('#dash').click(); });

/* ---------- restore ---------- */
(function restore(){
  if (st.name){ $('#hi').textContent = 'Welcome, ' + st.name.split(' ')[0] + '.'; }
  if (st.goal){ var g = $('input[name="goal"][value="' + st.goal + '"]'); if (g) g.checked = true; }
  if (st.exp){ var x = $('input[name="exp"][value="' + st.exp + '"]'); if (x) x.checked = true; }
  if (st.fileName) showFile(st.fileName, st.fileSize, false);
  if (st.profile) $('#li').value = st.profile;
  if (st.mode){ $$('input[name="mode"]').forEach(function(i){ i.checked = st.mode.indexOf(i.value) > -1; }); }
  if (st.when){ var w = $('input[name="when"][value="' + st.when + '"]'); if (w) w.checked = true; }
  if (st.reloc) $('#reloc').checked = true;
  roles.set(st.roles || []); locs.set(st.locations || []);
  preview();
  var h = parseInt((location.hash.match(/step-(\d)/) || [])[1], 10);
  var start = h >= 1 && h <= TOTAL ? h : 1;
  history.replaceState({ step: start }, '', '#step-' + start);
  go(start, false);
  window.scrollTo(0, 0);
})();
})();
