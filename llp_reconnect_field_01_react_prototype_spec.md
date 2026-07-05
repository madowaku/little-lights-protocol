# Little Lights Protocol

# Reconnect Field 01 Reactプロトタイプ仕様書 v0.1

## 0. 目的

この仕様書は、Little Lights Protocol の最初の本格ゲームプレイ検証として、**Reconnect Field 01：名前をなくした街** を React / TypeScript で実装するためのMVP仕様を定義する。

このプロトタイプの目的は、完成版の美麗UIを作ることではなく、次の遊びが本当に面白いかを検証すること。

> 集まると強い。\
> 散ると速い。\
> でも、つながっていない光は消えてしまう。

プレイヤーが10分遊んだあと、

> 今回は中央を固めすぎたから、次はノノを早めに出そう。\
> 今回はN12を先につないだけど、次はN03にSafe Placeを作ろう。\
> 今回はTiny Light Bを逃したから、N16を先にScanしよう。

と思えたら成功。

---

## 1. 対象範囲

### 実装するもの

- ストーリー導入
- フィールド前会話
- Reconnect Field 01
- 途中イベント
- クリア後会話
- フィールド結果による会話差分

### 実装しないもの

- 育成
- 装備
- ガチャ
- 長編ステージ選択
- セーブデータ
- フルアニメーション
- 全キャラ加入
- 全相棒の詳細AI
- 高度なバトル演出

---

## 2. 推奨技術構成

```txt
React
TypeScript
Vite
Tailwind CSS
```

### 任意

```txt
zustand または useReducer
framer-motion
lucide-react
```

MVPでは外部状態管理なしでもよい。まずは `useReducer` で十分。

---

## 3. 画面遷移

```txt
StoryScene
  ↓
BriefingScene
  ↓
FieldScene
  ↓
MidEventScene
  ↓
FieldScene
  ↓
ClearScene
  ↓
PostFieldTalkScene
  ↓
ResultScene
```

### Scene定義

```ts
type GameScene =
  | "story"
  | "briefing"
  | "field"
  | "midEvent"
  | "clear"
  | "postTalk"
  | "result";
```

---

## 4. 画面構成

### 基本レイアウト

```txt
┌──────────────────────────────────────────────┐
│ Header                                       │
│ Field名 / Turn / Link Density / Objectives   │
├──────────────┬───────────────────┬───────────┤
│ Party Panel  │ Field Map          │ Info Panel│
│              │                   │           │
├──────────────┴───────────────────┴───────────┤
│ Command Bar                                  │
└──────────────────────────────────────────────┘
```

### Header

表示するもの。

- Reconnect Field 01
- 名前をなくした街
- Turn `現在 / 上限`
- 全体Link Density
- Objective概要

### Party Panel

表示するキャラ。

- ルミ
- ギア
- マメ
- ノノ

各キャラ表示。

```txt
顔アイコン
名前
現在Node
HP または Integrity
LINK率
状態：normal / isolated / synced / alert
相棒名
```

### Field Map

中央のメイン画面。

表示するもの。

- Node
- Edge
- キャラ位置
- 敵位置
- Tiny Light残り猶予
- 選択中Nodeハイライト
- 移動可能Nodeハイライト
- 危険圏
- Dotted / Hidden の接続候補

### Info Panel

選択対象に応じて表示内容を変える。

#### Node選択時

```txt
ノード名
種別
状態
危険度
接続候補
推奨アクション
特殊効果
```

#### キャラ選択時

```txt
キャラ名
役割
現在Node
可能アクション
Sync状態
孤立リスク
```

#### 敵選択時

```txt
敵名
認知状態
次の移動候補
Burst圏
通過効果
```

### Command Bar

MVPで必要なコマンド。

```txt
Move
Connect
Repair
Safe Place
Scan
Sync
Split
End Turn
```

---

## 5. Field 01 コンセプト

### ステージ名

```txt
Reconnect Field 01：名前をなくした街
```

### 使用キャラ

```txt
ルミ / Lumi
ギア / Gear
マメ / Mame
ノノ / Nono
```

### テーマ

街の名前が記録から削除され、Core LanternからMemory Coreまでの接続が断たれている。プレイヤーは4人を配置し、中央ルート・下側Safe Placeルート・上側修復ルート・右上ジッパールートを選びながら再接続を進める。

