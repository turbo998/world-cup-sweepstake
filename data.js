/* ============================================================
 * World Cup 2026 - Merlion Sweepstake  ·  本地 mock 数据
 * 单用户演示：所有数据写在本地，预测/留言存浏览器 localStorage
 * ============================================================ */

// "今天" 固定为 6/14，用于 Live Updates 的 昨天/今天 分组（贴合截图）
const TODAY = "2026-06-14";

// 球队 -> 国旗 emoji
const TEAMS = {
  Canada: "🇨🇦", Bosnia: "🇧🇦", USA: "🇺🇸", Paraguay: "🇵🇾",
  Qatar: "🇶🇦", Switzerland: "🇨🇭", Brazil: "🇧🇷", Morocco: "🇲🇦",
  Haiti: "🇭🇹", Scotland: "🏴", Germany: "🇩🇪", Curacao: "🇨🇼",
  Netherlands: "🇳🇱", Japan: "🇯🇵", "Ivory Coast": "🇨🇮", Ecuador: "🇪🇨",
  Sweden: "🇸🇪", Tunisia: "🇹🇳", "South Korea": "🇰🇷", Panama: "🇵🇦",
  "Czech Republic": "🇨🇿", France: "🇫🇷",
};

/* 赛程 + 比分。
 * status: "FT" = 已结束（有真实比分）, "UP" = 未开赛（可赛前猜比分）
 * plannedScore: 仅供 "结算演示" 用的预设最终比分（演示猜比分玩法）
 */
const MATCHES = [
  // ---- 6/13 (昨天) ----
  { id: "m1", group: "B", date: "2026-06-13", time: "3:00 AM", status: "FT",
    home: "Canada", homePlayer: "Julia", away: "Bosnia", awayPlayer: "Julia",
    homeScore: 1, awayScore: 1 },
  { id: "m2", group: "D", date: "2026-06-13", time: "9:00 AM", status: "FT",
    home: "USA", homePlayer: "Sam", away: "Paraguay", awayPlayer: "Lisha",
    homeScore: 4, awayScore: 1 },

  // ---- 6/14 (今天) ----
  { id: "m3", group: "B", date: "2026-06-14", time: "3:00 AM", status: "FT",
    home: "Qatar", homePlayer: "Lindsay", away: "Switzerland", awayPlayer: "Anisha",
    homeScore: 1, awayScore: 1 },
  { id: "m4", group: "C", date: "2026-06-14", time: "6:00 AM", status: "FT",
    home: "Brazil", homePlayer: "Elsa", away: "Morocco", awayPlayer: "Nivi",
    homeScore: 1, awayScore: 1 },
  { id: "m5", group: "C", date: "2026-06-14", time: "9:00 AM", status: "FT",
    home: "Haiti", homePlayer: "Meilin", away: "Scotland", awayPlayer: "Polly",
    homeScore: 0, awayScore: 1 },
  { id: "m6", group: "D", date: "2026-06-14", time: "12:00 PM", status: "FT",
    home: "South Korea", homePlayer: "Lisha", away: "Panama", awayPlayer: "Lisha",
    homeScore: 2, awayScore: 0 },

  // ---- 6/15 (未开赛, 可猜比分) ----
  { id: "m7", group: "E", date: "2026-06-15", time: "1:00 AM", status: "UP",
    home: "Germany", homePlayer: "Anisha", away: "Curacao", awayPlayer: "Sam",
    plannedScore: [3, 0] },
  { id: "m8", group: "F", date: "2026-06-15", time: "4:00 AM", status: "UP",
    home: "Netherlands", homePlayer: "Lindsay", away: "Japan", awayPlayer: "Meilin",
    plannedScore: [2, 1] },
  { id: "m9", group: "E", date: "2026-06-15", time: "7:00 AM", status: "UP",
    home: "Ivory Coast", homePlayer: "Lindsay", away: "Ecuador", awayPlayer: "Anish",
    plannedScore: [1, 1] },
  { id: "m10", group: "F", date: "2026-06-15", time: "10:00 AM", status: "UP",
    home: "Sweden", homePlayer: "Meilin", away: "Tunisia", awayPlayer: "Sofia",
    plannedScore: [0, 2] },

  // ---- 之后日期 (折叠占位) ----
  { id: "m11", group: "A", date: "2026-06-16", time: "3:00 AM", status: "UP",
    home: "France", homePlayer: "Nivi", away: "Czech Republic", awayPlayer: "Sam",
    plannedScore: [2, 0] },
];

/* 玩家认领的球队（sweepstake 抽签）。胜场/战绩由已结束比赛自动计算 */
const PLAYERS = {
  Sam:     ["USA", "Curacao", "Czech Republic"],
  Lisha:   ["South Korea", "Paraguay", "Panama"],
  Julia:   ["Canada", "Bosnia"],
  Lindsay: ["Netherlands", "Qatar", "Ivory Coast"],
  Anisha:  ["Switzerland", "Germany"],
  Elsa:    ["Brazil"],
  Nivi:    ["Morocco", "France"],
  Meilin:  ["Haiti", "Japan", "Sweden"],
  Polly:   ["Scotland"],
  Anish:   ["Ecuador"],
  Sofia:   ["Tunisia"],
};

/* 队友们对“已结束比赛”的赛前预测（演示用，让竞猜榜一开始就有数据）
 * 结构: { 玩家名: { 比赛id: [主队猜测, 客队猜测] } }
 */
const SEED_PREDICTIONS = {
  Sam:     { m1: [2, 0], m2: [4, 1], m3: [1, 0], m4: [2, 1], m5: [0, 1], m6: [1, 0] },
  Lindsay: { m1: [1, 1], m2: [3, 0], m3: [1, 1], m4: [0, 0], m5: [1, 1], m6: [2, 1] },
  Meilin:  { m1: [1, 1], m2: [2, 2], m3: [2, 1], m4: [1, 1], m5: [1, 0], m6: [2, 0] },
  Julia:   { m1: [1, 1], m2: [2, 1], m3: [0, 0], m4: [1, 1], m5: [0, 2], m6: [1, 1] },
  Nivi:    { m1: [0, 1], m2: [3, 1], m3: [1, 1], m4: [1, 0], m5: [0, 1], m6: [2, 0] },
};

/* Trash Talk 初始留言 */
const SEED_TRASH = [
  { user: "Sam", text: "USA 4-1 拿下！我的竞猜榜第一稳了 😎", t: "2026-06-13 10:05" },
  { user: "Lisha", text: "Paraguay 输了别笑，South Korea 帮我回血 🇰🇷", t: "2026-06-13 10:12" },
  { user: "Meilin", text: "Haiti 0-1… 心碎，靠 Japan 翻盘！", t: "2026-06-14 09:30" },
  { user: "Lindsay", text: "Qatar 平局还行，Netherlands 别让我失望啊", t: "2026-06-14 04:10" },
];
