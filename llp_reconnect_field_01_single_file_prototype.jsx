import React, { useMemo, useReducer } from "react";

// Little Lights Protocol
// Reconnect Field 01: 名前をなくした街
// Single-file React prototype

const W = 920;
const H = 620;

const nodeColors = {
  stable: "#6df7ff",
  weak: "#ffe98a",
  broken: "#ff7a65",
  unlinked: "#b7c5d9",
  dormant: "#9aa8b9",
  hidden: "#9d7bff",
  locked: "#d065ff",
};

const edgeStyles = {
  stable: { stroke: "#64f7ff", width: 4, dash: "" },
  weak: { stroke: "#ffe372", width: 3, dash: "8 7" },
  broken: { stroke: "#ff7a65", width: 3, dash: "10 8" },
  dotted: { stroke: "#d7c8ff", width: 3, dash: "2 9" },
  hidden: { stroke: "#7868aa", width: 2, dash: "2 13" },
  temporary: { stroke: "#9fffc8", width: 3, dash: "12 6" },
};

const initialNodes = [
  { id: "N00", name: "Core Lantern", jp: "コア・ランタン", type: "core", state: "stable", x: 70, y: 305, danger: 0, desc: "味方の初期拠点。Lightlineの起点。" },
  { id: "N01", name: "Central Relay", jp: "中央リレー", type: "relay", state: "weak", x: 245, y: 315, danger: 1, desc: "最初に再接続する中継点。" },
  { id: "N02", name: "Old Sign", jp: "古い看板", type: "memory", state: "weak", x: 235, y: 405, danger: 1, desc: "街の名前が削られた看板跡。" },
  { id: "N03", name: "Safe Spot Ruins", jp: "安全地帯の廃墟", type: "safeSpot", state: "dormant", x: 350, y: 485, danger: 1, desc: "マメがSafe Place化できる廃墟。" },
  { id: "N04", name: "Tiny Light C", jp: "タイニーライトC", type: "tinyLight", state: "weak", x: 350, y: 570, danger: 1, turns: 10, rescued: false, desc: "最も救出しやすいTiny Light。" },
  { id: "N05", name: "Broken Relay", jp: "壊れたリレー", type: "brokenRelay", state: "broken", x: 455, y: 125, danger: 2, desc: "ギアの修理対象。上側ルートの要。" },
  { id: "N06", name: "Weak Relay", jp: "弱ったリレー", type: "relay", state: "weak", x: 625, y: 315, danger: 2, desc: "Memory Core手前の重要中継点。" },
  { id: "N07", name: "Back Alley", jp: "裏路地", type: "hidden", state: "hidden", x: 520, y: 555, danger: 2, desc: "ノノが見つけられる裏道。" },
  { id: "N08", name: "Tiny Light A", jp: "タイニーライトA", type: "tinyLight", state: "weak", x: 465, y: 45, danger: 2, turns: 8, rescued: false, desc: "Broken Relay修復後に救出しやすいTiny Light。" },
  { id: "N09", name: "Hidden Gate", jp: "隠れた門", type: "hidden", state: "hidden", x: 690, y: 125, danger: 3, desc: "Tiny Light Bへ続く隠し中継点。" },
  { id: "N10", name: "Tiny Light B", jp: "タイニーライトB", type: "tinyLight", state: "hidden", x: 815, y: 105, danger: 4, turns: 6, rescued: false, desc: "高リスク高報酬のTiny Light。" },
  { id: "N11", name: "Memory Core", jp: "メモリーコア", type: "memory", state: "locked", x: 835, y: 335, danger: 3, desc: "ステージの最終目標。" },
  { id: "N12", name: "Empty Plaza", jp: "空き広場", type: "empty", state: "unlinked", x: 430, y: 315, danger: 1, desc: "中央の自由配置ノード。接続方針を選ぶ場所。" },
  { id: "N13", name: "Side Street", jp: "脇道", type: "empty", state: "unlinked", x: 245, y: 505, danger: 1, desc: "下側ルートへの入口。" },
  { id: "N14", name: "Dry Fountain", jp: "枯れた噴水", type: "empty", state: "unlinked", x: 340, y: 215, danger: 1, desc: "上側修復ルートの待機地点。" },
  { id: "N15", name: "Clock Roof", jp: "時計の屋根", type: "anchor", state: "unlinked", x: 455, y: 82, danger: 2, desc: "Tiny Light Aの手前にある観測点。" },
  { id: "N16", name: "Signal Pole", jp: "信号ポール", type: "anchor", state: "unlinked", x: 600, y: 135, danger: 2, desc: "右上点線ルートの中継点。" },
  { id: "N17", name: "Service Stairs", jp: "点検階段", type: "empty", state: "unlinked", x: 520, y: 470, danger: 2, desc: "中央と下側裏道をつなぐ階段。" },
  { id: "N18", name: "Rooftop Step", jp: "屋上の足場", type: "hidden", state: "hidden", x: 705, y: 485, danger: 3, desc: "Memory Core周辺へ近づける隠し足場。" },
];

