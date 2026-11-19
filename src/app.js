(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const fam = t => typeFamily(t);
const tyBadge = t => `<span class="ty f-${fam(t)}">${esc(t === 'UNKNOWN' ? 'TEXT' : t)}</span>`;
const keyBadges = c => (c.pk ? '<span class="key pk" title="Primary key">PK</span>' : '') + (c.fk ? `<span class="key fk" title="Foreign key → ${c.fk.table}.${c.fk.col}">FK</span>` : '');
const MOD = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl';
const KEY_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="8" r="3.3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.3 8H15M12.3 8v3M14.8 8v2.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const LINK_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.6 9.4l2.8-2.8M7.4 4.6l1.2-1.2a2.9 2.9 0 0 1 4.1 4.1l-1.2 1.2M8.6 11.4l-1.2 1.2a2.9 2.9 0 0 1-4.1-4.1l1.2-1.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
const FUNNEL_SVG = '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M1.5 2.5h13l-5 6v5l-3 1.5v-6.5z" fill="currentColor"/></svg>';

const START_SQL = "SELECT customers.first_name, orders.order_id, orders.status\nFROM customers\nJOIN orders ON orders.customer_id = customers.customer_id\nWHERE orders.status = 'delivered';";
const NEW_TABLE_SQL = `CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(product_id),
  customer_id INT REFERENCES customers(customer_id),
  rating SMALLINT NOT NULL,
  comment VARCHAR(100)
);

INSERT INTO reviews (product_id, customer_id, rating, comment)
VALUES (101, 1, 5, 'Great sound for the price'),
       (111, 1, 4, 'Keeps water cold all day'),
       (107, 2, 5, 'Perfect for my SQL class'),
       (104, 3, 5, 'Razor sharp out of the box'),
       (105, 3, 4, 'Makes a solid espresso'),
       (108, 4, 2, 'Arrived later than expected'),
       (102, 5, 4, 'Charges fast'),
       (109, 6, 5, 'Good grip and easy to clean'),
       (101, 7, 4, 'Comfortable fit'),
       (103, 8, 3, 'Battery could be better');`;

const S = { sql: '', ast: null, ex: null, err: null, script: null, pendingSel: null, hist: [], hi: -1, dataHist: [], dataVer: 0, committed: null, justIns: null, notice: null, rowSel: null, drawer: null, scale: 1, fly: null };
const tableDef = t => DB.tables[t] || ((S.ex && S.ex.sources || []).find(s => s.table === t) || {}).def || null;
const tcolor = t => (tableDef(t) || {}).color || '#6b7385';
const aliasTable = a => { const s = S.ex && S.ex.sources && S.ex.sources.find(s => s.alias === a); return s ? s.table : a; };

/* ===================== Editor ===================== */
const ed = $('#sql'), hl = $('#hl'), hlBack = $('#hlBack'), hlFlash = $('#hlFlash');
const HLKW = new Set('CREATE TABLE INSERT INTO VALUES DELETE DROP PRIMARY KEY REFERENCES FOREIGN UNIQUE DEFAULT CONSTRAINT IF EXISTS CASCADE'.split(' '));
const HLTY = new Set('INT INTEGER SMALLINT BIGINT SERIAL BIGSERIAL NUMERIC DECIMAL REAL DOUBLE PRECISION VARCHAR CHAR CHARACTER VARYING TEXT TIMESTAMP BOOLEAN BOOL'.split(' '));
const FN = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'LOWER', 'UPPER', 'LENGTH', 'COALESCE', 'CONCAT', 'ABS', 'TRIM', 'NULLIF', 'GREATEST', 'LEAST']);
function aliasMap(src) {
  const m = {}, re = /\b(?:from|join|update|into)\s+([A-Za-z_][A-Za-z0-9_]*)\s+(?:as\s+)?([A-Za-z_][A-Za-z0-9_]*)/gi; let x;
  while ((x = re.exec(src))) { const t = x[1].toLowerCase(), al = x[2].toLowerCase(); if (DB.tables[t] && !KW.has(al.toUpperCase()) && !HLKW.has(al.toUpperCase()) && al !== 'values') m[al] = t; re.lastIndex = x.index + x[0].length - x[2].length; }
  return m;
}
function highlight(src) {
  const AL = aliasMap(src);
  const re = /(--[^\n]*)|('(?:[^']|'')*'?)|("[^"]*"?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ɏ][A-Za-z0-9_À-ɏ]*)|(<>|!=|<=|>=|::|\|\||[=<>*+\-\/%,;().])/g;
  let out = '', last = 0, m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(last, m.index)); last = re.lastIndex;
    const t = m[0];
    if (m[1]) out += `<span class="k-com">${esc(t)}</span>`;
    else if (m[2]) out += `<span class="k-str">${esc(t)}</span>`;
    else if (m[3]) out += esc(t);
    else if (m[4]) out += `<span class="k-num">${t}</span>`;
    else if (m[5]) {
      const u = t.toUpperCase(), l = t.toLowerCase();
      if (KW.has(u) || HLKW.has(u)) out += `<span class="k-kw">${esc(t)}</span>`;
      else if (HLTY.has(u) || (u === 'DATE' && !/^\s*'/.test(src.slice(last)))) out += `<span class="k-ty f-${fam(u === 'DOUBLE' || u === 'PRECISION' ? 'REAL' : u === 'VARYING' || u === 'CHARACTER' ? 'TEXT' : u)}">${esc(t)}</span>`;
      else if (FN.has(u) && /^\s*\(/.test(src.slice(last))) out += `<span class="k-fn">${esc(t)}</span>`;
      else if (DB.tables[l]) out += `<span class="k-tbl" style="color:${tcolor(l)}">${esc(t)}</span>`;
      else if (AL[l]) out += `<span class="k-tbl k-alias" style="color:${tcolor(AL[l])}" title="alias for ${AL[l]}">${esc(t)}</span>`;
      else out += esc(t);
    } else out += `<span class="k-op">${esc(t)}</span>`;
  }
  return out + esc(src.slice(last)) + '\n';
}
function renderHL() { hl.innerHTML = highlight(ed.value); markSpan(null); syncScroll(); }
function syncScroll() { hl.scrollTop = hlBack.scrollTop = hlFlash.scrollTop = ed.scrollTop; }
function markSpan(span) {
  const t = ed.value;
  if (!span) { hlBack.textContent = t + '\n'; return; }
  hlBack.innerHTML = esc(t.slice(0, span[0])) + '<mark>' + esc(t.slice(span[0], span[1])) + '</mark>' + esc(t.slice(span[1])) + '\n';
  syncScroll();
}
function flashLines(oldT, newT) {
  const old = new Set(oldT.split('\n').map(s => s.trim()));
  hlFlash.innerHTML = newT.split('\n').map(l => old.has(l.trim()) ? esc(l) : `<span class="fl">${esc(l) || ' '}</span>`).join('\n') + '\n';
  syncScroll();
}
ed.addEventListener('scroll', syncScroll);
let typeTimer = null;
ed.addEventListener('input', () => {
  renderHL();
  clearTimeout(typeTimer);
  typeTimer = setTimeout(() => { S.sql = ed.value; run(); pushHist(ed.value); }, 380);
});
ed.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runNow(); }
  if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); const s = ed.selectionStart; ed.setRangeText('  ', s, ed.selectionEnd, 'end'); ed.dispatchEvent(new Event('input')); }
});

function pushHist(t) {
  if (S.hist[S.hi] === t) return;
  S.hist = S.hist.slice(0, S.hi + 1); S.hist.push(t); S.hi = S.hist.length - 1; updHistBtns();
}
function updHistBtns() { $('#undo').disabled = S.hi <= 0; $('#redo').disabled = S.hi >= S.hist.length - 1; }
$('#undo').onclick = () => { if (S.hi > 0) { S.hi--; setSQL(S.hist[S.hi], { gui: true, record: false }); updHistBtns(); } };
$('#redo').onclick = () => { if (S.hi < S.hist.length - 1) { S.hi++; setSQL(S.hist[S.hi], { gui: true, record: false }); updHistBtns(); } };
function setSQL(text, opts = {}) {
  const old = ed.value;
  ed.value = text; S.sql = text;
  if (opts.gui) flashLines(old, text);
  renderHL();
  if (opts.record !== false) pushHist(text);
  run();
}

