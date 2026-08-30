import { ModuleGroup } from '@/types';

// Full Permissions Dictionary grouped by modules
export const PERMISSION_MODULES: ModuleGroup[] = [
  {
    id: 'dashboard',
    titleAr: '📈 لوحة القيادة والمؤشرات',
    titleEn: 'Dashboard & Analytics',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    colorClass: 'border-teal-200 bg-teal-50/30 text-teal-900',
    badgeClass: 'bg-teal-100 text-teal-800',
    permissions: [
      { key: 'view_dashboard', labelAr: 'الوصول للوحة القيادة (ملخصي الشخصي)', labelEn: 'Access Portal Dashboard', descAr: 'السماح للمستخدم بالدخول لبوابة النظام واستعراض ملخصه الشخصي', descEn: 'Allow user to access the portal and view personal summary', isReadOnly: true },
      { key: 'view_company_dashboard', labelAr: 'عرض إحصائيات الشركة', labelEn: 'View Company Dashboard', descAr: 'عرض المؤشرات والإحصائيات العامة للشركة والموظفين في لوحة القيادة', descEn: 'View overall company statistics and metrics on the dashboard', isReadOnly: true },
    ]
  },
  {
    id: 'employees',
    titleAr: '👥 إدارة الموظفين والسجلات',
    titleEn: 'Employees & Profiles',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    colorClass: 'border-emerald-200 bg-emerald-50/30 text-emerald-900',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    permissions: [
      { key: 'view_employees', labelAr: 'عرض الموظفين والسجلات', labelEn: 'View Employees', descAr: 'عرض قائمة الموظفين واستعراض ملفاتهم وسجلاتهم الشخصية', descEn: 'View employee list and browse detailed profile records', isReadOnly: true },
      { key: 'create_employees', labelAr: 'إضافة موظف جديد', labelEn: 'Create Employee', descAr: 'إضافة وتسجيل موظف جديد بالنظام واستكمال بياناته الأساسية', descEn: 'Add new employee and complete initial onboard records' },
      { key: 'edit_employees', labelAr: 'تعديل بيانات موظف', labelEn: 'Edit Employee', descAr: 'تحديث البيانات الشخصية، الوظيفية، ومستندات الموظف', descEn: 'Update employee personal, job, and document details' },
      { key: 'delete_employees', labelAr: 'حذف/استبعاد موظف', labelEn: 'Delete Employee', descAr: 'حذف أو إنهاء ملف موظف واستبعاده من القوائم النشطة', descEn: 'Delete or archive employee from active lists' },
      { key: 'toggle_employee_login', labelAr: 'تفعيل/تعطيل دخول الموظف', labelEn: 'Toggle Employee Login', descAr: 'إدارة تفعيل أو إيقاف إمكانية دخول الموظف إلى النظام', descEn: 'Enable or disable employee account login access' },
      { key: 'manage_employee_financials', labelAr: 'إدارة البيانات المالية للموظف', labelEn: 'Manage Employee Financials', descAr: 'إدارة وتخصيص الراتب الأساسي والبدلات الثابتة لكل موظف', descEn: 'Configure basic salary and fixed allowances per employee' },
    ]
  },
  {
    id: 'attendances',
    titleAr: '⏰ الحضور والبصمة وشفتات العمل',
    titleEn: 'Attendance & Work Shifts',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    colorClass: 'border-indigo-200 bg-indigo-50/30 text-indigo-900',
    badgeClass: 'bg-indigo-100 text-indigo-800',
    permissions: [
      { key: 'view_attendances', labelAr: 'عرض سجلات البصمة والحضور', labelEn: 'View Attendances', descAr: 'الاطلاع على كشوفات حركة البصمات، الحضور، والتأخيرات', descEn: 'View log records of punches, attendances, and delays', isReadOnly: true },
      { key: 'manage_attendances', labelAr: 'إدارة وتسجيل الحضور اليدوي', labelEn: 'Manage Attendance Logs', descAr: 'إضافة أو تعديل بصمات وسجلات الحضور والغياب يدويًا', descEn: 'Manually add or edit attendance punches and log records' },
      { key: 'sync_biotime', labelAr: 'مزامنة أجهزة البصمة (BioTime)', labelEn: 'Sync BioTime Devices', descAr: 'إمكانية سحب ومزامنة الحركات آليًا من أجهزة البصمة BioTime', descEn: 'Trigger automatic log fetch and sync from BioTime' },
      { key: 'view_shifts', labelAr: 'عرض الشفتات ومواعيد العمل', labelEn: 'View Shifts', descAr: 'استعراض وراديات مواعيد العمل الرسمية والشفتات المعتمدة', descEn: 'View official shift types and assigned working hours', isReadOnly: true },
      { key: 'manage_shifts', labelAr: 'إدارة وتعديل الشفتات', labelEn: 'Manage Work Shifts', descAr: 'إنشاء وتعديل الشفتات وتوزيع مواعيد الحضور والانصراف', descEn: 'Create, update, and manage shifts and schedule timings' },
    ]
  },
  {
    id: 'salaries',
    titleAr: '💵 الرواتب ومسيرات الأجور',
    titleEn: 'Salaries & Payroll',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    colorClass: 'border-amber-200 bg-amber-50/30 text-amber-900',
    badgeClass: 'bg-amber-100 text-amber-800',
    permissions: [
      { key: 'view_salaries', labelAr: 'عرض مسيرات الرواتب والشهر المالي', labelEn: 'View Salaries Payroll', descAr: 'الاطلاع على كشوفات مسيرات الرواتب التفصيلية للموظفين', descEn: 'Access company monthly salary payroll statements', isReadOnly: true },
      { key: 'view_own_salary', labelAr: 'عرض الراتب وقسيمة المرتب الشخصية', labelEn: 'View Own Salary Slip', descAr: 'تمكين الموظف من عرض مسير راتبه وقسيمة مرتبه الخاصة فقط', descEn: 'Allow user to view only their personal salary breakdown', isReadOnly: true },
      { key: 'manage_salaries', labelAr: 'إعداد واحتساب الرواتب الشهري', labelEn: 'Manage Payroll Calculation', descAr: 'معالجة وتعديل متغيرات ومسيرات الرواتب الشهرية', descEn: 'Calculate and modify monthly salary records' },
      { key: 'archive_salaries', labelAr: 'اعتماد وأرشفة الشهر المالي', labelEn: 'Archive Financial Month', descAr: 'إغلاق الشهر المالي نهائياً واعتماد صرف مسير الرواتب', descEn: 'Close financial calendar month and lock payroll' },
      { key: 'view_salary_slips', labelAr: 'طباعة وقسائم المرتب (Salary Slips)', labelEn: 'View Salary Slips', descAr: 'عرض وطباعة وتصدير قسيمة مفردات مرتب الموظف', descEn: 'View and export individual employee pay slips', isReadOnly: true },
    ]
  },
  {
    id: 'financials',
    titleAr: '💳 السلف والخصومات والمكافآت والبدلات',
    titleEn: 'Loans, Deductions & Rewards',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    colorClass: 'border-purple-200 bg-purple-50/30 text-purple-900',
    badgeClass: 'bg-purple-100 text-purple-800',
    permissions: [
      { key: 'view_loans', labelAr: 'عرض السلف والقروض الشهري', labelEn: 'View Monthly Loans', descAr: 'الاطلاع على طلبات وسجلات السلف والقروض الشهرية', descEn: 'View short-term employee loan requests and logs', isReadOnly: true },
      { key: 'manage_loans', labelAr: 'إدارة وإنشاء السلف القريبة', labelEn: 'Manage Monthly Loans', descAr: 'إضافة وتعديل والموافقة على السلف والقروض الشهرية', descEn: 'Create, update, and approve monthly employee loans' },
      { key: 'view_permanent_loans', labelAr: 'عرض السلف المستمرة (طويلة الأجل)', labelEn: 'View Permanent Loans', descAr: 'استعراض أقساط وسجلات القروض المستمرة طويلة الأجل', descEn: 'View long-term recurring loan installment plans', isReadOnly: true },
      { key: 'manage_permanent_loans', labelAr: 'إدارة وجدولة السلف المستمرة', labelEn: 'Manage Permanent Loans', descAr: 'إنشاء وتعديل ومتابعة تحصيل السلف المستمرة', descEn: 'Create and modify recurring long-term loan plans' },
      { key: 'view_sanctions', labelAr: 'عرض لائحة الجزاءات والعقوبات', labelEn: 'View Sanctions', descAr: 'الاطلاع على خصومات الجزاءات المسجلة بحق الموظفين', descEn: 'View disciplinary sanctions and penalty log', isReadOnly: true },
      { key: 'manage_sanctions', labelAr: 'إدارة وتطبيق الجزاءات والعقوبات', labelEn: 'Manage Sanctions', descAr: 'إضافة وتعديل وحذف جزاءات أيام أو ساعات الخصم', descEn: 'Apply or modify employee disciplinary deductions' },
      { key: 'view_discounts', labelAr: 'عرض الخصومات المباشرة', labelEn: 'View Discounts', descAr: 'الاطلاع على استقطاعات الخصومات المالية المباشرة', descEn: 'View direct financial deduction records', isReadOnly: true },
      { key: 'manage_discounts', labelAr: 'إدارة الخصومات الاستقطاعية', labelEn: 'Manage Discounts', descAr: 'تسجيل وتعديل الخصومات الاستقطاعية المباشرة', descEn: 'Add and manage direct payroll deductions' },
      { key: 'view_absences', labelAr: 'عرض أيام وسجلات الغياب', labelEn: 'View Absences', descAr: 'الاطلاع على كشوفات وأيام غياب الموظفين بدون عذر', descEn: 'View employee absence days and logs', isReadOnly: true },
      { key: 'manage_absences', labelAr: 'إدارة وتسجيل أيام الغياب', labelEn: 'Manage Absences', descAr: 'إضافة وتعديل خصومات وتأكيدات غياب الموظفين', descEn: 'Record and edit unexcused absence days' },
      { key: 'view_rewards', labelAr: 'عرض المكافآت والحوافز المالية', labelEn: 'View Rewards', descAr: 'الاطلاع على سجلات المكافآت التشجيعية الممنوحة', descEn: 'View employee financial reward records', isReadOnly: true },
      { key: 'manage_rewards', labelAr: 'إدارة وصرف المكافآت والحوافز', labelEn: 'Manage Rewards', descAr: 'إضافة واحتساب المكافآت والجوائز المالية للموظفين', descEn: 'Create and assign performance bonuses/rewards' },
      { key: 'view_additions', labelAr: 'عرض مستحقات الإضافي', labelEn: 'View Additions', descAr: 'استعراض سجلات وساعات العمل الإضافي المحسوبة', descEn: 'View calculated overtime addition records', isReadOnly: true },
      { key: 'manage_additions', labelAr: 'إدارة العمل الإضافي والمكافآت', labelEn: 'Manage Additions', descAr: 'تسجيل واحتساب ساعات وأيام المستحقات الإضافية', descEn: 'Add and approve overtime compensation days' },
      { key: 'view_allowances', labelAr: 'عرض البدلات والتعويضات', labelEn: 'View Allowances', descAr: 'الاطلاع على البدلات المالية المتغيرة والثابتة', descEn: 'View employee allowance types and amounts', isReadOnly: true },
      { key: 'manage_allowances', labelAr: 'إدارة البدلات المالية المتغيرة', labelEn: 'Manage Allowances', descAr: 'تخصيص وتعديل بدلات الانتقال، السكن، وغيرها', descEn: 'Manage variable and custom employee allowances' },
    ]
  },
  {
    id: 'settings',
    titleAr: '🏢 الهيكل التنفيذي والنظام',
    titleEn: 'Company & Organization Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    colorClass: 'border-cyan-200 bg-cyan-50/30 text-cyan-900',
    badgeClass: 'bg-cyan-100 text-cyan-800',
    permissions: [
      { key: 'view_settings', labelAr: 'عرض إعدادات الشركة والنظام', labelEn: 'View Settings', descAr: 'الاطلاع على بيانات الشركة ولوائح النظام الداخلية', descEn: 'View company settings and policies', isReadOnly: true },
      { key: 'manage_settings', labelAr: 'إدارة وتعديل إعدادات الشركة', labelEn: 'Manage System Settings', descAr: 'تعديل السياسات العامة للخصم وتوقيت التأخير واللائحة', descEn: 'Modify general company settings and HR rules' },
      { key: 'manage_branches', labelAr: 'إدارة الفروع والمواقع', labelEn: 'Manage Branches', descAr: 'إضافة وتعديل فروع الشركة والمواقع الجغرافية', descEn: 'Create and update company branch locations' },
      { key: 'manage_departments', labelAr: 'إدارة الأقسام والادارات', labelEn: 'Manage Departments', descAr: 'إنشاء وتعديل الهيكل الهرمي للأقسام والإدارات', descEn: 'Structure company departments and units' },
      { key: 'manage_jobs_categories', labelAr: 'إدارة الوظائف والتصنيفات', labelEn: 'Manage Job Titles', descAr: 'إدارة قائمة المسميات والتصنيفات المهنية', descEn: 'Define job categories and official titles' },
      { key: 'manage_qualifications', labelAr: 'إدارة المؤهلات العلمية', labelEn: 'Manage Qualifications', descAr: 'إضافة وتحديث الدرجات والتخصصات الأكاديمية', descEn: 'Manage qualification types and degrees' },
      { key: 'manage_occasions', labelAr: 'إدارة المناسبات والعطلات', labelEn: 'Manage Holidays', descAr: 'تحديد وتأكيد الإجازات والعطلات الرسمية بالشركة', descEn: 'Set official holidays and company occasions' },
      { key: 'manage_resignations', labelAr: 'إدارة طلبات الاستقالة', labelEn: 'Manage Resignations', descAr: 'متابعة وإجراءات الاستقالات وتصفية المستحقات', descEn: 'Handle employee resignations and terminations' },
      { key: 'manage_general_constants', labelAr: 'إدارة الثوابت العامة', labelEn: 'Manage System Constants', descAr: 'إدارة قواميس النظام (الجنسيات، الديانة، البلدان،...)', descEn: 'Manage nationalities, religions, and lookup lists' },
    ]
  },
  {
    id: 'roles',
    titleAr: '🛡️ الأدوار والتحكم بالصلاحيات',
    titleEn: 'Roles & Access Control',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    colorClass: 'border-blue-200 bg-blue-50/30 text-blue-900',
    badgeClass: 'bg-blue-100 text-blue-800',
    permissions: [
      { key: 'view_roles', labelAr: 'عرض الأدوار والصلاحيات', labelEn: 'View Roles', descAr: 'الاطلاع على الأدوار الوظيفية وقوائم الصلاحيات المتاحة', descEn: 'View role list and permission matrix', isReadOnly: true },
      { key: 'manage_roles', labelAr: 'إدارة الأدوار وتخصيص الصلاحيات', labelEn: 'Manage Roles', descAr: 'إنشاء وتعديل وحذف الأدوار وتوزيع صلاحيات الاستخدام', descEn: 'Create, update, delete roles and grant permissions' },
    ]
  },
  {
    id: 'reports',
    titleAr: '📊 التقارير والإحصائيات',
    titleEn: 'Reports & Analytics',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    colorClass: 'border-rose-200 bg-rose-50/30 text-rose-900',
    badgeClass: 'bg-rose-100 text-rose-800',
    permissions: [
      { key: 'view_employee_reports', labelAr: 'تقارير الموظفين والسجلات الذاتية', labelEn: 'Employee Reports', descAr: 'استخراج وتصدير تقارير وشامل ملفات الموظفين', descEn: 'Generate and export full employee master reports', isReadOnly: true },
      { key: 'view_attendance_reports', labelAr: 'تقارير الحضور والغياب والتأخير', labelEn: 'Attendance Reports', descAr: 'تصدير كشوفات الالتزام، ساعات العمل، والتأخيرات', descEn: 'Export attendance, lateness, and absence reports', isReadOnly: true },
      { key: 'view_payroll_reports', labelAr: 'تقارير مسيرات وكشوف الرواتب', labelEn: 'Payroll Reports', descAr: 'طباعة وتصدير كشوف الإجمالي والاستقطاعات للرواتب', descEn: 'Export total monthly salary and payroll summaries', isReadOnly: true },
      { key: 'view_financial_reports', labelAr: 'تقارير حركة السلف والخصومات والمكافآت', labelEn: 'Financial Reports', descAr: 'تصدير تقارير حركات السلف والجزاءات والمكافآت', descEn: 'Generate reports on loans, penalties, and rewards', isReadOnly: true },
    ]
  }
];
