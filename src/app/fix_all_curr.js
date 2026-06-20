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

            // Check for د.ك
            if (content.includes('د.ك') || content.includes('رس')) {
                // replace >د.ك< with >{t('currency')}<
                content = content.replace(/>\s*د\.ك\s*</g, ">{t('currency')}<");
                content = content.replace(/>\s*رس\s*</g, ">{t('currency')}<");
                
                // replace " د.ك" with " {t('currency')}"
                content = content.replace(/\sد\.ك/g, " {t('currency')}");
                content = content.replace(/\sرس/g, " {t('currency')}");
                
                content = content.replace(/د\.ك\s/g, "{t('currency')} ");
                content = content.replace(/رس\s/g, "{t('currency')} ");
                
                content = content.replace(/"د\.ك"/g, "t('currency')");
                content = content.replace(/'د\.ك'/g, "t('currency')");
                
                content = content.replace(/"رس"/g, "t('currency')");
                content = content.replace(/'رس'/g, "t('currency')");

                // In case it's exactly } د.ك
                content = content.replace(/\}\s*د\.ك/g, "} {t('currency')}");
                content = content.replace(/\}\s*رس/g, "} {t('currency')}");

                if (content.includes("t('currency')")) {
                    changed = true;
                    if (!content.includes('useLanguage')) {
                        content = content.replace("from 'react';", "from 'react';\nimport { useLanguage } from '@/contexts/LanguageContext';");
                        content = content.replace("from \"react\";", "from \"react\";\nimport { useLanguage } from '@/contexts/LanguageContext';");
                        if (!content.includes('@/contexts/LanguageContext')) {
                            content = "import { useLanguage } from '@/contexts/LanguageContext';\n" + content;
                        }
                    }
                    
                    if (!content.includes('const { t }') && !content.includes('const { t, language }') && !content.includes('const { language, t }')) {
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