---

## 6. 勝利条件

### 基本勝利

```txt
N11 Memory Core を Stable にする。
```

### Memory Core安定化条件

次のいずれかを満たす。

```txt
A. N06 Weak Relay が Stable で、2人以上のSync UnitがN11に到達する
B. Tiny Lightを2つ以上救出し、ルミがN11でConnectを実行する
C. N10 Tiny Light Bを救出済みで、N10-N11 Hidden RouteをTemporary接続している
```

---

## 7. 敗北条件

```txt
Turn 20終了時にN11がStableでない
Tiny Lightが2つ以上消失
Core LanternがBrokenになる
ノノが孤立状態でHunter Noiseに捕捉される
```

MVPでは「ノノ捕捉」は即敗北ではなく、強制撤退でもよい。

---

## 8. スコア / 評価条件

### 評価項目

```txt
Tiny Light救出数
残りTurn
Memory Core安定化時のSync人数
Hidden Route発見数
ノノがHunter Noiseに発見されたか
Core Lanternの最終状態
```

### ランク案

```txt
S：Tiny Light 3つ救出、15ターン以内、ノノ未発見
A：Tiny Light 2つ救出、20ターン以内
B：Memory Core安定化のみ
C：クリアしたがTiny Light消失あり
```

---

## 9. データ型

```ts
export type NodeType =
  | "core"
  | "relay"
  | "memory"
  | "tinyLight"
  | "brokenRelay"
  | "safeSpot"
  | "empty"
  | "hidden"
  | "anchor";

export type NodeState =
  | "stable"
  | "weak"
  | "broken"
  | "unlinked"
  | "dormant"
  | "hidden"
  | "locked";

export type EdgeState =
  | "stable"
  | "weak"
  | "broken"
  | "dotted"
  | "hidden"
  | "temporary";

export type CharacterId = "lumi" | "gear" | "mame" | "nono";

export type EnemyId = "sweepNoise" | "hunterNoise" | "lockNode";
```

### FieldNode

```ts
export type FieldNode = {
  id: string;
  name: string;
  jpName: string;
  type: NodeType;
  state: NodeState;
  x: number;
  y: number;
  danger: number;
  description: string;
  tinyLightTurnsRemaining?: number;
  rescued?: boolean;
  revealRequirement?: "scan" | "nono" | "bug";
  repairRequirement?: "gear" | "patchi" | "gear_or_mame";
  tags?: string[];
};
```

### FieldEdge

```ts
export type FieldEdge = {
  id: string;
  from: string;
  to: string;
  state: EdgeState;
  revealRequirement?: "scan" | "nono" | "bug";
  repairRequirement?: "gear" | "patchi" | "gear_or_mame";
  temporaryTurnsRemaining?: number;
};
```

### CharacterUnit

```ts
export type CharacterUnit = {
  id: CharacterId;
  name: string;
  jpName: string;
  role: string;
  currentNodeId: string;
  integrity: number;
  link: number;
  buddyName: string;
  status: "normal" | "isolated" | "synced" | "alert" | "down";
  syncedGroupId?: string;
  actionsUsedThisTurn: boolean;
};
```

### EnemyUnit

```ts
export type EnemyUnit = {
  id: EnemyId;
  name: string;
  jpName: string;
  currentNodeId: string;
  awareness: "unaware" | "suspicious" | "alert" | "pursuit";
  route?: string[];
  routeIndex?: number;
  burstReady?: boolean;
};
```

---

## 10. ノード一覧

### 配置図

```txt
                         [N08 Tiny Light A]
                                |
                         [N15 Clock Roof]
                                :
                         [N05 Broken Relay] ---- [N16 Signal Pole] .... [N09 Hidden Gate] -- [N10 Tiny Light B]
                           /        |                 .                       .                 |
                  [N14 Dry Fountain]                  .                       .                 |
                         |                            .                       .                 |
[N00 Core Lantern] -- [N01 Central Relay] -- [N12 Empty Plaza] -- [N06 Weak Relay] ---- [N11 Memory Core]
                         |              \             |              \
                  [N02 Old Sign]         \       [N17 Service Stairs] .... [N18 Rooftop Step]
                         |                \            |
                  [N13 Side Street] -- [N03 Safe Spot Ruins] -- [N07 Back Alley]
                                             |
                                      [N04 Tiny Light C]
```

