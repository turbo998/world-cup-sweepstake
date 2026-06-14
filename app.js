/* ============================================================
 * World Cup 2026 - Merlion Sweepstake  ·  前端逻辑
 * ============================================================ */

const LS = {
  user: "wcs_user",
  pred: "wcs_pred",       // { user: { matchId: [h, a] } }
  results: "wcs_results", // { matchId: [h, a] }  —— 演示结算未开赛比赛
  trash: "wcs_trash",     // [ { user, text, t } ]  —— 用户新增留言
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ---------- localStorage helpers ---------- */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function currentUser() { return localStorage.getItem(LS.user) || "Guest"; }

/* ---------- 比赛有效状态（含演示结算覆盖） ---------- */
function effectiveMatch(m) {
  const results = load(LS.results, {});
  if (m.status === "FT") {
    return { ...m, isFT: true, h: m.homeScore, a: m.awayScore, simulated: false };
  }
  if (results[m.id]) {
    return { ...m, isFT: true, h: results[m.id][0], a: results[m.id][1], simulated: true };
  }
  return { ...m, isFT: false };
}

/* ---------- 日期分组与标签 ---------- */
function fmtDate(date) {
  const [, mo, d] = date.split("-").map(Number);
  return `${MONTHS[mo - 1]} ${d}`;
}
function dayLabel(date) {
  if (date === TODAY) return "Today";
  // 昨天 = TODAY - 1 天
  const t = new Date(TODAY + "T00:00:00");
  const prev = new Date(t.getTime() - 86400000);
  const y = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
  if (date === y) return "Yesterday";
  return null;
}

/* ============================================================
 *  竞猜结算 / 评分
 *  规则：猜中精确比分 +3；仅猜中胜平负 +1；否则 0
 * ============================================================ */
function outcome(h, a) { return h > a ? "H" : h < a ? "A" : "D"; }

function scoreFor(predH, predA, realH, realA) {
  if (predH === realH && predA === realA) return 3;
  if (outcome(predH, predA) === outcome(realH, realA)) return 1;
  return 0;
}

// 合并 种子预测 + 当前所有用户预测
function allPredictions() {
  const stored = load(LS.pred, {});           // { user: { mid: [h,a] } }
  const merged = {};
  for (const [u, ps] of Object.entries(SEED_PREDICTIONS)) merged[u] = { ...ps };
  for (const [u, ps] of Object.entries(stored)) merged[u] = { ...(merged[u] || {}), ...ps };
  return merged;
}

function predictionLeaderboard() {
  const preds = allPredictions();
  const rows = [];
  for (const [user, ps] of Object.entries(preds)) {
    let pts = 0, hits = 0, exact = 0, played = 0;
    for (const m of MATCHES) {
      const em = effectiveMatch(m);
      if (!em.isFT || !ps[m.id]) continue;
      played++;
      const s = scoreFor(ps[m.id][0], ps[m.id][1], em.h, em.a);
      pts += s;
      if (s === 3) { exact++; hits++; }
      else if (s === 1) hits++;
    }
    rows.push({ user, pts, hits, exact, played });
  }
  rows.sort((x, y) => y.pts - x.pts || y.exact - x.exact || x.user.localeCompare(y.user));
  return rows;
}

/* ---------- 认领球队战绩 ---------- */
function teamRecord(team) {
  let w = 0, t = 0, l = 0;
  for (const m of MATCHES) {
    const em = effectiveMatch(m);
    if (!em.isFT) continue;
    let me, opp;
    if (m.home === team) { me = em.h; opp = em.a; }
    else if (m.away === team) { me = em.a; opp = em.h; }
    else continue;
    if (me > opp) w++; else if (me === opp) t++; else l++;
  }
  return { w, t, l };
}

function standings() {
  const rows = [];
  for (const [user, teams] of Object.entries(PLAYERS)) {
    let wins = 0;
    const recs = teams.map((tm) => {
      const r = teamRecord(tm);
      wins += r.w;
      return { team: tm, ...r };
    });
    rows.push({ user, wins, recs });
  }
  rows.sort((a, b) => b.wins - a.wins || a.user.localeCompare(b.user));
  return rows;
}

/* ============================================================
 *  渲染：Live Updates
 * ============================================================ */
function renderLive() {
  const el = document.getElementById("tab-live");
  const user = currentUser();
  const preds = load(LS.pred, {});
  const mine = preds[user] || {};

  // 按日期分组
  const byDate = {};
  for (const m of MATCHES) (byDate[m.date] ||= []).push(m);
  const dates = Object.keys(byDate).sort();

  let html = "";
  for (const date of dates) {
    const rel = dayLabel(date);
    const label = rel ? `${rel} · ${fmtDate(date)}` : fmtDate(date);
    const collapsed = rel ? "" : "collapsed"; // 仅 今天/昨天 默认展开
    const matches = byDate[date];

    html += `<div class="day-group">
      <button class="day-head ${collapsed}" data-day="${date}">
        <span class="left"><span class="chev">▼</span>${label}</span>
        <span class="count">${matches.length} matches</span>
      </button>
      <div class="day-body">
        ${matches.map((m) => matchCard(m, user, mine[m.id])).join("")}
      </div>
    </div>`;
  }
  el.innerHTML = html;

  // 折叠交互
  el.querySelectorAll(".day-head").forEach((b) =>
    b.addEventListener("click", () => b.classList.toggle("collapsed"))
  );
  // 绑定预测
  bindPredict(el);
}

function matchCard(m, user, myPred) {
  const em = effectiveMatch(m);
  const hf = TEAMS[m.home] || "", af = TEAMS[m.away] || "";
  const statusHtml = em.isFT
    ? `<span class="status ft"><span class="dot"></span>${em.simulated ? "FULL TIME*" : "FULL TIME"}</span>`
    : `<span class="status up"><span class="dot"></span>UPCOMING</span>`;

  const center = em.isFT
    ? `<div class="score">${em.h} – ${em.a}</div>`
    : `<div class="score vs">VS</div>`;

  let extra = "";
  if (!em.isFT) {
    // 赛前猜比分
    const ph = myPred ? myPred[0] : "";
    const pa = myPred ? myPred[1] : "";
    const savedTxt = myPred ? `<span class="saved">已保存 ${myPred[0]}-${myPred[1]}</span>` : "";
    extra = `<div class="predict" data-mid="${m.id}">
      <span class="label">赛前猜比分</span>
      <input class="ph" type="number" min="0" max="20" value="${ph}" />
      <span class="dash">–</span>
      <input class="pa" type="number" min="0" max="20" value="${pa}" />
      <button class="save-pred">保存</button>
      <button class="settle-one" title="用预设结果结算本场（演示）">结算演示</button>
      ${savedTxt}
    </div>`;
  } else if (myPred) {
    // 已结束 + 本人有预测 -> 显示得分
    const s = scoreFor(myPred[0], myPred[1], em.h, em.a);
    const cls = s === 3 ? "hit3" : s === 1 ? "hit1" : "miss";
    const tag = s === 3 ? "精确命中 🎯" : s === 1 ? "猜中胜负" : "未猜中";
    extra = `<div class="pred-result">你的预测 <b>${myPred[0]}-${myPred[1]}</b> · <span class="${cls}">${tag}</span> · <span class="pts">+${s} 分</span></div>`;
  }

  return `<div class="match">
    <div class="match-top">
      <span>Group ${m.group} · ${fmtDate(m.date)} · ${m.time}</span>
      ${statusHtml}
    </div>
    <div class="match-row">
      <div class="team home">
        <div class="name"><span class="flag">${hf}</span>${m.home}</div>
        <span class="player-chip">${m.homePlayer}</span>
      </div>
      ${center}
      <div class="team away">
        <div class="name">${m.away}<span class="flag">${af}</span></div>
        <span class="player-chip">${m.awayPlayer}</span>
      </div>
    </div>
    ${extra}
  </div>`;
}

function bindPredict(root) {
  root.querySelectorAll(".predict").forEach((box) => {
    const mid = box.dataset.mid;
    box.querySelector(".save-pred").addEventListener("click", () => {
      const h = parseInt(box.querySelector(".ph").value, 10);
      const a = parseInt(box.querySelector(".pa").value, 10);
      if (Number.isNaN(h) || Number.isNaN(a)) { toast("请输入两个比分"); return; }
      const user = ensureUser();
      const preds = load(LS.pred, {});
      preds[user] = preds[user] || {};
      preds[user][mid] = [h, a];
      save(LS.pred, preds);
      toast(`已保存 ${user} 的预测：${h}-${a}`);
      renderLive();
    });
    box.querySelector(".settle-one").addEventListener("click", () => {
      settleMatches([mid]);
    });
  });
}

/* ---------- 结算 ---------- */
function settleMatches(ids) {
  const results = load(LS.results, {});
  let n = 0;
  for (const id of ids) {
    const m = MATCHES.find((x) => x.id === id);
    if (!m || m.status === "FT" || results[id]) continue;
    results[id] = m.plannedScore || [0, 0];
    n++;
  }
  save(LS.results, results);
  toast(n ? `已结算 ${n} 场，竞猜得分已更新` : "没有可结算的比赛");
  renderAll();
  switchTab("rankings");
}

function settleAll() {
  settleMatches(MATCHES.filter((m) => m.status === "UP").map((m) => m.id));
}

/* ============================================================
 *  渲染：Rankings（认领战绩榜 + 竞猜得分榜）
 * ============================================================ */
let rankView = "standings"; // or "predict"

function renderRankings() {
  const el = document.getElementById("tab-rankings");
  let html = `<div class="rank-switch">
    <button data-rv="standings" class="${rankView === "standings" ? "active" : ""}">认领战绩榜</button>
    <button data-rv="predict" class="${rankView === "predict" ? "active" : ""}">竞猜得分榜</button>
  </div>`;

  if (rankView === "standings") {
    standings().forEach((row, i) => {
      html += `<div class="rank-card">
        <div class="rank-head">
          <span class="rank-badge">${i + 1}</span>
          <span class="rank-name">${row.user}</span>
          <span class="rank-score">${row.wins}<small>${row.wins === 1 ? "WIN" : "WINS"}</small></span>
        </div>
        <div class="rank-teams">
          ${row.recs.map((r) => `
            <div class="rank-team-row">
              <span class="tname"><span class="flag">${TEAMS[r.team] || ""}</span>${r.team}</span>
              <span class="record">
                <span class="${r.w ? "w" : "z"}">${r.w}W</span>
                <span class="${r.t ? "t" : "z"}">${r.t}T</span>
                <span class="${r.l ? "l" : "z"}">${r.l}L</span>
              </span>
            </div>`).join("")}
        </div>
      </div>`;
    });
  } else {
    const rows = predictionLeaderboard();
    const me = currentUser();
    if (rows.every((r) => r.played === 0)) {
      html += `<div class="empty">还没有已结束比赛的预测。点击右上角 <b>Admin</b> 或比赛卡上的「结算演示」来体验竞猜玩法。</div>`;
    }
    rows.forEach((row, i) => {
      if (row.played === 0 && row.pts === 0) return;
      html += `<div class="rank-card">
        <div class="rank-head">
          <span class="rank-badge">${i + 1}</span>
          <span class="rank-name">${row.user}${row.user === me ? " <small style='color:var(--accent)'>(你)</small>" : ""}</span>
          <span class="rank-score">${row.pts}<small>PTS</small></span>
        </div>
        <div class="rank-teams">
          <div class="rank-team-row">
            <span class="tname">精确命中 ${row.exact} 场 · 共命中 ${row.hits}/${row.played}</span>
            <span class="record"><span class="w">🎯 ${row.exact}×3</span><span class="t">✓ ${row.hits - row.exact}×1</span></span>
          </div>
        </div>
      </div>`;
    });
  }
  el.innerHTML = html;
  el.querySelectorAll(".rank-switch button").forEach((b) =>
    b.addEventListener("click", () => { rankView = b.dataset.rv; renderRankings(); })
  );
}

/* ============================================================
 *  渲染：Trash Talk
 * ============================================================ */
function allTrash() {
  return [...SEED_TRASH, ...load(LS.trash, [])];
}

function renderTrash() {
  const el = document.getElementById("tab-trash");
  const me = currentUser();
  const msgs = allTrash();
  const list = msgs.map((m) => `
    <div class="msg ${m.user === me ? "mine" : ""}">
      <div class="meta">
        <span class="avatar">${(m.user || "?")[0].toUpperCase()}</span>
        <span class="who">${m.user}</span>
        <span class="when">${m.t || ""}</span>
      </div>
      <div class="text">${escapeHtml(m.text)}</div>
    </div>`).join("");

  el.innerHTML = `
    <div class="trash-list">${list || '<div class="empty">还没有人开喷，抢个沙发？</div>'}</div>
    <div class="composer">
      <input id="trashInput" placeholder="发条 Trash Talk…（回车发送）" maxlength="200" />
      <button id="trashSend">发送</button>
    </div>`;

  const input = el.querySelector("#trashInput");
  const sendBtn = el.querySelector("#trashSend");
  const send = () => {
    const text = input.value.trim();
    if (!text) return;
    const user = ensureUser();
    const arr = load(LS.trash, []);
    arr.push({ user, text, t: nowStr() });
    save(LS.trash, arr);
    input.value = "";
    renderTrash();
    const lst = document.querySelector(".trash-list");
    if (lst) lst.scrollTop = lst.scrollHeight;
  };
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
}

/* ============================================================
 *  公共 / 工具
 * ============================================================ */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => t.classList.remove("show"), 2200);
}

