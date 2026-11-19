/* ===================== Layered graph layout (shared by the compact map and the schema diagram) =====================
   Tables that are referenced (parents) go in layer 0; a table that holds foreign keys sits one layer past the
   deepest table it references. Edges that skip layers get invisible "dummy" waypoints so they route around
   boxes instead of through them. Layer order is chosen to minimise line crossings (barycentre sweeps, then
   exhaustive search for small layers), then boxes slide towards their neighbours to keep lines short. */
function layeredLayout(nodes, edges, o) {
  const N = Object.fromEntries(nodes.map(n => [n.id, n]));
  const ids = nodes.map(n => n.id);
  const E = edges.filter(e => e.from !== e.to && N[e.from] && N[e.to]);
  const TB = o.dir === 'TB';
  const L = Object.fromEntries(ids.map(i => [i, 0]));
  for (let it = 0; it <= ids.length; it++) {
    let ch = false;
    E.forEach(e => { const v = L[e.to] + 1; if (L[e.from] < v && v <= ids.length) { L[e.from] = v; ch = true; } });
    if (!ch) break;
  }
  // pull pure parents down next to their nearest child
  ids.forEach(i => {
    if (E.some(e => e.from === i)) return;
    const kids = E.filter(e => e.to === i).map(e => L[e.from]);
    if (kids.length) L[i] = Math.max(0, Math.min(...kids) - 1);
  });
  const maxL = Math.max(0, ...ids.map(i => L[i]));
  const layers = Array.from({ length: maxL + 1 }, () => []);
  ids.forEach(i => layers[L[i]].push({ id: i, real: true, w: N[i].w, h: N[i].h }));
  const chains = E.map((e, ei) => {
    const a = L[e.from], b = L[e.to], chain = [e.from];
    const step = a > b ? -1 : 1;
    for (let l = a + step; l !== b && Math.abs(l - a) < Math.abs(b - a); l += step) {
      const d = { id: `~${ei}_${l}`, real: false, w: o.dw, h: o.dh };
      layers[l].push(d); chain.push(d.id);
    }
    chain.push(e.to);
    return { e, chain };
  });
  const layerOf = {}; layers.forEach((ly, l) => ly.forEach(n => { layerOf[n.id] = l; }));
  const segs = [];
  chains.forEach(c => { for (let i = 0; i < c.chain.length - 1; i++) { const u = c.chain[i], v = c.chain[i + 1]; if (layerOf[u] !== layerOf[v]) segs.push([u, v]); } });
  const nbr = {};
  segs.forEach(([u, v]) => { (nbr[u] = nbr[u] || []).push(v); (nbr[v] = nbr[v] || []).push(u); });
  const index = () => { const m = {}; layers.forEach(ly => ly.forEach((n, i) => { m[n.id] = i; })); return m; };
  const score = () => {
    const m = index(); let cross = 0, len = 0;
    for (let l = 0; l < layers.length - 1; l++) {
      const ss = [];
      segs.forEach(([u, v]) => {
        const lu = layerOf[u], lv = layerOf[v];
        if (Math.min(lu, lv) !== l || Math.abs(lu - lv) !== 1) return;
        ss.push(lu === l ? [m[u], m[v]] : [m[v], m[u]]);
      });
      for (let i = 0; i < ss.length; i++) for (let j = i + 1; j < ss.length; j++) if ((ss[i][0] - ss[j][0]) * (ss[i][1] - ss[j][1]) < 0) cross++;
      ss.forEach(s => { len += Math.abs(s[0] - s[1]); });
    }
    return cross * 1000 + len;
  };
  for (let it = 0; it < 8; it++) {
    const down = it % 2 === 0;
    const seq = layers.map((_, i) => i);
    if (!down) seq.reverse();
    seq.slice(1).forEach(l => {
      const m = index(), ref = down ? l - 1 : l + 1;
      layers[l].forEach(n => { const ns = (nbr[n.id] || []).filter(x => layerOf[x] === ref); n.bc = ns.length ? ns.reduce((s, x) => s + m[x], 0) / ns.length : m[n.id]; });
      layers[l].sort((a, b) => a.bc - b.bc);
    });
  }
  let best = score();
  for (let r = 0; r < 3; r++) layers.forEach((ly, l) => {
    if (ly.length < 2 || ly.length > 7) return;
    let bestP = ly.slice();
    permute(ly.slice(), p => { layers[l] = p; const s = score(); if (s < best) { best = s; bestP = p.slice(); } });
    layers[l] = bestP;
  });
  // coordinates: A runs along a layer, B runs across layers
  const sA = n => TB ? n.w : n.h, sB = n => TB ? n.h : n.w;
  let b = 0;
  const layerB = layers.map(ly => { const t = Math.max(0, ...ly.map(sB)); const v = { start: b, size: t }; b += t + o.layerGap; return v; });
  const A = {}, byId = {};
  layers.forEach(ly => { let a = 0; ly.forEach(n => { byId[n.id] = n; A[n.id] = a; a += sA(n) + o.nodeGap; }); });
  const centre = n => A[n.id] + sA(n) / 2;
  const settle = ly => { for (let i = 1; i < ly.length; i++) { const p = ly[i - 1], min = A[p.id] + sA(p) + o.nodeGap; if (A[ly[i].id] < min) A[ly[i].id] = min; } };
  for (let it = 0; it < 16; it++) layers.forEach(ly => {
    ly.forEach(n => { const ns = nbr[n.id] || []; if (!ns.length) return; const t = ns.reduce((s, x) => s + centre(byId[x]), 0) / ns.length - sA(n) / 2; A[n.id] += (t - A[n.id]) * .5; });
    settle(ly);
  });
  const minA = Math.min(...Object.values(A));
  Object.keys(A).forEach(k => { A[k] -= minA; });
  const pos = {}, pt = {};
  layers.forEach((ly, l) => ly.forEach(n => {
    const a = A[n.id], bb = layerB[l].start;
    if (n.real) pos[n.id] = TB ? { x: a, y: bb } : { x: bb, y: a };
    else pt[n.id] = TB ? { x: a + n.w / 2, y: bb + layerB[l].size / 2 } : { x: bb + layerB[l].size / 2, y: a + n.h / 2 };
  }));
  let W = 0, H = 0;
  ids.forEach(i => { W = Math.max(W, pos[i].x + N[i].w); H = Math.max(H, pos[i].y + N[i].h); });
  return { pos, routes: chains.map(c => ({ e: c.e, pts: c.chain.slice(1, -1).map(id => pt[id]) })), W, H, layerOf: L };
}
function permute(arr, cb) {
  const c = arr.map(() => 0); cb(arr);
  let i = 1;
  while (i < arr.length) {
    if (c[i] < i) { const k = i % 2 ? c[i] : 0; [arr[i], arr[k]] = [arr[k], arr[i]]; cb(arr); c[i]++; i = 1; }
    else { c[i] = 0; i++; }
  }
}
function fkEdges() {
  const out = [];
  Object.entries(DB.tables).forEach(([t, d]) => d.cols.forEach(c => { if (c.fk && DB.tables[c.fk.table]) out.push({ from: t, to: c.fk.table, col: c.name, ref: c.fk.col }); }));
  return out;
}
/* smooth path through points; vertical tangents for TB, horizontal for LR */
function smoothPath(P, TB) {
  let d = `M${P[0].x},${P[0].y}`;
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i];
    if (TB) { const m = (a.y + b.y) / 2; d += ` C${a.x},${m} ${b.x},${m} ${b.x},${b.y}`; }
    else { const m = (a.x + b.x) / 2; d += ` C${m},${a.y} ${m},${b.y} ${b.x},${b.y}`; }
  }
  return d;
}