### Nodes データ

```ts
export const field01Nodes: FieldNode[] = [
  {
    id: "N00",
    name: "Core Lantern",
    jpName: "コア・ランタン",
    type: "core",
    state: "stable",
    x: 0,
    y: 3,
    danger: 0,
    description: "味方の初期拠点。Lightlineの起点。"
  },
  {
    id: "N01",
    name: "Central Relay",
    jpName: "中央リレー",
    type: "relay",
    state: "weak",
    x: 2,
    y: 3,
    danger: 1,
    description: "最初に再接続する中継点。"
  },
  {
    id: "N02",
    name: "Old Sign",
    jpName: "古い看板",
    type: "memory",
    state: "weak",
    x: 2,
    y: 4,
    danger: 1,
    description: "街の名前が削られた看板跡。"
  },
  {
    id: "N03",
    name: "Safe Spot Ruins",
    jpName: "安全地帯の廃墟",
    type: "safeSpot",
    state: "dormant",
    x: 3,
    y: 5,
    danger: 1,
    description: "マメがSafe Place化できる廃墟。"
  },
  {
    id: "N04",
    name: "Tiny Light C",
    jpName: "タイニーライトC",
    type: "tinyLight",
    state: "weak",
    x: 3,
    y: 6,
    danger: 1,
    tinyLightTurnsRemaining: 10,
    rescued: false,
    description: "最も救出しやすいTiny Light。"
  },
  {
    id: "N05",
    name: "Broken Relay",
    jpName: "壊れたリレー",
    type: "brokenRelay",
    state: "broken",
    x: 4,
    y: 1,
    danger: 2,
    repairRequirement: "gear",
    description: "ギアの修理対象。上側ルートの要。"
  },
  {
    id: "N06",
    name: "Weak Relay",
    jpName: "弱ったリレー",
    type: "relay",
    state: "weak",
    x: 6,
    y: 3,
    danger: 2,
    description: "Memory Core手前の重要中継点。"
  },
  {
    id: "N07",
    name: "Back Alley",
    jpName: "裏路地",
    type: "hidden",
    state: "hidden",
    x: 5,
    y: 6,
    danger: 2,
    revealRequirement: "nono",
    description: "ノノが見つけられる裏道。"
  },
  {
    id: "N08",
    name: "Tiny Light A",
    jpName: "タイニーライトA",
    type: "tinyLight",
    state: "weak",
    x: 4,
    y: 0,
    danger: 2,
    tinyLightTurnsRemaining: 8,
    rescued: false,
    description: "Broken Relay修復後に救出しやすいTiny Light。"
  },
  {
    id: "N09",
    name: "Hidden Gate",
    jpName: "隠れた門",
    type: "hidden",
    state: "hidden",
    x: 7,
    y: 1,
    danger: 3,
    revealRequirement: "nono",
    description: "Tiny Light Bへ続く隠し中継点。"
  },
  {
    id: "N10",
    name: "Tiny Light B",
    jpName: "タイニーライトB",
    type: "tinyLight",
    state: "hidden",
    x: 8,
    y: 1,
    danger: 4,
    tinyLightTurnsRemaining: 6,
    rescued: false,
    revealRequirement: "nono",
    description: "高リスク高報酬のTiny Light。"
  },
  {
    id: "N11",
    name: "Memory Core",
    jpName: "メモリーコア",
    type: "memory",
    state: "locked",
    x: 8,
    y: 3,
    danger: 3,
    description: "ステージの最終目標。"
  },
  {
    id: "N12",
    name: "Empty Plaza",
    jpName: "空き広場",
    type: "empty",
    state: "unlinked",
    x: 4,
    y: 3,
    danger: 1,
    description: "中央の自由配置ノード。接続方針を選ぶ場所。"
  },
  {
    id: "N13",
    name: "Side Street",
    jpName: "脇道",
    type: "empty",
    state: "unlinked",
    x: 2,
    y: 5,
    danger: 1,
    description: "下側ルートへの入口。"
  },
  {
    id: "N14",
    name: "Dry Fountain",
    jpName: "枯れた噴水",
    type: "empty",
    state: "unlinked",
    x: 3,
    y: 2,
    danger: 1,
    description: "上側修復ルートの待機地点。"
  },
  {
    id: "N15",
    name: "Clock Roof",
    jpName: "時計の屋根",
    type: "anchor",
    state: "unlinked",
    x: 4,
    y: 0.5,
    danger: 2,
    description: "Tiny Light Aの手前にある観測点。"
  },
  {
    id: "N16",
    name: "Signal Pole",
    jpName: "信号ポール",
    type: "anchor",
    state: "unlinked",
    x: 6,
    y: 1,
    danger: 2,
    description: "右上点線ルートの中継点。"
  },
  {
    id: "N17",
    name: "Service Stairs",
    jpName: "点検階段",
    type: "empty",
    state: "unlinked",
    x: 5,
    y: 5,
    danger: 2,
    description: "中央と下側裏道をつなぐ階段。"
  },
  {
    id: "N18",
    name: "Rooftop Step",
    jpName: "屋上の足場",
    type: "hidden",
    state: "hidden",
    x: 7,
    y: 5,
    danger: 3,
    revealRequirement: "nono",
    description: "Memory Core周辺へ近づける隠し足場。"
  }
];
```