/* ===================== Running statements and scripts ===================== */
const asErr = e => { if (!(e instanceof SqlError)) { console.error(e); const n = new SqlError(String(e.message || e)); n.stmtIndex = e.stmtIndex; return n; } return e; };
const baseAstFor = ex => ex && ex.table && ex.kind !== 'DROP' && DB.tables[ex.table] ? parse(`SELECT * FROM ${ex.table};`) : null;
function run() {
  closePop();
  if (S.rowSel) { if (S.sql === S.rowSel.genText) { renderStatus(); renderResult(); return; } S.rowSel = null; }
  if (S.committed && S.sql === S.committed.sql) { renderStatus(); renderAll(); return; }
  S.notice = null;
  if (!S.sql.trim()) { S.ast = null; S.ex = null; S.err = null; S.script = null; renderStatus(); renderAll(); renderStmtChips(); return; }
  let stmts;
  try { stmts = parseScript(S.sql); }
  catch (e) { S.err = asErr(e); S.script = null; renderStatus(); renderAll(); renderStmtChips(); return; }
  if (stmts.length === 1) {
    S.script = null;
    try {
      const ast = stmts[0], ex = runStmt(ast);
      if (ex.kind === 'NOOP') { S.notice = ex.msg; S.err = null; S.ex = null; S.ast = null; renderStatus(); renderAll(); renderStmtChips(); return; }
      ex.src = S.sql;
      S.ast = ast.kind === 'SELECT' ? ast : baseAstFor(ex);
      S.ex = ex; S.err = null;
    } catch (e) { S.err = asErr(e); }
  } else runScript(stmts);
  renderStatus(); renderAll(); renderStmtChips();
}
/* Preview a script: run each statement in order on a scratch copy of the data, then put the real data back. */
function runScript(stmts) {
  const snap = snapshotDB(), results = [];
  let err = null;
  try {
    for (let i = 0; i < stmts.length; i++) {
      try {
        const ex = runStmt(stmts[i]);
        ex.src = S.sql; ex.stmtIndex = i;
        if (ex.sources) ex.sources = ex.sources.map(s => Object.assign({}, s, { def: JSON.parse(JSON.stringify(s.def)) }));
        if (ex.apply) ex.apply();
        ex.base = ex.kind === 'SELECT' ? stmts[i] : null;
        results.push(ex);
      } catch (e) { err = asErr(e); err.stmtIndex = i; break; }
    }
  } finally { restoreDB(snap); }
  const prev = S.script;
  let sel = S.pendingSel != null ? S.pendingSel : prev && prev.sel != null && prev.stmts.length === stmts.length ? prev.sel : caretStmt(stmts);
  S.pendingSel = null;
  if (sel == null || sel >= results.length) sel = results.length - 1;
  S.script = { stmts, results, err, sel };
  S.err = err;
  if (sel >= 0) showScriptSel(sel, true); else { S.ex = null; S.ast = null; }
}
function caretStmt(stmts) {
  if (document.activeElement !== ed) return stmts.length - 1;
  const c = ed.selectionStart;
  let i = stmts.findIndex(s => c >= s.range[0] && c <= s.range[1]);
  if (i < 0) i = stmts.findIndex(s => c < s.range[0]);
  return i < 0 ? stmts.length - 1 : i;
}
function showScriptSel(i, quiet) {
  const sc = S.script; if (!sc || !sc.results[i]) return;
  sc.sel = i;
  const ex = sc.results[i];
  if (ex.kind === 'NOOP') { S.ex = null; S.ast = null; S.notice = ex.msg; }
  else { S.ex = ex; S.ast = ex.base || (ex.table && ex.kind !== 'DROP' ? parse(`SELECT * FROM ${ex.table};`) : null); }
  if (!quiet) { renderStatus(); renderAll(); renderStmtChips(); }
}
const stmtLabel = st => st.kind === 'SELECT' ? `SELECT · ${st.from.table}` : st.kind === 'CREATE' ? `CREATE TABLE ${st.name}` : st.kind === 'INSERT' ? `INSERT INTO ${st.table}` : st.kind === 'DELETE' ? `DELETE FROM ${st.table}` : `DROP TABLE ${st.name}`;
function renderStmtChips() {
  const el = $('#stmts'), sc = S.script;
  el.hidden = !sc || (S.committed && S.sql === S.committed.sql);
  if (el.hidden) return;
  el.innerHTML = `<span class="stl">Statements</span>` + sc.stmts.map((st, i) => {
    const r = sc.results[i], bad = sc.err && sc.err.stmtIndex === i, skip = !r && !bad;
    const info = r ? (r.kind === 'SELECT' ? `${r.rows.length} rows` : r.kind === 'INSERT' ? `+${r.newRows.length}` : r.kind === 'DELETE' ? `−${r.mark.filter(Boolean).length}` : '') : bad ? 'error' : 'not run';
    return `<button class="stc${i === sc.sel ? ' on' : ''}${bad ? ' bad' : ''}${skip ? ' skip' : ''}" data-i="${i}" ${r ? '' : 'disabled'} aria-pressed="${i === sc.sel}" title="${r ? 'Show this statement' : bad ? 'This statement has an error' : 'Not run because an earlier statement failed'}"><span class="n">${i + 1}</span>${esc(stmtLabel(st))}<span class="cnt">${info}</span></button>`;
  }).join('');
  el.querySelectorAll('.stc[data-i]').forEach(b => {
    b.onclick = () => showScriptSel(+b.dataset.i);
    b.onmouseenter = () => markSpan(sc.stmts[+b.dataset.i].range);
    b.onmouseleave = () => markSpan(null);
  });
}
['click', 'keyup'].forEach(ev => ed.addEventListener(ev, e => {
  if (ev === 'keyup' && !/^(Arrow|Home|End|Page)/.test(e.key)) return;
  const sc = S.script; if (!sc || ed.value !== S.sql || S.rowSel) return;
  const i = caretStmt(sc.stmts);
  if (i !== sc.sel && sc.results[i]) showScriptSel(i);
}));
function runNow() {
  clearTimeout(typeTimer); S.sql = ed.value; pushHist(ed.value);
  S.rowSel = null;
  if (S.committed && S.sql === S.committed.sql) S.committed = null;
  run();
  if (S.err) return;
  if (S.script) { if (S.script.results.some(r => r.apply)) commitScript(); return; }
  if (S.ex && S.ex.apply) commit();
}
function afterChangeView(last) {
  if (!last || last.kind === 'DROP' || last.kind === 'NOOP') { S.ex = null; S.ast = null; return; }
  if (last.kind === 'SELECT') return;
  S.ast = parse(`SELECT * FROM ${last.table};`); S.ex = execute(S.ast); S.ex.src = '';
}
function commitScript() {
  const stmts = S.script.stmts, msgs = [];
  S.dataHist.push({ snap: snapshotDB(), sql: S.sql });
  let last = null, lastAst = null, err = null;
  for (let i = 0; i < stmts.length; i++) {
    try {
      const ex = runStmt(stmts[i]);
      if (ex.apply) { const r = ex.apply(); msgs.push(typeof r === 'string' ? r : r.msg); if (ex.kind === 'INSERT') S.justIns = { table: ex.table, from: r.from }; }
      else if (ex.kind === 'NOOP') msgs.push(ex.msg);
      last = ex; lastAst = stmts[i];
    } catch (e) { err = asErr(e); err.stmtIndex = i; break; }
  }
  S.dataVer++; S.script = null;
  if (err) { err.partial = true; S.err = err; S.ex = null; S.ast = null; renderChanges(); renderStatus(); renderAll(); renderStmtChips(); return; }
  S.committed = { sql: S.sql, msg: `${stmts.length} statements · ` + (msgs.join(' · ') || 'nothing to change') };
  if (last.kind === 'SELECT') { S.ast = lastAst; S.ex = execute(lastAst); S.ex.src = ''; } else afterChangeView(last);
  S.err = null;
  renderChanges(); renderStatus(); renderAll(); renderStmtChips(); toast(`Applied ${stmts.length} statements`);
}
function commit() {
  const ex = S.ex;
  S.dataHist.push({ snap: snapshotDB(), sql: S.sql });
  const doIt = () => {
    const res = ex.apply(); const msg = typeof res === 'string' ? res : res.msg;
    S.dataVer++; S.committed = { sql: S.sql, msg };
    if (ex.kind === 'INSERT') S.justIns = { table: ex.table, from: res.from };
    afterChangeView(ex);
    S.err = null;
    renderChanges(); renderStatus(); renderAll(); toast(msg);
  };
  if (ex.kind === 'DELETE' || ex.kind === 'DROP') {
    $$('#resultWrap tbody tr.del, #drawer tbody tr.del').forEach(tr => tr.classList.add('gone'));
    setTimeout(doIt, 520);
  } else doIt();
}
function renderChanges() {
  const el = $('#changes'), n = S.dataHist.length;
  el.hidden = !n;
  if (!n) return;
  el.innerHTML = `<span><b>Database changed</b> · ${n} change${n === 1 ? '' : 's'} applied</span><span class="sp"></span><button id="undoData" title="Revert the last CREATE / INSERT / DELETE / DROP">Undo last change</button><button id="restoreData" title="Put the sample data back the way it started">Restore sample data</button>`;
  $('#undoData').onclick = () => { const h = S.dataHist.pop(); restoreDB(h.snap); afterDataRestore(`Reverted: ${h.sql.split('\n')[0].slice(0, 60)}`); };
  $('#restoreData').onclick = () => { S.dataHist = []; resetDB(); afterDataRestore('Sample data restored'); };
}
function afterDataRestore(msg) { S.dataVer++; S.committed = null; S.rowSel = null; renderChanges(); run(); toast(msg); }
function renameQualifier(text, from, to) {
  const re = new RegExp('(^|[^A-Za-z0-9_."])' + from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\.', 'gi');
  return text.split(/('(?:[^']|'')*'?)/).map((part, i) => i % 2 ? part : part.replace(re, (m, pre) => pre + to + '.')).join('');
}
function renderStatus() {
  const st = $('#status'); $('#editor').classList.toggle('err', !!S.err);
  st.className = 'status';
  const sc = S.script, kbd = `<kbd>${MOD}</kbd>+<kbd>Enter</kbd>`;
  if (S.rowSel) {
    const n = S.rowSel.sel.size;
    st.className = 'status pend';
    st.innerHTML = `<span class="warn">${n} row${n === 1 ? '' : 's'} highlighted.</span> The SQL now returns just ${n === 1 ? 'this row' : 'these rows'}. Press <b>Run</b> (${kbd}) to show only ${n === 1 ? 'it' : 'them'}, or <button class="linkbtn" id="clearSel">clear the highlight</button> (<kbd>Esc</kbd>).`;
    $('#clearSel').onclick = clearRowSel;
  } else if (S.err) {
    st.className = 'status err';
    const where = S.err.stmtIndex != null && (sc || S.err.stmtCount > 1 || S.err.partial) ? `Statement ${S.err.stmtIndex + 1}: ` : '';
    st.innerHTML = `<b>ERROR:</b> ${where}${esc(S.err.message)}${S.err.hint ? `<div class="hintline">${esc(S.err.hint)}</div>` : ''}${S.err.partial && S.err.stmtIndex > 0 ? `<div class="hintline">Statements 1–${S.err.stmtIndex} were applied. "Undo last change" reverts them.</div>` : ''}${S.err.fix ? `<div class="hintline"><button class="applybtn" id="fixBtn">Fix: change ${esc(S.err.fix.from)}. to ${esc(S.err.fix.to)}. everywhere</button></div>` : ''}`;
    if (S.err.fix) { const f = S.err.fix; $('#fixBtn').onclick = () => setSQL(renameQualifier(ed.value, f.from, f.to), { gui: true }); }
  } else if (S.committed && S.sql === S.committed.sql) {
    st.innerHTML = `<span class="ok">✓ Applied</span> · ${esc(S.committed.msg)}${S.ex ? '. The result now shows the table.' : ''}`;
  } else if (sc && sc.results.some(r => r.apply)) {
    st.className = 'status pend';
    st.innerHTML = `<span class="warn">Preview</span> · ${sc.stmts.length} statements, run in order. Nothing has changed yet.<ol class="stmtsum">${sc.results.map(r => `<li>${r.apply ? r.summary : r.kind === 'SELECT' ? `SELECT returns ${r.rows.length} row${r.rows.length === 1 ? '' : 's'}` : esc(r.msg || '')}</li>`).join('')}</ol><div class="hintline"><button class="applybtn" id="applyBtn">▶ Run all to apply</button> or press ${kbd}</div>`;
    $('#applyBtn').onclick = runNow;
  } else if (S.notice) {
    st.textContent = S.notice;
  } else if (S.ex && S.ex.apply) {
    st.className = 'status pend';
    st.innerHTML = `<span class="warn">Preview</span> · ${S.ex.summary}. Nothing has changed yet.<div class="hintline"><button class="applybtn" id="applyBtn">▶ Run to apply</button> or press ${kbd}</div>`;
    $('#applyBtn').onclick = runNow;
  } else if (S.ex) {
    const n = S.ex.rows.length;
    st.innerHTML = `<span class="ok">✓ Ran</span> · ${sc ? `${sc.stmts.length} statements · showing #${sc.sel + 1}: ` : ''}${n} row${n === 1 ? '' : 's'} × ${S.ex.cols.length} column${S.ex.cols.length === 1 ? '' : 's'}`;
  } else st.textContent = 'Click a table in the diagram to start, or type SQL here.';
  $('#stale').hidden = !(S.err && S.ex);
}

/* ===================== Query building (GUI → SQL) ===================== */
const srcList = q => q ? [q.from, ...q.joins].map(r => ({ alias: r.alias || r.table, table: r.table, def: tableDef(r.table) })) : [];
const newQuery = t => ({ distinct: false, select: [{ expr: { k: 'star' } }], from: { table: t, alias: t }, joins: [], where: null, groupBy: [], having: null, orderBy: [], limit: null, offset: null });
const refFor = (q, alias, col) => srcList(q).length > 1 ? { k: 'col', table: alias, name: col } : { k: 'col', name: col };
const aliasIn = (q, t) => (srcList(q).find(s => s.table === t) || {}).alias;
function sameCol(e, alias, col, q) {
  if (!e || e.k !== 'col' || e.name !== col) return false;
  if (e.table) return e.table === alias;
  try { return resolveCol(e, srcList(q)).alias === alias; } catch { return false; }
}
function allExprs(q) { return q.select.map(i => i.expr).concat(q.joins.map(j => j.on).filter(Boolean), q.where ? [q.where] : [], q.groupBy, q.having ? [q.having] : [], q.orderBy.map(o => o.expr)); }
function qualifyAll(q) {
  const srcs = srcList(q);
  allExprs(q).forEach(e => walk(e, n => { if (n.k === 'col' && !n.table) { try { n.table = resolveCol(n, srcs).alias; } catch {} } }));
}
function findFK(table, srcs) {
  const def = tableDef(table);
  for (let i = srcs.length - 1; i >= 0; i--) {
    const s = srcs[i];
    for (const c of def.cols) if (c.fk && c.fk.table === s.table)
      return { k: 'bin', op: '=', l: { k: 'col', table, name: c.name }, r: { k: 'col', table: s.alias, name: c.fk.col } };
    for (const c of s.def.cols) if (c.fk && c.fk.table === table)
      return { k: 'bin', op: '=', l: { k: 'col', table, name: c.fk.col }, r: { k: 'col', table: s.alias, name: c.name } };
  }
  return null;
}
function mutate(fn) {
  const q = S.ast ? clone(S.ast) : null;
  S.rowSel = null;
  const r = fn(q);
  if (r === null) return;
  const nq = r || q; if (!nq) return;
  delete nq.spans; delete nq.range;
  writeQuery(genQuery(nq));
}
function writeQuery(text) {
  const sc = S.script;
  if (sc && ed.value === S.sql && sc.stmts[sc.sel]) {
    const st = sc.stmts[sc.sel], full = ed.value;
    if (st.kind === 'SELECT') { S.pendingSel = sc.sel; setSQL(full.slice(0, st.range[0]) + text + full.slice(st.range[1]), { gui: true }); return; }
    const t = full.replace(/\s*$/, '');
    S.pendingSel = sc.stmts.length;
    setSQL(t + (t.endsWith(';') ? '' : ';') + '\n\n' + text, { gui: true });
    return;
  }
  setSQL(text, { gui: true });
}
function addTableTo(q, table, quiet) {
  if (!q) return newQuery(table);
  const srcs = srcList(q);
  if (srcs.some(s => s.table === table)) return q;
  qualifyAll(q);
  const on = findFK(table, srcs);
  q.joins.push(on ? { type: 'INNER', table, alias: table, on } : { type: 'CROSS', table, alias: table, on: null });
  if (!on && !quiet) toast(`No foreign key links ${table} to the query, so this is a CROSS JOIN. Drag a column onto a column of another table to set ON.`);
  return q;
}
/* run fn(q, alias) with `table` guaranteed to be in the query (adding it, or starting a query, if needed) */
function withTable(table, fn) {
  mutate(q => {
    if (!q) q = newQuery(table);
    let a = aliasIn(q, table);
    if (!a) { q = addTableTo(q, table); a = aliasIn(q, table); }
    const r = fn(q, a);
    return r === null ? null : q;
  });
}
function toggleTable(t) {
  const a = S.ast && aliasIn(S.ast, t);
  if (!S.ast) mutate(() => newQuery(t));
  else if (!a) mutate(q => addTableTo(q, t));
  else removeTable(a);
}
function removeTable(alias) {
  if (srcList(S.ast).length <= 1) { setSQL('', { gui: true }); return; }
  mutate(q => {
    qualifyAll(q);
    const refs = e => { let r = false; walk(e, n => { if (n.k === 'col' && n.table === alias) r = true; }); return r; };
    if (q.from.alias === alias) { const j = q.joins.shift(); q.from = { table: j.table, alias: j.alias }; }
    else q.joins = q.joins.filter(j => j.alias !== alias);
    q.joins.forEach(j => { if (j.on && refs(j.on)) { j.on = null; j.type = 'CROSS'; delete j.using; } });
    q.select = q.select.filter(it => !(it.expr.k === 'star' && it.expr.table === alias) && !refs(it.expr));
    if (!q.select.length) q.select = [{ expr: { k: 'star' } }];
    q.where = joinAnd(flatAnd(q.where).filter(c => !refs(c)));
    q.groupBy = q.groupBy.filter(g => !refs(g));
    q.having = joinAnd(flatAnd(q.having).filter(c => !refs(c)));
    q.orderBy = q.orderBy.filter(o => !refs(o.expr));
  });
}
function toggleSelectIn(q, alias, col) {
  const idx = q.select.findIndex(it => sameCol(it.expr, alias, col, q));
  if (idx >= 0) {
    q.select.splice(idx, 1);
    if (!q.select.length) q.select = [{ expr: { k: 'star' } }];
    q.groupBy = q.groupBy.filter(g => !sameCol(g, alias, col, q));
    return false;
  }
  const ref = refFor(q, alias, col);
  if (q.select.length === 1 && q.select[0].expr.k === 'star' && !q.select[0].expr.table) q.select = [{ expr: ref }];
  else q.select.push({ expr: ref });
  if ((q.groupBy.length || q.select.some(it => hasAgg(it.expr))) && !q.groupBy.some(g => sameCol(g, alias, col, q))) q.groupBy.push(clone(ref));
  return true;
}
function toggleColumn(t, col, fromEl) {
  let added = false, alias = t;
  withTable(t, (q, a) => { alias = a; added = toggleSelectIn(q, a, col); });
  if (added && fromEl) flyTo(fromEl, col, tcolor(t), `#resultWrap th[data-key="${CSS.escape(alias + '.' + col)}"]`);
}
function addConditionIn(q, cond, comb) {
  const g = genE(cond), list = flatAnd(q.where), i = list.findIndex(c => genE(c) === g);
  if (i >= 0) { list.splice(i, 1); q.where = joinAnd(list); }
  else if (!q.where) q.where = cond;
  else q.where = { k: 'bin', op: comb === 'OR' ? 'OR' : 'AND', l: q.where, r: cond };
}
function removeCond(kw, gen) {
  mutate(q => {
    if (!q) return null;
    if (kw === 'HAVING') q.having = joinAnd(flatAnd(q.having).filter(c => genE(c) !== gen));
    else q.where = joinAnd(flatAnd(q.where).filter(c => genE(c) !== gen));
  });
}
function setOrderIn(q, alias, col, dir) {
  const i = q.orderBy.findIndex(o => sameCol(o.expr, alias, col, q));
  if (i >= 0) { if (q.orderBy[i].dir === dir) q.orderBy.splice(i, 1); else q.orderBy[i].dir = dir; }
  else q.orderBy.push({ expr: refFor(q, alias, col), dir });
}
const COUNT_STAR = () => ({ k: 'fn', name: 'COUNT', args: [], star: true, distinct: false });
function groupByIn(q, alias, col) {
  const ref = refFor(q, alias, col);
  const i = q.groupBy.findIndex(g => sameCol(g, alias, col, q));
  if (i >= 0) q.groupBy.splice(i, 1); else q.groupBy.push(ref);
  const aggs = q.select.filter(it => hasAgg(it.expr));
  if (!q.groupBy.length) q.select = aggs.length ? aggs : [{ expr: { k: 'star' } }];
  else q.select = [...q.groupBy.map(g => ({ expr: clone(g) })), ...(aggs.length ? aggs : [{ expr: COUNT_STAR() }])];
  const ok = new Set(q.groupBy.map(g => genE(g)));
  q.orderBy = q.orderBy.filter(o => hasAgg(o.expr) || ok.has(genE(o.expr)) || (o.expr.k === 'col' && !o.expr.table && q.select.some(s => s.alias === o.expr.name)));
}
function aggIn(q, fn, alias, col) {
  const agg = { k: 'fn', name: fn, args: [refFor(q, alias, col)], star: false, distinct: false };
  const g = genE(agg), i = q.select.findIndex(it => genE(it.expr) === g);
  if (i >= 0) { q.select.splice(i, 1); if (!q.select.length) q.select = [{ expr: { k: 'star' } }]; return; }
  const ok = new Set(q.groupBy.map(x => genE(x)));
  q.select = q.select.filter(it => it.expr.k !== 'star' && (hasAgg(it.expr) || ok.has(genE(it.expr))));
  q.select.push({ expr: agg });
  q.orderBy = q.orderBy.filter(o => hasAgg(o.expr) || ok.has(genE(o.expr)));
}
function setJoinOnIn(q, a1, c1, a2, c2) {
  qualifyAll(q);
  const srcs = srcList(q), i1 = srcs.findIndex(s => s.alias === a1), i2 = srcs.findIndex(s => s.alias === a2);
  if (i1 < 0 || i2 < 0 || i1 === i2) return false;
  const [lo, hi] = i1 < i2 ? [[a1, c1], [a2, c2]] : [[a2, c2], [a1, c1]];
  const j = q.joins[Math.max(i1, i2) - 1];
  j.on = { k: 'bin', op: '=', l: { k: 'col', table: hi[0], name: hi[1] }, r: { k: 'col', table: lo[0], name: lo[1] } };
  delete j.using; if (j.type === 'CROSS') j.type = 'INNER';
  return true;
}
function joinColumns(t1, c1, t2, c2) {
  if (t1 === t2) { toast('Drop the column on a column of a different table to join them.'); return; }
  mutate(q => {
    if (!q) q = newQuery(t1);
    if (!aliasIn(q, t1)) q = addTableTo(q, t1, true);
    if (!aliasIn(q, t2)) q = addTableTo(q, t2, true);
    return setJoinOnIn(q, aliasIn(q, t1), c1, aliasIn(q, t2), c2) ? q : null;
  });
}
const JOIN_CYCLE = { INNER: 'LEFT', LEFT: 'RIGHT', RIGHT: 'FULL', FULL: 'INNER' };
function cycleJoin(ji) {
  mutate(q => {
    if (!q || !q.joins[ji]) return null;
    const j = q.joins[ji];
    if (j.type === 'CROSS') { toast('A CROSS JOIN pairs every row with every row. Drag a column onto a matching column to add an ON condition.'); return null; }
    j.type = JOIN_CYCLE[j.type];
  });
}
function removeResultCol(ci) {
  const c = S.ex.cols[ci];
  mutate(q => {
    if (c.fromStar) {
      const out = [];
      q.select.forEach(it => {
        if (it.expr.k !== 'star') { out.push(it); return; }
        srcList(q).filter(s => !it.expr.table || s.alias === it.expr.table).forEach(s => s.def.cols.forEach(cc => {
          if (!(s.alias === c.alias && cc.name === c.label)) out.push({ expr: refFor(q, s.alias, cc.name) });
        }));
      });
      q.select = out;
    } else {
      const g = genE(c.item.expr) + '|' + (c.item.alias || '');
      const i = q.select.findIndex(it => genE(it.expr) + '|' + (it.alias || '') === g);
      if (i >= 0) q.select.splice(i, 1);
    }
    if (!q.select.length) q.select = [{ expr: { k: 'star' } }];
  });
}
function sortResultCol(ci, dir) {
  const c = S.ex.cols[ci];
  mutate(q => {
    const e = c.item && c.item.alias ? { k: 'col', name: c.item.alias } : clone(c.expr);
    if (c.fromStar && srcList(q).length === 1) delete e.table;
    const g = genE(e), cur = q.orderBy.find(o => genE(o.expr) === g);
    if (dir) { q.orderBy = [{ expr: e, dir }]; return; }
    if (!cur) q.orderBy = [{ expr: e, dir: 'ASC' }];
    else if (cur.dir !== 'DESC') { cur.dir = 'DESC'; q.orderBy = [cur]; }
    else q.orderBy = q.orderBy.filter(o => o !== cur);
  });
}
function aggResultCol(ci, fn) {
  const c = S.ex.cols[ci];
  mutate(q => {
    const base = c.item ? c.item.expr : clone(c.expr);
    if (c.fromStar && srcList(q).length === 1) delete base.table;
    const item = { expr: { k: 'fn', name: fn, args: [clone(base)], star: false, distinct: false }, alias: fn.toLowerCase() + '_' + c.label.replace(/\W+/g, '_') };
    const ok = new Set(q.groupBy.map(g => genE(g)));
    const key = c.item ? genE(c.item.expr) + '|' + (c.item.alias || '') : null;
    let done = false;
    q.select = q.select.flatMap(it => {
      if (key && !done && genE(it.expr) + '|' + (it.alias || '') === key) { done = true; return [item]; }
      if (it.expr.k === 'star') return [];
      return hasAgg(it.expr) || ok.has(genE(it.expr)) ? [it] : [];
    });
    if (!done) q.select.push(item);
    q.orderBy = q.orderBy.filter(o => hasAgg(o.expr) || ok.has(genE(o.expr)));
    S.fly = item.alias;
  });
}

/* ===================== What the current query uses (drives the diagram highlights) ===================== */
function usage(ex) {
  const u = {}, add = (e, tag) => walk(e, n => { if (n.k === 'col') { try { const r = resolveCol(n, ex.sources); (u[r.key] = u[r.key] || new Set()).add(tag); } catch {} } });
  (ex.cols || []).forEach(c => { if (!c.fromStar) add(c.expr, hasAgg(c.expr) ? 'agg' : 'sel'); });
  ex.q.joins.forEach(j => j.on && add(j.on, 'join'));
  if (ex.q.where) add(ex.q.where, 'where');
  ex.q.groupBy.forEach(g => add(g, 'group'));
  if (ex.q.having) add(ex.q.having, 'having');
  (ex.q.orderBy || []).forEach(o => add(o.expr, 'sort:' + (o.dir || 'ASC')));
  return u;
}
function queryState() {
  const ex = S.ex, st = { tabs: new Map(), cols: new Map(), strips: new Map(), links: [] };
  if (!ex || !ex.sources) return st;
  ex.sources.forEach(s => { const e = st.tabs.get(s.table) || { aliases: [], star: false }; e.aliases.push(s.alias); st.tabs.set(s.table, e); });
  if (ex.kind !== 'SELECT' && ex.kind !== 'DELETE') return st;
  const tableOf = al => (ex.sources.find(s => s.alias === al) || {}).table;
  const u = usage(ex);
  for (const k in u) {
    const i = k.indexOf('.'), t = tableOf(k.slice(0, i)); if (!t) continue;
    const kk = t + '.' + k.slice(i + 1);
    if (!st.cols.has(kk)) st.cols.set(kk, new Set());
    u[k].forEach(tag => st.cols.get(kk).add(tag));
  }
  if (ex.kind === 'SELECT') ex.cols.forEach(c => { if (c.fromStar) { const e = st.tabs.get(tableOf(c.alias)); if (e) e.star = true; } });
  const strip = (cond, kw) => {
    const ts = [];
    walk(cond, n => { if (n.k === 'col') { try { const r = resolveCol(n, ex.sources); if (!ts.includes(r.src.table)) ts.push(r.src.table); } catch {} } });
    const t = ts[0] || ex.sources[0].table;
    if (!st.strips.has(t)) st.strips.set(t, []);
    st.strips.get(t).push({ kw, gen: genE(cond), removable: ex.kind === 'SELECT' && !S.script });
  };
  flatAnd(ex.q.where).forEach(c => strip(c, 'WHERE'));
  flatAnd(ex.q.having).forEach(c => strip(c, 'HAVING'));
  st.links = ex.links || [];
  return st;
}

/* ===================== Schema diagram ===================== */
const SD = { pos: {}, routes: {}, dir: null, view: { x: 20, y: 20, k: 1 }, key: '', moved: false, userView: false, hlKeys: null, labels: new Map(), sizes: {} };
const sdvp = $('#sdvp'), sdworld = $('#sdworld'), sdlines = $('#sdlines'), sdlabels = $('#sdlabels');
function geomVars() {
  const s = S.scale;
  sdworld.style.setProperty('--dfs', Math.round(15 * s) + 'px');
  sdworld.style.setProperty('--drow', Math.round(30 * s) + 'px');
  sdworld.style.setProperty('--dhead', Math.round(40 * s) + 'px');
}
function diagramTables() {
  const list = Object.keys(DB.tables).map(t => ({ t, def: DB.tables[t], preview: false }));
  if (S.ex && S.ex.sources) S.ex.sources.forEach(s => { if (!DB.tables[s.table] && !list.some(x => x.t === s.table)) list.push({ t: s.table, def: s.def, preview: true }); });
  return list;
}
function diagEdges(tabs) {
  const names = new Set(tabs.map(x => x.t)), out = [];
  tabs.forEach(({ t, def }) => def.cols.forEach(c => { if (c.fk && names.has(c.fk.table)) out.push({ from: t, to: c.fk.table, col: c.name, ref: c.fk.col }); }));
  return out;
}
function boxHtml(t, def, qs, preview) {
  const inq = qs.tabs.get(t), ex = S.ex;
  const tags = [];
  if (inq) inq.aliases.filter(a => a !== t).forEach(a => tags.push(`<span class="al" title="alias used in the query">AS ${esc(a)}</span>`));
  if (inq && inq.star) tags.push('<span class="tagx" title="SELECT * — every column">*</span>');
  if (preview) tags.push('<span class="tagx new" title="not created yet">new</span>');
  if (ex && ex.kind === 'DROP' && ex.table === t) tags.push('<span class="tagx del">drop</span>');
  if (ex && ex.kind === 'INSERT' && ex.table === t) tags.push(`<span class="tagx new" title="rows to be added">+${ex.newRows.length}</span>`);
  if (ex && ex.kind === 'DELETE' && ex.table === t) tags.push(`<span class="tagx del" title="rows to be deleted">−${ex.mark.filter(Boolean).length}</span>`);
  const n = def.rows.length;
  let h = `<div class="sdh" tabindex="0" role="button" aria-pressed="${!!inq}" aria-label="${esc(t)} table, ${n} rows${inq ? ', in the query' : ''}. Press Enter to ${inq ? 'remove it from' : 'add it to'} the query, or R to show its rows." title="Click: ${inq ? 'remove from' : 'add to'} the query · double-click: show rows · drag: move"><span class="tdot"></span><span class="tn">${esc(t)}</span>${tags.join('')}<span class="n">${n} row${n === 1 ? '' : 's'}</span><button class="view" aria-pressed="${S.drawer === t}" title="Show this table's rows below the diagram">Rows</button></div>`;
  h += def.cols.map(c => {
    const st = qs.cols.get(t + '.' + c.name) || new Set();
    const sel = st.has('sel'), agg = st.has('agg'), filt = st.has('where') || st.has('having');
    const sort = [...st].find(x => x.startsWith('sort:'));
    const marks = [];
    if (sel) marks.push('<span class="mk-i chk" title="in SELECT">✓</span>');
    if (agg) marks.push('<span class="mk-i chk" title="aggregated (SUM, COUNT…)">Σ</span>');
    if (filt) marks.push(`<span class="mk-i" title="filtered (WHERE)">${FUNNEL_SVG}</span>`);
    if (st.has('group')) marks.push('<span class="mk-i" title="GROUP BY">GROUP</span>');
    if (sort) marks.push(`<span class="mk-i" title="ORDER BY ${sort.slice(5)}">${sort.endsWith('DESC') ? '↓' : '↑'}</span>`);
    const label = `${c.name}, ${c.type}${c.pk ? ', primary key' : ''}${c.fk ? `, foreign key to ${c.fk.table}.${c.fk.col}` : ''}${sel || agg ? ', selected' : ''}${filt ? ', filtered' : ''}`;
    return `<div class="sdr${c.pk ? ' pk' : ''}${c.fk ? ' fk' : ''}${sel || agg ? ' sel' : ''}" data-c="${esc(c.name)}" tabindex="0" role="button" aria-pressed="${sel || agg}" aria-label="${esc(label)}" title="${c.fk ? `References ${c.fk.table}.${c.fk.col} · ` : ''}Click: SELECT · drag onto another table's column: JOIN"><span class="kic">${c.pk ? KEY_SVG : c.fk ? LINK_SVG : ''}</span><span class="kb">${c.pk ? 'PK' : c.fk ? 'FK' : ''}</span><span class="cn">${esc(c.name)}</span><span class="marks">${marks.join('')}</span>${tyBadge(c.type)}<button class="more${inq ? '' : ' ph'}" ${inq ? '' : 'tabindex="-1" aria-hidden="true"'} aria-label="More options for ${esc(c.name)}" title="Sort, group, total, calculate">⋯</button></div>`;
  }).join('');
  const strips = qs.strips.get(t) || [];
  if (strips.length) h += `<div class="sds">${strips.map(s => `<div class="sdf"><span class="kw">${s.kw}</span><span class="tx">${highlight(s.gen).trim()}</span>${s.removable ? `<button class="x" data-kw="${s.kw}" data-gen="${esc(s.gen)}" aria-label="Remove filter ${esc(s.gen)}" title="Remove this condition">✕</button>` : ''}</div>`).join('')}</div>`;
  return h;
}
let clickT = null;
function headClick(t) {
  if (clickT && clickT.t === t) { clearTimeout(clickT.id); clickT = null; toggleDrawer(t, true); return; }
  if (clickT) clearTimeout(clickT.id);
  clickT = { t, id: setTimeout(() => { clickT = null; toggleTable(t); }, 260) };
}
function bindBox(el, t) {
  const head = el.querySelector('.sdh');
  head.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button')) return;
    e.stopPropagation(); e.preventDefault();
    const sx = e.clientX, sy = e.clientY, p0 = Object.assign({}, SD.pos[t] || { x: el.offsetLeft, y: el.offsetTop });
    let moved = false;
    const move = ev => {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
      if (!moved) { moved = true; el.classList.add('dragging'); document.body.classList.add('noselect'); }
      SD.pos[t] = { x: p0.x + (ev.clientX - sx) / SD.view.k, y: p0.y + (ev.clientY - sy) / SD.view.k };
      SD.moved = true;
      el.style.left = SD.pos[t].x + 'px'; el.style.top = SD.pos[t].y + 'px';
      drawLines();
      const over = document.elementFromPoint(ev.clientX, ev.clientY);
      $('#center').classList.toggle('droptarget', !!(over && over.closest('#center')));
    };
    const up = ev => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      document.body.classList.remove('noselect'); el.classList.remove('dragging'); $('#center').classList.remove('droptarget');
      if (!moved) { headClick(t); return; }
      const over = document.elementFromPoint(ev.clientX, ev.clientY);
      if (over && over.closest('#center')) { SD.pos[t] = p0; el.style.left = p0.x + 'px'; el.style.top = p0.y + 'px'; drawLines(); if (!(S.ast && aliasIn(S.ast, t))) toggleTable(t); }
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  });
  head.addEventListener('keydown', e => {
    if (e.target !== head) return;
    if ((e.key === 'Enter' && e.shiftKey) || e.key === 'r' || e.key === 'R') { e.preventDefault(); toggleDrawer(t, true); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTable(t); }
  });
  head.querySelector('.view').addEventListener('click', e => { e.stopPropagation(); toggleDrawer(t); });
  el.querySelectorAll('.sdr').forEach(r => {
    const col = r.dataset.c;
    r.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button')) return;
      e.stopPropagation();
      const sx = e.clientX, sy = e.clientY; let ghost = null, over = null;
      const move = ev => {
        if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
        if (!ghost) { ghost = document.createElement('div'); ghost.className = 'ghost'; ghost.textContent = `${t}.${col}`; ghost.style.setProperty('--gc', tcolor(t)); document.body.appendChild(ghost); document.body.classList.add('noselect'); }
        ghost.style.left = ev.clientX + 14 + 'px'; ghost.style.top = ev.clientY + 10 + 'px';
        const el2 = document.elementFromPoint(ev.clientX, ev.clientY);
        const tgt = el2 && (el2.closest('.sdr') || el2.closest('#center'));
        if (over && over !== tgt) over.classList.remove('drop', 'droptarget');
        over = tgt && tgt !== r ? tgt : null;
        if (over) over.classList.add(over.id === 'center' ? 'droptarget' : 'drop');
      };
      const up = () => {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
        document.body.classList.remove('noselect');
        if (over) over.classList.remove('drop', 'droptarget');
        if (!ghost) { toggleColumn(t, col, r); return; }
        ghost.remove();
        if (!over) return;
        if (over.id === 'center') toggleColumn(t, col, null);
        else joinColumns(t, col, over.closest('.sdt').dataset.t, over.dataset.c);
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
    r.addEventListener('keydown', e => { if (e.target === r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleColumn(t, col, r); } });
    r.addEventListener('mouseenter', () => sdHover(t, col, true));
    r.addEventListener('mouseleave', () => sdHover(t, col, false));
    r.querySelector('.more').addEventListener('click', e => { e.stopPropagation(); colMenu(t, col, e.currentTarget); });
  });
  el.querySelectorAll('.sdf .x').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); removeCond(b.dataset.kw, b.dataset.gen); }));
}
/* pick whichever orientation (layers top-to-bottom or left-to-right) fits the pane best, so there's little dead space */
function computeLayout(tabs, sizes) {
  const s = S.scale, nodes = tabs.map(({ t }) => ({ id: t, w: sizes[t].w, h: sizes[t].h }));
  const edges = diagEdges(tabs);
  const W = sdvp.clientWidth || 600, H = sdvp.clientHeight || 500;
  const opts = { TB: { dir: 'TB', nodeGap: 30 * s, layerGap: 66 * s, dw: 26 * s, dh: 8 }, LR: { dir: 'LR', nodeGap: 26 * s, layerGap: 100 * s, dw: 0, dh: 26 * s } };
  const res = {};
  ['TB', 'LR'].forEach(d => { const L = layeredLayout(nodes, edges, opts[d]); res[d] = { L, k: Math.min(W / (L.W + 50), H / (L.H + 50)) }; });
  let dir = res.TB.k >= res.LR.k ? 'TB' : 'LR';
  if (SD.dir && SD.dir !== dir && Math.abs(res.TB.k - res.LR.k) / Math.max(res.TB.k, res.LR.k) < .06) dir = SD.dir;
  const L = res[dir].L;
  SD.dir = dir; SD.pos = {}; SD.routes = {}; SD.moved = false;
  tabs.forEach(({ t }) => { SD.pos[t] = { x: L.pos[t].x + 24, y: L.pos[t].y + 24 }; });
  L.routes.forEach(r => { SD.routes[r.e.from + '.' + r.e.col] = r.pts.map(p => ({ x: p.x + 24, y: p.y + 24 })); });
}
function renderDiagram(force) {
  geomVars();
  const tabs = diagramTables(), qs = queryState();
  const keep = new Set(tabs.map(x => x.t));
  $$('.sdt', sdworld).forEach(el => { if (!keep.has(el.dataset.t)) el.remove(); });
  const fresh = [];
  tabs.forEach(({ t, def, preview }) => {
    let el = sdworld.querySelector(`.sdt[data-t="${CSS.escape(t)}"]`);
    if (!el) { el = document.createElement('div'); el.className = 'sdt'; el.dataset.t = t; sdworld.appendChild(el); fresh.push(t); }
    const ex = S.ex;
    el.className = 'sdt' + (qs.tabs.has(t) ? ' inq' : '') + (preview ? ' preview' : '') + (ex && ex.kind === 'DROP' && ex.table === t ? ' dropping' : '');
    el.style.setProperty('--tc', def.color);
    el.style.width = 'max-content';
    el.innerHTML = boxHtml(t, def, qs, preview);
    bindBox(el, t);
  });
  const sizes = {};
  tabs.forEach(({ t }) => { const el = sdworld.querySelector(`.sdt[data-t="${CSS.escape(t)}"]`); sizes[t] = { w: el.offsetWidth, h: el.offsetHeight }; });
  const key = tabs.map(x => x.t).join(',') + '|' + S.scale;
  const sizeSig = tabs.map(({ t }) => `${Math.round(sizes[t].w / 8)}x${Math.round(sizes[t].h / 8)}`).join(',');
  const setChanged = key !== SD.key, first = !SD.key;
  if (force || setChanged || (!SD.moved && sizeSig !== SD.sizeSig)) computeLayout(tabs, sizes);
  SD.key = key; SD.sizeSig = sizeSig; SD.sizes = sizes;
  tabs.forEach(({ t }) => {
    const el = sdworld.querySelector(`.sdt[data-t="${CSS.escape(t)}"]`), p = SD.pos[t] || { x: 24, y: 24 };
    if (fresh.includes(t)) {
      el.style.transition = 'none'; el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; void el.offsetWidth; el.style.transition = '';
      if (!first) el.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'ease-out' });
    } else { el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; }
  });
  $('#tcount').textContent = `${Object.keys(DB.tables).length} tables`;
  animateLines(520);
  if (setChanged || force) requestAnimationFrame(() => fitDiagram(!first));
  else if (!SD.userView) requestAnimationFrame(() => ensureDiagramVisible());
}
function boxGeom(t) { const el = sdworld.querySelector(`.sdt[data-t="${CSS.escape(t)}"]`); return el ? { el, x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null; }
function rowAnchorY(b, col) { const r = b.el.querySelector(`.sdr[data-c="${CSS.escape(col)}"]`); return r ? b.y + r.offsetTop + r.offsetHeight / 2 : b.y + 20; }
function edgeGeom(c, ccol, p, pcol, pts) {
  const bc = boxGeom(c), bp = boxGeom(p); if (!bc || !bp) return null;
  const y1 = ccol ? rowAnchorY(bc, ccol) : bc.y + bc.el.querySelector('.sdh').offsetHeight / 2;
  const y2 = pcol ? rowAnchorY(bp, pcol) : bp.y + bp.el.querySelector('.sdh').offsetHeight / 2;
  if (c === p) { const x = bc.x + bc.w; return { d: `M${x},${y1} C${x + 50},${y1} ${x + 50},${y2} ${x},${y2}`, s: { x, y: y1 }, e: { x, y: y2 }, sc: 1, sp: 1 }; }
  const ccx = bc.x + bc.w / 2, pcx = bp.x + bp.w / 2;
  const overlapX = bc.x < bp.x + bp.w && bp.x < bc.x + bc.w;
  let sc, sp;
  if (pts && pts.length) { sc = pts[0].x < ccx ? -1 : 1; sp = pts[pts.length - 1].x < pcx ? -1 : 1; }
  else if (overlapX) { sc = sp = pcx >= ccx ? 1 : -1; }
  else { sc = pcx < ccx ? -1 : 1; sp = -sc; }
  const s = { x: sc < 0 ? bc.x : bc.x + bc.w, y: y1 }, e = { x: sp < 0 ? bp.x : bp.x + bp.w, y: y2 };
  let d;
  if ((!pts || !pts.length) && overlapX) { const bx = sc < 0 ? Math.min(bc.x, bp.x) - 46 : Math.max(bc.x + bc.w, bp.x + bp.w) + 46; d = `M${s.x},${s.y} C${bx},${s.y} ${bx},${e.y} ${e.x},${e.y}`; }
  else d = smoothPath([s, { x: s.x + sc * 18, y: s.y }, ...(pts || []), { x: e.x + sp * 18, y: e.y }, e], false);
  return { d, s, e, sc, sp };
}
const VENN = {
  INNER: '<path d="M10 2.2a6 6 0 0 1 0 9.6a6 6 0 0 1 0-9.6z" fill="currentColor"/>',
  LEFT: '<circle cx="7" cy="7" r="5.5" fill="currentColor"/>',
  RIGHT: '<circle cx="13" cy="7" r="5.5" fill="currentColor"/>',
  FULL: '<circle cx="7" cy="7" r="5.5" fill="currentColor"/><circle cx="13" cy="7" r="5.5" fill="currentColor"/>',
  CROSS: ''
};
const vennSvg = t => `<svg viewBox="0 0 20 14" aria-hidden="true">${VENN[t] || ''}<circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="13" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;
const JOIN_HELP = { INNER: 'INNER JOIN: only rows that match on both sides', LEFT: 'LEFT JOIN: every row from the left table, NULLs where there is no match', RIGHT: 'RIGHT JOIN: every row from the right table, NULLs where there is no match', FULL: 'FULL JOIN: every row from both tables', CROSS: 'CROSS JOIN: every row paired with every row' };
function drawLines() {
  const tabs = diagramTables(), qs = queryState(), edges = diagEdges(tabs);
  const joinOf = {};          // foreign-key edge → the query join that runs along it
  const extra = [];           // joins on columns that aren't a foreign key (or CROSS joins)
  qs.links.forEach(L => {
    const tA = aliasTable(L.left), tB = aliasTable(L.right);
    if (L.kind === 'cross' || !L.pairs.length) { extra.push({ L, a: [tA, null], b: [tB, null], cross: true }); return; }
    L.pairs.forEach((p, pi) => {
      const ta = aliasTable(p.a), tb = aliasTable(p.b);
      const e = edges.find(e => (e.from === ta && e.col === p.ac && e.to === tb && e.ref === p.bc) || (e.from === tb && e.col === p.bc && e.to === ta && e.ref === p.ac));
      if (e) joinOf[e.from + '.' + e.col] = { L, first: pi === 0 };
      else extra.push({ L, a: [ta, p.ac], b: [tb, p.bc], first: pi === 0 });
    });
  });
  let out = '';
  const labs = [];
  edges.forEach(e => {
    const k = e.from + '.' + e.col, j = joinOf[k];
    const g = edgeGeom(e.from, e.col, e.to, e.ref, SD.moved ? [] : SD.routes[k]); if (!g) return;
    const cls = (j ? ' join' : '') + (SD.hlKeys && SD.hlKeys.has(k) ? ' hl' : '') + (!DB.tables[e.from] ? ' preview' : '');
    const crow = `M${g.s.x + g.sc * 14},${g.s.y} L${g.s.x},${g.s.y - 7} M${g.s.x + g.sc * 14},${g.s.y} L${g.s.x},${g.s.y} M${g.s.x + g.sc * 14},${g.s.y} L${g.s.x},${g.s.y + 7}`;
    const bars = `M${g.e.x + g.sp * 8},${g.e.y - 7} L${g.e.x + g.sp * 8},${g.e.y + 7} M${g.e.x + g.sp * 13},${g.e.y - 7} L${g.e.x + g.sp * 13},${g.e.y + 7}`;
    const id = 'e' + labs.length;
    out += `<g class="sdl${cls}" style="--wc:${j ? tcolor(aliasTable(j.L.right)) : tcolor(e.from)}"><path class="ln" ${j && j.first ? `data-lab="${id}"` : ''} d="${g.d}"/><path class="mk" d="${crow}"/><path class="mk" d="${bars}"/><title>${e.from}.${e.col} → ${e.to}.${e.ref} (many to one)</title></g>`;
    if (j && j.first) labs.push({ id, L: j.L });
  });
  extra.forEach(x => {
    const g = edgeGeom(x.a[0], x.a[1], x.b[0], x.b[1], []); if (!g) return;
    const id = 'x' + labs.length;
    out += `<g class="sdl join ${x.cross ? 'cross' : 'custom'}" style="--wc:${tcolor(aliasTable(x.L.right))}"><path class="ln" ${x.cross || x.first ? `data-lab="${id}"` : ''} d="${g.d}"/></g>`;
    if (x.cross || x.first) labs.push({ id, L: x.L });
  });
  sdlines.innerHTML = out;
  const seen = new Set();
  labs.forEach(({ id, L }) => {
    const path = sdlines.querySelector(`[data-lab="${id}"]`); if (!path) return;
    const len = path.getTotalLength(), pt = path.getPointAtLength(len / 2);
    const key = 'j' + L.ji; seen.add(key);
    let el = SD.labels.get(key);
    if (!el) {
      el = document.createElement('button'); el.className = 'jlab'; sdlabels.appendChild(el); SD.labels.set(key, el);
      el.addEventListener('pointerdown', e => e.stopPropagation());
      el.addEventListener('click', () => cycleJoin(+el.dataset.ji));
    }
    const html = `${vennSvg(L.type)}${L.type} JOIN`;
    if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; }
    el.dataset.ji = L.ji;
    el.style.setProperty('--wc', tcolor(aliasTable(L.right)));
    el.title = JOIN_HELP[L.type] + (L.type === 'CROSS' ? '' : '. Click to change the join type.');
    el.setAttribute('aria-label', `${L.type} JOIN ${aliasTable(L.right)}.${L.type === 'CROSS' ? '' : ' Click to change the join type.'}`);
    el.style.left = pt.x + 'px'; el.style.top = pt.y + 'px';
  });
  SD.labels.forEach((el, k) => { if (!seen.has(k)) { el.remove(); SD.labels.delete(k); } });
}
let lineAnim = 0;
function animateLines(ms) {
  const until = performance.now() + ms;
  if (lineAnim) { lineAnim = Math.max(lineAnim, until); return; }
  lineAnim = until;
  const tick = () => { drawLines(); if (performance.now() < lineAnim) requestAnimationFrame(tick); else lineAnim = 0; };
  requestAnimationFrame(tick);
}
function sdHover(t, col, on) {
  $$('.sdr.hl', sdworld).forEach(r => r.classList.remove('hl'));
  if (!on) { SD.hlKeys = null; drawLines(); return; }
  const keys = new Set(), rows = [];
  diagEdges(diagramTables()).forEach(e => {
    if ((e.from === t && e.col === col) || (e.to === t && e.ref === col)) { keys.add(e.from + '.' + e.col); rows.push([e.from, e.col], [e.to, e.ref]); }
  });
  rows.forEach(([tt, cc]) => { const r = sdworld.querySelector(`.sdt[data-t="${CSS.escape(tt)}"] .sdr[data-c="${CSS.escape(cc)}"]`); if (r) r.classList.add('hl'); });
  SD.hlKeys = keys; drawLines();
}
function applySD(anim) {
  sdworld.classList.toggle('anim', !!anim);
  sdworld.style.transform = `translate(${SD.view.x}px, ${SD.view.y}px) scale(${SD.view.k})`;
  $('#sdzl').textContent = Math.round(SD.view.k * 100) + '%';
  if (anim) setTimeout(() => sdworld.classList.remove('anim'), 460);
}
function diagBounds() {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  Object.keys(SD.pos).forEach(t => { const p = SD.pos[t], s = SD.sizes[t]; if (!s) return; x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x + s.w); y1 = Math.max(y1, p.y + s.h); });
  if (!isFinite(x0)) return null;
  try { const bb = sdlines.getBBox(); if (bb.width || bb.height) { x0 = Math.min(x0, bb.x - 4); y0 = Math.min(y0, bb.y - 4); x1 = Math.max(x1, bb.x + bb.width + 4); y1 = Math.max(y1, bb.y + bb.height + 4); } } catch {}
  SD.labels.forEach(el => { const cx = parseFloat(el.style.left), cy = parseFloat(el.style.top), w = el.offsetWidth / 2 + 4, h = el.offsetHeight / 2 + 4; if (isFinite(cx)) { x0 = Math.min(x0, cx - w); x1 = Math.max(x1, cx + w); y0 = Math.min(y0, cy - h); y1 = Math.max(y1, cy + h); } });
  return { x0, y0, x1, y1 };
}
function fitDiagram(anim = true) {
  const b = diagBounds(), W = sdvp.clientWidth, H = sdvp.clientHeight; if (!b || !W || !H) return;
  /* never shrink text below ~12px; if the diagram is bigger than the pane, it starts top-left and you can pan */
  const pad = 14, bottom = 58;
  const k = Math.max(.8, Math.min(1.25, (W - pad * 2) / (b.x1 - b.x0), (H - pad - bottom) / (b.y1 - b.y0)));
  const cw = (b.x1 - b.x0) * k;
  SD.view = { k, x: cw < W - pad * 2 ? (W - cw) / 2 - b.x0 * k : pad - b.x0 * k, y: pad - b.y0 * k };
  SD.userView = false;
  applySD(anim);
}
function ensureDiagramVisible() {
  const b = diagBounds(); if (!b) return;
  const { x, y, k } = SD.view, W = sdvp.clientWidth, H = sdvp.clientHeight;
  if (b.x0 * k + x < -2 || b.y0 * k + y < -2 || ((b.x1 * k + x > W + 2 || b.y1 * k + y > H - 40) && k > .8)) fitDiagram(true);
}
(() => {
  sdvp.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('.sdt') || e.target.closest('.jlab') || e.target.closest('.zoomctl')) return;
    const sx = e.clientX, sy = e.clientY, v0 = Object.assign({}, SD.view);
    sdvp.classList.add('panning'); sdvp.setPointerCapture(e.pointerId);
    const move = ev => { SD.view = { k: v0.k, x: v0.x + ev.clientX - sx, y: v0.y + ev.clientY - sy }; SD.userView = true; applySD(false); };
    const up = () => { sdvp.classList.remove('panning'); sdvp.removeEventListener('pointermove', move); sdvp.removeEventListener('pointerup', up); };
    sdvp.addEventListener('pointermove', move); sdvp.addEventListener('pointerup', up);
  });
  const zoomAt = (px, py, nk, anim) => { const { x, y, k } = SD.view; nk = Math.max(.3, Math.min(2.5, nk)); SD.view = { k: nk, x: px - (px - x) * nk / k, y: py - (py - y) * nk / k }; SD.userView = true; applySD(anim); };
  sdvp.addEventListener('wheel', e => {
    e.preventDefault();
    const r = sdvp.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) zoomAt(e.clientX - r.left, e.clientY - r.top, SD.view.k * Math.exp(-e.deltaY * .0025));
    else { SD.view = { k: SD.view.k, x: SD.view.x - e.deltaX, y: SD.view.y - e.deltaY }; SD.userView = true; applySD(false); }
  }, { passive: false });
  $('#sdzin').onclick = () => zoomAt(sdvp.clientWidth / 2, sdvp.clientHeight / 2, SD.view.k * 1.2, true);
  $('#sdzout').onclick = () => zoomAt(sdvp.clientWidth / 2, sdvp.clientHeight / 2, SD.view.k / 1.2, true);
  $('#sdzl').onclick = () => zoomAt(sdvp.clientWidth / 2, sdvp.clientHeight / 2, 1, true);
  $('#sdfit').onclick = () => fitDiagram(true);
  $('#sdauto').onclick = () => { SD.moved = false; renderDiagram(true); };
  let rT = null, lastSz = '';
  new ResizeObserver(() => {
    const sz = sdvp.clientWidth + 'x' + sdvp.clientHeight; if (sz === lastSz) return; lastSz = sz;
    clearTimeout(rT); rT = setTimeout(() => { if (!SD.moved && !SD.userView) renderDiagram(true); else drawLines(); }, 180);
  }).observe(sdvp);
})();

/* ===================== Rows drawer (double-click a table) ===================== */
function toggleDrawer(t, forceOpen) {
  S.drawer = !forceOpen && S.drawer === t ? null : t;
  renderDrawer(); renderDiagram();
}
function rowHtml(def, r, i, cls) {
  return `<tr data-i="${i}" class="${cls || ''}"><td class="rn">${/\bins\b/.test(cls || '') ? '+' : i + 1}</td>${r.map((v, j) => `<td data-c="${j}" class="${v === null ? 'null' : ''}${['int', 'num'].includes(fam(def.cols[j].type)) ? ' num' : ''}">${esc(fmtVal(v, def.cols[j].type))}</td>`).join('')}</tr>`;
}
function renderDrawer() {
  const dr = $('#drawer'), g = $('#drawerGutter'), t = S.drawer, def = t && tableDef(t);
  if (!def) { S.drawer = null; dr.hidden = g.hidden = true; return; }
  dr.hidden = g.hidden = false;
  const ex = S.ex, src = ex && ex.sources && ex.sources.find(s => s.table === t), alias = src ? src.alias : t;
  const extra = ex && ex.kind === 'INSERT' && ex.table === t ? ex.newRows : [];
  let alive = null, mark = null;
  if (ex && src) {
    if (ex.kind === 'SELECT') { alive = new Set(); ex.rows.forEach(r => r.srcs.forEach(s => { if (s[alias] != null) alive.add(s[alias]); })); }
    else if (ex.kind === 'DELETE') mark = ex.mark;
    else if (ex.kind === 'DROP') mark = def.rows.map(() => true);
  }
  const qs = queryState(), N = def.rows.length;
  const note = mark ? `${mark.filter(Boolean).length} of ${N} rows marked for deletion` : extra.length ? `${N} rows + ${extra.length} new` : alive ? `${alive.size} of ${N} rows used by the query` : `${N} rows`;
  const ins = S.justIns && S.justIns.table === t ? S.justIns.from : Infinity;
  const wrap0 = dr.querySelector('.tbl-wrap'), sc = wrap0 ? [wrap0.scrollTop, wrap0.scrollLeft] : [0, 0];
  dr.style.setProperty('--tc', def.color);
  dr.innerHTML = `<div class="dhead"><span class="tdot"></span><h3>${esc(t)}</h3><span class="note">${note}</span><span class="sp"></span>${DB.tables[t] ? '<button class="hbtn" data-ins title="Write an INSERT for a new row">+ row</button>' : ''}<button class="hbtn" data-close aria-label="Close the rows panel">Close ✕</button></div>
    <div class="tbl-wrap"><table class="grid" aria-label="Rows of ${esc(t)}"><thead><tr><th class="rn" title="Row number · click a number to pick that row">#</th>${def.cols.map(c => {
      const st = qs.cols.get(t + '.' + c.name) || new Set(), sel = st.has('sel') || st.has('agg');
      return `<th data-col="${esc(c.name)}" class="${sel ? 'sel' : ''}" tabindex="0" aria-pressed="${sel}" title="Click: SELECT this column"><div class="th-in"><span>${esc(c.name)}</span><button class="more" aria-label="More options for ${esc(c.name)}" title="Sort, group, total, calculate">⋯</button></div><div class="meta">${keyBadges(c)}${tyBadge(c.type)}</div></th>`;
    }).join('')}</tr></thead>
    <tbody>${def.rows.map((r, i) => rowHtml(def, r, i, [i >= ins ? 'ins-done' : '', alive && !alive.has(i) ? 'off' : '', mark && mark[i] ? 'del' : ''].join(' ').trim())).join('')}${extra.map((r, k) => rowHtml(def, r, N + k, 'ins')).join('')}</tbody></table>
    ${!N && !extra.length ? `<div class="empty-res">No rows yet. Add some with <b>INSERT INTO ${esc(t)}</b>.</div>` : ''}</div>`;
  const wrap = dr.querySelector('.tbl-wrap'); wrap.scrollTop = sc[0]; wrap.scrollLeft = sc[1];
  dr.querySelector('[data-close]').onclick = () => toggleDrawer(t);
  const ib = dr.querySelector('[data-ins]'); if (ib) ib.onclick = () => insertTemplate(t);
  dr.querySelectorAll('th[data-col]').forEach(th => {
    const col = th.dataset.col;
    th.addEventListener('click', e => { if (e.target.closest('.more')) { colMenu(t, col, e.target.closest('.more')); return; } toggleColumn(t, col, th); });
    th.addEventListener('keydown', e => { if (e.target === th && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleColumn(t, col, th); } });
  });
  dr.querySelector('tbody').addEventListener('click', e => {
    const td = e.target.closest('td'); if (!td) return;
    const i = +td.parentElement.dataset.i;
    if (i >= N) return;
    if (td.classList.contains('rn')) rowPick(t, i); else cellMenu(t, +td.dataset.c, i, td);
  });
}
(() => {
  const g = $('#drawerGutter'), body = $('#schemaBody');
  g.addEventListener('pointerdown', e => {
    e.preventDefault(); g.classList.add('active'); g.setPointerCapture(e.pointerId); document.body.classList.add('noselect');
    const r = body.getBoundingClientRect();
    const move = ev => { const h = Math.max(96, Math.min(r.height - 120, r.bottom - ev.clientY)); $('#drawer').style.height = h + 'px'; };
    const up = () => { g.classList.remove('active'); document.body.classList.remove('noselect'); g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); };
    g.addEventListener('pointermove', move); g.addEventListener('pointerup', up);
  });
})();

/* ===================== Result (centre pane) ===================== */
function resultView() {
  const ex = S.ex;
  if (ex.kind === 'SELECT') return { cols: ex.cols.map(c => ({ label: c.label, type: c.type, alias: c.alias, key: c.key, sel: true, expr: c.expr, item: c.item })), rows: ex.rows.map(o => ({ cells: o.cells, srcs: o.srcs, cls: '' })) };
  const tgt = ex.sources[0], d = tgt.def;
  const tcols = d.cols.map(c => ({ label: c.name, type: c.type, alias: tgt.alias, key: tgt.alias + '.' + c.name }));
  const st = ex.steps[ex.steps.length - 1];
  if (ex.kind === 'DELETE') return { cols: tcols, rows: st.rows.map((r, i) => ({ cells: tcols.map(c => r.vals[c.key]), srcs: [r.src], cls: st.mark[i] ? 'del' : '' })) };
  if (ex.kind === 'INSERT') return { cols: tcols, rows: d.rows.map((r, i) => ({ cells: r, srcs: [{ [tgt.alias]: i }], cls: '' })).concat(ex.newRows.map(r => ({ cells: r, srcs: [], cls: 'ins' }))) };
  if (ex.kind === 'CREATE') return { cols: tcols, rows: [], empty: `${ex.table} has no rows yet. After it's created, add rows with INSERT INTO ${ex.table} … VALUES (…).` };
  return { cols: [], rows: [], empty: `The table ${ex.table} and all ${d.rows.length} of its rows will be removed when you press Run.` };
}
let prevKeys = new Set();
function renderResult() {
  const wrap = $('#resultWrap'), ex = S.ex, empty = $('#empty');
  $('#previewPill').hidden = !(ex && ex.apply);
  if (!ex) {
    wrap.innerHTML = ''; prevKeys = new Set();
    empty.hidden = false;
    empty.innerHTML = S.notice ? `<div>${esc(S.notice)}</div>` : `<div><b>Nothing to show yet</b>Click a table in the diagram to query it,<br>or type SQL on the right.</div>`;
    return;
  }
  empty.hidden = true;
  const v = resultView(), isSel = ex.kind === 'SELECT';
  const order = new Map((ex.q.orderBy || []).map(o => [genE(o.expr), o.dir || 'ASC']));
  const sortOf = c => { if (!c.sel) return ''; for (const k of [c.item && c.item.alias, c.expr && genE(c.expr), c.label]) if (k && order.has(k)) return order.get(k) === 'DESC' ? '↓' : '↑'; return ''; };
  const keys = v.rows.map((r, i) => JSON.stringify(r.srcs) + '|' + i);
  const picked = S.rowSel && S.rowSel.ex === ex ? S.rowSel.sel : null;
  const head = v.cols.map((c, ci) => {
    const color = c.alias ? tcolor(aliasTable(c.alias)) : '';
    const calc = c.sel && !c.key, srt = sortOf(c);
    const fx = calc && c.expr && c.expr.k !== 'col' ? `<div class="fx" title="${esc(genE(c.expr))}">ƒ ${esc(genE(c.expr))}</div>` : '';
    return `<th data-ci="${ci}" ${c.key ? `data-key="${esc(c.key)}"` : ''} data-label="${esc(c.label)}" style="${color ? `--tc:${color}` : ''}" ${isSel ? 'tabindex="0"' : ''} aria-sort="${srt === '↑' ? 'ascending' : srt === '↓' ? 'descending' : 'none'}" title="${isSel ? 'Click to sort · ⋯ for totals and more' : ''}">
      <div class="th-in"><span class="cdot${calc ? ' calc' : ''}" aria-hidden="true"></span><span>${esc(c.label)}</span><span class="sort" aria-hidden="true">${srt}</span>${isSel ? `<button class="more" aria-label="More options for ${esc(c.label)}" title="Sort, total, remove">⋯</button>` : ''}</div>
      <div class="meta">${tyBadge(c.type)}</div>${fx}</th>`;
  }).join('');
  const body = v.rows.map((r, i) => {
    const enter = !prevKeys.has(keys[i]), pk = picked && picked.has(i);
    return `<tr data-r="${i}" tabindex="0" aria-selected="${!!pk}" class="${r.cls}${pk ? ' picked' : ''}${enter ? ' enter' : ''}" ${enter ? `style="animation-delay:${Math.min(i * 16, 320)}ms"` : ''}><td class="rn">${r.cls === 'ins' ? '+' : i + 1}</td>${r.cells.map((x, j) => `<td class="${x === null ? 'null' : ''}${['int', 'num'].includes(fam(v.cols[j].type)) ? ' num' : ''}">${esc(fmtVal(x, v.cols[j].type))}</td>`).join('')}</tr>`;
  }).join('');
  prevKeys = new Set(keys);
  const sc = [wrap.scrollTop, wrap.scrollLeft];
  wrap.innerHTML = v.cols.length ? `<table class="grid" aria-label="Query result"><thead><tr><th class="rn" scope="col">#</th>${head}</tr></thead><tbody>${body}</tbody></table>${!v.rows.length ? `<div class="empty-res">${esc(v.empty || 'No rows match. Try removing a condition.')}</div>` : ''}` : `<div class="empty-res">${esc(v.empty || '')}</div>`;
  if (picked) { wrap.scrollTop = sc[0]; wrap.scrollLeft = sc[1]; }
  S.viewRows = v.rows;
  if (isSel) wrap.querySelectorAll('th[data-ci]').forEach(th => {
    const ci = +th.dataset.ci;
    th.addEventListener('click', e => { if (e.target.closest('.more')) { resultMenu(ci, e.target.closest('.more')); return; } sortResultCol(ci); });
    th.addEventListener('keydown', e => { if (e.target === th && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sortResultCol(ci); } });
  });
  const tb = wrap.querySelector('tbody');
  if (tb) {
    tb.addEventListener('click', e => { const tr = e.target.closest('tr'); if (tr) rowClick(+tr.dataset.r, e); });
    tb.addEventListener('keydown', e => {
      const tr = e.target.closest('tr'); if (!tr) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rowClick(+tr.dataset.r, e); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = e.key === 'ArrowDown' ? tr.nextElementSibling : tr.previousElementSibling; if (n) n.focus(); }
    });
    tb.addEventListener('mouseover', e => { const tr = e.target.closest('tr'); if (tr) traceRow(+tr.dataset.r); });
    tb.addEventListener('focusin', e => { const tr = e.target.closest('tr'); if (tr) traceRow(+tr.dataset.r); });
    tb.addEventListener('mouseleave', () => traceRow(-1));
  }
  if (S.fly) { const name = S.fly; S.fly = null; const th = [...wrap.querySelectorAll('th[data-label]')].find(t => t.dataset.label === name); if (th) { th.scrollIntoView({ inline: 'nearest', block: 'nearest' }); th.animate([{ background: 'var(--sel)' }, { background: 'var(--panel)' }], { duration: 1500 }); } }
}
/* hovering a result row highlights the rows it came from in the rows panel */
function traceRow(ri) {
  $$('#drawer tr.hl').forEach(t => t.classList.remove('hl'));
  if (ri < 0 || !S.drawer || !S.viewRows || !S.viewRows[ri] || !S.ex || !S.ex.sources) return;
  const src = S.ex.sources.find(s => s.table === S.drawer); if (!src) return;
  let first = null;
  S.viewRows[ri].srcs.forEach(m => { const i = m[src.alias]; if (i == null) return; const tr = $(`#drawer tbody tr[data-i="${i}"]`); if (tr) { tr.classList.add('hl'); tr.style.setProperty('--hc', tcolor(S.drawer)); first = first || tr; } });
  if (first) { const w = first.closest('.tbl-wrap'); if (first.offsetTop < w.scrollTop + 40 || first.offsetTop > w.scrollTop + w.clientHeight - 30) w.scrollTo({ top: first.offsetTop - w.clientHeight / 2, behavior: 'smooth' }); }
}