const initialEdges = [
  ["E00", "N00", "N01", "stable"], ["E01", "N01", "N02", "weak"], ["E02", "N02", "N13", "dotted"], ["E03", "N13", "N03", "dotted"], ["E04", "N03", "N04", "weak"],
  ["E05", "N01", "N14", "dotted"], ["E06", "N14", "N05", "broken"], ["E07", "N05", "N15", "dotted"], ["E08", "N15", "N08", "weak"],
  ["E09", "N01", "N12", "dotted"], ["E10", "N12", "N06", "dotted"], ["E11", "N06", "N11", "broken"],
  ["E12", "N12", "N17", "dotted"], ["E13", "N17", "N07", "hidden"], ["E14", "N03", "N07", "hidden"], ["E15", "N17", "N18", "hidden"], ["E16", "N18", "N06", "hidden"],
  ["E17", "N05", "N16", "dotted"], ["E18", "N16", "N09", "hidden"], ["E19", "N09", "N10", "hidden"], ["E20", "N10", "N11", "hidden"], ["E21", "N16", "N06", "dotted"],
].map(([id, from, to, state]) => ({ id, from, to, state, temp: 0 }));

const initialChars = [
  { id: "lumi", name: "Lumi", jp: "ルミ", buddy: "Pico", icon: "✦", role: "道を伸ばす", node: "N00", link: 92, hp: 84, used: false, color: "#ffe27a", status: "normal" },
  { id: "gear", name: "Gear", jp: "ギア", buddy: "Patchi", icon: "⚙", role: "道を直す", node: "N00", link: 78, hp: 96, used: false, color: "#79d7ff", status: "normal" },
  { id: "mame", name: "Mame", jp: "マメ", buddy: "Pokke", icon: "⌂", role: "場所を守る", node: "N00", link: 85, hp: 76, used: false, color: "#9ee884", status: "normal" },
  { id: "nono", name: "Nono", jp: "ノノ", buddy: "Bug", icon: "◌", role: "裏道を探す", node: "N00", link: 88, hp: 70, used: false, color: "#bb93ff", status: "normal" },
];

const story = [
  { speaker: "ルミ", text: "……聞こえる。誰かが、まだ呼んでる。" },
  { speaker: "ギア", text: "座標は出せる。でも街の名前が空白だ。" },
  { speaker: "マメ", text: "名前がない街って、帰る場所を忘れたみたいだね。" },
  { speaker: "ノノ", text: "……消えてない。隠れてるだけ。" },
];

const briefing = [
  { speaker: "ギア", text: "中央のRelayはまだ生きてる。でも右側は線が切れてる。" },
  { speaker: "マメ", text: "下の方に、休めそうな場所があるよ。そこを使えば戻れるかも。" },
  { speaker: "ノノ", text: "右上、道じゃない道がある。普通には見えないけど。" },
  { speaker: "ルミ", text: "じゃあ、中央をつなぎながら、消えかけた光も探そう。" },
];

const eventText = {
  oldSign: [
    { speaker: "ルミ", text: "看板……かな？" },
    { speaker: "ギア", text: "文字列が削られてる。物理破損じゃない。記録ごと抜かれてる。" },
    { speaker: "マメ", text: "名前がないと、帰ってくる場所も分からなくなるね。" },
  ],
  sweep: [
    { speaker: "ギア", text: "まずい、Noiseが中央線に乗った！" },
    { speaker: "マメ", text: "N03まで戻れれば、立て直せるよ。" },
    { speaker: "ノノ", text: "……通り過ぎた後ろなら、行ける。" },
  ],
  signal: [
    { speaker: "ノノ", text: "ここ、まだ息してる。" },
    { speaker: "ギア", text: "信号ポールか。仮設線なら張れる。" },
    { speaker: "ルミ", text: "本接続する？ それとも先に右上を見る？" },
  ],
  tinyB: [
    { speaker: "Tiny Light", text: "……ここ、どこ……？" },
    { speaker: "ノノ", text: "聞こえた。" },
    { speaker: "ルミ", text: "ノノ、戻れる道はある？" },
    { speaker: "ノノ", text: "……たぶん。まだ、ある。" },
  ],
};