---

## 11. リンク一覧

### Edge データ

```ts
export const field01Edges: FieldEdge[] = [
  { id: "E00", from: "N00", to: "N01", state: "stable" },
  { id: "E01", from: "N01", to: "N02", state: "weak" },
  { id: "E02", from: "N02", to: "N13", state: "dotted" },
  { id: "E03", from: "N13", to: "N03", state: "dotted" },
  { id: "E04", from: "N03", to: "N04", state: "weak" },

  { id: "E05", from: "N01", to: "N14", state: "dotted" },
  { id: "E06", from: "N14", to: "N05", state: "broken", repairRequirement: "gear" },
  { id: "E07", from: "N05", to: "N15", state: "dotted" },
  { id: "E08", from: "N15", to: "N08", state: "weak" },

  { id: "E09", from: "N01", to: "N12", state: "dotted" },
  { id: "E10", from: "N12", to: "N06", state: "dotted" },
  { id: "E11", from: "N06", to: "N11", state: "broken", repairRequirement: "gear" },

  { id: "E12", from: "N12", to: "N17", state: "dotted" },
  { id: "E13", from: "N17", to: "N07", state: "hidden", revealRequirement: "nono" },
  { id: "E14", from: "N03", to: "N07", state: "hidden", revealRequirement: "nono" },
  { id: "E15", from: "N17", to: "N18", state: "hidden", revealRequirement: "nono" },
  { id: "E16", from: "N18", to: "N06", state: "hidden", revealRequirement: "nono" },

  { id: "E17", from: "N05", to: "N16", state: "dotted" },
  { id: "E18", from: "N16", to: "N09", state: "hidden", revealRequirement: "nono" },
  { id: "E19", from: "N09", to: "N10", state: "hidden", revealRequirement: "nono" },
  { id: "E20", from: "N10", to: "N11", state: "hidden", revealRequirement: "nono" },
  { id: "E21", from: "N16", to: "N06", state: "dotted" }
];
```

---

## 12. リンク状態ルール

### Stable

```txt
移動可能
孤立リスクなし
Link Density上昇
敵通過時にWeak化
```

### Weak

```txt
移動可能
孤立リスク低
敵通過時にBroken化
ConnectでStable化できる
```

### Broken

```txt
原則移動不可
RepairでWeak化
ギアならRepair可能
```

### Dotted

```txt
存在は見えている
通常移動不可
ScanまたはConnectで状態確定
ルミならConnectでWeak化しやすい
ギアならTemporary化しやすい
```

### Hidden

```txt
初期はほぼ不可視
ノノまたはScanで発見
発見後はDottedまたはWeakになる
```

### Temporary

```txt
移動可能
2〜3ターンで消える
ギアの仮設線、ピコの仮ビーコン、ノノの裏道で発生
```

---

## 13. キャラ初期値

