import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const EXCEL_FOLDER = './flash_cards_excel_files';
const OUTPUT_FILE = './data.json';
const SRC_DATA_DIR = './src/data';
const SRC_OUTPUT_FILE = './src/data/data.json';
const DASHBOARD_EXCEL_FOLDER = './dashboard_excel_files';
const DASHBOARD_OUTPUT_FILE = './dashboards_data.json';
const SRC_DASHBOARD_OUTPUT_FILE = './src/data/dashboards_data.json';

if (!fs.existsSync(SRC_DATA_DIR)) {
    fs.mkdirSync(SRC_DATA_DIR, { recursive: true });
}

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
        
        // Auto-determine default category from filename
        let defaultCategory = "General";
        const cleanBase = file.replace(/\.csv$/i, '');
        const parts = cleanBase.split('_');
        
        if (cleanBase.toLowerCase().startsWith('endocrine')) {
             const num = parts[1] ? ` ${parts[1]}` : '';
             defaultCategory = `Pathophysiology - Endocrine Module${num}`;
        } else if (parts.length >= 4) {
             const topic = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
             const subject = parts[3].charAt(0).toUpperCase() + parts[3].slice(1);
             defaultCategory = `${subject} - ${topic}`;
        } else if (parts.length === 2) {
             const subject = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
             const topic = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
             defaultCategory = `${subject} - ${topic}`;
        } else {
             defaultCategory = cleanBase.charAt(0).toUpperCase() + cleanBase.slice(1).replace(/_/g, ' ');
        }

        // Check if first line is a header row
        const firstCols = lines.length > 0 ? parseCSVLine(lines[0]) : [];
        const isHeader = firstCols.some(c => /category|question|answer|front|back|stem/i.test(c.trim()));
        const startLineIdx = isHeader ? 1 : 0;

        const hasCategoryCol = firstCols.length >= 3 && /category|module|subject/i.test(firstCols[0].trim());

        for (let i = startLineIdx; i < lines.length; i++) {
            const columns = parseCSVLine(lines[i]);
            if (columns.length >= 2) {
                let cardCat = defaultCategory;
                let question = '';
                let answer = '';

                if (hasCategoryCol && columns.length >= 3) {
                    cardCat = columns[0].trim().replace(/^"|"$/g, '') || defaultCategory;
                    question = columns[1].trim().replace(/^"|"$/g, '');
                    answer = columns.slice(2).join(',').trim().replace(/^"|"$/g, '');
                } else {
                    question = columns[0].trim().replace(/^"|"$/g, '');
                    answer = columns.slice(1).join(',').trim().replace(/^"|"$/g, '');
                }

                if (question && answer && !/question|front|stem/i.test(question)) {
                    allCards.push({
                        category: cardCat,
                        question: question,
                        answer: answer
                    });
                }
            }
        }
        console.log(`✅ Loaded ${lines.length - startLineIdx} lines from: ${file}`);
    });

    const jsonContent = JSON.stringify({ cards: allCards }, null, 2);
    fs.writeFileSync(OUTPUT_FILE, jsonContent);
    fs.writeFileSync(SRC_OUTPUT_FILE, jsonContent);
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
                        let rawCategory = columns[1] ? columns[1].replace(/^"|"$/g, '').trim() : '';
                        let rawSubCategory = columns[2] ? columns[2].replace(/^"|"$/g, '').trim() : '';
                        
                        let tag = (headers[2] && /sub-category|type|group/i.test(headers[2]) && rawSubCategory) ? rawSubCategory : (rawCategory || 'General');
                        
                        if (name) {
                            let entry = { Name: name, Tag: tag, details: [] };
                            const startJ = (headers[2] && /sub-category/i.test(headers[2])) ? 3 : 2;
                            for (let j = startJ; j < headers.length; j++) {
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

    const dashContent = JSON.stringify(dashboards, null, 2);
    fs.writeFileSync(DASHBOARD_OUTPUT_FILE, dashContent);
    fs.writeFileSync(SRC_DASHBOARD_OUTPUT_FILE, dashContent);
    console.log(`🎉 Success! dashboards_data.json updated with ${Object.keys(dashboards).length} modules.`);
}

function updateQuizData() {
    console.log('\n🔍 Scanning for quiz files...');
    const quizFolders = ['./quiz_excel_files', './quizs_excel_files'];
    const quizModules = {};

    quizFolders.forEach(folder => {
        if (!fs.existsSync(folder)) return;
        const files = fs.readdirSync(folder);

        files.forEach(file => {
            const filePath = path.join(folder, file);
            const ext = path.extname(file).toLowerCase();
            if (ext !== '.xlsx' && ext !== '.xls' && ext !== '.csv') return;

            let moduleName = path.basename(file, ext).replace(/_/g, ' ');
            let questions = [];

            if (ext === '.xlsx' || ext === '.xls') {
                const workbook = XLSX.readFile(filePath);
                
                // Find Answer Key sheet if available
                let keySheetName = workbook.SheetNames.find(s => /answer|key|explanation/i.test(s));
                const keysMap = {};
                if (keySheetName) {
                    const keyRows = XLSX.utils.sheet_to_json(workbook.Sheets[keySheetName], { header: 1 });
                    const keyHeaderIdx = keyRows.findIndex(r => r && r.some(c => /correct\s*option|correct\s*answer|correct|^key$/i.test(String(c))));
                    const startIdx = keyHeaderIdx !== -1 ? keyHeaderIdx + 1 : 1;
                    const keyHeaders = keyHeaderIdx !== -1 ? keyRows[keyHeaderIdx].map(h => String(h || '').trim()) : [];
                    
                    const kCorrIdx = keyHeaders.findIndex(c => /correct\s*option|correct\s*answer|correct|^key$/i.test(c));
                    const kExpIdx = keyHeaders.findIndex(c => /explanation|rationale|medical\s*grounding|note/i.test(c));

                    for (let i = startIdx; i < keyRows.length; i++) {
                        const row = keyRows[i];
                        if (row && row.length >= 3) {
                            const qNum = String(row[0] || '').trim();
                            const corrOpt = kCorrIdx !== -1 ? String(row[kCorrIdx] || '').trim() : String(row[2] || row[3] || '').trim();
                            const expl = kExpIdx !== -1 ? String(row[kExpIdx] || '').trim() : String(row[3] || row[4] || '').trim();
                            if (qNum) {
                                keysMap[qNum] = { correct: corrOpt, explanation: expl };
                            }
                        }
                    }
                }

                // Find Main Quiz / Questions Sheet
                let quizSheetName = workbook.SheetNames.find(s => /interactive\s*quiz|quiz|practice|questions|exam/i.test(s));
                if (!quizSheetName) {
                    quizSheetName = workbook.SheetNames.find(s => s !== keySheetName && !/toc|index|contents/i.test(s)) || workbook.SheetNames[0];
                }

                const sheet = workbook.Sheets[quizSheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Find header row with Question & Option columns
                let headerRowIdx = rows.findIndex(r => r && r.some(c => /question\s*text|question\s*stem/i.test(String(c))) && r.some(c => /option\s*a|option\s*b|^a$/i.test(String(c))));
                if (headerRowIdx === -1) {
                    headerRowIdx = rows.findIndex(r => r && r.some(c => /question\s*text|question/i.test(String(c))) && r.some(c => /option|choice|answer/i.test(String(c))));
                }
                if (headerRowIdx === -1) headerRowIdx = 0;

                const headers = (rows[headerRowIdx] || []).map(h => String(h || '').trim());
                
                const catIdx = headers.findIndex(h => /category|module/i.test(h));
                let qIdx = headers.findIndex(h => /question\s*text|question\s*stem|stem|prompt/i.test(h) && !/total\s*question|question\s*count|q#/i.test(h));
                if (qIdx === -1) {
                    qIdx = headers.findIndex(h => /question/i.test(h) && !/total|count|q#|number/i.test(h));
                }
                const optAIdx = headers.findIndex(h => /option\s*a|^a$/i.test(h));
                const optBIdx = headers.findIndex(h => /option\s*b|^b$/i.test(h));
                const optCIdx = headers.findIndex(h => /option\s*c|^c$/i.test(h));
                const optDIdx = headers.findIndex(h => /option\s*d|^d$/i.test(h));
                const optEIdx = headers.findIndex(h => /option\s*e|^e$/i.test(h));
                const ansIdx = headers.findIndex(h => /your\s*answer|correct|answer|key|solution/i.test(h));
                const expIdx = headers.findIndex(h => /explanation|rationale|note/i.test(h));

                for (let i = headerRowIdx + 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length === 0) continue;

                    const qNum = row[0];
                    const questionText = qIdx !== -1 ? String(row[qIdx] || '').trim() : String(row[2] || row[1] || '').trim();
                    if (!questionText || /score\s*card|instruction|total\s*question/i.test(questionText)) continue;

                    let category = moduleName;
                    if (catIdx !== -1 && row[catIdx]) {
                        const candidateCat = String(row[catIdx]).trim();
                        if (candidateCat && candidateCat.toLowerCase() !== questionText.toLowerCase()) {
                            category = candidateCat;
                        }
                    }
                    if (category.toLowerCase() === 'endocrine-1' || category.toLowerCase() === 'endocrine 1') {
                        category = 'Endocrine System Section 1';
                    }
                    
                    const options = [
                        optAIdx !== -1 ? String(row[optAIdx] || '') : String(row[3] || ''),
                        optBIdx !== -1 ? String(row[optBIdx] || '') : String(row[4] || ''),
                        optCIdx !== -1 ? String(row[optCIdx] || '') : String(row[5] || ''),
                        optDIdx !== -1 ? String(row[optDIdx] || '') : String(row[6] || ''),
                        optEIdx !== -1 ? String(row[optEIdx] || '') : String(row[7] || '')
                    ].map(o => o.replace(/^[A-E]\)\s*/i, '').trim()).filter(Boolean);

                    if (options.length === 0) continue;

                    const keyInfo = keysMap[qNum] || {};
                    const rawAns = keyInfo.correct || (ansIdx !== -1 ? String(row[ansIdx] || '').trim() : String(row[8] || '').trim());
                    let correctIndex = 0;

                    if (/^a$|^option\s*a$|^1$/i.test(rawAns)) correctIndex = 0;
                    else if (/^b$|^option\s*b$|^2$/i.test(rawAns)) correctIndex = 1;
                    else if (/^c$|^option\s*c$|^3$/i.test(rawAns)) correctIndex = 2;
                    else if (/^d$|^option\s*d$|^4$/i.test(rawAns)) correctIndex = 3;
                    else if (/^e$|^option\s*e$|^5$/i.test(rawAns)) correctIndex = 4;
                    else {
                        const foundIdx = options.findIndex(opt => opt.toLowerCase() === rawAns.toLowerCase());
                        if (foundIdx !== -1) correctIndex = foundIdx;
                    }

                    let explanation = keyInfo.explanation || (expIdx !== -1 ? String(row[expIdx] || '').trim() : '');
                    if (explanation) {
                        explanation = explanation.replace(/\s*\(\s*(?:Passage|Slide|Page|Source)\b[^)]*\)/gi, '').trim();
                    }

                    questions.push({
                        id: i,
                        category,
                        question: questionText,
                        options,
                        correctIndex,
                        explanation
                    });
                }
            }

            if (questions.length > 0) {
                quizModules[moduleName] = questions;
                console.log(`✅ Loaded ${questions.length} quiz questions for: ${moduleName}`);
            }
        });
    });

    const QUIZ_OUTPUT_FILE = './quizzes_data.json';
    const SRC_QUIZ_OUTPUT_FILE = './src/data/quizzes_data.json';
    const quizContent = JSON.stringify(quizModules, null, 2);
    fs.writeFileSync(QUIZ_OUTPUT_FILE, quizContent);
    fs.writeFileSync(SRC_QUIZ_OUTPUT_FILE, quizContent);
    console.log(`🎉 Success! quizzes_data.json updated with ${Object.keys(quizModules).length} quiz modules.`);
}

updateData();
updateDashboardData();
updateQuizData();
