const CHARSETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?/~"
};
const SIMILAR = "il1LoO0";
const TIPS = [
    "Never reuse the same password across different accounts.",
    "Turn on multi-factor authentication wherever it's offered.",
    "Store passwords in a manager, not in notes or spreadsheets.",
    "Longer beats complex — an extra 4 characters outweighs a symbol.",
    "Rotate passwords immediately after any service reports a breach.",
    "Avoid dictionary words, names, or dates tied to you personally.",
    "A unique password per account limits the blast radius of any leak."
];

const state = { length: 16, upper: true, lower: true, numbers: true, symbols: true, excludeSimilar: false };
const $ = (id) => document.getElementById(id);

const passwordOut = $('passwordOut');
const lengthSlider = $('lengthSlider');
const lengthVal = $('lengthVal');
const typingLine = $('typingLine');
const termBox = $('termBox');
const toast = $('toast');

document.querySelectorAll('.toggle').forEach((el) => {
    el.addEventListener('click', () => {
        const key = el.dataset.key;
        state[key] = !state[key];
        el.classList.toggle('active', state[key]);
    });
});

lengthSlider.addEventListener('input', () => {
    state.length = parseInt(lengthSlider.value, 10);
    lengthVal.textContent = state.length;
});

function buildCharset(excludeSimilar) {
    let pool = "";
    if (state.upper) pool += CHARSETS.upper;
    if (state.lower) pool += CHARSETS.lower;
    if (state.numbers) pool += CHARSETS.numbers;
    if (state.symbols) pool += CHARSETS.symbols;
    if (excludeSimilar) pool = pool.split("").filter((c) => !SIMILAR.includes(c)).join("");
    return pool;
}

function secureRandomInt(max) {
    const arr = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / max) * max;
    let val;
    do {
        crypto.getRandomValues(arr);
        val = arr[0];
    } while (val >= limit);
    return val % max;
}

function makePassword(pool, length) {
    if (!pool) return "";
    let out = "";
    for (let i = 0; i < length; i++) out += pool[secureRandomInt(pool.length)];
    return out;
}

function entropyBits(poolSize, length) {
    if (poolSize <= 1 || length === 0) return 0;
    return Math.round(length * Math.log2(poolSize));
}

function formatCrackTime(entropy) {
    const guessesPerSecond = 1e10;
    const combinations = Math.pow(2, entropy);
    const seconds = combinations / guessesPerSecond / 2;
    if (seconds < 1) return "Instantly";
    const units = [
        ["century", 60 * 60 * 24 * 365 * 100],
        ["year", 60 * 60 * 24 * 365],
        ["day", 60 * 60 * 24],
        ["hour", 60 * 60],
        ["minute", 60],
        ["second", 1]
    ];
    for (const [name, size] of units) {
        if (seconds >= size) {
            const val = seconds / size;
            const rounded = val >= 1000 ? val.toExponential(1) : Math.round(val);
            return `${rounded} ${name}${val >= 2 ? 's' : ''}`;
        }
    }
    return "Instantly";
}

function renderResistance(entropy, poolSize, usesAllSets) {
    const list = $('resistList');
    const rows = [
        { label: "Brute force", ok: entropy >= 60 },
        { label: "Dictionary attack", ok: poolSize > 26 || state.length > 14 },
        { label: "Rainbow table", ok: entropy >= 50 && usesAllSets },
        { label: "Credential stuffing", ok: null }
    ];
    list.innerHTML = rows.map((r) => {
        if (r.ok === null) {
            return `<div class="resist-row"><span>${r.label}</span><span class="resist-tag warn">depends on reuse</span></div>`;
        }
        return `<div class="resist-row"><span>${r.label}</span><span class="resist-tag ${r.ok ? 'ok' : 'warn'}">${r.ok ? 'resistant' : 'at risk'}</span></div>`;
    }).join('');
    const okCount = rows.filter((r) => r.ok === true).length;
    $('resistSummary').textContent = `${okCount}/3 solid`;
}

function updateAnalysis(pw, poolSize) {
    const entropy = entropyBits(poolSize, pw.length);
    const usesAllSets = state.upper && state.lower && state.numbers && state.symbols;
    let label, color, pct;
    if (!pw) {
        label = "—";
        color = "var(--text-faint)";
        pct = 0;
    } else if (entropy < 40) {
        label = "Weak";
        color = "var(--danger)";
        pct = 20;
    } else if (entropy < 60) {
        label = "Fair";
        color = "var(--warning)";
        pct = 45;
    } else if (entropy < 80) {
        label = "Strong";
        color = "var(--neon-dim)";
        pct = 75;
    } else {
        label = "Excellent";
        color = "var(--neon)";
        pct = 100;
    }

    $('strengthVal').textContent = label;
    $('strengthVal').style.color = color;
    $('entropyVal').textContent = pw ? entropy + " bits" : "— bits";
    $('crackVal').textContent = pw ? formatCrackTime(entropy) : "—";
    requestAnimationFrame(() => {
        $('barFill').style.width = pct + "%";
        $('barFill').style.background = color;
    });
    renderResistance(entropy, poolSize, usesAllSets);
    $('tipText').textContent = TIPS[secureRandomInt(TIPS.length)];
}

