let allFlashcards = [];
let filteredFlashcards = [];
let currentIndex = 0;

// DOM Elements
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

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadFlashcards();

    // Event Listeners
    flashcardEl.addEventListener('click', flipCard);
    prevBtn.addEventListener('click', showPreviousCard);
    nextBtn.addEventListener('click', showNextCard);
    moduleFilterEl.addEventListener('change', handleModuleChange);
    categoryFilterEl.addEventListener('change', handleCategoryChange);
});

// Fetch data from data.json
async function loadFlashcards() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allFlashcards = await response.json();

        if (allFlashcards.length === 0) {
            showEmptyState();
            return;
        }

        populateFilters();

        // Initialize with all cards
        filteredFlashcards = [...allFlashcards];
        currentIndex = 0;

        updateUI();

        // Successful load sweet alert
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Flashcards loaded successfully!',
            showConfirmButton: false,
            timer: 2000,
            background: 'rgba(30, 36, 45, 0.95)',
            color: '#fff'
        });

    } catch (error) {
        console.error("Could not load flashcards:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to load flashcards. Please check if data.json exists.',
            background: 'rgba(30, 36, 45, 0.95)',
            color: '#fff',
            confirmButtonColor: '#1ea1f2'
        });
    }
}

// Extract modules and categories then populate filters
function populateFilters() {
    const modules = [...new Set(allFlashcards.map(card => card.category.split(' - ')[0]))].sort();
    
    // Clear and populate Module filter
    moduleFilterEl.innerHTML = '<option value="All">All Modules</option>';
    modules.forEach(mod => {
        const option = document.createElement('option');
        option.value = mod;
        option.textContent = mod;
        moduleFilterEl.appendChild(option);
    });

    // Initialize Category filter
    populateCategoryFilter('All');
}

function populateCategoryFilter(selectedModule) {
    let categories = [];
    
    if (selectedModule === 'All') {
        categories = [...new Set(allFlashcards.map(card => card.category.split(' - ')[1] || 'General'))];
    } else {
        categories = [...new Set(allFlashcards.filter(card => card.category.startsWith(selectedModule)).map(card => card.category.split(' - ')[1] || 'General'))];
    }
    
    categories.sort();
    
    categoryFilterEl.innerHTML = '<option value="All">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilterEl.appendChild(option);
    });
}

// Handle module selection
function handleModuleChange(e) {
    const selectedModule = e.target.value;
    populateCategoryFilter(selectedModule);
    applyFilters();
}

// Handle category selection
function handleCategoryChange(e) {
    applyFilters();
}

function applyFilters() {
    const selectedModule = moduleFilterEl.value;
    const selectedCategory = categoryFilterEl.value;
    
    if (flashcardEl.classList.contains('flipped')) {
        flashcardEl.classList.remove('flipped');
        setTimeout(() => updateFilteredCards(selectedModule, selectedCategory), 300);
    } else {
        updateFilteredCards(selectedModule, selectedCategory);
    }
}

function updateFilteredCards(selectedModule, selectedCategory) {
    let result = [...allFlashcards];
    
    if (selectedModule !== 'All') {
        result = result.filter(card => card.category.startsWith(selectedModule));
    }
    
    if (selectedCategory !== 'All') {
        result = result.filter(card => (card.category.split(' - ')[1] || 'General') === selectedCategory);
    }
    
    filteredFlashcards = result;
    currentIndex = 0;

    if (filteredFlashcards.length === 0) {
        showEmptyState();
    } else {
        updateUI();
    }
}

// Flip Card Animation
function flipCard() {
    if (filteredFlashcards.length > 0) {
        flashcardEl.classList.toggle('flipped');
    }
}

// Show specific card based on index
function updateUI() {
    if (filteredFlashcards.length === 0) return;

    const currentCard = filteredFlashcards[currentIndex];

    // Update text
    frontCategoryEl.textContent = currentCard.category;
    frontTextEl.textContent = currentCard.question;

    backCategoryEl.textContent = currentCard.category;
    backTextEl.textContent = currentCard.answer;

    // Update counter
    currentIndexEl.textContent = currentIndex + 1;
    totalCardsEl.textContent = filteredFlashcards.length;

    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === filteredFlashcards.length - 1;

    // Render Math Formulas (LaTeX) synchronously on specific text elements ONLY to preserve smooth flipping transitions
    // Added a small recursive check in case the library is slightly slow on Vercel
    const renderMath = () => {
        if (window.renderMathInElement) {
            const katexOptions = {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            };
            renderMathInElement(frontTextEl, katexOptions);
            renderMathInElement(backTextEl, katexOptions);
        } else {
            // Retry once if library is not yet available
            setTimeout(renderMath, 100);
        }
    };
    
    renderMath();
}

// Navigation Logic
function showNextCard() {
    if (currentIndex < filteredFlashcards.length - 1) {
        // Reset flip state if needed
        let waitTime = 0;
        if (flashcardEl.classList.contains('flipped')) {
            flashcardEl.classList.remove('flipped');
            waitTime = 300; // time to wait for slightly un-flipping before changing text
        }

        setTimeout(() => {
            currentIndex++;
            updateUI();
        }, waitTime);
    }
}

function showPreviousCard() {
    if (currentIndex > 0) {
        // Reset flip state if needed
        let waitTime = 0;
        if (flashcardEl.classList.contains('flipped')) {
            flashcardEl.classList.remove('flipped');
            waitTime = 300;
        }

        setTimeout(() => {
            currentIndex--;
            updateUI();
        }, waitTime);
    }
}

function showEmptyState() {
    frontCategoryEl.textContent = "N/A";
    frontTextEl.textContent = "No flashcards found for this category.";
    backCategoryEl.textContent = "N/A";
    backTextEl.textContent = "No flashcards found.";
    currentIndexEl.textContent = 0;
    totalCardsEl.textContent = 0;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
}
