/* ===================== Sample data: shop_db ===================== */
const DB = { tables: {
  customers: { color: '#3b6cf6', desc: 'People who buy from the shop',
    cols: [
      { name: 'customer_id', type: 'INT', pk: true },
      { name: 'first_name', type: 'VARCHAR(50)' },
      { name: 'last_name', type: 'VARCHAR(50)' },
      { name: 'email', type: 'VARCHAR(100)' },
      { name: 'country', type: 'VARCHAR(50)' },
      { name: 'signup_date', type: 'DATE' },
      { name: 'is_vip', type: 'BOOLEAN' } ],
    rows: [
      [1, 'Ava', 'Chen', 'ava.chen@mail.com', 'USA', '2023-01-14', true],
      [2, 'Liam', 'Patel', 'liam.p@mail.com', 'Canada', '2023-02-03', false],
      [3, 'Sofia', 'Garcia', 'sofia.g@mail.com', 'Spain', '2023-03-22', false],
      [4, 'Noah', 'Kim', 'noah.kim@mail.com', 'USA', '2023-04-10', true],
      [5, 'Emma', 'Müller', 'emma.m@mail.com', 'Germany', '2023-05-18', false],
      [6, 'Lucas', 'Silva', 'lucas.s@mail.com', 'Brazil', '2023-06-07', false],
      [7, 'Mia', 'Johnson', 'mia.j@mail.com', 'USA', '2023-07-29', false],
      [8, 'Ethan', 'Nguyen', 'ethan.n@mail.com', 'Canada', '2023-09-02', true],
      [9, 'Olivia', 'Rossi', 'olivia.r@mail.com', 'Italy', '2024-01-11', false],
      [10, 'Yuki', 'Tanaka', 'yuki.t@mail.com', 'Japan', '2024-02-25', false] ] },
  products: { color: '#0f9f86', desc: 'Everything the shop sells',
    cols: [
      { name: 'product_id', type: 'INT', pk: true },
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'category', type: 'VARCHAR(50)' },
      { name: 'price', type: 'NUMERIC(10,2)' },
      { name: 'stock', type: 'INT' } ],
    rows: [
      [101, 'Wireless Earbuds', 'Electronics', 79.99, 120],
      [102, 'USB-C Charger', 'Electronics', 24.50, 300],
      [103, 'Smart Watch', 'Electronics', 199.00, 45],
      [104, 'Chef Knife', 'Home', 64.00, 80],
      [105, 'Espresso Maker', 'Home', 149.95, 30],
      [106, 'Linen Throw', 'Home', 39.00, 60],
      [107, 'SQL for Beginners', 'Books', 29.99, 200],
      [108, 'Data Atlas', 'Books', 45.00, 0],
      [109, 'Yoga Mat', 'Sports', 32.00, 150],
      [110, 'Trail Backpack', 'Sports', 89.50, 40],
      [111, 'Water Bottle', 'Sports', 18.00, 500],
      [112, 'Bluetooth Speaker', 'Electronics', 59.90, 75] ] },
  orders: { color: '#e0891b', desc: 'One row per product bought: links customers to products',
    cols: [
      { name: 'order_id', type: 'BIGINT', pk: true },
      { name: 'customer_id', type: 'INT', fk: { table: 'customers', col: 'customer_id' } },
      { name: 'product_id', type: 'INT', fk: { table: 'products', col: 'product_id' } },
      { name: 'quantity', type: 'SMALLINT' },
      { name: 'unit_price', type: 'NUMERIC(10,2)' },
      { name: 'order_date', type: 'DATE' },
      { name: 'status', type: 'VARCHAR(20)' } ],
    rows: [
      [1001, 1, 101, 1, 79.99, '2024-03-02', 'delivered'], [1002, 1, 111, 2, 18.00, '2024-03-02', 'delivered'],
      [1003, 2, 107, 1, 29.99, '2024-03-05', 'delivered'], [1004, 2, 111, 1, 18.00, '2024-03-05', 'delivered'],
      [1005, 1, 103, 1, 199.00, '2024-03-18', 'shipped'], [1006, 3, 104, 1, 64.00, '2024-04-01', 'delivered'],
      [1007, 3, 105, 1, 149.95, '2024-04-01', 'delivered'], [1008, 4, 110, 1, 89.50, '2024-04-09', 'cancelled'],
      [1009, 5, 102, 3, 24.50, '2024-04-15', 'delivered'], [1010, 5, 112, 1, 59.90, '2024-04-15', 'delivered'],
      [1011, 6, 109, 2, 32.00, '2024-05-02', 'shipped'], [1012, 4, 107, 1, 29.99, '2024-05-11', 'processing'],
      [1013, 4, 108, 1, 45.00, '2024-05-11', 'processing'], [1014, 7, 101, 2, 79.99, '2024-05-20', 'delivered'],
      [1015, 8, 110, 1, 89.50, '2024-06-01', 'shipped'], [1016, 8, 111, 4, 18.00, '2024-06-01', 'shipped'],
      [1017, 1, 112, 1, 59.90, '2024-06-14', 'processing'], [1018, 9, 104, 2, 64.00, '2024-06-21', 'delivered'],
      [1019, 8, 103, 1, 199.00, '2024-07-03', 'delivered'], [1020, 8, 102, 1, 24.50, '2024-07-03', 'delivered'],
      [1021, 2, 109, 1, 32.00, '2024-07-09', 'processing'], [1022, 2, 107, 2, 29.99, '2024-07-09', 'processing'] ] }
} };

/* ===================== Types ===================== */
function typeFamily(t) {
  t = (t || '').toUpperCase();
  if (/^(SMALLINT|INT|INTEGER|BIGINT|SERIAL|BIGSERIAL)/.test(t)) return 'int';
  if (/^(NUMERIC|DECIMAL|REAL|DOUBLE|FLOAT)/.test(t)) return 'num';
  if (/^(VARCHAR|TEXT|CHAR)/.test(t)) return 'text';
  if (/^(DATE|TIMESTAMP)/.test(t)) return 'date';
  if (/^BOOL/.test(t)) return 'bool';
  return 'text';
}
function normType(t) {
  const u = t.toUpperCase();
  return ({ INTEGER: 'INT', INT4: 'INT', INT8: 'BIGINT', INT2: 'SMALLINT', DECIMAL: 'NUMERIC', BOOL: 'BOOLEAN', FLOAT: 'REAL', VARCHAR: 'VARCHAR', CHARACTER: 'CHAR', SERIAL4: 'SERIAL', SERIAL8: 'BIGSERIAL' })[u] || u;
}
const KNOWN_TYPES = new Set(['INT', 'SMALLINT', 'BIGINT', 'SERIAL', 'BIGSERIAL', 'NUMERIC', 'REAL', 'VARCHAR', 'CHAR', 'TEXT', 'DATE', 'TIMESTAMP', 'BOOLEAN']);
const NEW_COLORS = ['#c2410c', '#0e7490', '#a21caf', '#4d7c0f', '#b45309', '#1d4ed8'];
const ORIGINAL = JSON.parse(JSON.stringify(DB.tables));
function snapshotDB() { return JSON.parse(JSON.stringify(DB.tables)); }
function restoreDB(snap) { Object.keys(DB.tables).forEach(k => delete DB.tables[k]); Object.assign(DB.tables, JSON.parse(JSON.stringify(snap))); }
function resetDB() { restoreDB(ORIGINAL); }
function fmtVal(v, type) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') {
    const m = /NUMERIC\(\d+,(\d+)\)/i.exec(type || '');
    if (m) return v.toFixed(+m[1]);
    if (typeFamily(type) === 'num' && !Number.isInteger(v)) return (Math.round(v * 100) / 100).toFixed(2);
    return String(v);
  }
  return String(v);
}

/* ===================== Errors ===================== */
class SqlError extends Error { constructor(msg, hint, pos) { super(msg); this.hint = hint; this.pos = pos; } }

/* ===================== Tokenizer ===================== */
const KW = new Set('SELECT DISTINCT FROM WHERE AND OR NOT AS JOIN INNER LEFT RIGHT FULL OUTER CROSS ON USING GROUP BY HAVING ORDER ASC DESC LIMIT OFFSET IN IS NULL LIKE ILIKE BETWEEN TRUE FALSE NULLS FIRST LAST'.split(' '));
function tokenize(src) {
  const toks = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '-' && src[i + 1] === '-') { while (i < src.length && src[i] !== '\n') i++; continue; }
    const s = i;
    if (/[A-Za-z_\u00C0-\u024F]/.test(c)) {
      while (i < src.length && /[A-Za-z0-9_\u00C0-\u024F]/.test(src[i])) i++;
      const w = src.slice(s, i), u = w.toUpperCase();
      toks.push(KW.has(u) ? { t: 'kw', v: u, s, e: i } : { t: 'id', v: w.toLowerCase(), s, e: i });
      continue;
    }
    if (c === '"') {
      i++; while (i < src.length && src[i] !== '"') i++;
      if (i >= src.length) throw new SqlError('unterminated quoted identifier', null, s);
      i++; toks.push({ t: 'id', v: src.slice(s + 1, i - 1), s, e: i }); continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      while (i < src.length && /[0-9.]/.test(src[i])) i++;
      toks.push({ t: 'num', v: parseFloat(src.slice(s, i)), raw: src.slice(s, i), s, e: i }); continue;
    }
    if (c === "'") {
      i++; let v = '';
      for (;;) {
        if (i >= src.length) throw new SqlError('unterminated quoted string', "Close the text with a single quote: 'like this'", s);
        if (src[i] === "'") { if (src[i + 1] === "'") { v += "'"; i += 2; continue; } i++; break; }
        v += src[i++];
      }
      toks.push({ t: 'str', v, s, e: i }); continue;
    }
    const two = src.slice(i, i + 2);
    if (['<>', '!=', '<=', '>=', '||', '::'].includes(two)) { toks.push({ t: 'op', v: two === '!=' ? '<>' : two, s, e: i + 2 }); i += 2; continue; }
    if ('=<>+-*/%'.includes(c)) { toks.push({ t: 'op', v: c, s, e: i + 1 }); i++; continue; }
    if ('(),.;'.includes(c)) { toks.push({ t: 'p', v: c, s, e: i + 1 }); i++; continue; }
    throw new SqlError(`syntax error at or near "${c}"`, null, s);
  }
  toks.push({ t: 'eof', v: '', s: src.length, e: src.length });
  return toks;
}