function init() {
  return {
    scene: "story",
    dialogIndex: 0,
    activeDialog: story,
    turn: 1,
    maxTurn: 20,
    nodes: initialNodes,
    edges: initialEdges,
    chars: initialChars,
    selectedChar: "lumi",
    selectedNode: "N00",
    sync: [],
    events: [],
    rescued: [],
    lost: [],
    result: "playing",
    log: ["Field 01 prototype initialized."],
    enemies: [
      { id: "sweep", name: "Sweep Noise", node: "N05", route: ["N05", "N14", "N01", "N12", "N06", "N11"], index: 0, active: false },
      { id: "hunter", name: "Hunter Noise", node: "N10", awareness: "unaware", burst: false },
    ],
  };
}

function other(edge, nodeId) { return edge.from === nodeId ? edge.to : edge.from; }
function findNode(state, id) { return state.nodes.find(n => n.id === id); }
function findChar(state, id) { return state.chars.find(c => c.id === id); }
function passable(e) { return ["stable", "weak", "temporary"].includes(e.state); }
function visibleEdge(e) { return e.state !== "hidden" || true; }
function edgeBetween(state, a, b) { return state.edges.find(e => (e.from === a && e.to === b) || (e.from === b && e.to === a)); }
function adjacentEdges(state, nodeId) { return state.edges.filter(e => e.from === nodeId || e.to === nodeId); }
function connectedToCore(state, start) {
  const seen = new Set([start]);
  const q = [start];
  while (q.length) {
    const n = q.shift();
    if (n === "N00") return true;
    adjacentEdges(state, n).forEach(e => {
      const to = other(e, n);
      if (passable(e) && !seen.has(to)) { seen.add(to); q.push(to); }
    });
  }
  return false;
}
function globalDensity(state) {
  const on = state.edges.filter(e => ["stable", "weak", "temporary"].includes(e.state)).length;
  return Math.round((on / state.edges.length) * 100);
}
function rescueIfNeeded(state, char) {
  const node = findNode(state, char.node);
  if (!node || node.type !== "tinyLight" || node.rescued || node.state === "hidden") return state;
  return {
    ...state,
    nodes: state.nodes.map(n => n.id === node.id ? { ...n, rescued: true, state: "stable" } : n),
    rescued: state.rescued.includes(node.id) ? state.rescued : [...state.rescued, node.id],
    log: [`${node.name} を救出した。`, ...state.log].slice(0, 8),
  };
}
function weaken(s) {
  if (s === "stable") return "weak";
  if (s === "weak" || s === "unlinked") return "broken";
  return s;
}
function checkEvents(state) {
  let s = state;
  const charsAt = id => s.chars.some(c => c.node === id);
  const addEvent = (id, dialog) => {
    if (!s.events.includes(id)) {
      s = { ...s, scene: "event", activeDialog: dialog, dialogIndex: 0, events: [...s.events, id] };
    }
  };
  if (charsAt("N02")) addEvent("oldSign", eventText.oldSign);
  if (s.turn >= 4 && !s.events.includes("sweep")) {
    s = { ...s, enemies: s.enemies.map(e => e.id === "sweep" ? { ...e, active: true } : e) };
    addEvent("sweep", eventText.sweep);
  }
  if (charsAt("N16")) addEvent("signal", eventText.signal);
  if ((charsAt("N09") || charsAt("N10")) && !s.events.includes("tinyB")) {
    s = { ...s, enemies: s.enemies.map(e => e.id === "hunter" ? { ...e, awareness: "suspicious" } : e) };
    addEvent("tinyB", eventText.tinyB);
  }
  return s;
}
function checkWinLose(state) {
  const n11 = findNode(state, "N11");
  const core = findNode(state, "N00");
  if (n11?.state === "stable") return { ...state, result: "clear", scene: "clear", activeDialog: clearDialog(state), dialogIndex: 0 };
  if (state.turn > state.maxTurn || state.lost.length >= 2 || core?.state === "broken") {
    return { ...state, result: "failed", scene: "clear", activeDialog: failDialog(state), dialogIndex: 0 };
  }
  return state;
}
function clearDialog(state) {
  if (state.rescued.length >= 3) return [
    { speaker: "マメ", text: "……よかった。ちゃんと、帰ってこられたね。" },
    { speaker: "ノノ", text: "右上の子、最後まで消えなかった。" },
    { speaker: "ギア", text: "街の名前の断片も戻ってる。完全じゃないけどな。" },
    { speaker: "ルミ", text: "完全じゃなくてもいいよ。呼べる名前が、ひとつ戻ったなら。" },
  ];
  if (state.rescued.length >= 2) return [
    { speaker: "ギア", text: "主要な接続は戻った。けど、まだ空白がある。" },
    { speaker: "マメ", text: "次は、もっと遠くまで迎えに行けるよ。" },
    { speaker: "ルミ", text: "うん。今日つないだ道は、次の誰かの帰り道になる。" },
  ];
  return [
    { speaker: "ノノ", text: "……間に合わなかった光がある。" },
    { speaker: "ルミ", text: "でも、聞こえたよ。最後に、こっちを向いてくれた。" },
    { speaker: "ギア", text: "ログは少し残ってる。次は、もっと早く道を作れる。" },
  ];
}
function failDialog() {
  return [
    { speaker: "SYSTEM", text: "Reconnect failed. 街の信号は、まだノイズの中にある。" },
    { speaker: "ルミ", text: "もう一度、道を探そう。今度は違う順番で。" },
  ];
}

