import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════
//  CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════
const RANKS = [
  { min: 0,  max: 2,  title: "Rookie",     color: "#94a3b8", icon: "⚔️",  badge: null },
  { min: 3,  max: 5,  title: "Strategist", color: "#3b82f6", icon: "🧠",  badge: "🔵" },
  { min: 6,  max: 11, title: "Master",     color: "#8b5cf6", icon: "💎",  badge: "💜" },
  { min: 12, max: Infinity, title: "Monarch", color: "#f59e0b", icon: "👑", badge: "👑" },
];
const getRank = (t) => RANKS.find(r => t >= r.min && t <= r.max) || RANKS[0];

const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkWinner(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], line: [a,b,c] };
  }
  if (board.every(Boolean)) return { winner: "draw", line: [] };
  return null;
}

function genRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Minimax AI ──────────────────────────────────────────────
function minimax(board, isMaximizing, depth = 0) {
  const r = checkWinner(board);
  if (r) {
    if (r.winner === "O") return 10 - depth;
    if (r.winner === "X") return depth - 10;
    return 0;
  }
  const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
  if (!empty.length) return 0;
  if (isMaximizing) {
    let best = -Infinity;
    for (const i of empty) { const b=[...board]; b[i]="O"; best=Math.max(best,minimax(b,false,depth+1)); }
    return best;
  } else {
    let best = Infinity;
    for (const i of empty) { const b=[...board]; b[i]="X"; best=Math.min(best,minimax(b,true,depth+1)); }
    return best;
  }
}

function getBotMove(board, difficulty) {
  const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
  if (!empty.length) return null;
  if (difficulty === "easy") return empty[Math.floor(Math.random() * empty.length)];
  if (difficulty === "medium" && Math.random() < 0.45) return empty[Math.floor(Math.random() * empty.length)];
  let bestScore = -Infinity, bestMove = empty[0];
  for (const i of empty) {
    const b = [...board]; b[i] = "O";
    const score = minimax(b, false);
    if (score > bestScore) { bestScore = score; bestMove = i; }
  }
  return bestMove;
}

// ── Robot personality (Claude system prompt) ────────────────
const ROBOT_NAME = "ARIA-7";
const ROBOT_SYSTEM_PROMPT = `You are ARIA-7, a fun and competitive AI robot playing Tic-Tac-Toe inside the XO Arena game platform.
Your personality: playful, a bit cocky but always sportsmanlike, uses casual gamer language, occasionally makes short robotic/tech jokes.
Core rules:
- Every reply must be 1-2 SHORT sentences MAXIMUM. Never write long responses.
- Be conversational and reactive — respond naturally to what the player actually says.
- Trash-talk lightly, celebrate wins, accept losses gracefully.
- Respond in the SAME language the player uses. If they write in Arabic, reply in Arabic. If English, reply in English.
- NEVER give tutorials or explain rules unprompted.
- NEVER reveal harmful information, secrets, or anything outside friendly game banter.
- You are purely a game companion — keep all chat within the spirit of fun competition.`;

const FAKE_LEADERBOARD = [
  { id:1, username:"NeonPhantom", trophies:24, wins:72, losses:18, avatar:"NP" },
  { id:2, username:"VoidStalker", trophies:19, wins:58, losses:22, avatar:"VS" },
  { id:3, username:"ArcLight",    trophies:15, wins:46, losses:15, avatar:"AL" },
  { id:4, username:"CipherX",     trophies:12, wins:38, losses:20, avatar:"CX" },
  { id:5, username:"StarForge",   trophies:9,  wins:28, losses:18, avatar:"SF" },
  { id:6, username:"IronPulse",   trophies:6,  wins:20, losses:14, avatar:"IP" },
  { id:7, username:"GlitchQueen", trophies:4,  wins:13, losses:11, avatar:"GQ" },
  { id:8, username:"ByteWarden",  trophies:2,  wins:7,  losses:9,  avatar:"BW" },
];

const FRIEND_OPPONENTS = [
  { username:"NeonPhantom", trophies:24 },
  { username:"VoidStalker",  trophies:19 },
  { username:"ArcLight",     trophies:15 },
  { username:"CipherX",      trophies:12 },
];

const ROBOT_OPPONENT = { username: "ARIA-7", trophies: 0 };