/* ===================== Parser ===================== */
function parse(src) {
  const T = tokenize(src); let p = 0;
  const isKw = (v, o = 0) => T[p + o].t === 'kw' && T[p + o].v === v;
  const isP = v => T[p].t === 'p' && T[p].v === v;
  const isOp = v => T[p].t === 'op' && T[p].v === v;
  const next = () => T[p++];
  const fail = (m, h) => {
    const t = T[p];
    throw new SqlError(m || (t.t === 'eof' ? 'syntax error at end of input' : `syntax error at or near "${src.slice(t.s, t.e)}"`), h, t.s);
  };
  const expectKw = v => { if (!isKw(v)) fail(null, `Expected ${v} here.`); return next(); };
  const expectP = v => { if (!isP(v)) fail(null, `Expected "${v}" here.`); return next(); };
  const ident = () => { if (T[p].t === 'id') return next().v; fail(); };
  const isW = w => T[p].t === 'id' && T[p].v === w;
  const expectW = w => { if (!isW(w)) fail(null, `Expected ${w.toUpperCase()} here.`); return next(); };
  const endStmt = () => { if (isP(';')) next(); if (T[p].t !== 'eof') fail(null, 'Run one statement at a time.'); };
  const identList = () => { expectP('('); const l = []; do l.push(ident()); while (isP(',') && next()); expectP(')'); return l; };

  if (T[0].t === 'eof') throw new SqlError('Empty query', 'Click a table on the left, or type SELECT * FROM customers;', 0);
  if (isW('create')) return parseCreate();
  if (isW('insert')) return parseInsert();
  if (isW('delete')) return parseDelete();
  if (isW('drop')) return parseDrop();
  if (!isKw('SELECT')) {
    if (isKw('FROM')) fail('A query must start with SELECT', 'Try: SELECT * FROM ' + (T[1].t === 'id' ? T[1].v : 'customers') + ';');
    if (T[p].t === 'id' && ['update', 'alter', 'with', 'truncate'].includes(T[p].v))
      fail(`${T[p].v.toUpperCase()} is not part of this demo`, 'Supported: SELECT, CREATE TABLE, INSERT INTO, DELETE FROM, DROP TABLE.');
    fail();
  }
  const q = { distinct: false, select: [], from: null, joins: [], where: null, groupBy: [], having: null, orderBy: [], limit: null, offset: null, spans: {} };
  let s = T[p].s; next();
  if (isKw('DISTINCT')) { next(); q.distinct = true; }
  do { q.select.push(selectItem()); } while (isP(',') && next());
  q.spans.select = [s, T[p - 1].e];
  if (!isKw('FROM')) fail(T[p].t === 'eof' ? 'This demo needs a FROM clause' : null, 'e.g. SELECT * FROM customers;');
  s = T[p].s; next(); q.from = tableRef(); q.spans.from = [s, T[p - 1].e];
  while (isKw('JOIN') || isKw('INNER') || isKw('LEFT') || isKw('RIGHT') || isKw('FULL') || isKw('CROSS') || isP(',')) {
    const js = T[p].s; let type = 'INNER';
    if (isP(',')) { next(); type = 'CROSS'; }
    else {
      if (isKw('INNER')) next();
      else if (isKw('LEFT') || isKw('RIGHT') || isKw('FULL')) { type = next().v; if (isKw('OUTER')) next(); }
      else if (isKw('CROSS')) { next(); type = 'CROSS'; }
      expectKw('JOIN');
    }
    const j = Object.assign({ type, on: null }, tableRef());
    if (type !== 'CROSS') {
      if (isKw('ON')) { next(); j.on = parseExpr(); }
      else if (isKw('USING')) { next(); expectP('('); j.using = []; do j.using.push(ident()); while (isP(',') && next()); expectP(')'); }
      else fail('JOIN needs an ON condition', 'e.g. JOIN orders ON orders.customer_id = customers.customer_id');
    }
    j.span = [js, T[p - 1].e]; q.joins.push(j);
  }
  if (isKw('WHERE')) { s = T[p].s; next(); q.where = parseExpr(); q.spans.where = [s, T[p - 1].e]; }
  if (isKw('GROUP')) { s = T[p].s; next(); expectKw('BY'); do q.groupBy.push(parseExpr()); while (isP(',') && next()); q.spans.groupBy = [s, T[p - 1].e]; }
  if (isKw('HAVING')) { s = T[p].s; next(); q.having = parseExpr(); q.spans.having = [s, T[p - 1].e]; }
  if (isKw('ORDER')) {
    s = T[p].s; next(); expectKw('BY');
    do {
      const it = { expr: parseExpr(), dir: null };
      if (isKw('ASC') || isKw('DESC')) it.dir = next().v;
      if (isKw('NULLS')) { next(); it.nulls = (isKw('FIRST') || isKw('LAST')) ? next().v : fail(); }
      q.orderBy.push(it);
    } while (isP(',') && next());
    q.spans.orderBy = [s, T[p - 1].e];
  }
  if (isKw('LIMIT')) { s = T[p].s; next(); if (T[p].t !== 'num') fail(null, 'LIMIT takes a number'); q.limit = next().v; q.spans.limit = [s, T[p - 1].e]; }
  if (isKw('OFFSET')) { s = T[p].s; next(); if (T[p].t !== 'num') fail(null, 'OFFSET takes a number'); q.offset = next().v; q.spans.limit = [q.spans.limit ? q.spans.limit[0] : s, T[p - 1].e]; }
  if (isP(';')) next();
  if (T[p].t !== 'eof') fail(null, isP(';') ? 'Run one statement at a time.' : 'Clause order is SELECT … FROM … JOIN … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT');
  q.kind = 'SELECT';
  return q;

  function typeSpec() {
    const st = T[p].s; let base = ident();
    if (base === 'double') { expectW('precision'); base = 'real'; }
    if (base === 'character' && isW('varying')) { next(); base = 'varchar'; }
    let args = '';
    if (isP('(')) { next(); const a = []; do { if (T[p].t !== 'num') fail(null, 'Type sizes are numbers, e.g. VARCHAR(50)'); a.push(next().raw); } while (isP(',') && next()); expectP(')'); args = '(' + a.join(',') + ')'; }
    const t = normType(base);
    if (!KNOWN_TYPES.has(t)) throw new SqlError(`type "${base}" does not exist`, 'Try INT, BIGINT, SMALLINT, SERIAL, NUMERIC(10,2), VARCHAR(50), TEXT, DATE, TIMESTAMP or BOOLEAN.', st);
    return t + args;
  }
  function parseCreate() {
    const s0 = T[p].s; next(); expectW('table');
    let ifNot = false; if (isW('if')) { next(); expectKw('NOT'); expectW('exists'); ifNot = true; }
    const name = ident(); expectP('(');
    const cols = [], tcons = [];
    do {
      if (isW('constraint')) { next(); ident(); }
      if (isW('primary')) { next(); expectW('key'); tcons.push({ pk: identList() }); continue; }
      if (isW('unique')) { next(); tcons.push({ unique: identList() }); continue; }
      if (isW('foreign')) { next(); expectW('key'); const c = identList(); expectW('references'); const t = ident(); const rc = isP('(') ? identList() : null; tcons.push({ fk: { cols: c, table: t, refcols: rc } }); continue; }
      const c = { name: ident(), type: typeSpec() };
      for (;;) {
        if (isW('constraint')) { next(); ident(); continue; }
        if (isW('primary')) { next(); expectW('key'); c.pk = true; }
        else if (isKw('NOT')) { next(); expectKw('NULL'); c.notnull = true; }
        else if (isKw('NULL')) next();
        else if (isW('unique')) { next(); c.unique = true; }
        else if (isW('references')) { next(); const t = ident(); let col = null; if (isP('(')) { next(); col = ident(); expectP(')'); } c.fk = { table: t, col }; }
        else if (isW('default')) { next(); c.dflt = parseCast(); }
        else break;
      }
      cols.push(c);
    } while (isP(',') && next());
    expectP(')'); const e0 = T[p - 1].e; endStmt();
    return { kind: 'CREATE', name, ifNot, cols, tcons, spans: { all: [s0, e0] } };
  }
  function parseInsert() {
    const s0 = T[p].s; next(); expectW('into');
    const table = ident(); const cols = isP('(') ? identList() : null;
    const vs = T[p].s; expectW('values');
    const rows = [];
    do { expectP('('); const r = []; do r.push(parseExpr()); while (isP(',') && next()); expectP(')'); rows.push(r); } while (isP(',') && next());
    const ve = T[p - 1].e; endStmt();
    return { kind: 'INSERT', table, cols, rows, spans: { target: [s0, vs], values: [vs, ve], all: [s0, ve] } };
  }
  function parseDelete() {
    const s0 = T[p].s; next(); expectKw('FROM');
    const table = ident(); let alias = table;
    if (isKw('AS')) { next(); alias = ident(); } else if (T[p].t === 'id') alias = ident();
    const spans = { target: [s0, T[p - 1].e] }; let where = null;
    if (isKw('WHERE')) { const s = T[p].s; next(); where = parseExpr(); spans.where = [s, T[p - 1].e]; }
    spans.all = [s0, T[p - 1].e]; endStmt();
    return { kind: 'DELETE', table, alias, where, spans };
  }
  function parseDrop() {
    const s0 = T[p].s; next(); expectW('table');
    let ifEx = false; if (isW('if')) { next(); expectW('exists'); ifEx = true; }
    const name = ident();
    if (isW('cascade')) fail('CASCADE is not supported in this demo', 'Drop the tables that reference it first.');
    const e0 = T[p - 1].e; endStmt();
    return { kind: 'DROP', name, ifEx, spans: { all: [s0, e0] } };
  }

  function selectItem() {
    if (isOp('*')) { next(); return { expr: { k: 'star' } }; }
    if (T[p].t === 'id' && T[p + 1].t === 'p' && T[p + 1].v === '.' && T[p + 2].t === 'op' && T[p + 2].v === '*') {
      const t = next().v; next(); next(); return { expr: { k: 'star', table: t } };
    }
    const expr = parseExpr(); let alias = null;
    if (isKw('AS')) { next(); alias = ident(); } else if (T[p].t === 'id') alias = ident();
    return { expr, alias };
  }
  function tableRef() {
    const table = ident(); let alias = table;
    if (isKw('AS')) { next(); alias = ident(); } else if (T[p].t === 'id') alias = ident();
    return { table, alias };
  }
  function parseExpr() { return parseOr(); }
  function parseOr() { let l = parseAnd(); while (isKw('OR')) { next(); l = { k: 'bin', op: 'OR', l, r: parseAnd() }; } return l; }
  function parseAnd() { let l = parseNot(); while (isKw('AND')) { next(); l = { k: 'bin', op: 'AND', l, r: parseNot() }; } return l; }
  function parseNot() { if (isKw('NOT')) { next(); return { k: 'un', op: 'NOT', x: parseNot() }; } return parseCmp(); }
  function parseCmp() {
    let l = parseConcat();
    for (;;) {
      if (T[p].t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(T[p].v)) { const op = next().v; l = { k: 'bin', op, l, r: parseConcat() }; continue; }
      const save = p; let not = false;
      if (isKw('NOT')) { next(); not = true; }
      if (isKw('LIKE') || isKw('ILIKE')) { const ci = next().v === 'ILIKE'; l = { k: 'like', x: l, pat: parseConcat(), not, ci }; continue; }
      if (isKw('IN')) { next(); expectP('('); const list = []; do list.push(parseExpr()); while (isP(',') && next()); expectP(')'); l = { k: 'in', x: l, list, not }; continue; }
      if (isKw('BETWEEN')) { next(); const lo = parseConcat(); expectKw('AND'); const hi = parseConcat(); l = { k: 'between', x: l, lo, hi, not }; continue; }
      if (not) { p = save; break; }
      if (isKw('IS')) {
        next(); let n = false; if (isKw('NOT')) { next(); n = true; }
        if (isKw('NULL')) { next(); l = { k: 'isnull', x: l, not: n }; continue; }
        if (isKw('TRUE') || isKw('FALSE')) { l = { k: 'istf', x: l, v: next().v === 'TRUE', not: n }; continue; }
        fail();
      }
      break;
    }
    return l;
  }
  function parseConcat() { let l = parseAdd(); while (isOp('||')) { next(); l = { k: 'bin', op: '||', l, r: parseAdd() }; } return l; }
  function parseAdd() { let l = parseMul(); while (isOp('+') || isOp('-')) { const op = next().v; l = { k: 'bin', op, l, r: parseMul() }; } return l; }
  function parseMul() { let l = parseUnary(); while (isOp('*') || isOp('/') || isOp('%')) { const op = next().v; l = { k: 'bin', op, l, r: parseUnary() }; } return l; }
  function parseUnary() { if (isOp('-')) { next(); return { k: 'un', op: '-', x: parseUnary() }; } if (isOp('+')) { next(); return parseUnary(); } return parseCast(); }
  function parseCast() {
    let x = parsePrimary();
    while (isOp('::')) {
      next(); let ty = ident();
      if (isP('(')) { next(); while (!isP(')') && T[p].t !== 'eof') next(); expectP(')'); }
      x = { k: 'cast', x, type: normType(ty) };
    }
    return x;
  }
  function parsePrimary() {
    const t = T[p];
    if (t.t === 'num') { next(); return { k: 'lit', v: t.v, raw: t.raw }; }
    if (t.t === 'str') { next(); return { k: 'lit', v: t.v }; }
    if (isKw('TRUE') || isKw('FALSE')) { next(); return { k: 'lit', v: t.v === 'TRUE' }; }
    if (isKw('NULL')) { next(); return { k: 'lit', v: null }; }
    if (isP('(')) { next(); const e = parseExpr(); expectP(')'); return e; }
    if (t.t === 'id') {
      if (t.v === 'date' && T[p + 1].t === 'str') { next(); return { k: 'lit', v: next().v, date: true }; }
      next();
      if (isP('(')) {
        next(); const fn = { k: 'fn', name: t.v.toUpperCase(), args: [], distinct: false, star: false };
        if (isOp('*')) { next(); fn.star = true; }
        else if (!isP(')')) { if (isKw('DISTINCT')) { next(); fn.distinct = true; } do fn.args.push(parseExpr()); while (isP(',') && next()); }
        expectP(')'); return fn;
      }
      if (isP('.')) { next(); return { k: 'col', table: t.v, name: ident() }; }
      return { k: 'col', name: t.v };
    }
    fail();
  }
}