```ts
export const initialCharacters: CharacterUnit[] = [
  {
    id: "lumi",
    name: "Lumi",
    jpName: "ルミ",
    role: "新しい道を伸ばす先導者",
    currentNodeId: "N00",
    integrity: 84,
    link: 92,
    buddyName: "Pico",
    status: "normal",
    actionsUsedThisTurn: false
  },
  {
    id: "gear",
    name: "Gear",
    jpName: "ギア",
    role: "壊れた道を直す修理役",
    currentNodeId: "N00",
    integrity: 96,
    link: 78,
    buddyName: "Patchi",
    status: "normal",
    actionsUsedThisTurn: false
  },
  {
    id: "mame",
    name: "Mame",
    jpName: "マメ",
    role: "帰れる場所を守る防衛役",
    currentNodeId: "N00",
    integrity: 76,
    link: 85,
    buddyName: "Pokke",
    status: "normal",
    actionsUsedThisTurn: false
  },
  {
    id: "nono",
    name: "Nono",
    jpName: "ノノ",
    role: "裏道を見つける単騎斥候",
    currentNodeId: "N00",
    integrity: 70,
    link: 88,
    buddyName: "Bug",
    status: "normal",
    actionsUsedThisTurn: false
  }
];
```

---

## 14. アクション仕様

## Move

### 条件

- 選択キャラが未行動
- 現在Nodeと移動先NodeがEdgeで接続されている
- Edge状態が `stable` / `weak` / `temporary`
- Hidden Routeの場合、発見済みである

### 効果

```txt
キャラを移動先Nodeへ移す
actionsUsedThisTurn = true
孤立判定を更新
```

### 例外

ノノは、発見済みHidden Route上なら一部Dottedを移動できる。

---

## Connect

### 主担当

ルミ

### 条件

- 現在Nodeに隣接するEdgeが `dotted` または `weak`
- 選択キャラが未行動

### 効果

```txt
ルミ：Dotted → Weak、Weak → Stable
その他：Dotted → Weakのみ。成功率低め
```

MVPでは成功率を使わず、キャラ別で確定処理でもよい。

---

## Repair

### 主担当

ギア

### 条件

- 現在Nodeまたは隣接Edgeが `broken`
- 選択キャラがギア
- 未行動

### 効果

```txt
Broken Node → Weak
Broken Edge → Weak
```

### ギア以外

MVPでは不可。

---

## Safe Place

### 主担当

マメ

### 条件

- 選択キャラがマメ
- 現在Nodeが `safeSpot` または `empty`
- 未行動

### 効果

```txt
現在Nodeに safePlace タグを付与
周辺1距離の孤立リスク軽減
Split後の味方に1ターン保護
Tiny Light Cの猶予 +1
```

---

## Scan

### 主担当

ノノ

### 条件

- 選択キャラがノノ
- 未行動

### 効果

```txt
隣接Hidden EdgeをDottedにする
隣接Hidden NodeをUnlinkedまたはWeakとして表示する
敵のBurst危険圏を1ターン表示する
```

### 通常キャラのScan

通常キャラもScan可能だが、発見範囲は現在Nodeのみ。 ノノは隣接Nodeまで見る。

---

## Sync

### 条件

- 同じNodeに2人以上いる
- そのNodeが `stable` / `weak` / `safePlace`
- 対象キャラが未行動でも行動済みでも可

### 効果

```txt
Sync Groupを作成
対象キャラのstatus = synced
NodeのLink Density上昇
```

### MVP効果

```txt
2人Sync：そのNodeでのConnect / Repair / Memory Core安定化にボーナス
3人Sync：敵通過時のWeak化を1回防ぐ
```

---

## Split

### 条件

- Sync状態のキャラがいる

### 効果

```txt
Sync Groupを解除
同じNodeに全員残る
次ターンから別方向へ移動可能
```

### マメSafe Place効果

SplitしたNodeがSafe Placeなら、次ターンの孤立リスクを無視する。

---

## End Turn

### 処理順

```txt
1. 味方行動済みリセット
2. Temporary Edge残りターン減少
3. Tiny Light猶予減少
4. 敵AI行動
5. 敵通過によるNode/Edge状態変化
6. 孤立判定
7. イベント判定
8. 勝利/敗北判定
9. turn += 1
```

---

## 15. Link Density

### MVP計算