/* ===================== Highlighting result rows writes the SQL for just those rows ===================== */
function rowIdentity(ex) {
  const q = ex.q;
  if (ex.grouped) return q.groupBy.length ? { kind: 'group', exprs: q.groupBy } : null;
  if (q.distinct) { const idx = ex.cols.map((c, i) => c.expr.k === 'col' ? i : -1).filter(i => i >= 0); return idx.length ? { kind: 'values', idx } : null; }
  const cands = ex.sources.filter(s => s.def.cols.some(c => c.pk));
  const pkVal = (s, i) => i == null ? null : s.def.rows[i][s.def.cols.findIndex(c => c.pk)];
  for (const s of [...cands].reverse()) {
    const vals = ex.rows.map(r => pkVal(s, r.srcs[0][s.alias]));
    if (vals.every(v => v !== null) && new Set(vals.map(String)).size === vals.length) return { kind: 'pk', aliases: [s], pkVal };
  }
  return cands.length ? { kind: 'pk', aliases: cands, pkVal } : null;
}
function buildRowCond(rs, idxs) {
  const ex = rs.ex, id = rs.ident, multi = srcList(rs.baseAst).length > 1;
  const ref = (alias, col) => multi ? { k: 'col', table: alias, name: col } : { k: 'col', name: col };
  const eq = (e, v, type) => v === null ? { k: 'isnull', x: e, not: false } : { k: 'bin', op: '=', l: e, r: litFor(v, type) };
  const orOf = list => list.reduce((a, c) => a ? { k: 'bin', op: 'OR', l: a, r: c } : c, null);
  const inOrEq = (e, vals, type) => vals.length === 1 || vals.some(v => v === null) ? orOf(vals.map(v => eq(e, v, type))) : { k: 'in', x: e, list: vals.map(v => litFor(v, type)), not: false };
  if (id.kind === 'pk' && id.aliases.length === 1) {
    const s = id.aliases[0], c = s.def.cols.find(c => c.pk);
    return inOrEq(ref(s.alias, c.name), idxs.map(i => id.pkVal(s, ex.rows[i].srcs[0][s.alias])), c.type);
  }
  if (id.kind === 'pk') return orOf(idxs.map(i => joinAnd(id.aliases.map(s => { const c = s.def.cols.find(c => c.pk); return eq(ref(s.alias, c.name), id.pkVal(s, ex.rows[i].srcs[0][s.alias]), c.type); }))));
  if (id.kind === 'group') {
    const val = (e, i) => evalE(e, { srcs: ex.sources, env: ex.rows[i].unit.env, group: null });
    const typ = e => { try { return typeOf(e, ex.sources); } catch { return 'TEXT'; } };
    if (id.exprs.length === 1) return inOrEq(clone(id.exprs[0]), idxs.map(i => val(id.exprs[0], i)), typ(id.exprs[0]));
    return orOf(idxs.map(i => joinAnd(id.exprs.map(e => eq(clone(e), val(e, i), typ(e))))));
  }
  return orOf(idxs.map(i => joinAnd(id.idx.map(ci => eq(clone(ex.cols[ci].expr), ex.rows[i].cells[ci], ex.cols[ci].type)))));
}
function rowClick(ri, e) {
  const ex = S.ex;
  if (!ex || ex.kind !== 'SELECT') return;
  let rs = S.rowSel;
  if (!rs || rs.ex !== ex) {
    if (ed.value !== S.sql || S.err) return;
    const ident = rowIdentity(ex);
    if (!ident) { toast(ex.grouped ? 'This row sums up every row, so there is nothing more specific to pick.' : 'These rows have no key to pick them by.'); return; }
    const sc = S.script, st = sc ? sc.stmts[sc.sel] : null;
    if (sc && (!st || st.kind !== 'SELECT')) return;
    rs = S.rowSel = { baseText: ed.value, range: st ? st.range : null, baseAst: clone(st || S.ast), ex, ident, sel: new Set(), genText: null };
  }
  const multi = e && (e.shiftKey || e.ctrlKey || e.metaKey);
  if (multi) { if (rs.sel.has(ri)) rs.sel.delete(ri); else rs.sel.add(ri); }
  else if (rs.sel.size === 1 && rs.sel.has(ri)) rs.sel.clear();
  else { rs.sel.clear(); rs.sel.add(ri); }
  applyRowSel(ri);
}
function applyRowSel(focusRow) {
  const rs = S.rowSel, old = ed.value;
  let text;
  if (!rs.sel.size) { text = rs.baseText; S.rowSel = null; }
  else {
    const q = clone(rs.baseAst); delete q.spans; delete q.range;
    const cond = buildRowCond(rs, [...rs.sel].sort((a, b) => a - b));
    q.where = q.where ? { k: 'bin', op: 'AND', l: q.where, r: cond } : cond;
    text = genQuery(q);
    if (rs.range) text = rs.baseText.slice(0, rs.range[0]) + text + rs.baseText.slice(rs.range[1]);
    rs.genText = text;
  }
  ed.value = text; S.sql = text;
  flashLines(old, text); renderHL(); pushHist(text);
  renderStatus(); renderResult();
  if (focusRow != null) { const tr = $(`#resultWrap tbody tr[data-r="${focusRow}"]`); if (tr) tr.focus({ preventScroll: true }); }
}
function clearRowSel() { if (!S.rowSel) return; S.rowSel.sel.clear(); applyRowSel(); }

