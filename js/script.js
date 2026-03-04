// ─── CAMPUS WALLET — script.js ───────────────────────────────────────────────
// Option A: Real Algorand Testnet integration via algosdk + Pera Wallet
// Pages: index, onboarding, create, login — UNCHANGED
// Page: dashboard — Real blockchain data only

// ═══════════════════════════════════════════════════════════════════════════════
// ── SHARED UTILITIES (all pages)
// ═══════════════════════════════════════════════════════════════════════════════

function initParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#22c55e'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px; height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 3}px ${color};
      animation-duration: ${Math.random() * 15 + 8}s;
      animation-delay: ${Math.random() * 10}s;
      --drift: ${(Math.random() - 0.5) * 200}px;
    `;
    container.appendChild(p);
  }
}

function showToast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: '💡', warn: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function setLoading(btn, loading) {
  if (loading) {
    btn.classList.add('loading');
    if (!btn.querySelector('.btn-text')) {
      const text = btn.textContent.trim();
      btn.innerHTML = `<span class="btn-text">${text}</span><div class="spinner"></div>`;
    }
  } else {
    btn.classList.remove('loading');
  }
}

function animateCounter(el, from, to, duration = 1200, decimals = 2) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = from + (to - from) * ease;
    el.textContent = val.toFixed(decimals);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function copyToClipboard(text, label = 'Copied!') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} copied to clipboard`, 'success');
  }).catch(() => {
    showToast('Copy failed', 'error');
  });
}

function shortAddr(addr) {
  if (!addr || addr.length < 10) return addr || '—';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function shortTxId(txId) {
  if (!txId || txId.length < 10) return txId || '—';
  return txId.slice(0, 8) + '...' + txId.slice(-6);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── WALLET UTILS (create/login pages) ────────────────────────────────────────
function generateWalletAddress() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let addr = '';
  for (let i = 0; i < 58; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
}

function generateMnemonic() {
  const words = ['alpha','bravo','charlie','delta','echo','foxtrot','golf','hotel',
    'india','juliet','kilo','lima','mike','november','oscar','papa','quantum','romeo',
    'sierra','tango','ultra','victor','whiskey','xray','yankee','zebra','nexus','vault',
    'cipher','matrix','vector','proxy','token','chain','block','node','hash','key',
    'ledger','wallet','crypto','byte','pixel','data','flux','grid','zero','meta'];
  return Array.from({length: 12}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}

// ── LOCAL STORAGE ─────────────────────────────────────────────────────────────
function saveUser(data) { localStorage.setItem('cw_user', JSON.stringify(data)); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('cw_user')); } catch { return null; }
}
function clearUser() { localStorage.removeItem('cw_user'); }

// ── QR GENERATOR ─────────────────────────────────────────────────────────────
function generateQR(canvas, text) {
  const size = 160;
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cell = 8;
  const cols = Math.floor(size / cell);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);
  const seed = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i) => { let x = Math.sin(seed + i) * 10000; return x - Math.floor(x); };
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899'];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < cols; j++) {
      if (rng(i * cols + j) > 0.45) {
        ctx.fillStyle = colors[Math.floor(rng(i * 100 + j) * colors.length)];
        ctx.fillRect(i * cell, j * cell, cell - 1, cell - 1);
      }
    }
  }
  const drawMarker = (x, y) => {
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 24, 24);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + 4, y + 4, 16, 16);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(x + 8, y + 8, 8, 8);
  };
  drawMarker(0, 0); drawMarker(size - 24, 0); drawMarker(0, size - 24);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PAGE: INDEX
// ═══════════════════════════════════════════════════════════════════════════════
function initIndex() {
  initParticles();
  const enterBtn = document.getElementById('enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      document.body.style.animation = 'fadeIn 0.4s reverse forwards';
      setTimeout(() => window.location.href = 'onboarding.html', 380);
    });
  }
  setTimeout(() => {
    document.querySelectorAll('.stat-num[data-count]').forEach(s => {
      animateCounter(s, 0, parseFloat(s.dataset.count), 2000,
        s.dataset.decimals ? parseInt(s.dataset.decimals) : 0);
    });
  }, 1200);
}

// ── PAGE: ONBOARDING ─────────────────────────────────────────────────────────
function initOnboarding() { initParticles(); }

