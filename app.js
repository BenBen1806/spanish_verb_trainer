/* ==========================================================================
   1. TENSES, SUBJECTS & DYNAMIC VERB DATABASE
   ========================================================================== */

const TENSES = [
    { id: 'presente', nameHe: 'הווה (Presente)', nameEs: 'Presente de Indicativo', hint: 'סיומות הווה: -ar (-o, -as, -a, -amos, -áis, -an), -er (-o, -es, -e, -emos, -éis, -en), -ir (-o, -es, -e, -imos, -ís, -en).' },
    { id: 'indefinido', nameHe: 'עבר פשוט (Pretérito Indefinido)', nameEs: 'Pretérito Indefinido', hint: 'לפעולות שהסתיימו בעבר. סיומות -ar (-é, -aste, -ó...), -er/-ir (-í, -iste, -ió...). שימו לב לפעלים לא סדירים (fui, tuve, hice...).' },
    { id: 'perfecto', nameHe: 'עבר מורכב (Pretérito Perfecto)', nameEs: 'Pretérito Perfecto', hint: 'נוסחה: Haber בהווה (he, has, ha, hemos, habéis, han) + Participio (-ado / -ido).' },
    { id: 'imperfecto', nameHe: 'עבר תיאורי (Pretérito Imperfecto)', nameEs: 'Pretérito Imperfecto', hint: 'להרגלים/תיאורי רקע בעבר. סיומות -ar (-aba, -abas...), -er/-ir (-ía, -ías...).' },
    { id: 'futuro', nameHe: 'עתיד פשוט (Futuro Simple)', nameEs: 'Futuro Simple', hint: 'שם הפועל במלואו + הסיומות: -é, -ás, -á, -emos, -éis, -án. שימו לב לגזע משתנה (tendr-, har-, dir...).' },
    { id: 'subjuntivo', nameHe: 'סובחונטיבו הווה (Subjuntivo)', nameEs: 'Presente de Subjuntivo', hint: 'סיומות הפוכות! -ar מקבלת e (hable), -er/-ir מקבלות a (coma, viva).' },
    { id: 'imperativo', nameHe: 'ציווי (Imperativo)', nameEs: 'Imperativo Afirmativo', hint: 'למתן הוראות! צורת tú זהה לגוף שלישי בהווה (habla, come), usted משתמש בסובחונטיבו.' }
];

const SUBJECTS = [
    { id: 0, es: 'Yo', he: 'אני' },
    { id: 1, es: 'Tú', he: 'אתה/את' },
    { id: 2, es: 'Él / Ella / Ud.', he: 'הוא/היא/אתה רשמי' },
    { id: 3, es: 'Nosotros', he: 'אנחנו' },
    { id: 4, es: 'Vosotros', he: 'אתם/ן (ספרד)' },
    { id: 5, es: 'Ellos / Ellas / Uds.', he: 'הם/הן/אתם רשמי' }
];

// Loaded dynamically from verbs.json
let VERBS_DB = [];

/* ==========================================================================
   2. STATE MANAGEMENT & SRS (LOCALSTORAGE)
   ========================================================================== */

const STORAGE_KEY = 'spanish_verb_trainer_srs_v2';

const state = {
    mode: 'practice',
    weakPracticeOnly: false,
    selectedTenses: ['presente', 'indefinido', 'perfecto', 'futuro'],
    streak: 0,
    totalPracticed: 0,
    correctCount: 0,
    srsData: {}, // { [verbId]: { mistakes: 0, correct: 0, total: 0 } }
    currentQuestion: null,
    isAnswerChecked: false,
    hintVisible: false,
    selectedLibVerbId: 'hablar',
    selectedLibTense: 'presente',
    confirmResetPending: false
};

