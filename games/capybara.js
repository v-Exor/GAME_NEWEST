(() => {
  const world = document.getElementById('world');
  const capyEl = document.getElementById('capy');
  const overlay = document.getElementById('overlay');
  const message = document.getElementById('message');
  const scoreEl = document.getElementById('score');
  const bestEl  = document.getElementById('best');

  // World metrics
  const WORLD_W = world.clientWidth;
  const WORLD_H = world.clientHeight;

  // Physics
  const GROUND_Y = 42;
  const CAPY_X   = parseFloat(getComputedStyle(capyEl).left);
  const CAPY_W = 80, CAPY_H = 50;
  const GRAVITY  = 2400;
  const JUMP_VY  = 760;
  const MAX_JUMPS = 1;

  // Obstacles
  const OB_MIN_GAP = 420;
  const OB_MAX_GAP = 740;
  const OB_SPEED_START = 320;
  const OB_SPEED_MAX   = 760;
  const SPEEDUP_PER_SEC = 22;
  const SCORE_PER_SEC   = 1;

  // Remove SCORE_PER_SEC since we don’t score by time anymore
  // const SCORE_PER_SEC   = 1;

  // State
  let running = false;
  let gameOver = false;
  let timePrev = 0;
  let capyY = 0;
  let capyVY = 0;
  let jumpsUsed = 0;
  let obstacles = [];
  let nextSpawnX = WORLD_W + randRange(OB_MIN_GAP, OB_MAX_GAP);
  let speed = OB_SPEED_START;
  let score = 0;
  let best  = parseInt(localStorage.getItem('capyBest') || '0', 10);

  bestEl.textContent = `Best: ${best}`;

  function randRange(a, b){ return Math.floor(Math.random()*(b-a+1))+a; }

  function reset() {
    running = false;
    gameOver = false;
    timePrev = 0;
    capyY = 0;
    capyVY = 0;
    jumpsUsed = 0;
    obstacles.forEach(o => o.el.remove());
    obstacles = [];
    nextSpawnX = WORLD_W + randRange(OB_MIN_GAP, OB_MAX_GAP);
    speed = OB_SPEED_START;
    score = 0;
    scoreEl.textContent = `Score: 0`;
    // refresh best from storage and show as integer
    best = parseInt(localStorage.getItem('capyBest') || '0', 10);
    bestEl.textContent = `Best: ${best}`;
    overlay.classList.add('show');
    message.textContent = 'Tap / Press Space to start';
    capyEl.style.transform = `translateY(0px)`;
  }

  function start() {
    if (running) return;
    overlay.classList.remove('show');
    running = true;
    timePrev = performance.now();
    requestAnimationFrame(loop);
  }

  function end() {
    running = false;
    gameOver = true;
    overlay.classList.add('show');
    message.textContent = '💥 Game Over — Tap / Press R to restart';
    const finalScore = Math.floor(score);
    if (finalScore > best) {
      best = finalScore;
      localStorage.setItem('capyBest', String(best)); // store integer
    }
    bestEl.textContent = `Best: ${best}`; // show integer
  }

  function jump() {
    if (!running) { start(); return; }
    if (gameOver) return;
    if (jumpsUsed >= MAX_JUMPS) return;
    capyVY = JUMP_VY;
    jumpsUsed++;
  }

  // ✅ give each obstacle a "scored" flag
  function spawnObstacle() {
    const el = document.createElement('div');
    el.className = 'obstacle';
    world.appendChild(el);

    const size = randRange(22, 34);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    const x = WORLD_W + 8;
    const o = { el, x, w: size, h: size, scored: false }; // ← add scored flag
    obstacles.push(o);
    el.style.transform = `translate(${x}px, 0)`;
  }

  function updateObstacles(dt) {
    nextSpawnX -= speed * dt;
    if (nextSpawnX <= 0) {
      spawnObstacle();
      const gapMin = Math.max(220, OB_MIN_GAP - speed);
      const gap = randRange(gapMin, OB_MAX_GAP);
      nextSpawnX = gap;
    }

    obstacles.forEach(o => {
      o.x -= speed * dt;
      o.el.style.transform = `translate(${o.x}px, 0)`;

      // ✅ Award score only if Capybara has passed obstacle
      if (!o.scored && o.x + o.w < CAPY_X) {
        score++;
        scoreEl.textContent = `Score: ${score}`;
        o.scored = true;
      }
    });

    while (obstacles.length && obstacles[0].x + obstacles[0].w < -8) {
      obstacles[0].el.remove();
      obstacles.shift();
    }
  }

  function collides(o) {
    // world coords where UP is positive
    const capyLeft = CAPY_X;
    const capyBottom = 42 + capyY;
    const capyTop = capyBottom + CAPY_H;
    const capyRight = capyLeft + CAPY_W;

    const oLeft = o.x;
    const oBottom = 42;
    const oTop = oBottom + o.h;
    const oRight = oLeft + o.w;

    return (capyLeft < oRight &&
            capyRight > oLeft &&
            capyBottom < oTop &&
            capyTop > oBottom);
  }

  // landing squash (gravity "feel")
  function squash(amount = 0.08, duration = 90) {
    capyEl.animate(
      [
        { transform: `translateY(${-capyY}px) scale(1,1)` },
        { transform: `translateY(${-capyY}px) scale(${1+amount},${1-amount})` },
        { transform: `translateY(${-capyY}px) scale(1,1)` }
      ],
      { duration, easing: 'ease-out' }
    );
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(0.032, (t - timePrev) / 1000);
    timePrev = t;

    // Physics
    capyVY -= GRAVITY * dt;
    capyY += capyVY * dt;

    // Ground
    if (capyY <= 0) {
      if (capyVY < -200) squash(0.12, 120);
      capyY = 0;
      capyVY = 0;
      jumpsUsed = 0;
    }

    capyEl.style.transform = `translateY(${-capyY}px)`;

    // Obstacles & collisions
    updateObstacles(dt);
    for (let i = 0; i < obstacles.length; i++) {
      if (collides(obstacles[i])) { end(); break; }
    }

    // Speed (still increases over time)
    if (!gameOver) {
      speed = Math.min(OB_SPEED_MAX, speed + SPEEDUP_PER_SEC * dt);
      requestAnimationFrame(loop);
    }
  }

  // Input
  function onKey(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jump();
    } else if (e.code === 'KeyR') {
      restart();
    }
  }
  function onPointer() { jump(); }

  window.addEventListener('keydown', onKey);
  world.addEventListener('pointerdown', onPointer, { passive: true });

  // ✅ Fix overlay behavior for one-tap restart
  overlay.addEventListener('click', () => {
    if (gameOver) {
      restart(); // immediately restart
    } else {
      start();   // first time start
    }
  }, { passive: true });

  function restart() {
    reset();
    start(); // ✅ auto start after reset
  }

  // Init
  reset();

  window.CapybaraGame = { restart };
})();