// ── PAGE: CREATE ──────────────────────────────────────────────────────────────
function initCreate() {
  initParticles();
  const passInput = document.getElementById('password');
  const strengthFill = document.querySelector('.strength-fill');

  if (passInput && strengthFill) {
    passInput.addEventListener('input', () => {
      const val = passInput.value;
      let strength = 0;
      if (val.length > 5) strength += 25;
      if (val.length > 9) strength += 25;
      if (/[A-Z]/.test(val) && /[0-9]/.test(val)) strength += 25;
      if (/[^A-Za-z0-9]/.test(val)) strength += 25;
      const colors = ['#ef4444','#f97316','#eab308','#22c55e'];
      strengthFill.style.width = strength + '%';
      strengthFill.style.background = colors[Math.min(Math.floor(strength / 26), 3)];
    });
  }

  const form = document.getElementById('createForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username  = document.getElementById('username').value.trim();
      const password  = document.getElementById('password').value;
      const confirm   = document.getElementById('confirm').value;
      const submitBtn = form.querySelector('button[type=submit]');

      if (!username) return showToast('Username required', 'error');
      if (password.length < 6) return showToast('Password too short (min 6 chars)', 'error');
      if (password !== confirm) return showToast('Passwords do not match', 'error');

      setLoading(submitBtn, true);
      await sleep(2200);

      const addr     = generateWalletAddress();
      const mnemonic = generateMnemonic();
      saveUser({ username, address: addr, mnemonic, created: Date.now() });

      showToast('Local wallet created! Connect Pera on the dashboard.', 'success');

      const overlay = document.getElementById('successOverlay');
      if (overlay) {
        document.getElementById('succAddr').textContent = shortAddr(addr);
        overlay.style.display = 'flex';
        setTimeout(() => window.location.href = 'dashboard.html', 3000);
      }
    });
  }
}