/* ===================== Popovers ===================== */
let pop = null;
function closePop() { if (pop) { const a = pop._anchor; pop.remove(); pop = null; if (a && a.isConnected && document.activeElement === document.body) a.focus({ preventScroll: true }); } }
function openPop(anchor, html, bind) {
  closePop();
  pop = document.createElement('div'); pop.className = 'pop'; pop.setAttribute('role', 'menu'); pop.innerHTML = html; pop._anchor = anchor; document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  let x = r.left, y = r.bottom + 6;
  if (x + pw > innerWidth - 8) x = innerWidth - pw - 8;
  if (y + ph > innerHeight - 8) y = Math.max(8, r.top - ph - 6);
  pop.style.left = Math.max(8, x) + 'px'; pop.style.top = Math.max(8, y) + 'px';
  bind(pop);
  const first = pop.querySelector('button, select, input'); if (first) first.focus({ preventScroll: true });
}
document.addEventListener('pointerdown', e => {
  if (pop && !pop.contains(e.target)) closePop();
  const tp = $('#tips'); if (!tp.hidden && !tp.contains(e.target) && !e.target.closest('#tipsBtn')) showTips(false);
}, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (pop) closePop(); else if (!$('#tips').hidden) showTips(false); else if (S.rowSel) clearRowSel(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target !== ed) { e.preventDefault(); runNow(); }
});
let comb = 'AND';
const litFor = (v, type) => v === null ? { k: 'lit', v: null } : typeof v === 'number' ? { k: 'lit', v, raw: fmtVal(v, type) } : { k: 'lit', v };
/* how a column reference will read once `t` is in the query (used for menu labels) */
function provisionalRef(t, col) {
  const q = S.ast, a = q && aliasIn(q, t), n = srcList(q).length + (a ? 0 : 1);
  return n > 1 ? { k: 'col', table: a || t, name: col } : { k: 'col', name: col };
}
function cellMenu(t, ci, ri, td) {
  const def = DB.tables[t]; if (!def || ri >= def.rows.length) return;
  const c = def.cols[ci], v = def.rows[ri][ci], f = fam(c.type), lit = litFor(v, c.type);
  const builds = [];
  if (v === null) builds.push(r => ({ k: 'isnull', x: r, not: false }), r => ({ k: 'isnull', x: r, not: true }));
  else {
    ['=', '<>'].forEach(op => builds.push(r => ({ k: 'bin', op, l: r, r: lit })));
    if (['int', 'num', 'date'].includes(f)) ['>', '<', '>=', '<='].forEach(op => builds.push(r => ({ k: 'bin', op, l: r, r: lit })));
    if (f === 'text') builds.push(r => ({ k: 'like', x: r, pat: { k: 'lit', v: String(v).slice(0, 1) + '%' }, not: false, ci: false }));
    builds.push(r => ({ k: 'isnull', x: r, not: true }));
  }
  const pref = provisionalRef(t, c.name), hasWhere = !!(S.ast && S.ast.where && aliasIn(S.ast, t));
  const existing = new Set(S.ast ? flatAnd(S.ast.where).map(x => genE(x)) : []);
  const delCond = v === null ? { k: 'isnull', x: { k: 'col', name: c.name }, not: false } : { k: 'bin', op: '=', l: { k: 'col', name: c.name }, r: lit };
  const delSql = `DELETE FROM ${t}\nWHERE ${genE(delCond)};`;
  openPop(td, `<h5>Filter rows · WHERE</h5>${hasWhere ? `<div class="seg" role="group" aria-label="Combine with"><button data-comb="AND" class="${comb === 'AND' ? 'on' : ''}" aria-pressed="${comb === 'AND'}">AND</button><button data-comb="OR" class="${comb === 'OR' ? 'on' : ''}" aria-pressed="${comb === 'OR'}">OR</button></div>` : ''}
    ${builds.map((b, i) => { const g = genE(b(pref)); return `<button class="opt" role="menuitem" data-o="${i}">${highlight(g).trim()}${existing.has(g) ? '<span class="on">ON · remove</span>' : ''}</button>`; }).join('')}
    ${hasWhere ? '<button class="opt" role="menuitem" data-clear><span class="lbl" style="margin:0">Clear all WHERE conditions</span></button>' : ''}
    <div class="sep"></div><h5>Change data</h5>
    <button class="opt danger" role="menuitem" data-del>${highlight(delSql.replace('\n', ' ')).trim()}<span class="lbl">preview first</span></button>`, p => {
    p.querySelectorAll('[data-comb]').forEach(b => b.onclick = () => { comb = b.dataset.comb; p.querySelectorAll('[data-comb]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); });
    p.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { const build = builds[+b.dataset.o], cm = comb; closePop(); withTable(t, (q, a) => addConditionIn(q, build(refFor(q, a, c.name)), cm)); });
    const cl = p.querySelector('[data-clear]'); if (cl) cl.onclick = () => { closePop(); mutate(q => { if (!q) return null; q.where = null; }); };
    p.querySelector('[data-del]').onclick = () => { closePop(); setSQL(delSql, { gui: true }); };
  });
}
function rowPick(t, i) {
  const def = DB.tables[t]; if (!def || i >= def.rows.length) return;
  const pk = def.cols.findIndex(c => c.pk); if (pk < 0) return;
  const c = def.cols[pk], v = def.rows[i][pk];
  withTable(t, (q, a) => addConditionIn(q, { k: 'bin', op: '=', l: refFor(q, a, c.name), r: litFor(v, c.type) }, 'AND'));
}
function insertTemplate(t) {
  const d = DB.tables[t]; if (!d) return;
  const last = d.rows[d.rows.length - 1];
  const cols = d.cols.filter(c => !c.serial);
  const vals = cols.map(c => {
    const i = d.cols.indexOf(c), v = last ? last[i] : null;
    if (c.pk && fam(c.type) === 'int') return String(d.rows.reduce((m, r) => Math.max(m, r[i] || 0), 0) + 1);
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return fmtVal(v, c.type);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    return "'" + String(v).replace(/'/g, "''") + "'";
  });
  setSQL(`INSERT INTO ${t} (${cols.map(c => c.name).join(', ')})\nVALUES (${vals.join(', ')});`, { gui: true });
  ed.focus();
}
const OPWORD = { '+': 'plus', '-': 'minus', '*': 'times', '/': 'per' };
function numericColsFor(t) {
  const tabs = new Set([t, ...srcList(S.ast).map(s => s.table)]);
  return [...tabs].flatMap(tt => (tableDef(tt) || { cols: [] }).cols.filter(c => ['int', 'num'].includes(fam(c.type)) && !c.pk && !c.fk).map(c => ({ table: tt, col: c.name })));
}
function colMenu(t, col, anchor) {
  const def = tableDef(t); if (!def) return;
  const c = def.cols.find(x => x.name === col), f = fam(c.type), ref = genE(provisionalRef(t, col));
  const num = ['int', 'num'].includes(f);
  const W = fn => () => withTable(t, (q, a) => fn(q, a));
  const items = [
    ['ORDER BY ' + ref + ' ASC', W((q, a) => setOrderIn(q, a, col, 'ASC')), 'A→Z, 1→9'],
    ['ORDER BY ' + ref + ' DESC', W((q, a) => setOrderIn(q, a, col, 'DESC')), 'Z→A, 9→1'],
    null,
    ['GROUP BY ' + ref, W((q, a) => groupByIn(q, a, col)), 'one row per value'],
    null,
    ['COUNT(' + ref + ')', W((q, a) => aggIn(q, 'COUNT', a, col)), 'non-empty values'],
    ...(num ? [['SUM(' + ref + ')', W((q, a) => aggIn(q, 'SUM', a, col)), 'total'], ['AVG(' + ref + ')', W((q, a) => aggIn(q, 'AVG', a, col)), 'average']] : []),
    ['MIN(' + ref + ')', W((q, a) => aggIn(q, 'MIN', a, col)), 'smallest'],
    ['MAX(' + ref + ')', W((q, a) => aggIn(q, 'MAX', a, col)), 'largest'],
  ];
  const others = numericColsFor(t).filter(o => !(o.table === t && o.col === col));
  const multi = others.some(o => o.table !== t) || srcList(S.ast).length > 1;
  const calc = num ? `<div class="sep"></div><h5>Calculate a new column</h5>
    <div class="calc"><span class="chip" style="--tc:${def.color}">${esc(col)}</span>
      <select id="cop" aria-label="operator"><option value="*">×</option><option value="+">+</option><option value="-">−</option><option value="/">÷</option></select>
      <select id="carg" aria-label="second value"><option value="#">a number</option>${others.map((o, i) => `<option value="${i}">${esc((multi ? o.table + '.' : '') + o.col)}</option>`).join('')}</select>
      <input id="cnum" type="number" step="any" value="2" aria-label="number">
      <button id="cadd" class="applybtn">Add</button></div>
    <div class="calcprev" id="cprev" aria-live="polite"></div>` : '';
  openPop(anchor, `<h5>${esc(t)}.${esc(col)} · ${esc(c.type)}</h5>` + items.map((it, i) => it ? `<button class="opt" role="menuitem" data-i="${i}">${highlight(it[0]).trim()}<span class="lbl">${it[2]}</span></button>` : '<div class="sep"></div>').join('') + calc, p => {
    p.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { closePop(); items[+b.dataset.i][1](); });
    if (!num) return;
    const op = p.querySelector('#cop'), arg = p.querySelector('#carg'), n = p.querySelector('#cnum'), prev = p.querySelector('#cprev');
    const grouped = S.ast && (S.ast.groupBy.length || S.ast.select.some(it => hasAgg(it.expr)));
    const upd = () => {
      n.hidden = arg.value !== '#';
      const other = arg.value === '#' ? null : others[+arg.value];
      const r = other ? genE(provisionalRef(other.table, other.col)) : (n.value || '0');
      prev.innerHTML = highlight((grouped ? 'SUM(' : '') + `${ref} ${op.value} ${r}` + (grouped ? ')' : '')).trim();
    };
    [op, arg, n].forEach(x => x.addEventListener('input', upd)); upd();
    p.querySelector('#cadd').onclick = () => {
      const other = arg.value === '#' ? null : others[+arg.value], v = parseFloat(n.value), o = op.value;
      if (!other && isNaN(v)) return;
      closePop();
      withTable(t, (q, a) => {
        let oa = null;
        if (other) { oa = aliasIn(q, other.table); if (!oa) { addTableTo(q, other.table); oa = aliasIn(q, other.table); } }
        const l = refFor(q, a, col), r = other ? refFor(q, oa, other.col) : { k: 'lit', v, raw: String(v) };
        let expr = { k: 'bin', op: o, l, r }, name = `${col}_${OPWORD[o]}_${other ? other.col : String(v).replace(/\W/g, '_')}`;
        if (q.groupBy.length || q.select.some(it => hasAgg(it.expr))) { expr = { k: 'fn', name: 'SUM', args: [expr], star: false, distinct: false }; name = 'total_' + name; }
        q.select.push({ expr, alias: name }); S.fly = name;
      });
    };
  });
}
function resultMenu(ci, anchor) {
  const c = S.ex.cols[ci], num = ['int', 'num'].includes(fam(c.type)), base = c.item ? c.item.expr : c.expr;
  const items = [[`ORDER BY ${c.label} ASC`, () => sortResultCol(ci, 'ASC')], [`ORDER BY ${c.label} DESC`, () => sortResultCol(ci, 'DESC')]];
  if (!hasAgg(base)) { items.push(null); (num ? ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT'] : ['COUNT', 'MIN', 'MAX']).forEach(fn => items.push([`${fn}(${genE(base)})`, () => aggResultCol(ci, fn)])); }
  items.push(null, ['Remove from SELECT', () => removeResultCol(ci), true]);
  openPop(anchor, `<h5>Result column · ${esc(c.label)}</h5>` + items.map((it, i) => it ? `<button class="opt${it[2] ? ' danger' : ''}" role="menuitem" data-i="${i}">${it[2] ? `<span class="lbl" style="margin:0">${it[0]}</span>` : highlight(it[0]).trim()}</button>` : '<div class="sep"></div>').join(''), p => {
    p.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { closePop(); items[+b.dataset.i][1](); });
  });
}
function flyTo(fromEl, label, color, targetSel) {
  if (!fromEl || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r0 = fromEl.getBoundingClientRect();
  setTimeout(() => {
    const target = document.querySelector(targetSel); if (!target) return;
    target.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    const r1 = target.getBoundingClientRect();
    const g = document.createElement('div'); g.className = 'ghost'; g.textContent = label; g.style.setProperty('--gc', color);
    g.style.left = r0.left + 'px'; g.style.top = r0.top + 'px'; document.body.appendChild(g);
    const dx = r1.left - r0.left, dy = r1.top - r0.top;
    g.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx * .5}px, ${dy * .5 - 40}px) scale(1.08)`, opacity: 1, offset: .5 }, { transform: `translate(${dx}px, ${dy}px) scale(.92)`, opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.3,.7,.2,1)' }).onfinish = () => g.remove();
    target.animate([{ boxShadow: `inset 0 0 0 3px ${color}` }, { boxShadow: 'inset 0 0 0 0 transparent' }], { duration: 1000, delay: 450 });
  }, 60);
}
let toastT = null;
function toast(msg) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 4200);
}

/* ===================== Render everything ===================== */
function renderAll() { renderDiagram(); renderDrawer(); renderResult(); }

/* ===================== Panes, text size, contrast, tips ===================== */
const panes = $('#panes');
const widths = { l: 0, r: 0 }, saved = { l: 0, r: 0 };
function setW(side, w) { widths[side] = w; panes.style.setProperty(side === 'l' ? '--lw' : '--rw', w + 'px'); }
(() => {
  const W = innerWidth;
  setW('l', Math.round(Math.max(320, Math.min(820, W * .42)))); setW('r', Math.round(Math.max(300, Math.min(560, W * .26))));
  saved.l = widths.l; saved.r = widths.r;
})();
$$('.gutter').forEach(g => {
  const side = g.dataset.g;
  g.addEventListener('pointerdown', e => {
    e.preventDefault(); g.classList.add('active'); g.setPointerCapture(e.pointerId); document.body.classList.add('noselect');
    const sx = e.clientX, w0 = widths[side], max = panes.clientWidth * .65;
    const move = ev => { let w = w0 + (side === 'l' ? ev.clientX - sx : sx - ev.clientX); w = Math.max(0, Math.min(max, w)); if (w < 160) w = w < 80 ? 0 : 160; setW(side, w); };
    const up = () => { g.classList.remove('active'); document.body.classList.remove('noselect'); g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); if (widths[side]) saved[side] = widths[side]; };
    g.addEventListener('pointermove', move); g.addEventListener('pointerup', up);
  });
  g.addEventListener('dblclick', () => { panes.style.transition = 'grid-template-columns .3s'; setW(side, widths[side] ? 0 : saved[side]); setTimeout(() => panes.style.transition = '', 320); });
});
const SCALES = [.85, 1, 1.15, 1.3, 1.5, 1.75];
function setScale(s, quiet) {
  S.scale = s;
  document.documentElement.style.setProperty('--scale', s);
  $('#fsVal').textContent = Math.round(s * 100) + '%';
  $('#fsDown').disabled = s <= SCALES[0]; $('#fsUp').disabled = s >= SCALES[SCALES.length - 1];
  try { localStorage.setItem('sqlplayground-scale', s); } catch {}
  if (!quiet) renderDiagram(true);
}
$('#fsDown').onclick = () => { const i = SCALES.indexOf(S.scale); if (i > 0) setScale(SCALES[i - 1]); };
$('#fsUp').onclick = () => { const i = SCALES.indexOf(S.scale); if (i < SCALES.length - 1) setScale(SCALES[i + 1]); };
function setContrast(on) {
  if (on) document.documentElement.setAttribute('data-contrast', 'high'); else document.documentElement.removeAttribute('data-contrast');
  $('#contrastBtn').setAttribute('aria-pressed', on);
  try { localStorage.setItem('sqlplayground-contrast', on ? '1' : '0'); } catch {}
}
$('#contrastBtn').onclick = () => setContrast($('#contrastBtn').getAttribute('aria-pressed') !== 'true');
function showTips(on) { $('#tips').hidden = !on; $('#tipsBtn').setAttribute('aria-expanded', on); if (on) $('#tipsClose').focus(); }
$('#tipsBtn').onclick = () => showTips($('#tips').hidden);
$('#tipsClose').onclick = () => { showTips(false); $('#tipsBtn').focus(); };

$('#runBtn').onclick = runNow;
$('#newTable').onclick = () => { setSQL(NEW_TABLE_SQL, { gui: true }); ed.focus(); };
$('#reset').onclick = () => {
  S.committed = null; S.dataHist = []; S.rowSel = null; S.drawer = null; resetDB(); S.dataVer++;
  SD.key = ''; SD.moved = false; renderChanges(); setSQL(START_SQL, { gui: true });
};

/* boot */
$$('.modkey').forEach(k => k.textContent = MOD);
$('#runBtn').title = `Run (${MOD}+Enter). Applies CREATE / INSERT / DELETE / DROP after the preview.`;
try {
  const sc = parseFloat(localStorage.getItem('sqlplayground-scale')); if (SCALES.includes(sc)) S.scale = sc;
  if (localStorage.getItem('sqlplayground-contrast') === '1') setContrast(true);
} catch {}
setScale(S.scale, true);
renderChanges();
setSQL(START_SQL, { record: true });
})();