function reducer(state, action) {
  if (action.type === "RESET") return init();
  if (action.type === "NEXT_DIALOG") {
    const next = state.dialogIndex + 1;
    if (next < state.activeDialog.length) return { ...state, dialogIndex: next };
    if (state.scene === "story") return { ...state, scene: "briefing", activeDialog: briefing, dialogIndex: 0 };
    if (state.scene === "briefing") return { ...state, scene: "field", activeDialog: [], dialogIndex: 0 };
    if (state.scene === "event") return { ...state, scene: "field", activeDialog: [], dialogIndex: 0 };
    if (state.scene === "clear") return { ...state, scene: "result" };
  }
  if (state.scene !== "field") return state;
  if (action.type === "SELECT_CHAR") return { ...state, selectedChar: action.id, selectedNode: findChar(state, action.id)?.node || state.selectedNode };
  if (action.type === "SELECT_NODE") return { ...state, selectedNode: action.id };
  if (action.type === "MOVE") {
    const ch = findChar(state, state.selectedChar); if (!ch || ch.used) return state;
    const e = edgeBetween(state, ch.node, action.to); if (!e || !passable(e)) return state;
    let s = { ...state, chars: state.chars.map(c => c.id === ch.id ? { ...c, node: action.to, used: true } : c), selectedNode: action.to, log: [`${ch.jp} moved to ${action.to}.`, ...state.log].slice(0, 8) };
    s = rescueIfNeeded(s, { ...ch, node: action.to });
    return checkEvents(checkWinLose(s));
  }
  if (action.type === "CONNECT") {
    const ch = findChar(state, state.selectedChar); if (!ch || ch.used) return state;
    const edge = state.edges.find(e => e.id === action.edgeId); if (!edge) return state;
    if (![edge.from, edge.to].includes(ch.node)) return state;
    if (!["dotted", "weak", "temporary"].includes(edge.state)) return state;
    const nextState = ch.id === "lumi" ? (edge.state === "weak" ? "stable" : "weak") : (edge.state === "dotted" ? "weak" : edge.state);
    const s = { ...state, edges: state.edges.map(e => e.id === edge.id ? { ...e, state: nextState } : e), chars: state.chars.map(c => c.id === ch.id ? { ...c, used: true } : c), log: [`${ch.jp} connected ${edge.id}: ${edge.state} → ${nextState}.`, ...state.log].slice(0, 8) };
    return checkEvents(checkWinLose(s));
  }
  if (action.type === "REPAIR") {
    const ch = findChar(state, state.selectedChar); if (!ch || ch.id !== "gear" || ch.used) return state;
    const near = adjacentEdges(state, ch.node).find(e => e.state === "broken");
    const node = findNode(state, ch.node);
    let s = state;
    if (near) s = { ...state, edges: state.edges.map(e => e.id === near.id ? { ...e, state: "weak" } : e), log: [`ギア repaired ${near.id}.`, ...state.log].slice(0, 8) };
    else if (node?.state === "broken") s = { ...state, nodes: state.nodes.map(n => n.id === node.id ? { ...n, state: "weak" } : n), log: [`ギア repaired ${node.id}.`, ...state.log].slice(0, 8) };
    else return state;
    s = { ...s, chars: s.chars.map(c => c.id === ch.id ? { ...c, used: true } : c) };
    return checkEvents(checkWinLose(s));
  }
  if (action.type === "SAFE") {
    const ch = findChar(state, state.selectedChar); if (!ch || ch.id !== "mame" || ch.used) return state;
    const s = { ...state, nodes: state.nodes.map(n => n.id === ch.node ? { ...n, state: "stable", safe: true } : n), chars: state.chars.map(c => c.id === ch.id ? { ...c, used: true } : c), log: [`マメ created Safe Place at ${ch.node}.`, ...state.log].slice(0, 8) };
    return checkEvents(checkWinLose(s));
  }
  if (action.type === "SCAN") {
    const ch = findChar(state, state.selectedChar); if (!ch || ch.used) return state;
    const rangeNodes = new Set([ch.node, ...adjacentEdges(state, ch.node).map(e => other(e, ch.node))]);
    const s = { ...state,
      edges: state.edges.map(e => ([e.from, e.to].some(n => rangeNodes.has(n)) && e.state === "hidden") ? { ...e, state: "dotted" } : e),
      nodes: state.nodes.map(n => rangeNodes.has(n.id) && n.state === "hidden" ? { ...n, state: "unlinked" } : n),
      chars: state.chars.map(c => c.id === ch.id ? { ...c, used: true } : c),
      log: [`${ch.jp} scanned nearby hidden routes.`, ...state.log].slice(0, 8)
    };
    return checkEvents(checkWinLose(s));
  }
  if (action.type === "SYNC") {
    const selected = findChar(state, state.selectedChar); if (!selected) return state;
    const here = state.chars.filter(c => c.node === selected.node);
    if (here.length < 2) return state;
    return { ...state, sync: here.map(c => c.id), chars: state.chars.map(c => here.some(h => h.id === c.id) ? { ...c, status: "synced" } : c), log: [`${here.map(c => c.jp).join("+")} synced at ${selected.node}.`, ...state.log].slice(0, 8) };
  }
  if (action.type === "SPLIT") {
    return { ...state, sync: [], chars: state.chars.map(c => ({ ...c, status: c.status === "synced" ? "normal" : c.status })), log: ["Sync group split.", ...state.log].slice(0, 8) };
  }
  if (action.type === "END") {
    let s = { ...state };
    s = { ...s, chars: s.chars.map(c => ({ ...c, used: false })) };
    s = { ...s, nodes: s.nodes.map(n => {
      if (n.type === "tinyLight" && !n.rescued && n.state !== "hidden") {
        const t = Math.max(0, (n.turns ?? 0) - 1);
        return { ...n, turns: t };
      }
      return n;
    }) };
    const newlyLost = s.nodes.filter(n => n.type === "tinyLight" && !n.rescued && n.state !== "hidden" && n.turns === 0 && !s.lost.includes(n.id)).map(n => n.id);
    if (newlyLost.length) s = { ...s, lost: [...s.lost, ...newlyLost], log: [`${newlyLost.join(", ")} disappeared.`, ...s.log].slice(0, 8) };

    s = { ...s, enemies: s.enemies.map(enemy => {
      if (enemy.id === "sweep" && enemy.active) {
        const nextIndex = Math.min(enemy.index + 1, enemy.route.length - 1);
        return { ...enemy, index: nextIndex, node: enemy.route[nextIndex] };
      }
      if (enemy.id === "hunter") {
        const nono = s.chars.find(c => c.id === "nono");
        if (["N09", "N10", "N16", "N18"].includes(nono?.node || "")) {
          return { ...enemy, awareness: enemy.awareness === "unaware" ? "suspicious" : "alert", burst: enemy.awareness !== "unaware" };
        }
      }
      return enemy;
    }) };
    const sweep = s.enemies.find(e => e.id === "sweep");
    if (sweep?.active) {
      s = { ...s,
        nodes: s.nodes.map(n => n.id === sweep.node ? { ...n, state: weaken(n.state) } : n),
        edges: s.edges.map(e => (e.from === sweep.node || e.to === sweep.node) && ["stable", "weak"].includes(e.state) ? { ...e, state: weaken(e.state) } : e)
      };
    }
    s = { ...s, chars: s.chars.map(c => ({ ...c, status: connectedToCore(s, c.node) ? (s.sync.includes(c.id) ? "synced" : "normal") : "isolated", link: connectedToCore(s, c.node) ? c.link : Math.max(0, c.link - 10) })) };
    s = { ...s, turn: s.turn + 1 };
    return checkEvents(checkWinLose(s));
  }
  return state;
}

