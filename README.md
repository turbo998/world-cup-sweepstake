# World Cup 2026 - Merlion Sweepstake ⚽

朋友聚会看球用的世界杯竞猜小站。深绿暗色主题，纯前端静态站，开箱即用、可一键部署到 GitHub Pages。

🔗 **在线演示**：https://turbo998.github.io/world-cup-sweepstake/

## 功能
- **Live Updates**：按日期分组（今天/昨天展开、未来折叠）的赛程与比分，含分组、状态点（FULL TIME / UPCOMING）、双方球员认领标签。
- **赛前猜比分**（竞猜玩法）：在未开赛比赛卡上输入预测比分。结算规则：
  - 猜中精确比分 **+3 分** 🎯
  - 仅猜中胜平负 **+1 分** ✓
- **Rankings**：
  - 认领战绩榜：玩家抽签认领的球队 W/T/L 战绩与胜场。
  - 竞猜得分榜：按预测得分排序。
- **Trash Talk**：留言板，朋友间互喷/分享观赛体验。
- 顶部输入昵称区分用户；**Admin** 按钮可一键结算所有未开赛比赛，方便现场演示竞猜玩法。

## 运行
直接用浏览器打开 `index.html` 即可。或本地起一个静态服务器：

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

## 数据说明
- 球队 / 球员 / 赛程 / 比分都在 `data.js`（mock 数据，参照原型截图）。
- 各自的「猜比分」预测、结算结果、Trash Talk 留言保存在浏览器 `localStorage`。
- 单用户演示：以昵称区分，**不做真实多人云端同步**。换浏览器/清缓存数据会重置。

## 文件
| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面结构与三个 Tab |
| `styles.css` | 深绿暗色主题样式（含移动端自适应） |
| `data.js` | 球队 / 玩家 / 赛程 / 比分 / 种子预测 / 初始留言 |
| `app.js` | Tab 切换、渲染、猜比分与结算、排行榜、留言逻辑 |

## 部署到 GitHub Pages
仓库 Settings → Pages → Source 选择 `main` 分支根目录，保存后即可获得演示链接：
https://turbo998.github.io/world-cup-sweepstake/