/* ===================== Generator (AST -> SQL) ===================== */
const qid = n => /^[a-z_][a-z0-9_]*$/.test(n) && !KW.has(n.toUpperCase()) ? n : '"' + n + '"';
function prec(e) {
  if (e.k === 'bin') return ({ OR: 1, AND: 2, '||': 5, '+': 6, '-': 6, '*': 7, '/': 7, '%': 7 })[e.op] || 4;
  if (e.k === 'un') return e.op === 'NOT' ? 3 : 8;
  if (['like', 'in', 'between', 'isnull', 'istf'].includes(e.k)) return 4;
  if (e.k === 'cast') return 9;
  return 10;
}
function genE(e, minP = 0) {
  const s = rawE(e);
  return prec(e) < minP ? '(' + s + ')' : s;
}
function rawE(e) {
  switch (e.k) {
    case 'lit':
      if (e.v === null) return 'NULL';
      if (typeof e.v === 'boolean') return e.v ? 'TRUE' : 'FALSE';
      if (typeof e.v === 'number') return e.raw || String(e.v);
      return (e.date ? 'DATE ' : '') + "'" + String(e.v).replace(/'/g, "''") + "'";
    case 'col': return (e.table ? qid(e.table) + '.' : '') + qid(e.name);
    case 'star': return (e.table ? qid(e.table) + '.' : '') + '*';
    case 'bin': {
      const P = prec(e);
      if (P === 4) return genE(e.l, 5) + ' ' + e.op + ' ' + genE(e.r, 5);
      if (e.op === 'AND' || e.op === 'OR') return genE(e.l, P) + ' ' + e.op + ' ' + genE(e.r, P);
      return genE(e.l, P) + ' ' + e.op + ' ' + genE(e.r, P + 1);
    }
    case 'un': return e.op === 'NOT' ? 'NOT ' + genE(e.x, 3) : '-' + genE(e.x, 8);
    case 'fn': return e.name + '(' + (e.star ? '*' : (e.distinct ? 'DISTINCT ' : '') + e.args.map(a => genE(a)).join(', ')) + ')';
    case 'like': return genE(e.x, 5) + (e.not ? ' NOT' : '') + (e.ci ? ' ILIKE ' : ' LIKE ') + genE(e.pat, 5);
    case 'in': return genE(e.x, 5) + (e.not ? ' NOT' : '') + ' IN (' + e.list.map(a => genE(a)).join(', ') + ')';
    case 'between': return genE(e.x, 5) + (e.not ? ' NOT' : '') + ' BETWEEN ' + genE(e.lo, 5) + ' AND ' + genE(e.hi, 5);
    case 'isnull': return genE(e.x, 5) + ' IS ' + (e.not ? 'NOT ' : '') + 'NULL';
    case 'istf': return genE(e.x, 5) + ' IS ' + (e.not ? 'NOT ' : '') + (e.v ? 'TRUE' : 'FALSE');
    case 'cast': return genE(e.x, 10) + '::' + e.type;
  }
  return '?';
}
function flatAnd(e) { return !e ? [] : (e.k === 'bin' && e.op === 'AND') ? [...flatAnd(e.l), ...flatAnd(e.r)] : [e]; }
function joinAnd(list) { return list.reduce((a, c) => a ? { k: 'bin', op: 'AND', l: a, r: c } : c, null); }
function genQuery(q) {
  const L = [];
  const tref = r => qid(r.table) + (r.alias && r.alias !== r.table ? ' ' + qid(r.alias) : '');
  const items = q.select.map(it => genE(it.expr) + (it.alias ? ' AS ' + qid(it.alias) : ''));
  const head = 'SELECT ' + (q.distinct ? 'DISTINCT ' : '');
  if (items.join(', ').length > 60 && items.length > 1) { L.push(head.trimEnd()); items.forEach((s, i) => L.push('  ' + s + (i < items.length - 1 ? ',' : ''))); }
  else L.push(head + items.join(', '));
  L.push('FROM ' + tref(q.from));
  for (const j of q.joins) {
    const kw = j.type === 'INNER' ? 'JOIN' : j.type + ' JOIN';
    L.push(kw + ' ' + tref(j) + (j.using ? ' USING (' + j.using.join(', ') + ')' : j.on ? ' ON ' + genE(j.on) : ''));
  }
  if (q.where) {
    const c = flatAnd(q.where);
    L.push('WHERE ' + genE(c[0], 3)); c.slice(1).forEach(x => L.push('  AND ' + genE(x, 3)));
  }
  if (q.groupBy.length) L.push('GROUP BY ' + q.groupBy.map(e => genE(e)).join(', '));
  if (q.having) L.push('HAVING ' + genE(q.having));
  if (q.orderBy.length) L.push('ORDER BY ' + q.orderBy.map(o => genE(o.expr) + (o.dir ? ' ' + o.dir : '') + (o.nulls ? ' NULLS ' + o.nulls : '')).join(', '));
  if (q.limit != null) L.push('LIMIT ' + q.limit);
  if (q.offset != null) L.push('OFFSET ' + q.offset);
  return L.join('\n') + ';';
}

/* ===================== Executor ===================== */
const AGG = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']);
const SCALAR = new Set(['ROUND', 'LOWER', 'UPPER', 'LENGTH', 'COALESCE', 'CONCAT', 'ABS', 'TRIM', 'NULLIF', 'GREATEST', 'LEAST']);
function kids(e) {
  switch (e.k) {
    case 'bin': return [e.l, e.r];
    case 'un': case 'isnull': case 'istf': case 'cast': return [e.x];
    case 'fn': return e.args;
    case 'like': return [e.x, e.pat];
    case 'in': return [e.x, ...e.list];
    case 'between': return [e.x, e.lo, e.hi];
  }
  return [];
}
function walk(e, f) { if (!e) return; if (f(e) === false) return; kids(e).forEach(k => walk(k, f)); }
function hasAgg(e) { let r = false; walk(e, n => { if (n.k === 'fn' && AGG.has(n.name)) r = true; }); return r; }
function colsOutsideAgg(e, out = []) { walk(e, n => { if (n.k === 'fn' && AGG.has(n.name)) return false; if (n.k === 'col') out.push(n); }); return out; }
const isTrue = v => v === true;
function cmp(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return (a ? 1 : 0) - (b ? 1 : 0);
  a = String(a); b = String(b); return a < b ? -1 : a > b ? 1 : 0;
}
function likeRe(pat, ci) {
  const re = String(pat).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
  return new RegExp('^' + re + '$', ci ? 'is' : 's');
}

function resolveCol(n, srcs) {
  if (n.table) {
    const s = srcs.find(s => s.alias === n.table);
    if (!s) {
      const byT = srcs.find(s => s.table === n.table);
      if (byT) { const err = new SqlError(`invalid reference to FROM-clause entry for table "${n.table}"`, `Once a table has an alias, PostgreSQL only accepts the alias. "${n.table}" is called "${byT.alias}" in this query, so write ${byT.alias}.${n.name} (and the same for every other ${n.table}.… reference).`); err.fix = { from: n.table, to: byT.alias }; throw err; }
      throw new SqlError(`missing FROM-clause entry for table "${n.table}"`, `Add ${n.table} with FROM or JOIN first.`);
    }
    const c = s.def.cols.find(c => c.name === n.name);
    if (!c) throw new SqlError(`column ${n.table}.${n.name} does not exist`, `${s.table} has: ${s.def.cols.map(c => c.name).join(', ')}`);
    return { alias: s.alias, col: c, key: s.alias + '.' + c.name, src: s };
  }
  const m = srcs.filter(s => s.def.cols.some(c => c.name === n.name));
  if (!m.length) throw new SqlError(`column "${n.name}" does not exist`, srcs.length === 1 ? `${srcs[0].table} has: ${srcs[0].def.cols.map(c => c.name).join(', ')}` : null);
  if (m.length > 1) throw new SqlError(`column reference "${n.name}" is ambiguous`, `More than one table has "${n.name}". Prefix it, e.g. ${m[0].alias}.${n.name}`);
  const c = m[0].def.cols.find(c => c.name === n.name);
  return { alias: m[0].alias, col: c, key: m[0].alias + '.' + c.name, src: m[0] };
}

function typeOf(e, srcs) {
  switch (e.k) {
    case 'lit':
      if (e.v === null) return 'UNKNOWN';
      if (typeof e.v === 'boolean') return 'BOOLEAN';
      if (typeof e.v === 'number') return (e.raw || '').includes('.') ? 'NUMERIC' : 'INT';
      return e.date ? 'DATE' : 'TEXT';
    case 'col': return resolveCol(e, srcs).col.type;
    case 'bin': {
      if (['AND', 'OR', '=', '<>', '<', '>', '<=', '>='].includes(e.op)) return 'BOOLEAN';
      if (e.op === '||') return 'TEXT';
      const a = typeOf(e.l, srcs), b = typeOf(e.r, srcs);
      if (typeFamily(a) === 'int' && typeFamily(b) === 'int') return (a === 'BIGINT' || b === 'BIGINT') ? 'BIGINT' : 'INT';
      return 'NUMERIC';
    }
    case 'un': return e.op === 'NOT' ? 'BOOLEAN' : typeOf(e.x, srcs);
    case 'like': case 'in': case 'between': case 'isnull': case 'istf': return 'BOOLEAN';
    case 'cast': return e.type;
    case 'fn': {
      const a = e.args[0] ? typeOf(e.args[0], srcs) : null;
      switch (e.name) {
        case 'COUNT': return 'BIGINT';
        case 'SUM': return a === 'BIGINT' ? 'NUMERIC' : typeFamily(a) === 'int' ? 'BIGINT' : 'NUMERIC';
        case 'AVG': case 'ROUND': return 'NUMERIC';
        case 'MIN': case 'MAX': case 'ABS': case 'COALESCE': case 'NULLIF': case 'GREATEST': case 'LEAST': return a;
        case 'LENGTH': return 'INT';
        default: return 'TEXT';
      }
    }
  }
  return 'TEXT';
}
function defaultName(e) {
  if (e.k === 'col') return e.name;
  if (e.k === 'fn') return e.name.toLowerCase();
  if (e.k === 'cast') return e.x.k === 'col' ? e.x.name : e.type.toLowerCase();
  return '?column?';
}

function evalE(e, ctx) {
  switch (e.k) {
    case 'lit': return e.v;
    case 'col': {
      const r = resolveCol(e, ctx.srcs);
      const env = ctx.group ? ctx.group[0] : ctx.env;
      if (!env) return null;
      const v = env.vals[r.key]; return v === undefined ? null : v;
    }
    case 'star': throw new SqlError('"*" can only be used in the SELECT list or COUNT(*)');
    case 'un': {
      const v = evalE(e.x, ctx);
      if (v === null) return null;
      return e.op === 'NOT' ? !isTrue(v) : -v;
    }
    case 'bin': {
      if (e.op === 'AND') { const a = evalE(e.l, ctx), b = evalE(e.r, ctx); if (a === false || b === false) return false; if (a === null || b === null) return null; return true; }
      if (e.op === 'OR') { const a = evalE(e.l, ctx), b = evalE(e.r, ctx); if (a === true || b === true) return true; if (a === null || b === null) return null; return false; }
      const a = evalE(e.l, ctx), b = evalE(e.r, ctx);
      if (a === null || b === null) return null;
      switch (e.op) {
        case '=': return cmp(a, b) === 0;
        case '<>': return cmp(a, b) !== 0;
        case '<': return cmp(a, b) < 0;
        case '>': return cmp(a, b) > 0;
        case '<=': return cmp(a, b) <= 0;
        case '>=': return cmp(a, b) >= 0;
        case '||': return String(a) + String(b);
      }
      if (typeof a !== 'number' || typeof b !== 'number') throw new SqlError(`operator does not exist: ${typeof a === 'number' ? 'numeric' : 'text'} ${e.op} ${typeof b === 'number' ? 'numeric' : 'text'}`, 'Arithmetic needs numbers on both sides.');
      const ints = typeFamily(typeOf(e.l, ctx.srcs)) === 'int' && typeFamily(typeOf(e.r, ctx.srcs)) === 'int';
      switch (e.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return Math.round(a * b * 1e6) / 1e6;
        case '/': if (b === 0) throw new SqlError('division by zero'); return ints ? Math.trunc(a / b) : a / b;
        case '%': if (b === 0) throw new SqlError('division by zero'); return a % b;
      }
      return null;
    }
    case 'like': { const v = evalE(e.x, ctx), pt = evalE(e.pat, ctx); if (v === null || pt === null) return null; const r = likeRe(pt, e.ci).test(String(v)); return e.not ? !r : r; }
    case 'in': {
      const v = evalE(e.x, ctx); if (v === null) return null;
      let sawNull = false, hit = false;
      for (const it of e.list) { const w = evalE(it, ctx); if (w === null) sawNull = true; else if (cmp(v, w) === 0) { hit = true; break; } }
      const r = hit ? true : sawNull ? null : false;
      return r === null ? null : e.not ? !r : r;
    }
    case 'between': {
      const v = evalE(e.x, ctx), lo = evalE(e.lo, ctx), hi = evalE(e.hi, ctx);
      if (v === null || lo === null || hi === null) return null;
      const r = cmp(v, lo) >= 0 && cmp(v, hi) <= 0; return e.not ? !r : r;
    }
    case 'isnull': { const v = evalE(e.x, ctx); return e.not ? v !== null : v === null; }
    case 'istf': { const v = evalE(e.x, ctx); const r = v === e.v; return e.not ? !r : r; }
    case 'cast': {
      const v = evalE(e.x, ctx); if (v === null) return null;
      const f = typeFamily(e.type);
      if (f === 'int' || f === 'num') { const n = typeof v === 'boolean' ? +v : Number(v); if (isNaN(n)) throw new SqlError(`invalid input syntax for type ${e.type.toLowerCase()}: "${v}"`); return f === 'int' ? Math.round(n) : n; }
      if (f === 'bool') return v === true || v === 't' || v === 'true' || v === 1;
      return typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v);
    }
    case 'fn': {
      if (AGG.has(e.name)) {
        if (!ctx.group) throw new SqlError(`aggregate functions are not allowed in ${ctx.clause || 'this context'}`);
        if (e.star) return ctx.group.length;
        const sub = { srcs: ctx.srcs, env: null, group: null, clause: 'aggregate arguments' };
        let vals = ctx.group.map(r => { sub.env = r; return evalE(e.args[0], sub); }).filter(v => v !== null);
        if (e.distinct) { const seen = new Set(); vals = vals.filter(v => { const k = JSON.stringify(v); if (seen.has(k)) return false; seen.add(k); return true; }); }
        switch (e.name) {
          case 'COUNT': return vals.length;
          case 'SUM': return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) * 1e6) / 1e6 : null;
          case 'AVG': return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          case 'MIN': return vals.length ? vals.reduce((a, b) => cmp(a, b) <= 0 ? a : b) : null;
          case 'MAX': return vals.length ? vals.reduce((a, b) => cmp(a, b) >= 0 ? a : b) : null;
        }
      }
      const a = e.args.map(x => evalE(x, ctx));
      switch (e.name) {
        case 'ROUND': { if (a[0] === null) return null; const d = a[1] || 0; const f = Math.pow(10, d); return Math.round(a[0] * f) / f; }
        case 'LOWER': return a[0] === null ? null : String(a[0]).toLowerCase();
        case 'UPPER': return a[0] === null ? null : String(a[0]).toUpperCase();
        case 'TRIM': return a[0] === null ? null : String(a[0]).trim();
        case 'LENGTH': return a[0] === null ? null : String(a[0]).length;
        case 'ABS': return a[0] === null ? null : Math.abs(a[0]);
        case 'COALESCE': return a.find(v => v !== null) ?? null;
        case 'NULLIF': return cmp(a[0], a[1]) === 0 ? null : a[0];
        case 'CONCAT': return a.map(v => v === null ? '' : String(v)).join('');
        case 'GREATEST': { const v = a.filter(x => x !== null); return v.length ? v.reduce((x, y) => cmp(x, y) >= 0 ? x : y) : null; }
        case 'LEAST': { const v = a.filter(x => x !== null); return v.length ? v.reduce((x, y) => cmp(x, y) <= 0 ? x : y) : null; }
      }
      throw new SqlError(`function ${e.name.toLowerCase()}() does not exist`, 'This demo supports COUNT, SUM, AVG, MIN, MAX, ROUND, LOWER, UPPER, LENGTH, COALESCE, CONCAT.');
    }
  }
  throw new SqlError('unsupported expression');
}

