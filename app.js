/**
 * GREEN CREDITS ECOSYSTEM — app.js
 * Shared frontend state & utilities (localStorage-backed)
 */

/* ─── STATE ──────────────────────────────── */
const GCE = (() => {

    const DEFAULTS = {
        user: null,
        credits: 50,
        activity: [],
        notes: [
            { id: 1, category: 'Study Material', title: 'Data Structures & Algorithms', courseName: 'Data Structures', courseCode: 'CS301', branch: 'Computer Science', includes: 'Chapter 1-8 handwritten notes', uploader: 'aarav.s', price: 15, pages: 84, date: '2026-03-28' },
            { id: 2, category: 'Study Material', title: 'Thermodynamics Chapter 1-5', courseName: 'Thermodynamics', courseCode: 'ME202', branch: 'Mechanical', includes: 'Summary & Formulas', uploader: 'priya.k', price: 10, pages: 32, date: '2026-03-25' },
            { id: 3, category: 'Hardware', title: 'Arduino Uno R3', condition: 'Like New', desc: 'Used for one semester project. Works perfectly.', uploader: 'rohit.v', price: 25, date: '2026-03-22' },
            { id: 4, category: 'Study Material', title: 'Linear Algebra Prep Pack', courseName: 'Linear Algebra', courseCode: 'MA201', branch: 'Mathematics', includes: 'Past 5 year solved papers', uploader: 'sneha.r', price: 8, pages: 28, date: '2026-03-20' },
            { id: 5, category: 'Hardware', title: 'ESP32 Wi-Fi Module', condition: 'Good', desc: 'Barely used. Includes breakout pins.', uploader: 'manav.d', price: 12, date: '2026-03-18' },
            { id: 6, category: 'Study Material', title: 'Engineering Drawing Guide', courseName: 'Eng Drawing', courseCode: 'ME101', branch: 'Mechanical', includes: 'Practical diagrams compilation', uploader: 'tanvi.m', price: 6, pages: 20, date: '2026-03-15' },
        ],
        purchases: [],
        mealStats: {
            mealsOptimized: 12847,
            resourcesReused: 5391,
            activeUsers: 1024,
        },
        menus: [
            { id: 'm1', name: 'Breakfast', time: '07:30 – 09:00', menu: 'Poha, Jalebi, Milk, Bread Butter, Tea' },
            { id: 'm2', name: 'Lunch', time: '12:00 – 14:00', menu: 'Dal Makhani, Paneer Butter Masala, Roti, Rice, Salad' },
            { id: 'm3', name: 'Snacks', time: '16:00 – 17:00', menu: 'Samosa, Green Chutney, Coffee' },
            { id: 'm4', name: 'Dinner', time: '19:00 – 21:00', menu: 'Aloo Gobi, Rajma, Jeera Rice, Chapati' }
        ],
        swipeMeals: [
            { id: 's1', mealName: 'Rajma Chawal', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=2070&auto=format&fit=crop' },
            { id: 's2', mealName: 'Masala Dosa', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=2070&auto=format&fit=crop' },
            { id: 's3', mealName: 'Paneer Tikka', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=2117&auto=format&fit=crop' },
            { id: 's4', mealName: 'Chole Bhature', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=1974&auto=format&fit=crop' }
        ]
    };

    /* ── Persistence ── */
    function load(key) {
        try { return JSON.parse(localStorage.getItem('gce_' + key)); }
        catch { return null; }
    }

    function save(key, val) {
        localStorage.setItem('gce_' + key, JSON.stringify(val));
    }

    function initState() {
        if (!load('notes'))     save('notes',     DEFAULTS.notes);
        if (!load('purchases')) save('purchases', DEFAULTS.purchases);
        if (!load('activity'))  save('activity',  DEFAULTS.activity);
        if (load('credits') === null) save('credits', DEFAULTS.credits);
    }

    /* ── Auth ── */
    function getUser()     { return load('user'); }
    function isLoggedIn()  { return !!getUser(); }

    function login(name, roll) {
        const u = { name, roll, joined: new Date().toISOString() };
        save('user', u);
        initState();
        return u;
    }

    function logout() {
        localStorage.removeItem('gce_user');
    }

    function requireAuth(redirect = 'login.html') {
        if (!isLoggedIn()) { window.location.href = redirect; }
    }

    /* ── Credits ── */
    function getCredits() {
        const c = load('credits');
        return c !== null ? c : DEFAULTS.credits;
    }

    function addCredits(amount, reason) {
        const c = getCredits() + amount;
        save('credits', c);
        logActivity('+' + amount, reason, 'earn');
        return c;
    }

    function spendCredits(amount, reason) {
        const c = getCredits();
        if (c < amount) return { ok: false, message: 'Insufficient credits' };
        const newC = c - amount;
        save('credits', newC);
        logActivity('-' + amount, reason, 'spend');
        return { ok: true, credits: newC };
    }

    /* ── Activity Log ── */
    function logActivity(delta, reason, type = 'earn') {
        const log = load('activity') || [];
        log.unshift({ delta, reason, type, ts: new Date().toISOString() });
        save('activity', log.slice(0, 30)); // keep last 30
    }

    function getActivity() { return load('activity') || []; }

    /* ── Notes / Marketplace ── */
    function getNotes() { return load('notes') || DEFAULTS.notes; }

    function uploadNote(note) {
        const notes = getNotes();
        const n = {
            ...note,
            id: Date.now(),
            uploader: getUser()?.roll || 'anon',
            date: new Date().toISOString().split('T')[0],
        };
        notes.unshift(n);
        save('notes', notes);
        addCredits(20, 'Uploaded: ' + note.title);
        return n;
    }

    function buyNote(noteId) {
        const notes = getNotes();
        const note  = notes.find(n => n.id === noteId);
        if (!note) return { ok: false, message: 'Note not found' };

        const purchases = load('purchases') || [];
        if (purchases.includes(noteId)) return { ok: false, message: 'Already purchased' };

        const result = spendCredits(note.price, 'Bought: ' + note.title);
        if (!result.ok) return result;

        purchases.push(noteId);
        save('purchases', purchases);
        return { ok: true, note };
    }

    function getPurchases() { return load('purchases') || []; }

    function hasPurchased(noteId) { return getPurchases().includes(noteId); }

    /* ── Stats ── */
    function getMealStats() { return DEFAULTS.mealStats; }

    /* ── Meals ── */
    function getMenus() { return DEFAULTS.menus; }
    function getSwipeMeals() { return DEFAULTS.swipeMeals; }

    /* ── Utilities ── */
    function timeAgo(iso) {
        const d = (Date.now() - new Date(iso)) / 1000;
        if (d < 60) return 'just now';
        if (d < 3600) return Math.floor(d / 60) + 'm ago';
        if (d < 86400) return Math.floor(d / 3600) + 'h ago';
        return Math.floor(d / 86400) + 'd ago';
    }

    function formatDate(iso) {
        return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return { initState, getUser, isLoggedIn, login, logout, requireAuth, getCredits, addCredits, spendCredits, logActivity, getActivity, getNotes, uploadNote, buyNote, getPurchases, hasPurchased, getMealStats, getMenus, getSwipeMeals, timeAgo, formatDate };
})();

/* ─── TOAST SYSTEM ───────────────────────── */
function showToast(message, type = '') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast' + (type ? ' toast--' + type : '');
    t.textContent = message;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(120%)'; t.style.transition = '0.3s'; }, 2800);
    setTimeout(() => t.remove(), 3200);
}

/* ─── NAV CREDITS BADGE ──────────────────── */
function updateNavBadge() {
    const badge = document.getElementById('nav-credits-badge');
    if (badge && GCE.isLoggedIn()) {
        badge.style.display = 'inline-block';
        badge.textContent   = GCE.getCredits() + ' CR';
    }
}

/* ─── ACTIVE NAV LINK ────────────────────── */
function setActiveNavLink() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__links a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href === page || (page === '' && href === 'index.html')) {
            a.classList.add('active');
        }
    });
}

/* ─── INIT ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    updateNavBadge();
    setActiveNavLink();

    // logout button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            GCE.logout();
            window.location.href = 'index.html';
        });
    }
});
