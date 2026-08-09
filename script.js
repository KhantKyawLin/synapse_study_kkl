// --- GLOBAL STATE ---
let allFlashcards = [];
let filteredFlashcards = [];
let currentIndex = 0;

let allDashboardsContext = {};
let currentModuleData = [];
let filteredModuleData = [];
let currentSelectedItem = null;
let currentFilter = 'All';

// --- DOM ELEMENTS ---
// Common
const appContainer = document.getElementById('app');
const navFlashcards = document.getElementById('nav-flashcards');
const navDashboards = document.getElementById('nav-dashboards');

// Views
const flashcardView = document.getElementById('flashcard-view');
const dashboardView = document.getElementById('dashboard-view');
const flashcardControls = document.getElementById('flashcard-controls');
const dashboardControls = document.getElementById('dashboard-controls');

// Flashcards
const flashcardEl = document.getElementById('flashcard');
const frontCategoryEl = document.getElementById('front-category');
const frontTextEl = document.getElementById('front-text');
const backCategoryEl = document.getElementById('back-category');
const backTextEl = document.getElementById('back-text');
const moduleFilterEl = document.getElementById('moduleFilter');
const categoryFilterEl = document.getElementById('categoryFilter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentIndexEl = document.getElementById('currentIndex');
const totalCardsEl = document.getElementById('totalCards');

// Dashboard
const moduleFilterDashEl = document.getElementById('moduleFilterDash');
const tagFiltersEl = document.getElementById('tagFilters');
const itemListEl = document.getElementById('itemList');
const detailViewEl = document.getElementById('detailView');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Load both datasets
    await Promise.all([loadFlashcards(), loadDashboards()]);
    
    // Global Event Listeners
    navFlashcards.addEventListener('click', () => switchView('flashcards'));
    navDashboards.addEventListener('click', () => switchView('dashboards'));
    
    // Flashcard listeners
    flashcardEl.addEventListener('click', flipCard);
    prevBtn.addEventListener('click', showPreviousCard);
    nextBtn.addEventListener('click', showNextCard);
    moduleFilterEl.addEventListener('change', handleFlashcardModuleChange);
    categoryFilterEl.addEventListener('change', () => applyFlashcardFilters());
    
    // Dashboard listeners
    moduleFilterDashEl.addEventListener('change', (e) => loadDashboardModule(e.target.value));
}

function switchView(view) {
    if (view === 'flashcards') {
        navFlashcards.classList.add('active');
        navDashboards.classList.remove('active');
        
        flashcardView.classList.remove('d-none');
        flashcardControls.classList.remove('d-none');
        
        dashboardView.classList.add('d-none');
        dashboardControls.classList.add('d-none');
    } else {
        navFlashcards.classList.remove('active');
        navDashboards.classList.add('active');
        
        flashcardView.classList.add('d-none');
        flashcardControls.classList.add('d-none');
        
        dashboardView.classList.remove('d-none');
        dashboardControls.classList.remove('d-none');
    }
}

// --- FLASHCARD LOGIC ---
async function loadFlashcards() {
    try {
        const response = await fetch('data.json');
        allFlashcards = await response.json();
        if (allFlashcards.length === 0) return;

        populateFlashcardFilters();
        filteredFlashcards = [...allFlashcards];
        currentIndex = 0;
        updateFlashcardUI();
    } catch (e) { console.error("Error loading flashcards", e); }
}

function populateFlashcardFilters() {
    const modules = [...new Set(allFlashcards.map(card => card.category.split(' - ')[0]))].sort();
    moduleFilterEl.innerHTML = '<option value="All">All Modules</option>';
    modules.forEach(mod => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = mod;
        moduleFilterEl.appendChild(opt);
    });
    populateCategoryFilter('All');
}

function populateCategoryFilter(selectedModule) {
    let categories = (selectedModule === 'All') 
        ? allFlashcards.map(c => c.category.split(' - ')[1] || 'General')
        : allFlashcards.filter(c => c.category.startsWith(selectedModule)).map(c => c.category.split(' - ')[1] || 'General');
    
    categories = [...new Set(categories)].sort();
    categoryFilterEl.innerHTML = '<option value="All">All Categories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = cat;
        categoryFilterEl.appendChild(opt);
    });
}

function handleFlashcardModuleChange(e) {
    populateCategoryFilter(e.target.value);
    applyFlashcardFilters();
}

function applyFlashcardFilters() {
    const mod = moduleFilterEl.value;
    const cat = categoryFilterEl.value;
    
    if (flashcardEl.classList.contains('flipped')) {
        flashcardEl.classList.remove('flipped');
        setTimeout(() => updateFilteredFlashcards(mod, cat), 300);
    } else {
        updateFilteredFlashcards(mod, cat);
    }
}