```ts
function calculateNodeLinkDensity(nodeId: string, state: GameState): number {
  const charactersHere = state.characters.filter(c => c.currentNodeId === nodeId).length;
  const stableEdges = state.edges.filter(
    e => (e.from === nodeId || e.to === nodeId) && e.state === "stable"
  ).length;
  const weakEdges = state.edges.filter(
    e => (e.from === nodeId || e.to === nodeId) && e.state === "weak"
  ).length;

  return Math.min(100, charactersHere * 25 + stableEdges * 20 + weakEdges * 10);
}
```

### 全体Link Density

```ts
function calculateGlobalLinkDensity(state: GameState): number {
  const connectedEdges = state.edges.filter(e => e.state === "stable" || e.state === "weak").length;
  return Math.round((connectedEdges / state.edges.length) * 100);
}
```

---

## 16. 孤立判定

### 孤立条件

キャラの現在NodeからCore Lanternまで、`stable` / `weak` / `temporary` Edgeで到達できない場合、孤立。

### 孤立効果

```txt
status = isolated
毎ターン link -10
Hunter Noiseの優先対象になる
Tiny Light救出時に危険イベントが発生しやすい
```

### 例外

```txt
Safe Place上では孤立ペナルティなし
Sync中は孤立ペナルティ半減
ノノは孤立ペナルティ開始が1ターン遅れる
```

---

## 17. Tiny Light仕様

### 対象

```txt
N04 Tiny Light C：猶予10
N08 Tiny Light A：猶予8
N10 Tiny Light B：猶予6
```

### 救出条件

キャラがTiny Light Nodeにいる状態で、`Rescue` 相当の処理を実行する。 MVPではTiny Light Nodeに到達した時点で自動救出でもよい。

### 救出効果

```txt
Tiny Light C：Core Lantern安定度 +1
Tiny Light A：N05 Broken Relayが再Broken化しにくくなる
Tiny Light B：Memory Core安定化条件が緩和される
```

### 消失

```txt
tinyLightTurnsRemaining が0になると消失
消失数が2以上で敗北
```

---

## 18. 敵仕様

## E01 Sweep Noise

### 初期位置

```txt
N05 Broken Relay
```

### 固定ルート

```txt
N05 → N14 → N01 → N12 → N06 → N11
```

### 行動

毎ターン1Node進む。 通過したNodeまたはEdgeを弱体化する。

```txt
Stable → Weak
Weak → Broken
Unlinked → Broken
```

### 役割

中央ルートに圧をかける。 プレイヤーに「正面で受けるか、通り過ぎた後ろを直すか」を選ばせる。

---

## E02 Hunter Noise

### 初期位置

```txt
N10 Tiny Light B付近
```

### 認知状態

```txt
unaware → suspicious → alert → pursuit
```

### Suspicious条件

```txt
ノノが N09 / N10 / N16 / N18 に入る
Hidden Routeが発見される
Tiny Light Bが救出される
```

### Alert条件

```txt
Suspicious状態で、次ターンもノノが危険圏内にいる
```

### Burst Move

Alert状態では2Node移動。

候補。

```txt
N10 → N09 → N16
N10 → N11 → N06
N10 → N18 → N17
```

### 捕捉

Hunter Noiseと孤立したノノが同じNodeになると捕捉。 MVPでは以下のどちらか。

```txt
A. 即敗北
B. ノノ強制撤退、Tiny Light B救出不可になる
```

おすすめはB。最初のFieldとしては厳しすぎない。

---

## E03 Lock Node

### 初期位置

```txt
N11 Memory Core
```

### 行動

動かない。 毎ターン、N11に接続するEdgeを弱体化しようとする。

### 解除条件

Memory Core安定化条件を満たす。

---

## 19. イベント仕様

## StoryScene

### 内容

名前を失った街から、短い信号が届く。

```txt
ルミ「……聞こえる。誰かが、まだ呼んでる」
ギア「座標は出せる。でも街の名前が空白だ」
マメ「名前がない街って、帰る場所を忘れたみたいだね」
ノノ「……消えてない。隠れてるだけ」
```

---

## BriefingScene

### 内容

作戦会議。

```txt
ギア「中央のRelayはまだ生きてる。でも右側は線が切れてる」
マメ「下の方に、休めそうな場所があるよ。そこを使えば戻れるかも」
ノノ「右上、道じゃない道がある。普通には見えないけど」
ルミ「じゃあ、中央をつなぎながら、消えかけた光も探そう」
```