// ── PAGE: LOGIN ───────────────────────────────────────────────────────────────
function initLogin() {
  initParticles();
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const addr      = document.getElementById('walletAddr').value.trim();
      const submitBtn = form.querySelector('button[type=submit]');
      if (!addr) return showToast('Wallet address required', 'error');

      setLoading(submitBtn, true);
      await sleep(1800);

      if (!getUser()) {
        saveUser({
          username: 'User_' + addr.slice(0, 4),
          address: addr.length > 20 ? addr : generateWalletAddress(),
          mnemonic: generateMnemonic(),
          created: Date.now()
        });
      }

      showToast('Login successful!', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 800);
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PAGE: DASHBOARD — REAL ALGORAND TESTNET INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

const ALGOD_URL   = 'https://testnet-api.algonode.cloud';
const INDEXER_URL = 'https://testnet-idx.algonode.cloud';

let algodClient   = null;
let indexerClient = null;
let peraWallet    = null;
let connectedAcct = null;   // real Pera address
let localUser     = null;   // local create/login session

// ── Init Algorand SDK clients ─────────────────────────────────────────────────
function initAlgorand() {
  if (typeof algosdk === 'undefined') {
    console.error('algosdk not loaded');
    return false;
  }
  // v2.x: port must be a number (443) not empty string
  algodClient   = new algosdk.Algodv2('', ALGOD_URL, 443);
  indexerClient = new algosdk.Indexer('', INDEXER_URL, 443);
  return true;
}

// ── Init Pera Wallet ──────────────────────────────────────────────────────────
function initPeraWallet() {
  // The UMD bundle exposes the class differently depending on version:
  // @perawallet/connect UMD => window.peraWalletConnect.PeraWalletConnect (lowercase)
  // Fallback: window.PeraWalletConnect (some builds)
  let PeraClass = null;
  if (typeof window.peraWalletConnect !== 'undefined' && window.peraWalletConnect.PeraWalletConnect) {
    PeraClass = window.peraWalletConnect.PeraWalletConnect;
  } else if (typeof PeraWalletConnect !== 'undefined') {
    PeraClass = PeraWalletConnect;
  } else {
    console.warn('PeraWalletConnect not loaded');
    showToast('Pera Wallet SDK not available — check network', 'warn');
    return false;
  }

  peraWallet = new PeraClass({ chainId: 416002 }); // 416002 = Algorand TestNet

  // Attempt to re-connect from existing session
  peraWallet.reconnectSession().then(accounts => {
    if (accounts && accounts.length > 0) {
      connectedAcct = accounts[0];
      onWalletConnected(connectedAcct);
    }
  }).catch(err => {
    // No saved session — normal on first visit
    console.log('No existing Pera session:', err?.message || err);
  });

  peraWallet.connector?.on('disconnect', handleWalletDisconnect);
  return true;
}

// ── Connect wallet (triggered by button) ─────────────────────────────────────
async function connectRealWallet() {
  if (!peraWallet) {
    showToast('Pera Wallet not initialized', 'error');
    return;
  }

  const btn = document.getElementById('peraConnectBtn');
  if (btn) setLoading(btn, true);

  try {
    const accounts = await peraWallet.connect();
    peraWallet.connector?.on('disconnect', handleWalletDisconnect);
    connectedAcct = accounts[0];
    await onWalletConnected(connectedAcct);
  } catch (err) {
    const msg = err?.message || String(err);
    if (!msg.toLowerCase().includes('closed') && !msg.toLowerCase().includes('cancelled')) {
      showToast('Connection failed: ' + msg.slice(0, 80), 'error');
    }
    console.error('Pera connect error:', err);
  } finally {
    if (btn) setLoading(btn, false);
  }
}

// ── Disconnect ────────────────────────────────────────────────────────────────
async function disconnectPeraWallet() {
  try { await peraWallet?.disconnect(); } catch (e) { console.log('Disconnect err:', e); }
  handleWalletDisconnect();
}

function handleWalletDisconnect() {
  connectedAcct = null;
  updateConnectionUI(false);
  showToast('Pera Wallet disconnected', 'info');
  const balEl = document.getElementById('mainBalance');
  if (balEl) balEl.textContent = '—';
  document.querySelectorAll('.wallet-addr-display').forEach(el => el.textContent = 'Not connected');
  clearTxLists();
}

// ── After wallet connects: fetch all real data ────────────────────────────────
async function onWalletConnected(address) {
  updateConnectionUI(true, address);
  showToast('Pera Wallet connected to Testnet!', 'success');

  // Address displays
  document.querySelectorAll('.wallet-addr-display').forEach(el => el.textContent = shortAddr(address));

  // Buy modal address helper
  const buyAddrEl = document.getElementById('buyAddrDisplay');
  if (buyAddrEl) buyAddrEl.value = address;

  // QR codes
  ['qrCanvas', 'qrCanvas2', 'qrModal'].forEach(id => {
    const canvas = document.getElementById(id);
    if (canvas) generateQR(canvas, address);
  });

  // Copy buttons
  document.querySelectorAll('.copy-addr-btn').forEach(btn => {
    btn.onclick = () => copyToClipboard(address, 'Address');
  });

  // Sidebar user display
  if (localUser) {
    document.querySelectorAll('.user-name').forEach(el => el.textContent = localUser.username);
  }

  // Fetch balance + txns in parallel
  await Promise.all([
    fetchRealBalance(address),
    fetchRealTransactions(address)
  ]);

  // Wire refresh button to real data
  const refreshBtn = document.getElementById('refreshBalance');
  if (refreshBtn) {
    refreshBtn.onclick = async () => {
      refreshBtn.style.animation = 'spin 0.9s linear infinite';
      await Promise.all([
        fetchRealBalance(address),
        fetchRealTransactions(address)
      ]);
      setTimeout(() => { refreshBtn.style.animation = ''; }, 900);
      showToast('Refreshed from Algorand Testnet', 'info');
    };
  }

  // Wire real send form
  setupRealSendForm(address);
}

// ── Fetch Real ALGO Balance ───────────────────────────────────────────────────
async function fetchRealBalance(address) {
  const balEl = document.getElementById('mainBalance');
  const usdEl = document.getElementById('usdBal');

  try {
    const info = await algodClient.accountInformation(address).do();
    // algosdk v2: amount is a BigInt
    const microAlgos = Number(info.amount ?? info['amount'] ?? 0);
    const algo = microAlgos / 1_000_000;

    if (balEl) animateCounter(balEl, 0, algo, 1200, 4);

    // Best-effort USD price via CoinGecko (no auth needed)
    let price = 0.18;
    try {
      const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd');
      if (r.ok) {
        const j = await r.json();
        price = j?.algorand?.usd ?? 0.18;
      }
    } catch { /* use fallback price */ }
    if (usdEl) usdEl.textContent = (algo * price).toFixed(2);

    // Mini chart (aesthetic)
    const chart = document.getElementById('miniChart');
    if (chart) {
      const heights = [20, 35, 28, 55, 42, 68, 80];
      chart.innerHTML = heights.map(h =>
        `<div class="bar" style="height:${h}%; opacity:${0.3 + h / 200};"></div>`
      ).join('');
    }

  } catch (err) {
    console.error('Balance fetch error:', err);
    showToast('Balance fetch failed: ' + (err?.message || err), 'error');
    if (balEl) balEl.textContent = 'ERROR';
  }
}

// ── Fetch Real Transactions (last 5 payment txns) ─────────────────────────────
async function fetchRealTransactions(address) {
  try {
    const result = await indexerClient
      .lookupAccountTransactions(address)
      .limit(20)
      .do();

    // algosdk v2: result.transactions is the array
    const allTxns = result.transactions || result['transactions'] || [];
    const txns = allTxns
      .filter(tx => (tx['tx-type'] || tx.txType) === 'pay')
      .slice(0, 5);

    renderRealTxList('txList', txns, address);
    renderRealTxList('txListFull', txns, address);

    // Aggregate stats
    let sent = 0, received = 0;
    txns.forEach(tx => {
      const pt = tx['payment-transaction'] || {};
      if (tx.sender === address) sent += Number(pt.amount || 0);
      else received += Number(pt.amount || 0);
    });

    const statSent = document.getElementById('statSent');
    const statRecv = document.getElementById('statRecv');
    const statTx   = document.getElementById('statTxCount');
    if (statSent) statSent.textContent = (sent / 1_000_000).toFixed(4) + ' Ⓐ';
    if (statRecv) statRecv.textContent = (received / 1_000_000).toFixed(4) + ' Ⓐ';
    if (statTx)   statTx.textContent   = txns.length;

  } catch (err) {
    console.error('Transaction fetch error:', err);
    showToast('Could not fetch transactions: ' + (err?.message || err), 'warn');
    clearTxLists();
  }
}

// ── Render TX list from real blockchain data ──────────────────────────────────
function renderRealTxList(containerId, txns, myAddress) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!txns || !txns.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;
        font-family:'Share Tech Mono',monospace;font-size:0.75rem;
        color:rgba(148,163,184,0.4);letter-spacing:0.15em;line-height:2;">
        NO PAYMENT TRANSACTIONS FOUND<br>
        <span style="color:rgba(59,130,246,0.5);font-size:0.65rem;">
          GET TESTNET ALGO AT bank.testnet.algorand.network
        </span>
      </div>`;
    return;
  }

  container.innerHTML = txns.map((tx, i) => {
    const pt          = tx['payment-transaction'] || {};
    const isSend      = tx.sender === myAddress;
    const type        = isSend ? 'debit' : 'credit';
    const icon        = isSend ? '📤' : '📥';
    const amtAlgo     = (Number(pt.amount || 0) / 1_000_000).toFixed(4);
    const sign        = isSend ? '-' : '+';
    const txId        = tx.id || '—';
    const ts          = tx['round-time']
      ? new Date(tx['round-time'] * 1000).toISOString().split('T')[0]
      : '—';
    const counterparty = isSend
      ? 'To: '   + shortAddr(pt.receiver || '—')
      : 'From: ' + shortAddr(tx.sender || '—');

    return `
      <div class="tx-item ${type}"
        style="opacity:0;animation:fadeIn 0.5s ease ${i * 0.09}s forwards;margin-bottom:10px;"
        title="TxID: ${txId}">
        <div class="tx-icon">${icon}</div>
        <div class="tx-info">
          <div class="tx-name">${counterparty}</div>
          <div class="tx-date">${ts} · <span style="cursor:pointer;color:var(--blue);"
            onclick="copyToClipboard('${txId}','TxID')">${shortTxId(txId)}</span></div>
        </div>
        <div class="tx-amount">${sign}${amtAlgo} ALGO</div>
      </div>`;
  }).join('');
}

function clearTxLists() {
  ['txList', 'txListFull'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `
      <div style="text-align:center;padding:40px 20px;
        font-family:'Share Tech Mono',monospace;font-size:0.75rem;
        color:rgba(148,163,184,0.3);letter-spacing:0.15em;">
        CONNECT PERA WALLET TO SEE TRANSACTIONS
      </div>`;
  });
}

// ── Real Send Transaction ─────────────────────────────────────────────────────
function setupRealSendForm(fromAddress) {
  const sendForm = document.getElementById('sendForm');
  if (!sendForm) return;

  // Replace element to remove stale event listeners
  const freshForm = sendForm.cloneNode(true);
  sendForm.parentNode.replaceChild(freshForm, sendForm);

  freshForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const toAddress = document.getElementById('sendAddr').value.trim();
    const amtInput  = parseFloat(document.getElementById('sendAmt').value);
    const submitBtn = freshForm.querySelector('button[type=submit]');

    if (!toAddress) return showToast('Recipient address required', 'error');
    if (!amtInput || amtInput <= 0) return showToast('Enter a valid ALGO amount', 'error');
    if (amtInput < 0.001) return showToast('Minimum send is 0.001 ALGO', 'error');

    // Validate Algorand address
    if (typeof algosdk !== 'undefined') {
      if (!algosdk.isValidAddress(toAddress)) {
        return showToast('Invalid Algorand address format', 'error');
      }
    }

    setLoading(submitBtn, true);

    try {
      // 1. Fetch suggested params
      showToast('Fetching network parameters...', 'info');
      const params = await algodClient.getTransactionParams().do();

      // 2. Build transaction
      const microAlgos = Math.round(amtInput * 1_000_000);
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender:          fromAddress,
        receiver:        toAddress,
        amount:          microAlgos,
        suggestedParams: params,
      });

      // 3. Sign with Pera Wallet (opens Pera app / QR modal)
      showToast('Open Pera Wallet to sign the transaction...', 'info');
      // Pera v1.3.4: signTransaction expects array of arrays of {txn, signers}
      const singleTxnGroups = [{ txn: txn, signers: [fromAddress] }];
      const signedTxnResult = await peraWallet.signTransaction([singleTxnGroups]);
      // signedTxnResult is an array of Uint8Arrays
      const signedTxnBytes = signedTxnResult[0];

      // 4. Submit to Algorand node
      showToast('Broadcasting to Testnet...', 'info');
      const { txId } = await algodClient.sendRawTransaction(signedTxnBytes).do();

      // 5. Await confirmation
      showToast('Waiting for block confirmation...', 'info');
      await waitForConfirmation(txId, 8);

      // 6. Refresh UI with live data
      await Promise.all([
        fetchRealBalance(fromAddress),
        fetchRealTransactions(fromAddress)
      ]);

      // 7. Success
      const explorerLink = `https://testnet.algoexplorer.io/tx/${txId}`;
      document.getElementById('sendModal').classList.remove('open');
      freshForm.reset();
      showToast(`✅ Sent ${amtInput} ALGO! View on Explorer ↗`, 'success');
      // Open explorer after short delay
      setTimeout(() => window.open(explorerLink, '_blank'), 1500);

    } catch (err) {
      console.error('Send transaction error:', err);
      const msg = err?.message || String(err);
      if (msg.toLowerCase().includes('cancelled') || msg.toLowerCase().includes('closed')) {
        showToast('Transaction cancelled', 'warn');
      } else {
        showToast('Send failed: ' + msg.slice(0, 100), 'error');
      }
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

// ── Wait For Confirmation ─────────────────────────────────────────────────────
async function waitForConfirmation(txId, maxRounds) {
  // Use algosdk built-in if available (v2.x)
  if (algosdk.waitForConfirmation) {
    return await algosdk.waitForConfirmation(algodClient, txId, maxRounds);
  }
  // Manual fallback
  let status = await algodClient.status().do();
  let lastRound = Number(status['last-round']);
  for (let i = 0; i <= maxRounds; i++) {
    const pending = await algodClient.pendingTransactionInformation(txId).do();
    const confirmed = Number(pending['confirmed-round'] ?? 0);
    if (confirmed > 0) return pending;
    if (pending['pool-error']) throw new Error('Pool error: ' + pending['pool-error']);
    await algodClient.statusAfterBlock(lastRound++).do();
  }
  throw new Error(`Transaction not confirmed within ${maxRounds} rounds`);
}

// ── Update Connection UI Banner ───────────────────────────────────────────────
function updateConnectionUI(connected, address = '') {
  const banner       = document.getElementById('peraConnectBanner');
  const connPanel    = document.getElementById('peraConnectedPanel');
  const netIndicator = document.querySelector('.network-indicator');

  if (banner)    banner.style.display    = connected ? 'none' : 'flex';
  if (connPanel) connPanel.style.display = connected ? 'flex' : 'none';

  if (connected) {
    const connAddr = document.getElementById('connectedAddr');
    if (connAddr) connAddr.textContent = shortAddr(address);

    if (netIndicator) netIndicator.innerHTML = `
      <div class="net-dot"></div>
      TESTNET &nbsp;·&nbsp;
      <span style="color:var(--blue);cursor:pointer;"
        onclick="copyToClipboard('${address}','Address')">${shortAddr(address)}</span>`;

    const sidebarSub = document.querySelector('.sidebar-logo-sub');
    if (sidebarSub) sidebarSub.textContent = '⬡ ALGO TESTNET · LIVE';
  } else {
    if (netIndicator) netIndicator.innerHTML =
      `<div class="net-dot" style="background:#ef4444;box-shadow:0 0 8px #ef4444;"></div>NOT CONNECTED`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── DASHBOARD INIT
// ═══════════════════════════════════════════════════════════════════════════════
function initDashboard() {
  initParticles();

  // Require local auth
  localUser = getUser();
  if (!localUser) { window.location.href = 'login.html'; return; }

  // Local user display
  document.querySelectorAll('.user-name').forEach(el => el.textContent = localUser.username);

  // Date
  const dateEl = document.querySelector('.main-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Initial blank state
  clearTxLists();
  updateConnectionUI(false);

  // UI wiring
  setupNavigation();
  setupModals();

  document.querySelectorAll('.toggle').forEach(t =>
    t.addEventListener('click', () => t.classList.toggle('on'))
  );

  // Logout
  document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', async () => {
    await disconnectPeraWallet();
    clearUser();
    showToast('Logged out', 'info');
    setTimeout(() => window.location.href = 'index.html', 800);
  }));

  // QR download (uses real address once connected, falls back to placeholder)
  const dlBtn    = document.getElementById('downloadQR');
  const qrCanvas = document.getElementById('qrCanvas');
  if (dlBtn && qrCanvas) {
    dlBtn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = qrCanvas.toDataURL();
      a.download = 'campus-wallet-qr.png';
      a.click();
      showToast('QR Code downloaded!', 'success');
    });
  }

  // Pera connect/disconnect buttons
  const peraBtn = document.getElementById('peraConnectBtn');
  if (peraBtn) peraBtn.addEventListener('click', connectRealWallet);

  const disconnBtn = document.getElementById('peraDisconnectBtn');
  if (disconnBtn) disconnBtn.addEventListener('click', disconnectPeraWallet);

  // Buy: redirect to testnet dispenser
  const buyForm = document.getElementById('buyForm');
  if (buyForm) {
    buyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Get free Testnet ALGO: bank.testnet.algorand.network', 'info');
      window.open('https://bank.testnet.algorand.network/', '_blank');
    });
  }

  // Init Algorand + Pera
  if (initAlgorand()) {
    initPeraWallet();
  } else {
    showToast('Algorand SDK failed to load — check CDN', 'error');
  }
}

