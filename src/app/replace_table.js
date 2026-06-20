const fs = require('fs');
const file = 'c:\\xampp\\htdocs\\hrms_laravel\\bjn_hrms\\frontend\\src\\app\\admin\\employees\\show\\[id]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldTable = `                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">الشهر المالي</th>
                        <th className="px-4 py-3">الراتب الأساسي</th>
                        <th className="px-4 py-3">الصافي</th>
                        <th className="px-4 py-3">تاريخ الأرشفة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryArchiveData.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-900">{item.finance_month?.name || '---'} {item.finance_month?.year}</td>
                          <td className="px-4 py-3 font-bold text-indigo-600">{item.emp_sal}</td>
                          <td className="px-4 py-3 font-black text-emerald-600">{item.final_the_net}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-medium">{new Date(item.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>`;

const newTable = `                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">تاريخ ووقت الأرشفة</th>
                        <th className="px-4 py-3">الراتب</th>
                        <th className="px-4 py-3">الإضافة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryArchiveData.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-xs text-slate-500 font-medium">{new Date(item.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                          <td className="px-4 py-3 font-bold text-indigo-600">{item.value}</td>
                          <td className="px-4 py-3 text-slate-700">{item.added?.name || '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>`;

if (content.includes('item.final_the_net') && content.includes('item.finance_month?.name')) {
    // Regex replace to avoid exact spacing mismatch
    content = content.replace(/<table className="w-full text-sm text-right">[\s\S]*?<\/table>/g, newTable);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Replaced table');
} else {
    console.log('Table not found');
}