---

## MidEvent 01：Old Sign到達

### 条件

```txt
いずれかの味方がN02に初到達
```

### 会話

```txt
ルミ「看板……かな？」
ギア「文字列が削られてる。物理破損じゃない。記録ごと抜かれてる」
マメ「名前がないと、帰ってくる場所も分からなくなるね」
```

### 効果

```txt
N13 Side Streetの接続候補を表示
Tiny Light Cの猶予 +1
```

---

## MidEvent 02：Sweep Noise始動

### 条件

```txt
Turn 4開始時
または N05 に誰かが近づく
```

### 会話

```txt
ギア「まずい、Noiseが中央線に乗った！」
マメ「N03まで戻れれば、立て直せるよ」
ノノ「……通り過ぎた後ろなら、行ける」
```

### 効果

```txt
Sweep Noiseが移動開始
N05→N14→N01の予測矢印を表示
```

---

## MidEvent 03：Signal Pole発見

### 条件

```txt
N16に到達、またはN16周辺をScan
```

### 会話

```txt
ノノ「ここ、まだ息してる」
ギア「信号ポールか。仮設線なら張れる」
ルミ「本接続する？ それとも先に右上を見る？」
```

### 効果

```txt
N09 Hidden Gateの存在を「？」として表示
```

---

## MidEvent 04：Tiny Light B発見

### 条件

```txt
N09を発見、またはノノがN10に隣接
```

### 会話

```txt
Tiny Light「……ここ、どこ……？」
ノノ「聞こえた」
ルミ「ノノ、戻れる道はある？」
ノノ「……たぶん。まだ、ある」
```

### 効果

```txt
Hunter Noiseがsuspiciousになる
N10の猶予表示開始
```

---

## ClearScene

### 条件

```txt
N11 Memory Core が Stable になる
```

### 演出

```txt
ルミがランタンを掲げる
ギアが端子を修理する
マメが足元を安定化する
ノノがHidden Route側から信号を返す
救出済みTiny Lightが光として戻る
```

---

## PostFieldTalkScene 差分

### Tiny Light 3つ救出

```txt
マメ「……よかった。ちゃんと、帰ってこられたね」
ノノ「右上の子、最後まで消えなかった」
ギア「街の名前の断片も戻ってる。完全じゃないけどな」
ルミ「完全じゃなくてもいいよ。呼べる名前が、ひとつ戻ったなら」
```

### Tiny Light 2つ救出

```txt
ギア「主要な接続は戻った。けど、まだ空白がある」
マメ「次は、もっと遠くまで迎えに行けるよ」
ルミ「うん。今日つないだ道は、次の誰かの帰り道になる」
```

### Tiny Light 1つ以下

```txt
ノノ「……間に合わなかった」
ルミ「でも、聞こえたよ。最後に、こっちを向いてくれた」
ギア「ログは少し残ってる。次は、もっと早く道を作れる」
```

---

## 20. Reducerアクション案

```ts
type GameAction =
  | { type: "SELECT_NODE"; nodeId: string }
  | { type: "SELECT_CHARACTER"; characterId: CharacterId }
  | { type: "MOVE"; characterId: CharacterId; toNodeId: string }
  | { type: "CONNECT"; characterId: CharacterId; edgeId: string }
  | { type: "REPAIR"; characterId: CharacterId; targetId: string }
  | { type: "SAFE_PLACE"; characterId: CharacterId }
  | { type: "SCAN"; characterId: CharacterId }
  | { type: "SYNC"; characterIds: CharacterId[] }
  | { type: "SPLIT"; groupId: string }
  | { type: "END_TURN" }
  | { type: "ADVANCE_DIALOGUE" }
  | { type: "TRIGGER_EVENT"; eventId: string };
```

---

## 21. GameState案

```ts
export type GameState = {
  scene: GameScene;
  turn: number;
  maxTurns: number;
  nodes: FieldNode[];
  edges: FieldEdge[];
  characters: CharacterUnit[];
  enemies: EnemyUnit[];
  selectedNodeId?: string;
  selectedCharacterId?: CharacterId;
  activeEventId?: string;
  completedEventIds: string[];
  rescuedTinyLights: string[];
  lostTinyLights: string[];
  syncGroups: SyncGroup[];
  log: GameLogEntry[];
  result?: "playing" | "clear" | "failed";
};

export type SyncGroup = {
  id: string;
  characterIds: CharacterId[];
  nodeId: string;
};

export type GameLogEntry = {
  turn: number;
  text: string;
  type: "system" | "dialogue" | "action" | "warning";
};
```