function loadSRSData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            state.srsData = parsed.srsData || {};
            state.totalPracticed = parsed.totalPracticed || 0;
            state.correctCount = parsed.correctCount || 0;
            state.streak = parsed.streak || 0;
            if (Array.isArray(parsed.selectedTenses) && parsed.selectedTenses.length > 0) {
                state.selectedTenses = parsed.selectedTenses;
            }
        }
    } catch (e) {
        console.warn('Could not load SRS data:', e);
    }
    updateStatsUI();
}

function saveSRSData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            srsData: state.srsData,
            totalPracticed: state.totalPracticed,
            correctCount: state.correctCount,
            streak: state.streak,
            selectedTenses: state.selectedTenses
        }));
    } catch (e) {
        console.warn('Could not save SRS data:', e);
    }
    updateStatsUI();
}

function getWeakVerbIds() {
    return Object.keys(state.srsData).filter(id => (state.srsData[id]?.mistakes || 0) > 0);
}

function updateStatsUI() {
    document.getElementById('header-streak').textContent = state.streak;
    document.getElementById('header-total').textContent = state.totalPracticed;

    const accuracy = state.totalPracticed === 0
        ? 100
        : Math.round((state.correctCount / state.totalPracticed) * 100);
    document.getElementById('header-accuracy').textContent = `${accuracy}%`;

    const weakCount = getWeakVerbIds().length;
    const weakBadge = document.getElementById('weak-badge');
    if (weakCount > 0) {
        weakBadge.textContent = weakCount;
        weakBadge.classList.remove('hidden');
    } else {
        weakBadge.classList.add('hidden');
    }
}

/* ==========================================================================
   3. TENSE FILTER & MODE SWITCHING
   ========================================================================== */

function renderTensesFilter() {
    const container = document.getElementById('tenses-grid');
    container.innerHTML = '';

    TENSES.forEach(tense => {
        const isSelected = state.selectedTenses.includes(tense.id);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.onclick = () => toggleTense(tense.id);
        btn.className = isSelected
            ? 'px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-white shadow-sm border border-amber-500 transition flex items-center gap-1.5'
            : 'px-3 py-1.5 rounded-xl font-medium bg-stone-100 dark:bg-stone-700/70 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:border-amber-400 transition flex items-center gap-1.5';

        btn.innerHTML = `
            <i class="fa-solid ${isSelected ? 'fa-square-check' : 'fa-square opacity-40'}"></i>
            <span>${tense.nameHe}</span>
        `;
        container.appendChild(btn);
    });
}

function toggleTense(tenseId) {
    const idx = state.selectedTenses.indexOf(tenseId);
    if (idx > -1) {
        if (state.selectedTenses.length === 1) return; // Keep at least one tense active
        state.selectedTenses.splice(idx, 1);
    } else {
        state.selectedTenses.push(tenseId);
    }
    renderTensesFilter();
    saveSRSData();
    generateNextQuestion();
}

function selectAllTenses(selectAll) {
    if (selectAll) {
        state.selectedTenses = TENSES.map(t => t.id);
    } else {
        state.selectedTenses = ['presente'];
    }
    renderTensesFilter();
    saveSRSData();
    generateNextQuestion();
}

function switchMode(newMode) {
    state.mode = newMode;

    ['practice', 'library', 'weak'].forEach(m => {
        const viewEl = document.getElementById(`mode-${m}`);
        const tabEl = document.getElementById(`tab-${m}`);
        if (m === newMode) {
            viewEl.classList.remove('hidden');
            tabEl.className = 'px-3 py-1.5 rounded-lg transition-all bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm relative';
        } else {
            viewEl.classList.add('hidden');
            tabEl.className = 'px-3 py-1.5 rounded-lg transition-all text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white relative';
        }
    });

    if (newMode === 'library') {
        renderLibraryVerbs();
        renderLibraryDetails();
    } else if (newMode === 'weak') {
        renderWeakVerbsView();
    } else if (newMode === 'practice') {
        const inputEl = document.getElementById('user-input');
        if (inputEl && !state.isAnswerChecked) inputEl.focus();
    }
}

/* ==========================================================================
   4. QUESTION GENERATOR & ANSWER CHECKER
   ========================================================================== */