function checkExpr(e, srcs, clause, allowAgg) {
  walk(e, n => {
    if (n.k === 'col') resolveCol(n, srcs);
    if (n.k === 'star') throw new SqlError('"*" can only be used in the SELECT list or COUNT(*)');
    if (n.k === 'fn') {
      if (!AGG.has(n.name) && !SCALAR.has(n.name)) throw new SqlError(`function ${n.name.toLowerCase()}() does not exist`, 'Supported: COUNT, SUM, AVG, MIN, MAX, ROUND, LOWER, UPPER, LENGTH, COALESCE, CONCAT.');
      if (AGG.has(n.name)) {
        if (!allowAgg) throw new SqlError(`aggregate functions are not allowed in ${clause}`, clause === 'WHERE' ? 'Filter groups with HAVING instead.' : null);
        n.args.forEach(a => { if (hasAgg(a)) throw new SqlError('aggregate function calls cannot be nested'); });
        if (!n.star && n.args.length !== 1) throw new SqlError(`${n.name.toLowerCase()}() takes exactly one argument`);
        if ((n.name === 'SUM' || n.name === 'AVG') && !n.star) {
          const t = typeOf(n.args[0], srcs);
          if (!['int', 'num'].includes(typeFamily(t)) || t === 'UNKNOWN') throw new SqlError(`function ${n.name.toLowerCase()}(${t.toLowerCase()}) does not exist`, `${n.name} only works on numbers.`);
        }
      }
    }
  });
}

