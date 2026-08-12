const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const EXCEL_FOLDER = './flash_cards_excel_files';
const OUTPUT_FILE = './data.json';
const DASHBOARD_EXCEL_FOLDER = './dashboard_excel_files';
const DASHBOARD_OUTPUT_FILE = './dashboards_data.json';

// Helper to parse CSV lines correctly (handling quotes and commas)
function parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += c;
        }
    }
    result.push(cur);
    return result;
}

function updateData() {
    console.log('🔍 Scanning for flashcard files...');
    
    if (!fs.existsSync(EXCEL_FOLDER)) {
        console.error(`❌ Folder not found: ${EXCEL_FOLDER}`);
        return;
    }

    const files = fs.readdirSync(EXCEL_FOLDER).filter(f => f.endsWith('.csv'));
    let allCards = [];

    files.forEach(file => {
        const filePath = path.join(EXCEL_FOLDER, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        // Auto-determine category from filename
        // Matches "2_antigen_flashcards_immunology.csv" -> "Immunology - Antigen"
        // Matches "endocrine_1.csv" -> "Pathophysiology - Endocrine Module"
        let category = "General";
        const parts = file.replace('.csv', '').split('_');
        
        if (file.startsWith('endocrine')) {
             const num = parts[1] ? ` ${parts[1]}` : '';
             category = `Pathophysiology - Endocrine Module${num}`;
        } else if (parts.length >= 4) {
             const topic = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
             const subject = parts[3].charAt(0).toUpperCase() + parts[3].slice(1);
             category = `${subject} - ${topic}`;
        } else {
            // Fallback for simpler names like "Pathology_Basics.csv"
            category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        }

        lines.forEach((line) => {
            const columns = parseCSVLine(line);
            if (columns.length >= 2) {
                let question = columns[0].trim().replace(/^"|"$/g, '');
                let answer = columns.slice(1).join(',').trim().replace(/^"|"$/g, '');
                
                if (question && answer) {
                    allCards.push({
                        category: category,
                        question: question,
                        answer: answer
                    });
                }
            }
        });
        console.log(`✅ Loaded ${lines.filter(l => l.trim()).length} lines from: ${file}`);
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allCards, null, 2));
    console.log(`\n🎉 Success! data.json updated with ${allCards.length} total cards.`);
}

function updateDashboardData() {
    console.log('\n🔍 Scanning for dashboard files...');
    
    if (!fs.existsSync(DASHBOARD_EXCEL_FOLDER)) {
        console.log(`ℹ️ Dashboard folder not found (${DASHBOARD_EXCEL_FOLDER}), skipping dashboard generation.`);
        return;
    }

    const files = fs.readdirSync(DASHBOARD_EXCEL_FOLDER).filter(f => f.endsWith('.csv') || f.endsWith('.xlsx'));
    let dashboards = {};

    files.forEach(file => {
        const filePath = path.join(DASHBOARD_EXCEL_FOLDER, file);
        let rawModuleName = file.replace(/\.(csv|xlsx)$/i, '').replace(/[-_]/g, ' ');
        const moduleName = rawModuleName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        let moduleData = [];

        if (file.endsWith('.xlsx')) {
            const workbook = XLSX.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            let headerRowIndex = -1;
            let headers = [];

            for (let i = 0; i < rawRows.length; i++) {
                const row = rawRows[i];
                if (row && row[0] && row[0].toString().trim().toLowerCase() === 'name') {
                    headerRowIndex = i;
                    headers = row.map(h => h ? h.toString().trim() : '');
                    break;
                }
            }

            if (headerRowIndex !== -1) {
                for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
                    const row = rawRows[i];
                    if (!row || row.length < 2) continue;

                    const name = row[0] ? row[0].toString().trim() : '';
                    const tag = row[1] ? row[1].toString().trim() : '';

                    if (!name || name.startsWith('Total ')) continue;

                    let entry = { Name: name, Tag: tag || 'General', details: [] };

                    for (let j = 2; j < headers.length; j++) {
                        const headerTitle = headers[j];
                        if (!headerTitle || headerTitle.toLowerCase().includes('database metrics')) continue;

                        const val = row[j] ? row[j].toString().trim() : '';
                        if (val) {
                            entry.details.push({
                                title: headerTitle,
                                content: val
                            });
                        }
                    }

                    if (entry.details.length > 0) {
                        moduleData.push(entry);
                    }
                }
            }
        } else {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
            
            if (lines.length >= 2) {
                const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());

                for (let i = 1; i < lines.length; i++) {
                    const columns = parseCSVLine(lines[i]);
                    if (columns.length >= 2) {
                        let name = columns[0].replace(/^"|"$/g, '').trim();
                        let tag = columns[1].replace(/^"|"$/g, '').trim();
                        
                        if (name) {
                            let entry = { Name: name, Tag: tag, details: [] };
                            for (let j = 2; j < headers.length; j++) {
                                let val = columns[j] ? columns[j].replace(/^"|"$/g, '').trim() : '';
                                if (val) {
                                    entry.details.push({
                                        title: headers[j],
                                        content: val
                                    });
                                }
                            }
                            moduleData.push(entry);
                        }
                    }
                }
            }
        }
        
        dashboards[moduleName] = moduleData;
        console.log(`✅ Loaded ${moduleData.length} entries for dashboard module: ${moduleName}`);
    });

    fs.writeFileSync(DASHBOARD_OUTPUT_FILE, JSON.stringify(dashboards, null, 2));
    console.log(`🎉 Success! dashboards_data.json updated with ${Object.keys(dashboards).length} modules.`);
}

updateData();
updateDashboardData();