// 确保有昵称；为空时提示输入并回退 Guest
function ensureUser() {
  let u = currentUser();
  if (!u || u === "Guest") {
    const input = document.getElementById("nickname");
    if (input && input.value.trim()) {
      u = input.value.trim();
      localStorage.setItem(LS.user, u);
    } else {
      u = "Guest";
      localStorage.setItem(LS.user, u);
    }
  }
  return u;
}

/* ---------- Tabs ---------- */
function switchTab(name) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach((p) =>
    p.classList.toggle("active", p.id === `tab-${name}`));
}

function renderAll() {
  renderLive();
  renderRankings();
  renderTrash();
  document.getElementById("footStatus").textContent = "Updated " + nowStr();
}

/* ---------- 初始化 ---------- */
function init() {
  // 昵称
  const nick = document.getElementById("nickname");
  const saved = localStorage.getItem(LS.user);
  if (saved && saved !== "Guest") nick.value = saved;
  nick.addEventListener("change", () => {
    const v = nick.value.trim();
    if (v) { localStorage.setItem(LS.user, v); toast(`昵称已设为 ${v}`); }
    renderAll();
  });

  // Tabs
  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => switchTab(t.dataset.tab)));

  // Admin = 一键结算全部未开赛比赛
  document.getElementById("adminBtn").addEventListener("click", () => {
    if (confirm("Admin：用预设结果结算所有『未开赛』比赛，以演示竞猜得分榜？")) settleAll();
  });

  renderAll();
}

document.addEventListener("DOMContentLoaded", init);