function execute(q0) {
  const q = JSON.parse(JSON.stringify(q0));
  const sources = [];
  const addSrc = ref => {
    const def = DB.tables[ref.table];
    if (!def) throw new SqlError(`relation "${ref.table}" does not exist`, 'Tables: ' + Object.keys(DB.tables).join(', '));
    const alias = ref.alias || ref.table;
    if (sources.some(s => s.alias === alias)) throw new SqlError(`table name "${alias}" specified more than once`, 'Give the second copy an alias, e.g. JOIN customers c2 ON …');
    const s = { alias, table: ref.table, def }; sources.push(s); return s;
  };
  const envOf = (s, r) => { const v = {}; s.def.cols.forEach((c, i) => v[s.alias + '.' + c.name] = r[i]); return v; };
  const nullsOf = srcs => { const v = {}; srcs.forEach(s => s.def.cols.forEach(c => v[s.alias + '.' + c.name] = null)); return v; };
  const steps = [];

  const f = addSrc(q.from);
  let rows = f.def.rows.map((r, i) => ({ vals: envOf(f, r), src: { [f.alias]: i } }));
  steps.push({ kind: 'FROM', title: 'FROM', sub: f.table, span: q.spans.from, rows, involved: [f.alias] });

  q.joins.forEach((j, ji) => {
    const left = sources.slice();
    const s = addSrc(j);
    if (j.using) {
      j.on = joinAnd(j.using.map(c => {
        const l = left.find(x => x.def.cols.some(cc => cc.name === c));
        if (!l || !s.def.cols.some(cc => cc.name === c)) throw new SqlError(`column "${c}" specified in USING clause does not exist in both tables`);
        return { k: 'bin', op: '=', l: { k: 'col', table: l.alias, name: c }, r: { k: 'col', table: s.alias, name: c } };
      }));
    }
    if (j.on) checkExpr(j.on, sources, 'JOIN conditions', false);
    const right = s.def.rows.map((r, i) => ({ vals: envOf(s, r), i }));
    const out = [], hitR = new Set(), ctx = { srcs: sources, env: null, clause: 'JOIN conditions' };
    for (const L of rows) {
      let hit = false;
      for (const R of right) {
        const c = { vals: Object.assign({}, L.vals, R.vals), src: Object.assign({}, L.src, { [s.alias]: R.i }) };
        ctx.env = c;
        if (j.type === 'CROSS' || isTrue(evalE(j.on, ctx))) { out.push(c); hit = true; hitR.add(R.i); }
      }
      if (!hit && (j.type === 'LEFT' || j.type === 'FULL')) out.push({ vals: Object.assign({}, L.vals, nullsOf([s])), src: Object.assign({}, L.src, { [s.alias]: null }) });
    }
    if (j.type === 'RIGHT' || j.type === 'FULL') {
      for (const R of right) if (!hitR.has(R.i)) {
        const src = {}; left.forEach(x => src[x.alias] = null); src[s.alias] = R.i;
        out.push({ vals: Object.assign(nullsOf(left), R.vals), src });
      }
    }
    const prevN = rows.length;
    rows = out;
    steps.push({ kind: 'JOIN', title: (j.type === 'INNER' ? '' : j.type + ' ') + 'JOIN', sub: j.table, span: j.span, rows, involved: sources.map(x => x.alias), joinIndex: ji, prevN });
  });
  const all = sources.map(s => s.alias);

  // normalise GROUP BY positions / output aliases
  q.groupBy = q.groupBy.map(g => {
    if (g.k === 'lit' && typeof g.v === 'number') { const it = q.select[g.v - 1]; if (!it || it.expr.k === 'star') throw new SqlError(`GROUP BY position ${g.v} is not in select list`); return it.expr; }
    if (g.k === 'col' && !g.table) { try { resolveCol(g, sources); } catch (err) { const it = q.select.find(s => s.alias === g.name); if (it) return it.expr; throw err; } }
    return g;
  });

  // expand select list
  const cols = [];
  for (const it of q.select) {
    if (it.expr.k === 'star') {
      const list = it.expr.table ? sources.filter(s => s.alias === it.expr.table) : sources;
      if (it.expr.table && !list.length) throw new SqlError(`missing FROM-clause entry for table "${it.expr.table}"`);
      list.forEach(s => s.def.cols.forEach(c => cols.push({ label: c.name, expr: { k: 'col', table: s.alias, name: c.name }, type: c.type, alias: s.alias, key: s.alias + '.' + c.name, fromStar: true })));
    } else {
      checkExpr(it.expr, sources, 'SELECT', true);
      const r = it.expr.k === 'col' ? resolveCol(it.expr, sources) : null;
      cols.push({ label: it.alias || defaultName(it.expr), expr: it.expr, type: typeOf(it.expr, sources), alias: r ? r.alias : null, key: r ? r.key : null, item: it });
    }
  }
  if (q.where) checkExpr(q.where, sources, 'WHERE', false);
  q.groupBy.forEach(g => checkExpr(g, sources, 'GROUP BY', false));
  if (q.having) checkExpr(q.having, sources, 'HAVING', true);

  const grouped = q.groupBy.length > 0 || cols.some(c => hasAgg(c.expr)) || (q.having && hasAgg(q.having)) || q.orderBy.some(o => hasAgg(o.expr));

  if (grouped) {
    const gStr = new Set(q.groupBy.map(g => genE(g)));
    const gKeys = new Set(), pkAliases = new Set();
    q.groupBy.forEach(g => { if (g.k === 'col') { const r = resolveCol(g, sources); gKeys.add(r.key); if (r.col.pk) pkAliases.add(r.alias); } });
    const check = (e, where) => {
      if (gStr.has(genE(e))) return;
      for (const c of colsOutsideAgg(e)) {
        const r = resolveCol(c, sources);
        if (!gKeys.has(r.key) && !pkAliases.has(r.alias))
          throw new SqlError(`column "${r.key}" must appear in the GROUP BY clause or be used in an aggregate function`, `Add ${r.key} to GROUP BY, or wrap it, e.g. COUNT(${r.key}).`);
      }
    };
    cols.forEach(c => check(c.expr, 'SELECT'));
    if (q.having) check(q.having, 'HAVING');
  }

  // WHERE
  if (q.where) {
    const ctx = { srcs: sources, env: null, clause: 'WHERE' };
    const pass = rows.map(r => { ctx.env = r; return isTrue(evalE(q.where, ctx)); });
    steps.push({ kind: 'WHERE', title: 'WHERE', sub: '', span: q.spans.where, rows, pass, involved: all });
    rows = rows.filter((r, i) => pass[i]);
  }

  // GROUP BY / aggregate
  let units;
  if (grouped) {
    const map = new Map(), ctx = { srcs: sources, env: null, clause: 'GROUP BY' };
    for (const r of rows) {
      ctx.env = r;
      const kv = q.groupBy.map(g => evalE(g, ctx)), k = JSON.stringify(kv);
      if (!map.has(k)) map.set(k, { keyVals: kv, rows: [] });
      map.get(k).rows.push(r);
    }
    let groups = [...map.values()];
    if (!q.groupBy.length) groups = [{ keyVals: [], rows }];
    steps.push({ kind: 'GROUP', title: q.groupBy.length ? 'GROUP BY' : 'AGGREGATE', sub: q.groupBy.length ? '' : 'all rows', span: q.spans.groupBy || q.spans.select, groups, rows, involved: all, groupKeys: q.groupBy.filter(g => g.k === 'col').map(g => resolveCol(g, sources).key) });
    units = groups.map(g => ({ env: g.rows[0] || null, group: g.rows, srcs: g.rows.map(r => r.src) }));
  } else units = rows.map(r => ({ env: r, group: null, srcs: [r.src] }));

  const project = u => ({ cells: cols.map(c => evalE(c.expr, { srcs: sources, env: u.env, group: u.group, clause: 'SELECT' })), srcs: u.srcs, unit: u });
  let out;
  if (q.having) {
    const ctx = { srcs: sources, env: null, group: null, clause: 'HAVING' };
    const allOut = units.map(project);
    const pass = units.map(u => { ctx.env = u.env; ctx.group = u.group; return isTrue(evalE(q.having, ctx)); });
    steps.push({ kind: 'HAVING', title: 'HAVING', sub: '', span: q.spans.having, out: allOut, pass, cols, involved: all });
    units = units.filter((u, i) => pass[i]);
    out = allOut.filter((o, i) => pass[i]);
  } else out = units.map(project);
  steps.push({ kind: 'SELECT', title: 'SELECT', sub: '', span: q.spans.select, out, cols, involved: all });

  if (q.distinct) {
    const seen = new Map(), dup = [];
    const kept = [];
    out.forEach(o => { const k = JSON.stringify(o.cells); if (seen.has(k)) { seen.get(k).srcs = seen.get(k).srcs.concat(o.srcs); dup.push(true); } else { const c = Object.assign({}, o); seen.set(k, c); kept.push(c); dup.push(false); } });
    steps.push({ kind: 'DISTINCT', title: 'DISTINCT', sub: '', span: q.spans.select, out, dup, cols, involved: all });
    out = kept;
  }

  if (q.orderBy.length) {
    const keyFns = q.orderBy.map(o => {
      const e = o.expr;
      if (e.k === 'lit' && typeof e.v === 'number') { const i = e.v - 1; if (i < 0 || i >= cols.length) throw new SqlError(`ORDER BY position ${e.v} is not in select list`); return r => r.cells[i]; }
      if (e.k === 'col' && !e.table) { const i = cols.findIndex(c => c.item && c.item.alias === e.name); if (i >= 0) return r => r.cells[i]; }
      const si = cols.findIndex(c => !c.fromStar && genE(c.expr) === genE(e));
      if (si >= 0) return r => r.cells[si];
      checkExpr(e, sources, 'ORDER BY', grouped);
      if (grouped) {
        const gStr = new Set(q.groupBy.map(g => genE(g)));
        const gKeys = new Set(q.groupBy.filter(g => g.k === 'col').map(g => resolveCol(g, sources).key));
        if (!gStr.has(genE(e))) colsOutsideAgg(e).forEach(c => { const r = resolveCol(c, sources); if (!gKeys.has(r.key)) throw new SqlError(`column "${r.key}" must appear in the GROUP BY clause or be used in an aggregate function`); });
      }
      return r => evalE(e, { srcs: sources, env: r.unit.env, group: r.unit.group, clause: 'ORDER BY' });
    });
    const keyed = out.map((r, i) => ({ r, i, k: keyFns.map(f => f(r)) }));
    keyed.sort((a, b) => {
      for (let n = 0; n < keyFns.length; n++) {
        const o = q.orderBy[n], desc = o.dir === 'DESC', x = a.k[n], y = b.k[n];
        const nullsFirst = o.nulls ? o.nulls === 'FIRST' : desc;
        if (x === null && y === null) continue;
        if (x === null) return nullsFirst ? -1 : 1;
        if (y === null) return nullsFirst ? 1 : -1;
        const c = cmp(x, y); if (c) return desc ? -c : c;
      }
      return a.i - b.i;
    });
    out = keyed.map(k => k.r);
    steps.push({ kind: 'ORDER', title: 'ORDER BY', sub: '', span: q.spans.orderBy, out, cols, involved: all });
  }
  if (q.limit != null || q.offset != null) {
    const from = q.offset || 0, to = q.limit != null ? from + q.limit : out.length;
    steps.push({ kind: 'LIMIT', title: q.limit != null ? 'LIMIT' : 'OFFSET', sub: '', span: q.spans.limit, out, keep: [from, to], cols, involved: all });
    out = out.slice(from, to);
  }
  const links = q.joins.map((j, ji) => {
    const st = steps.find(s => s.kind === 'JOIN' && s.joinIndex === ji), right = sources[ji + 1];
    const pairs = [], other = [];
    flatAnd(j.on).forEach(c => {
      if (c.k === 'bin' && c.op === '=' && c.l.k === 'col' && c.r.k === 'col') {
        const a = resolveCol(c.l, sources), b = resolveCol(c.r, sources);
        if (a.alias !== b.alias) {
          const ia = sources.indexOf(a.src), ib = sources.indexOf(b.src);
          const [x, y] = ia < ib ? [a, b] : [b, a];
          pairs.push({ a: x.alias, ac: x.col.name, b: y.alias, bc: y.col.name }); return;
        }
      }
      other.push(genE(c));
    });
    return { kind: j.type === 'CROSS' ? 'cross' : 'join', ji, type: j.type, left: sources[ji].alias, right: right.alias, table: right.table, pairs, other,
      total: st.rows.length, nulls: st.rows.filter(r => Object.values(r.src).includes(null)).length, leftN: st.prevN, rightN: right.def.rows.length };
  });
  return { kind: 'SELECT', sources, steps, cols, rows: out, grouped, q, links };
}