---

## 22. 実装ファイル構成

```txt
src/
  App.tsx
  main.tsx
  index.css

  data/
    field01.ts
    characters.ts
    enemies.ts
    dialogues.ts

  game/
    types.ts
    reducer.ts
    selectors.ts
    actions.ts
    enemyAI.ts
    events.ts
    pathfinding.ts

  components/
    Layout.tsx
    HeaderBar.tsx
    PartyPanel.tsx
    FieldMap.tsx
    FieldNodeView.tsx
    FieldEdgeView.tsx
    CharacterToken.tsx
    EnemyToken.tsx
    InfoPanel.tsx
    CommandBar.tsx
    DialogueBox.tsx
    ObjectivePanel.tsx
    GameLog.tsx
```

---

## 23. 実装順序

### Milestone 1：見るだけのField

- 19ノードを配置
- Edgeを状態別に描画
- NodeクリックでInfo Panel更新
- HeaderにTurnとObjective表示

### Milestone 2：キャラ移動

- 4人をN00に配置
- キャラ選択
- 移動可能Nodeハイライト
- Move実行

### Milestone 3：接続操作

- Connect
- Repair
- Safe Place
- Scan
- Edge / Node状態更新

### Milestone 4：ターン進行

- End Turn
- Tiny Light猶予減少
- Temporary Edge減少
- 孤立判定

### Milestone 5：敵AI

- Sweep Noise固定ルート
- Hunter Noise認知状態
- Burst危険圏表示

### Milestone 6：イベント

- StoryScene
- BriefingScene
- MidEvent 4種
- ClearScene
- PostFieldTalk差分

### Milestone 7：勝利/敗北

- Memory Core安定化
- Tiny Light消失敗北
- Turn制限
- Result表示

---

## 24. MVPで確認すること

### 1. 中央Syncは安心するか

N01 / N12 / N06 を固めると、ノイズに耐えやすく感じるか。

### 2. 固まりっぱなしだと遅いか

中央だけを進むと、Tiny Light BやAを逃しやすいか。

### 3. ノノ単騎は怖くて美味しいか

N16 / N09 / N10 を見つける喜びと、Hunter Noiseの怖さが両立するか。

### 4. マメのSafe Placeは帰り道になるか

N03 / N17 周辺が、分散作戦の支点として機能するか。

### 5. ギアのRepairは戦術を変えるか

N05 / N06-N11 を直す判断が、攻略ルートに影響するか。

### 6. Dotted Routeは探索欲を生むか

点線を見て「先につなぎたい」と思えるか。

---

## 25. 開発時の優先順位

最優先は、遊びの判断が出ること。

```txt
1. ノードをクリックしたくなる
2. どこへ移動するか迷う
3. どの線をつなぐか迷う
4. 誰を単騎で出すか迷う
5. どこで合流するか迷う
```

見た目の美しさは後でよい。

ただし、線の状態だけは最初から見分けやすくする。

```txt
Stable：明るい太線
Weak：細く揺れる線
Broken：赤茶/暗色の切れ線
Dotted：点線
Hidden：薄い疑問符または不可視
Temporary：点滅線
```

---

## 26. このプロトタイプの完成条件

Field 01プロトタイプは、次ができたら完成扱い。

```txt
会話からFieldに入れる
4人を動かせる
NodeとEdge状態を変えられる
Tiny Lightを救出できる
敵が動く
Memory Coreを安定化できる
結果に応じたクリア後会話が出る
もう一度遊び直したくなる
```

---

## 27. 一文まとめ

Reconnect Field 01 のReactプロトタイプは、LLP全体を作るための小さな完成品ではなく、**LLPがゲームとして面白いと証明するための1ステージ**である。

ここでプレイヤーに感じてほしいのは、これ。

> 光をつなぐことは、ただ線を引くことじゃない。\
> 誰をどこに立たせるかを決めることだ。