function pickWeightedVerb(pool) {
    const weightedList = [];
    pool.forEach(verb => {
        const mistakes = state.srsData[verb.id]?.mistakes || 0;
        const weight = 1 + mistakes * 3;
        for (let i = 0; i < weight; i++) {
            weightedList.push(verb);
        }
    });
    return weightedList[Math.floor(Math.random() * weightedList.length)];
}

function generateNextQuestion() {
    if (!VERBS_DB.length) return;

    state.isAnswerChecked = false;
    state.hintVisible = false;

    const inputEl = document.getElementById('user-input');
    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.className = 'w-full px-5 py-3.5 rounded-2xl border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-semibold text-xl text-center focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition shadow-inner';

    document.getElementById('feedback-card').classList.add('hidden');
    document.getElementById('grammar-hint-box').classList.add('hidden');
    document.getElementById('hint-toggle-text').textContent = 'הצג רמז דקדוקי';
    document.getElementById('btn-check').classList.remove('hidden');
    document.getElementById('btn-next').classList.add('hidden');

    // Determine verb pool
    let verbPool = VERBS_DB;
    const weakIds = getWeakVerbIds();
    if (state.weakPracticeOnly && weakIds.length > 0) {
        verbPool = VERBS_DB.filter(v => weakIds.includes(v.id));
    } else if (state.weakPracticeOnly && weakIds.length === 0) {
        state.weakPracticeOnly = false;
        document.getElementById('weak-mode-indicator').classList.add('hidden');
    }

    // Pick a valid verb + tense + subject combination (avoid '-' imperative placeholders)
    let selectedVerb = null;
    let selectedTenseId = null;
    let subjectIdx = 0;
    let expected = '-';

    for (let attempt = 0; attempt < 30; attempt++) {
        const candidateVerb = pickWeightedVerb(verbPool);
        const candidateTenseId = state.selectedTenses[Math.floor(Math.random() * state.selectedTenses.length)];
        const forms = candidateVerb.conjugations[candidateTenseId];
        if (!forms) continue;

        const validSubjectIndices = forms
            .map((form, idx) => (form && form !== '-' ? idx : -1))
            .filter(idx => idx !== -1);

        if (validSubjectIndices.length > 0) {
            selectedVerb = candidateVerb;
            selectedTenseId = candidateTenseId;
            subjectIdx = validSubjectIndices[Math.floor(Math.random() * validSubjectIndices.length)];
            expected = forms[subjectIdx];
            break;
        }
    }

    // Fallback guarantee
    if (!selectedVerb) {
        selectedVerb = VERBS_DB[0];
        selectedTenseId = 'presente';
        subjectIdx = 0;
        expected = selectedVerb.conjugations.presente[0];
    }

    const tenseObj = TENSES.find(t => t.id === selectedTenseId) || TENSES[0];
    const subjectObj = SUBJECTS[subjectIdx];

    // Find matching example sentence or construct a clean contextual example
    const templates = selectedVerb.templates || [];
    const matchingTemplate = templates.find(
        tpl => tpl.tense === selectedTenseId && tpl.subjectIdx === subjectIdx
    ) || templates[0];

    let sentenceEs = `${subjectObj.es.split('/')[0].trim()} {slot}.`;
    let sentenceHe = `${subjectObj.he} (${selectedVerb.hebrew})`;

    if (matchingTemplate && matchingTemplate.tense === selectedTenseId && matchingTemplate.subjectIdx === subjectIdx) {
        sentenceEs = matchingTemplate.textEs;
        sentenceHe = matchingTemplate.textHe;
    } else {
        const timeMarkers = {
            presente: 'Hoy',
            indefinido: 'Ayer',
            perfecto: 'Esta semana',
            imperfecto: 'Antes',
            futuro: 'Mañana',
            subjuntivo: 'Espero que',
            imperativo: '¡Por favor,'
        };
        const marker = timeMarkers[selectedTenseId] || '';
        const cleanSubj = selectedTenseId === 'imperativo' ? '' : subjectObj.es.split('/')[0].trim().toLowerCase();
        sentenceEs = selectedTenseId === 'imperativo'
            ? `${marker} {slot}!`
            : `${marker} ${cleanSubj} {slot}...`.trim();
        sentenceHe = `${tenseObj.nameHe} • ${subjectObj.he}`;
    }

    state.currentQuestion = {
        verb: selectedVerb,
        tense: tenseObj,
        subject: subjectObj,
        expected: expected,
        sentenceEs: sentenceEs,
        sentenceHe: sentenceHe
    };

    // Update DOM
    document.getElementById('badge-tense').textContent = tenseObj.nameHe;
    document.getElementById('badge-category').textContent = selectedVerb.categoryName;
    document.getElementById('target-infinitive').textContent = selectedVerb.infinitive;
    document.getElementById('target-translation').textContent = selectedVerb.hebrew;
    document.getElementById('prompt-subject-es').textContent = subjectObj.es;
    document.getElementById('prompt-subject-he').textContent = subjectObj.he;
    document.getElementById('prompt-tense-he').textContent = tenseObj.nameHe;
    document.getElementById('prompt-tense-es').textContent = tenseObj.nameEs;
    document.getElementById('grammar-hint-box').textContent = tenseObj.hint;

    const progressPct = Math.min((state.streak % 10) * 10, 100);
    document.getElementById('practice-progress-bar').style.width = `${progressPct}%`;

    inputEl.focus();
}