/* ===================== Data definition & modification ===================== */
const EMPTYQ = () => ({ select: [], joins: [], where: null, groupBy: [], having: null, orderBy: [] });
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
function coerce(v, c, tname) {
  const f = typeFamily(c.type), tn = c.type.toLowerCase();
  if (v === null) {
    if (c.pk || c.notnull) throw new SqlError(`null value in column "${c.name}" of relation "${tname}" violates not-null constraint`, c.pk ? 'Primary key columns always need a value.' : 'This column is NOT NULL.');
    return null;
  }
  if (f === 'int' || f === 'num') {
    if (typeof v === 'boolean') throw new SqlError(`column "${c.name}" is of type ${tn} but expression is of type boolean`);
    let n = v;
    if (typeof v === 'string') { if (!/^\s*-?\d+(\.\d+)?\s*$/.test(v)) throw new SqlError(`invalid input syntax for type ${f === 'int' ? 'integer' : 'numeric'}: "${v}"`, 'Numbers are written without quotes, e.g. 42 or 19.99'); n = parseFloat(v); }
    if (f === 'int') return Math.round(n);
    const m = /\((\d+),(\d+)\)/.exec(c.type);
    if (m) { const s = +m[2], lim = Math.pow(10, +m[1] - s); n = Math.round(n * Math.pow(10, s)) / Math.pow(10, s); if (Math.abs(n) >= lim) throw new SqlError('numeric field overflow', `A field with precision ${m[1]}, scale ${m[2]} must be smaller than ${lim}.`); }
    return n;
  }
  if (f === 'date') {
    if (typeof v !== 'string') throw new SqlError(`column "${c.name}" is of type ${tn} but expression is of type ${typeof v === 'number' ? 'integer' : 'boolean'}`, "Dates are quoted text, e.g. '2024-09-30'");
    if (!/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(v) || isNaN(Date.parse(v.slice(0, 10)))) throw new SqlError(`invalid input syntax for type ${tn}: "${v}"`, "Use the format 'YYYY-MM-DD'.");
    return v;
  }
  if (f === 'bool') {
    if (typeof v === 'boolean') return v;
    const s = String(v).toLowerCase();
    if (['t', 'true', 'yes', 'y', 'on', '1'].includes(s)) return true;
    if (['f', 'false', 'no', 'n', 'off', '0'].includes(s)) return false;
    throw new SqlError(`invalid input syntax for type boolean: "${v}"`, 'Use TRUE or FALSE.');
  }
  const s = typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v);
  const m = /\((\d+)\)/.exec(c.type);
  if (m && s.length > +m[1]) throw new SqlError(`value too long for type character varying(${m[1]})`, `"${s}" has ${s.length} characters.`);
  return s;
}
function refsTo(table) {
  const out = [];
  Object.entries(DB.tables).forEach(([t, d]) => d.cols.forEach((c, ci) => { if (c.fk && c.fk.table === table) out.push({ table: t, col: c.name, ci, refcol: c.fk.col }); }));
  return out;
}
function planCreate(st) {
  const name = st.name;
  if (DB.tables[name]) {
    if (st.ifNot) return { kind: 'NOOP', msg: `NOTICE: relation "${name}" already exists, skipping` };
    throw new SqlError(`relation "${name}" already exists`, 'Pick another name, or DROP TABLE it first.');
  }
  const seen = new Set();
  const cols = st.cols.map(c => { if (seen.has(c.name)) throw new SqlError(`column "${c.name}" specified more than once`); seen.add(c.name); return Object.assign({}, c); });
  const col = n => { const c = cols.find(c => c.name === n); if (!c) throw new SqlError(`column "${n}" named in key does not exist`); return c; };
  st.tcons.forEach(tc => {
    if (tc.pk) { if (tc.pk.length > 1) throw new SqlError('composite primary keys are not supported in this demo', 'Use a single id column as the PRIMARY KEY.'); col(tc.pk[0]).pk = true; }
    if (tc.unique) tc.unique.forEach(n => col(n).unique = true);
    if (tc.fk) { if (tc.fk.cols.length > 1) throw new SqlError('composite foreign keys are not supported in this demo'); col(tc.fk.cols[0]).fk = { table: tc.fk.table, col: tc.fk.refcols ? tc.fk.refcols[0] : null }; }
  });
  if (cols.filter(c => c.pk).length > 1) throw new SqlError(`multiple primary keys for table "${name}" are not allowed`);
  if (!cols.length) throw new SqlError('a table needs at least one column');
  const refs = [];
  cols.forEach(c => {
    if (/SERIAL/.test(c.type)) { c.serial = true; c.type = c.type === 'BIGSERIAL' ? 'BIGINT' : 'INT'; c.notnull = true; }
    if (!c.fk) return;
    const rt = c.fk.table === name ? { cols } : DB.tables[c.fk.table];
    if (!rt) throw new SqlError(`relation "${c.fk.table}" does not exist`, 'A foreign key must point at an existing table.');
    const target = c.fk.col ? rt.cols.find(x => x.name === c.fk.col) : rt.cols.find(x => x.pk);
    if (!target) throw new SqlError(c.fk.col ? `column "${c.fk.col}" referenced in foreign key constraint does not exist` : `there is no primary key for referenced table "${c.fk.table}"`);
    if (!target.pk && !target.unique) throw new SqlError(`there is no unique constraint matching given keys for referenced table "${c.fk.table}"`, 'Foreign keys usually reference the primary key.');
    if (typeFamily(target.type) !== typeFamily(c.type)) throw new SqlError(`foreign key constraint "${name}_${c.name}_fkey" cannot be implemented`, `Key columns "${c.name}" (${c.type}) and "${target.name}" (${target.type}) are of incompatible types.`);
    c.fk.col = target.name;
    if (c.fk.table !== name) refs.push(c);
  });
  const used = Object.values(DB.tables).filter(d => d.created).length;
  const def = { color: NEW_COLORS[used % NEW_COLORS.length], desc: 'A table you created', created: true,
    cols: cols.map(c => { const o = { name: c.name, type: c.type }; ['pk', 'fk', 'notnull', 'unique', 'serial', 'dflt'].forEach(k => { if (c[k]) o[k] = c[k]; }); return o; }), rows: [] };
  const sources = [{ alias: name, table: name, def, isNew: true }];
  refs.forEach(c => { if (!sources.some(s => s.table === c.fk.table)) sources.push({ alias: c.fk.table, table: c.fk.table, def: DB.tables[c.fk.table] }); });
  return { kind: 'CREATE', table: name, def, sources, cols: [], rows: [], q: EMPTYQ(),
    steps: [{ kind: 'CREATE', title: 'CREATE TABLE', sub: name, span: st.spans.all, involved: sources.map(s => s.alias), def }],
    links: refs.map(c => ({ kind: 'fk', type: 'REFERENCES', left: name, right: c.fk.table, pairs: [{ a: name, ac: c.name, b: c.fk.table, bc: c.fk.col }], other: [] })),
    summary: `table <b>${name}</b> will be created with ${plural(cols.length, 'column')}`,
    apply() { DB.tables[name] = def; return `CREATE TABLE · ${name} created`; } };
}
function planInsert(st) {
  const t = st.table, def = DB.tables[t];
  if (!def) throw new SqlError(`relation "${t}" does not exist`, t === 'reviews' ? 'Run the "Create a table" example first.' : 'Create it with CREATE TABLE first.');
  const idx = st.cols ? st.cols.map(n => { const i = def.cols.findIndex(c => c.name === n); if (i < 0) throw new SqlError(`column "${n}" of relation "${t}" does not exist`); return i; }) : def.cols.map((c, i) => i);
  if (new Set(idx).size !== idx.length) throw new SqlError('a column is listed more than once');
  const ctx = { srcs: [], env: null, clause: 'VALUES' };
  const newRows = [];
  const pkI = def.cols.findIndex(c => c.pk);
  st.rows.forEach(tuple => {
    if (tuple.length > idx.length) throw new SqlError('INSERT has more expressions than target columns');
    if (st.cols && tuple.length < idx.length) throw new SqlError('INSERT has more target columns than expressions');
    tuple.forEach(e => walk(e, n => { if (n.k === 'col') throw new SqlError(`column "${n.name}" does not exist`, "Text values use single quotes: 'like this'. Double quotes mean a column name."); }));
    const row = def.cols.map(() => undefined);
    tuple.forEach((e, i) => { row[idx[i]] = evalE(e, ctx); });
    def.cols.forEach((c, i) => {
      if (row[i] !== undefined) return;
      if (c.serial) { const all = def.rows.concat(newRows).map(r => r[i]).filter(v => typeof v === 'number'); row[i] = (all.length ? Math.max(...all) : 0) + 1; }
      else if (c.dflt) row[i] = evalE(c.dflt, ctx);
      else row[i] = null;
    });
    newRows.push(row.map((v, i) => coerce(v, def.cols[i], t)));
  });
  def.cols.forEach((c, i) => {
    if (c.pk || c.unique) {
      const seen = new Set(def.rows.map(r => JSON.stringify(r[i])));
      newRows.forEach(r => { if (r[i] === null) return; const k = JSON.stringify(r[i]); if (seen.has(k)) throw new SqlError(`duplicate key value violates unique constraint "${t}_${c.pk ? 'pkey' : c.name + '_key'}"`, `Key (${c.name})=(${r[i]}) already exists.`); seen.add(k); });
    }
    if (c.fk) {
      const rt = DB.tables[c.fk.table], ri = rt.cols.findIndex(x => x.name === c.fk.col);
      const have = new Set(rt.rows.concat(c.fk.table === t ? newRows : []).map(r => JSON.stringify(r[ri])));
      newRows.forEach(r => { if (r[i] !== null && !have.has(JSON.stringify(r[i]))) throw new SqlError(`insert or update on table "${t}" violates foreign key constraint "${t}_${c.name}_fkey"`, `Key (${c.name})=(${r[i]}) is not present in table "${c.fk.table}".`); });
    }
  });
  const src = { alias: t, table: t, def, extra: newRows };
  const all = def.rows.map((r, i) => ({ vals: Object.fromEntries(def.cols.map((c, j) => [t + '.' + c.name, r[j]])), src: { [t]: i } }));
  return { kind: 'INSERT', table: t, sources: [src], cols: [], rows: [], q: EMPTYQ(), links: [], newRows,
    steps: [
      { kind: 'VALUES', title: 'VALUES', sub: plural(newRows.length, 'row'), span: st.spans.values, involved: [t], newRows, rows: all },
      { kind: 'INSERT', title: 'INSERT INTO', sub: t, span: st.spans.target, involved: [t], newRows, rows: all }],
    summary: `${plural(newRows.length, 'row')} will be added to <b>${t}</b>`,
    apply() { const from = def.rows.length; def.rows.push(...newRows); return { msg: `INSERT 0 ${newRows.length} · added to ${t}`, from }; } };
}
function planDelete(st) {
  const t = st.table, def = DB.tables[t];
  if (!def) throw new SqlError(`relation "${t}" does not exist`);
  const src = { alias: st.alias, table: t, def }, srcs = [src];
  const rows = def.rows.map((r, i) => ({ vals: Object.fromEntries(def.cols.map((c, j) => [st.alias + '.' + c.name, r[j]])), src: { [st.alias]: i } }));
  let mark = rows.map(() => true);
  if (st.where) { checkExpr(st.where, srcs, 'WHERE', false); const ctx = { srcs, env: null, clause: 'WHERE' }; mark = rows.map(r => { ctx.env = r; return isTrue(evalE(st.where, ctx)); }); }
  const n = mark.filter(Boolean).length;
  refsTo(t).forEach(rf => {
    const ri = def.cols.findIndex(c => c.name === rf.refcol);
    const gone = new Set(def.rows.filter((r, i) => mark[i]).map(r => JSON.stringify(r[ri])));
    const child = DB.tables[rf.table];
    child.rows.forEach((r, i) => {
      if (rf.table === t && mark[i]) return;
      if (r[rf.ci] !== null && gone.has(JSON.stringify(r[rf.ci])))
        throw new SqlError(`update or delete on table "${t}" violates foreign key constraint "${rf.table}_${rf.col}_fkey" on table "${rf.table}"`, `Key (${rf.refcol})=(${r[rf.ci]}) is still referenced from table "${rf.table}". Delete those ${rf.table} rows first.`);
    });
  });
  const q = EMPTYQ(); q.where = st.where;
  const steps = [{ kind: 'TARGET', title: 'DELETE FROM', sub: t, span: st.spans.target, involved: [st.alias], rows, mark: rows.map(() => false) }];
  if (st.where) steps.push({ kind: 'DMATCH', title: 'WHERE', sub: '', span: st.spans.where, involved: [st.alias], rows, mark });
  steps.push({ kind: 'DELETE', title: 'DELETE', sub: plural(n, 'row'), span: st.spans.all, involved: [st.alias], rows, mark });
  return { kind: 'DELETE', table: t, sources: [src], cols: [], rows: [], q, links: [], mark, steps,
    summary: n ? `${plural(n, 'row')} of <b>${t}</b> will be deleted` : `no rows of <b>${t}</b> match, nothing will be deleted`,
    apply() { def.rows = def.rows.filter((r, i) => !mark[i]); return `DELETE ${n} · ${plural(n, 'row')} removed from ${t}`; } };
}
function planDrop(st) {
  const t = st.name, def = DB.tables[t];
  if (!def) { if (st.ifEx) return { kind: 'NOOP', msg: `NOTICE: table "${t}" does not exist, skipping` }; throw new SqlError(`table "${t}" does not exist`); }
  const deps = [...new Set(refsTo(t).filter(r => r.table !== t).map(r => r.table))];
  if (deps.length) throw new SqlError(`cannot drop table ${t} because other objects depend on it`, `${deps.join(', ')} ${deps.length === 1 ? 'references' : 'reference'} it with a foreign key. Drop ${deps.length === 1 ? 'that table' : 'those tables'} first.`);
  const rows = def.rows.map((r, i) => ({ vals: Object.fromEntries(def.cols.map((c, j) => [t + '.' + c.name, r[j]])), src: { [t]: i } }));
  return { kind: 'DROP', table: t, sources: [{ alias: t, table: t, def }], cols: [], rows: [], q: EMPTYQ(), links: [],
    steps: [{ kind: 'DROP', title: 'DROP TABLE', sub: t, span: st.spans.all, involved: [t], rows, mark: rows.map(() => true) }],
    summary: `table <b>${t}</b> and its ${plural(def.rows.length, 'row')} will be removed`,
    apply() { delete DB.tables[t]; return `DROP TABLE · ${t} removed`; } };
}
/* ===================== Scripts (several statements separated by ;) ===================== */
function splitScript(src) {
  const out = []; let i = 0, start = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "'") { i++; while (i < src.length) { if (src[i] === "'") { if (src[i + 1] === "'") { i += 2; continue; } break; } i++; } i++; continue; }
    if (c === '"') { i++; while (i < src.length && src[i] !== '"') i++; i++; continue; }
    if (c === '-' && src[i + 1] === '-') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === ';') { out.push({ start, end: i + 1 }); start = i + 1; }
    i++;
  }
  out.push({ start, end: src.length });
  return out.map(r => Object.assign(r, { text: src.slice(r.start, r.end) })).filter(r => r.text.replace(/--[^\n]*/g, '').replace(/;/g, '').trim());
}
function shiftSpans(o, off) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) { if (o.length === 2 && typeof o[0] === 'number' && typeof o[1] === 'number') { o[0] += off; o[1] += off; } else o.forEach(x => shiftSpans(x, off)); return; }
  for (const k in o) if (k === 'spans' || k === 'span' || k === 'joins') shiftSpans(o[k], off);
  if (!o.joins && !o.spans && !o.span) for (const k in o) if (Array.isArray(o[k]) && o[k].length === 2 && typeof o[k][0] === 'number') { o[k][0] += off; o[k][1] += off; }
}
function parseScript(src) {
  const parts = splitScript(src);
  if (!parts.length) throw new SqlError('Empty query', 'Click a table on the left, or type SELECT * FROM customers;', 0);
  return parts.map((p, idx) => {
    let ast;
    try { ast = parse(p.text); }
    catch (e) { if (e.pos != null) e.pos += p.start; e.stmtIndex = idx; e.stmtCount = parts.length; throw e; }
    for (const k in ast.spans) shiftSpans(ast.spans[k], p.start);
    (ast.joins || []).forEach(j => j.span && shiftSpans(j.span, p.start));
    const lead = p.text.length - p.text.replace(/^(\s|--[^\n]*)+/, '').length;
    ast.range = [p.start + lead, p.end];
    return ast;
  });
}
function runStmt(st) {
  switch (st.kind) {
    case 'CREATE': return planCreate(st);
    case 'INSERT': return planInsert(st);
    case 'DELETE': return planDelete(st);
    case 'DROP': return planDrop(st);
  }
  return execute(st);
}

if (typeof module !== "undefined") module.exports = { DB, parse, parseScript, splitScript, genQuery, execute, runStmt, genE, flatAnd, SqlError, fmtVal, typeFamily, snapshotDB, restoreDB, resetDB };
