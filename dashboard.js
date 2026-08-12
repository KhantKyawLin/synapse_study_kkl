let allDashboardsContext = {};
let currentModuleData = [];
let filteredModuleData = [];
let currentSelectedItem = null;
let currentFilter = 'All';

// DOM Elements
const moduleFilterEl = document.getElementById('moduleFilter');
const tagFiltersEl = document.getElementById('tagFilters');
const itemSelectEl = document.getElementById('itemSelect');
const itemListEl = document.getElementById('itemList');
const detailViewEl = document.getElementById('detailView');

document.addEventListener('DOMContentLoaded', () => {
    loadDashboards();
    
    moduleFilterEl.addEventListener('change', handleModuleChange);
});

async function loadDashboards() {
    try {
        const response = await fetch('dashboards_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allDashboardsContext = await response.json();
        
        const moduleNames = Object.keys(allDashboardsContext);
        if (moduleNames.length === 0) {
            detailViewEl.innerHTML = '<div class="empty-state text-center"><p>No dashboard modules found. Please add CSS/Excel files to dashboard_excel_files and run update.</p></div>';
            return;
        }

        // Populate Module Dropdown
        moduleNames.forEach(mod => {
            const option = document.createElement('option');
            option.value = mod;
            option.textContent = mod;
            moduleFilterEl.appendChild(option);
        });

        // Initialize first module
        loadModule(moduleNames[0]);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Dashboards loaded successfully!',
            showConfirmButton: false,
            timer: 2000,
            background: 'rgba(30, 36, 45, 0.95)',
            color: '#fff'
        });

    } catch (error) {
        console.error("Could not load dashboards:", error);
        detailViewEl.innerHTML = '<div class="empty-state text-center"><p>Error loading data. Make sure to run npm run update.</p></div>';
    }
}

function handleModuleChange(e) {
    loadModule(e.target.value);
}

function loadModule(moduleName) {
    currentModuleData = allDashboardsContext[moduleName] || [];
    currentFilter = 'All';
    filteredModuleData = [...currentModuleData];
    currentSelectedItem = filteredModuleData.length > 0 ? filteredModuleData[0] : null;

    buildTagFilters();
    renderItemList();
    renderDetailView();
}

function buildTagFilters() {
    tagFiltersEl.innerHTML = '';
    
    // Get unique tags
    const tags = [...new Set(currentModuleData.map(item => item.Tag).filter(t => t))];
    
    // Always add 'All'
    tags.unshift('All');

    tags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${tag === currentFilter ? 'active' : ''}`;
        btn.textContent = tag;
        btn.onclick = () => {
            currentFilter = tag;
            // Update active visually
            Array.from(tagFiltersEl.children).forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            
            filterData();
        };
        tagFiltersEl.appendChild(btn);
    });
}

function filterData() {
    if (currentFilter === 'All') {
        filteredModuleData = [...currentModuleData];
    } else {
        filteredModuleData = currentModuleData.filter(item => item.Tag === currentFilter);
    }
    
    // Auto select first item if available
    currentSelectedItem = filteredModuleData.length > 0 ? filteredModuleData[0] : null;
    
    renderItemList();
    renderDetailView();
}

function renderItemList() {
    if (itemSelectEl) {
        itemSelectEl.innerHTML = '';
        if (filteredModuleData.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No items found';
            itemSelectEl.appendChild(opt);
        } else {
            filteredModuleData.forEach((item, index) => {
                const opt = document.createElement('option');
                opt.value = index;
                opt.textContent = item.Name;
                if (item === currentSelectedItem) opt.selected = true;
                itemSelectEl.appendChild(opt);
            });
        }

        itemSelectEl.onchange = (e) => {
            const idx = parseInt(e.target.value, 10);
            if (!isNaN(idx) && filteredModuleData[idx]) {
                currentSelectedItem = filteredModuleData[idx];
                renderDetailView();
            }
        };
    }

    if (itemListEl) {
        itemListEl.innerHTML = '';
        filteredModuleData.forEach(item => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = `item-btn ${currentSelectedItem === item ? 'active' : ''}`;
            btn.textContent = item.Name;
            
            btn.onclick = () => {
                currentSelectedItem = item;
                // Update active visually
                if (itemListEl.children.length > 0) {
                    Array.from(itemListEl.children).forEach(c => {
                        const b = c.querySelector('.item-btn');
                        if (b) b.classList.remove('active');
                    });
                }
                btn.classList.add('active');
                
                renderDetailView();
            };
            
            li.appendChild(btn);
            itemListEl.appendChild(li);
        });
    }
}

function renderDetailView() {
    if (!currentSelectedItem) {
        detailViewEl.innerHTML = '<div class="empty-state text-center"><p>Select an item to view details.</p></div>';
        return;
    }

    let blocksHtml = currentSelectedItem.details.map((detail, index) => {
        return `
            <div class="content-block">
                <h3>${detail.title}</h3>
                <p id="content-p-${index}">${detail.content}</p>
            </div>
        `;
    }).join('');

    detailViewEl.innerHTML = `
        <div class="detail-header">
            <h1 class="detail-title" id="detail-title-math">${currentSelectedItem.Name}</h1>
            ${currentSelectedItem.Tag ? `<span class="detail-tag">${currentSelectedItem.Tag}</span>` : ''}
        </div>
        <div class="blocks-grid">
            ${blocksHtml}
        </div>
    `;

    // Render Math Formulas synchronously on specific content text elements
    if (window.renderMathInElement) {
        const katexOptions = {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false
        };
        
        const titleEl = document.getElementById('detail-title-math');
        if (titleEl) renderMathInElement(titleEl, katexOptions);

        currentSelectedItem.details.forEach((_, index) => {
            const pEl = document.getElementById(`content-p-${index}`);
            if (pEl) renderMathInElement(pEl, katexOptions);
        });
    } else {
        setTimeout(renderDetailView, 100);
    }
}
