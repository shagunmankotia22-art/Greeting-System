<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Greetings – Auth</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a1a;
      font-family: 'Segoe UI', system-ui, sans-serif;
      overflow: hidden;
    }

    /* ── Aurora canvas ── */
    canvas#aurora {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    /* ── Main card ── */
    .card {
      position: relative;
      z-index: 1;
      width: 860px;
      max-width: 98vw;
      height: 520px;
      border-radius: 24px;
      overflow: hidden;
      display: flex;
      box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06);
    }

    /* ── Form side ── */
    .form-side {
      flex: 1;
      background: rgba(12, 12, 28, 0.82);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-right: 1px solid rgba(255,255,255,0.07);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 48px;
      position: relative;
      transition: transform 0.7s cubic-bezier(0.77,0,0.18,1), opacity 0.4s ease;
    }

    /* ── Panel side ── */
    .panel-side {
      width: 340px;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 36px;
      text-align: center;
    }

    .panel-side canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .panel-content {
      position: relative;
      z-index: 1;
    }

    .panel-side h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .panel-side p {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.6;
      margin-bottom: 28px;
    }

    .panel-btn {
      display: inline-block;
      padding: 11px 32px;
      border: 2px solid rgba(255,255,255,0.85);
      border-radius: 50px;
      color: #fff;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      background: transparent;
      transition: background 0.25s, color 0.25s;
    }
    .panel-btn:hover { background: rgba(255,255,255,0.15); }

    /* Blobs on panel */
    .blob {
      position: absolute;
      border-radius: 50%;
      opacity: 0.18;
    }
    .blob1 { width: 180px; height: 180px; background: #fff; top: -60px; right: -60px; }
    .blob2 { width: 120px; height: 120px; background: #fff; bottom: -30px; left: -30px; }
    .blob3 { width: 70px;  height: 70px;  background: #fff; bottom: 80px; right: 20px; }

    /* Floating shapes */
    .shape {
      position: absolute;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 6px;
    }
    .shape1 { width:22px; height:22px; top:18%; left:10%; transform:rotate(20deg); }
    .shape2 { width:14px; height:14px; top:60%; left:18%; transform:rotate(45deg); border-radius:50%; }
    .shape3 { width:18px; height:18px; bottom:20%; right:12%; transform:rotate(-15deg); }

    /* ── Form elements ── */
    .form-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 6px;
      text-align: center;
    }
    .form-sub {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.45);
      margin-bottom: 28px;
      text-align: center;
    }

    .input-wrap {
      position: relative;
      width: 100%;
      margin-bottom: 14px;
    }
    .input-wrap input {
      width: 100%;
      padding: 13px 18px 13px 44px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 50px;
      color: #fff;
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }
    .input-wrap input::placeholder { color: rgba(255,255,255,0.35); }
    .input-wrap input:focus {
      border-color: rgba(160,120,255,0.6);
      background: rgba(255,255,255,0.10);
    }
    .input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      opacity: 0.45;
    }
    .eye-toggle {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      font-size: 1rem;
      opacity: 0.4;
      background: none;
      border: none;
      color: #fff;
    }

    .forgot {
      font-size: 0.78rem;
      color: rgba(255,255,255,0.4);
      text-align: right;
      width: 100%;
      margin-bottom: 20px;
      cursor: pointer;
    }
    .forgot:hover { color: rgba(180,140,255,0.9); }

    .auth-submit {
      width: 100%;
      padding: 13px;
      border-radius: 50px;
      border: none;
      font-size: 0.88rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      background: linear-gradient(135deg, #7c3aed, #a855f7, #6366f1);
      color: #fff;
      transition: opacity 0.2s, transform 0.15s;
      box-shadow: 0 4px 24px rgba(124,58,237,0.4);
    }
    .auth-submit:hover { opacity: 0.9; transform: translateY(-1px); }
    .auth-submit:active { transform: scale(0.98); }

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      margin: 18px 0;
      color: rgba(255,255,255,0.25);
      font-size: 0.75rem;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.12);
    }

    /* Password strength */
    .pwd-bars-row {
      display: flex;
      gap: 5px;
      width: 100%;
      margin-bottom: 6px;
    }
    .pbar {
      flex: 1;
      height: 3px;
      border-radius: 3px;
      background: rgba(255,255,255,0.12);
      transition: background 0.3s, opacity 0.3s;
    }
    .pwd-hint {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.35);
      margin-bottom: 14px;
      width: 100%;
    }

    /* ── Sliding overlay animation ── */
    .card.go-signup .panel-side {
      animation: panelToLeft 0.7s cubic-bezier(0.77,0,0.18,1) forwards;
    }
    .card.go-login .panel-side {
      animation: panelToRight 0.7s cubic-bezier(0.77,0,0.18,1) forwards;
    }

    /* Panel slides to LEFT = signup state */
    @keyframes panelToLeft {
      from { transform: translateX(0); }
      to   { transform: translateX(0); }
    }

    /* Forms fade */
    .form-panel { width: 100%; display: flex; flex-direction: column; align-items: center; }
    .form-panel.hidden {
      display: none;
    }

    /* ── Checkbox ── */
    .check-row {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      margin-bottom: 16px;
      font-size: 0.78rem;
      color: rgba(255,255,255,0.45);
    }
    .check-row input[type=checkbox] { accent-color: #7c3aed; width: 14px; height: 14px; cursor: pointer; }

    /* ── Responsive ── */
    @media (max-width: 700px) {
      .card { flex-direction: column; height: auto; width: 95vw; }
      .panel-side { width: 100%; height: 200px; }
      .form-side { padding: 30px 24px; }
    }
  </style>
</head>
<body>

<canvas id="aurora"></canvas>

<div class="card" id="card">

  <!-- FORM SIDE -->
  <div class="form-side" id="formSide">

    <!-- LOGIN FORM -->
    <div class="form-panel" id="loginForm">
      <div class="form-title">Welcome Back</div>
      <div class="form-sub">Sign in to your Greetings account</div>

      <div class="input-wrap">
        <span class="input-icon">✉️</span>
        <input type="email" id="loginEmail" placeholder="Email address">
      </div>
      <div class="input-wrap">
        <span class="input-icon">🔒</span>
        <input type="password" id="loginPassword" placeholder="Password">
        <button class="eye-toggle" onclick="togglePass('loginPassword',this)">👁️</button>
      </div>

      <div class="forgot">Forgot your password?</div>

      <div class="check-row">
        <input type="checkbox" id="rememberMe">
        <label for="rememberMe">Remember me</label>
      </div>

      <button class="auth-submit" onclick="handleLogin()">Sign In</button>
    </div>

    <!-- SIGNUP FORM -->
    <div class="form-panel hidden" id="signupForm">
      <div class="form-title">Create Account</div>
      <div class="form-sub">Join the Greetings experience</div>

      <div class="input-wrap">
        <span class="input-icon">👤</span>
        <input type="text" id="signupName" placeholder="Full name">
      </div>
      <div class="input-wrap">
        <span class="input-icon">✉️</span>
        <input type="email" id="signupEmail" placeholder="Email address">
      </div>
      <div class="input-wrap">
        <span class="input-icon">📱</span>
        <input type="tel" id="signupPhone" placeholder="Phone number">
      </div>
      <div class="input-wrap">
        <span class="input-icon">🔒</span>
        <input type="password" id="signupPassword" placeholder="Password (min. 6 chars)" oninput="checkStrength(this.value)">
        <button class="eye-toggle" onclick="togglePass('signupPassword',this)">👁️</button>
      </div>

      <div class="pwd-bars-row">
        <span class="pbar" id="b1"></span>
        <span class="pbar" id="b2"></span>
        <span class="pbar" id="b3"></span>
        <span class="pbar" id="b4"></span>
      </div>
      <div class="pwd-hint" id="pwdHint">Enter a password</div>

      <button class="auth-submit" onclick="handleSignup()">Create Account</button>
    </div>

  </div>

  <!-- PANEL SIDE -->
  <div class="panel-side" id="panelSide">
    <canvas id="panelCanvas"></canvas>
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="blob blob3"></div>
    <div class="shape shape1"></div>
    <div class="shape shape2"></div>
    <div class="shape shape3"></div>

    <div class="panel-content">
      <h2 id="panelTitle">Hello, friend!</h2>
      <p id="panelText">Don't have an account yet?<br>Sign up and start your journey with Greetings.</p>
      <button class="panel-btn" id="panelBtn" onclick="toggleMode()">Sign Up</button>
    </div>
  </div>

</div>

<!-- ── Aurora background ── -->
<script>
(function(){
  const cv = document.getElementById('aurora');
  const cx = cv.getContext('2d');
  let W, H;
  function resize(){ W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  const orbs = [
    { x:.12, y:.20, r:.58, h:270, s:80, t:0,   ts:.0007 },
    { x:.82, y:.12, r:.52, h:320, s:75, t:1.2,  ts:.0009 },
    { x:.48, y:.78, r:.62, h:190, s:85, t:2.5,  ts:.0006 },
    { x:.88, y:.72, r:.46, h:240, s:70, t:0.8,  ts:.0008 },
    { x:.18, y:.82, r:.42, h:300, s:80, t:3.1,  ts:.0010 },
  ];
  const particles = Array.from({length:55},()=>({
    x:Math.random()*9999, y:Math.random()*9999,
    vx:(Math.random()-.5)*.16, vy:(Math.random()-.5)*.16,
    r:Math.random()*2+.4, op:Math.random()*.45+.15,
    h:[270,300,190,220,320][Math.floor(Math.random()*5)]
  }));

  function frame(){
    cx.clearRect(0,0,W,H);
    cx.fillStyle='#0a0a1a'; cx.fillRect(0,0,W,H);
    orbs.forEach(o=>{
      o.t+=o.ts;
      const ox=(o.x+Math.sin(o.t)*.08)*W, oy=(o.y+Math.cos(o.t*1.3)*.06)*H;
      const rr=o.r*Math.min(W,H);
      const g=cx.createRadialGradient(ox,oy,0,ox,oy,rr);
      g.addColorStop(0,`hsla(${o.h},${o.s}%,65%,0.28)`);
      g.addColorStop(.4,`hsla(${o.h},${o.s}%,55%,0.14)`);
      g.addColorStop(1,'transparent');
      cx.fillStyle=g; cx.fillRect(0,0,W,H);
    });
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      cx.beginPath(); cx.arc(p.x%W,p.y%H,p.r,0,Math.PI*2);
      cx.fillStyle=`hsla(${p.h},80%,75%,${p.op})`; cx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
})();
</script>

<!-- ── Panel gradient canvas ── -->
<script>
(function(){
  const pc = document.getElementById('panelCanvas');
  const px = pc.getContext('2d');
  let W, H;
  function resize(){
    const r = pc.parentElement.getBoundingClientRect();
    W = pc.width = r.width; H = pc.height = r.height;
  }
  resize(); window.addEventListener('resize', resize);

  const orbs = [
    { x:.5,  y:.3,  r:.9, h:270, s:90, t:0,   ts:.0012 },
    { x:.8,  y:.7,  r:.7, h:300, s:85, t:2.0,  ts:.0009 },
    { x:.2,  y:.8,  r:.6, h:240, s:80, t:1.0,  ts:.0011 },
  ];

  function frame(){
    px.clearRect(0,0,W,H);
    px.fillStyle='#12063a'; px.fillRect(0,0,W,H);
    orbs.forEach(o=>{
      o.t+=o.ts;
      const ox=(o.x+Math.sin(o.t)*.1)*W, oy=(o.y+Math.cos(o.t*1.2)*.1)*H;
      const rr=o.r*Math.max(W,H);
      const g=px.createRadialGradient(ox,oy,0,ox,oy,rr);
      g.addColorStop(0,`hsla(${o.h},${o.s}%,60%,0.55)`);
      g.addColorStop(.5,`hsla(${o.h},${o.s}%,45%,0.25)`);
      g.addColorStop(1,'transparent');
      px.fillStyle=g; px.fillRect(0,0,W,H);
    });
    requestAnimationFrame(frame);
  }
  frame();
})();
</script>

<!-- ── Toggle logic ── -->
<script>
  let isLogin = true;
  const loginForm  = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const panelTitle = document.getElementById('panelTitle');
  const panelText  = document.getElementById('panelText');
  const panelBtn   = document.getElementById('panelBtn');
  const card       = document.getElementById('card');
  const formSide   = document.getElementById('formSide');
  const panelSide  = document.getElementById('panelSide');

  function toggleMode() {
    isLogin = !isLogin;

    if (isLogin) {
      // Slide panel back to right
      panelSide.style.transition = 'transform 0.65s cubic-bezier(0.77,0,0.18,1), order 0s 0.65s';
      panelSide.style.transform = 'translateX(0)';
      panelSide.style.order = '';
      formSide.style.order = '';

      setTimeout(() => {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
      }, 300);

      panelTitle.textContent = 'Hello, friend!';
      panelText.innerHTML = "Don't have an account yet?<br>Sign up and start your journey with Greetings.";
      panelBtn.textContent = 'Sign Up';

    } else {
      // Slide panel to left
      panelSide.style.transition = 'transform 0.65s cubic-bezier(0.77,0,0.18,1)';
      panelSide.style.order = '-1';
      formSide.style.order = '1';

      setTimeout(() => {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      }, 300);

      panelTitle.textContent = 'Welcome Back!';
      panelText.innerHTML = "Already have an account?<br>Sign in and continue your Greetings experience.";
      panelBtn.textContent = 'Sign In';
    }
  }

  function togglePass(id, btn) {
    const inp = document.getElementById(id);
    if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
    else { inp.type = 'password'; btn.textContent = '👁️'; }
  }

  const levels = [
    { label:'Enter a password', color:'' },
    { label:'Too weak',         color:'#ef4444' },
    { label:'Getting there',    color:'#f97316' },
    { label:'Almost strong!',   color:'#eab308' },
    { label:'Strong ✓',         color:'#22c55e' },
  ];

  function checkStrength(v) {
    let score = 0;
    if (v.length >= 6)        score++;
    if (/[A-Z]/.test(v))      score++;
    if (/[0-9]/.test(v))      score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    if (!v.length) score = 0;
    const lv = levels[score];
    [1,2,3,4].forEach(i => {
      const b = document.getElementById('b'+i);
      b.style.background = i <= score ? lv.color : '';
      b.style.opacity    = i <= score ? '1' : '0.15';
    });
    const hint = document.getElementById('pwdHint');
    hint.textContent = lv.label;
    hint.style.color = lv.color || 'rgba(255,255,255,0.35)';
  }

  function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass  = document.getElementById('loginPassword').value;
    if (!email || !pass) { alert('Please fill in all fields.'); return; }
    // Wire to your auth.js here: loginUser(email, pass)
    alert('Signing in as ' + email);
  }

  function handleSignup() {
    const name  = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const pass  = document.getElementById('signupPassword').value;
    if (!name || !email || !phone || !pass) { alert('Please fill in all fields.'); return; }
    if (pass.length < 6) { alert('Password must be at least 6 characters.'); return; }
    // Wire to your auth.js here: registerUser(name, email, phone, pass)
    alert('Account created for ' + email);
  }
</script>

</body>
</html>