function updateFilteredFlashcards(mod, cat) {
    let res = [...allFlashcards];
    if (mod !== 'All') res = res.filter(c => c.category.startsWith(mod));
    if (cat !== 'All') res = res.filter(c => (c.category.split(' - ')[1] || 'General') === cat);
    
    filteredFlashcards = res;
    currentIndex = 0;
    filteredFlashcards.length === 0 ? showEmptyState() : updateFlashcardUI();
}

function updateFlashcardUI() {
    if (filteredFlashcards.length === 0) return;
    flashcardEl.classList.remove('flipped');
    const card = filteredFlashcards[currentIndex];
    frontCategoryEl.textContent = backCategoryEl.textContent = card.category;
    frontTextEl.textContent = card.question;
    backTextEl.textContent = card.answer;
    currentIndexEl.textContent = currentIndex + 1;
    totalCardsEl.textContent = filteredFlashcards.length;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === filteredFlashcards.length - 1;
    renderMath(flashcardView);
}

function flipCard() { if (filteredFlashcards.length > 0) flashcardEl.classList.toggle('flipped'); }
function showNextCard() { if (currentIndex < filteredFlashcards.length - 1) { currentIndex++; updateFlashcardUI(); } }
function showPreviousCard() { if (currentIndex > 0) { currentIndex--; updateFlashcardUI(); } }

// --- DASHBOARD LOGIC ---
async function loadDashboards() {
    try {
        const response = await fetch('dashboards_data.json');
        allDashboardsContext = await response.json();
        const moduleNames = Object.keys(allDashboardsContext);
        if (moduleNames.length === 0) return;

        moduleNames.forEach(mod => {
            const opt = document.createElement('option');
            opt.value = opt.textContent = mod;
            moduleFilterDashEl.appendChild(opt);
        });

        loadDashboardModule(moduleNames[0]);
    } catch (e) { console.error("Error loading dashboards", e); }
}

function loadDashboardModule(moduleName) {
    currentModuleData = allDashboardsContext[moduleName] || [];
    currentFilter = 'All';
    filteredModuleData = [...currentModuleData];
    currentSelectedItem = filteredModuleData[0] || null;
    buildTagFilters();
    renderItemList();
    renderDetailView();
}

function buildTagFilters() {
    tagFiltersEl.innerHTML = '';
    const tags = ['All', ...new Set(currentModuleData.map(item => item.Tag).filter(t => t))];
    tags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${tag === currentFilter ? 'active' : ''}`;
        btn.textContent = tag;
        btn.onclick = () => {
            currentFilter = tag;
            Array.from(tagFiltersEl.children).forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            filterDashboardData();
        };
        tagFiltersEl.appendChild(btn);
    });
}

function filterDashboardData() {
    filteredModuleData = (currentFilter === 'All') ? [...currentModuleData] : currentModuleData.filter(i => i.Tag === currentFilter);
    currentSelectedItem = filteredModuleData[0] || null;
    renderItemList();
    renderDetailView();
}

function renderItemList() {
    itemListEl.innerHTML = '';
    filteredModuleData.forEach(item => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = `item-btn ${currentSelectedItem === item ? 'active' : ''}`;
        btn.textContent = item.Name;
        btn.onclick = () => {
            currentSelectedItem = item;
            Array.from(itemListEl.children).forEach(c => c.querySelector('.item-btn').classList.remove('active'));
            btn.classList.add('active');
            renderDetailView();
        };
        li.appendChild(btn);
        itemListEl.appendChild(li);
    });
}

function renderDetailView() {
    if (!currentSelectedItem) {
        detailViewEl.innerHTML = '<div class="empty-state text-center"><p>Select an item.</p></div>';
        return;
    }
    const blocksHtml = currentSelectedItem.details.map((d, i) => `
        <div class="content-block">
            <h3>${d.title}</h3>
            <p id="dash-content-${i}">${d.content}</p>
        </div>
    `).join('');

    detailViewEl.innerHTML = `
        <div class="detail-header">
            <h1 class="detail-title" id="dash-title">${currentSelectedItem.Name}</h1>
            ${currentSelectedItem.Tag ? `<span class="detail-tag">${currentSelectedItem.Tag}</span>` : ''}
        </div>
        <div class="blocks-grid">${blocksHtml}</div>
    `;
    renderMath(detailViewEl);
}

// --- UTILS ---
function renderMath(element) {
    if (window.renderMathInElement) {
        renderMathInElement(element, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false
        });
    }
}

function showEmptyState() {
    frontCategoryEl.textContent = backCategoryEl.textContent = "N/A";
    frontTextEl.textContent = "No flashcards found.";
    currentIndexEl.textContent = 0;
    totalCardsEl.textContent = 0;
}