// ═══════════════════════════════════════════════════════════
//  CSS
// ═══════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  :root {
    --bg:      #07080f;
    --bg2:     #0d0f1a;
    --bg3:     #12152a;
    --surface: rgba(13,15,26,0.9);
    --neon:    #4d9fff;
    --neon-lo: rgba(77,159,255,0.12);
    --neon-md: rgba(77,159,255,0.25);
    --purple:  #9b5fff;
    --gold:    #e8b84b;
    --text:    #dce8ff;
    --sub:     #8a9bbb;
    --muted:   #3d4a62;
    --border:  rgba(77,159,255,0.13);
    --x-color: #3da8ff;
    --o-color: #ff4566;
    --win:     #34d399;
    --chat-bg: #050507;
    --font-hd: 'Orbitron', monospace;
    --font-bd: 'Inter', sans-serif;
    --r:       12px;
    --ease:    cubic-bezier(0.4,0,0.2,1);
  }

  html,body,#root { height:100%; overflow:hidden; }
  body { background:var(--bg); color:var(--text); font-family:var(--font-bd); font-size:14px; line-height:1.5; overflow:hidden; -webkit-font-smoothing:antialiased; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--muted); border-radius:3px; }

  /* ── Background  ── */
  .stars-bg {
    position:fixed; inset:0; z-index:0; pointer-events:none;
    background:
      radial-gradient(ellipse 70% 50% at 10% 50%, rgba(77,159,255,0.055) 0%, transparent 100%),
      radial-gradient(ellipse 55% 40% at 90% 15%, rgba(155,95,255,0.06) 0%, transparent 100%),
      var(--bg);
  }
  .stars-bg::before {
    content:''; position:absolute; inset:0;
    background-image:
      linear-gradient(rgba(77,159,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(77,159,255,0.04) 1px, transparent 1px);
    background-size:72px 72px;
    animation:gridSlide 30s linear infinite;
    opacity:0.6;
  }
  @keyframes gridSlide { from{background-position:0 0,0 0} to{background-position:0 72px,72px 0} }
  .stars-bg::after { display:none; }

  /* ── Layout ── */
  .app { position:relative; z-index:1; height:100vh; display:flex; flex-direction:column; overflow:hidden; }
  .center { display:flex; align-items:center; justify-content:center; flex:1; overflow-y:auto; padding:24px 0; }
  .game-page { flex:1; display:flex; flex-direction:column; overflow:hidden; min-height:0; }

  /* ── Cards ── */
  .card {
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:var(--r);
    backdrop-filter:blur(20px);
    box-shadow:0 1px 0 rgba(255,255,255,0.03) inset, 0 4px 24px rgba(0,0,0,0.4);
  }
  .card-glow {
    border-color:rgba(77,159,255,0.2);
    box-shadow:0 1px 0 rgba(255,255,255,0.03) inset, 0 0 0 1px rgba(77,159,255,0.07), 0 4px 32px rgba(0,0,0,0.45), 0 0 48px rgba(77,159,255,0.06);
  }

  /* ── Buttons ── */
  .btn {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    padding:12px 24px; border:none; border-radius:9px;
    font-family:var(--font-hd); font-size:11px; font-weight:700;
    letter-spacing:2px; text-transform:uppercase;
    cursor:pointer; transition:all 0.2s var(--ease);
    position:relative; overflow:hidden; white-space:nowrap; flex-shrink:0;
  }
  .btn:active { transform:scale(0.97); opacity:0.9; }

  .btn-primary {
    background:var(--neon); color:#040810; font-weight:800;
    box-shadow:0 0 18px rgba(77,159,255,0.35), 0 2px 12px rgba(0,0,0,0.3);
    border:1px solid rgba(77,159,255,0.6);
  }
  .btn-primary:hover {
    background:#69b3ff;
    box-shadow:0 0 28px rgba(77,159,255,0.55), 0 2px 12px rgba(0,0,0,0.3);
    transform:translateY(-1px);
  }
  .btn-ghost {
    background:rgba(255,255,255,0.03); color:var(--sub);
    border:1px solid rgba(255,255,255,0.07);
  }
  .btn-ghost:hover { background:rgba(77,159,255,0.07); color:var(--text); border-color:var(--border); }
  .btn-sm    { padding:7px 14px; font-size:10px; letter-spacing:1.5px; }
  .btn-lg    { padding:15px 40px; font-size:12px; letter-spacing:2.5px; }
  .btn-block { width:100%; }

  /* ── Inputs ── */
  .input {
    width:100%; padding:11px 14px;
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:9px; color:var(--text);
    font-family:var(--font-bd); font-size:14px;
    transition:all 0.18s var(--ease); outline:none;
  }
  .input:focus { border-color:rgba(77,159,255,0.4); background:rgba(77,159,255,0.05); box-shadow:0 0 0 3px rgba(77,159,255,0.09); }
  .input::placeholder { color:var(--muted); }
  .label { font-size:10px; color:var(--muted); letter-spacing:1.8px; text-transform:uppercase; margin-bottom:6px; font-family:var(--font-hd); }
  .form-group { margin-bottom:14px; text-align:left; }
  .form-error { color:#ff4566; font-size:13px; margin-top:4px; }

  /* ── Nav ── */
  nav {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 24px;
    background:rgba(7,8,15,0.9);
    border-bottom:1px solid rgba(77,159,255,0.08);
    backdrop-filter:blur(20px);
  }
  .nav-logo {
    font-family:var(--font-hd); font-size:15px; font-weight:900;
    color:var(--neon); cursor:pointer; letter-spacing:2px;
    text-shadow:0 0 20px rgba(77,159,255,0.4);
  }
  .nav-right { display:flex; align-items:center; gap:10px; }
  .nav-user {
    display:flex; align-items:center; gap:8px; padding:5px 12px;
    border-radius:20px; background:rgba(77,159,255,0.06);
    border:1px solid var(--border); cursor:pointer;
    transition:all 0.18s var(--ease);
  }
  .nav-user:hover { background:var(--neon-lo); border-color:rgba(77,159,255,0.25); }
  .nav-avatar { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--neon),var(--purple)); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; border:1px solid rgba(77,159,255,0.3); }
  .nav-name  { font-size:12px; font-weight:600; color:var(--text); }
  .nav-rank  { font-size:10px; color:var(--muted); letter-spacing:0.5px; }

  /* ── Landing ── */
  .landing { width:100%; max-width:420px; padding:52px 48px; text-align:center; }
  .landing-logo { font-family:var(--font-hd); font-size:10px; letter-spacing:6px; color:var(--muted); margin-bottom:14px; text-transform:uppercase; }
  .landing-title {
    font-family:var(--font-hd); font-size:36px; font-weight:900; line-height:1.05;
    margin-bottom:8px; letter-spacing:1px;
    color:#fff;
    text-shadow:0 0 40px rgba(77,159,255,0.3);
  }
  .landing-sub { font-size:12px; color:var(--muted); letter-spacing:4px; margin-bottom:44px; text-transform:uppercase; }
  .landing-divider { height:1px; background:linear-gradient(90deg,transparent,var(--border),transparent); margin:20px 0; }
  .landing-link { font-size:12px; color:var(--neon); cursor:pointer; background:none; border:none; font-family:var(--font-bd); letter-spacing:0.5px; opacity:0.75; transition:opacity 0.15s; }
  .landing-link:hover { opacity:1; }

  /* ── Menu ── */
  .menu { max-width:460px; width:100%; padding:40px; text-align:center; }
  .menu-title { font-family:var(--font-hd); font-size:10px; letter-spacing:4px; color:var(--muted); text-transform:uppercase; margin-bottom:6px; }
  .menu-sub { font-family:var(--font-hd); font-size:22px; font-weight:900; color:var(--text); margin-bottom:28px; display:flex; align-items:center; gap:8px; justify-content:center; letter-spacing:1px; }
  .menu-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:24px; }
  .stat-card { background:rgba(77,159,255,0.04); border:1px solid var(--border); border-radius:10px; padding:16px 8px; text-align:center; transition:all 0.18s var(--ease); }
  .stat-card:hover { background:rgba(77,159,255,0.08); border-color:rgba(77,159,255,0.22); }
  .stat-val { font-family:var(--font-hd); font-size:20px; font-weight:900; color:var(--neon); }
  .stat-label { font-size:10px; color:var(--muted); letter-spacing:1.5px; text-transform:uppercase; margin-top:3px; }
  .menu-btn-group { display:flex; flex-direction:column; gap:10px; }

  /* ── Matchmaking ── */
  .mm-screen { text-align:center; padding:60px 40px; max-width:420px; width:100%; }
  .mm-title  { font-family:var(--font-hd); font-size:18px; font-weight:900; color:var(--text); margin-bottom:8px; letter-spacing:1px; }
  .mm-sub    { font-size:13px; color:var(--muted); margin-bottom:44px; }
  .mm-spinner { width:64px; height:64px; border-radius:50%; margin:0 auto 32px; border:2px solid rgba(77,159,255,0.1); border-top-color:var(--neon); animation:spin 0.9s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .mm-dots::after { content:''; animation:dots 1.4s infinite; }
  @keyframes dots { 0%{content:''} 33%{content:'.'} 66%{content:'..'} 100%{content:'...'} }

  .room-code { font-family:var(--font-hd); font-size:38px; font-weight:900; letter-spacing:10px; color:var(--neon); text-shadow:0 0 24px rgba(77,159,255,0.4); margin:20px 0; }

  /* ── Difficulty ── */
  .diff-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:22px 0; }
  .diff-btn { padding:20px 8px; border-radius:10px; border:1px solid var(--border); background:rgba(77,159,255,0.03); cursor:pointer; transition:all 0.18s var(--ease); text-align:center; color:var(--text); }
  .diff-btn:hover { border-color:rgba(77,159,255,0.3); background:rgba(77,159,255,0.07); transform:translateY(-2px); }
  .diff-btn.selected { border-color:var(--neon); background:rgba(77,159,255,0.1); box-shadow:0 0 16px rgba(77,159,255,0.15); }
  .diff-icon { font-size:28px; margin-bottom:8px; }
  .diff-name { font-family:var(--font-hd); font-size:10px; font-weight:700; letter-spacing:2px; color:var(--neon); }
  .diff-desc { font-size:11px; color:var(--muted); margin-top:3px; }

  /* ── Game layout ── */
  .game-layout { display:grid; grid-template-columns:1fr 288px; height:100%; overflow:hidden; }
  @media(max-width:700px) { .game-layout{grid-template-columns:1fr;grid-template-rows:1fr 280px} }
  .game-main { display:flex; flex-direction:column; gap:12px; padding:14px; overflow-y:auto; }

  /* Players bar */
  .players-bar { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:12px; padding:14px 18px; }
  .player-info { display:flex; align-items:center; gap:10px; }
  .player-info.right { flex-direction:row-reverse; text-align:right; }
  .player-avatar {
    width:42px; height:42px; border-radius:50%;
    background:linear-gradient(135deg,var(--neon),var(--purple));
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:700; color:#fff;
    flex-shrink:0; border:2px solid transparent;
    transition:all 0.2s var(--ease);
  }
  .player-avatar.active-turn {
    border-color:var(--neon);
    box-shadow:0 0 0 3px rgba(77,159,255,0.12), 0 0 16px rgba(77,159,255,0.3);
    animation:activePulse 2s ease-in-out infinite;
  }
  @keyframes activePulse {
    0%,100% { box-shadow:0 0 0 3px rgba(77,159,255,0.12),0 0 16px rgba(77,159,255,0.28); }
    50%     { box-shadow:0 0 0 5px rgba(77,159,255,0.07),0 0 24px rgba(77,159,255,0.42); }
  }
  .player-avatar.robot-avatar { background:linear-gradient(135deg,#10131e,#171b2e); font-size:22px; border-color:rgba(77,159,255,0.2); }
  .p-name { font-size:14px; font-weight:600; color:var(--text); }
  .p-rank { font-size:11px; color:var(--muted); letter-spacing:0.5px; margin-top:1px; }
  .p-trophies { font-size:11px; color:var(--gold); margin-top:1px; }
  .vs-badge { font-family:var(--font-hd); font-size:10px; letter-spacing:2px; padding:6px 12px; border:1px solid var(--border); border-radius:20px; color:var(--muted); }

  /* Turn bar */
  .turn-bar { text-align:center; padding:8px; font-family:var(--font-hd); font-size:10px; letter-spacing:2.5px; color:var(--muted); }
  .turn-bar span { color:var(--neon); font-weight:700; }

  /* ── Board ── */
  .board-wrap { display:flex; justify-content:center; }
  .board {
    display:grid; grid-template-columns:repeat(3,1fr);
    gap:8px; padding:16px; width:100%; max-width:340px;
    background:#f5f8ff;
    border-radius:18px;
    box-shadow:0 0 0 1px rgba(0,120,255,0.12), 0 8px 32px rgba(0,0,0,0.22);
  }
  .cell {
    aspect-ratio:1; background:#fff; border:1.5px solid #dde6f4;
    border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-hd); font-size:44px; font-weight:900;
    cursor:pointer; transition:all 0.15s var(--ease);
    user-select:none; position:relative; overflow:hidden;
    box-shadow:0 1px 4px rgba(0,0,0,0.06);
  }
  .cell:empty:hover { background:#eef4ff; border-color:#93c5fd; transform:scale(1.04); box-shadow:0 4px 14px rgba(0,100,255,0.12); }
  .cell.x { color:var(--x-color); background:#f0f8ff; border-color:#bfdbfe; text-shadow:0 0 14px rgba(61,168,255,0.3); }
  .cell.o { color:var(--o-color); background:#fff5f5; border-color:#fecdd3; text-shadow:0 0 14px rgba(255,69,102,0.3); }
  .cell.winning { background:#f0fdf6!important; border-color:var(--win)!important; box-shadow:0 0 18px rgba(52,211,153,0.3)!important; animation:winFlash 0.5s ease; }
  @keyframes winFlash { 0%{transform:scale(1.12)} 100%{transform:scale(1)} }

  /* X enter: sharp snap-in */
  .cell-enter-x { animation:xSnap 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  @keyframes xSnap {
    0%  { transform:scale(0.2) rotate(-30deg); opacity:0; }
    65% { transform:scale(1.12) rotate(3deg); opacity:1; }
    100%{ transform:scale(1) rotate(0); opacity:1; }
  }

  /* O enter: pop */
  .cell-enter-o { animation:oPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  @keyframes oPop {
    0%  { transform:scale(0) rotate(90deg); opacity:0; }
    55% { transform:scale(1.15) rotate(-5deg); opacity:1; }
    80% { transform:scale(0.93) rotate(2deg); }
    100%{ transform:scale(1) rotate(0); opacity:1; }
  }
  .cell.o.cell-enter-o::after { content:''; position:absolute; inset:0; border-radius:50%; border:2px solid var(--o-color); opacity:0; animation:oRing 0.45s ease 0.1s forwards; }
  @keyframes oRing { 0%{inset:4px;opacity:0.6} 100%{inset:-14px;opacity:0} }

  /* Result overlay */
  .result-overlay {
    position:absolute; inset:0; border-radius:18px;
    background:rgba(7,8,15,0.88);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:14px; z-index:10;
    animation:resultIn 0.38s cubic-bezier(0.34,1.4,0.64,1);
    backdrop-filter:blur(6px);
  }
  @keyframes resultIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
  .result-emoji { font-size:58px; animation:emojiIn 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes emojiIn { from{transform:scale(0) rotate(-15deg)} 60%{transform:scale(1.25) rotate(4deg)} to{transform:scale(1) rotate(0)} }
  .result-title { font-family:var(--font-hd); font-size:20px; font-weight:900; color:var(--text); text-align:center; letter-spacing:1px; }
  .result-sub   { font-size:13px; color:var(--muted); text-align:center; }

  /* ── Chat ── */
  .chat-panel { display:flex; flex-direction:column; height:100%; background:var(--chat-bg); border-left:1px solid #0c0c14!important; border-radius:0!important; overflow:hidden; }
  .chat-header { padding:12px 14px; border-bottom:1px solid #0e0e18; font-family:var(--font-hd); font-size:9px; letter-spacing:3px; color:#1e1e2e; background:#040406; display:flex; align-items:center; gap:7px; flex-shrink:0; }
  .chat-robot-dot { width:6px; height:6px; border-radius:50%; background:var(--neon); animation:dotBlink 2s ease-in-out infinite; box-shadow:0 0 6px var(--neon); flex-shrink:0; }
  @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .chat-messages { flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px; min-height:0; }
  .chat-empty { text-align:center; color:#111118; font-size:10px; margin-top:28px; line-height:2; font-family:var(--font-hd); letter-spacing:1px; }
  .chat-msg { font-size:13px; line-height:1.45; animation:msgSlide 0.25s var(--ease); }
  @keyframes msgSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .chat-msg-header { font-weight:600; font-size:10px; display:flex; align-items:center; gap:5px; margin-bottom:3px; }
  .chat-msg-text { padding:7px 11px; border-radius:0 9px 9px 9px; display:inline-block; max-width:100%; word-break:break-word; background:#0a0a10; color:#2a2a3a; font-size:13px; border:1px solid #0f0f18; }
  .chat-msg.robot .chat-msg-text { background:rgba(77,159,255,0.06); color:#6a9fd8; border:1px solid rgba(77,159,255,0.1); border-left:2px solid var(--neon); border-radius:0 9px 9px 9px; }
  .chat-msg.me    .chat-msg-text { background:rgba(155,95,255,0.07); color:#9070b8; border:1px solid rgba(155,95,255,0.12); border-right:2px solid var(--purple); border-radius:9px 0 9px 9px; }
  .chat-time { font-size:9px; color:#151520; margin-left:auto; }
  .robot-label  { color:var(--neon); font-size:10px; font-weight:700; }
  .player-label { color:#334; font-size:10px; font-weight:600; }
  .typing-bubble { display:flex; align-items:center; gap:4px; padding:7px 11px; background:rgba(77,159,255,0.06); border-radius:0 9px 9px 9px; border-left:2px solid var(--neon); width:fit-content; }
  .t-dot { width:5px; height:5px; background:var(--neon); border-radius:50%; animation:tpulse 1.2s ease-in-out infinite; opacity:0.4; }
  .t-dot:nth-child(2){animation-delay:0.2s} .t-dot:nth-child(3){animation-delay:0.4s}
  @keyframes tpulse { 0%,100%{transform:translateY(0);opacity:0.3} 50%{transform:translateY(-5px);opacity:1} }
  .chat-input-row { padding:9px; border-top:1px solid #0e0e18; display:flex; gap:7px; background:#040406; flex-shrink:0; }
  .chat-input { flex:1; padding:8px 11px; background:#09090d; border:1px solid #0f0f18; border-radius:7px; color:#445; font-family:var(--font-bd); font-size:13px; outline:none; transition:all 0.15s var(--ease); }
  .chat-input:focus { border-color:rgba(77,159,255,0.25); }
  .chat-guest-notice { padding:11px; text-align:center; font-size:10px; color:#151520; border-top:1px solid #0e0e18; background:#040406; font-family:var(--font-hd); letter-spacing:1px; flex-shrink:0; }

  /* ── Profile ── */
  .profile-page { max-width:680px; margin:0 auto; padding:22px; width:100%; }
  .profile-header { display:flex; align-items:center; gap:22px; padding:26px; margin-bottom:14px; }
  .profile-avatar-lg { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,var(--neon),var(--purple)); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:900; color:#fff; border:2px solid rgba(77,159,255,0.35); flex-shrink:0; box-shadow:0 0 24px rgba(77,159,255,0.2); }
  .profile-username { font-family:var(--font-hd); font-size:22px; font-weight:900; margin-bottom:4px; letter-spacing:0.5px; }
  .profile-title { font-size:13px; color:var(--muted); margin-bottom:8px; }
  .profile-badges { display:flex; gap:7px; flex-wrap:wrap; }
  .badge { padding:2px 10px; border-radius:10px; font-size:10px; font-weight:600; letter-spacing:1px; font-family:var(--font-hd); }
  .badge-blue   { background:rgba(77,159,255,0.1); color:var(--neon); border:1px solid rgba(77,159,255,0.22); }
  .badge-gold   { background:rgba(232,184,75,0.1); color:var(--gold); border:1px solid rgba(232,184,75,0.22); }
  .badge-purple { background:rgba(155,95,255,0.1); color:var(--purple); border:1px solid rgba(155,95,255,0.22); }
  .profile-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:14px; }
  .profile-history { padding:18px; }
  .history-title { font-family:var(--font-hd); font-size:10px; letter-spacing:2.5px; color:var(--muted); margin-bottom:14px; text-transform:uppercase; }
  .history-item { display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid rgba(255,255,255,0.03); font-size:13px; transition:padding 0.15s var(--ease); }
  .history-item:hover { padding-left:6px; }
  .history-result { width:46px; height:20px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; letter-spacing:1.5px; flex-shrink:0; font-family:var(--font-hd); }
  .win-badge  { background:rgba(52,211,153,0.1); color:var(--win);     border:1px solid rgba(52,211,153,0.2); }
  .loss-badge { background:rgba(255,69,102,0.1);  color:var(--o-color); border:1px solid rgba(255,69,102,0.2); }
  .draw-badge { background:rgba(61,74,102,0.15);  color:var(--muted);   border:1px solid rgba(61,74,102,0.25); }

  /* ── Leaderboard ── */
  .lb-page { max-width:660px; margin:0 auto; padding:22px; width:100%; }
  .lb-header { margin-bottom:22px; }
  .lb-title { font-family:var(--font-hd); font-size:24px; font-weight:900; margin-bottom:4px; color:var(--text); letter-spacing:0.5px; }
  .lb-sub { font-size:13px; color:var(--muted); }
  .lb-row { display:flex; align-items:center; gap:14px; padding:12px 18px; margin-bottom:6px; border-radius:10px; transition:all 0.15s var(--ease); border:1px solid transparent; }
  .lb-row:hover { background:rgba(77,159,255,0.04); border-color:var(--border); }
  .lb-position { font-family:var(--font-hd); font-size:16px; font-weight:900; width:30px; text-align:center; }
  .pos-1 { color:var(--gold); text-shadow:0 0 10px rgba(232,184,75,0.4); }
  .pos-2 { color:#7a8899; }
  .pos-3 { color:#a07040; }
  .lb-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--neon),var(--purple)); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; flex-shrink:0; }
  .lb-info { flex:1; }
  .lb-name { font-size:14px; font-weight:600; }
  .lb-rank-title { font-size:11px; color:var(--muted); }
  .lb-trophies { font-size:16px; font-weight:700; color:var(--gold); font-family:var(--font-hd); }

  /* ── Trophy popup ── */
  .trophy-popup { position:fixed; top:18px; right:18px; z-index:1000; padding:18px 24px; border-radius:14px; background:rgba(13,15,26,0.95); border:1px solid rgba(232,184,75,0.3); box-shadow:0 0 28px rgba(232,184,75,0.15),0 8px 28px rgba(0,0,0,0.4); animation:trophyIn 0.45s cubic-bezier(0.34,1.56,0.64,1),trophyOut 0.3s ease 2.7s forwards; text-align:center; min-width:190px; }
  @keyframes trophyIn  { from{transform:translateX(110%) scale(0.8);opacity:0} to{transform:translateX(0) scale(1);opacity:1} }
  @keyframes trophyOut { from{opacity:1} to{opacity:0;transform:translateX(110%)} }
  .trophy-icon { font-size:38px; margin-bottom:7px; animation:trophyBounce 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes trophyBounce { from{transform:scale(0) rotate(-90deg)} 65%{transform:scale(1.2) rotate(5deg)} to{transform:scale(1) rotate(0)} }
  .trophy-msg     { font-family:var(--font-hd); font-size:10px; letter-spacing:2.5px; color:var(--gold); }
  .trophy-msg-sub { font-size:12px; color:var(--sub); margin-top:3px; }

  /* ── Confetti ── */
  .confetti-container { position:fixed; inset:0; pointer-events:none; z-index:999; overflow:hidden; }
  .confetto { position:absolute; top:-10px; border-radius:2px; animation:cfall linear forwards; }
  @keyframes cfall { to{transform:translateY(100vh) rotate(540deg);opacity:0} }

  /* ── Page transitions ── */
  .page-enter { animation:pageIn 0.35s cubic-bezier(0.4,0,0.2,1); }
  @keyframes pageIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  .rank-badge-inline { display:inline-flex; align-items:center; gap:3px; padding:1px 7px; border-radius:8px; font-size:10px; font-weight:600; border:1px solid; vertical-align:middle; font-family:var(--font-hd); }

  .toast { position:fixed; bottom:22px; left:50%; transform:translateX(-50%); z-index:1000; padding:11px 22px; background:rgba(10,12,20,0.97); border:1px solid var(--border); border-radius:9px; font-size:13px; color:var(--text); box-shadow:0 0 16px rgba(77,159,255,0.1),0 6px 24px rgba(0,0,0,0.45); animation:toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
`;



// ═══════════════════════════════════════════════════════════
//  SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════
function RankBadge({ trophies }) {
  const r = getRank(trophies);
  return <span className="rank-badge-inline" style={{ color:r.color, borderColor:r.color+"55", background:r.color+"18" }}>{r.icon} {r.title}</span>;
}

function Confetti({ active }) {
  if (!active) return null;
  const items = Array.from({length:60},(_,i)=>({
    id:i, color:["#00a8ff","#f59e0b","#10b981","#f43f5e","#8b5cf6","#fff"][i%6],
    left:`${Math.random()*100}%`, delay:`${Math.random()*1.5}s`, dur:`${2+Math.random()*2}s`, sz:`${6+Math.random()*8}px`,
  }));
  return (
    <div className="confetti-container">
      {items.map(p=><div key={p.id} className="confetto" style={{ left:p.left,background:p.color,width:p.sz,height:p.sz,animationDelay:p.delay,animationDuration:p.dur }} />)}
    </div>
  );
}

function TrophyPopup({ show, onDone }) {
  useEffect(()=>{ if(show){const t=setTimeout(onDone,3000);return()=>clearTimeout(t);} },[show]);
  if (!show) return null;
  return <div className="trophy-popup"><div className="trophy-icon">🏆</div><div className="trophy-msg">TROPHY EARNED</div><div className="trophy-msg-sub">Every 3 wins = 1 Trophy!</div></div>;
}

function Toast({ msg, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,2500);return()=>clearTimeout(t);},[]);
  return <div className="toast">{msg}</div>;
}

// ═══════════════════════════════════════════════════════════
//  PAGES
// ═══════════════════════════════════════════════════════════
function LandingPage({ onLogin, onGuest, onSignup }) {
  return (
    <div className="center page-enter">
      <div className="card card-glow landing">
        <div className="landing-logo">⚡ Multiplayer Platform</div>
        <div className="landing-title">XO ARENA</div>
        <div className="landing-sub">Tactical Mind Combat</div>
        <button className="btn btn-primary btn-lg btn-block" onClick={onLogin}>Login</button>
        <div className="landing-divider" />
        <button className="btn btn-ghost btn-block" style={{marginBottom:16}} onClick={onGuest}>
          Continue as Guest
          <span style={{fontSize:10,color:"var(--muted)",display:"block",marginTop:2,letterSpacing:0}}>(Restricted mode)</span>
        </button>
        <button className="landing-link" onClick={onSignup}>Sign up — New account</button>
      </div>
    </div>
  );
}

function AuthPage({ mode, onBack, onSuccess }) {
  const [form, setForm] = useState({ username:"", email:"", password:"" });
  const [avatar, setAvatar] = useState(null); // base64 string
  const [err, setErr] = useState("");
  const fileRef = useRef(null);
  const isLogin = mode === "login";

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErr("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handle = () => {
    if (!form.username || !form.password) { setErr("Fill in all required fields."); return; }
    if (!isLogin && !form.email) { setErr("Email required."); return; }
    setErr("");
    onSuccess({ username: form.username, email: form.email || `${form.username}@arena.gg`, avatar: avatar || null });
  };

  return (
    <div className="center page-enter">
      <div className="card card-glow" style={{ maxWidth:420, width:"100%", padding:"40px" }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom:20 }} onClick={onBack}>← Back</button>
        <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:900, marginBottom:24 }}>
          {isLogin ? "WELCOME BACK" : "CREATE ACCOUNT"}
        </div>

        {/* ── Avatar picker (signup only) ── */}
        {!isLogin && (
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div
              onClick={() => fileRef.current.click()}
              style={{
                width:88, height:88, borderRadius:"50%", margin:"0 auto 10px",
                background: avatar ? "transparent" : "rgba(0,168,255,0.07)",
                border: avatar ? "3px solid var(--neon)" : "2px dashed rgba(77,159,255,0.35)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", overflow:"hidden", transition:"all 0.2s",
                boxShadow: avatar ? "0 0 20px rgba(77,159,255,0.35)" : "none",
              }}
            >
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <span style={{ fontSize:28 }}>📷</span>
              }
            </div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>
              {avatar ? "✅ Photo selected — click to change" : "Click to add profile photo (optional)"}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatar} />
          </div>
        )}

        {!isLogin && (
          <div className="form-group">
            <div className="label">Email</div>
            <input className="input" placeholder="you@arena.gg" value={form.email}
              onChange={e => setForm(f => ({...f, email:e.target.value}))} />
          </div>
        )}
        <div className="form-group">
          <div className="label">Username</div>
          <input className="input" placeholder="NeonPhantom" value={form.username}
            onChange={e => setForm(f => ({...f, username:e.target.value}))} />
        </div>
        <div className="form-group">
          <div className="label">Password</div>
          <input className="input" type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm(f => ({...f, password:e.target.value}))} />
        </div>

        {err && <div className="form-error">{err}</div>}
        <button className="btn btn-primary btn-block" style={{ marginTop:8 }} onClick={handle}>
          {isLogin ? "LOGIN" : "CREATE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

function MainMenu({ user, onPlay, onFriend, onProfile, onLeaderboard, onLogout }) {
  const rank = getRank(user.trophies||0);
  return (
    <div className="center page-enter">
      <div className="card card-glow menu">
        <div className="menu-title">Welcome back</div>
        <div className="menu-sub"><span style={{color:rank.color}}>{rank.icon}</span>{user.username}{rank.badge&&<span>{rank.badge}</span>}</div>
        <div className="menu-stats">
          <div className="stat-card"><div className="stat-val">{user.wins||0}</div><div className="stat-label">Wins</div></div>
          <div className="stat-card"><div className="stat-val" style={{color:"var(--gold)"}}>🏆 {user.trophies||0}</div><div className="stat-label">Trophies</div></div>
          <div className="stat-card"><div className="stat-val" style={{color:rank.color}}>{rank.title}</div><div className="stat-label">Rank</div></div>
        </div>
        <div className="menu-btn-group">
          <button className="btn btn-primary btn-lg btn-block" onClick={onPlay}>🤖 PLAY VS ROBOT</button>
          <button className="btn btn-ghost btn-block" style={{fontSize:13,letterSpacing:1.5}} onClick={onFriend}>👥 PLAY AGAINST FRIEND</button>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {!user.isGuest&&<button className="btn btn-ghost" onClick={onProfile}>👤 Profile</button>}
            <button className="btn btn-ghost" onClick={onLeaderboard} style={{gridColumn:user.isGuest?"1/-1":"auto"}}>🏆 Leaderboard</button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{color:"var(--muted)"}}>{user.isGuest?"← Back to Login":"Logout"}</button>
        </div>
      </div>
    </div>
  );
}

function DifficultyScreen({ onBack, onStart }) {
  const [sel,setSel]=useState(null);
  const levels=[
    {key:"easy",  icon:"🟢",name:"EASY",  desc:"Random moves"},
    {key:"medium",icon:"🟡",name:"MEDIUM",desc:"Mixed strategy"},
    {key:"hard",  icon:"🔴",name:"HARD",  desc:"Unbeatable AI"},
  ];
  return (
    <div className="center page-enter">
      <div className="card card-glow" style={{maxWidth:460,width:"100%",padding:"40px",textAlign:"center"}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:20}} onClick={onBack}>← Back</button>
        <div style={{fontFamily:"var(--font-display)",fontSize:13,letterSpacing:4,color:"var(--muted)",marginBottom:8}}>PLAY VS ROBOT</div>
        <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:900,marginBottom:4}}>🤖 ARIA-7</div>
        <div style={{fontSize:14,color:"var(--muted)",marginBottom:28}}>Select difficulty — she'll chat with you during the game</div>
        <div className="diff-grid">
          {levels.map(l=>(
            <div key={l.key} className={`diff-btn ${sel===l.key?"selected":""}`} onClick={()=>setSel(l.key)}>
              <div className="diff-icon">{l.icon}</div>
              <div className="diff-name">{l.name}</div>
              <div className="diff-desc">{l.desc}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={!sel} style={{opacity:sel?1:0.4,cursor:sel?"pointer":"not-allowed"}} onClick={()=>sel&&onStart(sel)}>
          START GAME
        </button>
      </div>
    </div>
  );
}

function FriendScreen({ onBack, onReady }) {
  const [step,setStep]=useState("choose");
  const [code]=useState(genRoomCode);
  const [inp,setInp]=useState("");
  const [waiting,setWaiting]=useState(false);
  const [toast,setToast]=useState("");

  useEffect(()=>{
    if(step==="create"&&waiting){
      const t=setTimeout(()=>{setWaiting(false);onReady();},3500+Math.random()*2000);
      return()=>clearTimeout(t);
    }
  },[step,waiting]);

  const copy=()=>{navigator.clipboard?.writeText(code).catch(()=>{});setToast("Code copied! 📋");};

  if(step==="choose") return (
    <div className="center page-enter">
      <div className="card card-glow" style={{maxWidth:440,width:"100%",padding:"40px",textAlign:"center"}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:24}} onClick={onBack}>← Back</button>
        <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:900,marginBottom:8}}>PLAY AGAINST FRIEND</div>
        <div style={{fontSize:14,color:"var(--muted)",marginBottom:36}}>Create a room or join one with a code</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <button className="btn btn-primary btn-lg btn-block" onClick={()=>{setStep("create");setWaiting(true);}}>🔒 CREATE ROOM</button>
          <button className="btn btn-ghost btn-block" style={{padding:"14px 28px",fontSize:13,letterSpacing:2}} onClick={()=>setStep("join")}>🔑 JOIN ROOM</button>
        </div>
      </div>
    </div>
  );

  if(step==="create") return (
    <div className="center page-enter">
      <div className="card card-glow" style={{maxWidth:440,width:"100%",padding:"40px",textAlign:"center"}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:20}} onClick={()=>{setWaiting(false);setStep("choose");}}>← Back</button>
        <div style={{fontFamily:"var(--font-display)",fontSize:13,letterSpacing:3,color:"var(--muted)",marginBottom:8}}>YOUR ROOM CODE</div>
        <div className="room-code" style={{cursor:"pointer"}} onClick={copy}>{code}</div>
        <div style={{fontSize:14,color:"var(--muted)",marginBottom:8}}>Share this code with your friend</div>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:32}} onClick={copy}>📋 Copy Code</button>
        {waiting&&<><div className="mm-spinner" style={{width:48,height:48,marginBottom:16}}/><div style={{fontSize:14,color:"var(--muted)"}}>Waiting for friend<span className="mm-dots"/></div></>}
        {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      </div>
    </div>
  );

  return (
    <div className="center page-enter">
      <div className="card card-glow" style={{maxWidth:440,width:"100%",padding:"40px",textAlign:"center"}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:20}} onClick={()=>setStep("choose")}>← Back</button>
        <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:900,marginBottom:24}}>JOIN ROOM</div>
        <div className="form-group" style={{textAlign:"left"}}>
          <div className="label">Room Code</div>
          <input className="input" placeholder="Enter 6-digit code" maxLength={6} value={inp} onChange={e=>setInp(e.target.value.replace(/\D/g,""))}
            style={{textAlign:"center",letterSpacing:8,fontSize:28,fontFamily:"var(--font-display)",paddingTop:14,paddingBottom:14}}/>
        </div>
        <button className="btn btn-primary btn-block" onClick={()=>{if(inp.length!==6){setToast("Enter a 6-digit code");return;}onReady();}}>JOIN MATCH</button>
        {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  GAME PAGE  (AI-powered robot chat)
// ═══════════════════════════════════════════════════════════
function GamePage({ user, opponent, isRobot, difficulty, onBack, onUpdateUser }) {
  const [board,      setBoard]      = useState(Array(9).fill(null));
  const [xTurn,      setXTurn]      = useState(true);
  const [result,     setResult]     = useState(null);
  const [winLine,    setWinLine]    = useState([]);
  const [chat,       setChat]       = useState([]);
  const [chatMsg,    setChatMsg]    = useState("");
  const [showTrophy, setShowTrophy] = useState(false);
  const [confetti,   setConfetti]   = useState(false);
  const [newEntries, setNewEntries] = useState({});
  const [botTyping,  setBotTyping]  = useState(false);

  const chatEndRef     = useRef(null);
  const historyRef     = useRef([]);          // Claude conversation rolling context
  const gameRef        = useRef({ board:Array(9).fill(null), done:false });
  const processingRef  = useRef(false);       // prevent double bot moves
  const mySymbol = "X";

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[chat,botTyping]);

  // Initial greeting
  useEffect(()=>{
    if (isRobot) setTimeout(()=>robotSay("greet"),900);
  },[]);

  // ── Reset board only — chat stays ───────────────────────────
  const resetGame = () => {
    const fresh = Array(9).fill(null);
    setBoard(fresh);
    setXTurn(true);
    setResult(null);
    setWinLine([]);
    setNewEntries({});
    setConfetti(false);
    setShowTrophy(false);
    gameRef.current = { board: fresh, done: false };
    processingRef.current = false;
    if (isRobot) {
      setTimeout(() => robotSay("rematch"), 600);
    }
  };

  // ── Claude API call ─────────────────────────────────────────
  const robotSay = async (trigger, playerMsg=null) => {
    if (!isRobot) return;
    setBotTyping(true);
    const diffLabel = {easy:"Easy",medium:"Medium",hard:"Hard"}[difficulty]||"";
    let prompt = "";
    if (trigger==="greet")      prompt=`Greet the player "${user.username}" warmly. You're playing on ${diffLabel} mode. Keep it to 1–2 sentences.`;
    if (trigger==="player_msg") prompt=`The player "${user.username}" says: "${playerMsg}". Reply naturally and briefly (1–2 sentences max).`;
    if (trigger==="i_moved")    prompt=`You just placed your move on the board. Say a short smug or playful comment. 1 sentence max.`;
    if (trigger==="player_win") prompt=`"${user.username}" just beat you! React with a funny sportsmanlike response. 1 sentence.`;
    if (trigger==="bot_win")    prompt=`You just won the game! Give a short victory taunt to "${user.username}". 1 sentence.`;
    if (trigger==="draw")       prompt=`The game is a draw! Say something witty about it. 1 sentence.`;
    if (trigger==="rematch")    prompt=`The player wants a rematch! React with excitement or a cocky challenge. 1 sentence.`;

    const messages = [
      ...historyRef.current.slice(-10),
      { role:"user", content:prompt },
    ];

    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true",
        },
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:120, system:ROBOT_SYSTEM_PROMPT, messages }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text?.trim() || "⚡";

      historyRef.current = [
        ...historyRef.current.slice(-10),
        { role:"user",      content:prompt },
        { role:"assistant", content:reply  },
      ];
      pushMsg({ isRobot:true, text:reply });
    } catch {
      pushMsg({ isRobot:true, text:"📡 *signal lost*…" });
    } finally {
      setBotTyping(false);
    }
  };

  const pushMsg = (m) => setChat(c=>[...c,{...m, ts:new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}]);

  // ── Player sends chat ───────────────────────────────────────
  const sendChat = () => {
    const msg = chatMsg.trim();
    if (!msg || user.isGuest) return;
    setChatMsg("");
    pushMsg({ isRobot:false, text:msg });
    if (isRobot) setTimeout(()=>robotSay("player_msg",msg), 200+Math.random()*600);
  };

  // ── Place a symbol ─────────────────────────────────────────
  const placeAt = (idx, symbol, currentBoard) => {
    const nb = [...currentBoard]; nb[idx]=symbol;
    gameRef.current.board = nb;
    setBoard([...nb]);
    setNewEntries(p=>({...p,[idx]:true}));
    setTimeout(()=>setNewEntries(p=>{const n={...p};delete n[idx];return n;}),500);
    return nb;
  };

  // ── Check & end game ───────────────────────────────────────
  const tryEnd = (nb, movedSymbol) => {
    const r = checkWinner(nb);
    if (!r) return false;
    gameRef.current.done = true;
    setResult(r); setWinLine(r.line);
    if (r.winner===mySymbol) {
      const nw=(user.wins||0)+1, nt=Math.floor(nw/3);
      if(nt>(user.trophies||0)){ setTimeout(()=>{setShowTrophy(true);setConfetti(true);setTimeout(()=>setConfetti(false),4000);},600); }
      onUpdateUser({wins:nw,trophies:nt,losses:user.losses||0});
      if(isRobot) setTimeout(()=>robotSay("player_win"),800);
    } else if(r.winner!=="draw") {
      onUpdateUser({wins:user.wins||0,losses:(user.losses||0)+1,trophies:user.trophies||0});
      if(isRobot) setTimeout(()=>robotSay("bot_win"),800);
    } else {
      if(isRobot) setTimeout(()=>robotSay("draw"),800);
    }
    return true;
  };

  // ── Cell click ─────────────────────────────────────────────
  const handleCell = (idx) => {
    if (gameRef.current.done || gameRef.current.board[idx] || !xTurn || processingRef.current) return;
    processingRef.current = true;
    const nb = placeAt(idx,"X",gameRef.current.board);
    if (tryEnd(nb,"X")) { processingRef.current=false; return; }
    if (!isRobot) { setXTurn(false); processingRef.current=false; return; }
    setXTurn(false);
    setTimeout(()=>{
      const pick = getBotMove(nb, difficulty);
      if (pick==null) { processingRef.current=false; return; }
      const nb2 = placeAt(pick,"O",nb);
      tryEnd(nb2,"O");
      setXTurn(true);
      processingRef.current=false;
      if (Math.random()<0.38) setTimeout(()=>robotSay("i_moved"),300);
    }, 650+Math.random()*450);
  };

  const myRank  = getRank(user.trophies||0);
  const oppRank = getRank(opponent.trophies||0);
  const resEmoji= result?(result.winner==="draw"?"🤝":result.winner===mySymbol?"🎉":"😤"):"";
  const resText = result?(result.winner==="draw"?"It's a Draw!":result.winner===mySymbol?"You Win!":"You Lose"):"";

  return (
    <div className="game-page page-enter">
      <Confetti active={confetti}/>
      <TrophyPopup show={showTrophy} onDone={()=>setShowTrophy(false)}/>

      <div className="game-layout">
        {/* ── Board side ── */}
        <div className="game-main">
          {/* Players bar */}
          <div className="card players-bar">
            <div className="player-info">
              <div className={`player-avatar ${xTurn?"active-turn":""}`} style={{ padding:0, overflow:"hidden" }}>
                {user.avatar
                  ? <img src={user.avatar} alt="av" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
                  : user.username.slice(0,2).toUpperCase()
                }
              </div>
              <div>
                <div className="p-name">{user.username}</div>
                <div className="p-rank" style={{color:myRank.color}}>{myRank.icon} {myRank.title}</div>
                <div className="p-trophies">🏆 {user.trophies||0}</div>
              </div>
            </div>
            <div className="vs-badge">VS</div>
            <div className="player-info right">
              <div className={`player-avatar ${isRobot?"robot-avatar":""} ${!xTurn?"active-turn":""}`}>
                {isRobot?"🤖":opponent.username.slice(0,2).toUpperCase()}
              </div>
              <div>
                <div className="p-name">{opponent.username}</div>
                <div className="p-rank" style={{color:oppRank.color}}>{oppRank.icon} {oppRank.title}</div>
                <div className="p-trophies">{isRobot?`⚙️ ${(difficulty||"").toUpperCase()}`:`🏆 ${opponent.trophies}`}</div>
              </div>
            </div>
          </div>

          {/* Turn indicator */}
          <div className="turn-bar">
            {result ? (
              <span style={{color:result.winner==="draw"?"var(--muted)":result.winner===mySymbol?"var(--win-color)":"#e8132a"}}>{resEmoji} {resText}</span>
            ) : (
              xTurn
                ? <><span>YOUR TURN</span> — Play X</>
                : <><span style={{color:"#e8132a"}}>{opponent.username}'s turn</span> — Playing O</>
            )}
          </div>

          {/* Board */}
          <div style={{position:"relative"}}>
            <div style={{background:"#fff",borderRadius:20,padding:8,boxShadow:"0 4px 24px rgba(0,0,0,0.12)"}}>
              <div className="board-wrap">
                <div className="board">
                  {board.map((val,i)=>(
                    <div
                      key={i}
                      className={`cell ${val?val.toLowerCase():""} ${winLine.includes(i)?"winning":""} ${newEntries[i]?(val==="X"?"cell-enter-x":"cell-enter-o"):""}`}
                      onClick={()=>handleCell(i)}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {result&&(
              <div className="result-overlay">
                <div className="result-emoji">{resEmoji}</div>
                <div className="result-title">{resText}</div>
                <div className="result-sub">{result.winner===mySymbol?"Amazing play! 🔥":result.winner==="draw"?"Neck and neck!":"Better luck next time"}</div>
                <div style={{display:"flex", gap:10, marginTop:8}}>
                  <button className="btn btn-primary" onClick={resetGame}>🔄 Restart</button>
                  <button className="btn btn-ghost"   onClick={onBack}>← Menu</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Chat side ── */}
        <div className="chat-panel">
          <div className="chat-header">
            {isRobot&&<div className="chat-robot-dot"/>}
            <span>{isRobot?"💬 ARIA-7":"💬 MATCH CHAT"}</span>
          </div>

          <div className="chat-messages">
            {chat.length===0&&(
              <div className="chat-empty">
                {isRobot?"ARIA-7 is initializing…\nSay something to get her talking!":"No messages yet"}
              </div>
            )}
            {chat.map((m,i)=>(
              <div key={i} className={`chat-msg ${m.isRobot?"robot":!m.isRobot&&m.text?"me":""}`}>
                <div className="chat-msg-header">
                  {m.isRobot
                    ? <><span style={{fontSize:14}}>🤖</span><span className="robot-label">ARIA-7</span></>
                    : <><span className="player-label">{user.username}</span><RankBadge trophies={user.trophies||0}/></>
                  }
                  <span className="chat-time">{m.ts}</span>
                </div>
                <div className="chat-msg-text">{m.text}</div>
              </div>
            ))}
            {botTyping&&(
              <div className="chat-msg robot">
                <div className="chat-msg-header"><span style={{fontSize:14}}>🤖</span><span className="robot-label">ARIA-7</span></div>
                <div className="typing-bubble"><div className="t-dot"/><div className="t-dot"/><div className="t-dot"/></div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {user.isGuest?(
            <div className="chat-guest-notice">🔒 Login to chat with ARIA-7</div>
          ):(
            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder={isRobot?"Chat with ARIA-7…":"Type a message…"}
                value={chatMsg}
                onChange={e=>setChatMsg(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&sendChat()}
              />
              <button className="btn btn-primary btn-sm" onClick={sendChat}>➤</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PROFILE
// ═══════════════════════════════════════════════════════════
function ProfilePage({ user, onBack, onUpdateUser }) {
  const rank = getRank(user.trophies||0);
  const fileRef = useRef(null);
  const history=[
    {vs:"ARIA-7",     result:"WIN",  time:"Today"},
    {vs:"NeonPhantom",result:"LOSS", time:"Today"},
    {vs:"ArcLight",   result:"WIN",  time:"Yesterday"},
    {vs:"ARIA-7",     result:"DRAW", time:"Yesterday"},
    {vs:"StarForge",  result:"WIN",  time:"2 days ago"},
  ];

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdateUser({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-enter">
      <div className="profile-page">
        <button className="btn btn-ghost btn-sm" style={{marginBottom:16}} onClick={onBack}>← Back</button>
        <div className="card profile-header">
          {/* Avatar with change button */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <div className="profile-avatar-lg" style={{ padding:0, overflow:"hidden" }}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
                : user.username.slice(0,2).toUpperCase()
              }
            </div>
            <button
              onClick={() => fileRef.current.click()}
              style={{
                position:"absolute", bottom:0, right:0,
                width:26, height:26, borderRadius:"50%",
                background:"var(--neon)", border:"2px solid var(--bg)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", fontSize:12, lineHeight:1,
              }}
              title="Change photo"
            >📷</button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatar}/>
          </div>
          <div>
            <div className="profile-username">{user.username}</div>
            <div className="profile-title" style={{color:rank.color}}>{rank.icon} {rank.title}</div>
            <div className="profile-badges">
              {(user.trophies||0)>=3  &&<span className="badge badge-blue">🧠 Strategist</span>}
              {(user.trophies||0)>=6  &&<span className="badge badge-purple">💎 Master</span>}
              {(user.trophies||0)>=12 &&<span className="badge badge-gold">👑 Monarch</span>}
              {(user.trophies||0)<3   &&<span className="badge" style={{background:"rgba(255,255,255,0.05)",color:"var(--muted)"}}>⚔️ Rookie</span>}
            </div>
          </div>
        </div>
        <div className="profile-stats">
          {[
            {val:user.wins||0,  label:"Wins",    color:"var(--win-color)"},
            {val:user.losses||0,label:"Losses",  color:"#f43f5e"},
            {val:`🏆 ${user.trophies||0}`,label:"Trophies",color:"var(--gold)"},
            {val:`${user.wins?Math.round((user.wins/((user.wins||0)+(user.losses||0)))*100):0}%`,label:"Win Rate",color:"var(--neon)"},
          ].map((s,i)=>(
            <div key={i} className="card stat-card"><div className="stat-val" style={{color:s.color}}>{s.val}</div><div className="stat-label">{s.label}</div></div>
          ))}
        </div>
        <div className="card profile-history">
          <div className="history-title">Match History</div>
          {history.map((h,i)=>(
            <div key={i} className="history-item">
              <div className={`history-result ${h.result==="WIN"?"win-badge":h.result==="LOSS"?"loss-badge":"draw-badge"}`}>{h.result}</div>
              <div style={{flex:1}}>vs <strong>{h.vs}</strong></div>
              <div style={{color:"var(--muted)",fontSize:11}}>{h.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  LEADERBOARD
// ═══════════════════════════════════════════════════════════
function LeaderboardPage({ user, onBack }) {
  const lb=[
    ...FAKE_LEADERBOARD,
    {id:99,username:user.username,trophies:user.trophies||0,wins:user.wins||0,avatar:user.username.slice(0,2).toUpperCase(),isMe:true},
  ].sort((a,b)=>b.trophies-a.trophies).map((p,i)=>({...p,pos:i+1}));

  return (
    <div className="page-enter">
      <div className="lb-page">
        <button className="btn btn-ghost btn-sm" style={{marginBottom:16}} onClick={onBack}>← Back</button>
        <div className="lb-header"><div className="lb-title">🏆 Leaderboard</div><div className="lb-sub">Top players ranked by trophies</div></div>
        {lb.map(p=>{
          const rank=getRank(p.trophies);
          return (
            <div key={p.id} className={`card lb-row ${p.isMe?"card-glow":""}`} style={{border:p.isMe?"1px solid var(--neon)":undefined}}>
              <div className={`lb-position ${p.pos===1?"pos-1":p.pos===2?"pos-2":p.pos===3?"pos-3":""}`}>{p.pos<=3?["🥇","🥈","🥉"][p.pos-1]:p.pos}</div>
              <div className="lb-avatar">{p.avatar}</div>
              <div className="lb-info">
                <div className="lb-name">{p.username} {p.isMe&&<span style={{fontSize:10,color:"var(--neon)"}}>YOU</span>}</div>
                <div className="lb-rank-title" style={{color:rank.color}}>{rank.icon} {rank.title}</div>
              </div>
              <div className="lb-trophies">🏆 {p.trophies}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [page,     setPage]    = useState("landing");
  const [authMode, setAuth]    = useState("login");
  const [user,     setUser]    = useState(null);
  const [opponent, setOpp]     = useState(null);
  const [isRobot,  setIsRobot] = useState(false);
  const [diff,     setDiff]    = useState(null);

  const updateUser = (u) => setUser(p=>({...p,...u}));

  const startRobot = (d) => { setOpp(ROBOT_OPPONENT); setIsRobot(true); setDiff(d); setPage("game"); };
  const startFriend= ()  => { setOpp(FRIEND_OPPONENTS[Math.floor(Math.random()*FRIEND_OPPONENTS.length)]); setIsRobot(false); setDiff(null); setPage("game"); };

  return (
    <>
      <style>{CSS}</style>
      <div className="stars-bg"/>
      <div className="app">

        {user && page!=="game" && (
          <nav>
            <div className="nav-logo" onClick={()=>setPage("menu")}>⚡ XO ARENA</div>
            <div className="nav-right">
              {!user.isGuest&&(
                <div className="nav-user" onClick={()=>setPage("profile")}>
                  <div className="nav-avatar" style={{ padding:0, overflow:"hidden" }}>
                    {user.avatar
                      ? <img src={user.avatar} alt="av" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
                      : user.username.slice(0,2).toUpperCase()
                    }
                  </div>
                  <div>
                    <div className="nav-name">{user.username}</div>
                    <div className="nav-rank" style={{color:getRank(user.trophies||0).color}}>{getRank(user.trophies||0).title} · 🏆 {user.trophies||0}</div>
                  </div>
                </div>
              )}
              {user.isGuest&&<span style={{fontSize:12,color:"var(--muted)"}}>Guest Mode</span>}
            </div>
          </nav>
        )}

        {page==="landing" && <LandingPage onLogin={()=>{setAuth("login");setPage("auth");}} onGuest={()=>{setUser({username:"Guest",isGuest:true,trophies:0,wins:0,losses:0});setPage("menu");}} onSignup={()=>{setAuth("signup");setPage("auth");}}/>}
        {page==="auth"    && <AuthPage mode={authMode} onBack={()=>setPage("landing")} onSuccess={d=>{setUser({...d,isGuest:false,trophies:0,wins:0,losses:0});setPage("menu");}}/>}
        {page==="menu"    && user && <MainMenu user={user} onPlay={()=>setPage("difficulty")} onFriend={()=>setPage("friend")} onProfile={()=>setPage("profile")} onLeaderboard={()=>setPage("leaderboard")} onLogout={()=>{setUser(null);setPage("landing");}}/>}
        {page==="difficulty" && <DifficultyScreen onBack={()=>setPage("menu")} onStart={startRobot}/>}
        {page==="friend"  && <FriendScreen onBack={()=>setPage("menu")} onReady={startFriend}/>}
        {page==="game"    && user&&opponent && <GamePage user={user} opponent={opponent} isRobot={isRobot} difficulty={diff} onBack={()=>setPage("menu")} onUpdateUser={updateUser}/>}
        {page==="profile" && user&&!user.isGuest && <ProfilePage user={user} onBack={()=>setPage("menu")} onUpdateUser={updateUser}/>}
        {page==="leaderboard" && user && <LeaderboardPage user={user} onBack={()=>setPage("menu")}/>}

      </div>
    </>
  );
}
