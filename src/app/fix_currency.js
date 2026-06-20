const fs = require('fs');
const path = require('path');

// 1. Update translations
const transFile = 'c:\\xampp\\htdocs\\hrms_laravel\\bjn_hrms\\frontend\\src\\i18n\\translations.ts';
let transData = fs.readFileSync(transFile, 'utf8');
if (!transData.includes('currency:')) {
    transData = transData.replace('export const ar = {', 'export const ar = {\n    currency: "رس",');
    transData = transData.replace('export const en = {', 'export const en = {\n    currency: "SR",');
    fs.writeFileSync(transFile, transData, 'utf8');
    console.log('Translations updated.');
}

// 2. Find and replace in frontend files
function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Replace " رس" or 'رس' or `رس` with {t('currency')}
            // Mostly they look like "رس" or  رس or 'رس' or `رس`
            // Let's replace "رس" outside of strings or inside
            if (content.includes('رس') && !fullPath.includes('translations.ts')) {
                // There are strings like `رس` or "رس" or just  رس in JSX
                
                // Let's replace >رس< with >{t('currency')}<
                // And " رس" with " {t('currency')}" inside JSX
                
                // Let's just do a regex replace for the common ones found in my grep:
                // {parseFloat(item.total).toFixed(2)} رس
                content = content.replace(/\} رس/g, "} {t('currency')}");
                
                // {item.value} {item.reward_type == 2 ? 'يوم' : 'رس'}
                content = content.replace(/'رس'/g, "t('currency')");
                content = content.replace(/"رس"/g, "t('currency')");

                if (content.includes("t('currency')")) {
                    changed = true;
                    // Inject useLanguage if not present
                    if (!content.includes('useLanguage')) {
                        content = content.replace("from 'react';", "from 'react';\nimport { useLanguage } from '@/contexts/LanguageContext';");
                        content = content.replace("from \"react\";", "from \"react\";\nimport { useLanguage } from '@/contexts/LanguageContext';");
                        // If still no useLanguage import
                        if (!content.includes('@/contexts/LanguageContext')) {
                            content = "import { useLanguage } from '@/contexts/LanguageContext';\n" + content;
                        }
                    }
                    
                    // Inject const { t } = useLanguage();
                    if (!content.includes('const { t } = useLanguage();') && !content.includes('const { t, language } = useLanguage();') && !content.includes('const { language, t } = useLanguage();')) {
                        // find the first component definition
                        const compMatch = content.match(/export default function [A-Za-z0-9_]+\([^)]*\)\s*\{/);
                        if (compMatch) {
                            content = content.replace(compMatch[0], compMatch[0] + "\n  const { t } = useLanguage();");
                        } else {
                            const compMatch2 = content.match(/export default function\([^)]*\)\s*\{/);
                            if (compMatch2) {
                                content = content.replace(compMatch2[0], compMatch2[0] + "\n  const { t } = useLanguage();");
                            }
                        }
                    }
                }
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}

processDir('c:\\xampp\\htdocs\\hrms_laravel\\bjn_hrms\\frontend\\src\\app\\admin');