// ── Sidebar Navigation ────────────────────────────────────────────────────────
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const panels   = document.querySelectorAll('.section-panel');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.section;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      panels.forEach(p => p.classList.toggle('active', p.id === `section-${target}`));
    });
  });
}

// ── Modal Wiring ──────────────────────────────────────────────────────────────
function setupModals() {
  const openModal  = (m) => { if (m) m.classList.add('open'); };
  const closeModal = (m) => { if (m) m.classList.remove('open'); };

  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => openModal(document.getElementById(el.dataset.action + 'Modal')));
  });

  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); });
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')));
  });
}

// ── Global helpers (called from inline HTML) ──────────────────────────────────
function switchSection(name) {
  document.querySelectorAll('.nav-item[data-section]').forEach(n =>
    n.classList.toggle('active', n.dataset.section === name)
  );
  document.querySelectorAll('.section-panel').forEach(p =>
    p.classList.toggle('active', p.id === `section-${name}`)
  );
}

function handleSell() {
  document.getElementById('sellModal').classList.remove('open');
  showToast('Use Pera Wallet app → Tinyman DEX to sell on Testnet', 'info');
  window.open('https://testnet.tinyman.org/', '_blank');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── AUTO-INIT
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'index')      initIndex();
  if (page === 'onboarding') initOnboarding();
  if (page === 'create')     initCreate();
  if (page === 'login')      initLogin();
  if (page === 'dashboard')  initDashboard();

  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 600);
});
