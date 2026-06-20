const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Find }.toFixed(2)} [any currency] -> }.toFixed(2)} {t('currency')}
            // Match exactly .toFixed(2)} followed by space and then any Arabic text or Y.R or similar
            // e.g. .toFixed(2)} د.ك
            
            // replace all .toFixed(2)} [anything not <] <
            // wait, it could be inside text node, so:
            // .toFixed(2)} د.ك</span>
            const regex = /\.toFixed\(2\)\}\s*([^\s<]+)(\s*\/[^\s<]+)?/g;
            content = content.replace(regex, (match, currency, extra) => {
                // if currency is already {t('currency')}, skip
                if (match.includes("{t('currency')}")) return match;
                changed = true;
                if (extra) {
                    return `.toFixed(2)} {t('currency')}${extra}`;
                }
                return `.toFixed(2)} {t('currency')}`;
            });

            if (changed) {
                if (!content.includes('useLanguage')) {
                    content = content.replace("from 'react';", "from 'react';\nimport { useLanguage } from '@/contexts/LanguageContext';");
                    if (!content.includes('@/contexts/LanguageContext')) {
                        content = "import { useLanguage } from '@/contexts/LanguageContext';\n" + content;
                    }
                }
                
                if (!content.includes('const { t }') && !content.includes('const { t, language }') && !content.includes('const { language, t }')) {
                    const compMatch = content.match(/export default function [A-Za-z0-9_]+\([^)]*\)\s*\{/);
                    if (compMatch) {
                        content = content.replace(compMatch[0], compMatch[0] + "\n  const { t } = useLanguage();");
                    }
                }
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}

processDir('c:\\xampp\\htdocs\\hrms_laravel\\bjn_hrms\\frontend\\src\\app\\admin');
