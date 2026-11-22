/* SyncMySkills auth and onboarding: shared helpers.
   Front-end only. Every place that needs the real backend is marked "TODO(api)". */
(function(){
'use strict';

var SMS = window.SMS = {
  /* Where people land when they finish. TODO(api): point at the real app. */
  DASHBOARD_URL: 'https://syncmyskills.ai/',
  ROUTES: { signin: '/signin', signup: '/signup', onboarding: '/onboarding', home: '/' },
  RM: matchMedia('(prefers-reduced-motion: reduce)').matches
};

var $ = SMS.$ = function(s, r){ return (r || document).querySelector(s); };
var $$ = SMS.$$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

/* ---------- small state store (survives the sign-up → onboarding hop) ---------- */
var KEY = 'sms-onboarding';
SMS.state = function(patch){
  var s = {};
  try { s = JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch(e){}
  if (patch){ for (var k in patch) s[k] = patch[k]; try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch(e){} }
  return s;
};
SMS.clearState = function(){ try { sessionStorage.removeItem(KEY); } catch(e){} };

/* ---------- views inside one page (sign in / forgot / sent ...) ---------- */
SMS.show = function(id){
  $$('[data-view]').forEach(function(v){ v.hidden = v.dataset.view !== id; });
  var v = $('[data-view="' + id + '"]');
  if (!v) return;
  v.classList.remove('view'); void v.offsetWidth; v.classList.add('view');
  var f = $('[data-autofocus]', v) || $('input:not([type=hidden]):not([type=checkbox])', v);
  if (f && matchMedia('(pointer:fine)').matches) setTimeout(function(){ f.focus(); }, 60);
  window.scrollTo(0, 0);
};

/* ---------- field validation ---------- */
var ERR_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="8" r="6.4"/><path d="M8 4.8v3.6M8 11.1v.1"/></svg>';
SMS.fieldError = function(input, text){
  var fld = input.closest('.fld'); if (!fld) return;
  var m = $('.msg', fld);
  if (!m){ m = document.createElement('p'); m.className = 'msg'; m.id = input.id + '-err'; fld.appendChild(m); }
  if (text){
    fld.classList.add('bad'); m.innerHTML = ERR_ICON + '<span>' + text + '</span>';
    input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', m.id);
  } else {
    fld.classList.remove('bad'); input.removeAttribute('aria-invalid');
  }
  return !text;
};
SMS.isEmail = function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

/* Catch common email typos: "gmial.com" → "gmail.com" */
var DOMAINS = ['gmail.com','outlook.com','hotmail.com','yahoo.com','icloud.com','live.com','proton.me','protonmail.com','aol.com','msn.com'];
function dist(a, b){
  var m = [], i, j;
  for (i = 0; i <= b.length; i++) m[i] = [i];
  for (j = 0; j <= a.length; j++) m[0][j] = j;
  for (i = 1; i <= b.length; i++) for (j = 1; j <= a.length; j++)
    m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1] : Math.min(m[i-1][j-1] + 1, m[i][j-1] + 1, m[i-1][j] + 1);
  return m[b.length][a.length];
}
SMS.emailSuggest = function(input){
  var fld = input.closest('.fld'), hint = $('.hint.typo', fld);
  if (!hint){ hint = document.createElement('p'); hint.className = 'hint typo'; hint.hidden = true; fld.appendChild(hint); }
  function check(){
    var v = input.value.trim().toLowerCase(), at = v.lastIndexOf('@');
    hint.hidden = true;
    if (at < 1) return;
    var d = v.slice(at + 1); if (!d || DOMAINS.indexOf(d) > -1) return;
    var best = null, bd = 3;
    DOMAINS.forEach(function(x){ var k = dist(d, x); if (k < bd){ bd = k; best = x; } });
    if (best && bd <= 2){
      var fixed = v.slice(0, at + 1) + best;
      hint.innerHTML = 'Did you mean <button type="button">' + fixed + '</button>?';
      hint.hidden = false;
      $('button', hint).onclick = function(){ input.value = fixed; hint.hidden = true; SMS.fieldError(input); input.focus(); };
    }
  }
  input.addEventListener('blur', check);
  input.addEventListener('input', function(){ hint.hidden = true; });
};

/* ---------- show / hide password ---------- */
SMS.eyes = function(root){
  $$('.inp .eye', root).forEach(function(b){
    b.addEventListener('click', function(){
      var i = $('input', b.parentNode), on = i.type === 'password';
      i.type = on ? 'text' : 'password';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', on ? 'Hide password' : 'Show password');
    });
  });
};

/* ---------- password strength ---------- */
SMS.strength = function(input, meter, rules){
  function run(){
    var v = input.value, r = {
      len: v.length >= 8,
      mix: /[a-z]/.test(v) && /[A-Z]/.test(v),
      num: /\d/.test(v),
      sym: /[^A-Za-z0-9]/.test(v)
    };
    var s = v ? (r.len ? 1 : 0) + (r.mix ? 1 : 0) + (r.num ? 1 : 0) + (r.sym ? 1 : 0) : 0;
    if (v && !r.len) s = Math.min(s, 1);
    meter.dataset.s = s;
    $$('li', rules).forEach(function(li){ li.classList.toggle('ok', !!r[li.dataset.r]); });
    var lbl = ['', 'Weak', 'Fair', 'Good', 'Strong'][s];
    meter.setAttribute('aria-label', v ? 'Password strength: ' + lbl : 'Password strength');
    return r;
  }
  input.addEventListener('input', run); run();
  return run;
};

/* ---------- busy state on 3D buttons ---------- */
SMS.busy = function(btn, on, label){
  if (!btn) return;
  btn.classList.toggle('busy', on);
  btn.setAttribute('aria-busy', on ? 'true' : 'false');
  var l = $('.lbl', btn);
  if (l){
    if (on){ btn.dataset.lbl = l.textContent; if (label) l.textContent = label; }
    else if (btn.dataset.lbl){ l.textContent = btn.dataset.lbl; }
  }
};
SMS.wait = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };

/* ---------- one-time code boxes ---------- */
SMS.otp = function(wrap, onDone){
  var boxes = $$('input', wrap);
  function code(){ return boxes.map(function(b){ return b.value; }).join(''); }
  function fill(str, from){
    str = str.replace(/\D/g, '');
    for (var i = 0; i < str.length && from + i < boxes.length; i++){ boxes[from + i].value = str[i]; boxes[from + i].classList.add('filled'); }
    var nx = Math.min(from + str.length, boxes.length - 1); boxes[nx].focus();
    if (code().length === boxes.length) onDone(code());
  }
  boxes.forEach(function(b, i){
    b.addEventListener('input', function(){
      wrap.classList.remove('bad');
      var v = b.value.replace(/\D/g, '');
      if (v.length > 1){ b.value = ''; fill(v, i); return; }
      b.value = v; b.classList.toggle('filled', !!v);
      if (v && i < boxes.length - 1) boxes[i + 1].focus();
      if (code().length === boxes.length) onDone(code());
    });
    b.addEventListener('keydown', function(e){
      if (e.key === 'Backspace' && !b.value && i > 0){ boxes[i - 1].value = ''; boxes[i - 1].classList.remove('filled'); boxes[i - 1].focus(); e.preventDefault(); }
      if (e.key === 'ArrowLeft' && i > 0){ boxes[i - 1].focus(); e.preventDefault(); }
      if (e.key === 'ArrowRight' && i < boxes.length - 1){ boxes[i + 1].focus(); e.preventDefault(); }
    });
    b.addEventListener('paste', function(e){
      var t = (e.clipboardData || window.clipboardData).getData('text'); e.preventDefault(); fill(t, i);
    });
    b.addEventListener('focus', function(){ b.select(); });
  });
  return {
    reset: function(bad){ boxes.forEach(function(b){ b.value = ''; b.classList.remove('filled'); }); wrap.classList.toggle('bad', !!bad); boxes[0].focus(); },
    code: code
  };
};

/* ---------- resend timer ---------- */
SMS.countdown = function(btn, secs){
  var t = secs, base = btn.dataset.base || btn.textContent; btn.dataset.base = base;
  btn.disabled = true;
  (function tick(){
    if (t <= 0){ btn.disabled = false; btn.textContent = base; return; }
    btn.textContent = base + ' in 0:' + (t < 10 ? '0' : '') + t; t--; setTimeout(tick, 1000);
  })();
};

/* =========================================================
   Brand panel: pixel dither edges + rotating match cards
   ========================================================= */
var DPR = Math.min(window.devicePixelRatio || 1, 2);
SMS.pixels = function(c){
  var x = c.getContext('2d'), cols, rows, S, st, acc = (c.dataset.acc || '#79D5F5,#F8F5EA,#2A6BE6').split(',');
  function pick(r){ var t = (r + .5) / rows, u = Math.random(), p = Math.pow(1 - t, 2.2) * .9; return u < p ? Math.floor(Math.random() * acc.length) : -1; }
  function size(){
    var W = Math.round(c.offsetWidth * DPR), H = Math.round(c.offsetHeight * DPR);
    if (!W) return;
    c.width = W; c.height = H; S = Math.round(10 * DPR);
    cols = Math.ceil(W / S); rows = Math.ceil(H / S); st = new Int8Array(cols * rows);
    x.clearRect(0, 0, W, H);
    for (var i = 0; i < st.length; i++){ st[i] = pick(Math.floor(i / cols)); paint(i); }
  }
  function paint(i){ var r = Math.floor(i / cols), q = i % cols; x.clearRect(q * S, r * S, S, S); if (st[i] >= 0){ x.fillStyle = acc[st[i]]; x.fillRect(q * S, r * S, S, S); } }
  size(); addEventListener('resize', size);
  if (!SMS.RM) setInterval(function(){
    if (document.hidden || !st) return;
    for (var n = Math.floor(st.length * .015), k = 0; k < n; k++){ var j = Math.floor(Math.random() * st.length), s = pick(Math.floor(j / cols)); if (s !== st[j]){ st[j] = s; paint(j); } }
  }, 160);
};

/* Logo aspect ratios (width / height), same as the landing page, for optical sizing */
var LR = {google:2.23,microsoft:2.39,amazon:2.94,meta:4.9,deloitte:5.23,ibm:2.05,oracle:2.83,dropbox:2.31,fedex:3.24};
var LW = {microsoft:1.1,deloitte:.9,ibm:.92,dropbox:1.05,fedex:.95};
SMS.logoH = function(k, area){ return Math.round(Math.sqrt(area / LR[k]) * (LW[k] || 1)); };

var PEOPLE = [
  {p:'meera', n:'Meera Iyer', r:'Product analyst', fit:92, co:'microsoft', job:'Senior Product Analyst', loc:'London · Hybrid', sk:[['SQL',92],['Product sense',84],['Experimentation',58,1]]},
  {p:'kabir', n:'Kabir Shah', r:'Backend engineer', fit:88, co:'google', job:'Software Engineer II, Cloud', loc:'Dublin · On-site', sk:[['Go and Python',90],['Distributed systems',78],['Kubernetes',52,1]]},
  {p:'sana', n:'Sana Qureshi', r:'UX designer', fit:90, co:'dropbox', job:'Product Designer', loc:'Remote · Europe', sk:[['Interaction design',94],['Prototyping',86],['Design systems',61,1]]}
];
function cardHTML(d){
  var h = SMS.logoH(d.co, 1500);
  return '<div class="mc-top"><img class="pp" src="/photos/people/' + d.p + '.jpg" alt="" width="88" height="88"><div><div class="nm">' + d.n + '</div><div class="rl">' + d.r + '</div></div>' +
    '<div class="mc-fit"><b>' + d.fit + '%</b><span>fit</span></div></div>' +
    '<div class="mc-job"><div class="co"><img src="/photos/logos/' + d.co + '.png" alt="' + d.co + '" style="height:' + h + 'px"></div><div class="t"><b>' + d.job + '</b><span>' + d.loc + '</span></div></div>' +
    '<ul class="mc-sk">' + d.sk.map(function(s){ return '<li><span>' + s[0] + (s[2] ? ' <span style="color:#7A3A00">· gap</span>' : '') + '</span><span class="bar' + (s[2] ? ' gap' : '') + '"><i style="--w:' + s[1] + '%"></i></span></li>'; }).join('') + '</ul>';
}
SMS.panel = function(){
  $$('.au-side canvas.px').forEach(SMS.pixels);
  var stack = $('.stack'); if (!stack) return;
  var dots = $('.dots'), cards = PEOPLE.map(function(d, i){
    var el = document.createElement('div'); el.className = 'mc' + (i ? ' next' : ''); el.innerHTML = cardHTML(d);
    el.setAttribute('aria-hidden', i ? 'true' : 'false'); stack.appendChild(el);
    if (dots){ var dt = document.createElement('i'); if (!i) dt.className = 'on'; dots.appendChild(dt); }
    return el;
  });
  var cur = 0;
  if (SMS.RM) return;
  setInterval(function(){
    if (document.hidden) return;
    var a = cards[cur], n = (cur + 1) % cards.length, b = cards[n];
    a.classList.add('out'); a.setAttribute('aria-hidden', 'true');
    b.classList.remove('next', 'out'); b.setAttribute('aria-hidden', 'false');
    setTimeout(function(){ a.classList.remove('out'); a.classList.add('next'); }, 650);
    if (dots){ $$('i', dots).forEach(function(d, i){ d.classList.toggle('on', i === n); }); }
    cur = n;
  }, 5000);
};

document.addEventListener('DOMContentLoaded', function(){ SMS.eyes(document); });
})();
