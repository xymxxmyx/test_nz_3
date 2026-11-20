// ── Language abstraction ──
// tgt(w) — слово на изучаемом языке (en или ja)
// nat(w) — перевод на русском
// direction "en-ru" = target→native, "ru-en" = native→target (значение не меняется)

function isJa() { return state && state.studyLang === "ja"; }
function tgt(w) { return w ? (isJa() ? (w.ja || w.en) : w.en) : ""; }
function nat(w) { return w ? w.ru : ""; }
function tgtLang() { return isJa() ? "ja" : "en"; }
function isTargetToNative() { return state.direction === "en-ru"; }
function langTTS() { return isJa() ? "ja" : "en"; }

// ── Rebuild DICTIONARY / SENTENCES / sets from active language data ──
let DICTIONARY = [];
let SENTENCES = [];
let B_LEVEL_WORDS = new Set();
let B_SENTENCES = new Set();
let ADJ_WORDS = new Set();
let VERB_WORDS = new Set();
let ADV_WORDS = new Set();
let NUM_WORDS = new Set();
let PRO_WORDS = new Set();
let PREP_WORDS = new Set();

function rebuildActiveLanguage() {
    const j = isJa();
    const t = j ? "ja" : "en";

    const _aOther = j ? (typeof JA_A_OTHER_WORDS !== "undefined" ? JA_A_OTHER_WORDS : []) : A_OTHER_WORDS;
    const _aAdj   = j ? (typeof JA_A_ADJ_WORDS   !== "undefined" ? JA_A_ADJ_WORDS   : []) : A_ADJ_WORDS;
    const _aVerb  = j ? (typeof JA_A_VERB_WORDS  !== "undefined" ? JA_A_VERB_WORDS  : []) : A_VERB_WORDS;
    const _aAdv   = j ? (typeof JA_A_ADV_WORDS   !== "undefined" ? JA_A_ADV_WORDS   : []) : A_ADV_WORDS;
    const _aNum   = j ? (typeof JA_A_NUM_WORDS   !== "undefined" ? JA_A_NUM_WORDS   : []) : A_NUM_WORDS;
    const _aPro   = j ? (typeof JA_A_PRO_WORDS   !== "undefined" ? JA_A_PRO_WORDS   : []) : A_PRO_WORDS;
    const _aPrep  = j ? (typeof JA_A_PREP_WORDS  !== "undefined" ? JA_A_PREP_WORDS  : []) : A_PREP_WORDS;
    const _bOther = j ? (typeof JA_B_OTHER_WORDS !== "undefined" ? JA_B_OTHER_WORDS : []) : B_OTHER_WORDS;
    const _bAdj   = j ? (typeof JA_B_ADJ_WORDS   !== "undefined" ? JA_B_ADJ_WORDS   : []) : B_ADJ_WORDS;
    const _bVerb  = j ? (typeof JA_B_VERB_WORDS  !== "undefined" ? JA_B_VERB_WORDS  : []) : B_VERB_WORDS;
    const _bAdv   = j ? (typeof JA_B_ADV_WORDS   !== "undefined" ? JA_B_ADV_WORDS   : []) : B_ADV_WORDS;
    const _bNum   = j ? (typeof JA_B_NUM_WORDS   !== "undefined" ? JA_B_NUM_WORDS   : []) : B_NUM_WORDS;
    const _bPro   = j ? (typeof JA_B_PRO_WORDS   !== "undefined" ? JA_B_PRO_WORDS   : []) : B_PRO_WORDS;
    const _bPrep  = j ? (typeof JA_B_PREP_WORDS  !== "undefined" ? JA_B_PREP_WORDS  : []) : B_PREP_WORDS;
    const _aSents = j ? (typeof JA_A_SENTENCES    !== "undefined" ? JA_A_SENTENCES    : []) : A_SENTENCES;
    const _bSents = j ? (typeof JA_B1B2_SENTENCES !== "undefined" ? JA_B1B2_SENTENCES : []) : (B1B2_SENTENCES || []);

    DICTIONARY = [].concat(_aOther, _aAdj, _aVerb, _aAdv, _aNum, _aPro, _aPrep,
                           _bOther, _bAdj, _bVerb, _bAdv, _bNum, _bPro, _bPrep);
    SENTENCES  = [].concat(_aSents, _bSents);

    B_LEVEL_WORDS = new Set([].concat(_bOther, _bAdj, _bVerb, _bAdv, _bNum, _bPro, _bPrep).map(w => w[t]));
    B_SENTENCES   = new Set(_bSents.map(s => s[t]));
    ADJ_WORDS     = new Set([].concat(_aAdj, _bAdj).map(w => w[t]));
    VERB_WORDS    = new Set([].concat(_aVerb, _bVerb).map(w => w[t]));
    ADV_WORDS     = new Set([].concat(_aAdv, _bAdv).map(w => w[t]));
    NUM_WORDS     = new Set([].concat(_aNum, _bNum).map(w => w[t]));
    PRO_WORDS     = new Set([].concat(_aPro, _bPro).map(w => w[t]));
    PREP_WORDS    = new Set([].concat(_aPrep, _bPrep).map(w => w[t]));
}

// ── Пользовательские слова: добавляет сам игрок, хранятся на сервере в папке userwords ──
let USER_WORDS = [];
let USER_APPLIED_EN = [];
const USER_POS_SETS = {
    adj: () => ADJ_WORDS,
    verb: () => VERB_WORDS,
    adv: () => ADV_WORDS,
    num: () => NUM_WORDS,
    pro: () => PRO_WORDS,
    prep: () => PREP_WORDS
};
const USER_POS_LABELS = {
    noun: "Существительное", verb: "Глагол", adj: "Прилагательное",
    adv: "Наречие", num: "Числительное", pro: "Местоимение",
    prep: "Предлог", other: "Другое"
};
const USER_LVL_LABELS = { a: "A1-A2", b: "B1-B2" };

function getUserWordsTotal() {
    return DICTIONARY.length + USER_WORDS.filter(w => (w.lang || "en") === tgtLang()).length;
}

// Включает слова игрока в фильтры уровня и части речи
function applyUserWords() {
    const own = USER_WORDS.filter(w => (w.lang || "en") === tgtLang());
    USER_APPLIED_EN.forEach(en => {
        B_LEVEL_WORDS.delete(en);
        Object.keys(USER_POS_SETS).forEach(k => USER_POS_SETS[k]().delete(en));
    });
    USER_APPLIED_EN = own.map(w => tgt(w));
    own.forEach(w => {
        if (w.lvl === "b") B_LEVEL_WORDS.add(tgt(w));
        const setFn = USER_POS_SETS[w.pos];
        if (setFn) setFn().add(tgt(w));
    });
}

// Свои слова хранятся локально в браузере (localStorage) и работают без сервера.
// Если приложение открыто через HTTP-сервер с эндпоинтом __userwords — слова
// дополнительно сохраняются в отдельную папку на диске (NZ\userwords).
const USER_WORDS_LS = "NZUserWords";

const userWordsOnline = () => typeof location !== "undefined" && location.protocol !== "file:";

function readUserWordsLocal() {
    try { return JSON.parse(localStorage.getItem(USER_WORDS_LS) || "[]") || []; }
    catch (e) { return []; }
}
function writeUserWordsLocal(list) {
    try { localStorage.setItem(USER_WORDS_LS, JSON.stringify(list)); } catch (e) {}
}

async function requestUserWords(method, data, query) {
    const opts = { method };
    if (data) opts.body = JSON.stringify(data);
    const resp = await fetch("__userwords" + (query || ""), opts);
    if (!resp.ok) throw new Error("userwords " + resp.status);
    return await resp.json();
}

async function loadUserWords() {
    if (userWordsOnline()) {
        try { return await requestUserWords("GET"); } catch (e) {}
    }
    return readUserWordsLocal();
}

async function saveUserWord(word) {
    if (userWordsOnline()) {
        try { await requestUserWords("POST", word); return; } catch (e) {}
    }
    const list = readUserWordsLocal();
    const i = list.findIndex(w => String(w.en).toLowerCase() === String(word.en).toLowerCase());
    if (i >= 0) list[i] = word; else list.push(word);
    writeUserWordsLocal(list);
}

async function deleteUserWord(en) {
    const key = String(en).toLowerCase();
    if (userWordsOnline()) {
        try { await requestUserWords("DELETE", null, "?en=" + encodeURIComponent(en)); return; } catch (e) {}
    }
    writeUserWordsLocal(readUserWordsLocal().filter(w => String(w.en).toLowerCase() !== key));
}

async function refreshUserWords() {
    try {
        const list = await loadUserWords();
        USER_WORDS = (list || []).map(w => Object.assign({ lvl: "a", pos: "other", note: "", user: true }, w));
        applyUserWords();
        const total = document.getElementById("stat-total");
        if (total) total.textContent = getUserWordsTotal();
        const listEl = document.getElementById("user-words-list");
        if (listEl && !listEl.classList.contains("hidden")) renderUserWordsList();
        const dictEl = document.getElementById("dictionary-list");
        if (dictEl && document.getElementById("dictionary-screen") && document.getElementById("dictionary-screen").classList.contains("active")) {
            // Перерисовываем с тем фильтром, который выбрал игрок
            filterDictionary(currentDictFilter, null);
        }
        try { CloudSync.updateUwCapLine(); CloudSync.checkWordsCap(); if (CloudSync.booted()) CloudSync.scheduleSave(CloudSync.pack()); } catch (e) {}
        return true;
    } catch (e) {
        return false;
    }
}

async function addUserWord() {
    const en = document.getElementById("uw-en").value.trim().toLowerCase();
    const ru = document.getElementById("uw-ru").value.trim();
    if (!en || !ru) { Sound.wrong(); return; }
    const word = {
        lang: tgtLang(),
        en: en,
        ru: ru,
        lvl: document.getElementById("uw-lvl").value,
        pos: document.getElementById("uw-pos").value,
        note: document.getElementById("uw-note").value.trim()
    };
    try {
        await saveUserWord(word);
        await refreshUserWords();
        Sound.correct();
        document.getElementById("uw-en").value = "";
        document.getElementById("uw-ru").value = "";
        document.getElementById("uw-note").value = "";
    } catch (e) {
        Sound.wrong();
    }
}

async function removeUserWord(en) {
    try {
        await deleteUserWord(en);
        await refreshUserWords();
    } catch (e) {
        Sound.wrong();
    }
}

function showUserWords() {
    const uwEn = document.getElementById("uw-en");
    if (uwEn) uwEn.placeholder = isJa() ? "например, りんご" : "например, apple";
    // Поиск сбрасывается при каждом открытии экрана
    const uwSearch = document.getElementById("uw-search");
    if (uwSearch) uwSearch.value = "";
    renderUserWordsList();
    try { CloudSync.updateUwCapLine(); } catch (e) {}
    showScreen("user-words-screen");
}

function renderUserWordsList() {
    const list = document.getElementById("user-words-list");
    if (!list) return;
    list.innerHTML = "";
    if (USER_WORDS.length === 0) {
        list.innerHTML = '<div class="dict-empty">Пока нет своих слов — добавьте первое ' + iconHTML("👆") + '</div>';
        return;
    }
    // Поиск по своим словам: слово, перевод и заметка
    const box = document.getElementById("uw-search");
    const q = box ? box.value.trim().toLowerCase() : "";
    const visible = q
        ? USER_WORDS.filter(w => ((w.en + "\n" + w.ru + "\n" + (w.note || "")).toLowerCase().indexOf(q) !== -1))
        : USER_WORDS;
    if (visible.length === 0) {
        list.innerHTML = '<div class="dict-empty">Ничего не найдено</div>';
        return;
    }
    visible.slice().reverse().forEach((w, idx) => {
        const item = document.createElement("div");
        item.className = "dict-item user-word-item";
        item.style.animationDelay = (Math.min(idx * 0.02, 0.5)) + "s";
        const front = document.createElement("div");
        front.className = "dict-front uw-main";
        const wordSpan = document.createElement("span");
        wordSpan.className = "dict-word dict-word-uw";
        wordSpan.textContent = w.en;
        front.appendChild(wordSpan);
        const trSpan = document.createElement("span");
        trSpan.className = "dict-tr uw-ru";
        trSpan.textContent = w.ru;
        front.appendChild(trSpan);
        if (w.note) {
            const note = document.createElement("span");
            note.className = "uw-note";
            note.textContent = w.note;
            front.appendChild(note);
        }
        const badge = document.createElement("span");
        badge.className = "uw-badges";
        badge.textContent = (USER_LVL_LABELS[w.lvl] || w.lvl) + " · " + (USER_POS_LABELS[w.pos] || w.pos);
        front.appendChild(badge);
        item.appendChild(front);

        const del = document.createElement("button");
        del.type = "button";
        del.className = "fav-btn dict-del";
        del.setAttribute("aria-label", "Удалить слово");
        del.innerHTML = iconHTML("🗑");
        del.addEventListener("click", () => { Sound.click(); removeUserWord(w.en); });
        item.appendChild(del);
        list.appendChild(item);
    });
}

const MAX_LIVES = 3;

let state = {
    playerName: "",
    studyLang: "en",
    learnedWords: [],
    currentWordIndex: 0,
    streak: 0,
    bestStreak: 0,
    direction: "en-ru",
    mode: "sequential",
    roundCorrect: 0,
    roundTotal: 0,
    lives: MAX_LIVES,
    inProgress: false,
    playMode: "input",
    submode: "words",
    category: "all",
    studyLevel: "mix",   /* уровень ОБУЧЕНИЯ: "a" / "b" / "mix" */
    selectedAnswer: null,
    gameWords: [],
    theme: "plush",
    sfxVolume: 100,
    roundWords: 10,
    infiniteLives: false,
    ttsEnabled: true,
    ttsAuto: false,
    micAutoCheck: true,
    cardsAudio: false,
    speedMode: false,
    wrongWords: [],
    favoriteWords: [],
    history: {},
    topAccuracy: 0,
    bestCombo: 0,
    achievementsUnlocked: [],
    score: 0,
    combo: 0,
    xp: 0,
    level: 1,   /* уровень ОПЫТА: число 1..20 */
    daily: null,
    lessonDone: {},
    cheatUsed: false,
    cheatSnapshot: null
};

function loadData() {
    const saved = localStorage.getItem("dictionaryGameState");
    if (saved) {
        let parsed = null;
        try {
            parsed = JSON.parse(saved);
        } catch (e) {
            parsed = null;
        }
        if (parsed && typeof parsed === "object") {
            state = { ...state, ...parsed };
            delete state.cardBack; delete state.wordBg; // подсистема рубашек удалена
            /* Миграция: раньше один ключ level отвечал и за уровень обучения
               ("a"/"b"), и за уровень опыта (число). Выбор A1–A2 затирал число
               строкой, и шкала опыта показывала NaN. Разносим:
               studyLevel — уровень обучения, level — уровень опыта. */
            if (typeof state.level === "string") {
                state.studyLevel = state.level;
                state.level = levelFromXp(Number(state.xp) || 0);
            }
            if (!state.studyLevel) state.studyLevel = "mix";
            state.level = Math.min(20, Math.max(1, Math.floor(Number(state.level) || 1)));
            return true;
        }
        // Запись побилась — стираем, чтобы приложение не падало при старте
        try { localStorage.removeItem("dictionaryGameState"); } catch (e) {}
    }
    return false;
}

function saveData() {
    try { checkAchievements(); } catch (e) {}
    try { state.savedAt = Date.now(); } catch (e) {}
    localStorage.setItem("dictionaryGameState", JSON.stringify(state));
    try { CloudSync.scheduleSave(CloudSync.pack()); } catch (e) {}
}

// ===== Облачная синхронизация (Telegram CloudStorage) =====
// Прогресс должен быть одинаковым в Telegram на ПК и на телефоне. localStorage
// остаётся полной (сырой) копией state — он не ограничен и служит мгновенным
// кэшем. В облако Telegram (привязано к аккаунту, 4096 символов на ключ)
// уходит упакованный конверт: выученные/избранные/ошибки — битовыми масками по
// стабильному реестру слов, история — CSV за 60 дней, скаляры — компактный
// JSON, свои слова — TSV-строки в ключах nz_w0..nz_w127 (кап 1000 слов).
// Вне мини-аппа облака нет — работает только localStorage. Облако — источник
// правды по свежести ts; свои слова сливаются объединением (удаление слова на
// одном устройстве не переносится на другое — так ничего не теряется).
const CloudSync = (() => {
    const CLOUD_V = 2;
    const K_MAIN = "nz_main";   // {v, rh, ts, m, hx, C} — скаляры + история + чит
    const K_LEARN = "nz_learn"; // {L, F, W, xl, xf, xw} — маски + extras
    const K_HIST = "nz_hist";   // CSV истории за 60 дней
    const K_EXTRA = "nz_extra"; // CSV пройденных уроков (lessonDone)
    const K_WN = "nz_wn";       // число заполненных ключей nz_w*
    const WKEYS_MAX = 128;
    const WORDS_CAP = 1000;     // мягкий кап синхронизации своих слов
    const CHUNK_BYTES = 3900;   // байты ≥ символов: 3900 байт всегда < 4096 симв. лимита ключа
    const HISTORY_DAYS = 60;
    const SAVE_DEBOUNCE = 1500;

    // Дефолты state: захват ДО загрузки сохранения (loadData вызывается позже).
    // Нужен, чтобы пустое облако (сброс) обнуляло все поля на других устройствах.
    const DEFAULTS = (() => { try { return JSON.parse(JSON.stringify(state)); } catch (e) { return {}; } })();
    const BIG_FIELDS = { learnedWords: 1, favoriteWords: 1, wrongWords: 1, history: 1, gameWords: 1, cheatSnapshot: 1 };

    let _te = null;
    try { _te = new TextEncoder(); } catch (e) {}
    function byteLen(s) {
        if (_te) return _te.encode(s).length;
        return unescape(encodeURIComponent(s)).length;
    }

    // CloudStorage появился в Bot API 6.9+: старые клиенты и мок-SDK обычного
    // браузера («6.0») отсекаются до вызовов — без спама ошибками в консоли.
    // window.__NZ_FORCE_CLOUD__ — ручной стаб в тестах (обычный браузер).
    const cloudOK = () => {
        try {
            const app = window.Telegram && window.Telegram.WebApp;
            if (!app || !app.CloudStorage ||
                typeof app.CloudStorage.getItem !== "function" ||
                typeof app.CloudStorage.setItem !== "function") return false;
            if (window.__NZ_FORCE_CLOUD__ === true) return true;
            return parseFloat(app.version || "0") >= 6.9;
        } catch (e) { return false; }
    };

    // Колбэчный API Telegram → промисы. Любая ошибка = «нет данных/не записано».
    function csGet(key) {
        return new Promise((resolve) => {
            try {
                window.Telegram.WebApp.CloudStorage.getItem(key, (err, val) => {
                    if (err || typeof val !== "string" || !val.length) resolve(null);
                    else resolve(val);
                });
            } catch (e) { resolve(null); }
        });
    }
    function csSet(key, val) {
        return new Promise((resolve) => {
            try {
                window.Telegram.WebApp.CloudStorage.setItem(key, val, (err) => resolve(!err));
            } catch (e) { resolve(false); }
        });
    }
    function csRemove(keys) {
        return new Promise((resolve) => {
            try {
                const cs = window.Telegram.WebApp.CloudStorage;
                if (typeof cs.removeItems === "function") cs.removeItems(keys, (err) => resolve(!err));
                else resolve(false);
            } catch (e) { resolve(false); }
        });
    }

    // ── Реестр слов: EN-слова, EN-предложения, JA-слова, JA-предложения ──
    // Порядок берётся из data-файлов; реестр «только растёт» (новые слова
    // дописываются в конец файлов) — индексы масок стабильны между версиями.
    let REG = null;
    function buildRegistry() {
        const list = [];
        const seen = new Set();
        const grab = (pool, key) => {
            if (!Array.isArray(pool)) return;
            for (let i = 0; i < pool.length; i++) {
                const w = pool[i];
                const t = w ? w[key] : null;
                if (typeof t !== "string" || !t || seen.has(t)) continue;
                seen.add(t);
                list.push(t);
            }
        };
        grab(typeof A_OTHER_WORDS !== "undefined" ? A_OTHER_WORDS : null, "en");
        grab(typeof A_ADJ_WORDS !== "undefined" ? A_ADJ_WORDS : null, "en");
        grab(typeof A_VERB_WORDS !== "undefined" ? A_VERB_WORDS : null, "en");
        grab(typeof A_ADV_WORDS !== "undefined" ? A_ADV_WORDS : null, "en");
        grab(typeof A_NUM_WORDS !== "undefined" ? A_NUM_WORDS : null, "en");
        grab(typeof A_PRO_WORDS !== "undefined" ? A_PRO_WORDS : null, "en");
        grab(typeof A_PREP_WORDS !== "undefined" ? A_PREP_WORDS : null, "en");
        grab(typeof B_OTHER_WORDS !== "undefined" ? B_OTHER_WORDS : null, "en");
        grab(typeof B_ADJ_WORDS !== "undefined" ? B_ADJ_WORDS : null, "en");
        grab(typeof B_VERB_WORDS !== "undefined" ? B_VERB_WORDS : null, "en");
        grab(typeof B_ADV_WORDS !== "undefined" ? B_ADV_WORDS : null, "en");
        grab(typeof B_NUM_WORDS !== "undefined" ? B_NUM_WORDS : null, "en");
        grab(typeof B_PRO_WORDS !== "undefined" ? B_PRO_WORDS : null, "en");
        grab(typeof B_PREP_WORDS !== "undefined" ? B_PREP_WORDS : null, "en");
        grab(typeof A_SENTENCES !== "undefined" ? A_SENTENCES : null, "en");
        grab(typeof B1B2_SENTENCES !== "undefined" ? B1B2_SENTENCES : null, "en");
        grab(typeof JA_A_OTHER_WORDS !== "undefined" ? JA_A_OTHER_WORDS : null, "ja");
        grab(typeof JA_A_ADJ_WORDS !== "undefined" ? JA_A_ADJ_WORDS : null, "ja");
        grab(typeof JA_A_VERB_WORDS !== "undefined" ? JA_A_VERB_WORDS : null, "ja");
        grab(typeof JA_A_ADV_WORDS !== "undefined" ? JA_A_ADV_WORDS : null, "ja");
        grab(typeof JA_A_NUM_WORDS !== "undefined" ? JA_A_NUM_WORDS : null, "ja");
        grab(typeof JA_A_PRO_WORDS !== "undefined" ? JA_A_PRO_WORDS : null, "ja");
        grab(typeof JA_A_PREP_WORDS !== "undefined" ? JA_A_PREP_WORDS : null, "ja");
        grab(typeof JA_B_OTHER_WORDS !== "undefined" ? JA_B_OTHER_WORDS : null, "ja");
        grab(typeof JA_B_ADJ_WORDS !== "undefined" ? JA_B_ADJ_WORDS : null, "ja");
        grab(typeof JA_B_VERB_WORDS !== "undefined" ? JA_B_VERB_WORDS : null, "ja");
        grab(typeof JA_B_ADV_WORDS !== "undefined" ? JA_B_ADV_WORDS : null, "ja");
        grab(typeof JA_B_NUM_WORDS !== "undefined" ? JA_B_NUM_WORDS : null, "ja");
        grab(typeof JA_B_PRO_WORDS !== "undefined" ? JA_B_PRO_WORDS : null, "ja");
        grab(typeof JA_B_PREP_WORDS !== "undefined" ? JA_B_PREP_WORDS : null, "ja");
        grab(typeof JA_A_SENTENCES !== "undefined" ? JA_A_SENTENCES : null, "ja");
        grab(typeof JA_B1B2_SENTENCES !== "undefined" ? JA_B1B2_SENTENCES : null, "ja");
        let h = 5381;
        for (let i = 0; i < list.length; i++) {
            const s = list[i];
            for (let j = 0; j < s.length; j++) h = ((h * 33) ^ s.charCodeAt(j)) >>> 0;
        }
        const idx = new Map();
        for (let i = 0; i < list.length; i++) idx.set(list[i], i);
        REG = { list: list, idx: idx, rh: h };
    }
    function reg() {
        if (!REG) { try { buildRegistry(); } catch (e) { REG = { list: [], idx: new Map(), rh: 0 }; } }
        return REG;
    }

    // ── Битовые маски (base64) ──
    function b64Encode(bytes) {
        let s = "";
        for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
        return btoa(s);
    }
    function b64Decode(str) {
        const s = atob(String(str || ""));
        const out = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
        return out;
    }
    // Маска по реестру; цели своих слов пропускаются — их статус едет вместе
    // с самим словом (TSV, биты st); строки вне реестра (сироты) — в extras.
    function maskPack(words, skip) {
        const r = reg();
        const bits = new Uint8Array(Math.max(1, Math.ceil(Math.max(r.list.length, 1) / 8)));
        const x = [];
        (Array.isArray(words) ? words : []).forEach((t) => {
            if (typeof t !== "string" || !t) return;
            if (skip && skip.has(t)) return;
            const i = r.idx.get(t);
            if (i === undefined) { if (x.indexOf(t) < 0) x.push(t); }
            else bits[i >> 3] |= (1 << (i & 7));
        });
        return { m: b64Encode(bits), x: x };
    }
    function maskUnpack(str, extras) {
        const r = reg();
        const out = [];
        try {
            const bits = b64Decode(str);
            for (let i = 0; i < r.list.length; i++) {
                const by = i >> 3;
                if (by >= bits.length) break;
                if (bits[by] & (1 << (i & 7))) out.push(r.list[i]);
            }
        } catch (e) {}
        (Array.isArray(extras) ? extras : []).forEach((t) => {
            if (typeof t === "string" && t && out.indexOf(t) < 0) out.push(t);
        });
        return out;
    }
    function mergeUniq(a, b) {
        const out = (Array.isArray(a) ? a : []).slice();
        (Array.isArray(b) ? b : []).forEach((t) => { if (out.indexOf(t) < 0) out.push(t); });
        return out;
    }

    // ── История: CSV за последние 60 дней ("ГГММДД:выуч:верно:всего;...") ──
    function historyPack(hist) {
        const days = Object.keys(hist || {}).sort();
        return days.slice(-HISTORY_DAYS).map((k) => {
            const h = hist[k] || {};
            const d = String(k).replace(/\D/g, "");
            return d.slice(2) + ":" + (Number(h.learned) || 0) + ":" + (Number(h.correct) || 0) + ":" + (Number(h.total) || 0);
        }).join(";");
    }
    function historyUnpack(str) {
        const out = {};
        String(str || "").split(";").forEach((p) => {
            const m = p.split(":");
            if (m.length !== 4 || !/^\d{6}$/.test(m[0])) return;
            const key = "20" + m[0].slice(0, 2) + "-" + m[0].slice(2, 4) + "-" + m[0].slice(4, 6);
            out[key] = { learned: Number(m[1]) || 0, correct: Number(m[2]) || 0, total: Number(m[3]) || 0 };
        });
        return out;
    }

    // ── Скаляры: все поля, кроме больших (маски/история/раунд/чит) ──
    function scalarsPack(src) {
        const s = src || state;
        const m = {};
        for (const k in s) {
            if (BIG_FIELDS[k] || k === "savedAt") continue;
            const v = s[k];
            if (typeof v === "function" || v === undefined) continue;
            m[k] = v;
        }
        m.inProgress = false; // активный раунд не переезжает между устройствами
        // Пройденные уроки → CSV (в отдельном ключе nz_extra): JSON с реальными
        // id уроков раздувал nz_main за предохранитель.
        if (s.lessonDone && typeof s.lessonDone === "object") {
            m.lessonDoneS = Object.keys(s.lessonDone).map((k) => k + ":" + (Number(s.lessonDone[k]) || 0)).join(";");
            delete m.lessonDone;
        }
        return m;
    }

    // ── Чит-снапшот: {level, xp, daily, L, xl} ──
    function cheatPack(skip) {
        const s = state.cheatSnapshot;
        if (!s) return null;
        const lm = maskPack(s.learnedWords, skip);
        return { level: s.level, xp: s.xp, daily: s.daily || null, L: lm.m, xl: lm.x };
    }
    function cheatUnpack(c) {
        if (!c) return null;
        return { level: c.level, xp: c.xp, daily: c.daily || null, learnedWords: maskUnpack(c.L, c.xl) };
    }

    // ── Свои слова: TSV-строки ("lang\ten\tlvl,pos\tru\tnote\tst"), куски ≤ CHUNK_BYTES ──
    function wordToTSV(w, st) {
        const esc = (s) => String(s == null ? "" : s).replace(/[\t\r\n]+/g, " ").trim();
        return (w.lang === "ja" ? "1" : "0") + "\t" + esc(w.en) + "\t" +
            esc(w.lvl) + "," + esc(w.pos) + "\t" + esc(w.ru) + "\t" +
            esc(w.note) + "\t" + (st || 0);
    }
    function wordFromTSV(line) {
        const p = String(line).split("\t");
        if (p.length < 5 || !p[1]) return null;
        const lv = String(p[2] || "").split(",");
        return {
            lang: p[0] === "1" ? "ja" : "en",
            en: p[1],
            lvl: lv[0] === "b" ? "b" : "a",
            pos: lv[1] || "other",
            ru: p[3],
            note: p[4] || "",
            st: parseInt(p[5], 10) || 0,
            user: true
        };
    }
    function unpackWords(chunks) {
        const out = [];
        (Array.isArray(chunks) ? chunks : []).forEach((c) => {
            String(c || "").split("\n").forEach((line) => {
                if (!line) return;
                const w = wordFromTSV(line);
                if (w) out.push(w);
            });
        });
        return out;
    }
    function chunkWords(list, learnedSet, favSet, wrongSet) {
        const chunks = [];
        let cur = [], curBytes = 0, truncated = 0;
        const n = Math.min((list || []).length, WORDS_CAP);
        for (let i = 0; i < n; i++) {
            const w = list[i];
            const t = tgt(w);
            let st = 0;
            if (t) {
                if (learnedSet.has(t)) st |= 1;
                if (favSet.has(t)) st |= 2;
                if (wrongSet.has(t)) st |= 4;
            }
            const line = wordToTSV(w, st);
            const b = byteLen(line) + 1;
            if (b > CHUNK_BYTES) { truncated++; continue; }
            if (cur.length && curBytes + b > CHUNK_BYTES) {
                if (chunks.length >= WKEYS_MAX) { truncated += (n - i); break; }
                chunks.push(cur.join("\n"));
                cur = []; curBytes = 0;
            }
            cur.push(line);
            curBytes += b;
        }
        if (cur.length) {
            if (chunks.length >= WKEYS_MAX) truncated += cur.length;
            else chunks.push(cur.join("\n"));
        }
        return { chunks: chunks, truncated: truncated, sent: Math.max(0, n - truncated) };
    }

    // ── Конверт ──
    let lastSyncSent = 0; // сколько слов реально уехало в облако последним пушем
    function pack() {
        const skip = (() => {
            const s = new Set();
            (USER_WORDS || []).forEach((w) => { const t = tgt(w); if (t) s.add(t); });
            return s;
        })();
        const L = maskPack(state.learnedWords, skip);
        const F = maskPack(state.favoriteWords, skip);
        const W = maskPack(state.wrongWords, skip);
        return {
            v: CLOUD_V,
            rh: reg().rh,
            ts: Date.now(),
            m: scalarsPack(),
            hx: historyPack(state.history),
            L: L.m, xl: L.x,
            F: F.m, xf: F.x,
            W: W.m, xw: W.x,
            C: cheatPack(skip)
        };
    }

    let pendingEnv = null;
    let flushTimer = null;
    let lastWordKeys = 0;
    let wiping = false;

    async function writeAll(env) {
        if (!cloudOK() || !env) return false;
        const mClean = Object.assign({}, env.m);
        const extraStr = (typeof mClean.lessonDoneS === "string") ? mClean.lessonDoneS : "";
        delete mClean.lessonDoneS;
        const mainStr = JSON.stringify({ v: env.v, rh: env.rh, ts: env.ts, m: mClean, C: env.C || null });
        const learnStr = JSON.stringify({ L: env.L, F: env.F, W: env.W, xl: env.xl || [], xf: env.xf || [], xw: env.xw || [] });
        const histStr = String(env.hx || "");
        if (byteLen(mainStr) > 3800 || byteLen(learnStr) > 3800 || byteLen(histStr) > 3800 || byteLen(extraStr) > 3800) return false; // не рискуем обрезкой
        const wc = wiping
            ? { chunks: [], truncated: 0, sent: 0 }
            : chunkWords(USER_WORDS || [],
                new Set(state.learnedWords || []), new Set(state.favoriteWords || []), new Set(state.wrongWords || []));
        lastSyncSent = wc.sent;
        // слова и маски — первыми, манифест nz_main — последним
        let ok = await csSet(K_LEARN, learnStr);
        ok = (await csSet(K_HIST, histStr)) && ok;
        ok = (await csSet(K_EXTRA, extraStr)) && ok;
        for (let i = 0; i < wc.chunks.length; i++) {
            const r = await csSet("nz_w" + i, wc.chunks[i]);
            ok = ok && r;
        }
        ok = (await csSet(K_WN, String(wc.chunks.length))) && ok;
        ok = (await csSet(K_MAIN, mainStr)) && ok;
        const stale = [];
        for (let i = wc.chunks.length; i < lastWordKeys; i++) stale.push("nz_w" + i);
        lastWordKeys = wc.chunks.length;
        if (stale.length) await csRemove(stale);
        return ok;
    }

    function scheduleSave(env) {
        if (!cloudOK() || !env) return;
        pendingEnv = env;
        if (flushTimer) clearTimeout(flushTimer);
        flushTimer = setTimeout(() => { flushTimer = null; flushSave(); }, SAVE_DEBOUNCE);
    }
    async function flushSave() {
        const env = pendingEnv;
        pendingEnv = null;
        if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
        if (!env || !cloudOK()) return;
        try { writeOk = await writeAll(env); if (!writeOk) bootInfo = "ошибка записи"; } catch (e) { bootInfo = "ошибка записи"; }
    }

    async function readAll() {
        const res = await Promise.all([csGet(K_MAIN), csGet(K_LEARN), csGet(K_HIST), csGet(K_EXTRA), csGet(K_WN)]);
        const mainRaw = res[0];
        if (!mainRaw) return null;
        let main = null;
        try { main = JSON.parse(mainRaw); } catch (e) { return null; }
        if (!main || main.v !== CLOUD_V) return null;
        let learn = null;
        try { learn = JSON.parse(res[1] || "null"); } catch (e) {}
        learn = learn || {};
        learn.hx = res[2] || main.hx || ""; // история: новый ключ; старые конверты — из nz_main
        learn.ld = res[3] || "";           // пройденные уроки: CSV
        const wn = parseInt(res[4] || "0", 10) || 0;
        const keys = [];
        for (let i = 0; i < Math.min(wn, WKEYS_MAX); i++) keys.push("nz_w" + i);
        const vals = await Promise.all(keys.map(csGet));
        return { main: main, learn: learn || null, wchunks: vals };
    }

    function applyRemote(remote) {
        // Отменяем отложенную запись, запланированную ДО применения облака:
        // иначе устаревший локальный pack перезапишет только что загруженное.
        if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
        pendingEnv = null;
        try {
            const main = remote.main || {};
            const learn = remote.learn || {};
            const rhOk = main.rh === reg().rh;
            // поля активного раунда не трогаем
            const keep = state.inProgress ? {
                gameWords: state.gameWords,
                currentWordIndex: state.currentWordIndex,
                roundCorrect: state.roundCorrect,
                roundTotal: state.roundTotal,
                lives: state.lives,
                selectedAnswer: state.selectedAnswer,
                combo: state.combo,
                score: state.score
            } : null;
            const m = main.m || {};
            // скаляры: чего нет в облаке — из дефолтов (пустое облако = чистый аккаунт)
            for (const k in DEFAULTS) {
                if (BIG_FIELDS[k] || k === "savedAt") continue;
                state[k] = (Object.prototype.hasOwnProperty.call(m, k)) ? m[k] : JSON.parse(JSON.stringify(DEFAULTS[k]));
            }
            // новые скаляры из облака, которых ещё нет в DEFAULTS (будущие версии)
            for (const k in m) {
                if (k in DEFAULTS || BIG_FIELDS[k] || k === "savedAt") continue;
                state[k] = m[k];
            }
            if (typeof learn.ld === "string") {
                // пройденные уроки: пересборка из CSV
                state.lessonDone = {};
                String(learn.ld).split(";").forEach((p) => { const i = p.lastIndexOf(":"); if (i > 0) state.lessonDone[p.slice(0, i)] = Number(p.slice(i + 1)) || 0; });
            }
            const L = maskUnpack(learn.L, learn.xl);
            const F = maskUnpack(learn.F, learn.xf);
            const W = maskUnpack(learn.W, learn.xw);
            if (rhOk) {
                state.learnedWords = L;
                state.favoriteWords = F;
                state.wrongWords = W;
            } else {
                // реестр слов изменился: маски расшифрованы «лучшим усилием»,
                // объединяем с локальными, чтобы не потерять прогресс
                state.learnedWords = mergeUniq(state.learnedWords, L);
                state.favoriteWords = mergeUniq(state.favoriteWords, F);
                state.wrongWords = mergeUniq(state.wrongWords, W);
            }
            state.history = historyUnpack(learn.hx != null ? learn.hx : main.hx);
            state.cheatSnapshot = main.C ? cheatUnpack(main.C) : null;
            state.savedAt = main.ts || Date.now();
            // свои слова: добавляем облачные, которых нет локально (по en+lang)
            const cloudWords = unpackWords(remote.wchunks);
            if (cloudWords.length) {
                if (!Array.isArray(USER_WORDS)) USER_WORDS = [];
                const have = new Set(USER_WORDS.map((w) => String(w.en).toLowerCase() + "|" + (w.lang || "en")));
                cloudWords.forEach((w) => {
                    const k = String(w.en).toLowerCase() + "|" + w.lang;
                    if (!have.has(k)) {
                        have.add(k);
                        USER_WORDS.push({ lang: w.lang, en: w.en, lvl: w.lvl, pos: w.pos, ru: w.ru, note: w.note, user: true });
                    }
                    const t = tgt(w);
                    if (t) {
                        if ((w.st & 1) && state.learnedWords.indexOf(t) < 0) state.learnedWords.push(t);
                        if ((w.st & 2) && state.favoriteWords.indexOf(t) < 0) state.favoriteWords.push(t);
                        if ((w.st & 4) && state.wrongWords.indexOf(t) < 0) state.wrongWords.push(t);
                    }
                });
                writeUserWordsLocal(USER_WORDS);
                applyUserWords();
            }
            if (keep) Object.assign(state, keep);
            state.level = Math.min(20, Math.max(1, Math.floor(Number(state.level) || 1)));
            if (!state.studyLevel) state.studyLevel = "mix";
            initDaily();
            rebuildActiveLanguage();
            // Важно: НЕ вызывать saveData() — он обновил бы savedAt и запустил
            // повторную запись всех ключей в облако при КАЖДОМ открытии
            // (pull → push → pull → push...), из-за чего приложение тормозит.
            // Локальная копия сохраняется с тем же ts, что и в облаке:
            // следующее открытие увидит «актуально» и не сделает ни одной записи.
            try { localStorage.setItem("dictionaryGameState", JSON.stringify(state)); } catch (e) {}
            // перерисовать видимые экраны
            if (currentScreen === "main-menu") { try { showMainMenu(); } catch (e) {} }
            else if (currentScreen === "progress-screen") { try { renderProgress(); } catch (e) {} }
            else if (currentScreen === "welcome-screen" && state.playerName) { try { showMainMenu(); } catch (e) {} }
        } catch (e) {}
    }

    let bootDone = false;
    let ready = false;
    let bootInfo = ""; // что сделал boot: из облака / отправка в облако / пусто / ошибка
    let writeOk = null;
    function queuePush(info) {
        pendingEnv = pack();
        // После пуша локальный ts = ts отправки: следующее открытие увидит
        // совпадение и не станет делать лишний пуш.
        try { state.savedAt = pendingEnv.ts; localStorage.setItem("dictionaryGameState", JSON.stringify(state)); } catch (e) {}
        flushSave();
        bootInfo = info;
    }
    async function runBoot(hasLocal) {
        if (bootDone) return;
        bootDone = true;
        // Снимаем ts ДО await: refreshFeatureUnlocks/initDaily на старте могут
        // поднять savedAt, и сравнение стало бы «локаль новее» каждый раз.
        const localTs = Number(state.savedAt) || 0;
        try {
            const remote = await readAll();
            const remoteTs = Number(remote && remote.main && remote.main.ts) || 0;
            if (!remote) {
                // облако пустое: первый пуш локальных данных, если они есть
                if (hasLocal) {
                    const hasAny = (state.learnedWords && state.learnedWords.length) ||
                        (state.favoriteWords && state.favoriteWords.length) ||
                        (state.wrongWords && state.wrongWords.length) ||
                        Object.keys(state.history || {}).length > 0 ||
                        (Number(state.xp) || 0) > 0 || (Number(state.score) || 0) > 0 ||
                        (USER_WORDS && USER_WORDS.length > 0);
                    if (hasAny) queuePush("отправка в облако");
                    else bootInfo = "облако пусто";
                } else bootInfo = "нет данных";
            } else if (remoteTs > localTs) {
                applyRemote(remote);
                bootInfo = "из облака";
            } else if (remoteTs < localTs && hasLocal) {
                // локальное свежее (играли офлайн) — выталкиваем его в облако
                queuePush("локаль новее");
            } else bootInfo = "актуально";
            // при равенстве — облако уже записано этим же сохранением
        } catch (e) { bootInfo = "ошибка применения"; }
        ready = true;
    }
    // telegram-web-app.js подключается async в head и на медленной сети может
    // появиться ПОЗЖЕ script.js: boot раньше «сгорал» здесь навсегда
    // (bootDone=true без retry) — синхронизация не работала до перезапуска
    // приложения. Теперь ждём SDK до ~20 с и бустим boot, когда он появился.
    function boot(hasLocal) {
        if (bootDone) return;
        if (cloudOK()) { runBoot(hasLocal); return; }
        bootInfo = "ждёт SDK";
        let tries = 0;
        const iv = setInterval(() => {
            if (bootDone) { clearInterval(iv); return; }
            if (cloudOK()) { clearInterval(iv); runBoot(hasLocal); return; }
            if (++tries >= 40) { clearInterval(iv); bootDone = true; bootInfo = "SDK не появился"; }
        }, 500);
    }

    // Полная очистка облака (полный сброс данных): пишем пустой конверт со
    // свежим ts — другие устройства при следующем старте тоже обнулятся.
    async function wipe() {
        pendingEnv = null;
        if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
        if (!cloudOK()) return;
        try {
            const wn = parseInt((await csGet(K_WN)) || "0", 10) || 0;
            const stale = [K_LEARN, K_HIST, K_EXTRA, K_WN];
            for (let i = 0; i < Math.min(Math.max(wn, lastWordKeys), WKEYS_MAX); i++) stale.push("nz_w" + i);
            if (stale.length > 2) await csRemove(stale);
            wiping = true;
            const env = pack();
            env.m = scalarsPack(DEFAULTS);
            env.ts = Date.now();
            env.L = ""; env.xl = []; env.F = ""; env.xf = []; env.W = ""; env.xw = [];
            env.hx = ""; env.C = null;
            lastWordKeys = 0;
            lastSyncSent = 0;
            await writeAll(env);
        } catch (e) {}
    }

    // ── Кап своих слов: тосты на порогах + строка-счётчик ──
    const CAP_TOASTED = { 900: false, 950: false, 990: false, 1000: false };
    function checkWordsCap() {
        try {
            const n = (USER_WORDS || []).length;
            const packed = Math.min(n, WORDS_CAP);
            const marks = [900, 950, 990];
            for (let i = 0; i < marks.length; i++) {
                if (packed >= marks[i] && !CAP_TOASTED[marks[i]]) {
                    CAP_TOASTED[marks[i]] = true;
                    showInfoToast("Облако почти заполнено: " + packed + " из " + WORDS_CAP + " слов");
                    break;
                }
            }
            if (n > WORDS_CAP && !CAP_TOASTED[1000]) {
                CAP_TOASTED[1000] = true;
                showInfoToast("Лимит облачной синхронизации (" + WORDS_CAP + "). Слово сохранено только на этом устройстве");
            }
        } catch (e) {}
    }
    function updateUwCapLine() {
        try {
            const el = document.getElementById("uw-cap-line");
            if (!el) return;
            el.style.fontSize = "12px";
            el.style.lineHeight = "1.35";
            el.style.textAlign = "center";
            el.style.margin = "8px 4px 0";
            const n = (USER_WORDS || []).length;
            if (!cloudOK()) {
                el.style.color = "#9a90b8";
                el.textContent = "Слова хранятся локально на этом устройстве";
                return;
            }
            const synced = Math.min(n, WORDS_CAP, lastSyncSent > 0 ? lastSyncSent : WORDS_CAP);
            el.style.color = n > WORDS_CAP ? "#ffb05c" : "#9a90b8";
            el.textContent = (n > WORDS_CAP)
                ? ("Синхронизировано " + synced + " из " + n + " слов — остальное хранится только на этом устройстве")
                : ("Облачная синхронизация: " + synced + " из " + WORDS_CAP + " слов");
        } catch (e) {}
    }

    // Срочная выгрузка при закрытии/свёртывании мини-аппа
    try {
        window.addEventListener("pagehide", () => { if (pendingEnv) flushSave(); });
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden" && pendingEnv) flushSave();
        });
    } catch (e) {}

    return {
        pack: pack,
        boot: boot,
        scheduleSave: scheduleSave,
        flushSave: flushSave,
        wipe: wipe,
        readCloud: readAll,
        applyRemoteState: applyRemote,
        checkWordsCap: checkWordsCap,
        updateUwCapLine: updateUwCapLine,
        isCloud: cloudOK,
        booted: () => ready,
        bootInfo: () => bootInfo,
        capLineSent: () => lastSyncSent,
        capFlags: () => CAP_TOASTED,
        // тест-хук: повторный прогон boot-логики в той же странице
        _reboot: (hasLocal) => { bootDone = false; ready = false; return boot(hasLocal); },
        WORDS_CAP: WORDS_CAP
    };
})();


// ===== ПРОГРЕССИВНОЕ ОТКРЫТИЕ =====
// Кампания: уроки → первая игра → карточки → продвинутое → свобода.
// После FREE_WORDS всё открыто. Поля: lessons / words — порог из них должен быть выполнен.
const FREE_WORDS = 200;
const PROGRESSION = {
    input:     { name: "Ввод слов",          lessons: 3, words: 0,   label: "Пройди 3 урока" },
    quiz:      { name: "5 к 1",              lessons: 3, words: 0,   label: "Пройди 3 урока" },
    cards:     { name: "Собери предложение", words: 20,              label: "Выучи 20 слов" },
    listening: { name: "Услышь слово",       words: 40,              label: "Выучи 40 слов" },
    stats:     { name: "Статистика",         words: 60,              label: "Выучи 60 слов" },
    themes:    { name: "Темы",               words: 80,              label: "Выучи 80 слов" },
    ownWords:  { name: "Мои слова",          words: 80,              label: "Выучи 80 слов" },
    speed:     { name: "Скоростной режим",   words: 100,             label: "Выучи 100 слов" }
};

function allLessons() {
    const ja = isJa();
    return [].concat(
        (ja ? (JA_A1A2_LESSONS || []) : (A1A2_LESSONS || [])),
        (ja ? (JA_B1B2_LESSONS || []) : (B1B2_LESSONS || []))
    );
}

function completedLessonCount() {
    return allLessons().filter(l => state.lessonDone[l.id]).length;
}

function isFeatureUnlocked(id) {
    if (state.learnedWords.length >= FREE_WORDS) return true;
    const need = PROGRESSION[id];
    if (!need) return true;
    if (need.lessons && completedLessonCount() < need.lessons) return false;
    if (need.words && state.learnedWords.length < need.words) return false;
    return true;
}

function featureNeed(id) {
    const need = PROGRESSION[id];
    if (!need) return null;
    if (need.lessons && completedLessonCount() < need.lessons) return need.label;
    if (need.words && state.learnedWords.length < need.words) return need.label;
    return null;
}

function markLessonDone(id) {
    if (!id || state.lessonDone[id]) return;
    state.lessonDone[id] = true;
    saveData();
    refreshFeatureUnlocks();
    Sound.unlock();
}

// Отслеживает только что появившиеся возможности и показывает тост 🔓
function refreshFeatureUnlocks(silent) {
    const now = [];
    for (const id in PROGRESSION) {
        if (isFeatureUnlocked(id)) now.push(id);
    }
    const prev = state.unlockedFeatures || [];
    const fresh = now.filter(id => !prev.includes(id));
    state.unlockedFeatures = now;
    if (!silent) {
        fresh.forEach(id => {
            pushToast("🔓", "Новая возможность", PROGRESSION[id].name);
        });
    }
    state.lastUnlockCheck = state.learnedWords.length;
    // На старте (silent) пересчёт ничего не меняет — не дёргаем saveData():
    // он поднимал savedAt и заставлял boot каждый раз решать «локаль новее».
    if (!silent || fresh.length) saveData();
}

// Очередь плашек (#ach-toasts): на экране висит ОДНА плашка, остальные ждут,
// пока текущая не уедет. Вместо прежней стопки из трёх с малым зазором.
// push(build, ms, onShow): build() создаёт и возвращает элемент (или null, если
// хоста нет — тогда сразу показываем следующую), ms — время на экране.
const TOAST_QUEUE = (() => {
    const q = [];
    let busy = false;
    function push(build, ms, onShow) {
        q.push({ build, ms, onShow });
        if (!busy) next();
    }
    function next() {
        const item = q.shift();
        if (!item) { busy = false; return; }
        const t = item.build();
        if (!t) { next(); return; }
        busy = true;
        if (item.onShow) item.onShow();
        setTimeout(() => t.classList.add("show"), 30);
        setTimeout(() => {
            t.classList.add("out");
            setTimeout(() => { t.remove(); next(); }, 500);
        }, item.ms);
    }
    return { push };
})();

function makeToastEl(cls, inner) {
    const host = document.getElementById("ach-toasts");
    if (!host) return null;
    const t = document.createElement("div");
    t.className = cls;
    t.innerHTML = inner;
    host.appendChild(t);
    return t;
}

// ===== PNG-иконки вместо системных эмодзи (UI/ICON) =====
// Плюшевые арты в тему: где замена есть — эмодзи рисуется картинкой,
// чего нет — остаётся системным глифом (список: смайлы_без_PNG.html).
const ICON_PNG = {
    "⭐": "UI/ICON/STAR.webp",         // бейдж уровня, тост уровня
    "⏰": "UI/ICON/BUDILNIK.webp",     // урок Present Perfect
    "🔗": "UI/ICON/CEP.webp",         // уроки: форма て, сложные предложения
    "💬": "UI/ICON/CHAT.webp",        // подрежим «Предложения», косвенная речь
    "👤": "UI/ICON/CHEL.webp",        // местоимения, колода игрока
    "➕": "UI/ICON/CHELCPLUSOM.webp", // «Добавить слово»
    "🎬": "UI/ICON/KINO.webp",        // урок Past Continuous
    "🔔": "UI/ICON/KOLOKOL.webp",     // «Тон 440 Гц»
    "📝": "UI/ICON/LIST.webp",        // подрежим «Слова», тест урока
    "🌟": "UI/ICON/LUNAZAVEZDA.webp", // «Уроки скоро появятся»
    "♪": "UI/ICON/NOTA.webp",         // топбар «ЗВУК»
    "⏳": "UI/ICON/PESCHASI.webp",     // урок Present Continuous
    "📍": "UI/ICON/TREK.webp",        // предлоги
    "⚖️": "UI/ICON/VESI.webp",        // уроки to be / です・ます
    "❓": "UI/ICON/VOPROS.webp",      // уроки: вопросы
    "🔊": "UI/ICON/GROMOFON'.webp",   // дейлик «Слушатель», вкл. озвучку
    "🏆": "UI/ICON/KUBOK.webp",       // бонус за все дейлики
    "⚡": "UI/ICON/MOLNIA.webp",      // дейлик «Скоростной», наречия
    "🎧": "UI/ICON/NAUSH.webp",       // «Услышь слово», маска аудирования
    "🎨": "UI/ICON/PALITRA.webp",     // прилагательные, награды-темы, changelog
    "🔀": "UI/ICON/STRELKI.webp",     // «Смешать», «Перемешать»
    "🔁": "UI/ICON/STREL_2.webp",     // «Ещё раз», «Пройти ещё раз»
    "🏠": "UI/ICON/DOM.webp",         // существительные, «В главное меню»
    "✏️": "UI/ICON/KARANDASH.webp",   // «Ввод слов»
    "🇦": "UI/ICON/BUKVAA.webp",      // уровень А1-А2
    "🇧": "UI/ICON/BUKVAB.webp",      // уровень Б1-Б2
    "🏃": "UI/ICON/BEGUN.webp",       // глаголы
    "🔢": "UI/ICON/CIFRI.webp",       // «5 к 1», числительные, уроки чисел
    "📗": "UI/ICON/KNIGA_ZEL.webp",   // вкладка уроков А1-А2
    "📙": "UI/ICON/KNIGA_ORANGE.webp", // вкладка уроков Б1-Б2
    "🎴": "UI/ICON/KARTINA.webp"      // «Собери предложение» — карта с пейзажем
};
// Волна 3: контролы, сообщения, ачивки, иконки уроков
Object.assign(ICON_PNG, {
    "🔓": "UI/ICON/ZAMOK.webp",       // тосты «Разблокировано»
    "✅": "UI/ICON/GALKA_2.webp",     // урок изучен, дейлик «Экзамен»
    "✔": "UI/ICON/GALKA.webp",        // «Проверить», «ВЕРНО ! ✔»
    "✓": "UI/ICON/GALKA.webp",        // «Скопировано ✓»
    "✕": "UI/ICON/KREST.webp",        // закрытие модалок и чипа
    "⏸": "UI/ICON/PAUZA.webp",        // «Пауза» (аудио уроков)
    "▶": "UI/ICON/START.webp",        // «Слушать / Продолжить» (уроки)
    "■": "UI/ICON/STOP.webp",         // «Стоп» (аудио уроков)
    "🗑": "UI/ICON/TRASH.webp",       // удаление слова, «Удалить все данные»
    "👂": "UI/ICON/UHO.webp",         // «Аудирование» (карточки)
    "📋": "UI/ICON/DEKA.webp",        // «Все» / «Всё сразу» / «Копировать»
    "♻": "UI/ICON/RECYCLE.webp",      // «Сбросить прогресс»
    "🎉": "UI/ICON/PRAZDNIK.webp",    // результат теста ≥70%
    "💪": "UI/ICON/BICEPS.webp",      // результат теста ≥50%, уроки can/must
    "📖": "UI/ICON/KNIGA_BLUE.webp",  // результат теста <50%, дейлики
    "👆": "UI/ICON/PALEC.webp",       // «Пока нет своих слов»
    "💡": "UI/ICON/LAMPA.webp",       // пояснение к ответу, примечание
    "🤖": "UI/ICON/BOT.webp",         // колода бота (битва)
    "✦": "UI/ICON/ROMB.webp",         // масть на картах «Собери предложение»
    "📌": "UI/ICON/PIN.webp",         // «Запомните» (итог урока)
    "🏅": "UI/ICON/MEDAL.webp",       // ачивки: тост и медаль
    "🎯": "UI/ICON/TARGET.webp",      // дейлик «Разминка»
    "🔥": "UI/ICON/FIRE.webp",        // дейлик «Серия 10»
    "💎": "UI/ICON/DIAMOND.webp",     // дейлик «Безупречно»
    "📏": "UI/ICON/LINE.webp",        // уроки степеней сравнения
    "🔮": "UI/ICON/SHAR.webp",        // урок «Будущее: will / going to»
    "🕵️": "UI/ICON/DETECTIVE.webp",   // урок «Предположения: must / might»
    "🧩": "UI/ICON/MOZAIKA.webp",     // уроки «Частицы», «Условные»
    "🧱": "UI/ICON/WALL.webp",        // урок «Порядок слов»
    "🔤": "UI/ICON/ABC.webp",         // урок «Хирагана и катакана»
    "⏮️": "UI/ICON/STRELKI_2.webp",   // урок «Прошедшее время» (ja)
    "📦": "UI/ICON/BOX.webp",         // урок «Номинализация» (ja)
    "🔄": "UI/ICON/REVERS.webp",      // урок «Страдательный залог» (ja)
    "↺": "UI/ICON/REVERS.webp",       // «Сброс» (режим карточек)
    "🎩": "UI/ICON/HAT.webp",         // урок «Вежливая речь: кэго» (ja)
    "🎮": "UI/ICON/PAD.webp",         // changelog «Игры и режимы»
    "🔧": "UI/ICON/KLUCH.webp",       // changelog «Исправления»
    "💾": "UI/ICON/DISCKETA.webp",    // changelog «Запуск»
    "←": "UI/ICON/STRELA_LEVO.webp",  // кнопки «Назад»
    "→": "UI/ICON/STRELA_PRAVO.webp"  // кнопки «Далее / Следующий»
});

// Эмодзи -> <img> по карте; чего нет в карте — вернуть как есть
function iconHTML(emoji, cls) {
    const src = ICON_PNG[String(emoji)];
    if (!src) return String(emoji);
    return '<img class="' + (cls || "ico-png") + '" src="' + src + '" alt="">';
}

// Экранирование для innerHTML с внешними текстами (заголовки уроков)
function escHTML(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Универсальный тост-уведомление (появляется снизу экрана на 4.5с)
function pushToast(icon, label, name) {
    TOAST_QUEUE.push(() => makeToastEl("ach-toast level-toast",
        '<span class="ach-icon">' + iconHTML(icon) + '</span><span class="ach-meta">' +
        (label ? '<span class="ach-label">' + label + '</span>' : "") +
        '<span class="ach-name">' + name + '</span></span>'), 4500);
}

function showInfoToast(text) {
    pushToast('<img class="lock-ic" src="UI/Zamok.webp" alt="">', "", text);
}

function applyMenuProgression() {
    document.querySelectorAll("#main-menu .menu-btn[data-lock]").forEach(btn => {
        const feat = btn.getAttribute("data-lock");
        if (isFeatureUnlocked(feat)) {
            btn.classList.remove("locked");
            btn.setAttribute("data-lock-hint", "");
        } else {
            btn.classList.add("locked");
            btn.setAttribute("data-lock-hint", featureNeed(feat) || "Раскроется позже");
        }
    });
    randomizeLockTiming(document.getElementById("main-menu"));
}

// Каждому замку — своя случайная скорость и фаза покачивания (задаётся один раз)
function randomizeLockTiming(root) {
    if (!root) return;
    root.querySelectorAll(".locked, .lock-ic").forEach(el => {
        if (el.style.getPropertyValue("--lock-dur")) return;
        el.style.setProperty("--lock-dur", (4 + Math.random() * 2.5).toFixed(2) + "s");
        el.style.setProperty("--lock-phase", (Math.random() * 3).toFixed(2) + "s");
    });
}

function applyModeProgression() {
    document.querySelectorAll("#mode-screen .menu-btn[data-lock]").forEach(btn => {
        const feat = btn.getAttribute("data-lock");
        if (isFeatureUnlocked(feat)) {
            btn.classList.remove("locked");
            btn.setAttribute("data-lock-hint", "");
        } else {
            btn.classList.add("locked");
            btn.setAttribute("data-lock-hint", featureNeed(feat) || "Раскроется позже");
        }
    });
    randomizeLockTiming(document.getElementById("mode-screen"));
}

// Заблокированные кнопки: перехватываем клик и показываем подсказку
document.addEventListener("click", (e) => {
    const locked = e.target.closest(".locked");
    if (!locked) return;
    if (currentScreen !== "main-menu" && !locked.closest("#mode-screen")) return;
    e.preventDefault();
    e.stopPropagation();
    showInfoToast(locked.getAttribute("data-lock-hint") || "Раскроется позже");
}, true);

// Главное меню: сначала проигрываем анимацию нажатия и только потом переключаем экран.
// Инлайновый onclick кнопки вызываем сами, поэтому он не срабатывает дважды.
const MENU_PRESS_MS = 240;
(function setupMenuPressAnimation() {
    const menu = document.getElementById("main-menu");
    if (!menu) return;
    menu.addEventListener("click", (e) => {
        const btn = e.target.closest(".menu-btn");
        if (!btn || btn.classList.contains("locked")) return;
        if (btn.dataset.pressBusy === "1") return;
        const fn = btn.onclick;
        if (typeof fn !== "function") return;
        e.preventDefault();
        e.stopPropagation();
        btn.dataset.pressBusy = "1";
        btn.classList.add("is-pressing");
        setTimeout(() => {
            btn.classList.remove("is-pressing");
            delete btn.dataset.pressBusy;
            fn.call(btn, e);
        }, MENU_PRESS_MS);
    }, true);
})();

// Кнопки «Назад» и кнопки меню на остальных экранах: тот же активный вид
// (арт с розовой окантовкой + вжатие) и та же задержка перед переходом.
// Главное меню обрабатывается setupMenuPressAnimation выше — его пропускаем.
(function setupNavPressAnimation() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".back-btn, .back-to-menu, .menu-btn");
        if (!btn || btn.closest("#main-menu")) return;
        if (btn.classList.contains("locked")) return;
        if (btn.dataset.pressBusy === "1") return;
        // «Назад» из словаря: ~2000 пунктов всё ещё дорисовываются порциями.
        // Любая задержка здесь оставляет телефон в фризе — уходим сразу.
        if (btn.closest("#dictionary-screen")) { fn.call(btn, e); return; }
        const fn = btn.onclick;
        if (typeof fn !== "function") return;
        e.preventDefault();
        e.stopPropagation();
        btn.dataset.pressBusy = "1";
        btn.classList.add("is-pressing");
        setTimeout(() => {
            btn.classList.remove("is-pressing");
            delete btn.dataset.pressBusy;
            fn.call(btn, e);
        }, MENU_PRESS_MS);
    }, true);
})();

// ===== XP И УРОВНИ =====
const XP_LEVELS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450];

/* Уровень по накопленному опыту — нужна для миграции старых сохранений */
function levelFromXp(xp) {
    let lvl = 1;
    while (lvl < 20 && xp >= XP_LEVELS[Math.min(lvl + 1, XP_LEVELS.length - 1)]) lvl++;
    return lvl;
}

function xpForLevel(n) {
    const i = Math.min(Math.max(0, Math.floor(Number(n) || 1)), XP_LEVELS.length - 1);
    return XP_LEVELS[i] != null ? XP_LEVELS[i] : 99999;
}
function xpForNext() { return xpForLevel(state.level + 1); }
function xpProgress() { return Math.max(0, state.xp - xpForLevel(state.level)); }
function xpRange() { return xpForNext() - xpForLevel(state.level); }

function addXp(amount) {
    if (amount <= 0 || state.level >= 20) return;
    state.xp += amount;
    while (state.level < 20 && state.xp >= xpForNext()) {
        state.level++;
        onLevelUp(state.level);
    }
    if (state.level >= 20) {
        state.xp = 10450;
    }
    saveData();
}

function onLevelUp(lvl) {
    const reward = LEVEL_REWARDS.find(r => r.level === lvl);
    const msg = reward ? `${iconHTML("🔓")} Разблокировано: ${reward.name} !` : `Уровень ${lvl} !`;
    showLevelToast(msg);
    Sound.unlock();
}

function showLevelToast(text) {
    TOAST_QUEUE.push(() => makeToastEl("ach-toast level-toast",
        '<span class="ach-icon">' + iconHTML("⭐") + '</span><span class="ach-meta"><span class="ach-label">Уровень</span><span class="ach-name">' + text + '</span></span>'), 4500);
}

// ===== ДЕЙЛИКИ =====
const DAILY_QUESTS = [
    { id: "warmup",    name: "Разминка",        desc: "Ответить правильно 10 раз",   icon: "🎯", target: 10 },
    { id: "speedrun",  name: "Скоростной",       desc: "Набрать 50 очков в скорости", icon: "⚡", target: 50 },
    { id: "streak10",  name: "Серия 10",         desc: "10 правильных подряд",        icon: "🔥", target: 10 },
    { id: "learn3",    name: "Новичок",          desc: "Выучить 3 новых слова",        icon: "📖", target: 3 },
    { id: "lesson1",   name: "Студент",          desc: "Прочитать 1 урок",            icon: "📚", target: 1 },
    { id: "quiz1",     name: "Экзамен",          desc: "Пройти 1 тест",               icon: "✅", target: 1 },
    { id: "dict1",     name: "Справочник",       desc: "Открыть словарь",              icon: "📖", target: 1 },
    { id: "cards3",    name: "Собиратель",       desc: "Пройти 3 раунда карточек",     icon: "🃏", target: 3 },
    { id: "sound5",    name: "Слушатель",        desc: "Прослушать 5 озвучек",         icon: "🔊", target: 5 },
    { id: "perfect",   name: "Безупречно",       desc: "Закончить раунд без ошибок",   icon: "💎", target: 1 }
];
const DAILY_XP = 25;
const DAILY_BONUS_XP = 100;

function initDaily() {
    const today = todayKey();
    if (!state.daily || state.daily.date !== today) {
        state.daily = { date: today, prog: {}, done: [], bonus: false };
        DAILY_QUESTS.forEach(q => { state.daily.prog[q.id] = 0; });
        saveData();
    }
}

function questProgress(id, n) {
    if (!state.daily) initDaily();
    const q = DAILY_QUESTS.find(x => x.id === id);
    if (!q || state.daily.done.includes(id)) return;
    state.daily.prog[id] = Math.min((state.daily.prog[id] || 0) + n, q.target);
    if (state.daily.prog[id] >= q.target) {
        state.daily.done.push(id);
        addXp(DAILY_XP);
        showDailyToast(q);
    }
    if (state.daily.done.length === DAILY_QUESTS.length && !state.daily.bonus) {
        state.daily.bonus = true;
        addXp(DAILY_BONUS_XP);
        showDailyBonusToast();
    }
    saveData();
}

function showDailyToast(q) {
    TOAST_QUEUE.push(() => makeToastEl("ach-toast daily-toast",
        '<span class="ach-icon">' + iconHTML(q.icon) + '</span><span class="ach-meta"><span class="ach-label">Дейлик выполнен</span><span class="ach-name">' + q.name + ' <span style="color:#5ff55f">+' + DAILY_XP + ' XP</span></span></span>'), 3500);
}

function showDailyBonusToast() {
    TOAST_QUEUE.push(() => makeToastEl("ach-toast daily-toast",
        '<span class="ach-icon">' + iconHTML("🏆") + '</span><span class="ach-meta"><span class="ach-label">Все дейлики выполнены !</span><span class="ach-name">Бонус <span style="color:#5ff55f">+' + DAILY_BONUS_XP + ' XP</span></span></span>'), 5000);
}

// Награды по уровням: темы, рубашки, фоны
const LEVEL_REWARDS = [
    { level: 1,  type: "back",     id: "b2",  name: "Рубашка «Закат»" },
    { level: 2,  type: "wordbg",   id: "w2",  name: "Фон «Чай»" },
    { level: 3,  type: "back",     id: "b3",  name: "Рубашка «Лес»" },
    { level: 4,  type: "theme",    id: "wabi", name: "Тема «Ваби-саби»" },
    { level: 5,  type: "back",     id: "b4",  name: "Рубашка «Океан»" },
    { level: 6,  type: "wordbg",   id: "w3",  name: "Фон «Шалфей»" },
    { level: 7,  type: "back",     id: "b5",  name: "Рубашка «Золото»" },
    { level: 8,  type: "theme",    id: "witcher", name: "Тема «Witcher»" },
    { level: 9,  type: "back",     id: "b6",  name: "Рубашка «Вишня»" },
    { level: 10, type: "wordbg",   id: "w4",  name: "Фон «Полночь»" },
    { level: 11, type: "back",     id: "b7",  name: "Рубашка «Сумерки»" },
    { level: 12, type: "theme",    id: "syberia", name: "Тема «Syberia»" },
    { level: 13, type: "back",     id: "b8",  name: "Рубашка «Пепел»" },
    { level: 14, type: "wordbg",   id: "w5",  name: "Фон «Персик»" },
    { level: 15, type: "back",     id: "b9",  name: "Рубашка «Ночь»" },
    { level: 16, type: "wordbg",   id: "w6",  name: "Фон «Мох»" },
    { level: 17, type: "back",     id: "b10", name: "Рубашка «Терракота»" },
    { level: 18, type: "wordbg",   id: "w7",  name: "Фон «Лаванда»" },
    { level: 19, type: "back",     id: "b11", name: "Рубашка «Syberia»" },
    { level: 20, type: "wordbg",   id: "w8",  name: "Фон «Уголь»" },
    { level: 21, type: "theme",    id: "plush", name: "Тема «PLUSH»" }
];

let currentScreen = "welcome-screen";

// Список словаря строится порциями (filterDictionary): счётчик отменяет
// незавершённые порции прошлого рендера при новом поиске/фильтре/уходе.
let dictBuildToken = 0;

/* Рамка поверх ВСЕХ слоёв: элемент #top-frame живёт в body (вне стек-контекстов
   экранов), позиционируется по панели активного экрана и следует за скроллом. */
(function () {
    let topFrame = null;
    let raf = 0;
    let delayed = 0;
    let watching = false;
    let pinLast = { l: 0, t: 0, w: 0, h: 0 };
    let fitCache = { w: 0, h: 0, screen: null, fit: 0 };
    // Интро уже показало обои и рамку через __bootBackdrop: до начала
    // затухания pin() не должен их прятать, даже если его позовут
    // из-за resize/scroll посреди ролика.
    let bootBackdrop = false;
    const framesOnly = /frameonly|fo=1/.test(location.search);

    // ПК-версия скрыта: на широком окне приложение живёт в телефонной колонке
    // по центру (ширина телефона), а не растягивается на весь экран. Все
    // расчёты — отступы рамки, --ui-fit, подложка — идут от «сцены», а не окна.
    const PHONE_STAGE_W = 420;
    const PHONE_STAGE_H = 940;
    // Клавиатура в Telegram Android сжимает САМ WebView: innerHeight и svh
    // уменьшаются. Держим высоту ЗАМОРОЖЕННОЙ в пикселях, пока она открыта, —
    // рамка и контент не перестраиваются под уменьшившееся окно.
    let stableVH = window.innerHeight;
    let stableVW = window.innerWidth;
    let kbOpen = false;
    function applyVhVar() {
        try {
            document.documentElement.style.setProperty('--app-vh',
                (kbOpen ? stableVH : window.innerHeight) + 'px');
        } catch (e) {}
    }
    function checkKeyboard() {
        const ih = window.innerHeight;
        const vh = (window.visualViewport && window.visualViewport.height) || ih;
        // Поворот/широкое окно — это не клавиатура: просто фиксируем новую высоту.
        if (Math.abs(window.innerWidth - stableVW) > 60) {
            stableVW = window.innerWidth;
            stableVH = ih;
            kbOpen = false;
            try { document.body.classList.remove("kb-open"); } catch (e) {}
            applyVhVar();
            return;
        }
        const next = ih < stableVH - 120 || vh < stableVH - 120;
        if (next === kbOpen) {
            if (!kbOpen && Math.abs(ih - stableVH) > 2) { stableVH = ih; applyVhVar(); }
            return;
        }
        kbOpen = next;
        try { window.__nzKbOpen = kbOpen; } catch (e) {}
        if (!kbOpen) stableVH = ih;
        applyVhVar();
        // НЕ вызываем pin() при смене клавиатуры: он переставляет рамку.
        // Позиция и размер остаются ровно теми, что были до её появления.
        try { document.body.classList.toggle("kb-open", kbOpen); } catch (e) {}
    }
    applyVhVar();
    window.addEventListener("resize", checkKeyboard);
    try { if (window.visualViewport) window.visualViewport.addEventListener("resize", checkKeyboard); } catch (e) {};
    function stageRect() {
        const iw = window.innerWidth, ih = kbOpen ? stableVH : window.innerHeight;
        // Фулскрин Telegram: плавающие кнопки («Закрыть», «∨ ⋮») и системные
        // полосы перекрывают края окна — сцена строится в оставшемся проёме.
        // На ПК и без Telegram оверлеи нулевые — поведение прежнее.
        const ov = window.__tgOvl || { top: 0, bottom: 0 };
        const oT = Math.max(0, Math.round(ov.top || 0));
        const oB = Math.max(0, Math.round(ov.bottom || 0));
        const availH = Math.max(ih - oT - oB, 200);
        const w = Math.min(iw, PHONE_STAGE_W);
        const h = Math.min(availH, PHONE_STAGE_H);
        const slack = Math.max(availH - h, 0) / 2;
        return { x: Math.round((iw - w) / 2), y: Math.round(oT + slack), w: w, h: h, yb: Math.round(oB + slack) };
    }
    function applyStageVars(st) {
        const root = document.documentElement.style;
        root.setProperty('--app-stage-x', st.x + 'px');
        root.setProperty('--app-stage-y', st.y + 'px');
        // Раздельные отступы сцены по вертикали: в фулскрине Telegram верх
        // и низ съедаются по-разному (кнопки сверху, системный бар снизу).
        root.setProperty('--app-stage-yt', st.y + 'px');
        root.setProperty('--app-stage-yb', (st.yb != null ? st.yb : st.y) + 'px');
        root.setProperty('--app-stage-w', st.w + 'px');
        root.setProperty('--app-stage-h', st.h + 'px');
    }

    // Клин плашек ачивок (#ach-toasts): inset() считается ВНИЗ от нижней
    // границы хоста, поэтому клип-линия ниже хоста — отрицательный inset.
    // clipDist — желаемая клип-линия от нижнего края окна: в высоком окне —
    // верхняя кромка нижнего канта рамки (3.16% высоты сцены), на телефоне
    // и в низком окне (st.y = 0, сцена доходит до края) — сам край экрана.
    function applyAchClip(st, fb) {
        // Якорь клипа — НИЖНЯЯ кромка сцены (st.yb): в фулскрине Telegram
        // она выше края окна (снизу системный бар). Раньше нижняя кромка
        // совпадала с верхней (st.y), потому что сцена была симметричной.
        const clipDist = st.yb <= 0.5 ? 0 : (st.yb + st.h * 0.0316);
        const achClipB = clipDist - (st.yb + fb + 16);
        document.documentElement.style.setProperty('--ach-clip-b', achClipB.toFixed(1) + 'px');
    }

    // Показ подложки BG_PIC строго синхронно с рамкой (никогда не отдельно от неё)
    function setBg(v) {
        const b = document.getElementById("bg-inset");
        if (b) b.style.display = v ? "block" : "none";
    }

    // Авто-адаптация интерфейса: масштаб кнопок/зазоров под доступный проём рамки.
    function applyFit(fit) {
        const gap = Math.max(5, Math.min(12, Math.round(10 * fit)));
        const btn = Math.max(32, Math.min(52, Math.round(46 * fit)));
        const pad = Math.max(10, Math.min(36, Math.round(28 * fit)));
        const spad = Math.max(5, Math.min(14, Math.round(10 * fit)));
        const root = document.documentElement.style;
        root.setProperty('--ui-fit', fit.toFixed(3));
        root.setProperty('--menu-gap', gap + 'px');
        root.setProperty('--btn-h', btn + 'px');
        root.setProperty('--panel-pad', pad + 'px');
        root.setProperty('--screen-pad', spad + 'px');
        root.setProperty('--btn-fs', Math.max(9, Math.min(13, Math.round(11 * fit))) + 'px');
    }

    function fitUI(screenId) {
        const stage = stageRect();
        applyStageVars(stage);
        const iw = stage.w, ih = stage.h;
        if (iw === fitCache.w && ih === fitCache.h && screenId === fitCache.screen) return;
        const root = document.documentElement.style;
        // Реальная высота топбара (может переноситься на узких экранах).
        if (document.body && document.body.classList.contains('radio-hidden')) {
            root.setProperty('--topbar-h', '0px');
        } else {
            const tb = document.querySelector('.topbar');
            if (tb) {
                const h = Math.round(tb.getBoundingClientRect().height);
                if (h > 0) root.setProperty('--topbar-h', h + 'px');
            }
        }
        const topbarH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 36;
        const l = iw * 0.0684, r = iw * 0.0701, t = ih * 0.0722, b = ih * 0.0897;
        const holeW = Math.max(120, iw - l - r);
        const holeH = Math.max(160, ih - t - b - topbarH);
        const fitH = holeH / 620;
        const fitW = holeW / 360;
        let fit = Math.max(0.55, Math.min(1.25, Math.min(fitH, fitW)));
        // «Уроки»: текст карточек свёрстан под масштаб 1.0 — выше он
        // не влезает в пропорцию плашки
        if (screenId === "lessons-screen") fit = Math.min(fit, 1);
        // Базовый масштаб ДО ужимания стражем: им пользуется кнопка «Назад»
        // в «Словаре» — она должна оставаться как в «Настройках», даже когда
        // экран словаря ужат до 0.55 (длинный прокручиваемый список слов).
        root.setProperty('--ui-fit-base', fit.toFixed(3));
        applyFit(fit);
        // Обратная связь: если контент активного экрана не влезает — ужимаем ещё.
        const sc = screenId ? document.getElementById(screenId) : null;
        if (!sc) return;
        let guard = 0;
        // Скроллируемые списки («Прогресс», «Уроки») не ужимаем: ужатие
        // масштаба не уменьшает контент, а страж гонит fit к 0.55 впустую.
        // Экран урока — тоже: текст идёт длинной лентой и всегда вписывается
        // по высоте (прокрутка внутри .lesson-body), а ужимание уводило
        // кнопки («К урокам», озвучка, «Следующий») к 55% — они выглядели
        // мельче и другой формы, чем «Назад» на остальных экранах.
        // «Настройки» — по той же причине: список длинный и прокручиваемый,
        // а страж гнал fit к 0.55 — строки и модалки выбора мельчали вдвое.
        // «Словарь» — аналогично: список слов всегда длиннее экрана, страж
        // гнал fit к 0.55 — карточки становились мелкими. Кнопка «Назад»
        // там от ужимания не зависит (считается от --ui-fit-base).
        const shrinkable = screenId !== "progress-screen" && screenId !== "lessons-screen" && screenId !== "lesson-screen" && screenId !== "settings-screen" && screenId !== "dictionary-screen" && screenId !== "user-words-screen";
        // «5 в 1»: без скролла поле должно влезать даже на коротких
        // телефонах, поэтому разрешаем стражу ужимать масштаб до 0.38.
        const battleArea = document.getElementById("battle-area");
        const minFit = (screenId === "game-screen" && battleArea && !battleArea.classList.contains("hidden")) ? 0.38 : 0.55;
        while (shrinkable && guard++ < 14 && sc.scrollHeight > sc.clientHeight + 2 && fit > minFit) {
            fit = Math.max(minFit, fit - 0.04);
            applyFit(fit);
        }
        fitCache = { w: iw, h: ih, screen: screenId, fit: fit };
    }

    // Принудительный повторный расчёт масштаба: кэш сбрасывается, страж
    // прогоняется заново по текущему лэйауту. Нужен бою: первый расчёт
    // случается до загрузки шрифтов и раздачи карт, и итоговый --ui-fit
    // зависел от момента вызова — одинаковые запуски давали разный
    // масштаб интерфейса (0.933 и 0.773 на одном и том же экране 390px).
    window.__refitScreenFit = function (id) {
        fitCache = { w: 0, h: 0, screen: null, fit: 0 };
        fitUI(id || currentScreen);
    };

    // Фон-подложка по реальному проёму кадра main-frame-v3 (1214x2627):
    // проём = 77px слева/справа, 75px сверху, 85px снизу. Доли считаются от
    // размеров СЦЕНЫ — кадр растянут ровно на неё (background 100% 100%).
    // ВАЖНО: значения здесь ОТНОСИТЕЛЬНЫЕ сцены; смещение сцены
    // (--app-stage-x/y) прибавляется в CSS (#bg-inset, #boot-screen::before).
    // Раньше #bg-inset был прибит к вьюпорту, и при леттербоксинге
    // (окно больше 420x940) фон заливал поля и выглядывал из-за рамки.
    // Нахлёст ov=20 прячет край фона (blur 2px) под непрозрачной кромкой рамки.
    // Минимумы: 3px по бокам/снизу (запас на blur), 17px сверху = подъём
    // анимации bgFloat 14px + 3px blur — чтобы при подъёме фон не выходил
    // за верх сцены из-под кромки рамки.
    function applyBgInsets() {
        const st = stageRect();
        applyStageVars(st);
        const iw = st.w, ih = st.h;
        const root = document.documentElement.style;
        const ov = 20;
        const l = Math.max(3, iw * 0.06343 - ov);
        const r = Math.max(3, iw * 0.06343 - ov);
        const t = Math.max(17, ih * 0.02855 - ov);
        const b = Math.max(3, ih * 0.03236 - ov);
        root.setProperty('--bg-l-px', l.toFixed(1) + 'px');
        root.setProperty('--bg-r-px', r.toFixed(1) + 'px');
        root.setProperty('--bg-t-px', t.toFixed(1) + 'px');
        root.setProperty('--bg-b-px', b.toFixed(1) + 'px');
    }

    // Рамка по размеру сцены: общая геометрия для pin() и для интро —
    // интро показываем уже «в интерьере», фон и рамка видны с первого кадра.
    function placeFrame() {
        const desW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-frame-w')) || 1100;
        const st = stageRect();
        const k = Math.min(1, st.w / desW);
        document.documentElement.style.setProperty('--ui-scale', String(k));
        const fb = st.h * 0.0897;
        document.documentElement.style.setProperty('--frame-l-px', (st.w * 0.0684).toFixed(1) + 'px');
        document.documentElement.style.setProperty('--frame-r-px', (st.w * 0.0701).toFixed(1) + 'px');
        document.documentElement.style.setProperty('--frame-t-px', (st.h * 0.0722).toFixed(1) + 'px');
        document.documentElement.style.setProperty('--frame-b-px', fb.toFixed(1) + 'px');
        // Клин плашек ачивок: inset() от нижней границы хоста, вниз (обычно
        // отрицательный). В высоком окне — кромка нижнего канта рамки; на
        // телефоне/в низком окне (сцена доходит до края) — сам край экрана.
        applyAchClip(st, fb);
        applyBgInsets();
        pinLast = { l: 0, t: 0, w: Math.round(window.innerWidth), h: Math.round(window.innerHeight) };
        topFrame.style.cssText = "position:fixed;pointer-events:none;z-index:100000;box-sizing:content-box;" +
            "display:block;top:" + st.y + "px;left:" + st.x + "px;" +
            "width:" + Math.round(st.w / k) + "px;height:" + Math.round(st.h / k) + "px;" +
            "transform-origin:top left;transform:scale(" + k + ");" +
            "background:url(\"UI/main-frame-v3.webp?v=frame5\") no-repeat center / 100% 100%;";
    }

    function pin(screenId) {
        fitUI(screenId);
        if (framesOnly) {
            if (!topFrame || !document.body.contains(topFrame)) {
                topFrame = document.createElement("div");
                topFrame.id = "top-frame";
                topFrame.className = "frame-overlay";
                document.body.appendChild(topFrame);
            }
            document.documentElement.classList.add("frames-only");
            topFrame.style.display = "block";
            const st = stageRect();
            applyStageVars(st);
            const desW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-frame-w')) || 1100;
            const k = Math.min(1, st.w / desW);
document.documentElement.style.setProperty('--ui-scale', String(k));
            const fb = st.h * 0.0897;
            document.documentElement.style.setProperty('--frame-l-px', (st.w * 0.0684).toFixed(1) + 'px');
            document.documentElement.style.setProperty('--frame-r-px', (st.w * 0.0701).toFixed(1) + 'px');
            document.documentElement.style.setProperty('--frame-t-px', (st.h * 0.0722).toFixed(1) + 'px');
            document.documentElement.style.setProperty('--frame-b-px', fb.toFixed(1) + 'px');
            applyAchClip(st, fb);
            applyBgInsets();
            const bx = st.w, by = st.h;
            topFrame.style.cssText = "position:fixed;pointer-events:none;z-index:100000;box-sizing:content-box;" +
                "display:block;top:" + st.y + "px;left:" + st.x + "px;" +
                "width:" + Math.round(bx / k) + "px;height:" + Math.round(by / k) + "px;" +
                "transform-origin:top left;transform:scale(" + k + ");" +
                "background:url(\"UI/main-frame-v3.webp?v=frame5\") no-repeat center / 100% 100%;";
            return;
        }
        const screen = document.getElementById(screenId);
        const panel = screen ? screen.querySelector(".panel, .menu-panel") : null;
        if (!topFrame || !document.body.contains(topFrame)) {
            topFrame = document.createElement("div");
            topFrame.id = "top-frame";
            topFrame.className = "frame-overlay";
            document.body.appendChild(topFrame);
        }
        if (!panel) { topFrame.style.display = "none"; setBg(false); pinLast = { l: 0, t: 0, w: 0, h: 0 }; return; }
        const r = panel.getBoundingClientRect();
        // Пока интро непрозрачно — рамку и фон не показываем. Но с момента
        // начала затухания (.anim-out) экран уже считается открытым: иначе
        // показанное под затухающим интро меню остаётся без рамки и фона.
        const bootEl = document.getElementById("boot-screen");
        if (bootEl && !bootEl.classList.contains("anim-out")) {
            if (bootBackdrop) {
                // Фон и рамку для интро уже поставил __bootBackdrop:
                // не трогаем их, только пересчитываем геометрию при ресайзе.
                const curH = kbOpen ? stableVH : window.innerHeight;
                if (Math.abs(window.innerWidth - pinLast.w) > 1 || Math.abs(curH - pinLast.h) > 1) placeFrame();
                return;
            }
            topFrame.style.display = "none"; setBg(false); pinLast = { l: 0, t: 0, w: 0, h: 0 }; return;
        }
        if (!bootEl) bootBackdrop = false;
        if (r.width < 2 || r.height < 2) {
            topFrame.style.display = "none"; setBg(false); pinLast = { l: 0, t: 0, w: 0, h: 0 }; return;
        }
        topFrame.style.display = "block";
        setBg(true);
        placeFrame();
    }

    function schedule() {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { raf = 0; pin(currentScreen); });
        if (delayed) clearTimeout(delayed);
        delayed = setTimeout(function () { pin(currentScreen); }, 250);
    }

    function ensureWatching() {
        if (watching) return;
        watching = true;
        (function track() {
            requestAnimationFrame(track);
            if (!topFrame || !document.body.contains(topFrame)) return;
            if (topFrame.style.display === "none") return;
            const bx = window.innerWidth, by = kbOpen ? stableVH : window.innerHeight;
            if (Math.abs(bx - pinLast.w) > 1 || Math.abs(by - pinLast.h) > 1) {
                pin(currentScreen);
            }
        })();
    }

    window.__pinFrame = pin;
    window.__resetPinLast = function () { pinLast = { l: 0, t: 0, w: 0, h: 0 }; };
    // Обои + рамка ещё до первого экрана: интро светится поверх того же фона,
    // что и главное меню, поэтому кроссфейд не «прыгает» на финале.
    window.__bootBackdrop = function () {
        if (!topFrame || !document.body.contains(topFrame)) {
            topFrame = document.createElement("div");
            topFrame.id = "top-frame";
            topFrame.className = "frame-overlay";
            document.body.appendChild(topFrame);
        }
        bootBackdrop = true;
        setBg(true);
        // Фон на время интро — статичный, как у #boot-screen::before.
        // bgFloat запустится вместе с меню (снимем класс в finish), иначе
        // к моменту смены кадра обои окажутся в случайной фазе — «прыжок».
        const bg = document.getElementById("bg-inset");
        if (bg) bg.classList.add("bg-static");
        placeFrame();
    };
    window.__schedulePinFrame = schedule;
    window.__resetFit = function () { fitCache = { w: 0, h: 0, screen: null, fit: 0 }; };
    window.addEventListener("resize", schedule);
    document.addEventListener("scroll", schedule, true);
    if (document.readyState !== 'loading') { pin(currentScreen); ensureWatching(); }
    else document.addEventListener('DOMContentLoaded', function () { pin(currentScreen); ensureWatching(); });

    const origShow = window.showScreen;
    window.showScreen = function (screenId) {
        try { if (typeof origShow === "function") origShow(screenId); } catch (e) { }
        pin(screenId);
        schedule();
        ensureWatching();
    };
})();

function showScreen(screenId) {
    currentScreen = screenId;
    // Список словаря строится порциями: уход со словаря отменяет
    // незавершённые порции — не тратим поток на скрытый список.
    if (screenId !== "dictionary-screen") dictBuildToken++;
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.remove("active");
        s.classList.add("hidden");
    });
    const screen = document.getElementById(screenId);
    screen.classList.remove("hidden");
    screen.classList.add("active");
    if (screenId === "game-screen") nzWarmGameAssets();
}

// Если картинка не пришла с первого раза — повторяем один раз с другим URL.
window.addEventListener('error', function (e) {
    const el = e.target;
    if (!el || el.tagName !== 'IMG' || el.dataset.nzRetried) return;
    const src = el.getAttribute('src');
    if (!src || src.indexOf('nzretry=') >= 0) return;
    el.dataset.nzRetried = '1';
    el.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'nzretry=1';
}, true);

function nzWarmGameAssets() {
    const paths = [
        "UI/Baner_Slovar_fit.webp",
        "UI/Baner_Slovar_fit-!.webp?v=slov1",
        "UI/Vipad_osnova.webp",
        "UI/Pole.webp"
    ];
    paths.forEach(function (p) {
        const im = new Image();
        im.onerror = function () {
            if (im.dataset.nzRetried) return;
            im.dataset.nzRetried = '1';
            im.src = p + (p.indexOf('?') >= 0 ? '&' : '?') + 'nzwarm=1';
        };
        im.src = p;
    });
}

function startGame() {
    const nameInput = document.getElementById("player-name");
    const name = nameInput.value.trim();
    if (!name) {
        nameInput.style.borderColor = "#f87171";
        return;
    }
    state.playerName = name;
    saveData();
    showMainMenu();
}

// Чит-код: полностью открыть прогресс для проверки (уровень 20, все дейлики, все награды)
function cheatMaxProgress() {
    if (state.cheatUsed && state.cheatSnapshot) {
        // Повторный ввод: откатываем чит-код обратно
        const s = state.cheatSnapshot;
        state.level = s.level;
        state.xp = s.xp;
        state.learnedWords = s.learnedWords;
        state.daily = s.daily;
        state.cheatUsed = false;
        state.cheatSnapshot = null;
        saveData();
        refreshFeatureUnlocks(true);
        showLevelToast("Чит-код выключен: прогресс откачен");
        Sound.click();
        if (currentScreen === "main-menu") { showMainMenu(); renderMenuLevel(); }
        if (currentScreen === "progress-screen") renderProgress();
        return;
    }
    // Первый ввод: запоминаем состояние и открываем весь прогресс
    state.cheatSnapshot = {
        level: state.level,
        xp: state.xp,
        learnedWords: [].concat(state.learnedWords),
        daily: state.daily ? JSON.parse(JSON.stringify(state.daily)) : null
    };
    state.cheatUsed = true;
    state.level = 20;
    state.xp = 10450;
    state.daily = null;
    initDaily();
    DAILY_QUESTS.forEach(q => { state.daily.prog[q.id] = q.target; });
    state.daily.done = DAILY_QUESTS.map(q => q.id);
    state.daily.bonus = true;
    const all = DICTIONARY.concat(USER_WORDS.filter(w => (w.lang || "en") === tgtLang()));
    (all || []).forEach(w => {
        const t = tgt(w);
        if (t && !state.learnedWords.includes(t)) state.learnedWords.push(t);
    });
    saveData();
    refreshFeatureUnlocks(true);
    showLevelToast("Чит-код: весь прогресс открыт !");
    Sound.unlock();
    if (currentScreen === "main-menu") {
        showMainMenu();
        renderMenuLevel();
    }
    if (currentScreen === "progress-screen") {
        renderProgress();
    }
}

function showMainMenu() {
    const pickEn = document.getElementById("lang-pick-en");
    const pickJa = document.getElementById("lang-pick-ja");
    if (pickEn) pickEn.classList.toggle("active", !isJa());
    if (pickJa) pickJa.classList.toggle("active", isJa());
    document.getElementById("greeting").textContent = `Привет, ${state.playerName}!`;
    document.getElementById("stat-learned").textContent = state.learnedWords.length;
    document.getElementById("stat-total").textContent = getUserWordsTotal();
    document.getElementById("stat-streak").textContent = state.streak;
    renderMenuLevel();
    updateMenuButton();
    applyMenuProgression();
    showScreen("main-menu");
}

function renderMenuLevel() {
    initDaily();
    const badge = document.getElementById("menu-level-badge");
    const xpEl = document.getElementById("menu-level-xp");
    const fill = document.getElementById("menu-level-track-fill");
    if (!badge) return;
    if (state.level >= 20) {
        badge.textContent = "Уровень 20";
        if (xpEl) xpEl.textContent = "100%";
        if (fill) fill.style.width = "100%";
        return;
    }
    badge.textContent = "Уровень " + state.level;
    const have = Number(xpProgress()) || 0;
    const need = Number(xpRange()) || 0;
    const pct = need > 0 ? Math.min(100, Math.max(0, Math.round((have / need) * 100))) : 0;
    if (xpEl) xpEl.textContent = pct + "%";
    if (fill) fill.style.width = pct + "%";
}

function switchStudyLang(lang) {
    Sound.click();
    state.studyLang = lang;
    state.direction = "en-ru";
    rebuildActiveLanguage();
    migrateProgressKeys();
    applyUserWords();
    saveData();
    showMainMenu();
}

// ── Telegram Mini App: детект, раскрытие на всю высоту, тема ──
const TG = (() => {
    let active = false;
    let theme = null;
    const minVersion = (app) => {
        const v = (app.version || "0").split(".").map(n => parseInt(n, 10) || 0);
        return (v[0] > 6) || (v[0] === 6 && v[1] >= 1);
    };
    function init() {
        // Мобильную вёрстку включаем ЗДЕСЬ — вместе с расчётом переменных сцены
        // в fitUI(), чтобы не было скачка между первой отрисовкой и JS.
        var mob = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
                  Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 700;
        try { document.body.classList.toggle("tg-mini-app", !!mob); } catch (e) {}
        try {
            if (window.__NO_TG__) { active = false; return false; }
            if (window.Telegram && window.Telegram.WebApp) {
                active = true;
                const app = window.Telegram.WebApp;
                app.ready();
                app.expand();
                // Автовход в фуллскрин отключён: он перестраивал вьюпорт
                // после загрузки и дёргал геометрию главного меню.
                // Оверлеи фулскрина: плавающие кнопки Telegram («Закрыть»,
                // «∨ ⋮») и системные полосы. Сцена строится в оставшемся
                // проёме — рамка начинается ниже кнопок, а не под ними.
                try {
                    const readTgInsets = function () {
                        // Telegram шлёт viewportChanged при открытии клавиатуры —
                        // не трогаем геометрию сцены, иначе рамка сдвигается.
                        if (window.__nzKbOpen) return;
                        const sa = app.safeAreaInset || {};
                        const csa = app.contentSafeAreaInset || {};
                        const top = Math.max(0, sa.top || 0) + Math.max(0, csa.top || 0);
                        const bottom = Math.max(0, sa.bottom || 0) + Math.max(0, csa.bottom || 0);
                        const prev = window.__tgOvl || { top: 0, bottom: 0 };
                        if (prev.top === top && prev.bottom === bottom) return;
                        window.__tgOvl = { top: top, bottom: bottom };
                        if (window.__resetPinLast) window.__resetPinLast();
                        if (window.__resetFit) window.__resetFit();
                        if (window.__schedulePinFrame) window.__schedulePinFrame();
                    };
                    readTgInsets();
                    if (typeof app.onEvent === "function") {
                        ["contentSafeAreaChanged", "safeAreaChanged", "viewportChanged", "fullscreenChanged"].forEach(function (ev) {
                            try { app.onEvent(ev, readTgInsets); } catch (e) {}
                        });
                    }
                } catch (e) {}
                if (minVersion(app)) {
                    try { app.setHeaderColor("#171225"); } catch (e) {}
                    try { app.setBackgroundColor("#171225"); } catch (e) {}
                }
                theme = (app.colorScheme === "dark") ? "dark" : "light";
                if (theme === "light") document.body.classList.add("tg-light");
            }
        } catch (e) {
            active = false;
        }
        return active;
    }
    function isActive() { return active; }
    function isDark() { return theme !== "light"; }
    return { init: init, isActive: isActive, isDark: isDark };
})();

function startNewGame(playModeIn) {
    state.playMode = playModeIn;
    state.selectedAnswer = null;
    showLevelScreen();
}

// «Ввод слов» в меню режимов → спросить, что вводим: слова или предложения
function initInputSubMode() {
    state.playMode = "input";
    state.selectedAnswer = null;
    Sound.click();
    showScreen("submode-screen");
}

function startSubmode(sub) {
    state.submode = sub;
    state.selectedAnswer = null;
    Sound.click();
    showLevelScreen();
}

function backFromLevel() {
    Sound.click();
    showScreen(isSentenceMode() ? "submode-screen" : "mode-screen");
}

function showLevelScreen() {
    Sound.click();
    const isSentence = usesSentences();
    document.getElementById("level-title").textContent =
        isSentence ? "Уровень предложений" : "Уровень слов";
    document.getElementById("level-desc").textContent = isSentence
        ? "А1-А2 — базовые предложения, Б1-Б2 — продвинутые, Смешать = все"
        : `А1-А2 — базовый словарь, Б1-Б2 — продвинутый, Смешать = все ${DICTIONARY.length} ${tgtLang() === "ja" ? "слов яп." : "слов"}`;
    if (isSentence) {
        const aCount = SENTENCES.filter(s => !B_SENTENCES.has(tgt(s))).length;
        const bCount = SENTENCES.filter(s => B_SENTENCES.has(tgt(s))).length;
        document.getElementById("level-count-a").textContent = `· ${aCount} предлож.`;
        document.getElementById("level-count-b").textContent = `· ${bCount} предлож.`;
        document.getElementById("level-count-all").textContent = `· ${SENTENCES.length} предлож.`;
    } else {
        const aCount = DICTIONARY.filter(w => !B_LEVEL_WORDS.has(tgt(w))).length;
        const bCount = DICTIONARY.length - aCount;
        document.getElementById("level-count-a").textContent = `· ${aCount} слов`;
        document.getElementById("level-count-b").textContent = `· ${bCount} слов`;
        document.getElementById("level-count-all").textContent = `· ${DICTIONARY.length} слов`;
    }
    cardsDirBoxVisible();
    showScreen("level-screen");
}

function chooseLevel(lvl) {
    state.studyLevel = lvl;
    saveData();
    if (usesSentences()) {
        if (getActiveSentences().length === 0) {
            alert("Для этого уровня пока нет предложений.");
            return;
        }
        // Для предложений категории не нужны
        startGameWithCategory("all");
        return;
    }
    showCategoryScreen();
}

function getLevelLabel() {
    const labels = {
        a: "А1-А2",
        b: "Б1-Б2",
        mix: "Смешать"
    };
    return labels[state.studyLevel] || "Смешать";
}

function showCategoryScreen() {
    Sound.click();
    showScreen("category-screen");
}

function startGameWithCategory(cat) {
    state.category = cat;
    preGameScreen = usesSentences() ? "level-screen" : "category-screen";
    newGame();
}

function restartSame() {
    state.selectedAnswer = null;
    newGame();
}

function getCategoryLabel() {
    const labels = {
        noun: "Существительные",
        adj: "Прилагательные",
        verb: "Глаголы",
        adv: "Наречия",
        num: "Числительные",
        pro: "Местоимения",
        prep: "Предлоги",
        all: "Перемешать"
    };
    return labels[state.category] || "Перемешать";
}

function filterByCategory(words) {
    if (state.category === "adj") return words.filter(w => ADJ_WORDS.has(tgt(w)));
    if (state.category === "verb") return words.filter(w => VERB_WORDS.has(tgt(w)));
    if (state.category === "adv") return words.filter(w => ADV_WORDS.has(tgt(w)));
    if (state.category === "num") return words.filter(w => NUM_WORDS.has(tgt(w)));
    if (state.category === "pro") return words.filter(w => PRO_WORDS.has(tgt(w)));
    if (state.category === "prep") return words.filter(w => PREP_WORDS.has(tgt(w)));
    if (state.category === "noun") return words.filter(w =>
        !ADJ_WORDS.has(tgt(w)) && !VERB_WORDS.has(tgt(w)) &&
        !ADV_WORDS.has(tgt(w)) && !NUM_WORDS.has(tgt(w)) &&
        !PRO_WORDS.has(tgt(w)) && !PREP_WORDS.has(tgt(w)));
    return words;
}

function filterByLevel(words) {
    if (state.studyLevel === "a") return words.filter(w => !B_LEVEL_WORDS.has(tgt(w)));
    if (state.studyLevel === "b") return words.filter(w => B_LEVEL_WORDS.has(tgt(w)));
    return words;
}

function getActiveWords() {
    const own = USER_WORDS.filter(w => (w.lang || "en") === tgtLang());
    return filterByLevel(DICTIONARY.concat(own));
}

function isSentenceMode() {
    return state.playMode === "input" && state.submode === "sentences";
}

function isCardsMode() {
    return state.playMode === "cards";
}

// Нужны ли предложения (ручной ввод предложений или сборка из карточек)
function usesSentences() {
    return isSentenceMode() || isCardsMode();
}

function getActiveSentences() {
    let arr = SENTENCES;
    if (state.studyLevel === "a") arr = arr.filter(s => !B_SENTENCES.has(tgt(s)));
    if (state.studyLevel === "b") arr = arr.filter(s => B_SENTENCES.has(tgt(s)));
    return arr;
}

function normalizeText(t) {
    // ё/Ё считаем эквивалентными е/Е — оба написания принимаются как верные
    return String(t).toLowerCase().replace(/[ёЁ]/g, "е")
        .replace(/[.\-–—!?,;:"'«»()]/g, " ").replace(/\s+/g, " ").trim();
}

// Сравнение ответа с предложением: без знаков препинания и лишних пробелов,
// с учётом допустимых вариантов перевода (altRu / altEn)
// РџСЂРёРЅРёРјР°РµРј Р»СЋР±РѕР№ РёР· РІР°СЂРёР°РЅС‚РѕРІ РїРµСЂРµРІРѕРґР°, Р±РµР· СѓС‡С‘С‚Р° СЂРµРіРёСЃС‚СЂР° Рё С‘/Р•
function wordAnswerMatches(answer, correct, word, direction) {
    const variants = [correct];
    if (word) {
        const extra = direction === "en-ru" ? (word.altRu || []) : (word.altEn || []);
        extra.forEach(function (v) { variants.push(v); });
    }
    const parts = [];
    variants.forEach(function (v) {
        String(v).split(/[,;\/]| РёР»Рё /i).forEach(function (p) { parts.push(p); });
    });
    parts.slice().forEach(function (p) {
        var stripped = String(p).replace(/\([^)]*\)/g, "").trim();
        if (stripped) parts.push(stripped);
    });
    const n = normalizeText(answer);
    return parts.some(function (p) { return normalizeText(p) === n; });
}
function sentenceMatches(input, s, direction) {
    const n = normalizeText(input);
    const variants = direction === "en-ru"
        ? [nat(s)].concat(s.altRu || [])
        : [tgt(s)].concat(s.altEn || []);
    if (variants.some(v => normalizeText(v) === n)) return true;
    // Обстоятельство времени может стоять в начале или в конце — оба варианта верны
    return variants.some(v => timeAdverbSwapMatch(n, normalizeText(v)));
}

const TIME_ADVERB_PHRASES = [
    "in the mornings", "in the morning", "in the evenings", "in the evening",
    "at night", "at the moment", "right now", "in summer", "in winter",
    "in spring", "in autumn", "this week", "this month", "this year",
    "last week", "last month", "last year", "next week", "next month",
    "next year", "every day", "every week", "every year", "every morning",
    "every evening", "every night", "on monday", "on tuesday", "on wednesday",
    "on thursday", "on friday", "on saturday", "on sunday",
    "now", "today", "yesterday", "tomorrow", "tonight", "usually", "always",
    "often", "sometimes", "never", "already", "still", "just", "soon", "later",
    "по утрам", "по вечерам", "по ночам", "каждое утро", "каждый вечер",
    "каждую ночь", "на этой неделе", "на прошлой неделе", "на следующей неделе",
    "в этом месяце", "в прошлом месяце", "в этом году", "в прошлом году",
    "в следующем году", "в понедельник", "во вторник", "в среду", "в четверг",
    "в пятницу", "в субботу", "в воскресенье", "летом", "зимой", "весной",
    "осенью", "вечером", "утром", "ночью", "сейчас", "сегодня", "вчера",
    "завтра", "потом", "тогда", "уже", "еще", "всегда", "иногда", "обычно",
    "часто", "никогда", "позже"
];

// Принимает перестановку, где обстоятельство времени перенесено из начала в конец
// или из конца в начало (например "In the mornings I run" ↔ "I run in the mornings")
function timeAdverbSwapMatch(n, nv) {
    if (n === nv) return false;
    const wn = n.split(" ");
    const wv = nv.split(" ");
    if (wn.length !== wv.length) return false;
    for (const phrase of TIME_ADVERB_PHRASES) {
        const pw = phrase.split(" ");
        if (pw.length >= wv.length) continue;
        // Обстоятельство в конце образца → разрешить перенос в начало ("I run in the mornings" → "In the mornings I run")
        if (wv.slice(wv.length - pw.length).join(" ") === phrase) {
            const rest = wv.slice(0, wv.length - pw.length);
            if (wn.slice(0, pw.length).join(" ") === phrase &&
                wn.slice(pw.length).join(" ") === rest.join(" ")) return true;
        }
        // Обстоятельство в начале образца → разрешить перенос в конец ("In the mornings I run" → "I run in the mornings")
        if (wv.slice(0, pw.length).join(" ") === phrase) {
            const rest = wv.slice(pw.length);
            if (wn.slice(0, rest.length).join(" ") === rest.join(" ") &&
                wn.slice(rest.length).join(" ") === phrase) return true;
        }
    }
    return false;
}

function updateCategoryTag() {
    document.getElementById("current-category").textContent =
        state.playMode === "listening" ? getLevelLabel() + " · На слух"
        : usesSentences()
        ? getLevelLabel() + " · Предложения"
        : getLevelLabel() + " · " + getCategoryLabel();
}

function newGame() {
    state.roundCorrect = 0;
    state.roundTotal = 0;
    state.lives = MAX_LIVES;
    state.selectedAnswer = null;
    state.combo = 0;
    state.score = 0;
    stopSpeedTimer();
    
    updateSpeedStrip();
    updateCategoryTag();

    // Класс режима «На слух» меняет раскладку всего экрана (в т.ч. хедер).
    // Если игрок вышел из «На слух» и запустил другой режим без перезагрузки,
    // класс не должен тянуть за собой чужую вёрстку.
    const wordEl = document.getElementById("current-word");
    if (wordEl) wordEl.classList.remove("listening-mask");
    
    let words;
    if (usesSentences()) {
        words = getActiveSentences();
    } else {
        words = filterByCategory(getActiveWords());
    }
    
    if (state.mode === "favorites") {
        words = words.filter(w => state.favoriteWords.includes(tgt(w)));
    } else if (state.mode === "mistakes") {
        words = words.filter(w => state.wrongWords.includes(tgt(w)));
    } else if (state.mode === "unlearned") {
        words = words.filter(w => !state.learnedWords.includes(tgt(w)));
    } else if (state.mode === "learned") {
        words = words.filter(w => state.learnedWords.includes(tgt(w)));
    }

    // В «5 к 1» слова всегда идут в случайном порядке, независимо от режима
    // подбора. Фильтр по категориям/уровню выше остаётся как был.
    // Рандом во всех играх: раунд всегда перемешивается, независимо от режима
    // подбора. Раньше шаффл включался только для «random» и «5 к 1» — в
    // остальных режимах раунд шёл по порядку словаря, и каждый заезд
    // начинался с одних и тех же слов/предложений (slice всегда брал первые
    // N списка). Дубли внутри раунда запрещены: «мои слова» могут повторять
    // словарные — оставляем первую копию каждого слова/предложения.
    words = shuffleArray(words);

    const seenTgt = new Set();
    words = words.filter(w => {
        const key = tgt(w);
        if (seenTgt.has(key)) return false;
        seenTgt.add(key);
        return true;
    });
    
    if (words.length === 0) {
        if (state.mode === "favorites") {
            alert("В избранном пусто — добавьте слова звёздочкой.");
        } else if (state.mode === "mistakes") {
            alert("Ошибок не накоплено — повторить нечего.");
        } else if (state.mode === "learned") {
            alert("Выученных слов пока нет — сыграйте, чтобы отметить слова.");
        } else if (state.mode === "unlearned") {
            alert("Вы выучили все слова этого уровня — возьмите режим «Все выученные».");
        } else {
            alert("На этом уровне нет слов — смените уровень или категорию.");
        }
        return;
    }

    if (state.roundWords > 0) {
        words = words.slice(0, state.roundWords);
    }

    // Стык двух раундов: новый раунд не начинается тем же словом/предложением,
    // которым закончился предыдущий (или которое было на экране при выходе) —
    // иначе даже после шаффла на границе раундов выпадало одно и то же подряд.
    const prevList = Array.isArray(state.gameWords) ? state.gameWords : [];
    const avoid = new Set();
    if (prevList.length) {
        avoid.add(tgt(prevList[prevList.length - 1]));
        const li = Math.min(prevList.length - 1, Math.max(0, (state.currentWordIndex || 0) - 1));
        if (prevList[li]) avoid.add(tgt(prevList[li]));
    }
    if (words.length > 1 && avoid.has(tgt(words[0]))) {
        const j = 1 + Math.floor(Math.random() * (words.length - 1));
        [words[0], words[j]] = [words[j], words[0]];
    }

    state.gameWords = words;
    state.currentWordIndex = 0;
    state.inProgress = true;
    updateMenuButton();
    updateHearts();
    saveData();
    showScreen("game-screen");
    showGameWord();
}

function continueGame() {
    state.inProgress = true;
    updateCategoryTag();
    updateHearts();
    saveData();
    showScreen("game-screen");
    showGameWord();
}

function startFreshGame() {
    // Всегда начинаем новую игру с нуля: выбор режима
    Sound.click();
    applyModeProgression();
    showScreen("mode-screen");
}

function updateMenuButton() {
    const btn = document.querySelector('#btn-continue-game');
    const hasProgress = state.inProgress && state.gameWords.length > 0 &&
        state.currentWordIndex < state.gameWords.length &&
        (state.infiniteLives || state.lives > 0);
    btn.disabled = !hasProgress;
    btn.classList.toggle("disabled", !hasProgress);
}

function showGameWord() {
    stopSpeedTimer();
    if (state.currentWordIndex >= state.gameWords.length) {
        showResults();
        return;
    }
    ["input-area", "battle-area", "cards-area"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });
    
    const word = state.gameWords[state.currentWordIndex];
    const displayWord = isTargetToNative() ? tgt(word) : nat(word);
    
    const progress = (state.currentWordIndex / state.gameWords.length) * 100;
    document.getElementById("progress-fill").style.width = progress + "%";
    document.getElementById("progress-text").textContent = 
        `${state.currentWordIndex + 1}/${state.gameWords.length}`;
    
    if (state.playMode === "quiz") {
        showBattleRound(word);
    } else if (state.playMode === "cards") {
        showCardsRound(word);
    } else if (state.playMode === "listening") {
        showListeningRound();
    } else {
        showInputRound(displayWord);
    }
    updateSpeedStrip();
    startSpeedTimerForMode();
    autoSpeakRound();
}

// Микрофон живёт в ряду иконок (после звезды) на всех plush-экранах ввода:
// так поле ответа остаётся чистым, как в «На слух» и «5 в 1». В остальных
// режимах его можно вернуть в поле ответа.
function placeAnswerMic(inTools) {
    const mic = document.getElementById("answer-mic");
    if (!mic) return;
    const target = inTools
        ? document.getElementById("current-fav")
        : document.querySelector(".answer-row");
    if (!target) return;
    const host = inTools ? target.parentElement : target;
    if (host && mic.parentElement !== host) host.appendChild(mic);
}

// Сердечки жизней постоянно живут в «5 к 1» (висят над рамой battle-table).
// В «Собери предложение» переносим их в РЯД АУДИО-КНОПОК промпта: звук —
// к левому краю, сердечки — к правому (margin-left:auto в CSS), одна
// строка, как просил пользователь. При возврате в «5 к 1» возвращаем на
// место над рамой (appendChild в battle-table ровно как раньше).
function placeHearts(inCards) {
    const hearts = document.getElementById("hearts");
    if (!hearts) return;
    if (inCards === "input") {
        // Ввод слов / аудирование: сердечки между прогресс-баром и карточкой.
        const host = document.getElementById("input-area");
        const card = document.getElementById("game-card");
        if (!host) return;
        if (hearts.parentElement !== host || hearts.nextElementSibling !== card) {
            host.insertBefore(hearts, card || null);
        }
        return;
    }
    const host = inCards
        ? document.querySelector("#cards-area .cards-tools")
        : document.querySelector(".battle-table");
    if (!host) return;
    if (hearts.parentElement !== host) host.appendChild(hearts);
}

// Режим аудирования: слово не показываем — только слушаем и пишем по-английски
function showListeningRound() {
    document.getElementById("input-area").classList.remove("hidden");
    placeHearts("input");

    const wordEl = document.getElementById("current-word");
    wordEl.classList.remove("sentence");
    wordEl.classList.remove("swap");
    void wordEl.offsetWidth;
    wordEl.classList.add("swap", "listening-mask");
    wordEl.innerHTML = iconHTML("🎧");

    const word = state.gameWords[state.currentWordIndex];
    const favBtn = document.getElementById("current-fav");
    if (favBtn) favBtn.classList.toggle("is-fav", state.favoriteWords.includes(tgt(word)));
    placeAnswerMic(true);

    document.getElementById("word-label").textContent = isJa()
        ? "СЛУШАЙТЕ И НАПИШИТЕ ПО-ЯПОНСКИ"
        : "СЛУШАЙТЕ И НАПИШИТЕ ПО-АНГЛИЙСКИ";
    document.getElementById("feedback").textContent = "";
    document.getElementById("feedback").className = "feedback";
    document.getElementById("check-btn").classList.remove("hidden");
    document.getElementById("next-btn").classList.add("hidden");

    const input = document.getElementById("answer-input");
    input.value = "";
    input.disabled = false;
    input.style.display = "";
    input.focus();
    input.placeholder = "Что вы услышали ?...";

    // Слово звучит чуть позже, чтобы не заглушить звуки раздачи
    setTimeout(speakCurrentWord, 350);
}

function showInputRound(displayWord) {
    document.getElementById("input-area").classList.remove("hidden");
    placeHearts("input");
    document.getElementById("battle-area").classList.add("hidden");
    
    const word = state.gameWords[state.currentWordIndex];
    const wordEl = document.getElementById("current-word");
    wordEl.classList.toggle("sentence", isSentenceMode());
    wordEl.classList.remove("swap", "listening-mask");
    void wordEl.offsetWidth;
    wordEl.classList.add("swap");
    wordEl.textContent = displayWord;
    
    const favBtn = document.getElementById("current-fav");
    if (favBtn) favBtn.classList.toggle("is-fav", state.favoriteWords.includes(tgt(word)));
    placeAnswerMic(true);
    
    document.getElementById("word-label").textContent = isSentenceMode()
        ? "ПЕРЕВЕДИТЕ ПРЕДЛОЖЕНИЕ"
        : "ПЕРЕВЕДИТЕ";
    
    document.getElementById("feedback").textContent = "";
    document.getElementById("feedback").className = "feedback";
    document.getElementById("check-btn").classList.remove("hidden");
    document.getElementById("next-btn").classList.add("hidden");
    
    const input = document.getElementById("answer-input");
    input.value = "";
    input.disabled = false;
    input.style.display = "";
    input.placeholder = "Введите перевод...";
    input.focus();
}

function showBattleRound(word) {
    document.getElementById("input-area").classList.add("hidden");
    document.getElementById("battle-area").classList.remove("hidden");
    placeHearts(false);
    
    const feedback = document.getElementById("battle-feedback");
    feedback.textContent = "";
    feedback.className = "";
    
    document.getElementById("battle-next").classList.add("hidden");
    document.getElementById("bot-deck-num").textContent = 
        state.gameWords.length - state.currentWordIndex;
    document.getElementById("player-deck-num").textContent = 
        state.learnedWords.length;
    
    // Анимация выдачи карты из колоды бота
    BotPlasmaDissolve.reset();
    PlayerPlasmaDissolve.reset();
    document.querySelectorAll(".player-dissolve-stage").forEach(function (el) { el.remove(); });
    const botCard = document.querySelector("#bot-card-wrap .battle-card");
    const botWrap = document.getElementById("bot-card-wrap");
    const pixelsWrap = document.getElementById("bot-pixels");
    pixelsWrap.classList.remove("active");
    pixelsWrap.innerHTML = "";
    botCard.classList.remove("dissolving");
    botCard.classList.remove("revealed");
    botCard.classList.remove("dissolved-away");
    // Перезапуск анимации «выдачи из колоды»
    botWrap.classList.remove("dealing");
    void botWrap.offsetWidth;
    botWrap.classList.add("dealing");
    document.getElementById("bot-card-word").textContent = 
        isTargetToNative() ? tgt(word) : nat(word);
    const botWord = document.getElementById("bot-card-word");
    fitTextOneLine(botWord, botWord.parentElement.clientWidth - 14, 11);

    Sound.deal();

    // Случайные задержки/длительность звёзд, чтобы мигали несинхронно
    randomizeStars(botCard);

    // Плавный переворот карты после выдачи (рубашка → слово)
    setTimeout(() => {
        Sound.flip();
        botCard.classList.add("revealed");
    }, 550);
    
    buildBattleOptions(word);
}

// Случайная синхронизация мерцания звёзд внутри карты (задержка и длительность)
function randomizeStars(root) {
    root.querySelectorAll(".stars .star").forEach(star => {
        const rand = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
        star.style.setProperty("--d", rand(0, 8) + "s");
        star.style.setProperty("--dur", rand(4, 8) + "s");
    });
}

function buildBattleOptions(word) {
    const container = document.getElementById("options");
    PlayerPlasmaAppear.reset();
    container.innerHTML = "";
    container.classList.add("show");
    
const correctAnswer = isTargetToNative() ? nat(word) : tgt(word);
    
    const distractors = [];
    const pool = filterByCategory(getActiveWords()).filter(w => tgt(w) !== tgt(word));
    const shuffledPool = shuffleArray(pool);
    // Режим «5 к 1»: у игрока 5 карт против одной карты бота, значит
    // отвлекающих вариантов нужно 4, а не 5 — раньше выпадало 6 карт.
    // Перебор идёт до конца пула, а не первых пяти записей: проверка
    // на дубли раньше молча резала количество (выпадало 4 или 5).
    for (const w of shuffledPool) {
        if (distractors.length >= 4) break;
        const d = isTargetToNative() ? nat(w) : tgt(w);
        if (d && d !== correctAnswer && !distractors.includes(d)) distractors.push(d);
    }
    
    const allAnswers = shuffleArray([...distractors, correctAnswer]);
    const letters = ["A", "B", "C", "D", "E"];
    
    allAnswers.forEach((ans, idx) => {
        const card = document.createElement("button");
        card.className = "option-card";
        card.setAttribute("data-answer", ans);
        card.innerHTML = `
            <span class="card-inner">
                ${buildStars()}
                <span class="opt-letter">${letters[idx]}</span>
                <span class="opt-suit">${iconHTML("✦")}</span>
                <span class="opt-text"></span>
                <span class="opt-suit">${iconHTML("✦")}</span>
            </span>
        `;
        // Текст вставляем через textContent — переводы не должны исполняться как HTML
        card.querySelector(".opt-text").textContent = ans;
        card.addEventListener("click", () => selectOption(card, ans, correctAnswer));
        container.appendChild(card);
        fitTextCard(card.querySelector(".opt-text"), card.querySelector(".card-inner"));
    });
    PlayerPlasmaAppear.prepare(container);
    // Шрифт пересчитываем после того, как flex разложил карточки
    requestAnimationFrame(function () {
        try {
            refitBattleTexts();
        } finally {
            PlayerPlasmaAppear.start();
        }
    });
    setTimeout(function () {
        PlayerPlasmaAppear.start();
    }, 120);
}

// Пересчитывает подгонку текста в карточках после того, как flex
// окончательно разложил их по ширине. Раньше размер шрифта считался
// в момент создания карточки, когда ширина была ещё не итоговой,
// и длинные слова не влезали и рвались по слогам.
function refitBattleTexts() {
    // Сначала фиксируем масштаб экрана: к моменту пересчёта шрифты уже
    // загружены и карты розданы, поэтому страж fitUI отработает по
    // окончательному лэйауту, а не по промежуточному (см. его кэш).
    // Без этого --ui-fit зависел от того, какой экран и в какой момент
    // успел измериться первым.
    if (window.__refitScreenFit) window.__refitScreenFit();
    var opts = document.querySelectorAll("#battle-area .option-card, #options .option-card");
    for (var i = 0; i < opts.length; i++) {
        var t = opts[i].querySelector(".opt-text");
        var ci = opts[i].querySelector(".card-inner");
        if (t && ci) fitTextCard(t, ci);
    }
}

window.addEventListener("resize", function () { requestAnimationFrame(refitBattleTexts); });

// Метрики Nihon Zeno Plush отличаются от системного фолбэка: если
// подгонка прошла до загрузки шрифта (font-display: swap), размеры
// считались по чужому шрифту и текст на картах разъезжался. После
// загрузки шрифта пересчитываем.
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { requestAnimationFrame(refitBattleTexts); });
    if (document.fonts.addEventListener) {
        document.fonts.addEventListener("loadingdone", function () { requestAnimationFrame(refitBattleTexts); });
    }
}

// Подгоняет текст карты. Ключевой момент — overflow-wrap: anywhere:
// он допускает перенос внутри слова и сужает min-content элемента до
// одного символа. Без него flex-элемент растягивается до ширины
// неразрывного слова (min-content), вылезает за карту и обрезается
// overflow:hidden — слова пропадали именно поэтому, а не переносились.
// Порядок предпочтений: одна строка не мельче 9px, затем две строки
// самым крупным кеглем, затем три. Перенос на две строки мельче 9px
// хуже двух строк крупным кеглем: на карте 42x59 это разница 7px и 12px.
function fitTextCard(el, ci, minPx) {
    if (!el || !ci) return;
    minPx = minPx || 7;
    const availW = optInnerAvail(ci);
    const availH = optInnerAvailH(ci);
    if (!availW || !availH) return;
    el.style.fontSize = "";
    const maxPx = Math.max(minPx, Math.floor(parseFloat(getComputedStyle(el).fontSize) || 13));
    el.style.whiteSpace = "normal";
    el.style.wordBreak = "normal";
    el.style.overflowWrap = "anywhere";
    const fits = function (fs, maxLines) {
        el.style.fontSize = fs + "px";
        const lh = parseFloat(getComputedStyle(el).lineHeight) || fs * 1.3;
        const maxH = Math.min(availH, lh * maxLines);
        return el.scrollWidth <= availW + 1 && el.scrollHeight <= maxH + 1;
    };
    // 1) одна строка — только если кегль не мельче 9px
    for (let fs = maxPx; fs >= minPx + 2; fs--) if (fits(fs, 1)) return;
    // 2) две строки — любой кегль
    for (let fs = maxPx; fs >= minPx; fs--) if (fits(fs, 2)) return;
    // 3) три строки — крайний случай
    for (let fs = maxPx; fs >= minPx; fs--) if (fits(fs, 3)) return;
    el.style.fontSize = minPx + "px";
}

// Высота под текст внутри карты: из высоты блока вычитаны только
// строчные соседи текста (в PLUSH-бою значки масти — абсолюты, они
// высоту не занимают) и зазоры flex-колонки между строчными детьми.
function optInnerAvailH(ci) {
    if (!ci) return 0;
    const cs = getComputedStyle(ci);
    let h = ci.clientHeight
        - (parseFloat(cs.paddingTop) || 0)
        - (parseFloat(cs.paddingBottom) || 0);
    let inFlow = 0;
    for (let i = 0; i < ci.children.length; i++) {
        const ch = ci.children[i];
        if (getComputedStyle(ch).position === "absolute") continue;
        if (ch.classList.contains("opt-text")) { inFlow++; continue; }
        h -= ch.offsetHeight;
        inFlow++;
    }
    h -= (parseFloat(cs.rowGap) || 0) * Math.max(0, inFlow - 1);
    return Math.max(8, h);
}

function optInnerAvail(ci) {
    if (!ci) return 0;
    const cs = getComputedStyle(ci);
    return ci.clientWidth
        - (parseFloat(cs.paddingLeft) || 0)
        - (parseFloat(cs.paddingRight) || 0);
}

// Подгоняет шрифт элемента так, чтобы текст влезал в одну строку.
// На мобильном (tg-mini-app) слово НИКОГДА не рвётся по буквам: если не
// помещается, шрифт ужимается дальше обычного минимума (до 4px). На ПК
// поведение прежнее — при очень длинном слове разрешаем перенос.
function fitTextOneLine(el, maxW, minPx, minOneLinePx) {
    if (!el || !maxW) return;
    el.style.whiteSpace = "nowrap";
    el.style.overflowWrap = "normal";
    el.style.wordBreak = "normal";
    el.style.fontSize = "";
    const w = el.scrollWidth;
    if (w > maxW) {
        const cur = parseFloat(getComputedStyle(el).fontSize) || 12;
        const fs = Math.floor((cur * maxW / w) * 10) / 10;
        const mobile = document.body.classList.contains("tg-mini-app") || document.body.classList.contains("nz-mobile");
        if (mobile) {
            el.style.fontSize = Math.max(4, fs) + "px";
        } else {
            const oneLineMin = minOneLinePx || minPx;
            if (fs < oneLineMin) {
                el.style.whiteSpace = "normal";
                el.style.overflowWrap = "anywhere";
                el.style.wordBreak = "break-word";
                el.style.fontSize = minPx + "px";
            } else {
                el.style.fontSize = fs + "px";
            }
        }
    }
}

// Генерирует слой случайных мерцающих звёзд (случайные позиция, задержка и длительность)
function buildStars() {
    const positions = [
        [16, 14], [72, 10], [84, 34], [24, 42],
        [58, 60], [10, 66], [78, 76], [36, 88],
        [90, 90], [48, 22]
    ];
    const rand = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
    const stars = positions.map(([x, y]) => {
        const s = Math.random() < 0.4 ? 3 : 2;
        const d = rand(0, 8);
        const dur = rand(4, 8);
        return `<span class="star" style="--x:${x}%;--y:${y}%;--s:${s}px;--d:${d}s;--dur:${dur}s"></span>`;
    });
    return `<span class="stars" aria-hidden="true">${stars.join("")}</span>`;
}

function selectOption(btn, answer, correctAnswer) {
    if (btn.classList.contains("selected")) return;
    
    PlayerPlasmaAppear.finishNow();
    Sound.click();
    const buttons = document.querySelectorAll("#options .option-card");
    buttons.forEach(b => b.disabled = true);
    
    btn.classList.add("selected");
    state.selectedAnswer = answer;
    evaluateQuizAnswer(answer, correctAnswer);
}

function createPlasmaDissolve(studio) {
    const DURATION = 1.35;
    const FINISH_AT = 1.46;
    const FADE_MS = 180;
    const MAX_PARTICLES = 190;
    const textures = { ready: false };
    let canvas = null;
    let ctx = null;
    let table = null;
    let wrap = null;
    let front = null;
    let card = null;
    let maskCv = null;
    let maskCtx = null;
    let maskImage = null;
    let charCv = null;
    let charCtx = null;
    let charImage = null;
    let glowCv = null;
    let glowCtx = null;
    let glowImage = null;
    let cols = 0;
    let rows = 0;
    let total = 0;
    let states = null;
    let delays = null;
    let seeds = null;
    let tones = null;
    let box = null;
    let cellW = 0;
    let cellH = 0;
    let tableW = 0;
    let tableH = 0;
    let dpr = 1;
    let particles = [];
    let raf = 0;
    let active = false;
    let localView = false;
    let localPad = 0;
    let fading = false;
    let fadeStarted = 0;
    let startedAt = 0;
    let lastAt = 0;
    let lastMaskAt = 0;
    let doneCallback = null;
    let filterOk = false;

    function glowSprite(center, middle, edge) {
        const c = document.createElement("canvas");
        c.width = 48;
        c.height = 48;
        const g = c.getContext("2d");
        const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
        grad.addColorStop(0, center);
        grad.addColorStop(0.22, middle);
        grad.addColorStop(1, edge);
        g.fillStyle = grad;
        g.fillRect(0, 0, 48, 48);
        return c;
    }

    function ashSprite() {
        const c = document.createElement("canvas");
        c.width = 16;
        c.height = 16;
        const g = c.getContext("2d");
        const grad = g.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, "rgba(16, 7, 23, 0.95)");
        grad.addColorStop(0.5, "rgba(35, 16, 48, 0.85)");
        grad.addColorStop(1, "rgba(35, 16, 48, 0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 16, 16);
        return c;
    }

    function buildTextures() {
        if (textures.ready) return;
        textures.sparkCyan = glowSprite("rgba(255, 255, 255, 1)", "rgba(34, 211, 238, 0.92)", "rgba(34, 211, 238, 0)");
        textures.sparkMagenta = glowSprite("rgba(255, 255, 255, 1)", "rgba(232, 121, 249, 0.92)", "rgba(232, 121, 249, 0)");
        textures.dustCyan = glowSprite("rgba(226, 255, 255, 0.55)", "rgba(34, 211, 238, 0.28)", "rgba(34, 211, 238, 0)");
        textures.dustMagenta = glowSprite("rgba(255, 236, 255, 0.55)", "rgba(232, 121, 249, 0.28)", "rgba(232, 121, 249, 0)");
        textures.ash = ashSprite();
        textures.ready = true;
    }

    function maskSupported() {
        return !!front && (typeof front.style.webkitMaskImage !== "undefined" ||
            (window.CSS && typeof CSS.supports === "function" && CSS.supports("mask-image", "url(#p)")));
    }

    function measure() {
        if (!table || !wrap) return false;
        tableW = table.clientWidth;
        tableH = table.clientHeight;
        if (localView) {
            box = {
                x: localPad,
                y: localPad,
                w: tableW - localPad * 2,
                h: tableH - localPad * 2
            };
        } else {
            const tr = table.getBoundingClientRect();
            const wr = wrap.getBoundingClientRect();
            box = {
                x: wr.left - tr.left - table.clientLeft,
                y: wr.top - tr.top - table.clientTop,
                w: wr.width,
                h: wr.height
            };
        }
        return tableW > 20 && tableH > 20 && box.w > 20 && box.h > 20 &&
            isFinite(box.x) && isFinite(box.y);
    }

    function buildGrid() {
        if (!box || !box.w || !box.h) return false;
        cols = Math.max(30, Math.min(58, Math.round(box.w / 2.1)));
        rows = Math.max(38, Math.min(76, Math.round(cols * box.h / box.w)));
        total = cols * rows;
        cellW = box.w / cols;
        cellH = box.h / rows;
        states = new Uint8Array(total);
        states.fill(3);
        delays = new Float32Array(total);
        seeds = new Float32Array(total);
        tones = new Uint8Array(total);
        for (let y = 0; y < rows; y++) {
            const base = (rows - 1 - y) / Math.max(1, rows - 1);
            for (let x = 0; x < cols; x++) {
                const i = y * cols + x;
                const wave = Math.sin(x * 0.42 + 1.3) * 0.07 +
                    Math.sin(x * 0.13 - 0.6) * 0.05;
                const jitter = (Math.random() - 0.5) * 0.11;
                const streak = Math.random() < 0.025 ? -0.1 - Math.random() * 0.1 : 0;
                delays[i] = Math.max(0, Math.min(1, base + wave + jitter + streak));
                seeds[i] = Math.random();
                tones[i] = Math.random() < 0.5 ? 1 : 0;
            }
        }
        maskCv = document.createElement("canvas");
        maskCv.width = cols;
        maskCv.height = rows;
        maskCtx = maskCv.getContext("2d");
        maskImage = maskCtx.createImageData(cols, rows);
        for (let i = 0; i < total; i++) {
            maskImage.data[i * 4] = 255;
            maskImage.data[i * 4 + 1] = 255;
            maskImage.data[i * 4 + 2] = 255;
            maskImage.data[i * 4 + 3] = 255;
        }
        charCv = document.createElement("canvas");
        charCv.width = cols;
        charCv.height = rows;
        charCtx = charCv.getContext("2d");
        charImage = charCtx.createImageData(cols, rows);
        glowCv = document.createElement("canvas");
        glowCv.width = cols;
        glowCv.height = rows;
        glowCtx = glowCv.getContext("2d");
        glowImage = glowCtx.createImageData(cols, rows);
        return true;
    }

    function applyMask() {
        if (!front || !maskImage) return;
        for (let i = 0; i < total; i++) {
            maskImage.data[i * 4 + 3] = states[i] === 3 ? 255 : 0;
        }
        maskCtx.putImageData(maskImage, 0, 0);
        const value = 'url("' + maskCv.toDataURL() + '")';
        front.style.setProperty("-webkit-mask-image", value);
        front.style.setProperty("mask-image", value);
        front.style.setProperty("-webkit-mask-size", "100% 100%");
        front.style.setProperty("mask-size", "100% 100%");
        front.style.setProperty("-webkit-mask-repeat", "no-repeat");
        front.style.setProperty("mask-repeat", "no-repeat");
        front.style.setProperty("-webkit-mask-position", "0 0");
        front.style.setProperty("mask-position", "0 0");
    }

    function clearMask() {
        if (!front) return;
        const props = [
            "-webkit-mask-image", "mask-image",
            "-webkit-mask-size", "mask-size",
            "-webkit-mask-repeat", "mask-repeat",
            "-webkit-mask-position", "mask-position"
        ];
        for (let i = 0; i < props.length; i++) front.style.removeProperty(props[i]);
    }

    function pushParticle(p) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        particles.push(p);
    }

    function spawnSpark(x, y, tone, power) {
        const life = 0.34 + Math.random() * 0.44;
        const vx = (Math.random() - 0.5) * 76 * power;
        const vy = (-42 - Math.random() * 78) * power;
        pushParticle({
            kind: "spark",
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            g: -8,
            drag: 1.25,
            size: 3 + Math.random() * 5,
            life: life,
            maxLife: life,
            alpha: 0.88,
            rot: Math.atan2(vy, vx),
            spin: (Math.random() - 0.5) * 3,
            tex: tone ? textures.sparkMagenta : textures.sparkCyan
        });
    }

    function spawnDust(x, y, tone) {
        const life = 0.7 + Math.random() * 0.7;
        pushParticle({
            kind: "dust",
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 26,
            vy: -10 - Math.random() * 32,
            g: -7,
            drag: 0.95,
            size: 6 + Math.random() * 11,
            life: life,
            maxLife: life,
            alpha: 0.28,
            rot: 0,
            spin: 0,
            tex: tone ? textures.dustMagenta : textures.dustCyan
        });
    }

    function spawnWisp(x, y, tone) {
        const life = 0.95 + Math.random() * 0.5;
        pushParticle({
            kind: "wisp",
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 16,
            vy: -8 - Math.random() * 24,
            g: -5,
            drag: 1.15,
            size: 16 + Math.random() * 20,
            life: life,
            maxLife: life,
            alpha: 0.17,
            rot: 0,
            spin: 0,
            tex: tone ? textures.dustMagenta : textures.dustCyan
        });
    }

    function spawnAsh(x, y) {
        const life = 0.75 + Math.random() * 0.7;
        pushParticle({
            kind: "ash",
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 24,
            vy: -22 - Math.random() * 34,
            g: 65,
            drag: 0.4,
            size: 2 + Math.random() * 3,
            life: life,
            maxLife: life,
            alpha: 0.8,
            rot: 0,
            spin: 0,
            tex: textures.ash
        });
    }

    function spawnFromCell(i) {
        if (Math.random() > 0.45) return;
        const x = box.x + ((i % cols) + 0.5) * cellW + (Math.random() - 0.5) * cellW;
        const y = box.y + (Math.floor(i / cols) + 0.5) * cellH + (Math.random() - 0.5) * cellH;
        const tone = tones[i];
        const roll = Math.random();
        if (roll < 0.1) spawnWisp(x, y, tone);
        else if (roll < 0.45) spawnDust(x, y, tone);
        else spawnSpark(x, y, tone, 1);
    }

    function burstBottom() {
        const count = Math.min(30, Math.max(12, Math.round(cols * 0.65)));
        for (let i = 0; i < count; i++) {
            const x = box.x + Math.random() * box.w;
            const y = box.y + box.h - Math.random() * cellH * 2.4;
            const tone = Math.random() < 0.5 ? 0 : 1;
            if (i % 3 === 0) spawnDust(x, y, tone);
            else spawnSpark(x, y, tone, 1.15);
        }
    }

    function updateStates(t) {
        let changed = false;
        for (let i = 0; i < total; i++) {
            if (states[i] === 0) continue;
            const ignite = delays[i] * DURATION * 0.78;
            let next = 3;
            if (t >= ignite) next = 2;
            if (t >= ignite + 0.045) next = 1;
            if (t >= ignite + 0.045 + 0.36 + seeds[i] * 0.26) next = 0;
            if (next === states[i]) continue;
            states[i] = next;
            changed = true;
            if (next === 2) {
                spawnFromCell(i);
            } else if (next === 0 && Math.random() < 0.1) {
                const px = box.x + ((i % cols) + 0.5) * cellW;
                const py = box.y + (Math.floor(i / cols) + 0.5) * cellH;
                spawnAsh(px, py);
            }
        }
        return changed;
    }

    function paintField(t) {
        if (!charImage || !glowImage) return;
        const cdata = charImage.data;
        const gdata = glowImage.data;
        cdata.fill(0);
        gdata.fill(0);
        for (let i = 0; i < total; i++) {
            const s = states[i];
            if (s !== 1 && s !== 2) continue;
            const j = i * 4;
            const seed = seeds[i];
            const tone = tones[i];
            if (s === 2) {
                const pulse = 0.82 + 0.18 * Math.sin(t * 48 + seed * 41);
                const white = seed > 0.62;
                if (tone) {
                    cdata[j] = 255;
                    cdata[j + 1] = white ? 246 : 154;
                    cdata[j + 2] = 255;
                    gdata[j] = 232;
                    gdata[j + 1] = 121;
                    gdata[j + 2] = 249;
                } else {
                    cdata[j] = white ? 245 : 110;
                    cdata[j + 1] = 250;
                    cdata[j + 2] = 255;
                    gdata[j] = 34;
                    gdata[j + 1] = 211;
                    gdata[j + 2] = 238;
                }
                cdata[j + 3] = 255;
                gdata[j + 3] = Math.round(120 + 105 * pulse);
            } else if (seed > 0.9) {
                cdata[j] = 232;
                cdata[j + 1] = 132;
                cdata[j + 2] = 255;
                cdata[j + 3] = 255;
                gdata[j] = 232;
                gdata[j + 1] = 121;
                gdata[j + 2] = 249;
                gdata[j + 3] = 105;
            } else {
                /* Тёмная «угольная» заливка (state 1) убрана: на мобильной
                   ширине она читалась как прямоугольная тень, которая не
                   исчезает вместе с картой. Оставляем мягкое свечение и искры. */
                if (tone) {
                    gdata[j] = 150;
                    gdata[j + 1] = 55;
                    gdata[j + 2] = 210;
                } else {
                    gdata[j] = 35;
                    gdata[j + 1] = 125;
                    gdata[j + 2] = 175;
                }
                gdata[j + 3] = Math.round(18 + seed * 34);
            }
        }
        charCtx.putImageData(charImage, 0, 0);
        glowCtx.putImageData(glowImage, 0, 0);
    }

    function updateParticles(dt) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            p.vy += p.g * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= Math.max(0, 1 - p.drag * dt);
            p.vy *= Math.max(0, 1 - p.drag * dt * 0.5);
            p.rot += p.spin * dt;
            if (p.x < -60 || p.x > tableW + 60 || p.y < -80 || p.y > tableH + 60) {
                particles.splice(i, 1);
            }
        }
    }

    function drawParticles() {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const ratio = Math.max(0, p.life / p.maxLife);
            const alpha = p.alpha * Math.min(1, ratio * 2.6);
            const age = 1 - ratio;
            let size = p.size;
            if (p.kind === "dust") size *= 1 + age * 1.15;
            if (p.kind === "spark") size *= 0.58 + 0.42 * ratio;
            ctx.globalCompositeOperation = p.kind === "ash" ? "source-over" : "lighter";
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            ctx.save();
            if (p.kind === "spark") {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.scale(1, 0.42);
                ctx.drawImage(p.tex, -size / 2, -size / 2, size, size);
            } else {
                ctx.drawImage(p.tex, p.x - size / 2, p.y - size / 2, size, size);
            }
            ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
    }

    function render(t) {
        if (!ctx) return;
        ctx.clearRect(0, 0, tableW, tableH);
        paintField(t);
        const flash = 1 - t / 0.28;
        if (flash > 0) {
            const grad = ctx.createLinearGradient(0, box.y + box.h, 0, box.y + box.h * 0.58);
            grad.addColorStop(0, "rgba(34, 211, 238, " + (flash * 0.34) + ")");
            grad.addColorStop(0.45, "rgba(232, 121, 249, " + (flash * 0.18) + ")");
            grad.addColorStop(1, "rgba(232, 121, 249, 0)");
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = grad;
            ctx.fillRect(box.x, box.y + box.h * 0.58, box.w, box.h * 0.42);
            ctx.restore();
        }
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = 1;
        ctx.drawImage(charCv, box.x, box.y, box.w, box.h);
        ctx.restore();
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.9;
        if (filterOk) ctx.filter = "blur(5px)";
        ctx.drawImage(glowCv, box.x, box.y, box.w, box.h);
        ctx.restore();
        drawParticles();
    }

    function frame(now) {
        if (!active) return;
        const t = (now - startedAt) / 1000;
        const dt = Math.max(0.001, Math.min(0.034, (now - lastAt) / 1000));
        lastAt = now;
        if (t < FINISH_AT) {
            const changed = updateStates(t);
            if (changed && now - lastMaskAt >= 28) {
                applyMask();
                lastMaskAt = now;
            }
        }
        updateParticles(dt);
        render(t);
        if (!fading && t >= FINISH_AT) {
            fading = true;
            fadeStarted = now;
            if (canvas) canvas.classList.add("fading");
        }
        if (fading && now - fadeStarted >= FADE_MS) {
            finish();
            return;
        }
        raf = requestAnimationFrame(frame);
    }

    function finish() {
        active = false;
        fading = false;
        if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
        particles.length = 0;
        if (canvas) canvas.classList.remove("active", "fading");
        const cb = doneCallback;
        doneCallback = null;
        try {
            if (cb) cb();
        } finally {
            clearMask();
            if (card) card.classList.remove("plasma-dissolving");
            front = null;
        }
    }

    function reset() {
        active = false;
        localView = false;
        localPad = 0;
        fading = false;
        if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
        particles.length = 0;
        if (canvas) canvas.classList.remove("active", "fading");
        clearMask();
        if (card) card.classList.remove("plasma-dissolving");
        doneCallback = null;
        front = null;
        card = null;
        canvas = null;
        table = null;
        wrap = null;
        ctx = null;
    }

    function start(target, callback, view) {
        reset();
        const c = target || (studio.cardId ? document.getElementById(studio.cardId) : null);
        if (!c) return false;
        let w;
        let f;
        let tbl;
        let cv;
        if (view) {
            w = view.wrap;
            f = view.front || c;
            tbl = view.table;
            cv = view.canvas;
        } else {
            w = studio.wrapSelector ? (c.closest(studio.wrapSelector) || c.parentElement) : c.parentElement;
            f = studio.frontSelector ? c.querySelector(studio.frontSelector) : c;
            tbl = c.closest(".battle-table");
            cv = studio.canvasId ? document.getElementById(studio.canvasId) : null;
        }
        if (!w || !f || !tbl || !cv) return false;
        card = c;
        wrap = w;
        front = f;
        table = tbl;
        canvas = cv;
        localView = !!(view && view.local);
        localPad = localView ? (view.pad || 0) : 0;
        if (!maskSupported()) {
            reset();
            return false;
        }
        wrap.classList.remove("dealing");
        if (!measure()) {
            reset();
            return false;
        }
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(tableW * dpr));
        canvas.height = Math.max(1, Math.round(tableH * dpr));
        ctx = canvas.getContext("2d");
        if (!ctx) {
            reset();
            return false;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        filterOk = typeof ctx.filter === "string";
        buildTextures();
        if (!buildGrid()) {
            reset();
            return false;
        }
        particles = [];
        card.classList.add("plasma-dissolving");
        canvas.classList.remove("fading");
        canvas.classList.add("active");
        doneCallback = typeof callback === "function" ? callback : null;
        startedAt = performance.now();
        lastAt = startedAt;
        lastMaskAt = startedAt;
        active = true;
        fading = false;
        updateStates(0);
        applyMask();
        burstBottom();
        render(0);
        raf = requestAnimationFrame(frame);
        return true;
    }

    return { start: start, reset: reset };
}

const BotPlasmaDissolve = createPlasmaDissolve({
    cardId: "bot-card",
    wrapSelector: "#bot-card-wrap",
    frontSelector: ".card-front",
    canvasId: "bot-dissolve-fx"
});

const PlayerPlasmaDissolve = createPlasmaDissolve({
    cardId: null,
    wrapSelector: null,
    frontSelector: null,
    canvasId: null
});

const PlayerPlasmaAppear = (() => {
    const REVEAL_START = 0.04;
    const REVEAL_SPAN = 0.58;
    const MASK_CLEAR_AT = 0.78;
    const FINISH_AT = 1.1;
    const MAX_PARTICLES = 220;
    const textures = { ready: false };
    let options = null;
    let cards = [];
    let inners = [];
    let canvas = null;
    let ctx = null;
    let table = null;
    let cols = 0;
    let rows = 0;
    let total = 0;
    let delays = null;
    let tones = null;
    let shown = null;
    let angles = [];
    let maskCv = null;
    let maskCtx = null;
    let maskImage = null;
    let tableW = 0;
    let tableH = 0;
    let dpr = 1;
    let filterOk = false;
    let particles = [];
    let raf = 0;
    let active = false;
    let prepared = false;
    let cleared = false;
    let startedAt = 0;
    let lastAt = 0;
    let lastMaskAt = 0;

    function glowSprite(center, middle, edge) {
        const c = document.createElement("canvas");
        c.width = 48;
        c.height = 48;
        const g = c.getContext("2d");
        const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
        grad.addColorStop(0, center);
        grad.addColorStop(0.22, middle);
        grad.addColorStop(1, edge);
        g.fillStyle = grad;
        g.fillRect(0, 0, 48, 48);
        return c;
    }

    function buildTextures() {
        if (textures.ready) return;
        textures.sparkCyan = glowSprite("rgba(255, 255, 255, 1)", "rgba(34, 211, 238, 0.92)", "rgba(34, 211, 238, 0)");
        textures.sparkMagenta = glowSprite("rgba(255, 255, 255, 1)", "rgba(232, 121, 249, 0.92)", "rgba(232, 121, 249, 0)");
        textures.dustCyan = glowSprite("rgba(226, 255, 255, 0.55)", "rgba(34, 211, 238, 0.28)", "rgba(34, 211, 238, 0)");
        textures.dustMagenta = glowSprite("rgba(255, 236, 255, 0.55)", "rgba(232, 121, 249, 0.28)", "rgba(232, 121, 249, 0)");
        textures.ready = true;
    }

    function maskSupported() {
        const probe = document.createElement("div");
        return typeof probe.style.webkitMaskImage !== "undefined" ||
            (window.CSS && typeof CSS.supports === "function" && CSS.supports("mask-image", "url(#p)"));
    }

    function buildGrid(w, h) {
        cols = Math.max(24, Math.min(52, Math.round(w / 2.6)));
        rows = Math.max(32, Math.min(68, Math.round(cols * h / w)));
        total = cols * rows;
        delays = new Float32Array(total);
        tones = new Uint8Array(total);
        shown = new Uint8Array(total);
        for (let y = 0; y < rows; y++) {
            const base = (rows - 1 - y) / Math.max(1, rows - 1);
            for (let x = 0; x < cols; x++) {
                const i = y * cols + x;
                const wave = Math.sin(x * 0.42 + 1.3) * 0.07 +
                    Math.sin(x * 0.13 - 0.6) * 0.05;
                const jitter = (Math.random() - 0.5) * 0.1;
                delays[i] = Math.max(0, Math.min(1, base + wave + jitter));
                tones[i] = Math.random() < 0.5 ? 1 : 0;
            }
        }
        maskCv = document.createElement("canvas");
        maskCv.width = cols;
        maskCv.height = rows;
        maskCtx = maskCv.getContext("2d");
        maskImage = maskCtx.createImageData(cols, rows);
        for (let i = 0; i < total; i++) {
            maskImage.data[i * 4] = 255;
            maskImage.data[i * 4 + 1] = 255;
            maskImage.data[i * 4 + 2] = 255;
            maskImage.data[i * 4 + 3] = 0;
        }
        return true;
    }

    function applyMask() {
        if (!maskCv || !maskImage || !inners.length) return;
        for (let i = 0; i < total; i++) {
            maskImage.data[i * 4 + 3] = shown[i] ? 255 : 0;
        }
        maskCtx.putImageData(maskImage, 0, 0);
        const value = 'url("' + maskCv.toDataURL() + '")';
        for (let i = 0; i < inners.length; i++) {
            const s = inners[i].style;
            s.setProperty("-webkit-mask-image", value);
            s.setProperty("mask-image", value);
            s.setProperty("-webkit-mask-size", "100% 100%");
            s.setProperty("mask-size", "100% 100%");
            s.setProperty("-webkit-mask-repeat", "no-repeat");
            s.setProperty("mask-repeat", "no-repeat");
            s.setProperty("-webkit-mask-position", "0 0");
            s.setProperty("mask-position", "0 0");
        }
    }

    function clearMasks() {
        const props = [
            "-webkit-mask-image", "mask-image",
            "-webkit-mask-size", "mask-size",
            "-webkit-mask-repeat", "mask-repeat",
            "-webkit-mask-position", "mask-position"
        ];
        for (let i = 0; i < inners.length; i++) {
            for (let j = 0; j < props.length; j++) {
                inners[i].style.removeProperty(props[j]);
            }
        }
    }

    function setupCanvas() {
        const tr = table.getBoundingClientRect();
        tableW = tr.width;
        tableH = tr.height;
        if (tableW < 20 || tableH < 20) return false;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(tableW * dpr));
        canvas.height = Math.max(1, Math.round(tableH * dpr));
        ctx = canvas.getContext("2d");
        if (!ctx) return false;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        filterOk = typeof ctx.filter === "string";
        return true;
    }

    function syncCanvas() {
        if (!table || !canvas || !ctx) return;
        const tr = table.getBoundingClientRect();
        const w = Math.max(1, Math.round(tr.width));
        const h = Math.max(1, Math.round(tr.height));
        if (w === tableW && h === tableH) return;
        tableW = w;
        tableH = h;
        canvas.width = Math.max(1, Math.round(tableW * dpr));
        canvas.height = Math.max(1, Math.round(tableH * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function pushParticle(p) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        particles.push(p);
    }

    function spawnSpark(x, y, tone, power) {
        const life = 0.3 + Math.random() * 0.4;
        const vx = (Math.random() - 0.5) * 70 * power;
        const vy = (-34 - Math.random() * 66) * power;
        pushParticle({
            kind: "spark",
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            g: -8,
            drag: 1.3,
            size: 2.6 + Math.random() * 4,
            life: life,
            maxLife: life,
            alpha: 0.9,
            rot: Math.atan2(vy, vx),
            spin: (Math.random() - 0.5) * 3,
            tex: tone ? textures.sparkMagenta : textures.sparkCyan
        });
    }

    function spawnDust(x, y, tone) {
        const life = 0.5 + Math.random() * 0.5;
        pushParticle({
            kind: "dust",
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 24,
            vy: -8 - Math.random() * 26,
            g: -6,
            drag: 0.95,
            size: 6 + Math.random() * 10,
            life: life,
            maxLife: life,
            alpha: 0.3,
            rot: 0,
            spin: 0,
            tex: tone ? textures.dustMagenta : textures.dustCyan
        });
    }

    function spawnWisp(x, y, tone) {
        const life = 0.55 + Math.random() * 0.4;
        pushParticle({
            kind: "wisp",
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 14,
            vy: -6 - Math.random() * 18,
            g: -4,
            drag: 1.05,
            size: 14 + Math.random() * 16,
            life: life,
            maxLife: life,
            alpha: 0.18,
            rot: 0,
            spin: 0,
            tex: tone ? textures.dustMagenta : textures.dustCyan
        });
    }

    function burst() {
        const tr = table.getBoundingClientRect();
        for (let c = 0; c < inners.length; c++) {
            const r = inners[c].getBoundingClientRect();
            if (!r.width) continue;
            const angle = (angles[c] || 0) * Math.PI / 180;
            const slope = Math.tan(angle);
            const x0 = r.left - tr.left;
            const y0 = r.bottom - tr.top - 2;
            for (let i = 0; i < 9; i++) {
                const x = x0 + Math.random() * r.width;
                const y = y0 + (x - x0 - r.width / 2) * slope;
                spawnSpark(x, y, Math.random() < 0.5, 1.15);
            }
            for (let i = 0; i < 3; i++) {
                const x = x0 + Math.random() * r.width;
                const y = y0 + (x - x0 - r.width / 2) * slope;
                spawnDust(x, y, Math.random() < 0.5);
            }
        }
    }

    function spawnEdge(t, dt) {
        const p = (t - REVEAL_START) / REVEAL_SPAN;
        if (p <= 0 || p >= 1) return;
        const tick = Math.max(0.25, Math.min(1.8, dt / 0.0167));
        const tr = table.getBoundingClientRect();
        for (let c = 0; c < inners.length; c++) {
            const r = inners[c].getBoundingClientRect();
            if (!r.width) continue;
            const angle = (angles[c] || 0) * Math.PI / 180;
            const slope = Math.tan(angle);
            const x = r.left - tr.left;
            const y = r.top - tr.top + r.height * (1 - p);
            if (Math.random() < 0.6 * tick) {
                const px = x + Math.random() * r.width;
                spawnSpark(px, y + (px - x - r.width / 2) * slope + (Math.random() - 0.5) * r.height * 0.05, Math.random() < 0.5, 1);
            }
            if (Math.random() < 0.22 * tick) {
                const px = x + Math.random() * r.width;
                spawnDust(px, y + (px - x - r.width / 2) * slope + (Math.random() - 0.5) * r.height * 0.04, Math.random() < 0.5);
            }
            if (Math.random() < 0.035 * tick) {
                const px = x + Math.random() * r.width;
                spawnWisp(px, y + (px - x - r.width / 2) * slope, Math.random() < 0.5);
            }
        }
    }

    function drawEdgeGlow(t) {
        const p = (t - REVEAL_START) / REVEAL_SPAN;
        if (p < 0 || p > 1) return;
        const tr = table.getBoundingClientRect();
        const pulse = 0.78 + 0.22 * Math.sin(t * 42);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        for (let c = 0; c < inners.length; c++) {
            const r = inners[c].getBoundingClientRect();
            if (!r.width) continue;
            const angle = (angles[c] || 0) * Math.PI / 180;
            const ax = Math.cos(angle);
            const ay = Math.sin(angle);
            const cx = r.left - tr.left + r.width / 2;
            const cy = r.top - tr.top + r.height * (1 - p);
            const half = r.width * 0.44;
            const x1 = cx - ax * half;
            const y1 = cy - ay * half;
            const x2 = cx + ax * half;
            const y2 = cy + ay * half;
            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, "rgba(34, 211, 238, 0)");
            grad.addColorStop(0.18, "rgba(34, 211, 238, " + (0.3 * pulse) + ")");
            grad.addColorStop(0.5, "rgba(236, 254, 255, " + (0.5 * pulse) + ")");
            grad.addColorStop(0.82, "rgba(232, 121, 249, " + (0.3 * pulse) + ")");
            grad.addColorStop(1, "rgba(232, 121, 249, 0)");
            ctx.strokeStyle = grad;
            if (filterOk) ctx.filter = "blur(5px)";
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            if (filterOk) ctx.filter = "none";
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = "rgba(244, 255, 255, " + (0.56 * pulse) + ")";
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        ctx.restore();
    }

    function updateMask(t) {
        let changed = false;
        for (let i = 0; i < total; i++) {
            const show = t >= REVEAL_START + delays[i] * REVEAL_SPAN ? 1 : 0;
            if (shown[i] !== show) {
                shown[i] = show;
                changed = true;
            }
        }
        if (changed) applyMask();
    }

    function updateParticles(dt) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            p.vy += p.g * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= Math.max(0, 1 - p.drag * dt);
            p.vy *= Math.max(0, 1 - p.drag * dt * 0.5);
            p.rot += p.spin * dt;
            if (p.x < -60 || p.x > tableW + 60 || p.y < -80 || p.y > tableH + 60) {
                particles.splice(i, 1);
            }
        }
    }

    function drawParticles() {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const ratio = Math.max(0, p.life / p.maxLife);
            const alpha = p.alpha * Math.min(1, ratio * 2.6);
            const age = 1 - ratio;
            let size = p.size;
            if (p.kind === "dust") size *= 1 + age * 1.1;
            if (p.kind === "spark") size *= 0.58 + 0.42 * ratio;
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            ctx.save();
            if (p.kind === "spark") {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.scale(1, 0.42);
                ctx.drawImage(p.tex, -size / 2, -size / 2, size, size);
            } else {
                ctx.drawImage(p.tex, p.x - size / 2, p.y - size / 2, size, size);
            }
            ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
    }

    function frame(now) {
        if (!active) return;
        syncCanvas();
        const t = (now - startedAt) / 1000;
        const dt = Math.max(0.001, Math.min(0.034, (now - lastAt) / 1000));
        lastAt = now;
        if (t < MASK_CLEAR_AT) {
            if (now - lastMaskAt >= 26) {
                updateMask(t);
                lastMaskAt = now;
            }
            spawnEdge(t, dt);
        } else if (!cleared) {
            clearMasks();
            cleared = true;
        }
        updateParticles(dt);
        ctx.clearRect(0, 0, tableW, tableH);
        if (t < MASK_CLEAR_AT) drawEdgeGlow(t);
        drawParticles();
        if (t >= FINISH_AT) {
            finishNow();
            return;
        }
        raf = requestAnimationFrame(frame);
    }

    function finishNow() {
        active = false;
        prepared = false;
        if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
        particles.length = 0;
        clearMasks();
        if (ctx) ctx.clearRect(0, 0, tableW, tableH);
        if (canvas) canvas.classList.remove("active");
        if (options) options.classList.remove("plasma-staging");
    }

    function reset() {
        finishNow();
        if (options) options.classList.remove("plasma-deal");
        options = null;
        cards = [];
        inners = [];
        angles = [];
        canvas = null;
        ctx = null;
        table = null;
        particles = [];
    }

    function prepare(container) {
        reset();
        if (!container || document.body.getAttribute("data-theme") !== "plush") return false;
        if (!maskSupported()) return false;
        const cardEls = Array.prototype.slice.call(container.querySelectorAll(".option-card"));
        if (cardEls.length < 2) return false;
        const innerEls = cardEls.map((c) => c.querySelector(".card-inner")).filter(Boolean);
        if (innerEls.length !== cardEls.length) return false;
        const tbl = container.closest(".battle-table");
        const cv = document.getElementById("player-appear-fx");
        if (!tbl || !cv) return false;
        const w = innerEls[0].offsetWidth || innerEls[0].clientWidth;
        const h = innerEls[0].offsetHeight || innerEls[0].clientHeight;
        if (w < 20 || h < 20) return false;
        options = container;
        cards = cardEls;
        inners = innerEls;
        table = tbl;
        canvas = cv;
        angles = cardEls.map((c) => parseFloat(getComputedStyle(c).getPropertyValue("--fan-rot")) || 0);
        if (!buildGrid(w, h) || !setupCanvas()) {
            reset();
            return false;
        }
        buildTextures();
        options.classList.add("plasma-deal", "plasma-staging");
        applyMask();
        options.classList.remove("plasma-staging");
        canvas.classList.remove("active");
        prepared = true;
        return true;
    }

    function start() {
        if (!prepared || !ctx) return false;
        if (active) return false;
        active = true;
        cleared = false;
        particles = [];
        canvas.classList.add("active");
        syncCanvas();
        startedAt = performance.now();
        lastAt = startedAt;
        lastMaskAt = startedAt;
        burst();
        raf = requestAnimationFrame(frame);
        return true;
    }

    return { prepare: prepare, start: start, finishNow: finishNow, reset: reset };
})();

function dissolveBotCard() {
    const card = document.getElementById("bot-card");
    if (!card) return;
    const pixelsWrap = document.getElementById("bot-pixels");
    pixelsWrap.innerHTML = "";
    pixelsWrap.classList.remove("active");
    card.classList.add("revealed");
    Sound.dissolve();
    let started = false;
    try {
        started = BotPlasmaDissolve.start(card, resetBotCardForNewRound);
    } catch (e) {
        started = false;
    }
    if (started) return;
    pixelsWrap.classList.add("active");
    card.classList.add("dissolving");
    setTimeout(resetBotCardForNewRound, 700);
}

function resetBotCardForNewRound() {
    BotPlasmaDissolve.reset();
    const card = document.getElementById("bot-card");
    const botWrap = document.getElementById("bot-card-wrap");
    const pixelsWrap = document.getElementById("bot-pixels");
    if (!card) return;
    card.classList.add("dissolved-away");
    card.classList.remove("dissolving");
    card.classList.remove("revealed");
    botWrap.classList.remove("dealing");
    pixelsWrap.classList.remove("active");
    pixelsWrap.innerHTML = "";
}

// Сыгранная карта растворяется на своём месте: маска ложится прямо на
// карту, а повёрнутый по её углу canvas рисует плазменную кромку,
// частицы и пепел поверх неё. Карта остаётся в раскладке, поэтому рука
// не смещается; в конце она прячется, а stage удаляется.
function dissolvePlayerCard(card) {
    if (!card) return;
    if (!onGameScreen()) {
        card.classList.add("played-out");
        return;
    }
    const visual = card.querySelector(".card-inner") || card;
    const w = visual.offsetWidth;
    const h = visual.offsetHeight;
    const src = visual.getBoundingClientRect();
    if (w < 20 || h < 20 || !src.width) {
        card.classList.add("played-out");
        return;
    }
    let angle = 0;
    const tr = getComputedStyle(card).transform;
    const m = tr && tr !== "none" ? tr.match(/^matrix\(([^)]+)\)$/) : null;
    if (m) {
        const p = m[1].split(",").map(parseFloat);
        if (p.length >= 2) angle = Math.atan2(p[1], p[0]);
    }
    const pad = 54;
    const stageW = w + pad * 2;
    const stageH = h + pad * 2;
    const stage = document.createElement("div");
    stage.className = "player-dissolve-stage";
    stage.style.width = stageW + "px";
    stage.style.height = stageH + "px";
    stage.style.left = (src.left + src.width / 2 - stageW / 2) + "px";
    stage.style.top = (src.top + src.height / 2 - stageH / 2) + "px";
    stage.style.transform = "rotate(" + angle + "rad)";
    const canvas = document.createElement("canvas");
    canvas.className = "player-dissolve-fx";
    stage.appendChild(canvas);
    document.body.appendChild(stage);
    let syncRaf = 0;
    let syncAlive = true;
    function syncStage() {
        if (!syncAlive || !stage.isConnected) {
            syncRaf = 0;
            return;
        }
        const r = visual.getBoundingClientRect();
        stage.style.left = (r.left + r.width / 2 - stageW / 2) + "px";
        stage.style.top = (r.top + r.height / 2 - stageH / 2) + "px";
        syncRaf = requestAnimationFrame(syncStage);
    }
    syncStage();
    let started = false;
    try {
        started = PlayerPlasmaDissolve.start(card, function () {
            syncAlive = false;
            if (syncRaf) {
                cancelAnimationFrame(syncRaf);
                syncRaf = 0;
            }
            card.classList.add("played-out");
            if (stage.parentElement) stage.remove();
        }, { wrap: stage, front: visual, table: stage, canvas: canvas, local: true, pad: pad });
    } catch (e) {
        started = false;
    }
    if (started) return;
    syncAlive = false;
    if (syncRaf) {
        cancelAnimationFrame(syncRaf);
        syncRaf = 0;
    }
    if (stage.parentElement) stage.remove();
    card.classList.add("played-out");
}

function evaluateQuizAnswer(answer, correctAnswer, forced) {
    const buttons = document.querySelectorAll("#options .option-card");
    const isBattle = state.playMode === "quiz";
    const feedback = isBattle 
        ? document.getElementById("battle-feedback") 
        : document.getElementById("feedback");
    
    state.roundTotal++;
    const isCorrect = !forced && answer === correctAnswer;
    
    buttons.forEach(b => {
        if (b.dataset.answer === correctAnswer) b.classList.add("correct");
        if (b.dataset.answer === answer && !isCorrect) b.classList.add("wrong");
        if (forced) b.classList.remove("selected");
    });
    
    if (isCorrect) {
        Sound.correct();
        feedback.innerHTML = "ОТБИТО ! " + iconHTML("✔");
        feedback.className = "correct";
        state.streak++;
        state.roundCorrect++;
        
        const word = state.gameWords[state.currentWordIndex];
        const fresh = learnWord(word);
        recordAnswer(true, fresh);
        comboAdd();
        if (isBattle) {
            const played = document.querySelector("#options .option-card.selected");
            setTimeout(function () {
                if (!onGameScreen()) return;
                dissolvePlayerCard(played);
                dissolveBotCard();
            }, 600);
        }
    } else {
        Sound.wrong();
        feedback.textContent = `НЕ ОТБИТО ! Правильно: ${correctAnswer}`;
        feedback.className = "incorrect";
        state.streak = 0;
        markWrong(state.gameWords[state.currentWordIndex]);
        recordAnswer(false, false);
        comboReset();
        loseLife();
    }
    
    if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
    }
    
    if (isBattle) {
        document.getElementById("player-deck-num").textContent = state.learnedWords.length;
        // Автопереход к следующему раунду без кнопки
        if (state.lives > 0 && state.inProgress) {
            const delay = isCorrect ? 2400 : 3300;
            setTimeout(() => {
                if (state.lives > 0 && state.inProgress && onGameScreen()) nextWord();
            }, delay);
        }
    } else {
        document.getElementById("next-btn").classList.remove("hidden");
    }

    saveData();

    if (state.lives <= 0) {
        setTimeout(() => { if (onGameScreen()) showGameOver(); }, 800);
    }
}

function checkAnswer(forced) {
    const input = document.getElementById("answer-input");
    const answer = input.value.trim().toLowerCase();
    if (!answer && !forced) return;

    const word = state.gameWords[state.currentWordIndex];
    // В режиме аудирования ответом служит само английское слово
    const correctAnswer = state.playMode === "listening"
        ? tgt(word)
        : (isTargetToNative() ? nat(word) : tgt(word));

    state.roundTotal++;

    const isCorrect = !forced && (isSentenceMode()
        ? sentenceMatches(answer, word, state.direction)
        : wordAnswerMatches(answer, correctAnswer, word, state.direction));
    const feedback = document.getElementById("feedback");

    if (isCorrect) {
        Sound.correct();
        feedback.textContent = "ПРАВИЛЬНО !";
        feedback.className = "feedback correct";
        state.streak++;
        state.roundCorrect++;
        const fresh = learnWord(word);
        recordAnswer(true, fresh);
        comboAdd();
    } else {
        Sound.wrong();
        feedback.textContent = `НЕВЕРНО ! Правильно: ${correctAnswer}`;
        feedback.className = "feedback incorrect";
        state.streak = 0;
        markWrong(word);
        recordAnswer(false, false);
        comboReset();
        loseLife();
    }
    
    if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
    }
    
    input.disabled = true;
    document.getElementById("check-btn").classList.add("hidden");
    document.getElementById("next-btn").classList.remove("hidden");

    saveData();

    if (state.lives <= 0) {
        setTimeout(() => { if (onGameScreen()) showGameOver(); }, 800);
    } else if (typeof window.NZ_KB_IS_MOBILE === 'function' && window.NZ_KB_IS_MOBILE()) {
        const checkedIndex = state.currentWordIndex;
        setTimeout(function () {
            if (!onGameScreen() || !state.inProgress) return;
            if (state.currentWordIndex !== checkedIndex) return;
            nextWord();
        }, 3000);
    }
}

// Активен ли сейчас экран игры (защита отложенных таймеров: раунд мог быть покинут)
function onGameScreen() {
    const gs = document.getElementById("game-screen");
    return !!gs && !gs.classList.contains("hidden");
}

function nextWord() {
    MIC.stop();
    stopSpeedTimer();
    if (state.lives <= 0) {
        showGameOver();
        return;
    }
    state.currentWordIndex++;
    state.selectedAnswer = null;
    const options = document.getElementById("options");
    if (options) options.innerHTML = "";
    const input = document.getElementById("answer-input");
    if (input) input.style.display = "";
    saveData();
    showGameWord();
}

// «Не знаю»: показываем верный ответ в поле ввода, снимаем одно сердечко
// и жмём «Далее» (или авто-переход на мобильном) — как при неверном ответе.
function skipWord() {
    if (!onGameScreen()) return;
    const input = document.getElementById("answer-input");
    if (input && input.disabled) return; // ответ уже показан — есть «Далее»
    const word = state.gameWords[state.currentWordIndex];
    if (!word) return;
    const correctAnswer = isTargetToNative() ? nat(word) : tgt(word);
    MIC.stop();
    Sound.wrong();
    state.streak = 0;
    markWrong(word);
    recordAnswer(false, false);
    comboReset();
    loseLife();
    if (input) {
        input.value = correctAnswer;
        input.disabled = true;
        input.blur();
    }
    const kb = document.getElementById("nz-kb");
    if (kb) kb.classList.remove("open");
    document.body.classList.remove("nz-kb-open");
    const feedback = document.getElementById("feedback");
    if (feedback) {
        feedback.textContent = `Запомни!: ${correctAnswer}`;
        feedback.className = "feedback remember";
    }
    document.getElementById("check-btn").classList.add("hidden");
    document.getElementById("next-btn").classList.remove("hidden");
    saveData();
    if (state.lives <= 0) {
        setTimeout(() => { if (onGameScreen()) showGameOver(); }, 800);
    } else if (typeof window.NZ_KB_IS_MOBILE === "function" && window.NZ_KB_IS_MOBILE()) {
        const checkedIndex = state.currentWordIndex;
        setTimeout(function () {
            if (!onGameScreen() || !state.inProgress) return;
            if (state.currentWordIndex !== checkedIndex) return;
            nextWord();
        }, 3000);
    }
}

// Тап по игровому полю после проверки ответа = кнопка «Далее».
document.addEventListener("DOMContentLoaded", function () {
    const screen = document.getElementById("game-screen");
    if (!screen) return;
    screen.addEventListener("click", function (e) {
        const next = document.getElementById("next-btn");
        if (!next || next.classList.contains("hidden")) return;
        if (e.target && e.target.closest && e.target.closest("button, input, a, .nz-kb")) return;
        if (!onGameScreen()) return;
        nextWord();
    });
});

// ===== КАРТЫ: собери предложение из карточек, которые раздаёт бот =====
const CARDS = {
    sentence: null,
    target: "",
    slots: 0,
    sourceHint: ""
};

function cardsDirBoxVisible() {
    const box = document.getElementById("cards-dir-box");
    if (!box) return;
    // Направление ввода показываем во всех режимах с ручным вводом/сборкой:
    // «Ввод слов» (слова и предложения) и «Собери предложение».
    // «5 к 1» оставляем как есть; «Услышь слово» всегда работает на языке цели.
    const show = state.playMode === "input" || isCardsMode();
    box.classList.toggle("hidden", !show);
    if (show) cardsDirRefresh();
}

function setCardsDirection(dir) {
    state.direction = dir;
    saveData();
    cardsDirRefresh();
}

function cardsDirRefresh() {
    const r = document.getElementById("cards-dir-ru");
    const e = document.getElementById("cards-dir-en");
    if (!r || !e) return;
    const target = isJa() ? "Яп" : "Англ";
    const native = "Рус";
    r.textContent = native + " → " + target;
    e.textContent = target + " → " + native;
    r.classList.toggle("selected", state.direction === "ru-en");
    e.classList.toggle("selected", state.direction === "en-ru");
}

function showCardsRound(sentence) {
    document.getElementById("input-area").classList.add("hidden");
    document.getElementById("battle-area").classList.add("hidden");
    const area = document.getElementById("cards-area");
    area.classList.remove("hidden");
    placeHearts(true);

    const dir = state.direction;
    const variants = dir === "en-ru"
        ? [nat(sentence)].concat(sentence.altRu || [])
        : [tgt(sentence)].concat(sentence.altEn || []);
    const target = variants[Math.floor(Math.random() * variants.length)] || nat(sentence);
    const tokens = String(target).split(/\s+/);

    CARDS.sentence = sentence;
    CARDS.target = target;
    CARDS.count = tokens.length;
    CARDS.sourceHint = dir === "en-ru" ? tgt(sentence) : nat(sentence);
    document.getElementById("cards-label").textContent = dir === "en-ru"
        ? "СОБЕРИТЕ ПРЕДЛОЖЕНИЕ НА РУССКОМ"
        : (isJa() ? "СОБЕРИТЕ ПРЕДЛОЖЕНИЕ НА ЯПОНСКОМ" : "СОБЕРИТЕ ПРЕДЛОЖЕНИЕ НА АНГЛИЙСКОМ");
    area.classList.remove("checked");

    cardsAbortDrag();
    cardsClearSelection();

    const grid = document.getElementById("cards-grid");
    grid.innerHTML = "";
    grid.classList.add("player-zone");

    const tokensIdx = tokens.map((t, i) => ({ token: t, id: i }));
    const shuffledTokens = shuffleArray(tokensIdx);

    shuffledTokens.forEach((c) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "cards-word option-card";
        card.dataset.id = c.id;
        card.dataset.token = c.token;
        card.setAttribute("aria-label", c.token);
        card.innerHTML = `
            <span class="card-inner">
                ${buildStars()}
                <span class="opt-letter">✦</span>
                <span class="opt-suit">${iconHTML("✦")}</span>
                <span class="opt-text"></span>
                <span class="opt-suit">${iconHTML("✦")}</span>
            </span>
        `;
        // Слово карточки — через textContent (в предложениях бывают любые символы).
        // Конечную пунктуацию скрываем, чтобы по точке не угадывать последнее слово.
        card.querySelector(".opt-text").textContent = c.token.replace(/[.!?。！？,;:]+$/, "");
        card.addEventListener("click", () => cardsTap(card));
        grid.appendChild(card);
        const ci = card.querySelector(".card-inner");
        fitTextOneLine(card.querySelector(".opt-text"), optInnerAvail(ci), 7, 6.5);
    });

    cardsBindDrag();

    const fb = document.getElementById("cards-feedback");
    fb.textContent = "";
    fb.className = "feedback";
    document.getElementById("cards-next").classList.add("hidden");
    const check = document.getElementById("cards-check");
    check.disabled = false;
    check.classList.remove("hidden");
    document.getElementById("cards-reset").disabled = false;

    // Раскладываем карты по строкам до первого кадра: длинные предложения
    // должны стоять ровными рядами без «сироты» из одной карты. Размеры
    // прошлого раунда сбрасываем, чтобы поле пересчиталось под текущий проём.
    area.style.removeProperty("--card-w");
    grid.style.removeProperty("--card-cols");
    area.dataset.layoutKey = "";
    cardsLayout(true);
    requestAnimationFrame(() => {
        if (window.__refitScreenFit) window.__refitScreenFit("game-screen");
        cardsLayout(true);
    });

    Sound.deal();
    refreshCardsAudioMode();
}

// Раскладка карточек: одна сетка на всё поле. Ширина карты приходит в
// --card-w, количество столбцов — в --card-cols. Подбираем самый крупный
// размер, при котором все карты помещаются в поле без обрезки и скролла.
function cardsLayout(force) {
    const grid = document.getElementById("cards-grid");
    const area = document.getElementById("cards-area");
    const field = document.getElementById("cards-field");
    if (!grid || !area || !field) return;
    if (area.classList.contains("hidden") || !grid.offsetParent) return;
    const n = grid.querySelectorAll(".cards-word:not(.cards-drag-ghost)").length;
    if (!n) {
        area.style.removeProperty("--card-w");
        grid.style.removeProperty("--card-cols");
        area.dataset.layoutKey = "";
        return;
    }
    const gcs = getComputedStyle(grid);
    const W = Math.max(1, grid.clientWidth
        - (parseFloat(gcs.paddingLeft) || 0)
        - (parseFloat(gcs.paddingRight) || 0));
    const gap = parseFloat(gcs.columnGap) || parseFloat(gcs.rowGap) || parseFloat(gcs.gap) || 0;
    const fcs = getComputedStyle(field);
    const fit = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-fit")) || 1;
    const px = (v) => parseFloat(v) || 0;
    // Поле больше не занимает всю высоту экрана: его высота = ряды карт +
    // рамка 9-slice + небольшой воздух. Высота кладётся в --cards-field-h,
    // а #cards-area центрирует всю группу (промпт → поле → отклик → кнопки),
    // поэтому пустого фетра вокруг карт не остаётся.
    const prompt = area.querySelector(".cards-prompt");
    const feedback = document.getElementById("cards-feedback");
    const controls = area.querySelector(".cards-controls");
    const pcs = prompt ? getComputedStyle(prompt) : null;
    const fbc = feedback ? getComputedStyle(feedback) : null;
    const ccs = controls ? getComputedStyle(controls) : null;
    const blockH = (el, cs) => el ? el.offsetHeight
        + (cs ? px(cs.marginTop) + px(cs.marginBottom) : 0) : 0;
    const frameH = px(fcs.borderTopWidth) + px(fcs.borderBottomWidth)
        + px(fcs.paddingTop) + px(fcs.paddingBottom);
    const extra = 20 * fit;
    const fieldMargin = px(fcs.marginTop) + px(fcs.marginBottom);
    const areaH = area.clientHeight;
    const areaFieldMax = Math.max(1, areaH
        - blockH(prompt, pcs)
        - blockH(feedback, fbc)
        - blockH(controls, ccs)
        - fieldMargin - 4);
    const maxFieldH = Math.max(1, Math.min(430 * fit, areaFieldMax));
    const minFieldH = Math.min(280 * fit, maxFieldH);
    // Сетке доступна высота поля минус рамка и внутренний воздух.
    const avail = Math.max(1, maxFieldH - frameH - 2 * extra);
    // Стартуем от ширины поля, а не от жёстких 76px: на узком экране
    // подборщик сам найдёт максимальный размер, при котором ряды влезают.
    // Потолок 100px·fit не даёт коротким наборам (4 карты) раздуться в
    // огромные плитки с крошечным текстом.
    const maxW = Math.min(W, 100 * fit);
    // Не в 2 ряда: разрешаем три ряда всем наборам. Подборщик ищет самый
    // крупный размер карт, при котором всё влезает в поле, поэтому длинные
    // наборы получают 4 колонки × 3 ряда крупной плитки вместо крошечной
    // раскладки в 2 ряда по 5 колонок; короткие наборы (≤6 карт) остаются
    // крупными — их раскладка от лимита рядов не меняется.
    const maxRows = 3;
    const cardH = (w) => w * 1.4;
    let best = null;
    for (let w = maxW; w >= 16; w -= 0.25) {
        let gCols = Math.max(1, Math.floor((W + gap) / (w + gap)));
        if (gCols > n) gCols = n;
        const gRows = Math.ceil(n / gCols);
        if (gRows > maxRows) continue;
        // Не оставляем в последнем ряду одну карту-«сироту».
        if (gRows > 1 && n - (gRows - 1) * gCols === 1) continue;
        const total = gRows * cardH(w) + (gRows - 1) * gap;
        if (total <= avail) {
            best = { w, gCols, gRows };
            break;
        }
    }
    if (!best) {
        const w = 16;
        const gCols = Math.max(1, Math.min(n, Math.floor((W + gap) / (w + gap))));
        best = { w, gCols, gRows: Math.ceil(n / gCols) };
    }
    const contentH = best.gRows * cardH(best.w) + (best.gRows - 1) * gap;
    const fieldH = Math.min(maxFieldH,
        Math.max(minFieldH, contentH + frameH + 2 * extra));
    const key = [n, W.toFixed(1), avail.toFixed(1), areaH.toFixed(1),
        gap.toFixed(1), best.w.toFixed(2), best.gCols, best.gRows,
        fieldH.toFixed(1), fit.toFixed(3)].join("|");
    if (!force && area.dataset.layoutKey === key) return;
    area.dataset.layoutKey = key;
    area.style.setProperty("--card-w", best.w.toFixed(2) + "px");
    area.style.setProperty("--cards-field-h", fieldH.toFixed(1) + "px");
    grid.style.setProperty("--card-cols", String(best.gCols));
    grid.querySelectorAll(".cards-word").forEach(card => {
        const ci = card.querySelector(".card-inner");
        fitTextOneLine(card.querySelector(".opt-text"), optInnerAvail(ci), 7, 6.5);
    });
}

window.addEventListener("resize", () => {
    requestAnimationFrame(() => cardsLayout(true));
});

// ===== Перестановка карт местами =====
// Порядок карт в DOM — это порядок предложения. Меняем две карты местами
// и проигрываем FLIP-анимацию: обе карты плавно перелетают на новые места.
let cardsSelected = null;
let cardsSuppressClickUntil = 0;
let cardsDragBound = false;
const cardsDrag = {
    card: null,
    pointerId: null,
    startX: 0,
    startY: 0,
    active: false,
    ghost: null,
    target: null,
    originRect: null,
    transform: "",
    lift: 0,
    uiFit: 1,
    fieldLeft: 0,
    fieldRight: 0,
    fieldTop: 0,
    fieldBottom: 0,
    dockMode: "",
    docked: false,
    ghostAnim: null
};

function cardsBindDrag() {
    if (cardsDragBound) return;
    const grid = document.getElementById("cards-grid");
    if (!grid) return;
    grid.addEventListener("pointerdown", cardsPointerDown);
    document.addEventListener("pointermove", cardsPointerMove, { passive: false });
    document.addEventListener("pointerup", cardsPointerUp);
    document.addEventListener("pointercancel", cardsPointerCancel);
    cardsDragBound = true;
}

function cardsClearSelection() {
    const grid = document.getElementById("cards-grid");
    if (grid) {
        grid.querySelectorAll(".cards-word.selected").forEach(c => c.classList.remove("selected"));
    }
    cardsSelected = null;
}

function cardsKillDeal() {
    const grid = document.getElementById("cards-grid");
    if (!grid) return;
    grid.querySelectorAll(".cards-word").forEach(c => {
        c.style.animation = "none";
        c.style.opacity = "1";
    });
}

function cardsSwap(a, b, animate) {
    const grid = document.getElementById("cards-grid");
    if (!grid || !a || !b || a === b) return;
    if (!grid.contains(a) || !grid.contains(b)) return;
    cardsKillDeal();
    const cards = Array.from(grid.querySelectorAll(".cards-word:not(.cards-drag-ghost)"));
    const before = new Map();
    if (animate) {
        cards.forEach(c => before.set(c, c.getBoundingClientRect()));
    }
    // Меняем узлы местами через маркеры: это работает и для соседних карт.
    const aMarker = document.createComment("swap-a");
    const bMarker = document.createComment("swap-b");
    a.parentNode.replaceChild(aMarker, a);
    b.parentNode.replaceChild(bMarker, b);
    aMarker.parentNode.replaceChild(b, aMarker);
    bMarker.parentNode.replaceChild(a, bMarker);
    if (!animate) return;
    cards.forEach(c => {
        const old = before.get(c);
        const now = c.getBoundingClientRect();
        const dx = old.left - now.left;
        const dy = old.top - now.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        c.animate([
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: "translate(0px, 0px)" }
        ], {
            duration: 320,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        });
    });
}

function cardsCardAt(x, y, exclude) {
    const grid = document.getElementById("cards-grid");
    if (!grid) return null;
    const stack = document.elementsFromPoint
        ? document.elementsFromPoint(x, y)
        : [document.elementFromPoint(x, y)];
    for (const el of stack) {
        if (!el || !el.closest) continue;
        const card = el.closest(".cards-word");
        if (card && card !== exclude && grid.contains(card) &&
            !card.classList.contains("drag-origin")) {
            return card;
        }
    }
    return null;
}

function cardsPointerDown(ev) {
    if (ev.button !== undefined && ev.button !== 0) return;
    const area = document.getElementById("cards-area");
    if (!area || area.classList.contains("hidden") || area.classList.contains("checked")) return;
    const card = ev.target && ev.target.closest ? ev.target.closest(".cards-word") : null;
    const grid = document.getElementById("cards-grid");
    if (!card || !grid || !grid.contains(card) || card.disabled) return;
    if (cardsDrag.card) return;
    cardsDrag.card = card;
    cardsDrag.pointerId = ev.pointerId;
    cardsDrag.startX = ev.clientX;
    cardsDrag.startY = ev.clientY;
    cardsDrag.active = false;
    cardsDrag.ghost = null;
    cardsDrag.target = null;
    cardsDrag.originRect = null;
    cardsDrag.transform = "";
}

function cardsDragLayer() {
    let layer = document.getElementById("cards-drag-layer");
    if (!layer) {
        layer = document.createElement("div");
        layer.id = "cards-drag-layer";
        layer.className = "player-zone";
        document.body.appendChild(layer);
    }
    return layer;
}

function cardsDragStart() {
    const d = cardsDrag;
    const card = d.card;
    if (!card) return;
    d.active = true;
    cardsSuppressClickUntil = performance.now() + 450;
    cardsClearSelection();
    cardsKillDeal();
    /* Ни в коем случае не «опустошать» inline-стили карт: у .option-card
       в CSS базовая opacity: 0 + анимация раздачи (forwards). KillDeal гасит
       их парой «animation:none + opacity:1» — стоит снять хоть одну из пары
       (как делалось раньше), и карта с её летающей копией проваливается
       в opacity: 0 и исчезает с экрана. Приглушение тащимой карты делает
       фильтр в CSS (.drag-origin), он с inline-стилями не конфликтует. */
    const rect = card.getBoundingClientRect();
    d.originRect = rect;
    card.classList.add("drag-origin");

    const ghost = card.cloneNode(true);
    ghost.classList.remove("selected", "ok", "bad", "drop-target", "drag-origin");
    ghost.classList.add("cards-drag-ghost");
    ghost.removeAttribute("id");
    ghost.setAttribute("aria-hidden", "true");
    ghost.setAttribute("tabindex", "-1");
    ghost.style.width = rect.width + "px";
    ghost.style.height = rect.height + "px";
    ghost.style.left = rect.left + "px";
    ghost.style.top = rect.top + "px";
    // Приподнимаем копию над пальцем/курсором: иначе она полностью
    // закрывает карту-цель, и кажется, что та исчезла.
    d.lift = rect.height * 0.55;
    d.uiFit = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-fit")) || 1;
    const field = document.getElementById("cards-field");
    if (field) {
        const fr = field.getBoundingClientRect();
        const fcs = getComputedStyle(field);
        d.fieldLeft = fr.left + (parseFloat(fcs.borderLeftWidth) || 0) + (parseFloat(fcs.paddingLeft) || 0);
        d.fieldRight = fr.right - (parseFloat(fcs.borderRightWidth) || 0) - (parseFloat(fcs.paddingRight) || 0);
        d.fieldTop = fr.top + (parseFloat(fcs.borderTopWidth) || 0) + (parseFloat(fcs.paddingTop) || 0);
        d.fieldBottom = fr.bottom - (parseFloat(fcs.borderBottomWidth) || 0) - (parseFloat(fcs.paddingBottom) || 0);
    }
    d.transform = `translate(0px, ${-d.lift}px) rotate(0deg) scale(1.04)`;
    ghost.style.transform = d.transform;
    // Ghost живёт в отдельном fixed-слое вне #cards-grid: у сетки есть
    // анимация menuPopIn с transform, и она превращала бы сетку в containing
    // block для position: fixed — копия уезжала вместе с ней. Слой несёт
    // класс player-zone, чтобы карта сохранила рубашку, звёзды и масти.
    cardsDragLayer().appendChild(ghost);
    d.ghost = ghost;
    document.body.classList.add("cards-dragging");
    Sound.click();
}

function cardsPointerMove(ev) {
    const d = cardsDrag;
    if (!d.card || ev.pointerId !== d.pointerId) return;
    const dx = ev.clientX - d.startX;
    const dy = ev.clientY - d.startY;
    if (!d.active) {
        if (Math.hypot(dx, dy) < 7) return;
        cardsDragStart();
        if (!d.active) return;
    }
    ev.preventDefault();
    const target = cardsCardAt(ev.clientX, ev.clientY, d.card);
    if (target !== d.target) {
        if (d.target) d.target.classList.remove("drop-target");
        d.target = target;
        if (target) target.classList.add("drop-target");
        if (d.ghost) d.ghost.classList.toggle("over-target", !!target);
        if (target) {
            // Если рядом с целью нет места для копии, dock не применяем:
            // копия продолжает лететь за пальцем, цель подсвечена.
            if (!cardsDockGhost(target)) {
                cardsCancelGhostAnim();
                cardsFollowPointer(dx, dy);
            }
        } else {
            cardsCancelGhostAnim();
            cardsFollowPointer(dx, dy);
        }
        return;
    }
    if (!target || !d.docked) cardsFollowPointer(dx, dy);
}

function cardsFollowPointer(dx, dy) {
    const d = cardsDrag;
    const tilt = Math.max(-4, Math.min(4, dx * 0.03));
    d.transform = `translate(${dx}px, ${dy - d.lift}px) rotate(${tilt}deg) scale(1.04)`;
    if (d.ghost) d.ghost.style.transform = d.transform;
    d.docked = false;
}

function cardsCancelGhostAnim() {
    const d = cardsDrag;
    if (d.ghostAnim) {
        const anim = d.ghostAnim;
        d.ghostAnim = null;
        anim.cancel();
    }
}

// Боковой докинг: копия встаёт слева или справа от цели и остаётся целиком в поле.
function cardsDockTransform(target, d) {
    if (!target || !d.originRect) return null;
    const tr = target.getBoundingClientRect();
    const w = d.originRect.width;
    const h = d.originRect.height;
    const gw = w * 1.04;
    const gh = h * 1.04;
    const padX = (gw - w) / 2;
    const padY = (gh - h) / 2;
    const gap = 8 * d.uiFit;
    const clampLeft = v => Math.max(d.fieldLeft, Math.min(d.fieldRight - gw, v));
    const clampTop = v => Math.max(d.fieldTop, Math.min(d.fieldBottom - gh, v));
    const spaceLeft = tr.left - d.fieldLeft;
    const spaceRight = d.fieldRight - tr.right;
    const need = gw + gap;
    let left = null;
    let top = null;
    let mode = "side";
    // Сторона с большим запасом обычно и есть сторона к центру сетки.
    if (spaceRight >= need && spaceRight >= spaceLeft) {
        left = tr.right + gap;
    } else if (spaceLeft >= need) {
        left = tr.left - gap - gw;
    } else if (spaceRight >= need) {
        left = tr.right + gap;
    }
    if (left !== null) {
        left = clampLeft(left);
        top = clampTop(tr.top + tr.height / 2 - gh / 2);
    } else {
        // Сбоку места нет — поднимаем копию над словом цели,
        // а если сверху не помещается, опускаем под него.
        const word = target.querySelector(".opt-text");
        const wr = word ? word.getBoundingClientRect() : tr;
        left = clampLeft(tr.left + tr.width / 2 - gw / 2);
        const above = wr.top - gap - gh;
        if (above >= d.fieldTop) {
            top = above;
            mode = "above";
        } else if (wr.bottom + gap + gh <= d.fieldBottom) {
            top = wr.bottom + gap;
            mode = "below";
        } else {
            /* Ни сбоку, ни сверху, ни снизу копия не встаёт, не задев чужие
               карты. Прежний резерв — сесть ровно НА цель — закрыл бы её
               собой: казалось бы, карта исчезла. Поэтому докинг не
               применяется: копия продолжает лететь за пальцем, а цель и так
               подсвечена рамкой drop-target. */
            return null;
        }
    }
    const x = left + padX - d.originRect.left;
    const y = top + padY - d.originRect.top;
    return { x, y, mode, transform: `translate(${x}px, ${y}px) rotate(0deg) scale(1.04)` };
}

function cardsDockGhost(target) {
    const d = cardsDrag;
    if (!d.ghost) return false;
    const dock = cardsDockTransform(target, d);
    if (!dock) { d.docked = false; return false; }
    // Фиксируем текущую видимую позицию, чтобы анимация шла без скачка.
    const from = getComputedStyle(d.ghost).transform;
    cardsCancelGhostAnim();
    if (from && from !== "none") d.ghost.style.transform = from;
    d.transform = dock.transform;
    d.dockMode = dock.mode;
    d.docked = true;
    const anim = d.ghost.animate(
        [{ transform: from === "none" ? dock.transform : from }, { transform: dock.transform }],
        { duration: 150, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );
    d.ghostAnim = anim;
    anim.onfinish = () => {
        if (d.ghostAnim !== anim) return;
        d.ghostAnim = null;
        if (d.ghost) d.ghost.style.transform = dock.transform;
    };
    anim.oncancel = () => {
        if (d.ghostAnim === anim) d.ghostAnim = null;
    };
    return true;
}

function cardsResetDragState() {
    const d = cardsDrag;
    cardsCancelGhostAnim();
    d.card = null;
    d.pointerId = null;
    d.active = false;
    d.ghost = null;
    d.target = null;
    d.originRect = null;
    d.transform = "";
    d.lift = 0;
    d.uiFit = 1;
    d.fieldLeft = 0;
    d.fieldRight = 0;
    d.fieldTop = 0;
    d.fieldBottom = 0;
    d.dockMode = "";
    d.docked = false;
}

function cardsAbortDrag() {
    const d = cardsDrag;
    if (!d.card) return;
    const card = d.card;
    if (d.ghost) d.ghost.remove();
    if (d.target) d.target.classList.remove("drop-target");
    card.classList.remove("drag-origin");
    document.body.classList.remove("cards-dragging");
    cardsResetDragState();
}

function cardsPointerUp(ev) {
    const d = cardsDrag;
    if (!d.card || ev.pointerId !== d.pointerId) return;
    if (!d.active) {
        cardsResetDragState();
        return;
    }
    ev.preventDefault();
    cardsSuppressClickUntil = performance.now() + 450;
    const card = d.card;
    const target = d.target;
    const ghost = d.ghost;
    const ghostVisible = ghost ? getComputedStyle(ghost).transform : "none";
    const ghostTransform = ghostVisible && ghostVisible !== "none"
        ? ghostVisible
        : (d.transform || "translate(0px, 0px) rotate(0deg) scale(1.04)");
    const originRect = d.originRect;
    if (target) target.classList.remove("drop-target");
    document.body.classList.remove("cards-dragging");
    cardsResetDragState();

    if (target && target !== card && originRect) {
        cardsSwap(card, target, true);
        const newRect = card.getBoundingClientRect();
        if (ghost) {
            const dx = newRect.left - originRect.left;
            const dy = newRect.top - originRect.top;
            const anim = ghost.animate([
                { transform: ghostTransform, opacity: 0.98 },
                { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(1)`, opacity: 0 }
            ], {
                duration: 260,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)"
            });
            anim.onfinish = () => {
                ghost.remove();
                card.classList.remove("drag-origin");
            };
            anim.oncancel = anim.onfinish;
        } else {
            card.classList.remove("drag-origin");
        }
        Sound.click();
        return;
    }

    // Мимо цели — карта возвращается на своё место.
    if (ghost) {
        const anim = ghost.animate([
            { transform: ghostTransform, opacity: 0.98 },
            { transform: "translate(0px, 0px) rotate(0deg) scale(1)", opacity: 0.98 }
        ], {
            duration: 200,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        });
        anim.onfinish = () => {
            ghost.remove();
            card.classList.remove("drag-origin");
        };
        anim.oncancel = anim.onfinish;
    } else {
        card.classList.remove("drag-origin");
    }
}

function cardsPointerCancel(ev) {
    const d = cardsDrag;
    if (!d.card) return;
    if (ev.pointerId !== undefined && ev.pointerId !== d.pointerId) return;
    cardsAbortDrag();
}

// Клик/тап по карте: первая карта выделяется, вторая — меняется с ней местами.
function cardsTap(card) {
    if (performance.now() < cardsSuppressClickUntil) return;
    if (!card || card.disabled) return;
    const area = document.getElementById("cards-area");
    const grid = document.getElementById("cards-grid");
    if (!area || !grid || area.classList.contains("checked") || !grid.contains(card)) return;
    if (cardsSelected && cardsSelected !== card && cardsSelected.isConnected) {
        const first = cardsSelected;
        cardsClearSelection();
        cardsSwap(first, card, true);
        Sound.click();
        return;
    }
    if (card.classList.contains("selected")) {
        cardsClearSelection();
        Sound.click();
        return;
    }
    cardsClearSelection();
    card.classList.add("selected");
    cardsSelected = card;
    Sound.click();
}

function cardsReset() {
    const grid = document.getElementById("cards-grid");
    const area = document.getElementById("cards-area");
    if (!grid || !area) return;
    cardsAbortDrag();
    cardsClearSelection();
    area.classList.remove("checked");
    grid.querySelectorAll(".cards-word").forEach(k => {
        k.classList.remove("selected", "ok", "bad", "drop-target", "drag-origin");
        k.disabled = false;
        // Сброс — это новая раздача: убираем ручные правки анимации,
        // оставшиеся после drag/swap.
        k.style.removeProperty("animation");
        k.style.removeProperty("opacity");
    });
    const words = Array.from(grid.querySelectorAll(".cards-word"));
    shuffleArray(words).forEach(c => grid.appendChild(c));
    cardsLayout(true);
    const fb = document.getElementById("cards-feedback");
    fb.textContent = "";
    fb.className = "feedback";
    document.getElementById("cards-next").classList.add("hidden");
    const check = document.getElementById("cards-check");
    check.classList.remove("hidden");
    check.disabled = false;
    document.getElementById("cards-reset").disabled = false;
    Sound.click();
}

function checkCardsAnswer(forced) {
    const grid = document.getElementById("cards-grid");
    if (!grid) return;
    cardsAbortDrag();
    cardsClearSelection();
    // Порядок карт в сетке — это и есть собранное предложение.
    const cards = grid.querySelectorAll(".cards-word");
    const parts = [];
    cards.forEach(c => parts.push(c.dataset.token));
    if (!forced && parts.length !== CARDS.count) return;

    const answer = parts.join(" ");
    const word = state.gameWords[state.currentWordIndex];
    const fb = document.getElementById("cards-feedback");
    const isCorrect = !forced && sentenceMatches(answer, word, state.direction);

    state.roundTotal++;

    if (isCorrect) {
        Sound.correct();
        fb.innerHTML = "ВЕРНО ! " + iconHTML("✔");
        fb.className = "feedback correct";
        state.streak++;
        state.roundCorrect++;
        const fresh = learnWord(word);
        recordAnswer(true, fresh);
        comboAdd();
    } else {
        Sound.wrong();
        fb.textContent = "НЕВЕРНО ! Правильно: " + CARDS.target;
        fb.className = "feedback incorrect";
        state.streak = 0;
        markWrong(word);
        recordAnswer(false, false);
        comboReset();
        loseLife();
    }

    if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
    }

    grid.querySelectorAll(".cards-word").forEach(c => {
        c.classList.add(isCorrect ? "ok" : "bad");
        c.disabled = true;
        // Оставляем карты видимыми: после проверки они показывают ok/bad.
        c.style.animation = "none";
        c.style.opacity = "1";
    });
    document.getElementById("cards-reset").disabled = true;
    document.getElementById("cards-check").classList.add("hidden");
    document.getElementById("cards-next").classList.remove("hidden");
    document.getElementById("cards-area").classList.add("checked");

    // Отклик занимает место под полем — пересчитываем карты, чтобы они
    // не обрезались, если поле стало ниже.
    requestAnimationFrame(() => cardsLayout(true));

    saveData();

    if (state.lives <= 0) {
        stopSpeedTimer();
        setTimeout(() => { if (onGameScreen()) showGameOver(); }, 800);
    }
}

function updateHearts() {
    const hearts = document.querySelectorAll("#hearts .heart");
    hearts.forEach((heart, i) => {
        heart.classList.toggle("lost", !state.infiniteLives && i >= state.lives);
    });
}

function shakeHeart(index) {
    const hearts = document.querySelectorAll("#hearts .heart");
    const heart = hearts[index];
    if (heart) {
        heart.classList.add("breaking");
        setTimeout(() => heart.classList.remove("breaking"), 300);
    }
}
function buildGameOverHearts() {
    const container = document.getElementById("gameover-hearts");
    container.innerHTML = "";
    for (let i = 0; i < MAX_LIVES; i++) {
        const heart = document.createElement("span");
        heart.className = "heart";
        container.appendChild(heart);
    }
}

function showGameOver() {
    stopSpeedTimer();
    document.getElementById("go-correct").textContent = state.roundCorrect;
    document.getElementById("go-words").textContent = state.currentWordIndex + 1;
    state.inProgress = false;
    saveData();
    Sound.gameover();
    buildGameOverHearts();
    updatePreGameBtn();
    showScreen("gameover-screen");
}

function showResults() {
    stopSpeedTimer();
    const accuracy = state.roundTotal > 0 
        ? Math.round((state.roundCorrect / state.roundTotal) * 100) 
        : 0;
    if (state.playMode === "cards") questProgress("cards3", 1);
    if (state.roundTotal >= 5 && accuracy === 100) questProgress("perfect", 1);
    if (state.roundTotal >= 10 && accuracy > state.topAccuracy) {
        state.topAccuracy = accuracy;
    }
    
    document.getElementById("result-correct").textContent = state.roundCorrect;
    document.getElementById("result-total").textContent = state.roundTotal;
    document.getElementById("result-accuracy").textContent = accuracy + "%";
    
    state.inProgress = false;
    saveData();
    Sound.win();

    updatePreGameBtn();
    showScreen("result-screen");
}

function showDictionary() {
    // Поиск сбрасывается при каждом открытии словаря
    dictSearchQuery = "";
    const box = document.getElementById("dict-search");
    if (box) box.value = "";
    filterDictionary("all", null);
    showScreen("dictionary-screen");
    questProgress("dict1", 1);
}

// Текущий фильтр словаря — чтобы обновление списка не сбрасывало выбор игрока
let currentDictFilter = "all";
// Текущий поисковый запрос словаря (обновляется из onDictSearch)
let dictSearchQuery = "";

// Ввод в поиске словаря: перерисовываем список мгновенно (без каскадной анимации)
function onDictSearch() {
    const box = document.getElementById("dict-search");
    dictSearchQuery = box ? box.value.trim().toLowerCase() : "";
    filterDictionary(currentDictFilter, null, true);
}

function filterDictionary(filter, btn, instant) {
    currentDictFilter = filter;
    const list = document.getElementById("dictionary-list");
    list.innerHTML = "";

    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    // При программном вызове (btn === null) находим кнопку по data-filter
    const activeBtn = (btn && btn.classList)
        ? btn
        : document.querySelector('.filter-btn[data-filter="' + filter + '"]');
    if (activeBtn) activeBtn.classList.add("active");

    // Словарь ~2000 слов: Set вместо includes (был линейный поиск на каждое слово)
    const learnedSet = new Set(state.learnedWords);
    const favSet = new Set(state.favoriteWords);
    const own = USER_WORDS.slice().reverse().filter(w => (w.lang || "en") === tgtLang());
    const all = DICTIONARY.concat(own);
    const dictLang = state.direction === "ru-en" ? "ru" : langTTS();
    const ja = isJa();
    const ANIM_LIMIT = instant ? 0 : 12;
    const delayBase = instant ? 0 : (btn ? 0.06 : 0.62);
    let shown = 0;

    // Список строится порциями: ~2000 пунктов за один проход блокируют
    // главный поток телефона на секунды — тап «Назад» в это время не
    // обрабатывается, и кажется, что игра «виснет», пока всё дорисуется.
    // Первая порция рисуется сразу, дальше — по таймеру; новый поиск,
    // фильтр или уход с экрана отменяет незавершённые порции.
    const DICT_CHUNK = 200;
    const dictToken = ++dictBuildToken;
    let dictPos = 0;

    function buildDictChunk() {
        if (dictToken !== dictBuildToken) return;
        const from = dictPos;
        const to = Math.min(all.length, from + DICT_CHUNK);
        dictPos = to;
        const frag = document.createDocumentFragment();
        for (let di = from; di < to; di++) {
            const word = all[di];
            const isUser = !!word.user;
            const tw = tgt(word);
            const nw = nat(word);
            const isLearned = learnedSet.has(tw);
            const isFav = favSet.has(tw);

            if (filter === "learned" && !isLearned) continue;
            if (filter === "unlearned" && isLearned) continue;
            if (filter === "favorites" && !isFav) continue;

            // Поиск: слово, перевод, кана и ромадзи — регистр не важен
            if (dictSearchQuery) {
                const hay = (tw + "\n" + nw + "\n" + (word.kana || "") + "\n" + (word.romaji || "")).toLowerCase();
                if (hay.indexOf(dictSearchQuery) === -1) continue;
            }

            const item = document.createElement("div");
            // Появление каскадом, как у кнопок главного меню: шаг 0.1s.
            // Анимируем только первые ANIM_LIMIT, остальные сразу видны.
            const animate = shown < ANIM_LIMIT;
            item.className = `dict-item ${isLearned ? "learned" : "unlearned"}${isUser ? " is-user" : ""}${ja ? " dict-cjk" : ""}` + (animate ? "" : " dict-plain");
            if (animate) item.style.animationDelay = (delayBase + shown * 0.1).toFixed(2) + "s";
            shown++;

            const dictText = dictLang === "ru"
                ? nw
                : (ja ? (word.kana || tw) : tw);
            item.appendChild(makeSpeakBtn(dictText, dictLang));

            const favBtn = document.createElement("button");
            favBtn.type = "button";
            favBtn.className = "fav-btn dict-fav" + (isFav ? " is-fav" : "");
            favBtn.textContent = "";
            favBtn.setAttribute("aria-label", "В избранное");
            favBtn.addEventListener("click", () => {
                Sound.click();
                toggleFav(tw);
                filterDictionary(filter, activeBtn);
            });
            item.appendChild(favBtn);

            if (isUser) {
                const delBtn = document.createElement("button");
                delBtn.type = "button";
                delBtn.className = "fav-btn dict-del";
                delBtn.innerHTML = iconHTML("🗑");
                delBtn.setAttribute("aria-label", "Удалить слово");
                delBtn.addEventListener("click", () => {
                    Sound.click();
                    removeUserWord(tw);
                });
                item.appendChild(delBtn);
            }

            const front = document.createElement("div");
            front.className = "dict-front";
            const enSpan = document.createElement("span");
            enSpan.className = "dict-word";
            enSpan.textContent = tw;
            if (ja && word.kana) {
                const kanaSpan = document.createElement("span");
                kanaSpan.className = "dict-kana";
                kanaSpan.textContent = word.kana;
                front.appendChild(enSpan);
                front.appendChild(kanaSpan);
                if (word.romaji) {
                    const romajiSpan = document.createElement("span");
                    romajiSpan.className = "dict-tr";
                    romajiSpan.textContent = word.romaji;
                    front.appendChild(romajiSpan);
                }
            } else {
                front.appendChild(enSpan);
                if (word.tr) {
                    const trSpan = document.createElement("span");
                    trSpan.className = "dict-tr";
                    trSpan.textContent = word.tr;
                    front.appendChild(trSpan);
                }
            }
            const ruSpan = document.createElement("span");
            ruSpan.className = "dict-translation";
            ruSpan.textContent = nw;
            front.appendChild(ruSpan);
            item.appendChild(front);

            const status = document.createElement("span");
            status.className = "dict-status";
            status.textContent = isLearned ? "♥" : "○";
            item.appendChild(status);

            frag.appendChild(item);
        }
        list.appendChild(frag);
        if (to >= all.length) {
            if (!shown) {
                const empty = document.createElement("div");
                empty.className = "dict-empty";
                empty.textContent = "Ничего не найдено";
                list.appendChild(empty);
            }
            return;
        }
        setTimeout(buildDictChunk, 0);
    }
    buildDictChunk();
}

/* ===== Выбор значения в настройках через модалку =====
   Нативный <select> остаётся в DOM и хранит значение — вся существующая логика
   (.value, onchange) работает без изменений, но сам он скрыт (.fs-native).
   Строка показывает значение кнопкой на арте UI/Vipad_osnova.webp; по тапу
   открывается модалка на арте UI/Vipad_spisok.webp. */
const FANCY_SEL = [];
let FS_MODAL = null;

function fsCloseModal() {
    if (!FS_MODAL) return;
    const box = FS_MODAL;
    FS_MODAL = null;
    box.classList.add("is-closing");
    document.body.classList.remove("modal-open");
    setTimeout(() => { if (box.parentNode) box.parentNode.removeChild(box); }, 140);
}

function fsOpenModal(sel, titleText) {
    fsCloseModal();

    const box = document.createElement("div");
    box.className = "fs-modal";
    box.innerHTML =
        '<div class="fs-modal-bg"></div>' +
        '<div class="fs-modal-box" role="dialog" aria-modal="true">' +
        '<div class="fs-modal-title"></div>' +
        '<div class="fs-modal-list"></div>' +
        '<button type="button" class="fs-modal-cancel">Отмена</button>' +
        '</div>';
    box.querySelector(".fs-modal-title").textContent = titleText || "";
    const list = box.querySelector(".fs-modal-list");

    Array.from(sel.options).forEach((opt) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "fs-opt" + (opt.value === sel.value ? " is-sel" : "");
        b.textContent = opt.textContent;
        b.addEventListener("click", () => {
            sel.value = opt.value;
            if (typeof refreshFancySelects === "function") refreshFancySelects();
            fsCloseModal();
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            if (typeof Sound !== "undefined" && Sound.click) Sound.click();
        });
        list.appendChild(b);
    });

    box.querySelector(".fs-modal-bg").addEventListener("click", fsCloseModal);
    box.querySelector(".fs-modal-cancel").addEventListener("click", () => {
        if (typeof Sound !== "undefined" && Sound.click) Sound.click();
        fsCloseModal();
    });

    document.body.appendChild(box);
    document.body.classList.add("modal-open");
    FS_MODAL = box;
}

function initFancySelect(sel) {
    if (!sel || sel.dataset.fancy) return;
    sel.dataset.fancy = "1";
    sel.classList.add("fs-native");

    const wrap = document.createElement("div");
    wrap.className = "fs";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fs-btn";
    btn.setAttribute("aria-haspopup", "dialog");
    wrap.appendChild(btn);
    sel.parentNode.insertBefore(wrap, sel.nextSibling);

    /* Заголовок модалки: data-fs-title, иначе — подпись строки настроек */
    let titleText = sel.dataset.fsTitle || "";
    const lab = sel.closest(".setting-item") ? sel.closest(".setting-item").querySelector("label") : null;
    if (!titleText && lab) titleText = lab.textContent.trim();

    const api = { sel: sel, wrap: wrap, btn: btn, sync: sync };
    FANCY_SEL.push(api);

    function sync() {
        const cur = sel.selectedOptions && sel.selectedOptions[0];
        btn.textContent = cur ? cur.textContent : "";
        btn.title = btn.textContent;
    }

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        sync();
        fsOpenModal(sel, titleText);
    });

    sync();
}

function initFancySelects() {
    ["direction-select", "mode-select", "rounds-select", "uw-lvl", "uw-pos"].forEach((id) => {
        initFancySelect(document.getElementById(id));
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && FS_MODAL) fsCloseModal();
    });
    /* Навигация «назад» в WebView тоже закрывает модалку, а не весь экран */
    window.addEventListener("popstate", () => { if (FS_MODAL) fsCloseModal(); });
}

function refreshFancySelects() {
    FANCY_SEL.forEach((a) => a.sync());
}

function showSettings() {
    document.getElementById("direction-select").value = state.direction;
    const dirSel = document.getElementById("direction-select");
    if (isJa()) {
        dirSel.options[0].textContent = "Яп → Рус";
        dirSel.options[1].textContent = "Рус → Яп";
    } else {
        dirSel.options[0].textContent = "Англ → Рус";
        dirSel.options[1].textContent = "Рус → Англ";
    }
    document.getElementById("mode-select").value = state.mode;
    const rounds = document.getElementById("rounds-select");
    if (rounds) rounds.value = String(state.roundWords);
    const inf = document.getElementById("infinite-toggle");
    if (inf) inf.checked = !!state.infiniteLives;
    const tts = document.getElementById("tts-toggle");
    if (tts) tts.checked = state.ttsEnabled !== false;
    const warn = document.getElementById("tts-warn");
    if (warn) warn.classList.toggle("hidden", !tts || tts.checked);
    const auto = document.getElementById("tts-auto");
    if (auto) auto.checked = !!state.ttsAuto;
    const mac = document.getElementById("mic-auto-check");
    if (mac) mac.checked = state.micAutoCheck !== false;
    const speed = document.getElementById("speed-toggle");
    if (speed) {
        speed.checked = !!state.speedMode;
        if (isFeatureUnlocked("speed")) {
            speed.disabled = false;
            speed.closest(".setting-item").classList.remove("locked");
        } else {
            speed.disabled = true;
            const row = speed.closest(".setting-item");
            if (row) {
                row.classList.add("locked");
                row.setAttribute("title", featureNeed("speed") || "Раскроется позже");
            }
        }
    }
    refreshFancySelects();
    showScreen("settings-screen");
}

function saveDirection() {
    state.direction = document.getElementById("direction-select").value;
    saveData();
}

function saveMode() {
    state.mode = document.getElementById("mode-select").value;
    saveData();
}

function saveRounds() {
    const r = parseInt(document.getElementById("rounds-select").value, 10);
    state.roundWords = isNaN(r) ? 10 : r;
    saveData();
}

function saveToggles() {
    const inf = document.getElementById("infinite-toggle");
    if (inf) state.infiniteLives = inf.checked;
    const tts = document.getElementById("tts-toggle");
    if (tts) state.ttsEnabled = tts.checked;
    if (state.ttsEnabled === false) { TTS.stop(); VOICE.stop(); }
    const warn = document.getElementById("tts-warn");
    if (warn) warn.classList.toggle("hidden", state.ttsEnabled !== false);
    const auto = document.getElementById("tts-auto");
    if (auto) state.ttsAuto = auto.checked;
    const mac = document.getElementById("mic-auto-check");
    if (mac) state.micAutoCheck = mac.checked;
    const speed = document.getElementById("speed-toggle");
    if (speed) state.speedMode = speed.checked;
    if (!state.speedMode) {
        state.combo = 0;
        stopSpeedTimer();
    }
    updateSpeedStrip();
    saveData();
}

function testSound() {
    const lines = [];
    const fmt = () => {
        const hr = "════════════════════════════════════";
        return "🎧 Диагностика звука (" + new Date().toLocaleString() + ")\n" +
            hr + "\n" +
            lines.join("\n") + "\n" +
            hr + "\nПришлите этот текст — по нему видно, что не так с озвучкой.";
    };
    const ov = document.createElement("div");
    ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:9999;";
    const box = document.createElement("div");
    box.style.cssText = "background:#2a2233;color:#eee;border:3px solid #7a5a6a;border-radius:12px;padding:16px;width:92%;max-width:680px;max-height:85vh;display:flex;flex-direction:column;gap:10px;font-family:Consolas,monospace;";
    const title = document.createElement("div");
    title.textContent = "Диагностика звука";
    title.style.cssText = "font-size:16px;font-weight:bold;text-align:center;color:#ffd1dc;";
    const ta = document.createElement("textarea");
    ta.readOnly = true;
    ta.style.cssText = "flex:1;min-height:260px;resize:none;background:#171221;color:#e8e6f0;border:1px solid #7a5a6a;border-radius:8px;padding:10px;font-family:Consolas,monospace;font-size:12px;line-height:1.55;";
    const hint = document.createElement("div");
    hint.style.cssText = "font-size:12px;color:#d9bfc8;text-align:center;";
    hint.textContent = "Жмите «Копировать» или Ctrl+C и пришлите текст. Важно: услышали ли вы РЕЧЬ и/или ТОН ?";
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:8px;justify-content:center;flex-wrap:wrap;";
    const btnStyle = "padding:10px 16px;border:none;border-radius:8px;background:#ff9aa2;color:#2a2233;font-weight:bold;cursor:pointer;font-family:Consolas,monospace;";
    const btnCopy = document.createElement("button");
    btnCopy.type = "button";
    btnCopy.innerHTML = iconHTML("📋") + " Копировать";
    btnCopy.style.cssText = btnStyle;
    const btnClose = document.createElement("button");
    btnClose.type = "button";
    btnClose.textContent = "Закрыть";
    btnClose.style.cssText = btnStyle + "background:#7a5a6a;color:#fff;";
    const btnTone = document.createElement("button");
    btnTone.type = "button";
    btnTone.innerHTML = iconHTML("🔔") + " Тон 440 Гц";
    btnTone.style.cssText = btnStyle + "background:#b5e48c;color:#223;";
    row.appendChild(btnCopy);
    row.appendChild(btnTone);
    row.appendChild(btnClose);
    box.appendChild(title);
    box.appendChild(ta);
    box.appendChild(hint);
    box.appendChild(row);
    const extra = document.createElement("div");
    extra.style.cssText = "text-align:center;";
    const btnEnable = document.createElement("button");
    btnEnable.type = "button";
    btnEnable.innerHTML = iconHTML("🔊") + " Включить озвучку и повторить тест";
    btnEnable.style.cssText = btnStyle + "background:#fbbf24;color:#221;";
    extra.appendChild(btnEnable);
    if (state.ttsEnabled !== false) btnEnable.style.display = "none";
    box.appendChild(extra);
    ov.appendChild(box);
    document.body.appendChild(ov);

    let res = { start: false, end: false, errors: [] };
    let tm = null;
    let vPoll = null;
    let testRun = 0;
    let vmCountKnown = -1;
    const refresh = () => {
        try {
            ta.value = fmt();
            ta.focus();
            ta.select();
        } catch (e) {}
    };
    const collectVoices = () => {
        const synth = window.speechSynthesis;
        const vs = (synth && synth.getVoices) ? (synth.getVoices() || []) : [];
        return {
            count: vs.length,
            ru: vs.filter(v => (v.lang || "").toLowerCase().indexOf("ru") === 0).map(v => v.name).slice(0, 3),
            en: vs.filter(v => (v.lang || "").toLowerCase().indexOf("en") === 0).map(v => v.name).slice(0, 3),
            ja: vs.filter(v => (v.lang || "").toLowerCase().indexOf("ja") === 0).map(v => v.name).slice(0, 3)
        };
    };
    const done = () => {
        clearTimeout(tm);
        const vm = collectVoices();
        lines.push("Тест " + testRun + ": start=" + (res.start ? "да" : "нет") + " end=" + (res.end ? "да" : "нет") + (res.errors.length ? " ОШИБКИ: " + res.errors.join(", ") : " ошибок нет"));
        if (res.errors.length) {
            lines.push("➜ Озвучка прервана ошибкой: " + res.errors.join(", "));
        } else if (vm.count === 0) {
            lines.push("➜ События «прошли», но голосов в системе 0 — фразу практически наверняка НЕ слышно.");
        } else if (res.start && res.end) {
            lines.push("➜ Если фразу вы сейчас услышали — озвучка в браузере рабочая.");
        }
        refresh();
    };
    const selectCopy = () => {
        try {
            ta.focus();
            ta.select();
            document.execCommand("copy");
            btnCopy.innerHTML = "Скопировано " + iconHTML("✓");
        } catch (e) {
            btnCopy.textContent = "Выделите текст и нажмите Ctrl+C";
        }
    };
    btnCopy.addEventListener("click", () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(fmt()).then(
                    () => { btnCopy.innerHTML = "Скопировано " + iconHTML("✓"); },
                    () => { selectCopy(); }
                );
            } else selectCopy();
        } catch (e) { selectCopy(); }
    });
    btnClose.addEventListener("click", () => {
        clearInterval(vPoll);
        clearTimeout(tm);
        ov.remove();
    });
    btnEnable.addEventListener("click", () => {
        state.ttsEnabled = true;
        const ccb = document.getElementById("tts-toggle");
        if (ccb) ccb.checked = true;
        saveData();
        const warn = document.getElementById("tts-warn");
        if (warn) warn.classList.add("hidden");
        lines[1] = "Озвучка (TTS): вкл (включена только что)";
        btnEnable.style.display = "none";
        runDirect();
    });

    const playTone = (note) => {
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) {
                lines.push("Web Audio: нет AudioContext — отдельно проверьте системный звук.");
                refresh();
                return;
            }
            const ctx = new AC();
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = 440;
            g.gain.value = 0.5;
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
            const rp = ctx.resume ? ctx.resume() : null;
            lines.push("Web Audio тон: отправлен (" + note + ")");
            refresh();
        } catch (e) {
            lines.push("Web Audio тон: ОШИБКА при запуске: " + String(e));
            refresh();
        }
    };
    btnTone.addEventListener("click", () => playTone("повтор"));

    lines.push("Протокол: " + location.protocol);
    lines.push("Озвучка (TTS): " + (state.ttsEnabled !== false ? "вкл" : "ВЫКЛ"));
    lines.push("Авто-чтение: " + (state.ttsAuto ? "вкл" : "выкл"));
    lines.push("Карточки-аудио: " + (state.cardsAudio ? "вкл" : "выкл"));
    const hasSynth = !!window.speechSynthesis;
    const hasUtterance = !!window.SpeechSynthesisUtterance;
    lines.push("Поддержка браузером: speechSynthesis=" + (hasSynth ? "есть" : "НЕТ") + " / Utterance=" + (hasUtterance ? "есть" : "НЕТ"));
    if (hasSynth && hasUtterance) {
        const vm = collectVoices();
        vmCountKnown = vm.count;
        lines.push("Голосов на момент открытия: " + vm.count + (vm.count ? " (" + (vm.ru.length ? "RU: " + vm.ru.join(", ") + "; " : "") + (vm.en.length ? "EN: " + vm.en.join(", ") + "; " : "") + (vm.ja.length ? "JA: " + vm.ja.join(", ") : "") + ")" : " — голоса Windows ещё не загрузились, ждём до 4 с"));
    }
    if (state.ttsEnabled === false) {
        lines.push("➜ Озвучка выключена — включите её кнопкой ниже или в настройках.");
    }
    refresh();
    runDirect();
    playTone("сразу после теста речи");

    vPoll = setInterval(() => {
        const vm = collectVoices();
        if (vm.count > vmCountKnown) {
            vmCountKnown = vm.count;
            lines.push("Голоса загрузились позже: " + vm.count + " (" + (vm.ru.length ? "RU: " + vm.ru.join(", ") + "; " : "") + (vm.en.length ? "EN: " + vm.en.join(", ") + "; " : "") + (vm.ja.length ? "JA: " + vm.ja.join(", ") : "") + ")");
            refresh();
            runDirect();
        }
    }, 400);
    setTimeout(() => {
        clearInterval(vPoll);
        if (hasSynth && hasUtterance && vmCountKnown === 0) {
            lines.push("➜ За 4 с голоса так и не пришли: в Windows их, похоже, действительно нет. Откройте: Параметры → Приложения → Дополнительные компоненты → введите «голоса» → добавьте английский и русский голоса.");
        }
        refresh();
    }, 4000);

    function runDirect() {
        clearTimeout(tm);
        testRun++;
        const n = testRun;
        res = { start: false, end: false, errors: [] };
        try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance("One two three ! Проверка звука " + n + ".");
            const vs = window.speechSynthesis.getVoices() || [];
            const enVoice = vs.find(v => (v.lang || "").toLowerCase().indexOf("en-") === 0);
            if (enVoice) u.voice = enVoice;
            u.lang = enVoice ? enVoice.lang : "en-US";
            u.rate = 1;
            u.pitch = 1;
            u.volume = 1;
            u.onstart = () => { res.start = true; };
            u.onend = () => { if (n === testRun) { res.end = true; done(); } };
            u.onerror = (e) => { res.errors.push(String(e && e.error ? e.error : "?")); if (n === testRun) done(); };
            window.speechSynthesis.speak(u);
            tm = setTimeout(() => { if (n === testRun) done(); }, 4000);
        } catch (e) {
            lines.push("Исключение при тесте " + n + ": " + String(e));
            refresh();
        }
    }
}

function applyTheme(id) {
    // Только PLUSH: остальные темы отключены
    id = "plush";
    state.theme = id;
    document.body.dataset.theme = state.theme;
    saveData();
}

const REWARD_ICONS = { theme: "🎨", back: "🃏", wordbg: "🎨" };
const REWARD_TYPES = { theme: "Тема", back: "Рубашка", wordbg: "Фон" };

function renderProgress() {
    initDaily();
    const badge = document.getElementById("level-badge");
    const xpEl = document.getElementById("level-xp");
    const fill = document.getElementById("level-bar-fill");
    const nextEl = document.getElementById("level-next");

    if (state.level >= 20) {
        if (badge) badge.textContent = "Уровень 20";
        if (xpEl) xpEl.textContent = "Максимальный уровень !";
        if (fill) fill.style.width = "100%";
        if (nextEl) nextEl.textContent = "Все награды открыты";
    } else {
        const have = xpProgress();
        const need = xpRange();
        if (badge) badge.textContent = "Уровень " + state.level;
        if (xpEl) xpEl.textContent = state.xp + " / " + xpForNext() + " XP";
        if (fill) fill.style.width = (need > 0 ? Math.min(100, Math.round((have / need) * 100)) : 0) + "%";
        if (nextEl) nextEl.textContent = "До " + (state.level + 1) + " уровня: " + Math.max(0, xpForNext() - state.xp) + " XP";
    }

    renderRewardGrid();
    renderDailyList();
    renderAchievements();
}

function renderRewardGrid() {
    const grid = document.getElementById("reward-grid");
    if (!grid) return;
    grid.innerHTML = "";
    LEVEL_REWARDS.forEach(r => {
        const unlocked = state.level >= r.level;
        const btn = document.createElement("div");
        btn.className = "reward-item" + (unlocked ? " unlocked" : " locked");
        btn.innerHTML = `
            <span class="reward-icon">${unlocked ? iconHTML(REWARD_ICONS[r.type]) : '<img class="lock-ic" src="UI/Zamok.webp" alt="">'}</span>
            <span class="reward-meta">
                <span class="reward-name">${unlocked ? r.name : "Уровень " + r.level}</span>
                <span class="reward-type">${REWARD_TYPES[r.type]} · lvl ${r.level}</span>
            </span>
        `;
        grid.appendChild(btn);
    });
}

function renderDailyList() {
    initDaily();
    const list = document.getElementById("daily-list");
    if (!list) return;
    list.innerHTML = "";
    DAILY_QUESTS.forEach(q => {
        const done = state.daily.done.includes(q.id);
        const prog = state.daily.prog[q.id] || 0;
        const pct = Math.min(100, Math.round((prog / q.target) * 100));
        const item = document.createElement("div");
        item.className = "daily-item" + (done ? " done" : "");
        item.innerHTML = `
            <span class="daily-icon">${done ? '<img class="daily-done" src="UI/Kvadrat_pod_galku_2.webp" alt="">' : iconHTML(q.icon)}</span>
            <span class="daily-meta">
                <span class="daily-name">${q.name}</span>
                ${done ? "" : `<span class="daily-xp">+${DAILY_XP} XP</span>`}
                <span class="daily-desc">${q.desc}</span>
                <div class="daily-bar"><div class="daily-bar-fill" style="width:${pct}%"></div></div>
                <span class="daily-prog">${done ? "Выполнено" : prog + " / " + q.target}</span>
            </span>
        `;
        list.appendChild(item);
    });

    const bonus = document.getElementById("daily-bonus");
    if (bonus) {
        const allDone = state.daily.done.length === DAILY_QUESTS.length;
        bonus.innerHTML = allDone
            ? '<div class="daily-bonus-box done">' + iconHTML("🏆") + ' Все дейлики выполнены ! Бонус +' + DAILY_BONUS_XP + ' XP получен</div>'
            : '<div class="daily-bonus-box">' + iconHTML("🏆") + ' Выполни все дейлики сегодня: бонус +' + DAILY_BONUS_XP + ' XP</div>';
    }
}

/* Переключение вкладок внутри «Прогресса»: дейлики / достижения */
function switchProgressTab(name) {
    const daily = document.getElementById("progress-tab-daily");
    const ach = document.getElementById("progress-tab-ach");
    if (daily) daily.classList.toggle("hidden", name !== "daily");
    if (ach) ach.classList.toggle("hidden", name !== "ach");
    document.querySelectorAll(".progress-tab").forEach(b => {
        b.classList.toggle("is-active", b.textContent.indexOf(name === "ach" ? "Достижения" : "Дейлики") === 0);
    });
    if (typeof Sound !== "undefined" && Sound.click) Sound.click();
}

function showProgress() {
    renderProgress();
    switchProgressTab("daily");
    showScreen("progress-screen");
}

function resetProgress() {
    if (confirm("Сбросить весь прогресс ? Слова будут считаться невыученными.")) {
        state.learnedWords = [];
        state.streak = 0;
        state.bestStreak = 0;
        state.wrongWords = [];
        state.history = {};
        state.topAccuracy = 0;
        state.currentWordIndex = 0;
        saveData();
        showMainMenu();
    }
}

async function resetAll() {
    if (!confirm("Удалить все данные ? Это действие необратимо.")) return;
    // Свои слова хранятся отдельно — спросим, стирать ли и их
    let wipeUserWords = false;
    if (USER_WORDS.length > 0) {
        wipeUserWords = confirm(
            "Также удалить ваши слова из раздела «Мои слова» ?\n" +
            "Их сейчас: " + USER_WORDS.length + ".\n\n" +
            "«ОК» — удалить всё, «Отмена» — оставить слова."
        );
    }
    try { await CloudSync.wipe(); } catch (e) {} // чистим облако, чтобы прогресс не «воскрес» на других устройствах
    localStorage.removeItem("dictionaryGameState");
    if (wipeUserWords) {
        try { localStorage.removeItem(USER_WORDS_LS); } catch (e) {}
        if (userWordsOnline()) {
            // Серверного массового удаления нет — стираем по одному
            for (const w of USER_WORDS) {
                try {
                    await requestUserWords("DELETE", null, "?en=" + encodeURIComponent(w.en));
                } catch (e) {}
            }
        }
    }
    location.reload();
}

function backToMenu() {
    // Останавливаем порции словаря СРАЗУ, не дожидаясь смены экрана:
    // на телефоне дорисовка ~2000 пунктов висит в главном потоке.
    dictBuildToken++;
    // Выход из игры/экранов: скорость и запись микрофона не должны жить в фоне
    MIC.stop();
    stopSpeedTimer();
    showMainMenu();
    // Освобождаем DOM словаря уже после того, как меню нарисовано:
    // синхронная очистка тысяч узлов в момент тапа тоже даёт фриз.
    setTimeout(() => {
        try {
            const list = document.getElementById("dictionary-list");
            if (list && currentScreen !== "dictionary-screen") list.innerHTML = "";
        } catch (e) {}
    }, 0);
}

// Экран, с которого начался раунд (для кнопки «← К выбору» на экране результатов)
let preGameScreen = "main-menu";

function backToPreGame() {
    if (preGameScreen === "level-screen") showLevelScreen();
    else if (preGameScreen === "category-screen") showCategoryScreen();
    else backToMenu();
}

function updatePreGameBtn() {
    const label = preGameScreen === "level-screen"
        ? iconHTML("←") + " К выбору уровня"
        : preGameScreen === "category-screen"
            ? iconHTML("←") + " К выбору категории"
            : iconHTML("←") + " Главное меню";
    const res = document.getElementById("res-pregame");
    const go = document.getElementById("go-pregame");
    if (res) res.innerHTML = label;
    if (go) go.innerHTML = label;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function todayKeyAt(date) {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + mm + "-" + dd;
}

function todayKey() {
    return todayKeyAt(new Date());
}

function recordAnswer(isCorrect, learned) {
    const key = todayKey();
    const h = state.history[key] || { learned: 0, correct: 0, total: 0 };
    h.total++;
    if (isCorrect) h.correct++;
    if (learned) h.learned++;
    state.history[key] = h;
    if (isCorrect) questProgress("warmup", 1);
    if (state.speedMode && isCorrect) questProgress("speedrun", Math.round(10 * (1 + 0.1 * Math.max(0, state.combo - 1))));
    if (state.streak === 10) questProgress("streak10", 10);
    if (learned) questProgress("learn3", 1);
}

function learnWord(word) {
    if (!word) return false;
    const fresh = !state.learnedWords.includes(tgt(word));
    state.wrongWords = state.wrongWords.filter(w => w !== tgt(word));
    if (fresh) state.learnedWords.push(tgt(word));
    if (fresh) refreshFeatureUnlocks(false);
    return fresh;
}

function markWrong(word) {
    if (!word) return;
    if (!state.wrongWords.includes(tgt(word))) state.wrongWords.push(tgt(word));
}

// === Миграция ключей прогресса: в данные добавлен пробел перед «!»/«?» ===
// В старых сохранениях learnedWords/wrongWords/favoriteWords тексты лежали в
// старом виде («Where do you live?»), теперь в данных «Where do you live ?».
// Пересобираем значения по нормализованному ключу; точки сравнения
// (includes/has) не трогаем — после миграции они снова совпадают.
function txtKey(t) {
    return String(t).replace(/\s+([!?])/g, "$1");
}

function migrateProgressKeys() {
    try {
        const corpus = new Map();
        const add = (w) => {
            const t = tgt(w);
            if (t) {
                const k = txtKey(t);
                if (!corpus.has(k)) corpus.set(k, t);
            }
        };
        DICTIONARY.forEach(add);
        SENTENCES.forEach(add);
        if (!corpus.size) return;
        let changed = false;
        const remap = (arr) => (Array.isArray(arr) ? arr : []).map(t => {
            const fresh = corpus.get(txtKey(t));
            if (fresh !== undefined && fresh !== t) changed = true;
            return (fresh !== undefined) ? fresh : t;
        });
        state.learnedWords = remap(state.learnedWords);
        state.wrongWords = remap(state.wrongWords);
        state.favoriteWords = remap(state.favoriteWords);
        if (state.cheatSnapshot && Array.isArray(state.cheatSnapshot.learnedWords)) {
            state.cheatSnapshot.learnedWords = remap(state.cheatSnapshot.learnedWords);
        }
        if (changed) saveData();
    } catch (e) {}
}

function loseLife() {
    if (state.infiniteLives) return false;
    state.lives--;
    updateHearts();
    shakeHeart(state.lives);
    return state.lives <= 0;
}

function comboAdd() {
    if (!state.speedMode) return;
    state.combo++;
    if (state.combo > state.bestCombo) state.bestCombo = state.combo;
    state.score += Math.round(10 * (1 + 0.1 * (state.combo - 1)));
    updateSpeedStrip();
}

function comboReset() {
    if (!state.speedMode) return;
    state.combo = 0;
    updateSpeedStrip();
}

function updateSpeedStrip() {
    const strip = document.getElementById("speed-strip");
    const scoreEl = document.getElementById("speed-score");
    const comboEl = document.getElementById("speed-combo");
    if (!strip) return;
    if (!state.speedMode) {
        strip.classList.add("hidden");
        return;
    }
    strip.classList.remove("hidden");
    if (scoreEl) scoreEl.textContent = state.score;
    if (comboEl) comboEl.textContent = "×" + (state.combo + 1);
}

let speedTimer = null;

function stopSpeedTimer() {
    if (speedTimer) {
        clearInterval(speedTimer);
        speedTimer = null;
    }
}

function startSpeedTimer(ms, onTimeout) {
    stopSpeedTimer();
    if (!state.speedMode) return;
    const bar = document.getElementById("speed-bar");
    const total = Math.max(1000, ms);
    const start = Date.now();
    if (bar) bar.style.width = "100%";
    speedTimer = setInterval(() => {
        const left = Math.max(0, 1 - (Date.now() - start) / total);
        if (bar) bar.style.width = Math.round(left * 100) + "%";
        if (Date.now() - start >= total) {
            stopSpeedTimer();
            if (onTimeout) onTimeout();
        }
    }, 100);
}

const SPEED_TIMEOUT = { input: 15000, quiz: 10000, cards: 25000, listening: 25000 };

function startSpeedTimerForMode() {
    if (!state.speedMode) return;
    const t = SPEED_TIMEOUT[state.playMode];
    if (!t) return;
    startSpeedTimer(t, speedTimeoutHandler);
}

function speedTimeoutHandler() {
    if (!state.inProgress || state.currentWordIndex >= state.gameWords.length) return;
    if (state.lives <= 0) return;
    if (!onGameScreen()) return;
    if (state.playMode === "quiz") {
        if (state.selectedAnswer) return;
        const word = state.gameWords[state.currentWordIndex];
        const correct = isTargetToNative() ? nat(word) : tgt(word);
        evaluateQuizAnswer("⏱ Время вышло !", correct, true);
    } else if (state.playMode === "input" || state.playMode === "listening") {
        const btn = document.getElementById("check-btn");
        if (!btn || btn.classList.contains("hidden")) return;
        checkAnswer(true);
    } else if (state.playMode === "cards") {
        const btn = document.getElementById("cards-check");
        if (!btn || btn.classList.contains("hidden")) return;
        checkCardsAnswer(true);
    }
}

const TTS = (() => {
    let lastSpeech = null;
    let resumeRadioAfter = false;
    let voicePending = null;
    let speakSeq = 0;

    function supported() {
        return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
    }

    function pickVoice(lang) {
        if (!window.speechSynthesis) return null;
        const voices = window.speechSynthesis.getVoices() || [];
        const want = lang === "ru" ? "ru" : lang === "ja" ? "ja" : "en";
        const exact = voices.find(v => (v.lang || "").toLowerCase().indexOf(want + "-") === 0);
        if (exact) return exact;
        const any = voices.find(v => (v.lang || "").toLowerCase().indexOf(want) === 0);
        return any || null;
    }

    function hasVoices() {
        return !!(window.speechSynthesis && window.speechSynthesis.getVoices && (window.speechSynthesis.getVoices() || []).length);
    }

    function doSpeak(text, lang, force) {
        if (!supported() || !text) return false;
        const synth = window.speechSynthesis;
        try { synth.cancel(); } catch (e) {}
        const u = new SpeechSynthesisUtterance(String(text));
        const v = pickVoice(lang);
        if (v) u.voice = v;
        u.lang = v ? v.lang : (lang === "ru" ? "ru-RU" : lang === "ja" ? "ja-JP" : "en-US");
        u.rate = 0.92;
        u.pitch = 1;
        u.volume = 1;
        if (radioPlaying) {
            resumeRadioAfter = true;
            pauseRadio();
        }
        const done = () => {
            if (lastSpeech === String(text)) lastSpeech = null;
            if (resumeRadioAfter) {
                resumeRadioAfter = false;
                playRadio();
            }
        };
        u.onend = done;
        u.onerror = done;
        lastSpeech = String(text);
        try { synth.speak(u); } catch (e) { lastSpeech = null; return false; }
        return true;
    }

    function onVoicesReady() {
        const p = voicePending;
        if (!p || Date.now() > p.expiry || p.seq !== speakSeq) { voicePending = null; return; }
        if (!pickVoice(p.lang)) return;
        voicePending = null;
        if (lastSpeech !== null && lastSpeech === p.text) {
            doSpeak(p.text, p.lang, false);
        }
    }

    function warmVoices() {
        if (!window.speechSynthesis) return;
        try { window.speechSynthesis.getVoices(); } catch (e) {}
        const synth = window.speechSynthesis;
        if (synth.addEventListener) {
            synth.removeEventListener("voiceschanged", onVoicesReady);
            synth.addEventListener("voiceschanged", onVoicesReady);
        } else {
            synth.onvoiceschanged = onVoicesReady;
        }
    }

    function speak(text, lang, force) {
        if (!supported() || !text) return false;
        const ok = doSpeak(text, lang, force);
        speakSeq++;
        if (!pickVoice(lang)) {
            voicePending = { text: String(text), lang: lang, seq: speakSeq, expiry: Date.now() + 2500 };
        }
        return ok;
    }

    function stop() {
        lastSpeech = null;
        voicePending = null;
        if (window.speechSynthesis) {
            try { window.speechSynthesis.cancel(); } catch (e) {}
        }
        if (resumeRadioAfter) {
            resumeRadioAfter = false;
            playRadio();
        }
    }

    warmVoices();
    return { supported: supported, speak: speak, stop: stop, hasVoices: hasVoices, warmVoices: warmVoices };
})();

// ===== Банк озвучки OmniVoice: готовые WAV из папки voice/, иначе браузерный TTS =====
function voiceKey(lang) { return lang === "ru" ? "ru" : lang === "ja" ? "ja" : "en"; }

const VOICE = (() => {
    let manifest = null;
    let loadStarted = false;
    let current = null;
    let resumeRadioAfter = false;
    let voicePending = null;
    let voiceSeq = 0;

    function loadManifest() {
        if (loadStarted) return;
        loadStarted = true;
        // Через <script>: работает и при запуске с file:// (двойной клик по index.html),
        // где fetch локальных файлов запрещён. voice/manifest.js пишется генератором.
        const sc = document.createElement("script");
        sc.src = "voice/manifest.js?v=20261805";
        sc.onload = () => {
            manifest = (window.NZ_VOICE_MANIFEST && typeof window.NZ_VOICE_MANIFEST === "object") ? window.NZ_VOICE_MANIFEST : {};
        };
        sc.onerror = () => {
            // Резерв для http-запуска
            if (typeof fetch === "function") {
                fetch("voice/manifest.json", { cache: "no-store" })
                    .then(r => (r.ok ? r.json() : {}))
                    .then(m => { manifest = (m && typeof m === "object") ? m : {}; })
                    .catch(() => { manifest = {}; });
            } else manifest = {};
        };
        document.head.appendChild(sc);
    }

    function ready() {
        loadManifest();
        return !!manifest;
    }

    function has(text, lang) {
        if (!ready()) return false;
        return Object.prototype.hasOwnProperty.call(manifest, voiceKey(lang) + "|" + String(text).toLowerCase().replace(/\s+([!?])/g, "$1"));
    }

    function stop() {
        voicePending = null;
        if (current) {
            try { current.pause(); } catch (e) {}
            current = null;
        }
    }

    // Отдаёт URL аудио. Под http/https добавляет cache-buster (после перегенерации
    // банка файлы изменились, но URL те же — иначе браузер сыграет закэшированную
    // старую озвучку). Под file:// параметр запроса ломает загрузку.
    function audioUrl(rel) {
        if (!/^https?:/i.test(location.protocol) || /\?/.test(rel)) return rel;
        return rel + (rel.indexOf("?") < 0 ? "?v=20261805" : "&v=20261805");
    }

    function playFile(rel, onend, onerr) {
        stop();
        if (radioPlaying) { resumeRadioAfter = true; pauseRadio(); }
        const a = new Audio(rel);
        current = a;
        const done = () => {
            if (current === a) current = null;
            if (resumeRadioAfter) { resumeRadioAfter = false; playRadio(); }
            if (onend) onend();
        };
        a.onended = done;
        a.onerror = () => {
            if (current === a) current = null;
            if (resumeRadioAfter) { resumeRadioAfter = false; playRadio(); }
            if (onerr) onerr(); else if (onend) onend();
        };
        try {
            const p = a.play();
            if (p && p.catch) p.catch(() => { done(); });
        } catch (e) {
            done();
            return false;
        }
        return true;
    }

    // Резервный путь: живой браузерный TTS (когда записи в банке ещё нет)
    function findLangVoice(lang) {
        if (!window.speechSynthesis) return null;
        const voices = window.speechSynthesis.getVoices() || [];
        const want = voiceKey(lang);
        return voices.find(x => (x.lang || "").toLowerCase().indexOf(want + "-") === 0) ||
               voices.find(x => (x.lang || "").toLowerCase().indexOf(want) === 0) ||
               null;
    }

    function onVoicesReady() {
        const p = voicePending;
        if (!p || Date.now() > p.expiry || p.seq !== voiceSeq) { voicePending = null; return; }
        if (!findLangVoice(p.lang)) return;
        voicePending = null;
        speakFallback(p.text, p.lang, p.onend);
    }

    function warmVoices() {
        if (!window.speechSynthesis) return;
        try { window.speechSynthesis.getVoices(); } catch (e) {}
        const synth = window.speechSynthesis;
        if (synth.addEventListener) {
            synth.removeEventListener("voiceschanged", onVoicesReady);
            synth.addEventListener("voiceschanged", onVoicesReady);
        } else {
            synth.onvoiceschanged = onVoicesReady;
        }
    }

    function speakFallback(text, lang, onend) {
        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
            if (onend) onend();
            return false;
        }
        stop();
        try { window.speechSynthesis.cancel(); } catch (e) {}
        if (radioPlaying) { resumeRadioAfter = true; pauseRadio(); }
        const u = new SpeechSynthesisUtterance(String(text));
        const v = findLangVoice(lang);
        if (v) u.voice = v;
        u.lang = v ? v.lang : (lang === "ru" ? "ru-RU" : lang === "ja" ? "ja-JP" : "en-US");
        u.rate = 0.92;
        const done = () => {
            if (resumeRadioAfter) { resumeRadioAfter = false; playRadio(); }
            if (onend) onend();
        };
        u.onend = done;
        u.onerror = done;
        if (!v && voiceKey(lang) !== voiceKey("en")) {
            // Голос ещё не загрузился (Chrome/Edge подгружают сетевые голоса асинхронно:
            // Google 日本語 и т.п.). Ждём voiceschanged не дольше 3.5 с и пробуем снова.
            voiceSeq++;
            voicePending = { text: String(text), lang: lang, onend: onend, seq: voiceSeq, expiry: Date.now() + 3500 };
            warmVoices();
        }
        try { window.speechSynthesis.speak(u); } catch (e) { done(); return false; }
        return true;
    }

    // Произносит текст: сначала ищем запись OmniVoice, при отсутствии — живой TTS.
    // onend вызывается по окончании звучания (нужно последовательному чтению уроков).
    function speak(text, lang, onend) {
        questProgress("sound5", 1);
        const key = voiceKey(lang) + "|" + String(text).toLowerCase().replace(/\s+([!?])/g, "$1");
        if (ready() && manifest[key]) {
            // Файл могли удалить (перегенерация банка) — молча играть нельзя,
            // при ошибке загрузки откатываемся на браузерный TTS.
            playFile(audioUrl(manifest[key]), onend, () => speakFallback(text, lang, onend));
            return true;
        }
        return speakFallback(text, lang, onend);
    }

    loadManifest();
    warmVoices();
    return { speak: speak, stop: stop, has: has };
})();

function ttsSpeakSafe(text, lang, force) {
    if (!state.ttsEnabled) return;
    VOICE.speak(text, lang);
}

// Озвучивает слово текущего раунда (в режиме аудирования — всегда слово на изучаемом языке)
function speakCurrentWord() {
    const word = state.gameWords[state.currentWordIndex];
    if (!word) return;
    const isListening = state.playMode === "listening";
    const lang = isListening ? langTTS() : (isTargetToNative() ? langTTS() : "ru");
    const text = isListening
        ? (isJa() ? (word.kana || tgt(word)) : tgt(word))
        : (isTargetToNative() ? (isJa() ? (word.kana || tgt(word)) : tgt(word)) : nat(word));
    ttsSpeakSafe(text, lang);
}

function ttsSpeakCurrent() {
    speakCurrentWord();
}

function ttsSpeakBot() {
    const word = state.gameWords[state.currentWordIndex];
    if (!word) return;
    const lang = isTargetToNative() ? langTTS() : "ru";
    const text = isTargetToNative()
        ? (isJa() ? (word.kana || tgt(word)) : tgt(word))
        : nat(word);
    ttsSpeakSafe(text, lang);
}

function ttsSpeakCards() {
    if (!CARDS.sentence || !CARDS.sourceHint) return;
    const lang = isTargetToNative() ? langTTS() : "ru";
    const text = isJa() ? (CARDS.sentence.kana || CARDS.sourceHint) : CARDS.sourceHint;
    ttsSpeakSafe(text, lang);
}

function autoSpeakRound() {
    if (!state.ttsEnabled || !state.ttsAuto || !TTS.supported()) return;
    const word = state.gameWords[state.currentWordIndex];
    if (!word) return;
    if (state.playMode === "input" || state.playMode === "quiz") {
        const lang = isTargetToNative() ? langTTS() : "ru";
        const text = isTargetToNative()
            ? (isJa() ? (word.kana || tgt(word)) : tgt(word))
            : nat(word);
        ttsSpeakSafe(text, lang);
    } else if (state.playMode === "cards") {
        if (!(state.cardsAudio && state.ttsEnabled)) ttsSpeakCards();
    }
}

function makeSpeakBtn(text, lang) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tts-btn";
    b.textContent = "🔊";
    b.setAttribute("aria-label", "Озвучить");
    b.addEventListener("click", (e) => {
        e.stopPropagation();
        Sound.click();
        ttsSpeakSafe(text, lang);
    });
    return b;
}

function toggleCurrentFav() {
    const word = state.gameWords[state.currentWordIndex];
    if (!word) return;
    toggleFav(tgt(word));
    const btn = document.getElementById("current-fav");
    if (btn) btn.classList.toggle("is-fav", state.favoriteWords.includes(tgt(word)));
    Sound.click();
}

function toggleFav(en) {
    if (state.favoriteWords.includes(en)) {
        state.favoriteWords = state.favoriteWords.filter(w => w !== en);
    } else {
        state.favoriteWords.push(en);
    }
    saveData();
}

function toggleCardsAudio() {
    state.cardsAudio = !state.cardsAudio;
    const btn = document.getElementById("cards-audio-toggle");
    if (btn) btn.classList.toggle("active", state.cardsAudio);
    saveData();
    refreshCardsAudioMode();
}

function refreshCardsAudioMode() {
    if (state.playMode !== "cards" || !CARDS.sentence) return;
    const sourceEl = document.getElementById("cards-source");
    if (!sourceEl) return;
    const audioOn = state.cardsAudio && state.ttsEnabled;
    const audioBtn = document.getElementById("cards-audio-toggle");
    if (audioBtn) audioBtn.classList.toggle("active", audioOn);
    // Плашка всегда показывает подсказку: аудирование только включает
    // автопроизноску, а не прячет предложение (иначе экран остаётся пустым,
    // если звук недоступен или выключен на устройстве).
    sourceEl.textContent = CARDS.sourceHint;
    sourceEl.classList.toggle("audio-mode", audioOn);
    if (audioOn) {
        const lang = isTargetToNative() ? langTTS() : "ru";
        const text = isJa() ? (CARDS.sentence.kana || CARDS.sourceHint) : CARDS.sourceHint;
        // Через ttsSpeakSafe: играет банк озвучки (VOICE), а не сырой системный TTS,
        // и уважает выключенную озвучку (state.ttsEnabled).
        ttsSpeakSafe(text, lang);
    }
}

function computeDayStreak() {
    const d = new Date();
    let cursor = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (!(state.history[todayKeyAt(cursor)] && state.history[todayKeyAt(cursor)].learned > 0)) {
        cursor.setDate(cursor.getDate() - 1);
    }
    let streak = 0;
    while (true) {
        const key = todayKeyAt(cursor);
        const h = state.history[key];
        if (h && h.learned > 0) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

const ACHIEVEMENTS = [
    { id: "first", name: "Первый шаг", desc: "Выучить первое слово", check: s => s.learnedWords.length >= 1 },
    { id: "w100", name: "100 слов", desc: "Выучить 100 слов", check: s => s.learnedWords.length >= 100 },
    { id: "w500", name: "500 слов", desc: "Выучить 500 слов", check: s => s.learnedWords.length >= 500 },
    { id: "streak7", name: "Серия 7", desc: "7 правильных ответов подряд", check: s => (s.bestStreak || 0) >= 7 },
    { id: "streak30", name: "Серия 30", desc: "30 правильных ответов подряд", check: s => (s.bestStreak || 0) >= 30 },
    { id: "combo5", name: "Комбо 5", desc: "Комбо-множитель ×1.5 в скоростном режиме", check: s => (s.bestCombo || 0) >= 5 },
    { id: "acc90", name: "Снайпер", desc: "Точность 90%+ за раунд (10+ ответов)", check: s => (s.topAccuracy || 0) >= 90 },
    { id: "day10", name: "Слово дня", desc: "10 слов за один день", check: s => Object.keys(s.history || {}).some(k => s.history[k].learned >= 10) },
    { id: "days7", name: "Неделя", desc: "Серия дней 7+", check: () => computeDayStreak() >= 7 }
];

// При загрузке тихо фиксирует уже открытые ачивки (без уведомлений),
// чтобы старый прогресс не «выстреливал» тостами при старте.
function seedAchievements() {
    let changed = false;
    ACHIEVEMENTS.forEach(a => {
        if (a.check(state) && !state.achievementsUnlocked.includes(a.id)) {
            state.achievementsUnlocked.push(a.id);
            changed = true;
        }
    });
    if (changed) saveData();
}

function checkAchievements() {
    const fresh = [];
    ACHIEVEMENTS.forEach(a => {
        if (a.check(state) && !state.achievementsUnlocked.includes(a.id)) {
            state.achievementsUnlocked.push(a.id);
            fresh.push(a);
        }
    });
    if (fresh.length) fresh.forEach(a => showAchievementToast(a));
}

function showAchievementToast(a) {
    TOAST_QUEUE.push(() => makeToastEl("ach-toast",
        '<span class="ach-icon">' + iconHTML("🏅") + '</span>' +
        '<span class="ach-meta">' +
            '<span class="ach-label">Достижение разблокировано</span>' +
            '<span class="ach-name">' + escHTML(a.name) + '</span>' +
            '<span class="ach-desc">' + escHTML(a.desc) + '</span>' +
        '</span>'), 4500, () => { if (Sound && Sound.unlock) Sound.unlock(); });
}

function renderAchievements() {
    /* Счётчики и календарь убраны из экрана — остались только достижения */
    const list = document.getElementById("achievements-list");
    if (!list) return;
    list.innerHTML = "";
    ACHIEVEMENTS.forEach(a => {
        const done = a.check(state);
        const btn = document.createElement("div");
        btn.className = "achieve" + (done ? " done" : "");
        btn.innerHTML = `
            <span class="achieve-icon">${done ? '<span class="ach-medal">' + iconHTML("🏅") + '</span>' : '<img class="ach-lock" src="UI/Zamok.webp" alt="">'}</span>
            <span class="achieve-meta">
                <span class="achieve-name">${a.name}</span>
                <span class="achieve-desc">${a.desc}</span>
            </span>
        `;
        list.appendChild(btn);
    });
}

let radioPlaying = false;
let trackInterval = null;
const TRACK_URL = "https://lofiradio.ru/js/nowplaying.php";

// CORS-прокси, чтобы получить название трека с чужого домена
const TRACK_PROXIES = [
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?url=",
    "https://cors.eu.org/",
    "https://thingproxy.freeboard.io/fetch/"
];

// Список радиостанций (название, поток, ссылка в заголовок)
const RADIO_STATIONS = [
    { name: "LoFi Radio", stream: "https://live.lofiradio.ru/lofi_mp3_128", home: "https://lofiradio.ru/", trackUrl: "https://lofiradio.ru/js/nowplaying.php", type: "audio/mpeg" },
    { name: "Radio Record Ambient", stream: "https://radiorecord.hostingradio.ru/ambient96.aacp", home: "https://www.radiorecord.ru/station/ambient", trackUrl: "", type: "audio/aac" }
];

let currentStationIdx = 0;

function initRadioStations() {
    const box = document.getElementById("radio-station");
    if (!box) return;
    box.innerHTML = "";
    RADIO_STATIONS.forEach((st, i) => {
        const btn = document.createElement("button");
        btn.className = "radio-station-item";
        btn.textContent = st.name;
        btn.value = i;
        btn.onclick = () => switchRadioStation(i);
        box.appendChild(btn);
    });
    highlightRadioStation();
}

function highlightRadioStation() {
    const box = document.getElementById("radio-station");
    if (!box) return;
    Array.from(box.children).forEach((btn, i) => {
        btn.classList.toggle("active", i === currentStationIdx);
    });
}

function switchRadioStation(idx) {
    idx = parseInt(idx, 10) || 0;
    const st = RADIO_STATIONS[idx];
    if (!st) return;
    currentStationIdx = idx;
    highlightRadioStation();

    const audio = document.getElementById("radio-audio");
    audio.src = st.stream;
    audio.load();

    const link = document.querySelector(".radio-link");
    if (link) {
        link.href = st.home;
        link.textContent = radioPlaying ? "Сейчас играет ♫" : (st.name + " ↗");
    }

    document.getElementById("radio-track").textContent = "нажмите ▶";

    // Если играли — перезапускаем новый поток
    if (radioPlaying) {
        playRadio();
    }
}

function toggleTopbar() {
    const bar = document.getElementById("topbar");
    if (!bar) return;
    const btn = document.getElementById("topbar-toggle");
    const collapsed = bar.classList.toggle("collapsed");
    if (btn) btn.textContent = collapsed ? "+" : "–";
}

function playRadio() {
    if (radioPlaying) return;
    const audio = document.getElementById("radio-audio");
    const led = document.getElementById("radio-led");
    const link = document.querySelector(".radio-link");

    audio.volume = document.getElementById("radio-volume").value / 100;
    audio.play().then(() => {
        radioPlaying = true;
        led.classList.add("on");
        if (link) link.textContent = "Сейчас играет ♫";
        fetchTrack();
        trackInterval = setInterval(fetchTrack, 15000);
    }).catch(() => {
        if (link) link.textContent = "Нажмите ▶ для старта";
    });
}

function pauseRadio() {
    const audio = document.getElementById("radio-audio");
    const led = document.getElementById("radio-led");
    audio.pause();
    radioPlaying = false;
    led.classList.remove("on");
    clearInterval(trackInterval);
    const st = RADIO_STATIONS[currentStationIdx];
    const link = document.querySelector(".radio-link");
    if (link) link.textContent = (st ? st.name : "LoFi Radio") + " ↗";
}

function setRadioVolume(val) {
    const audio = document.getElementById("radio-audio");
    audio.volume = val / 100;
    document.getElementById("radio-vol-num").textContent = val;
}

// Громкость звуковых эффектов игры (Web Audio), радио не затрагивается
function setSfxVolume(val) {
    Sound.setVolume(parseInt(val, 10) || 0);
    document.querySelectorAll(".sfx-slider").forEach(s => s.value = state.sfxVolume);
    document.querySelectorAll(".sfx-vol-num").forEach(el => el.textContent = state.sfxVolume);
    saveData();
}

function initSfxVolume() {
    document.querySelectorAll(".sfx-slider").forEach(s => s.value = state.sfxVolume);
    document.querySelectorAll(".sfx-vol-num").forEach(el => el.textContent = state.sfxVolume);
}

async function fetchTrack() {
    const trackEl = document.getElementById("radio-track");
    const st = RADIO_STATIONS[currentStationIdx];
    if (!st || !st.trackUrl) return;
    // Сначала пробуем напрямую (если вдруг есть CORS), затем через прокси по очереди
    const attempts = [st.trackUrl].concat(TRACK_PROXIES.map(p => p + encodeURIComponent(st.trackUrl)));
    for (const url of attempts) {
        try {
            const resp = await fetch(url, { method: "GET", cache: "no-store" });
            const text = (await resp.text()).trim();
            if (text && text.length > 2 && !/^(<|{)/.test(text)) {
                if (trackEl) trackEl.textContent = text;
                return;
            }
        } catch (err) {
            // пробуем следующий прокси
        }
    }
}

/* ===== Пиксельные (чиптюн) звуковые эффекты на Web Audio API ===== */
const Sound = (() => {
    let ctx = null;
    let master = null;
    let unlocked = false;

    function unlock() {
        if (unlocked) return;
        if (!ctx) ensure();
        if (ctx && ctx.state === "suspended") ctx.resume().then(() => { unlocked = true; }).catch(() => {});
    }

    function ensure() {
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0.22 * (state.sfxVolume / 100);
            master.connect(ctx.destination);
        }
        if (ctx.state === "suspended") ctx.resume();
        return ctx;
    }

    // Громкость звуковых эффектов (радио не затрагивается)
    function setVolume(v) {
        state.sfxVolume = v;
        if (master) master.gain.value = 0.22 * (v / 100);
    }

    // Один тон: waveform, частота, старт/длительность, старт~питч, форма огибающей
    function tone(freq, start, dur, type = "square", slideTo = null, vol = 1) {
        const c = ensure();
        if (!c) return;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, c.currentTime + start);
        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(
                Math.max(30, slideTo), c.currentTime + start + dur
            );
        }
        g.gain.setValueAtTime(0.0001, c.currentTime + start);
        g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
        osc.connect(g);
        g.connect(master);
        osc.start(c.currentTime + start);
        osc.stop(c.currentTime + start + dur + 0.02);
    }

    // Белый шум (для «россыпи» пикселей при растворении)
    function noise(start, dur, vol = 0.4) {
        const c = ensure();
        if (!c) return;
        const len = Math.floor(c.sampleRate * dur);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = c.createBufferSource();
        src.buffer = buf;
        const g = c.createGain();
        g.gain.value = vol;
        const filt = c.createBiquadFilter();
        filt.type = "highpass";
        filt.frequency.value = 800;
        src.connect(filt);
        filt.connect(g);
        g.connect(master);
        src.start(c.currentTime + start);
    }

    // Звуковые пресеты по темам: «классика» — яркие чиптюн-звуки,
    // «ваби-саби» — спокойные и расслабляющие (мягкие синусы/треугольники).
    const SOUND_PRESETS = {
        classic: {
            click()  { tone(660, 0, 0.06, "square", 880); },
            hover()  { tone(1250, 0, 0.06, "triangle", 950, 0.35); },
            type()   {
                const notes = [523, 587, 659, 784, 880, 1047];
                const f = notes[Math.floor(Math.random() * notes.length)];
                tone(f, 0, 0.06, "triangle", f * 1.1, 0.4);
            },
            deal()   { tone(300, 0, 0.12, "triangle", 700); tone(500, 0.09, 0.1, "triangle", 900); },
            flip()   { tone(180, 0, 0.08, "triangle", 420); tone(320, 0.08, 0.08, "triangle", 640); },
            correct() {
                tone(523, 0, 0.16, "triangle", null, 0.7);
                tone(659, 0.12, 0.16, "triangle", null, 0.7);
                tone(784, 0.24, 0.24, "triangle", null, 0.7);
            },
            wrong()  { tone(220, 0, 0.18, "sawtooth", 140, 0.9); tone(160, 0.15, 0.25, "sawtooth", 90, 0.9); },
            dissolve(){ noise(0, 0.5, 0.5); tone(700, 0, 0.25, "triangle", 120); },
            gameover() {
                tone(392, 0, 0.15, "square");
                tone(330, 0.16, 0.15, "square");
                tone(262, 0.32, 0.3, "square");
            },
            win() {
                tone(523, 0, 0.1, "square");
                tone(659, 0.1, 0.1, "square");
                tone(784, 0.2, 0.1, "square");
                tone(1047, 0.3, 0.28, "square");
            },
            unlock() {
                tone(523, 0, 0.08, "square");
                tone(659, 0.09, 0.08, "square");
                tone(784, 0.18, 0.08, "square");
                tone(1047, 0.27, 0.24, "square", 1568);
            }
        },
        wabi: {
            click()  { tone(520, 0, 0.1, "sine", 620, 0.5); },
            hover()  { tone(880, 0, 0.08, "sine", 950, 0.3); },
            type()   {
                const notes = [392, 440, 494, 523, 587, 659];
                const f = notes[Math.floor(Math.random() * notes.length)];
                tone(f, 0, 0.12, "sine", null, 0.35);
            },
            deal()   { tone(330, 0, 0.18, "sine", 440, 0.4); tone(440, 0.14, 0.16, "sine", 520, 0.35); },
            flip()   { tone(294, 0, 0.14, "sine", 392, 0.4); tone(392, 0.12, 0.16, "sine", 494, 0.4); },
            correct() {
                tone(523, 0, 0.3, "sine", null, 0.5);
                tone(659, 0.22, 0.3, "sine", null, 0.5);
                tone(784, 0.44, 0.5, "sine", null, 0.5);
            },
            wrong()  { tone(196, 0, 0.3, "sine", 147, 0.5); tone(147, 0.24, 0.4, "sine", 110, 0.5); },
            dissolve(){ noise(0, 0.6, 0.15); tone(440, 0, 0.4, "sine", 220, 0.4); },
            gameover() {
                tone(330, 0, 0.3, "sine");
                tone(294, 0.3, 0.3, "sine");
                tone(262, 0.6, 0.6, "sine");
            },
            win() {
                tone(523, 0, 0.25, "sine");
                tone(587, 0.22, 0.22, "sine");
                tone(659, 0.44, 0.22, "sine");
                tone(784, 0.66, 0.5, "sine");
            },
            unlock() {
                tone(523, 0, 0.18, "sine");
                tone(659, 0.18, 0.18, "sine");
                tone(784, 0.36, 0.4, "sine");
            }
        },
        witcher: {
            click()  { tone(196, 0, 0.08, "triangle", 262, 0.5); },
            hover()  { tone(392, 0, 0.07, "triangle", 440, 0.3); },
            type()   {
                const notes = [294, 330, 349, 392, 440, 494];
                const f = notes[Math.floor(Math.random() * notes.length)];
                tone(f, 0, 0.06, "triangle", null, 0.4);
            },
            deal()   { tone(220, 0, 0.12, "triangle", 330, 0.5); tone(330, 0.09, 0.12, "triangle", 440, 0.5); },
            flip()   { tone(196, 0, 0.1, "triangle", 294, 0.5); tone(294, 0.09, 0.12, "triangle", 392, 0.5); },
            correct() {
                tone(392, 0, 0.18, "triangle", null, 0.7);
                tone(494, 0.14, 0.18, "triangle", null, 0.7);
                tone(587, 0.28, 0.28, "triangle", null, 0.7);
            },
            wrong()  { tone(196, 0, 0.18, "sawtooth", 131, 0.9); tone(131, 0.15, 0.28, "sawtooth", 87, 0.9); },
            dissolve(){ noise(0, 0.4, 0.4); tone(330, 0, 0.2, "triangle", 165); },
            gameover() {
                tone(262, 0, 0.16, "triangle");
                tone(220, 0.16, 0.16, "triangle");
                tone(175, 0.32, 0.34, "triangle");
            },
            win() {
                tone(392, 0, 0.12, "triangle");
                tone(494, 0.12, 0.12, "triangle");
                tone(587, 0.24, 0.12, "triangle");
                tone(784, 0.36, 0.32, "triangle");
            },
            unlock() {
                tone(262, 0, 0.14, "triangle");
                tone(392, 0.14, 0.14, "triangle");
                tone(523, 0.28, 0.3, "triangle");
            }
        },
        // Syberia: мягкий «музыкальный automat» — колокольчики и челеста
        syberia: {
            click()  { tone(740, 0, 0.07, "triangle", 988, 0.4); },
            hover()  { tone(1175, 0, 0.05, "sine", 1046, 0.22); },
            type()   {
                const notes = [659, 784, 880, 988, 1175];
                const f = notes[Math.floor(Math.random() * notes.length)];
                tone(f, 0, 0.08, "sine", null, 0.3);
            },
            deal()   { tone(392, 0, 0.11, "triangle", 523, 0.4); tone(523, 0.09, 0.1, "sine", 659, 0.35); },
            flip()   { tone(294, 0, 0.08, "triangle", 440, 0.4); tone(494, 0.08, 0.1, "sine", 659, 0.35); },
            correct() {
                tone(659, 0, 0.13, "sine", null, 0.5);
                tone(784, 0.11, 0.13, "sine", null, 0.5);
                tone(1047, 0.22, 0.22, "triangle", null, 0.5);
            },
            wrong()  { tone(233, 0, 0.16, "triangle", 185, 0.7); tone(175, 0.13, 0.24, "sine", 116, 0.7); },
            dissolve(){ noise(0, 0.45, 0.35); tone(622, 0, 0.22, "sine", 311, 0.4); },
            gameover() {
                tone(370, 0, 0.15, "triangle");
                tone(311, 0.15, 0.15, "sine");
                tone(247, 0.3, 0.32, "sine");
            },
            win() {
                tone(659, 0, 0.1, "triangle");
                tone(784, 0.1, 0.1, "triangle");
                tone(988, 0.2, 0.1, "sine");
                tone(1319, 0.3, 0.28, "sine", null, 0.55);
            },
            unlock() {
                tone(587, 0, 0.09, "triangle");
                tone(740, 0.09, 0.09, "triangle");
                tone(988, 0.18, 0.09, "sine");
                tone(1175, 0.27, 0.26, "sine", 1568, 0.5);
            }
        },
        /* Плюш: самый нежный набор — только тёплые синусы и тихие объёмы
           (0.16–0.4), плавные «колыбельные» интервалы; квадрата и пилы нет
           вообще (у классики square/sawtooth — источник резкости). */
        plush: {
            click()  { tone(440, 0, 0.09, "sine", 520, 0.3); },
            hover()  { tone(740, 0, 0.07, "sine", 700, 0.16); },
            type()   {
                const notes = [349, 392, 440, 494, 523];
                const f = notes[Math.floor(Math.random() * notes.length)];
                tone(f, 0, 0.14, "sine", null, 0.24);
            },
            deal()   { tone(294, 0, 0.16, "sine", 370, 0.28); tone(370, 0.12, 0.18, "sine", 440, 0.26); },
            flip()   { tone(262, 0, 0.12, "sine", 330, 0.28); tone(330, 0.1, 0.16, "sine", 392, 0.26); },
            correct() {
                tone(440, 0, 0.28, "sine", null, 0.36);
                tone(554, 0.2, 0.28, "sine", null, 0.36);
                tone(659, 0.4, 0.42, "sine", null, 0.4);
            },
            wrong()  { tone(220, 0, 0.28, "sine", 175, 0.38); tone(185, 0.22, 0.34, "sine", 147, 0.38); },
            dissolve(){ noise(0, 0.55, 0.1); tone(392, 0, 0.45, "sine", 196, 0.3); },
            gameover() {
                tone(330, 0, 0.3, "sine", null, 0.34);
                tone(294, 0.32, 0.3, "sine", null, 0.32);
                tone(262, 0.64, 0.55, "sine", null, 0.3);
            },
            win() {
                tone(523, 0, 0.22, "sine", null, 0.34);
                tone(659, 0.2, 0.22, "sine", null, 0.34);
                tone(784, 0.4, 0.22, "sine", null, 0.36);
                tone(1047, 0.6, 0.5, "sine", null, 0.4);
            },
            unlock() {
                tone(523, 0, 0.2, "sine", null, 0.32);
                tone(659, 0.18, 0.2, "sine", null, 0.32);
                tone(784, 0.36, 0.45, "sine", null, 0.36);
            }
        }
    };

    function pick(which) {
        const preset = SOUND_PRESETS[state.theme] || SOUND_PRESETS.classic;
        return preset[which];
    }

    // Эхо-гейт: глобальный клик уже проиграл звук этого жеста — ручной
    // Sound.click() внутри обработчика (навигация идёт с задержкой 240 мс)
    // молчит, чтобы не звучать дважды.
    let gestureClickAt = 0;

    return {
        setVolume: setVolume,
        unlockAudio: unlock,
        click() {
            if (Date.now() - gestureClickAt < 400) return;
            pick("click")();
        },
        clickFromGesture() {
            gestureClickAt = Date.now();
            pick("click")();
        },
        hover()   { pick("hover")(); },
        type()    { pick("type")(); },
        deal()    { pick("deal")(); },
        flip()    { pick("flip")(); },
        correct() { pick("correct")(); },
        wrong()   { pick("wrong")(); },
        dissolve(){ pick("dissolve")(); },
        gameover(){ pick("gameover")(); },
        win()     { pick("win")(); },
        unlock()  { pick("unlock")(); }
    };
})();

// ===== Голосовой ввод: онлайн Chrome (Web Speech — нужна сеть) =====
// MIC.begin(onText, lang) — начать запись и вернуть распознанный текст в onText.
// Игровое поле использует этот движок.
const MIC = (() => {
    let rec = null;            // Web Speech
    let micStream = null;
    let active = false;
    let mode = null;           // "web"
    let onResult = null;       // куда отдать распознанный текст
    let langOverride = null;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    function supported() { return true; }

    function isActive() { return active; }

    function targetLang() {
        if (langOverride) return langOverride;
        if (state.playMode === "listening") return isJa() ? "ja-JP" : "en-US";
        return isTargetToNative() ? "ru-RU" : (isJa() ? "ja-JP" : "en-US");
    }

    function setBtn(on) {
        const btn = document.getElementById("answer-mic");
        if (btn) {
            btn.classList.toggle("recording", on);
            btn.textContent = on ? "🎙" : "🎤";
            btn.title = on ? "Идёт запись — нажмите, чтобы остановить" : "Голосовой ввод";
        }
    }

    function showHint(text) {
        const fb = document.getElementById("feedback");
        if (fb && !fb.textContent) {
            fb.textContent = text;
            fb.className = "feedback incorrect";
            setTimeout(() => { if (fb.textContent === text) { fb.textContent = ""; fb.className = "feedback"; } }, 4500);
        }
    }

    function cleanup() {
        active = false;
        mode = null;
        setBtn(false);
        if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    }

    function stop() {
        if (mode === "web" && rec) {
            try { rec.onend = null; rec.stop(); } catch (e) {}
            rec = null;
        }
        cleanup();
    }

    // Распознанный текст отдаём подписчику
    function deliver(text) {
        if (!text || !onResult) return;
        // Web Speech ставит точку (и прочие знаки) в конце — для проверки слова они мешают
        text = String(text).trim()
            .replace(/[\s.,!?;:…"'«»]+$/g, "")
            .replace(/^[\s.,!?;:…"'«»]+/, "")
            .trim();
        if (text) onResult(text);
    }

    function startWebSpeech() {
        try {
            rec = new SR();
            rec.lang = targetLang();
            rec.interimResults = false;
            rec.maxAlternatives = 1;
            mode = "web";
            active = true;
            setBtn(true);
            rec.onresult = (e) => {
                const text = String(e.results[0][0].transcript || "").trim();
                deliver(text);
            };
            rec.onerror = (e) => {
                const hints = {
                    "not-allowed": "Нет доступа к микрофону — разрешите его в браузере.",
                    "service-not-allowed": "Нет доступа к микрофону — разрешите его в браузере.",
                    "no-speech": "Речь не расслышана — нажмите 🎤 и попробуйте ещё раз.",
                    "audio-capture": "Микрофон не найден.",
                    "network": "Нет соединения с сервисом распознавания — проверьте интернет."
                };
                showHint(hints[e.error] || ("Голосовой ввод недоступен (" + e.error + ")."));
            };
            rec.onend = () => { if (mode === "web") cleanup(); };
            rec.start();
        } catch (e) {
            cleanup();
        }
    }

    // Начать запись: результат придёт в onText
    function begin(onText, lang) {
        if (active) { stop(); return; }
        onResult = onText || null;
        langOverride = lang || null;
        if (SR) startWebSpeech();
        else {
            showHint("Откройте игру в Chrome/Edge с интернетом — голосовой ввод работает там (нужна сеть).");
            onResult = null; langOverride = null;
        }
    }

    function init() {
        const btn = document.getElementById("answer-mic");
        if (!btn) return;
        btn.addEventListener("click", () => {
            if (MIC.isActive()) { MIC.stop(); return; }
            Sound.click();
            MIC.begin(t => handleResult(t));
        });
    }

    return { init: init, supported: supported, stop: stop, isActive: isActive, begin: begin, handleResult: handleResult };
})();

// Распознанный текст: подставляем в поле и, если включена автопроверка, сразу проверяем
function handleResult(text) {
    if (!text) return;
    const input = document.getElementById("answer-input");
    if (!input || input.disabled) return;
    input.value = text;
    input.focus();
    Sound.type();
    if (state.micAutoCheck === false) return;
    setTimeout(() => {
        const checkBtn = document.getElementById("check-btn");
        if (checkBtn && !checkBtn.classList.contains("hidden") && !input.disabled) checkAnswer();
    }, 500);
}

// ===== Озвучка урока: последовательное чтение строк с подсветкой =====
const NARRATOR = (() => {
    let units = [];
    let ui = 0, si = 0;
    let playing = false;
    let token = 0;
    let onStateChange = null;
    let stepTimer = null;

    function clearHighlight() {
        document.querySelectorAll(".lesson-line.narrating").forEach(x => x.classList.remove("narrating"));
    }

    function clearTimers() {
        if (stepTimer) { clearTimeout(stepTimer); stepTimer = null; }
    }

    function stop() {
        token++;
        playing = false;
        clearTimers();
        VOICE.stop();
        clearHighlight();
        if (onStateChange) onStateChange();
    }

    function pause() {
        playing = false;
        clearTimers();
        VOICE.stop();
        if (onStateChange) onStateChange();
    }

    function resume() {
        if (!units.length || ui >= units.length) return;
        playing = true;
        if (onStateChange) onStateChange();
        step(token);
    }

    function highlight(el) {
        clearHighlight();
        if (el) {
            el.classList.add("narrating");
            if (el.scrollIntoView) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }

    function showLine(el) {
        if (el && !el.classList.contains("visible")) {
            el.classList.add("visible");
        }
    }

    function step(myToken) {
        if (myToken !== token || !playing) return;
        if (ui >= units.length) { stop(); return; }
        const u = units[ui];
        if (si >= u.sents.length) { ui++; si = 0; step(myToken); return; }
        showLine(u.el);
        highlight(u.el);
        const sent = u.sents[si++];
        VOICE.speak(sent, u.lang, () => {
            stepTimer = setTimeout(() => step(myToken), 350);
        });
    }

    // Проигрывает список строк подряд, показывая каждую
    function playAll(list) {
        stop();
        units = (list || []).filter(u => u.sents && u.sents.length);
        if (!units.length) return;
        playing = true;
        ui = 0; si = 0;
        if (onStateChange) onStateChange();
        step(++token);
    }

    // Показать все строки сразу (без озвучки)
    function showAll() {
        stop();
        document.querySelectorAll(".lesson-line").forEach(el => el.classList.add("visible"));
    }

    function playUnit(u) {
        if (!u || !u.sents || !u.sents.length) return;
        stop();
        units = [u];
        playing = true;
        ui = 0; si = 0;
        if (onStateChange) onStateChange();
        step(++token);
    }

    return { playAll, playUnit, stop, pause, resume, showAll,
             isPlaying: () => playing, setOnStateChange: (fn) => { onStateChange = fn; } };
})();

/* Пошаговый показ строк урока: по одной, плавно, с озвучкой.
   Кнопки в шапке: ▶ Слушать (авто), ⏸ Пауза, 📋 Всё сразу. */
const lessonStep = (() => {
    let units = [];
    let body = null;
    let idx = 0;
    let auto = false;
    let timer = null;
    let scrollRaf = 0;
    let token = 0;
    let sentIdx = 0;

    function clear() {
        token++;
        if (timer) { clearTimeout(timer); timer = null; }
        VOICE.stop();
    }

    function updateButtons() {
        const playBtn = document.getElementById("lesson-play-btn");
        const pauseBtn = document.getElementById("lesson-pause-btn");
        if (playBtn) playBtn.innerHTML = auto ? iconHTML("■") + " Стоп" : iconHTML("▶") + " Слушать";
        if (pauseBtn) pauseBtn.innerHTML = auto ? iconHTML("⏸") + " Пауза" : iconHTML("▶") + " Продолжить";
    }

    // Плавный проезд колонки своим rAF-твином: нативный scrollTo({behavior:
    // "smooth"}) в WebView часто проскакивает почти мгновенно (~300ms), из-за
    // чего центрирование выглядело резким скачком. Длительность тянется по
    // дистанции (0.9–1.6s), easing — cubic in-out: мягкий разгон и торможение.
    function glideTo(top) {
        const from = body.scrollTop;
        const dist = top - from;
        if (Math.abs(dist) < 1) return;
        if (scrollRaf) { cancelAnimationFrame(scrollRaf); scrollRaf = 0; }
        const duration = Math.min(1600, Math.max(900, Math.abs(dist) * 4.5));
        const t0 = performance.now();
        const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const tick = now => {
            const p = Math.min(1, (now - t0) / duration);
            body.scrollTop = from + dist * ease(p);
            scrollRaf = p < 1 ? requestAnimationFrame(tick) : 0;
        };
        scrollRaf = requestAnimationFrame(tick);
    }

    // Центр активной плашки — сразу, без ожидания transition раскрытия 0.55s.
    // Геометрию берём финальную: высоту из scrollHeight + рамка (scrollHeight
    // не зависит от max-height:0), top — из rect за вычетом текущего
    // translateY из анимации появления. Так проезд стартует в тот же тик,
    // пока плашка раскрывается, и они заканчиваются почти одновременно.
    function lineTarget(el) {
        if (!body || !el) return null;
        const br = body.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        let shiftY = 0;
        const m = cs.transform;
        if (m && m.indexOf("matrix(") === 0) {
            const v = m.slice(7, -1).split(",");
            if (v.length >= 6) shiftY = parseFloat(v[5]) || 0;
        }
        const bt = parseFloat(cs.borderTopWidth) || 0;
        const bb = parseFloat(cs.borderBottomWidth) || 0;
        const finalH = el.scrollHeight + bt + bb;
        const finalTop = er.top - shiftY;
        const target = body.scrollTop + (finalTop - br.top) - (body.clientHeight - finalH) / 2;
        const finalMax = Math.max(0, body.scrollHeight + (finalH - er.height) - body.clientHeight);
        return Math.max(0, Math.min(Math.round(target), finalMax));
    }

    function highlightLine(i) {
        units.forEach(u => { if (u.el) u.el.classList.remove("narrating"); });
        const u = units[i];
        if (u && u.el) {
            u.el.classList.add("narrating");
            const target = lineTarget(u.el);
            if (target != null) glideTo(target);
        }
    }

    // Apple-style: слова появляются одно за другим (60ms + interval)
    function revealWords(el, myToken) {
        const words = Array.prototype.slice.call(el.querySelectorAll(".w:not(.shown)"));
        if (!words.length) return;
        let i = 0;
        (function tick() {
            if (myToken !== token) return;
            words[i].classList.add("shown");
            i++;
            if (i < words.length) setTimeout(tick, 130);
        })();
    }

    function showImmediate(el) {
        el.querySelectorAll(".w").forEach(w => w.classList.add("shown"));
    }

    function speakSent(myToken) {
        if (myToken !== token || !auto) return;
        const u = units[idx];
        if (!u || !u.sents || sentIdx >= u.sents.length) {
            idx++; sentIdx = 0;
            timer = setTimeout(() => nextStep(myToken), 400);
            return;
        }
        VOICE.speak(u.sents[sentIdx++], u.lang, () => {
            timer = setTimeout(() => speakSent(myToken), 250);
        });
    }

    function nextStep(myToken) {
        if (myToken !== token || !auto) return;
        if (idx >= units.length) { stopAuto(); return; }
        const u = units[idx];
        if (u && u.el) {
            u.el.classList.add("visible");
            highlightLine(idx);
            // Слов по одному и озвучка параллельно с началом анимации
            revealWords(u.el, myToken);
            if (!u.sents || !u.sents.length) {
                idx++; sentIdx = 0;
                timer = setTimeout(() => nextStep(myToken), 200);
                return;
            }
            sentIdx = 0;
            timer = setTimeout(() => speakSent(myToken), 150);
        } else {
            idx++; sentIdx = 0;
            timer = setTimeout(() => nextStep(myToken), 200);
        }
    }

    function start() {
        clear();
        // Сбрасываем скрытость слов и строк при перезапуске:
        // после «Всё сразу» → «Слушать» строки оставались visible с уже
        // скрытыми словами — пустые плашки с кнопками озвучки.
        document.querySelectorAll(".lesson-line .w").forEach(w => w.classList.remove("shown"));
        document.querySelectorAll(".lesson-line").forEach(el => el.classList.remove("visible", "narrating"));
        auto = true;
        idx = 0; sentIdx = 0;
        updateButtons();
        const myToken = ++token;
        nextStep(myToken);
    }

    function stopAuto() {
        auto = false;
        clear();
        units.forEach(u => {
            if (u.el) {
                u.el.classList.remove("narrating");
                if (u.el.classList.contains("visible")) showImmediate(u.el);
            }
        });
        updateButtons();
    }

    function showAll() {
        auto = false;
        clear();
        units.forEach(u => {
            if (u.el) { u.el.classList.add("visible"); showImmediate(u.el); }
        });
        updateButtons();
    }

    function pauseToggle() {
        if (auto) { stopAuto(); }
        else if (idx < units.length) {
            auto = true;
            updateButtons();
            const myToken = ++token;
            // Продолжаем с текущего предложения текущей строки
            const u = units[idx];
            if (u && u.el) {
                u.el.classList.add("visible");
                showImmediate(u.el);
                highlightLine(idx);
            }
            if (u && u.sents && sentIdx < u.sents.length) {
                VOICE.speak(u.sents[sentIdx++], u.lang, () => {
                    timer = setTimeout(() => speakSent(myToken), 250);
                });
            } else {
                idx++; sentIdx = 0;
                timer = setTimeout(() => nextStep(myToken), 400);
            }
        }
    }

    function stop() {
        stopAuto();
    }

    function playSingle(u) {
        auto = false;
        clear();
        if (!u || !u.sents || !u.sents.length) { updateButtons(); return; }
        if (u.el) showImmediate(u.el);
        VOICE.speak(u.sents[0], u.lang, () => { updateButtons(); });
        updateButtons();
    }

    function attach(u, b) {
        units = (u || []).filter(x => x && x.el);
        body = b;
        idx = 0; sentIdx = 0;
        document.getElementById("lesson-play-btn").onclick = () => {
            if (auto) stopAuto(); else start();
        };
        document.getElementById("lesson-pause-btn").onclick = pauseToggle;
        document.getElementById("lesson-all-btn").onclick = showAll;
    }

    return { attach, start, stop, pauseToggle, showAll, playSingle };
})();

// Делит строку на предложения — поддерживает латинскую и японскую пунктуацию
function splitSentences(text) {
    return String(text)
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?…。！？])\s+/)
        .map(s => s.trim())
        .filter(Boolean);
}

// ===== УРОКИ =====
const LESSON_LEVELS = {
    a: { tabId: "lessons-lvl-a", data: (isJa() ? JA_A1A2_LESSONS : A1A2_LESSONS) || [] },
    b: { tabId: "lessons-lvl-b", data: (isJa() ? JA_B1B2_LESSONS : B1B2_LESSONS) || [] }
};
let lessonsLevel = "a";
let lessonIndex = 0;
let LESSON_TEST = null;

function testForLesson(lesson) {
    // Тесты разделены по языкам: EN — A1A2_TESTS/B1B2_TESTS, JA —
    // JA_A1A2_TESTS/JA_B1B2_TESTS. Раньше все писали в один глобал, и
    // коллизия id ("word-order" есть и в EN, и в JA) уводила EN уроки
    // на японские тесты: ja-tests грузились последними и перезаписывали.
    const ja = isJa();
    const tests = lessonsLevel === "b"
        ? (ja ? (window.JA_B1B2_TESTS || {}) : (window.B1B2_TESTS || {}))
        : (ja ? (window.JA_A1A2_TESTS || {}) : (window.A1A2_TESTS || {}));
    return tests[lesson.id] || null;
}

function showLessonsMenu() {
    lessonStep.stop();
    NARRATOR.stop();
    lessonsLevel = "a";
    renderLessonsTabs();
    renderLessonsList();
    showScreen("lessons-screen");
    Sound.click();
}

function selectLessonsLevel(level) {
    lessonsLevel = level;
    Sound.click();
    renderLessonsTabs();
    renderLessonsList();
}

function renderLessonsTabs() {
    for (const k in LESSON_LEVELS) {
        const tab = document.getElementById(LESSON_LEVELS[k].tabId);
        if (tab) tab.classList.toggle("active", lessonsLevel === k);
    }
}

function lessonsData() {
    const ja = isJa();
    if (lessonsLevel === "a") return (ja ? JA_A1A2_LESSONS : A1A2_LESSONS) || [];
    return (ja ? JA_B1B2_LESSONS : B1B2_LESSONS) || [];
}

function renderLessonsList() {
    const data = lessonsData();
    const list = document.getElementById("lessons-list");
    if (!data.length) {
        list.innerHTML = '<div class="lesson-empty">' + iconHTML("🌟") + ' Уроки этого уровня скоро появятся</div>';
        return;
    }
    list.innerHTML = "";
    data.forEach((lesson, i) => {
        const div = document.createElement("div");
        const locked = i > 0 && !state.lessonDone[data[i - 1].id];
        div.className = "lesson-item" + (locked ? " locked" : "");
        const hasTest = testForLesson(lesson) !== null;
        div.innerHTML = '<span class="lesson-num">' + (i + 1) + "</span>" +
            '<div class="lesson-meta"><div class="lesson-title">' + iconHTML(lesson.icon) + " " + escHTML(lesson.title) + "</div>" +
            '<div class="lesson-desc">' + escHTML(lesson.desc) + "</div></div>" +
            (locked ? '<span class="lesson-go"><img class="lock-ic" src="UI/Zamok.webp" alt=""></span>' :
                (state.lessonDone[lesson.id]
                    ? '<span class="lesson-go">' + iconHTML("✅") + '</span>'
                    : '<span class="lesson-go">Читать ' + iconHTML("→") + '</span>')) +
            (!locked && hasTest ? '<button class="lesson-quiz-btn" title="Пройти тест по уроку">' + iconHTML("📝") + ' Тест</button>' : "");
        if (!locked) div.onclick = () => openLesson(i);
        const btn = div.querySelector(".lesson-quiz-btn");
        if (btn) btn.onclick = e => { e.stopPropagation(); startLessonsTest(lesson.id); };
        list.appendChild(div);
    });
    Sound.click();
}

function openLesson(index) {
    lessonStep.stop();
    lessonIndex = index;
    renderLessonView();
    showScreen("lesson-screen");
    Sound.click();
    questProgress("lesson1", 1);
}

function renderLessonView() {
    const lesson = lessonsData()[lessonIndex];
    if (!lesson) return;
    const count = lessonsData().length;
    document.getElementById("lesson-title").innerHTML = iconHTML(lesson.icon) + " " + escHTML(lesson.title);
    document.getElementById("lesson-prev").classList.toggle("hidden", lessonIndex === 0);
    const next = document.getElementById("lesson-next");
    const testBtn = document.getElementById("lesson-test-btn");
    if (lessonIndex >= count - 1) {
        next.classList.add("hidden");
    } else {
        next.classList.remove("hidden");
        next.innerHTML = "Следующий " + iconHTML("→");
    }
    testBtn.classList.remove("hidden");
    const doneBtn = document.getElementById("lesson-done-btn");
    if (testForLesson(lesson)) {
        testBtn.innerHTML = iconHTML("📝") + " Тест по уроку (10 вопросов)";
        testBtn.onclick = () => startLessonsTest(lesson.id);
        if (doneBtn) doneBtn.style.display = "none";
    } else {
        testBtn.innerHTML = iconHTML("📝") + " Тест скоро появится";
        testBtn.onclick = null;
        if (doneBtn) {
            doneBtn.style.display = "";
            if (state.lessonDone[lesson.id]) {
                doneBtn.innerHTML = iconHTML("✅") + " Урок изучен";
                doneBtn.disabled = true;
                doneBtn.style.opacity = "1";
                doneBtn.onclick = null;
            } else {
                doneBtn.innerHTML = iconHTML("✅") + " Я изучил этот урок";
                doneBtn.disabled = true;
                doneBtn.style.opacity = "0.4";
                doneBtn.title = "Долистайте урок до конца";
                doneBtn.onclick = () => {
                    markLessonDone(lesson.id);
                    doneBtn.innerHTML = iconHTML("✅") + " Урок изучен";
                    doneBtn.disabled = true;
                    doneBtn.style.opacity = "1";
                    renderLessonsList();
                };
            }
        }
    }
    document.getElementById("lesson-progress").textContent = (lessonIndex + 1) + " / " + count;
    renderLessonBody();
}

/* Подсветка ключевых слов в тексте урока:
   - В русском тексте: латиница → <span class="kw"> (иностранные термины)
   - В японском тексте (если studyLang === "ja"): кандзи/хира/ката → <span class="kw-jp"> */
function highlightKeywords(text) {
    if (!text) return text;
    const en = text.replace(/\b[A-Za-z][A-Za-z'′\-]*\b/g, m => "<span class=\"kw\">" + m + "</span>");
    if (isJa()) {
        return en.replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]+/g, m => "<span class=\"kw-jp\">" + m + "</span>");
    }
    return en;
}

/* Оборачивает каждое слово в span.w внутри элемента (сохраняя вложенные теги, напр. kw) */
function wrapLineWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(tn => {
        if (!tn.textContent || !tn.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        tn.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(part));
                return;
            }
            const s = document.createElement("span");
            s.className = "w";
            s.textContent = part;
            frag.appendChild(s);
        });
        tn.parentNode.replaceChild(frag, tn);
    });
}

function renderLessonBody() {
    const lesson = lessonsData()[lessonIndex];
    if (!lesson) return;
    const body = document.getElementById("lesson-body");
    // Строки урока для озвучки: {el, lang, sents} — индекс строки живёт в кнопке data-u
    const units = [];
    const SPK = '<button class="tts-btn lesson-speak" data-u="__U__" title="Озвучить">🔊</button>';
    function line(innerHtml, lang, text) {
        const u = { lang: lang, sents: splitSentences(text) };
        const idx = units.push(u) - 1;
        return innerHtml.replace(/__U__/g, String(idx));
    }

    let html = '<div class="lesson-narrate-bar">' +
        '<button class="check-btn" id="lesson-play-btn">' + iconHTML("▶") + ' Слушать</button>' +
        '<button class="check-btn" id="lesson-pause-btn">' + iconHTML("⏸") + ' Пауза</button>' +
        '<button class="check-btn" id="lesson-all-btn">' + iconHTML("📋") + ' Всё сразу</button>' +
        '</div>';
    html += line('<div class="lesson-intro lesson-line">' + SPK + '<div class="lesson-line-text">' + highlightKeywords(lesson.intro) + "</div></div>", "ru", lesson.intro);
    const exLang = langTTS();
    lesson.sections.forEach(sec => {
        html += '<div class="lesson-section">' +
            line('<div class="lesson-sec-title lesson-line">' + SPK + '<div class="lesson-line-text">' + highlightKeywords(sec.heading) + "</div></div>", "ru", sec.heading);
        sec.paragraphs.forEach(p => {
            html += line('<div class="lesson-p lesson-line">' + SPK + '<div class="lesson-line-text">' + highlightKeywords(p) + "</div></div>", "ru", p);
        });
        if (sec.examples && sec.examples.length) {
            html += '<div class="lesson-examples">';
            sec.examples.forEach(ex => {
                html += '<div class="lesson-example">' +
                    line('<div class="lesson-en lesson-line">' + SPK + '<div class="lesson-line-text">' + ex[0] + "</div></div>", exLang, ex[0]) +
                    line('<div class="lesson-ru lesson-line">' + SPK + '<div class="lesson-line-text">' + highlightKeywords(ex[1]) + "</div></div>", "ru", ex[1]) +
                    "</div>";
            });
            html += "</div>";
        }
        html += "</div>";
    });
    html += '<div class="lesson-summary"><div class="lesson-sum-title">' + iconHTML("📌") + ' Запомните</div>';
    lesson.summary.forEach(sm => {
        html += line('<div class="lesson-sum-item lesson-line">' + SPK + '<div class="lesson-line-text">• ' + highlightKeywords(sm) + "</div></div>", "ru", sm);
    });
    html += "</div>";
    body.innerHTML = html;
    // Привязываем DOM-элементы строк: порядок .lesson-line в разметке совпадает с порядком units
    const lineEls = body.querySelectorAll(".lesson-line");
    units.forEach((u, i) => { u.el = lineEls[i] || null; });
    body.__lessonUnits = units;

    // Оборачиваем каждое слово строки в <span class="w"> для Apple-анимации
    body.querySelectorAll(".lesson-line-text").forEach(wrapLineWords);

    body.querySelectorAll(".lesson-speak").forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            lessonStep.stop();
            const u = units[parseInt(btn.getAttribute("data-u"), 10)];
            if (u && u.el) u.el.classList.add("visible");
            lessonStep.playSingle(u);
        };
    });

    lessonStep.attach(units, body);
    // Показываем первую строку и запускаем авто-показ
    if (units.length && units[0].el) units[0].el.classList.add("visible");
    setTimeout(() => lessonStep.start(), 400);

    // Урок без теста: «Я изучил» активируется после долистывания до конца
    const lesson2 = lessonsData()[lessonIndex];
    const doneBtn = document.getElementById("lesson-done-btn");
    if (doneBtn && lesson2 && !testForLesson(lesson2) && !state.lessonDone[lesson2.id]) {
        const enableDone = () => {
            doneBtn.disabled = false;
            doneBtn.style.opacity = "1";
            doneBtn.title = "";
        };
        const onScroll = () => {
            if (body.scrollTop + body.clientHeight >= body.scrollHeight - 60) {
                enableDone();
                body.removeEventListener("scroll", onScroll);
            }
        };
        body.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }
}

function lessonNav(dir) {
    Sound.click();
    const idx = lessonIndex + dir;
    if (idx < 0 || idx >= lessonsData().length) return;
    const data = lessonsData();
    if (idx > 0 && dir > 0 && !state.lessonDone[data[idx - 1].id]) {
        showInfoToast("Пройди предыдущий урок, чтобы открыть следующий");
        return;
    }
    openLesson(idx);
}

function startLessonsTest(lessonId) {
    const lesson = lessonsData().find(l => l.id === lessonId);
    if (!lesson) return;
    const test = testForLesson(lesson);
    if (!test || !test.questions || !test.questions.length) {
        alert("Тест по этому уроку пока недоступен");
        return;
    }
    // Рандом в тестах уроков: при каждом запуске (и «Пройти ещё раз») перемешиваются
    // и порядок вопросов, и варианты ответа внутри каждого вопроса — иначе тест
    // каждый раз шёл одной и той же заучиваемой последовательностью. correct —
    // индекс, поэтому после шаффла вариантов пересчитываем его под новый порядок.
    // Статичные данные из data/lessons не мутируем: shuffleArray уже даёт копию
    // списка вопросов, а варианты копируем через перемешанный список индексов.
    const questions = shuffleArray(test.questions).map(src => {
        const order = shuffleArray(src.options.map((_, i) => i));
        return {
            q: src.q,
            options: order.map(i => src.options[i]),
            correct: order.indexOf(src.correct),
            why: src.why
        };
    });
    LESSON_TEST = { lessonId: lesson.id, q: questions, i: 0, correct: 0, answered: false };
    document.getElementById("lesson-test-title").textContent = "ТЕСТ: " + lesson.title;
    showScreen("lesson-test-screen");
    updateTestProgress();
    questProgress("quiz1", 1);
    renderTestQuestion();
    Sound.click();
}

function updateTestProgress() {
    const total = LESSON_TEST.q.length;
    document.getElementById("test-fill").style.width = (LESSON_TEST.i / total * 100) + "%";
    document.getElementById("test-progress").textContent = "Вопрос " + (LESSON_TEST.i + 1) + " из " + total;
}

// Озвучка теста: пропуск «___» превращаем в паузу; язык определяем по кириллице
function testClean(text) {
    return String(text).replace(/_{3,}/g, ", ").replace(/\s+/g, " ").trim();
}
function testLang(text) {
    const s = String(text);
    if (/[\u0400-\u04FF]/.test(s)) return "ru";
    if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(s)) return "ja";
    return "en";
}
function speakTestText(raw) {
    if (!state.ttsEnabled) return;
    ttsSpeakSafe(testClean(raw), testLang(raw));
}

function renderTestQuestion() {
    const item = LESSON_TEST.q[LESSON_TEST.i];
    LESSON_TEST.answered = false;
    document.getElementById("test-card").innerHTML =
        '<div class="test-q"><button class="tts-btn test-speak" title="Озвучить вопрос">🔊</button><span>' + item.q + '</span></div><div class="test-options">' +
        item.options.map((opt, idx) => '<button class="test-option" data-idx="' + idx + '">' + opt + "</button>").join("") +
        '</div><div class="test-feedback"></div>';
    const qBtn = document.querySelector("#test-card .test-speak");
    if (qBtn) qBtn.onclick = () => speakTestText(item.q);
    document.querySelectorAll("#test-card .test-option").forEach(btn => {
        btn.onclick = () => answerTest(btn, parseInt(btn.getAttribute("data-idx"), 10));
    });
    // Вопрос произносится сам, как только появился на экране
    speakTestText(item.q);
}

function answerTest(btn, idx) {
    const item = LESSON_TEST.q[LESSON_TEST.i];
    // Повторный клик по варианту после ответа — просто озвучиваем его
    if (LESSON_TEST.answered) { speakTestText(item.options[idx]); return; }
    LESSON_TEST.answered = true;
    const fb = document.querySelector("#test-card .test-feedback");
    if (idx === item.correct) {
        LESSON_TEST.correct++;
        btn.classList.add("test-correct");
        Sound.correct();
    } else {
        btn.classList.add("test-wrong");
        document.querySelectorAll("#test-card .test-option")[item.correct].classList.add("test-correct");
        Sound.wrong();
    }
    // Выбранный вариант звучит сразу после выбора
    speakTestText(item.options[idx]);
    const last = LESSON_TEST.i >= LESSON_TEST.q.length - 1;
    fb.innerHTML = '<div class="test-why">💡 ' + item.why +
        ' <button class="tts-btn test-why-speak" title="Озвучить пояснение">🔊</button></div>' +
        (last ? '<button class="check-btn" id="test-finish-btn" onclick="renderTestResult()">Узнать результат</button>'
              : '<button class="next-btn" id="test-next-btn" onclick="nextTestQuestion()">Дальше ' + iconHTML("→") + '</button>');
    const whyBtn = fb.querySelector(".test-why-speak");
    if (whyBtn) whyBtn.onclick = (e) => { e.stopPropagation(); speakTestText(item.why); };
}

function nextTestQuestion() {
    LESSON_TEST.i++;
    updateTestProgress();
    renderTestQuestion();
    Sound.click();
}

function exitLessonTest() {
    lessonStep.stop();
    NARRATOR.stop();
    LESSON_TEST = null;
    // Возвращаемся на тот уровень уроков, с которого открыли тест
    renderLessonsTabs();
    renderLessonsList();
    showScreen("lessons-screen");
}

function renderTestResult() {
    const total = LESSON_TEST.q.length;
    const correct = LESSON_TEST.correct;
    const pct = Math.round(correct / total * 100);
    document.getElementById("test-fill").style.width = "100%";
    document.getElementById("test-progress").textContent = "Результат: " + pct + "%";
    const msg = pct >= 70 ? "Отлично ! Вы усвоили материал урока." : pct >= 50 ? "Неплохо, но стоит повторить урок." : "Повторите урок и попробуйте снова.";
    const emoji = pct >= 70 ? "🎉" : pct >= 50 ? "💪" : "📖";
    document.getElementById("test-card").innerHTML =
        '<div class="test-result"><div class="test-score">' + correct + " из " + total + '</div>' +
        '<div class="test-pct">' + pct + "%</div>" +
        '<div class="test-msg">' + msg + " " + emoji + '</div>' +
        '<div class="test-actions"><button class="check-btn" onclick="restartLessonsTest()">' + iconHTML("🔁") + ' Пройти ещё раз</button>' +
        '<button class="next-btn" onclick="exitLessonTest()">К урокам</button></div></div>';
    if (pct >= 70) { Sound.win(); markLessonDone(LESSON_TEST.lessonId); } else { Sound.gameover(); }
    // Реплика результата (фраза без эмодзи — она лежит в банке озвучки)
    speakTestText(msg.replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/gu, "").trim());
}

function restartLessonsTest() {
    startLessonsTest(LESSON_TEST.lessonId);
}


// Загрузочный экран из Intro.mp4: играется до конца или пропускается тапом,
    // затем вызывается cb (показ главного меню). Если видео недоступно — входим сразу.
    // Чёрный фон ролика делаем прозрачным альфа-ключом по яркости на canvas,
    // а не через mix-blend-mode: screen — на светлых обоях screen «просвечивал»
    // логотип фоном. Чёрное → alpha 0, яркое (сам логотип) → alpha 1.
    function startBootKeying(v, cv, isStopped) {
        let ctx = null;
        try { ctx = cv.getContext("2d", { willReadFrequently: true }); } catch (e) { }
        if (!ctx) return false;
        // WebM с настоящей альфой показываем напрямую: канвас-клеинг был
        // нужен только для MP4 (чёрный фон по яркости). Нативный ролик идёт
        // в своём разрешении — без пикселизации и без нагрузки на CPU.
        // iOS (WKWebView) может объявить VP9, но НЕ умеет альфу в WebM —
        // ролик пошёл бы чёрным прямоугольником. На iPhone/iPad оставляем
        // канвас-клеинг (он одинаково годится и для WebM, и для MP4).
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            /iPhone|iPad|iPod/.test(navigator.platform || "") ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const canWebM = !isIOS && typeof v.canPlayType === "function" && v.canPlayType('video/webm; codecs="vp9"');
        if (canWebM) {
            const bs0 = document.getElementById("boot-screen");
            if (bs0) bs0.classList.add("alpha-src");
            cv.style.display = "none";
            v.style.opacity = "";
            return false;
        }
        const S = 384;
        cv.width = S;
        cv.height = S;
        let last = 0;
        let failed = false;
        // Canvas «отравлен» (страница открыта по file://): читать пиксели нельзя.
        // Не оставляем сырой чёрный кадр — убираем канвас и показываем видео:
        // WebM с альфой — как есть, MP4 — через прежний screen-блендинг.
        const fallback = () => {
            failed = true;
            cv.style.display = "none";
            v.style.opacity = "";
            const bs = document.getElementById("boot-screen");
            if (bs && /\.webm(\?|#|$)/i.test(v.currentSrc || "")) bs.classList.add("alpha-src");
        };
        const tick = (ts) => {
            if (failed || isStopped()) return;
            requestAnimationFrame(tick);
            if (v.readyState < 2 || ts - last < 80) return;
            last = ts;
            try {
                ctx.clearRect(0, 0, S, S);
                ctx.drawImage(v, 0, 0, S, S);
                const id = ctx.getImageData(0, 0, S, S);
                const d = id.data;
                for (let i = 0; i < d.length; i += 4) {
                    let m = d[i] > d[i + 1] ? d[i] : d[i + 1];
                    if (d[i + 2] > m) m = d[i + 2];
                    if (m < 17) { d[i + 3] = 0; continue; }
                    let a = (m - 16) / 64;
                    if (a >= 1) { d[i + 3] = 255; continue; }
                    a = a * a * (3 - 2 * a);
                    d[i + 3] = (a * 255) | 0;
                }
                for (let y = 0; y < S; y++) {
                    for (let x = 0; x < S; x++) {
                        const i = (y * S + x) * 4;
                        if (!d[i + 3]) continue;
                        const edge = (x > 0 && !d[i - 1]) || (x < S - 1 && !d[i + 7]) ||
                            (y > 0 && !d[i - S * 4 + 3]) || (y < S - 1 && !d[i + S * 4 + 3]);
                        if (!edge) continue;
                        let m = d[i] > d[i + 1] ? d[i] : d[i + 1];
                        if (d[i + 2] > m) m = d[i + 2];
                        let r = 0, g = 0, b = 0, n = 0;
                        for (let oy = -1; oy <= 1; oy++) {
                            const yy = y + oy;
                            if (yy < 0 || yy >= S) continue;
                            for (let ox = -1; ox <= 1; ox++) {
                                if (!ox && !oy) continue;
                                const xx = x + ox;
                                if (xx < 0 || xx >= S) continue;
                                const j = (yy * S + xx) * 4;
                                if (d[j + 3] < 200) continue;
                                let mj = d[j] > d[j + 1] ? d[j] : d[j + 1];
                                if (d[j + 2] > mj) mj = d[j + 2];
                                if (mj <= m) continue;
                                r += d[j]; g += d[j + 1]; b += d[j + 2]; n++;
                            }
                        }
                        if (n) {
                            d[i] = (r / n) | 0;
                            d[i + 1] = (g / n) | 0;
                            d[i + 2] = (b / n) | 0;
                        }
                    }
                }
                ctx.putImageData(id, 0, 0);
            } catch (e) { fallback(); }
        };
        cv.style.display = "block";
        v.style.opacity = "0";
        requestAnimationFrame(tick);
        return true;
    }
    function playBootIntro(cb) {
        const bs = document.getElementById("boot-screen");
        const v = document.getElementById("boot-video");
        if (!bs || !v) return cb();
        let done = false;
        let stopKeys = false;
        let fading = false;
        let fadeStart = 0;
        // Логотип начинает гаснуть по opacity ещё во время игры ролика, чтобы
        // не было стоп-кадра: видео продолжает анимацию под затуханием.
        const beginFade = () => {
            if (fading) return;
            fading = true;
            fadeStart = performance.now();
            bs.classList.add("logo-out");
        };
        const finish = () => {
            if (done) return;
            done = true;
            // Если затухание ещё не началось (тап/ошибка/нет видео) — запускаем
            // его сейчас, но меню показываем только после полного исчезновения.
            if (!fading) beginFade();
            const wait = Math.max(0, 570 - (performance.now() - fadeStart));
            setTimeout(() => {
                stopKeys = true;
                try { v.pause(); } catch (e) {}
                try { cb(); } catch (e) {}
                // CSS-анимации меню часто успевают отыграть под заставкой, а у
                // #main-menu.screen.active они вообще отключены (animation:none).
                // Явно проигрываем волну появления после ухода заставки.
                try {
                    const shown = document.querySelector('.screen.active');
                    if (shown) {
                        shown.classList.remove('active');
                        void shown.offsetWidth;
                        shown.classList.add('active');
                        const sel = '.game-header,.logo-img,.greeting,.stats-box,.menu-level-bar,.level-box,.progress-tabs,.menu-btn,.welcome-title,.welcome-sub,#player-name,#start-btn';
                        const targets = [shown].concat([].slice.call(shown.querySelectorAll(sel))).slice(0, 24);
                        targets.forEach(function (el, i) {
                            try {
                                el.animate([
                                    { opacity: 0, transform: 'translateY(14px)' },
                                    { opacity: 1, transform: 'translateY(0)' }
                                ], { duration: 600, delay: Math.min(i * 35, 350), easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'backwards' });
                            } catch (e) {}
                        });
                    }
                } catch (e) {}
                // Снимаем «статичный фон» одновременно с boot-экраном:
                // bgFloat стартует с нулевой фазы уже под меню.
                const bg = document.getElementById("bg-inset");
                if (bg) bg.classList.remove("bg-static");
                bs.remove();
            }, wait);
        };
        // Старт затухания за ~0.6 с до конца ролика (fade .55s): к моменту
        // ended логотип уже прозрачен, стоп-кадра не видно.
        const watchFade = () => {
            if (done) return;
            requestAnimationFrame(watchFade);
            const d = v.duration;
            if (isFinite(d) && d > 0.8 && !fading && v.currentTime >= d - 0.62) beginFade();
        };
        requestAnimationFrame(watchFade);
        v.addEventListener("ended", finish, { once: true });
        v.addEventListener("error", finish, { once: true });
        bs.addEventListener("pointerdown", finish, { once: true });
        // Сначала фон и рамка, и только потом тяжёлое видео (12 МБ MP4 на iOS).
        const startVideo = () => {
            if (done) return;
            let src = 'VID/Intro_small.mp4';
            try {
                const probe = document.createElement('video');
                const webm = probe.canPlayType('video/webm; codecs="vp9"');
                if (webm === 'probably' || webm === 'maybe') src = 'VID/Intro_alpha.webm?v=20261593';
            } catch (e) {}
            v.src = src;
            v.load();
            v.muted = true;
            try { if (window.__bootBackdrop) window.__bootBackdrop(); } catch (e) {}
            const cv = document.getElementById("boot-canvas");
            try { if (cv) startBootKeying(v, cv, () => stopKeys); } catch (e) {}
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
            setTimeout(() => { if (!done && v.readyState < 2) finish(); }, 1200);
            setTimeout(finish, 2500);
        };
        let criticalLeft = 2, videoStarted = false;
        const kick = () => { if (videoStarted) return; videoStarted = true; startVideo(); };
        ["UI/BG_PIC_STR.webp?v=bgstr2", "UI/main-frame-v3.webp?v=frame5"].forEach((p) => {
            const im = new Image();
            im.onload = im.onerror = () => { if (--criticalLeft <= 0) kick(); };
            im.src = p;
        });
        setTimeout(kick, 3500);
    }

    // Картинки плашек и первого экрана догружаем ПОСЛЕ старта интерфейса:
    // preload в <head> отбирал полосу у CSS/JS, и обе версии стали грузиться дольше.
    let deferredPreloaded = false;
    function deferPreloadImages() {
        if (deferredPreloaded) return;
        deferredPreloaded = true;
        let ran = false;
        const run = () => {
            if (ran) return;
            ran = true;
            const paths = ["MASKOT/LOGO.webp", "MASKOT/MASKOT_18_cut.webp", "UI/extracted/activ_bottom.webp", "UI/extracted/bottom_trim.webp", "UI/Vipad_osnova.webp", "UI/ICON/MEDAL.webp", "UI/ICON/ZAMOK.webp", "UI/ICON/STAR.webp", "UI/ICON/TARGET.webp", "UI/ICON/FIRE.webp", "UI/ICON/DIAMOND.webp", "UI/ICON/KNIGA_BLUE.webp", "UI/ICON/MOLNIA.webp", "UI/ICON/GROMOFON'.webp", "UI/ICON/KUBOK.webp", "UI/ICON/KOLOKOL.webp", "UI/ICON/DEKA.webp", "UI/ICON/GALKA.webp", "UI/ICON/LAMPA.webp", "UI/ICON/PALEC.webp", "UI/ICON/TRASH.webp", "UI/ICON/RECYCLE.webp", "UI/ICON/PALITRA.webp"];
            paths.forEach(p => { try { const im = new Image(); im.src = p; } catch (e) {} });
        };
        if (document.readyState === "complete") run();
        else { window.addEventListener("load", run, { once: true }); setTimeout(run, 2500); }
    }

    // Кеш картинок — прогрессивное улучшение: если SW недоступен, всё работает как раньше.
    try {
        if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
            window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
        }
    } catch (e) {}

    document.addEventListener("DOMContentLoaded", () => {
        const hasData = loadData();
        try { CloudSync.boot(hasData); } catch (e) {}
        rebuildActiveLanguage();
        migrateProgressKeys();
        seedAchievements();
        initDaily();
        refreshFeatureUnlocks(true);
        TG.init();

        // Первый жест (тап/клик) разблокирует AudioContext в WebView/браузере
        const unlockSender = () => { Sound.unlockAudio(); };
        document.addEventListener("pointerdown", unlockSender, { once: true });
        document.addEventListener("keydown", unlockSender, { once: true });

        const enter = () => {
            // hasData снимался ДО boot: на втором устройстве прогресс из облака
            // уже применён (имя подтянулось), а hasData ещё false — из-за этого
            // заново просили имя. Имя есть = игра есть: входим сразу в меню.
            if (state.playerName) {
                showMainMenu();
            } else {
                showScreen("welcome-screen");
            }
        };
        // Интро играет при каждой загрузке приложения; по окончании или по тапу
        // переходим в меню. Если видео недоступно — входим без ожидания.
        playBootIntro(enter);
        deferPreloadImages();

    refreshUserWords();

    applyTheme("plush");
    document.body.dataset.back = "b12";
    document.body.dataset.wordbg = "w1";
    initRadioStations();
    initSfxVolume();
    initFancySelects();
    MIC.init();

    // Скрытая клавиатурная последовательность на главном меню (код зашифрован XOR-маской)
    const _ck = 7;
    const _cs = "526766";
    const _ct = _cs.replace(/./g, ch => String.fromCharCode(ch.charCodeAt(0) ^ _ck));
    let cheatBuf = "";
    document.addEventListener("keydown", (e) => {
        const el = document.activeElement;
        const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
        if (typing || currentScreen !== "main-menu") { cheatBuf = ""; return; }
        if (e.key >= "0" && e.key <= "9") {
            cheatBuf += e.key;
            if (cheatBuf.length > _ct.length) cheatBuf = cheatBuf.slice(-_ct.length);
            if (cheatBuf === _ct) {
                cheatBuf = "";
                cheatMaxProgress();
            }
        } else {
            cheatBuf = "";
        }
    });

    // Мобильный чит-код: 5 тапов по 日本語 + 3 тапа по EN подряд.
    // Как и клавиатурный, хранится XOR-маской, а не открытой последовательностью.
    const _mk = 13;
    const _ms = "GGGGGHHH"; // "JJJJJEEE" ^ 13
    const _mt = _ms.replace(/./g, ch => String.fromCharCode(ch.charCodeAt(0) ^ _mk));
    let tapCheatBuf = "";
    document.addEventListener("click", (e) => {
        const pick = e.target && e.target.closest
            ? e.target.closest("#lang-pick-ja, #lang-pick-en") : null;
        if (!pick || currentScreen !== "main-menu") { tapCheatBuf = ""; return; }
        tapCheatBuf += pick.id === "lang-pick-ja" ? "J" : "E";
        if (tapCheatBuf.length > _mt.length) tapCheatBuf = tapCheatBuf.slice(-_mt.length);
        if (tapCheatBuf === _mt) {
            tapCheatBuf = "";
            cheatMaxProgress();
        }
    }, true);

    document.getElementById("player-name").addEventListener("keydown", (e) => {
        if (e.repeat) return;
        if (e.key === "Enter") startGame();
        else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) Sound.type();
    });

    // Enter в форме «Мои слова» добавляет слово
    ["uw-en", "uw-ru", "uw-note"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { e.preventDefault(); addUserWord(); }
        });
    });
    
    document.getElementById("answer-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (document.getElementById("check-btn").classList.contains("hidden")) {
                nextWord();
            } else {
                checkAnswer();
            }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !e.repeat) {
            // Печатаемый символ — мягкий «плинк» (повтор при зажатой клавише отключён)
            Sound.type();
        }
    });

    // Enter срабатывает, даже когда поле ввода уже заблокировано после ответа:
    // подтверждает ответ или нажимает видимую кнопку «Далее» / «Следующая карта»
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || e.repeat) return;
        const fromInput = e.target === document.getElementById("answer-input");
        const gs = document.getElementById("game-screen");
        if (!gs || gs.classList.contains("hidden")) return;

        const inputArea = document.getElementById("input-area");
        if (inputArea && !inputArea.classList.contains("hidden")) {
            const checkBtn = document.getElementById("check-btn");
            const nextBtn = document.getElementById("next-btn");
            if (checkBtn && !checkBtn.classList.contains("hidden")) {
                if (!fromInput) { e.preventDefault(); checkAnswer(); }
                return;
            }
            if (!fromInput) { e.preventDefault(); nextWord(); }
            return;
        }
        const battleNext = document.getElementById("battle-next");
        if (battleNext && !battleNext.classList.contains("hidden")) {
            if (!fromInput) { e.preventDefault(); nextWord(); }
            return;
        }
        const cardsNext = document.getElementById("cards-next");
        if (cardsNext && !cardsNext.classList.contains("hidden")) {
            if (!fromInput) { e.preventDefault(); nextWord(); }
            return;
        }
    });

    // Звук при наведении на любые кнопки (включая динамические карты-варианты).
    // Звучит только один раз при входе на кнопку, а не при движении по её детям.
    let lastHoverBtn = null;
    document.addEventListener("mouseover", (e) => {
        const btn = e.target.closest("button");
        if (btn && btn !== lastHoverBtn) {
            lastHoverBtn = btn;
            Sound.hover();
        }
    });
    document.addEventListener("mouseleave", () => { lastHoverBtn = null; });

    // Звук нажатия на любых кнопках — единый глобальный источник:
    // native <button>, [role=button] и элементы с onclick-свойством
    // (div-кнопки вроде строк уроков). Locked-кнопки молчат — как и
    // анимация нажатия, их клик перехватывает подсказка о блокировке.
    document.addEventListener("click", (e) => {
        let el = e.target;
        while (el && el.nodeType === 1) {
            const role = el.getAttribute ? el.getAttribute("role") : null;
            if (el.tagName === "BUTTON" || role === "button" || typeof el.onclick === "function") break;
            el = el.parentElement;
        }
        if (!el || el.nodeType !== 1 || el.classList.contains("locked")) return;
        Sound.clickFromGesture();
    }, true);

    // Перемещение фокуса по «плиткам» (карточкам) в указанном направлении.
    // Возвращает true, если фокус удалось перекинуть на соседнюю карточку.
    function focusTile(target) {
        target.focus();
        Sound.hover();
        if (target.scrollIntoView) target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    function pickTargetDirection(group, key) {
        if (!group.length) return false;
        const cur = document.activeElement;
        if (group.indexOf(cur) === -1) return false;
        const onScreen = group.filter(el =>
            !el.disabled &&
            el.offsetParent !== null &&
            getComputedStyle(el).display !== "none"
        );
        if (onScreen.length <= 1) return false;
        const rect = (el) => {
            const r = el.getBoundingClientRect();
            return { el, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
        };
        const all = onScreen.map(rect);
        const curR = rect(cur);
        const rowBand = Math.max(34, Math.min(curR.h, ...all.map(v => v.h)) * 0.45);
        if (key === "ArrowLeft" || key === "ArrowRight") {
            const row = all
                .filter(v => Math.abs(v.y - curR.y) < rowBand)
                .sort((a, b) => a.x - b.x);
            const i = row.findIndex(v => v.el === cur);
            if (i === -1) return false;
            const j = key === "ArrowRight" ? i + 1 : i - 1;
            if (j < 0 || j >= row.length) return false;
            focusTile(row[j].el);
            return true;
        }
        const wanted = all.filter(v =>
            v.el !== cur &&
            (key === "ArrowDown" ? v.y > curR.y : v.y < curR.y)
        );
        if (wanted.length === 0) return false;
        const best = wanted.sort((a, b) =>
            (Math.abs(a.x - curR.x) - Math.abs(b.x - curR.x)) ||
            (Math.abs(a.y - curR.y) - Math.abs(b.y - curR.y))
        )[0];
        focusTile(best.el);
        return true;
    }

    // Стрелки — перемещение фокуса между кнопками активного экрана (полностью без мыши),
    // Enter активирует выбранную кнопку. В полях ввода стрелки не перехватываются.
    document.addEventListener("keydown", (e) => {
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        const arrowMap = {
            "ArrowRight": 1,
            "ArrowDown": 1,
            "ArrowLeft": -1,
            "ArrowUp": -1
        };
        const delta = arrowMap[e.key];
        if (delta) {
            // В режимах выбора карточками стрелки ходят строго по карточкам:
            // целевая никогда не «слетает» на служебные кнопки.
            if (state.playMode === "quiz" || state.playMode === "cards") {
                const group = state.playMode === "quiz"
                    ? Array.from(document.querySelectorAll("#options .option-card"))
                    : Array.from(document.querySelectorAll("#cards-grid .cards-word:not(.cards-drag-ghost)"));
                if (pickTargetDirection(group, e.key)) {
                    e.preventDefault();
                    return;
                }
            }
            const screen = document.querySelector(".screen:not(.hidden)");
            if (!screen) return;
            const focusables = Array.from(
                screen.querySelectorAll("button, input, [tabindex]")
            ).filter(el =>
                !el.disabled &&
                !el.classList.contains("hidden") &&
                el.offsetParent !== null &&
                getComputedStyle(el).display !== "none"
            );
            if (focusables.length === 0) return;
            const current = document.activeElement;
            let idx = focusables.indexOf(current);
            if (idx === -1) idx = delta > 0 ? -1 : focusables.length;
            idx = (idx + delta + focusables.length) % focusables.length;
            e.preventDefault();
            const target = focusables[idx];
            target.focus();
            Sound.hover();
            if (target.scrollIntoView) target.scrollIntoView({ block: "nearest", inline: "nearest" });
            return;
        }
        if (e.key === "Enter") {
            const el = document.activeElement;
            if (!el || el === document.body) return;
            if (el.tagName !== "BUTTON" && el.tagName !== "INPUT" && e.target === el) {
                e.preventDefault();
                el.click();
            }
        }
    });

    // Быстрые клавиши: буквы A-F в «5 к 1», цифры 1-9 в карточках
    document.addEventListener("keydown", (e) => {
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        const gameVisible = document.getElementById("game-screen") &&
            !document.getElementById("game-screen").classList.contains("hidden");
        if (!gameVisible) return;
        if (state.playMode === "quiz") {
            const idx = "abcdef".indexOf(e.key.toLowerCase());
            const opts = document.querySelectorAll("#options .option-card");
            if (idx >= 0 && idx < opts.length && !opts[idx].disabled) {
                opts[idx].click();
            }
        } else if (state.playMode === "cards") {
            const idx = "0123456789".indexOf(e.key);
            if (idx >= 0) {
                const cards = document.querySelectorAll("#cards-grid .cards-word:not(.cards-drag-ghost):not(:disabled)");
                if (idx < cards.length) cards[idx].click();
            }
        }
    });
});


/* === Анализатор мышью: наводишь — подсвечивается сам элемент и все его родители
   разноцветными рамками. КЛИКНИ по подложке — выведется весь стек слоёв в этой
   точке (включая pointer-events:none и ::before/::after) с их фонами.
   F10 — включить/выключить. Клик по панели — скопировать. */
(function () {
    let chip = null;
    let hls = [];
    let lastEl = null;
    // По умолчанию инспектор выключен: в предпросмотре (?tg=0) он больше
    // не закрывает карточки. F10 или window.startInspector() включают его.
    let on = false;

    const HUE = ["#ff2d55", "#ff9aa2", "#ffd76a", "#6abaff", "#7fe3a0", "#c18bff", "#4adbc8", "#ffb347"];
    const STY = ["3px solid", "2px dashed", "2px dotted", "2px solid", "1px dashed", "1px dotted", "1px solid", "1px dashed"];

    function elementName(el) {
        if (!el || el === document) return "document";
        let s = (el.tagName || el.nodeName || "").toLowerCase();
        if (el.id) s += "#" + el.id;
        let cls = "";
        if (typeof el.className === "string") cls = el.className;
        else if (el.classList) cls = Array.from(el.classList).join(" ");
        cls = cls.trim();
        if (cls) s += "." + cls.split(/\s+/).join(".");
        return s;
    }

    function bgFromCS(cs) {
        const parts = [];
        if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") {
            const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/);
            let alpha = 1;
            if (m) {
                const v = m[1].split(",").map(function (x) { return parseFloat(x); });
                alpha = v.length === 4 ? v[3] : 1;
            }
            parts.push((alpha >= 0.45 ? "⚠ bg:" : "bg:") + cs.backgroundColor);
        }
        if (cs.backgroundImage && cs.backgroundImage !== "none") {
            parts.push("bgimg");
        }
        return parts.length ? " [" + parts.join(", ") + "]" : "";
    }

    function bgInfo(el, cs) {
        if (el === document || el === document.documentElement) return "";
        return bgFromCS(cs || getComputedStyle(el));
    }

    function pseudoInfo(el) {
        const out = [];
        ["::before", "::after"].forEach(function (ps) {
            const cs = getComputedStyle(el, ps);
            if (cs && cs.content && cs.content !== "none") {
                out.push(ps + bgFromCS(cs));
            }
        });
        return out;
    }

    function ensureLayer() {
        if (chip && document.body.contains(chip) && hls.length) return;
        if (!chip || !document.body.contains(chip)) {
            chip = document.createElement("div");
            chip.id = "inspector-chip";
            chip.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:2147483000;" +
                "background:#0d0618;color:#ffe4f2;border:2px solid #a066ff;padding:6px 10px;" +
                "font:12px/1.5 monospace;max-width:min(92vw, 640px);word-break:break-all;" +
                "pointer-events:auto;cursor:text;user-select:text;-webkit-user-select:text;" +
                "box-shadow:0 0 14px rgba(168,102,255,.35);white-space:pre-wrap;max-height:38vh;overflow-y:auto;";
            chip.style.paddingRight = "32px";
            document.body.appendChild(chip);
            chip.addEventListener("click", function () {
                const first = (chip.textContent || "").split("\n").find(function (l) { return l && l.indexOf("\u25B6") === 0; });
                const out = first ? first.replace(/\u25B6 /, "") : (chip.textContent || "").trim();
                const done = function () { setChipContent("copied ✓ " + out); };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(out).then(done).catch(done);
                } else {
                    const ta = document.createElement("textarea");
                    ta.value = out;
                    ta.style.position = "fixed";
                    ta.style.opacity = "0";
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand("copy"); } catch (e) {}
                    ta.remove();
                    done();
                }
            });
        }
        if (!hls.length) {
            for (let i = 0; i < HUE.length; i++) {
                const d = document.createElement("div");
                d.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147482900;" +
                    "pointer-events:none;box-sizing:border-box;";
                d.style.border = STY[i] + " " + HUE[i];
d.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.15), 0 0 18px " + HUE[i] + "66";
                d.style.background = "transparent";
                document.body.appendChild(d);
                hls.push(d);
            }
        }
    }

    function placeHls(el) {
        ensureLayer();
        let n = el;
        for (let i = 0; i < hls.length; i++) {
            const box = hls[i];
            if (!n) { box.style.display = "none"; continue; }
            const r = n.getBoundingClientRect();
            if (!r.width && !r.height) {
                box.style.display = "none";
            } else {
                box.style.display = "block";
                box.style.top = (r.top - 2) + "px";
                box.style.left = (r.left - 2) + "px";
                box.style.width = (r.width + 4) + "px";
                box.style.height = (r.height + 4) + "px";
            }
            n = n.parentElement;
        }
    }

    // Текст панели + кнопка закрытия. textContent сбрасывает дочерние узлы,
    // поэтому кнопку добавляем заново после каждой смены текста.
    function setChipContent(text) {
        if (!chip) return;
        chip.textContent = text;
        const close = document.createElement("button");
        close.type = "button";
        close.textContent = "\u00d7";
        close.title = "Скрыть инспектор (F10)";
        close.style.cssText = "position:absolute;top:2px;right:4px;width:22px;height:22px;" +
            "display:grid;place-items:center;padding:0;margin:0;cursor:pointer;" +
            "background:#3a2a6b;color:#ffe4f2;border:1px solid #a066ff;border-radius:6px;" +
            "font:14px/1 monospace;";
        close.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            setOn(false);
        });
        chip.appendChild(close);
    }

    function hover(ev) {
        const el = ev.target;
        if (!el) return;
        // Панель не инспектируем саму себя: иначе она мигает при наведении.
        if (chip && chip.contains(el)) return;
        lastEl = el;
        ensureLayer();
        placeHls(el);
        const lines = [];
        let depth = 0;
        for (let n = el; n; n = n.parentElement) {
            const r = n.getBoundingClientRect();
            const rectTxt = (r.width && r.height) ? Math.round(r.width) + "x" + Math.round(r.height) : "";
            const ind = depth === 0 ? "\u25B6 " : "    ".repeat(Math.min(depth, 12));
            lines.push(ind + elementName(n) + (rectTxt ? " — " + rectTxt : "") + bgInfo(n));
            pseudoInfo(n).forEach(function (p) { lines.push(ind + "      " + p); });
            depth++;
            if (n === document.documentElement) break;
        }
        setChipContent("hovered (элемент и все родители):\n" + lines.join("\n"));
    }

    function clickInspect(ev) {
        if (!chip) ensureLayer();
        // Клик по самой панели — это копирование/закрытие, а не инспекция.
        if (chip && chip.contains(ev.target)) return;
        const x = ev.clientX;
        const y = ev.clientY;
        let stack = [];
        try { stack = document.elementsFromPoint(x, y) || []; } catch (e) {}
        const lines = ["CLICK @" + x + "," + y + " | theme=" + (document.body.getAttribute("data-theme") || "classic") + " | tg=" + (document.body.classList.contains("tg-mini-app") ? "on" : "off") + " — краска сверху вниз:"];
        for (let i = stack.length - 1; i >= 0; i--) {
            const el = stack[i];
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            const rectTxt = (r.width && r.height) ? Math.round(r.width) + "x" + Math.round(r.height) : "";
            lines.push("  " + elementName(el) + (rectTxt ? " — " + rectTxt : "") + bgInfo(el, cs));
            pseudoInfo(el).forEach(function (p) { lines.push("      " + p); });
        }
        setChipContent(lines.join("\n"));
        lastEl = stack.length ? stack[0] : null;
        if (lastEl) placeHls(lastEl);
    }

    function setOn(v) {
        v = !!v;
        if (v === on) return;
        on = v;
        if (on) {
            ensureLayer();
            document.addEventListener("mouseover", hover, true);
            document.addEventListener("click", clickInspect, true);
            document.body.setAttribute("data-inspector", "on");
        } else {
            document.removeEventListener("mouseover", hover, true);
            document.removeEventListener("click", clickInspect, true);
            document.body.removeAttribute("data-inspector");
            if (chip) { chip.remove(); chip = null; }
            hls.forEach(function (d) { d.remove(); });
            hls = [];
            lastEl = null;
        }
    }

    document.addEventListener("scroll", function () { if (lastEl) placeHls(lastEl); }, true);
    window.addEventListener("resize", function () { if (lastEl) placeHls(lastEl); });
    document.addEventListener("keydown", function (e) { if (e.key === "F10") { e.preventDefault(); setOn(!on); } });
    window.startInspector = function () { setOn(true); };
    window.stopInspector = function () { setOn(false); };
    // Одна кнопка в предпросмотре скрывает/показывает всю отладку:
    // инспектор с рамками и кнопку «СЛОИ».
    window.setDebugUiVisible = function (v) {
        setOn(!!v);
        if (typeof window.setLayerDebugVisible === "function") {
            window.setLayerDebugVisible(!!v);
        }
        if (typeof window.setProbeDebugVisible === "function") {
            window.setProbeDebugVisible(!!v);
        }
    };
document.addEventListener("DOMContentLoaded", function () {
    // Автозапуск только по явному ?debug=1 / ?inspect=1. Обычный tg=0
    // остаётся чистым, чтобы карточки было видно без отладочных панелей.
    if (/[?&#](debug|inspect)=1([&#]|$)/.test(location.href)) setOn(true);
});
})();


/* ==== AUTO-PROBE podlozhki: big background plates detector (no clicks needed) ==== */
(function () {
    var iv = null, box = null, data = '';
    // Отчёт AUTO-PROBE по умолчанию не показываем: в предпросмотре он
    // закрывал карточки. Включается общей кнопкой «Отладка» или ?debug=1.
    var visible = /[?&#](debug|inspect)=1([&#]|$)/.test(location.href);
    function selOf(el) {
        try {
            var s = el.tagName.toLowerCase();
            if (el.id) s += '#' + el.id;
            if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
            return s;
        } catch (e) { return '?' }
    }
    function token(bg) { if (!bg || bg === 'none') return 'none'; return bg.indexOf('gradient') >= 0 ? 'gradient' : 'image'; }
    function alphaOf(c) { var m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return 1; var a = m[1].split(','); return parseFloat(a.length > 3 ? a[3] : 1); }
    function scan() {
        var els = [];
        try { els = [].slice.call(document.querySelectorAll('*')); } catch (e) {}
        els.push(document.body);
        els.push(document.documentElement);
        var vw = window.innerWidth || 1, vh = window.innerHeight || 1, full = vw * vh;
        var hits = [], checked = 0;
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var s = selOf(el);
            if (el === box || /inspector/.test(s)) continue;
            var r = null;
            try { r = el.getBoundingClientRect(); if (!r.width || !r.height) r = null; } catch (e) { r = null; }
            if (!r) continue;
            var cs = null;
            try { cs = getComputedStyle(el); } catch (e) { cs = null; }
            if (!cs) continue;
            if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
            var area = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
            var frac = area / full;
            checked++;
            if (frac < 0.12) continue;
            var paint = alphaOf(cs.backgroundColor) > 0 || token(cs.backgroundImage) !== 'none';
            var side = '';
            var col = 'transparent', img = 'none', z = cs.zIndex, pos = cs.position, op = cs.opacity;
            if (paint) { side = 'el'; col = cs.backgroundColor; img = token(cs.backgroundImage); }
            else {
                try {
                    var cb = getComputedStyle(el, '::before');
                    if (cb && cb.content !== 'none' && cb.content !== '' && token(cb.backgroundImage) !== 'none') {
                        side = '::before'; img = token(cb.backgroundImage); col = cb.backgroundColor;
                    }
                } catch (e) {}
                if (!side) {
                    try {
                        var ca = getComputedStyle(el, '::after');
                        if (ca && ca.content !== 'none' && ca.content !== '' && token(ca.backgroundImage) !== 'none') {
                            side = '::after'; img = token(ca.backgroundImage); col = ca.backgroundColor;
                        }
                    } catch (e) {}
                }
            }
            if (!side) continue;
            hits.push({ s: s, side: side, pos: pos, z: z, op: op, col: col, img: img,
                rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
                pct: Math.round(frac * 100) });
        }
        var L = ['AUTO-PROBE podlozhki: checked=' + checked + ' elements'];
        if (!hits.length) L.push('>> large BACKGROUND PLATES (>=12% of screen): NOT FOUND');
        else {
            L.push('>> FOUND ' + hits.length + ' large bg element(s):');
            for (var k = 0; k < hits.length; k++) {
                var h = hits[k];
                L.push('  ' + (k + 1) + '. ' + h.s + h.side);
                L.push('     pos=' + h.pos + ' z=' + h.z + ' op=' + h.op + ' cover=' + h.pct + '%');
                L.push('     bgcolor=' + h.col + '  bgimg=' + h.img);
                L.push('     rect=' + h.rect.join(','));
            }
        }
        data = L.join('\n');
        if (typeof console !== 'undefined' && console.info) console.info('[auto-probe]\n' + data);
        show();
        return data;
    }
    function show() {
        if (!visible) {
            if (box) box.style.display = 'none';
            return;
        }
        if (!box) {
            box = document.createElement('div');
            box.id = 'auto-probe-box';
            box.style.cssText = 'all:initial;position:fixed;top:8px;right:8px;max-width:620px;max-height:75vh;overflow:auto;background:rgba(12,8,20,.96);color:#ffdff2;border:2px solid #f790b0;border-radius:10px;padding:8px 10px;font:12px/1.5 Consolas,monospace;z-index:2147483646;white-space:pre-wrap;text-align:left;user-select:text;box-shadow:0 12px 34px rgba(0,0,0,.75)';
            var br = document.createElement('div');
            br.style.cssText = 'margin-bottom:6px;text-align:right';
            var cb = document.createElement('button');
            cb.textContent = 'copy'; cb.onclick = function () { var t = box.querySelector('pre'); if (t) { var r = document.createRange(); r.selectNodeContents(t); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); try { document.execCommand('copy'); } catch (e) {} } };
            var hb = document.createElement('button');
            hb.textContent = 'hide'; hb.onclick = function () { box.style.display = 'none'; };
            br.appendChild(cb); br.appendChild(hb);
            var pre = document.createElement('pre');
            pre.style.cssText = 'margin:0;font:inherit;white-space:pre-wrap;user-select:text';
            box.appendChild(br); box.appendChild(pre);
            (document.body || document.documentElement).appendChild(box);
        }
        box.style.display = 'block';
        var pre = box.querySelector('pre');
        pre.textContent = data;
        window.__PROBE_REPORT = data;
    }
    function run() { try { scan(); } catch (e) { if (window.console && console.error) console.error('[auto-probe]', e); } }

    // Общий выключатель отчёта: true — пересканировать и показать,
    // false — сразу спрятать панель.
    window.setProbeDebugVisible = function (v) {
        visible = !!v;
        if (!visible) {
            if (box) box.style.display = 'none';
            return;
        }
        run();
    };

    if (/[?&#]tg=0([&#]|$)/.test(location.href)) {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 60); });
        setTimeout(run, 900);
    }
    window.probePodlozhka = run;
})();

/* ==== СЛОИ: меню диагностики — покажет слои под кнопкой, каждый можно спрятать ==== */
(function () {
    var btn = null, box = null, sty = null, pre = null, hidden = [], last = null;

    var RULES = {
        body: 'body{background-image:none!important;background-color:#0f0c1b!important}',
        panel: '.panel,.menu-panel{background:transparent!important;background-image:none!important}',
        pshadow: '.panel,.menu-panel{box-shadow:none!important}',
        frame: '.frame-overlay{display:none!important}',
        boot: '#boot-screen{display:none!important}',
        btns: '.menu-btn,.stats-box,.lang-pick,.quiz-option,.lesson-btn,button{background-image:none!important;background-color:transparent!important}',
        screens: '.screen{background-image:none!important;background-color:transparent!important}'
    };
    var LABELS = {
        body: 'Фон body (градиент)',
        panel: 'Панель: заливка',
        pshadow: 'Панель: тень',
        frame: 'Рамка frame-overlay',
        boot: 'Boot-экран (интро)',
        btns: 'Кнопки: заливка',
        screens: 'Экраны .screen: заливка'
    };
    var on = {};
    for (var kk in RULES) on[kk] = false;

    function applyRules() {
        if (!sty) return;
        var s = '';
        for (var k2 in RULES) if (on[k2]) s += RULES[k2];
        sty.textContent = s;
    }

    function nm(el) {
        try {
            var s = (el.tagName || "").toLowerCase();
            if (el.id) s += '#' + el.id;
            var c = "";
            if (typeof el.className === "string") c = el.className;
            else if (el.classList) c = Array.prototype.join.call(el.classList, " ");
            c = c.trim();
            if (c) s += '.' + c.split(/\s+/).join('.');
            return s;
        } catch (e) { return '?' }
    }

    function info(el) {
        var cs;
        try { cs = getComputedStyle(el); } catch (e) { return ''; }
        var out = [];
        var bg = cs.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') out.push('bg=' + bg);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') out.push('bgimg');
        if (cs.borderTopWidth !== '0px' && cs.borderTopStyle !== 'none') out.push('border=' + cs.borderTopWidth + ' ' + cs.borderTopColor);
        if (cs.boxShadow !== 'none') out.push('shadow');
        if (cs.position && cs.position !== 'static') out.push('pos=' + cs.position);
        if (cs.zIndex && cs.zIndex !== 'auto') out.push('z=' + cs.zIndex);
        if (cs.pointerEvents === 'none') out.push('pe=none');
        return out.length ? out.join(' ') : '';
    }

    function gather(x, y) {
        var stack = [];
        try { stack = document.elementsFromPoint(x, y) || []; } catch (e) {}
        var rows = [];
        for (var i = stack.length - 1; i >= 0; i--) rows.push({ el: stack[i], kind: 'auto' });
        var extra = [];
        var all = document.querySelectorAll('div,section,main,header,footer,nav,ul');
        for (var j = 0; j < all.length; j++) {
            var el = all[j];
            var r;
            try { r = el.getBoundingClientRect(); } catch (e) { continue; }
            if (!r.width || !r.height) continue;
            if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
            var cs = getComputedStyle(el);
            var z = parseInt(cs.zIndex, 10) || 0;
            if (z < 1000 && cs.pointerEvents !== 'none') continue;
            var already = false;
            for (var q = 0; q < rows.length; q++) if (rows[q].el === el) { already = true; break; }
            if (!already) extra.push({ el: el, kind: 'decor' });
        }
        extra.sort(function (a, b) { return (parseInt(getComputedStyle(b.el).zIndex, 10) || 0) - (parseInt(getComputedStyle(a.el).zIndex, 10) || 0); });
        return rows.concat(extra);
    }

    function render(x, y) {
        if (!pre) return;
        var rows = gather(x, y);
        var L = [];
        for (var i = 0; i < rows.length; i++) {
            var it = rows[i];
            var z = '?';
            try { z = getComputedStyle(it.el).zIndex; } catch (e) {}
            var tag = it.kind === 'decor' ? '[' + (z || '?') + ' decor] ' : '';
            L.push(tag + nm(it.el) + (info(it.el) ? '  ::  ' + info(it.el) : ''));
        }
        pre.textContent = L.join('\n');
    }

    function buildUi() {
        btn = document.createElement('button');
        btn.id = 'layer-menu-btn';
        btn.textContent = 'СЛОИ';
        btn.style.cssText = 'all:initial;position:fixed;bottom:14px;left:14px;z-index:2147483647;font:12px/1 Consolas,monospace;color:#ffdff2;background:#6b2a4a;border:2px solid #ff9aa2;border-radius:8px;padding:7px 12px;cursor:pointer;box-sizing:border-box;display:none';
        (document.body || document.documentElement).appendChild(btn);

        box = document.createElement('div');
        box.id = 'layer-menu-box';
        box.style.cssText = 'all:initial;position:fixed;bottom:54px;left:14px;max-width:570px;max-height:72vh;overflow:auto;background:rgba(12,8,20,.96);color:#ffdff2;border:2px solid #6abaff;border-radius:10px;padding:8px 10px;z-index:2147483646;font:12px/1.55 Consolas,monospace;box-shadow:0 12px 34px rgba(0,0,0,.75);display:none';
        var head = document.createElement('div');
        head.style.cssText = 'margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:8px';
        var ttl = document.createElement('b');
        ttl.textContent = 'СЛОИ под мышью · галочка = спрятать';
        var nbtn = document.createElement('button');
        nbtn.textContent = 'сброс';
        var cbtn = document.createElement('button');
        cbtn.textContent = '✕';
        nbtn.addEventListener('click', function () {
            for (var i = 0; i < hidden.length; i++) { try { var e2 = hidden[i]; e2.style.removeProperty('display'); } catch (e3) {} }
            hidden = [];
            for (var k3 in on) on[k3] = false;
            applyRules();
            var cbs = box.querySelectorAll('input[type=checkbox]');
            for (var j = 0; j < cbs.length; j++) cbs[j].checked = false;
            render(last ? last.x : 2, last ? last.y : 2);
        });
        cbtn.addEventListener('click', function () { box.style.display = 'none'; });
        head.appendChild(ttl); head.appendChild(nbtn); head.appendChild(cbtn);
        box.appendChild(head);

        var tg = document.createElement('div');
        tg.style.cssText = 'margin-bottom:6px';
        for (var k in RULES) {
            if (!Object.prototype.hasOwnProperty.call(RULES, k)) continue;
            var lab = document.createElement('label');
            lab.style.cssText = 'display:flex;align-items:center;gap:5px;cursor:pointer;margin:2px 0';
            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.addEventListener('change', (function (key) {
                return function () { on[key] = this.checked; applyRules(); };
            })(k));
            var sp = document.createElement('span');
            sp.textContent = LABELS[k];
            lab.appendChild(cb); lab.appendChild(sp);
            tg.appendChild(lab);
        }
        box.appendChild(tg);

        pre = document.createElement('pre');
        pre.style.cssText = 'margin:6px 0 0;white-space:pre-wrap;user-select:text;border-top:1px solid #4a2a4a;padding-top:6px';
        box.appendChild(pre);
        (document.body || document.documentElement).appendChild(box);

        document.addEventListener('mousemove', function (e) {
            if (box.style.display === 'none') return;
            last = { x: e.clientX, y: e.clientY };
            render(e.clientX, e.clientY);
        }, true);

        box.addEventListener('click', function (e) {
            var t = e.target;
            if (!t || t.tagName !== 'PRE') return;
            var line = pre.textContent.split('\n')[0]; // клик по строке не различаем — прячем первый снизу элемент
            for (var q = 0; q < hidden.length; q++) { try { hidden[q].style.removeProperty('display'); } catch (e2) {} }
            hidden = [];
            if (last) {
                var rows = gather(last.x, last.y);
                if (rows.length) {
                    var el = rows[0].el;
                    try { el.style.setProperty('display', 'none', 'important'); hidden.push(el); } catch (e3) {}
                }
            }
            setTimeout(function () { if (last) render(last.x, last.y); }, 60);
        });

        btn.addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            box.style.display = box.style.display === 'none' ? 'block' : 'none';
            return false;
        });
        btn.addEventListener('mousedown', function (e) { e.stopPropagation(); });
    }

    function init() {
        if (btn) return;
        if (!sty) {
            sty = document.createElement('style');
            sty.id = 'layer-toggles';
            (document.head || document.documentElement).appendChild(sty);
        }
        buildUi();
        window.toggleLayerMenu = function () { if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none'; };
    }

    // Единая ручка для предпросмотра: показать/скрыть кнопку «СЛОИ»
    // вместе с её панелью. По умолчанию кнопка скрыта.
    window.setLayerDebugVisible = function (v) {
        if (!btn) init();
        if (!btn) return;
        btn.style.display = v ? '' : 'none';
        if (!v && box) box.style.display = 'none';
    };
    function bootLayerDebug() {
        init();
        if (/[?&#](debug|inspect)=1([&#]|$)/.test(location.href)) {
            window.setLayerDebugVisible(true);
        }
    }
    if (/[?&#]tg=0([&#]|$)/.test(location.href)) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootLayerDebug);
        else bootLayerDebug();
    }
})();

/* Скрытое радио: топбар скрыт по умолчанию, появляется при наборе слова-кода (XOR-маска, как у чита) */
(function () {
    let visible = false;
    let buf = "";
    let last = 0;
    const _rk = 7;
    const _rs = "ufcnh";
    const _rt = _rs.replace(/./g, ch => String.fromCharCode(ch.charCodeAt(0) ^ _rk));
    function apply() {
        document.body.classList.toggle("radio-hidden", !visible);
        try { if (window.__resetFit) window.__resetFit(); } catch (e) { }
        try { if (window.__schedulePinFrame) window.__schedulePinFrame(); } catch (e) { }
    }
    apply();
    document.addEventListener("keydown", function (e) {
        const t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) { buf = ""; return; }
        const now = Date.now();
        if (now - last > 1200) buf = "";
        last = now;
        buf = (buf + e.key.toLowerCase()).slice(-8);
        if (buf.endsWith(_rt)) {
            buf = "";
            visible = !visible;
            apply();
        }
    });
})();