export default function ReconnectField01Prototype() {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const selectedChar = findChar(state, state.selectedChar);
  const selectedNode = findNode(state, state.selectedNode);
  const moveTargets = useMemo(() => selectedChar ? adjacentEdges(state, selectedChar.node).filter(passable).map(e => other(e, selectedChar.node)) : [], [state, selectedChar]);
  const adjacentActionEdges = selectedChar ? adjacentEdges(state, selectedChar.node).filter(e => ["dotted", "weak", "temporary", "broken", "hidden"].includes(e.state)) : [];
  const density = globalDensity(state);
  const tiny = state.nodes.filter(n => n.type === "tinyLight");
  const dialog = state.activeDialog?.[state.dialogIndex];

  return <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
    <div className="mx-auto max-w-[1380px] grid grid-cols-[280px_1fr_310px] gap-4">
      <header className="col-span-3 rounded-2xl bg-slate-900/80 border border-cyan-400/20 p-4 flex items-center justify-between shadow-xl">
        <div>
          <div className="text-2xl font-bold tracking-wide">Reconnect Field 01</div>
          <div className="text-sm text-slate-300">名前をなくした街</div>
        </div>
        <div className="flex gap-6 items-center text-sm">
          <div>TURN <span className="text-2xl font-bold text-cyan-200">{state.turn}</span> / {state.maxTurn}</div>
          <div>Link Density <span className="text-xl font-bold text-cyan-200">{density}%</span></div>
          <div>救出 {state.rescued.length}/3 ・ 消失 {state.lost.length}/2</div>
          <button onClick={() => dispatch({ type: "RESET" })} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600">Reset</button>
        </div>
      </header>

      <aside className="rounded-2xl bg-slate-900/80 border border-slate-700 p-3 space-y-3">
        <div className="font-bold text-cyan-100">Party</div>
        {state.chars.map(c => <button key={c.id} onClick={() => dispatch({ type: "SELECT_CHAR", id: c.id })} className={`w-full text-left rounded-2xl p-3 border transition ${state.selectedChar === c.id ? "bg-cyan-900/35 border-cyan-300" : "bg-slate-800/70 border-slate-700 hover:bg-slate-800"}`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl grid place-items-center text-xl border" style={{ borderColor: c.color, color: c.color }}>{c.icon}</div>
            <div className="flex-1">
              <div className="font-bold">{c.jp} <span className="text-xs text-slate-400">{c.name}</span></div>
              <div className="text-xs text-slate-400">{c.role} / {c.buddy}</div>
            </div>
          </div>
          <div className="mt-2 text-xs flex justify-between"><span>{c.node}</span><span className={c.status === "isolated" ? "text-red-300" : c.status === "synced" ? "text-cyan-200" : "text-slate-300"}>{c.status}</span></div>
          <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden"><div className="h-full" style={{ width: `${c.link}%`, background: c.color }} /></div>
        </button>)}

        <div className="rounded-2xl bg-slate-800/70 p-3 border border-slate-700">
          <div className="font-bold text-sm mb-2">Objectives</div>
          <div className="text-xs leading-6 text-slate-300">✓ Memory CoreをStableにする</div>
          <div className="text-xs leading-6 text-slate-300">✓ Tiny Lightを2つ以上救出</div>
          <div className="text-xs leading-6 text-slate-300">Bonus: ノノ未発見でB救出</div>
        </div>
      </aside>

      <main className="rounded-2xl overflow-hidden border border-cyan-400/20 bg-slate-900/70 shadow-2xl relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[680px] block bg-[radial-gradient(circle_at_35%_30%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_75%_25%,rgba(168,85,247,0.15),transparent_22%),linear-gradient(180deg,#07111f,#111827)]">
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {state.edges.filter(visibleEdge).map(e => {
            const a = findNode(state, e.from), b = findNode(state, e.to); if (!a || !b) return null;
            const st = edgeStyles[e.state] || edgeStyles.dotted;
            return <g key={e.id}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={st.stroke} strokeWidth={st.width + 5} strokeOpacity="0.12" strokeDasharray={st.dash} />
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={st.stroke} strokeWidth={st.width} strokeDasharray={st.dash} filter="url(#glow)" opacity={e.state === "hidden" ? 0.45 : 0.95} />
            </g>;
          })}

          {state.nodes.map(n => {
            const charsHere = state.chars.filter(c => c.node === n.id);
            const enemiesHere = state.enemies.filter(e => e.node === n.id);
            const isSel = state.selectedNode === n.id;
            const canMove = moveTargets.includes(n.id);
            const color = nodeColors[n.state] || "#fff";
            return <g key={n.id} onClick={() => dispatch({ type: "SELECT_NODE", id: n.id })} className="cursor-pointer">
              {canMove && <circle cx={n.x} cy={n.y} r="34" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="5 7" opacity="0.8" />}
              {isSel && <circle cx={n.x} cy={n.y} r="42" fill="none" stroke="#67e8f9" strokeWidth="3" opacity="0.95" />}
              <circle cx={n.x} cy={n.y} r="24" fill="#111827" stroke={color} strokeWidth="3" filter="url(#glow)" />
              <circle cx={n.x} cy={n.y} r="12" fill={color} opacity={n.state === "hidden" ? 0.25 : 0.75} />
              {n.safe && <text x={n.x} y={n.y + 5} textAnchor="middle" fill="#052e16" fontSize="16" fontWeight="bold">⌂</text>}
              {n.state === "locked" && <text x={n.x} y={n.y + 6} textAnchor="middle" fill="#fff" fontSize="18">🔒</text>}
              {n.type === "tinyLight" && !n.rescued && <text x={n.x + 25} y={n.y - 18} fill="#ffe9a3" fontSize="12">{n.state !== "hidden" ? `${n.turns}T` : "?"}</text>}
              {n.rescued && <text x={n.x + 22} y={n.y - 18} fill="#a7f3d0" fontSize="14">✓</text>}
              <text x={n.x + 28} y={n.y - 2} fill="#e5e7eb" fontSize="13" fontWeight="bold">{n.id}</text>
              <text x={n.x + 28} y={n.y + 15} fill="#cbd5e1" fontSize="12">{n.name}</text>
              {charsHere.map((c, i) => <g key={c.id} onClick={(ev) => { ev.stopPropagation(); dispatch({ type: "SELECT_CHAR", id: c.id }); }}>
                <circle cx={n.x - 24 + i * 16} cy={n.y + 30} r="13" fill="#0f172a" stroke={c.color} strokeWidth="2" />
                <text x={n.x - 24 + i * 16} y={n.y + 35} textAnchor="middle" fill={c.color} fontSize="12">{c.icon}</text>
              </g>)}
              {enemiesHere.map((e, i) => <g key={e.id}>
                <circle cx={n.x + 28 + i * 16} cy={n.y + 31} r="12" fill="#2a0f18" stroke="#ff6b6b" strokeWidth="2" />
                <text x={n.x + 28 + i * 16} y={n.y + 35} textAnchor="middle" fill="#fecaca" fontSize="11">N</text>
              </g>)}
            </g>;
          })}
        </svg>

        <div className="absolute top-3 left-3 flex gap-2 text-xs">
          {Object.keys(edgeStyles).map(k => <span key={k} className="rounded-full bg-slate-950/70 border border-slate-700 px-2 py-1">{k}</span>)}
        </div>
      </main>

      <aside className="rounded-2xl bg-slate-900/80 border border-slate-700 p-4 space-y-4">
        <div>
          <div className="text-sm text-slate-400">選択中ノード</div>
          <div className="text-xl font-bold text-cyan-100">{selectedNode?.id} {selectedNode?.name}</div>
          <div className="text-sm text-slate-300">{selectedNode?.jp}</div>
          <div className="mt-2 text-xs leading-5 text-slate-400">状態: <span className="text-slate-100">{selectedNode?.state}</span> / 危険度 {selectedNode?.danger}</div>
          <p className="mt-2 text-sm text-slate-300">{selectedNode?.desc}</p>
        </div>
        <div>
          <div className="text-sm font-bold mb-2">接続候補</div>
          <div className="space-y-2 max-h-40 overflow-auto pr-1">
            {selectedNode && adjacentEdges(state, selectedNode.id).map(e => <button key={e.id} onClick={() => dispatch({ type: "CONNECT", edgeId: e.id })} className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 text-left text-xs">
              <div className="flex justify-between"><span>{e.id}: {e.from} - {e.to}</span><span>{e.state}</span></div>
            </button>)}
          </div>
        </div>
        <div>
          <div className="text-sm font-bold mb-2">選択中キャラ</div>
          <div className="rounded-2xl bg-slate-800 border border-slate-700 p-3">
            <div className="font-bold">{selectedChar?.jp} / {selectedChar?.name}</div>
            <div className="text-xs text-slate-400">{selectedChar?.role} / at {selectedChar?.node}</div>
            <div className="text-xs mt-1">行動: {selectedChar?.used ? "済" : "未"}</div>
          </div>
        </div>
        <div>
          <div className="text-sm font-bold mb-2">Log</div>
          <div className="space-y-1 text-xs text-slate-400 max-h-40 overflow-auto">
            {state.log.map((l, i) => <div key={i}>・{l}</div>)}
          </div>
        </div>
      </aside>

      <footer className="col-span-3 rounded-2xl bg-slate-900/80 border border-slate-700 p-3 flex gap-3 items-center justify-center flex-wrap">
        {moveTargets.map(id => <button key={id} onClick={() => dispatch({ type: "MOVE", to: id })} className="px-4 py-3 rounded-2xl bg-blue-900/70 hover:bg-blue-800 border border-blue-400/40">Move {id}</button>)}
        {adjacentActionEdges.filter(e => ["dotted", "weak", "temporary"].includes(e.state)).slice(0, 3).map(e => <button key={e.id} onClick={() => dispatch({ type: "CONNECT", edgeId: e.id })} className="px-4 py-3 rounded-2xl bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-400/40">Connect {e.id}</button>)}
        <button onClick={() => dispatch({ type: "REPAIR" })} className="px-4 py-3 rounded-2xl bg-orange-900/60 hover:bg-orange-800 border border-orange-400/40">Repair</button>
        <button onClick={() => dispatch({ type: "SAFE" })} className="px-4 py-3 rounded-2xl bg-green-900/60 hover:bg-green-800 border border-green-400/40">Safe Place</button>
        <button onClick={() => dispatch({ type: "SCAN" })} className="px-4 py-3 rounded-2xl bg-violet-900/60 hover:bg-violet-800 border border-violet-400/40">Scan</button>
        <button onClick={() => dispatch({ type: "SYNC" })} className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-500">Sync</button>
        <button onClick={() => dispatch({ type: "SPLIT" })} className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-500">Split</button>
        <button onClick={() => dispatch({ type: "END" })} className="ml-auto px-6 py-3 rounded-2xl bg-yellow-500/90 hover:bg-yellow-400 text-slate-950 font-bold">End Turn</button>
      </footer>
    </div>

    {state.scene !== "field" && state.scene !== "result" && dialog && <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm grid place-items-center p-6 z-50">
      <div className="max-w-2xl w-full rounded-3xl bg-slate-900 border border-cyan-300/30 shadow-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-cyan-200 mb-2">{state.scene === "story" ? "Story" : state.scene === "briefing" ? "Briefing" : state.scene === "event" ? "Field Event" : state.result === "clear" ? "Clear" : "Result"}</div>
        <div className="text-xl font-bold mb-3">{dialog.speaker}</div>
        <div className="text-lg leading-8 text-slate-100 min-h-[90px]">{dialog.text}</div>
        <button onClick={() => dispatch({ type: "NEXT_DIALOG" })} className="mt-6 w-full rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3">次へ</button>
      </div>
    </div>}

    {state.scene === "result" && <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-6 z-50">
      <div className="max-w-xl w-full rounded-3xl bg-slate-900 border border-yellow-300/30 shadow-2xl p-6 text-center">
        <div className="text-3xl font-bold mb-2">{state.result === "clear" ? "Reconnect Complete" : "Reconnect Failed"}</div>
        <div className="text-slate-300 mb-6">Tiny Light 救出 {state.rescued.length}/3 ・ 消失 {state.lost.length}/2 ・ Turn {state.turn}</div>
        <div className="text-5xl mb-6">{state.result === "clear" ? (state.rescued.length >= 3 ? "S" : state.rescued.length >= 2 ? "A" : "B") : "C"}</div>
        <button onClick={() => dispatch({ type: "RESET" })} className="rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-8 py-3">もう一度プレイ</button>
      </div>
    </div>}
  </div>;
}
