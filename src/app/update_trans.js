const fs = require('fs');
const file = 'c:\\xampp\\htdocs\\hrms_laravel\\bjn_hrms\\frontend\\src\\i18n\\translations.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('currency:')) {
    content = content.replace('ar: {', 'ar: {\n    currency: "رس",');
    content = content.replace('en: {', 'en: {\n    currency: "SR",');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added currency to translations');
} else {
    console.log('Currency already in translations');
}