function toggleGrammarHint() {
    state.hintVisible = !state.hintVisible;
    const hintBox = document.getElementById('grammar-hint-box');
    const toggleText = document.getElementById('hint-toggle-text');
    if (state.hintVisible) {
        hintBox.classList.remove('hidden');
        toggleText.textContent = 'הסתר רמז דקדוקי';
    } else {
        hintBox.classList.add('hidden');
        toggleText.textContent = 'הצג רמז דקדוקי';
    }
}

function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buildExampleHtml() {
    const q = state.currentQuestion;
    const completedEs = q.sentenceEs.replace('{slot}', `<strong class="underline">${q.expected}</strong>`);
    return `
        <div class="mt-2.5 pt-2.5 border-t border-current/15 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
                <span class="opacity-75">דוגמה בהקשר: </span>
                <span class="spanish-text font-medium">${completedEs}</span>
                <span class="opacity-80 block sm:inline sm:mr-2">(${q.sentenceHe})</span>
            </div>
            <button type="button" onclick="speakExampleSentence()" class="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 transition flex items-center gap-1">
                <i class="fa-solid fa-volume-low"></i>
                <span>השמע דוגמה</span>
            </button>
        </div>
    `;
}

function checkAnswer() {
    if (state.isAnswerChecked || !state.currentQuestion) return;

    const inputEl = document.getElementById('user-input');
    const rawUserAnswer = inputEl.value.trim().toLowerCase();
    if (!rawUserAnswer) {
        inputEl.focus();
        return;
    }

    state.isAnswerChecked = true;
    inputEl.disabled = true;

    const expected = state.currentQuestion.expected.toLowerCase();
    const verbId = state.currentQuestion.verb.id;

    if (!state.srsData[verbId]) {
        state.srsData[verbId] = { mistakes: 0, correct: 0, total: 0 };
    }
    state.srsData[verbId].total += 1;
    state.totalPracticed += 1;

    const isExactMatch = rawUserAnswer === expected;
    const isAccentOnlyMismatch = !isExactMatch && removeAccents(rawUserAnswer) === removeAccents(expected);

    const feedbackEl = document.getElementById('feedback-card');
    feedbackEl.classList.remove('hidden');

    if (isExactMatch) {
        state.streak += 1;
        state.correctCount += 1;
        state.srsData[verbId].correct += 1;
        if (state.srsData[verbId].mistakes > 0) {
            state.srsData[verbId].mistakes -= 1;
        }

        inputEl.classList.add('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-950/30', 'text-emerald-700', 'dark:text-emerald-300');

        feedbackEl.className = "mt-6 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 transition-all text-sm";
        feedbackEl.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 font-bold">
                    <i class="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400 text-lg"></i>
                    <span>מדויק! כל הכבוד!</span>
                </div>
                <span class="spanish-text font-extrabold text-lg">${state.currentQuestion.expected}</span>
            </div>
            ${buildExampleHtml()}
        `;
    } else if (isAccentOnlyMismatch) {
        state.streak += 1;
        state.correctCount += 1;
        state.srsData[verbId].correct += 1;

        inputEl.classList.add('border-amber-500', 'bg-amber-50/50', 'dark:bg-amber-950/30', 'text-amber-700', 'dark:text-amber-300');

        feedbackEl.className = "mt-6 p-4 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 transition-all text-sm";
        feedbackEl.innerHTML = `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-2 font-bold">
                    <i class="fa-solid fa-triangle-exclamation text-amber-600 dark:text-amber-400 text-lg"></i>
                    <span>כמעט מדויק! שים לב לסימן האקצנט:</span>
                </div>
                <span class="spanish-text font-extrabold text-lg underline">${state.currentQuestion.expected}</span>
            </div>
            ${buildExampleHtml()}
        `;
    } else {
        state.streak = 0;
        state.srsData[verbId].mistakes += 1;

        inputEl.classList.add('border-red-500', 'bg-red-50/50', 'dark:bg-red-950/30', 'text-red-700', 'dark:text-red-300');

        feedbackEl.className = "mt-6 p-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 transition-all text-sm";
        feedbackEl.innerHTML = `
            <div class="space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 font-bold">
                        <i class="fa-solid fa-circle-xmark text-red-600 dark:text-red-400 text-lg"></i>
                        <span>לא מדויק. ההטיה הנכונה היא:</span>
                    </div>
                    <span class="spanish-text font-extrabold text-lg text-red-700 dark:text-red-300">${state.currentQuestion.expected}</span>
                </div>
                <p class="text-xs opacity-90">${state.currentQuestion.tense.hint}</p>
            </div>
            ${buildExampleHtml()}
        `;
    }

    speakTargetVerb();
    saveSRSData();

    document.getElementById('btn-check').classList.add('hidden');
    document.getElementById('btn-next').classList.remove('hidden');
    document.getElementById('btn-next').focus();
}

function insertAccent(char) {
    const inputEl = document.getElementById('user-input');
    if (inputEl.disabled) return;
    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;
    const val = inputEl.value;
    inputEl.value = val.substring(0, start) + char + val.substring(end);
    inputEl.focus();
    inputEl.setSelectionRange(start + 1, start + 1);
}

function speakTargetVerb() {
    if (!state.currentQuestion || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const textToSpeak = state.isAnswerChecked
        ? state.currentQuestion.expected
        : state.currentQuestion.verb.infinitive;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function speakExampleSentence() {
    if (!state.currentQuestion || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const fullText = state.currentQuestion.sentenceEs.replace('{slot}', state.currentQuestion.expected);
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
}

function speakText(text) {
    if (!text || text === '-' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
}

/* ==========================================================================
   5. LIBRARY MODE FUNCTIONS
   ========================================================================== */

function filterLibraryVerbs() {
    renderLibraryVerbs();
}

function renderLibraryVerbs() {
    const query = (document.getElementById('library-search').value || '').trim().toLowerCase();
    const container = document.getElementById('library-verb-chips');
    container.innerHTML = '';

    const filtered = VERBS_DB.filter(v =>
        v.infinitive.toLowerCase().includes(query) ||
        v.hebrew.includes(query)
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-xs text-stone-400 py-2">לא נמצאו פעלים תואמים לחיפוש.</div>';
        return;
    }

    filtered.forEach(verb => {
        const isSelected = verb.id === state.selectedLibVerbId;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.onclick = () => {
            state.selectedLibVerbId = verb.id;
            renderLibraryVerbs();
            renderLibraryDetails();
        };
        btn.className = isSelected
            ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-sm transition'
            : 'px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-amber-100 dark:hover:bg-stone-600 transition';
        btn.innerHTML = `<span class="spanish-text font-bold">${verb.infinitive}</span> <span class="opacity-80">(${verb.hebrew})</span>`;
        container.appendChild(btn);
    });
}

function renderLibraryDetails() {
    if (!VERBS_DB.length) return;
    const verb = VERBS_DB.find(v => v.id === state.selectedLibVerbId) || VERBS_DB[0];
    document.getElementById('lib-selected-infinitive').textContent = verb.infinitive;
    document.getElementById('lib-selected-hebrew').textContent = verb.hebrew;
    document.getElementById('lib-selected-tags').innerHTML = `
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
            ${verb.categoryName}
        </span>
    `;

    // Render tense tabs
    const tabsEl = document.getElementById('lib-tense-tabs');
    tabsEl.innerHTML = '';
    TENSES.forEach(tense => {
        const isActive = tense.id === state.selectedLibTense;
        const tabBtn = document.createElement('button');
        tabBtn.type = 'button';
        tabBtn.onclick = () => {
            state.selectedLibTense = tense.id;
            renderLibraryDetails();
        };
        tabBtn.className = isActive
            ? 'px-2.5 py-1 rounded-lg font-bold bg-stone-900 dark:bg-amber-500 text-white transition'
            : 'px-2.5 py-1 rounded-lg font-medium bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400 transition';
        tabBtn.textContent = tense.nameHe.split('(')[0].trim();
        tabsEl.appendChild(tabBtn);
    });

    // Render 6 conjugations
    const gridEl = document.getElementById('lib-conjugations-grid');
    gridEl.innerHTML = '';
    const forms = verb.conjugations[state.selectedLibTense] || [];

    SUBJECTS.forEach((subj, idx) => {
        const form = forms[idx] || '-';
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-stone-800 rounded-xl p-3.5 border border-stone-200 dark:border-stone-700 flex items-center justify-between';
        card.innerHTML = `
            <div>
                <div class="spanish-text text-xs font-bold text-stone-400">${subj.es}</div>
                <div class="text-[11px] text-stone-500 dark:text-stone-400">${subj.he}</div>
            </div>
            <div class="flex items-center gap-2">
                <span class="spanish-text text-lg font-extrabold text-amber-600 dark:text-amber-400">${form}</span>
                ${form !== '-' ? `
                    <button type="button" onclick="speakText('${form.replace(/'/g, "\\'")}')" class="text-stone-400 hover:text-amber-500 transition p-1" title="השמע">
                        <i class="fa-solid fa-volume-low text-xs"></i>
                    </button>
                ` : ''}
            </div>
        `;
        gridEl.appendChild(card);
    });
}

/* ==========================================================================
   6. WEAK VERBS / SRS ANALYTICS FUNCTIONS
   ========================================================================== */

function renderWeakVerbsView() {
    const container = document.getElementById('weak-verbs-container');
    const weakIds = getWeakVerbIds();

    if (weakIds.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 bg-stone-50 dark:bg-stone-900/60 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
                <i class="fa-solid fa-award text-4xl text-emerald-500 mb-3"></i>
                <h3 class="font-bold text-base text-stone-800 dark:text-stone-200">אין כרגע פעלים חלשים!</h3>
                <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">כל הפעלים שתרגלת עד כה בוצעו בהצלחה. המשך להתאמן כדי לבחון זמנים ופעלים חדשים.</p>
            </div>
        `;
        return;
    }

    // Sort by highest mistake count
    weakIds.sort((a, b) => (state.srsData[b]?.mistakes || 0) - (state.srsData[a]?.mistakes || 0));

    container.innerHTML = '';
    weakIds.forEach(id => {
        const verb = VERBS_DB.find(v => v.id === id);
        if (!verb) return;
        const stats = state.srsData[id];
        const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

        const row = document.createElement('div');
        row.className = 'flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700';
        row.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="spanish-text text-xl font-extrabold text-stone-900 dark:text-white">${verb.infinitive}</span>
                <span class="text-sm font-bold text-amber-600 dark:text-amber-400">${verb.hebrew}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">${verb.categoryName}</span>
            </div>
            <div class="flex items-center gap-4 text-xs">
                <span class="text-red-600 dark:text-red-400 font-bold">רמת קושי (טעויות): ${stats.mistakes}</span>
                <span class="text-stone-500">דיוק: ${acc}% (${stats.correct}/${stats.total})</span>
                <button type="button" onclick="inspectVerbInLibrary('${verb.id}')" class="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 hover:border-amber-500 font-medium transition">
                    צפה בטבלת נטייה
                </button>
            </div>
        `;
        container.appendChild(row);
    });
}

function inspectVerbInLibrary(verbId) {
    state.selectedLibVerbId = verbId;
    switchMode('library');
}

function startWeakVerbsPractice() {
    const weakIds = getWeakVerbIds();
    if (weakIds.length === 0) {
        switchMode('practice');
        return;
    }
    state.weakPracticeOnly = true;
    document.getElementById('weak-mode-indicator').classList.remove('hidden');
    switchMode('practice');
    generateNextQuestion();
}

function exitWeakMode() {
    state.weakPracticeOnly = false;
    document.getElementById('weak-mode-indicator').classList.add('hidden');
    generateNextQuestion();
}

function resetSRSProgress() {
    const btn = document.getElementById('btn-reset-srs');
    if (!state.confirmResetPending) {
        state.confirmResetPending = true;
        btn.textContent = 'לחץ שוב לאישור איפוס';
        btn.classList.add('bg-red-600', 'text-white');
        setTimeout(() => {
            state.confirmResetPending = false;
            btn.textContent = 'איפוס נתונים';
            btn.classList.remove('bg-red-600', 'text-white');
        }, 4000);
        return;
    }

    state.confirmResetPending = false;
    btn.textContent = 'איפוס נתונים';
    btn.classList.remove('bg-red-600', 'text-white');

    state.srsData = {};
    state.streak = 0;
    state.totalPracticed = 0;
    state.correctCount = 0;
    state.weakPracticeOnly = false;
    document.getElementById('weak-mode-indicator').classList.add('hidden');
    saveSRSData();
    renderWeakVerbsView();
}

/* ==========================================================================
   7. THEME & ASYNC INITIALIZATION
   ========================================================================== */

function toggleDarkMode() {
    const htmlEl = document.documentElement;
    const iconEl = document.getElementById('theme-icon');
    const isDark = htmlEl.classList.toggle('dark');
    iconEl.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon';
    try {
        localStorage.setItem('spanish_trainer_theme', isDark ? 'dark' : 'light');
    } catch (e) {}
}

function initTheme() {
    try {
        const savedTheme = localStorage.getItem('spanish_trainer_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            document.getElementById('theme-icon').className = 'fa-solid fa-sun text-amber-400';
        }
    } catch (e) {}
}

async function initApp() {
    initTheme();
    loadSRSData();
    renderTensesFilter();

    try {
        const response = await fetch('./verbs.json');
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        VERBS_DB = await response.json();
        if (VERBS_DB.length > 0) {
            state.selectedLibVerbId = VERBS_DB[0].id;
        }
        generateNextQuestion();
    } catch (err) {
        console.error('Failed to load verbs.json:', err);
        document.getElementById('target-infinitive').textContent = 'Error';
        document.getElementById('target-translation').textContent = 'יש להריץ דרך Live Server לטעינת verbs.json';
    }

    document.addEventListener('keydown', (e) => {
        if (state.mode !== 'practice') return;
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!state.isAnswerChecked) {
                checkAnswer();
            } else {
                generateNextQuestion();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);