function typeSequence(callback) {
    const lines = ["initializing entropy pool...", "collecting randomness...", "encrypting seed...", "generating secure password..."];
    typingLine.classList.remove('hidden');
    let i = 0;
    passwordOut.value = "";
    function step() {
        if (i < lines.length) {
            typingLine.textContent = "> " + lines[i];
            i++;
            setTimeout(step, 220);
        } else {
            typingLine.classList.add('hidden');
            callback();
        }
    }
    step();
}

function addToHistory(pw) {
    const history = JSON.parse(localStorage.getItem('securepass_history') || '[]');
    history.unshift({ pw, time: Date.now(), fav: false });
    localStorage.setItem('securepass_history', JSON.stringify(history.slice(0, 60)));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('securepass_history') || '[]');
    const list = $('historyList');
    if (!history.length) {
        list.innerHTML = '<div class="empty-note">Passwords you generate one at a time are logged here, stored only in this browser.</div>';
        return;
    }
    list.innerHTML = history.map((h, idx) => `
    <div class="history-item">
      <div style="flex:1; min-width:0;">
        <div class="history-pw">${h.pw}</div>
        <div class="history-time">${new Date(h.time).toLocaleString()}</div>
      </div>
      <div class="history-actions">
        <button class="mini-btn copy-h" data-idx="${idx}" title="Copy" aria-label="Copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg></button>
        <button class="mini-btn fav ${h.fav ? 'active' : ''} fav-h" data-idx="${idx}" title="Favorite" aria-label="Favorite"><svg viewBox="0 0 24 24" fill="${h.fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg></button>
        <button class="mini-btn dl-h" data-idx="${idx}" title="Download" aria-label="Download"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg></button>
        <button class="mini-btn del-h" data-idx="${idx}" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6h12z"/></svg></button>
      </div>
    </div>`).join('');

    list.querySelectorAll('.copy-h').forEach((b) => b.addEventListener('click', () => copyText(history[b.dataset.idx].pw)));
    list.querySelectorAll('.fav-h').forEach((b) => b.addEventListener('click', () => {
        history[b.dataset.idx].fav = !history[b.dataset.idx].fav;
        localStorage.setItem('securepass_history', JSON.stringify(history));
        renderHistory();
    }));
    list.querySelectorAll('.dl-h').forEach((b) => b.addEventListener('click', () => downloadText(history[b.dataset.idx].pw + "\n", "password.txt")));
    list.querySelectorAll('.del-h').forEach((b) => b.addEventListener('click', () => {
        history.splice(b.dataset.idx, 1);
        localStorage.setItem('securepass_history', JSON.stringify(history));
        renderHistory();
    }));
}

$('clearHistoryBtn').addEventListener('click', () => {
    localStorage.removeItem('securepass_history');
    renderHistory();
});

function copyText(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => { });
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1400);
}

function downloadText(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
}

$('copyBtn').addEventListener('click', () => copyText(passwordOut.value));

$('qrBtn').addEventListener('click', () => {
    const panel = $('qrPanel');
    if (!passwordOut.value) return;
    const showing = panel.style.display !== 'none';
    if (showing) {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'flex';
    const qrEl = $('qrcode');
    qrEl.innerHTML = '';
    if (window.QRCode) {
        new QRCode(qrEl, { text: passwordOut.value, width: 120, height: 120, colorDark: "#03060a", colorLight: "#ffffff" });
    } else {
        qrEl.innerHTML = '<div style="color:#333;font-size:11px;padding:10px;max-width:120px;">QR library unavailable offline.</div>';
    }
});

$('generateBtn').addEventListener('click', () => {
    const pool = buildCharset(state.excludeSimilar);
    if (!pool) {
        passwordOut.value = "";
        updateAnalysis("", 0);
        return;
    }
    $('qrPanel').style.display = 'none';
    typeSequence(() => {
        const pw = makePassword(pool, state.length);
        passwordOut.value = pw;
        updateAnalysis(pw, pool.length);
        addToHistory(pw);
        termBox.classList.remove('pop');
        void termBox.offsetWidth;
        termBox.classList.add('pop');
    });
});

let bulkPasswords = [];
document.querySelectorAll('.bulk-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const n = parseInt(btn.dataset.n, 10);
        const pool = buildCharset(state.excludeSimilar);
        if (!pool) return;
        bulkPasswords = Array.from({ length: n }, () => makePassword(pool, state.length));
        const list = $('bulkList');
        list.innerHTML = bulkPasswords.map((pw, i) => `
      <div class="bulk-item">
        <span>${pw}</span>
        <button class="copy-mini" data-idx="${i}" title="Copy" aria-label="Copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg></button>
      </div>`).join('');
        list.querySelectorAll('.copy-mini').forEach((b) => b.addEventListener('click', () => copyText(bulkPasswords[b.dataset.idx])));
    });
});

$('exportBulkBtn').addEventListener('click', () => {
    if (!bulkPasswords.length) {
        toast.textContent = "Generate a batch first";
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.textContent = "Copied to clipboard";
        }, 1600);
        return;
    }
    const csv = "password\n" + bulkPasswords.join('\n');
    downloadText(csv, "securepass-batch.csv");
});

updateAnalysis("", 0);
renderHistory();
