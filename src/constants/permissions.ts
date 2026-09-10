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
      { key: 'view_dashboard', labelAr: 'الوصول للوحة القيادة (الداشبورد الشخصي)', labelEn: 'Access Personal Dashboard', descAr: 'السماح للمستخدم بالدخول لبوابة النظام واستعراض ملخصه الشخصي', descEn: 'Allow user to access the portal and view personal summary', isReadOnly: true },
      { key: 'view_company_dashboard', labelAr: 'عرض إحصائيات الشركة في الداشبورد', labelEn: 'View Company Dashboard', descAr: 'عرض المؤشرات والإحصائيات العامة للشركة والموظفين في لوحة القيادة', descEn: 'View overall company statistics and metrics on the dashboard', isReadOnly: true },
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
      { key: 'edit_employee_financials', labelAr: 'إدارة البيانات المالية والبدلات الثابتة للموظف', labelEn: 'Manage Employee Financials', descAr: 'إدارة وتخصيص الراتب الأساسي والبدلات الثابتة لكل موظف', descEn: 'Configure basic salary and fixed allowances per employee' },
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
      { key: 'create_attendances', labelAr: 'تسجيل حضور يدوي', labelEn: 'Create Manual Attendance', descAr: 'إضافة وتسجيل حركات وبصمات الحضور يدوياً', descEn: 'Add manual attendance punch records' },
      { key: 'edit_attendances', labelAr: 'تعديل سجلات وبصمات الحضور', labelEn: 'Edit Attendance Logs', descAr: 'تعديل بصمات وحركات الحضور المسجلة', descEn: 'Modify attendance punches and logs' },
      { key: 'delete_attendances', labelAr: 'حذف سجلات الحضور اليدوي', labelEn: 'Delete Attendance Logs', descAr: 'حذف حركات الحضور اليدوية', descEn: 'Delete manual attendance logs' },
      { key: 'sync_biotime', labelAr: 'مزامنة أجهزة البصمة (BioTime)', labelEn: 'Sync BioTime Devices', descAr: 'إمكانية سحب ومزامنة الحركات آليًا من أجهزة البصمة BioTime', descEn: 'Trigger automatic log fetch and sync from BioTime' },
      { key: 'view_shifts', labelAr: 'عرض شفتات ومواعيد العمل', labelEn: 'View Shifts', descAr: 'استعراض وراديات مواعيد العمل الرسمية والشفتات المعتمدة', descEn: 'View official shift types and assigned working hours', isReadOnly: true },
      { key: 'create_shifts', labelAr: 'إنشاء شفت عمل جديد', labelEn: 'Create Shift', descAr: 'إنشاء وتحديد مواعيد شفت عمل جديد', descEn: 'Create new shift schedule and timings' },
      { key: 'edit_shifts', labelAr: 'تعديل شفتات العمل', labelEn: 'Edit Shifts', descAr: 'تعديل أوقات وساعات الشفتات', descEn: 'Modify shift details and working hours' },
      { key: 'delete_shifts', labelAr: 'حذف شفت عمل', labelEn: 'Delete Shift', descAr: 'حذف شفت عمل من النظام', descEn: 'Delete a shift from system' },
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
      { key: 'view_own_salary', labelAr: 'عرض الراتب وقسيمة المرتب الشخصية فقط', labelEn: 'View Own Salary Slip', descAr: 'تمكين الموظف من عرض مسير راتبه وقسيمة مرتبه الخاصة فقط', descEn: 'Allow user to view only their personal salary breakdown', isReadOnly: true },
      { key: 'create_salaries', labelAr: 'فتح الشهر واحتساب وتوليد الرواتب', labelEn: 'Create & Calculate Salaries', descAr: 'فتح الشهر المالي وتوليد واحتساب مسيرات الرواتب', descEn: 'Open financial month and generate salary payroll' },
      { key: 'edit_salaries', labelAr: 'تعديل وإيقاف واستئناف الرواتب', labelEn: 'Edit Salaries', descAr: 'معالجة متغيرات وتعديل أو إيقاف صرف الراتب', descEn: 'Modify payroll calculations or hold/resume salary' },
      { key: 'delete_salaries', labelAr: 'حذف مسير أو سجل راتب', labelEn: 'Delete Salary Record', descAr: 'حذف سجل راتب موظف لشهر مالي مفتوح', descEn: 'Delete employee salary calculation record' },
      { key: 'archive_salaries', labelAr: 'اعتماد وأرشفة وإغلاق الشهر المالي', labelEn: 'Archive Financial Month', descAr: 'إغلاق الشهر المالي نهائياً واعتماد صرف مسير الرواتب', descEn: 'Close financial calendar month and lock payroll' },
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
      // Monthly Loans
      { key: 'view_loans', labelAr: 'عرض السلف والقروض الشهرية', labelEn: 'View Monthly Loans', descAr: 'الاطلاع على طلبات وسجلات السلف والقروض الشهرية', descEn: 'View short-term employee loan requests and logs', isReadOnly: true },
      { key: 'create_loans', labelAr: 'إضافة سلفة شهرية جديدة', labelEn: 'Create Monthly Loan', descAr: 'تسجيل سلفة شهرية جديدة لموظف', descEn: 'Create short-term monthly loan' },
      { key: 'edit_loans', labelAr: 'تعديل سلفة شهرية', labelEn: 'Edit Monthly Loan', descAr: 'تعديل بيانات أو قيمة السلفة الشهرية', descEn: 'Update monthly loan details' },
      { key: 'delete_loans', labelAr: 'حذف سلفة شهرية', labelEn: 'Delete Monthly Loan', descAr: 'حذف أو إلغاء سلفة شهرية', descEn: 'Delete monthly loan record' },

      // Permanent Loans
      { key: 'view_permanent_loans', labelAr: 'عرض السلف المستمرة (طويلة الأجل)', labelEn: 'View Permanent Loans', descAr: 'استعراض أقساط وسجلات القروض المستمرة طويلة الأجل', descEn: 'View long-term recurring loan installment plans', isReadOnly: true },
      { key: 'create_permanent_loans', labelAr: 'إنشاء وجدولة سلفة مستمرة', labelEn: 'Create Permanent Loan', descAr: 'إنشاء وجدولة خطة سلفة مستمرة لموظف', descEn: 'Create and schedule long-term loan' },
      { key: 'edit_permanent_loans', labelAr: 'تعديل خطة السلفة المستمرة', labelEn: 'Edit Permanent Loan', descAr: 'تعديل بيانات وأقساط السلفة المستمرة', descEn: 'Modify permanent loan installment plan' },
      { key: 'delete_permanent_loans', labelAr: 'إلغاء وحذف السلفة المستمرة', labelEn: 'Delete Permanent Loan', descAr: 'حذف وإلغاء السلفة المستمرة', descEn: 'Delete permanent loan record' },
      { key: 'disburse_permanent_loans', labelAr: 'اعتماد وصرف السلفة المستمرة', labelEn: 'Disburse Permanent Loan', descAr: 'اعتماد صرف وتسليم قيمة السلفة للموظف', descEn: 'Approve and disburse permanent loan amount' },
      { key: 'pay_permanent_loans', labelAr: 'تسديد أقساط السلفة نقداً', labelEn: 'Pay Loan Installment Cash', descAr: 'تسجيل سداد يدوي نقدي لأقساط السلفة', descEn: 'Record manual cash payment for loan installment' },

      // Sanctions
      { key: 'view_sanctions', labelAr: 'عرض سجل الجزاءات والعقوبات', labelEn: 'View Sanctions', descAr: 'الاطلاع على خصومات الجزاءات المسجلة بحق الموظفين', descEn: 'View disciplinary sanctions and penalty log', isReadOnly: true },
      { key: 'create_sanctions', labelAr: 'إضافة وتطبيق جزاء أو عقوبة', labelEn: 'Create Sanction', descAr: 'تسجيل جزاء أو خصم تأديبي على موظف', descEn: 'Apply disciplinary sanction on employee' },
      { key: 'edit_sanctions', labelAr: 'تعديل بيانات الجزاء', labelEn: 'Edit Sanction', descAr: 'تعديل أيام أو تفاصيل الجزاء المسجل', descEn: 'Update sanction deduction details' },
      { key: 'delete_sanctions', labelAr: 'إلغاء وحذف الجزاء', labelEn: 'Delete Sanction', descAr: 'حذف وإلغاء الجزاء المسجل', descEn: 'Delete sanction record' },

      // Discounts
      { key: 'view_discounts', labelAr: 'عرض الخصومات المباشرة', labelEn: 'View Discounts', descAr: 'الاطلاع على استقطاعات الخصومات المالية المباشرة', descEn: 'View direct financial deduction records', isReadOnly: true },
      { key: 'create_discounts', labelAr: 'إضافة خصم مالي مباشر', labelEn: 'Create Discount', descAr: 'تسجيل خصم مالي مباشر على موظف', descEn: 'Add direct payroll deduction' },
      { key: 'edit_discounts', labelAr: 'تعديل الخصم المالي', labelEn: 'Edit Discount', descAr: 'تعديل قيمة أو سبب الخصم المالي', descEn: 'Update direct discount record' },
      { key: 'delete_discounts', labelAr: 'حذف الخصم المالي', labelEn: 'Delete Discount', descAr: 'حذف الخصم المالي المباشر', descEn: 'Delete discount record' },

      // Absences
      { key: 'view_absences', labelAr: 'عرض سجلات وأيام الغياب', labelEn: 'View Absences', descAr: 'الاطلاع على كشوفات وأيام غياب الموظفين بدون عذر', descEn: 'View employee absence days and logs', isReadOnly: true },
      { key: 'create_absences', labelAr: 'تسجيل يوم غياب لموظف', labelEn: 'Create Absence', descAr: 'تسجيل وتثبيت يوم غياب على موظف', descEn: 'Record unexcused absence day' },
      { key: 'edit_absences', labelAr: 'تعديل بيانات يوم الغياب', labelEn: 'Edit Absence', descAr: 'تعديل تفاصيل وأيام الغياب المسجلة', descEn: 'Update absence record details' },
      { key: 'delete_absences', labelAr: 'حذف وإلغاء تسجيل الغياب', labelEn: 'Delete Absence', descAr: 'حذف تسجيل يوم الغياب', descEn: 'Delete absence record' },

      // Rewards
      { key: 'view_rewards', labelAr: 'عرض المكافآت والحوافز المالية', labelEn: 'View Rewards', descAr: 'الاطلاع على سجلات المكافآت التشجيعية الممنوحة', descEn: 'View employee financial reward records', isReadOnly: true },
      { key: 'create_rewards', labelAr: 'إضافة وصرف مكافأة مالية', labelEn: 'Create Reward', descAr: 'منح وصرف مكافأة أو حافز مالي لموظف', descEn: 'Create and grant financial bonus/reward' },
      { key: 'edit_rewards', labelAr: 'تعديل المكافأة المالية', labelEn: 'Edit Reward', descAr: 'تعديل قيمة أو سبب المكافأة المالية', descEn: 'Update financial reward details' },
      { key: 'delete_rewards', labelAr: 'حذف المكافأة المالية', labelEn: 'Delete Reward', descAr: 'حذف سجل المكافأة المالية', descEn: 'Delete financial reward record' },

      // Additions (Overtime)
      { key: 'view_additions', labelAr: 'عرض مستحقات وساعات الإضافي', labelEn: 'View Additions', descAr: 'استعراض سجلات وساعات العمل الإضافي المحسوبة', descEn: 'View calculated overtime addition records', isReadOnly: true },
      { key: 'create_additions', labelAr: 'تسجيل ساعات وأيام إضافي', labelEn: 'Create Addition', descAr: 'تسجيل واعتماد ساعات عمل إضافي لموظف', descEn: 'Add approved overtime hours/days' },
      { key: 'edit_additions', labelAr: 'تعديل سجل الإضافي', labelEn: 'Edit Addition', descAr: 'تعديل ساعات أو قيمة مستحقات الإضافي', descEn: 'Update overtime record details' },
      { key: 'delete_additions', labelAr: 'حذف سجل الإضافي', labelEn: 'Delete Addition', descAr: 'حذف سجل العمل الإضافي', descEn: 'Delete overtime addition record' },

      // Allowances (Variable)
      { key: 'view_allowances', labelAr: 'عرض البدلات والتعويضات المتغيرة', labelEn: 'View Allowances', descAr: 'الاطلاع على البدلات المالية المتغيرة المخصصة للموظفين', descEn: 'View employee custom variable allowances', isReadOnly: true },
      { key: 'create_allowances', labelAr: 'إضافة بدل متغير لموظف', labelEn: 'Create Allowance', descAr: 'تخصيص بدل مالي متغير لموظف', descEn: 'Assign custom allowance to employee' },
      { key: 'edit_allowances', labelAr: 'تعديل البدل المتغير', labelEn: 'Edit Allowance', descAr: 'تعديل قيمة أو نوع البدل المتغير', descEn: 'Update allowance amount or details' },
      { key: 'delete_allowances', labelAr: 'حذف البدل المتغير', labelEn: 'Delete Allowance', descAr: 'حذف البدل المالي المخصص', descEn: 'Delete allowance assignment' },

      // Types Catalogs
      { key: 'view_reward_types', labelAr: 'عرض أنواع المكافآت', labelEn: 'View Reward Types', descAr: 'عرض قائمة أنواع وتصنيفات المكافآت', descEn: 'View reward types list', isReadOnly: true },
      { key: 'create_reward_types', labelAr: 'إضافة نوع مكافأة جديد', labelEn: 'Create Reward Type', descAr: 'إنشاء نوع وتصنيف جديد للمكافآت', descEn: 'Create new reward type category' },
      { key: 'edit_reward_types', labelAr: 'تعديل نوع مكافأة', labelEn: 'Edit Reward Type', descAr: 'تعديل مسمى أو إعدادات نوع المكافأة', descEn: 'Update reward type details' },
      { key: 'delete_reward_types', labelAr: 'حذف نوع مكافأة', labelEn: 'Delete Reward Type', descAr: 'حذف نوع المكافأة من النظام', descEn: 'Delete reward type record' },

      { key: 'view_discount_types', labelAr: 'عرض أنواع الخصومات', labelEn: 'View Discount Types', descAr: 'عرض قائمة أنواع وتصنيفات الخصومات', descEn: 'View discount types list', isReadOnly: true },
      { key: 'create_discount_types', labelAr: 'إضافة نوع خصم جديد', labelEn: 'Create Discount Type', descAr: 'إنشاء نوع وتصنيف خصم جديد', descEn: 'Create new discount type' },
      { key: 'edit_discount_types', labelAr: 'تعديل نوع خصم', labelEn: 'Edit Discount Type', descAr: 'تعديل مسمى أو إعدادات نوع الخصم', descEn: 'Update discount type details' },
      { key: 'delete_discount_types', labelAr: 'حذف نوع خصم', labelEn: 'Delete Discount Type', descAr: 'حذف نوع الخصم من النظام', descEn: 'Delete discount type record' },

      { key: 'view_allowance_types', labelAr: 'عرض أنواع البدلات', labelEn: 'View Allowance Types', descAr: 'عرض قائمة أنواع البدلات المعتمدة', descEn: 'View allowance types list', isReadOnly: true },
      { key: 'create_allowance_types', labelAr: 'إضافة نوع بدل جديد', labelEn: 'Create Allowance Type', descAr: 'إنشاء نوع وتصنيف بدل جديد', descEn: 'Create new allowance type category' },
      { key: 'edit_allowance_types', labelAr: 'تعديل نوع بدل', labelEn: 'Edit Allowance Type', descAr: 'تعديل مسمى نوع البدل', descEn: 'Update allowance type details' },
      { key: 'delete_allowance_types', labelAr: 'حذف نوع بدل', labelEn: 'Delete Allowance Type', descAr: 'حذف نوع البدل من النظام', descEn: 'Delete allowance type record' },
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
      { key: 'edit_settings', labelAr: 'تعديل إعدادات وسياسات الشركة', labelEn: 'Edit System Settings', descAr: 'تعديل السياسات العامة للخصم وتوقيت التأخير واللائحة', descEn: 'Modify general company settings and HR rules' },

      { key: 'view_finance_calendars', labelAr: 'عرض السنوات المالية', labelEn: 'View Finance Calendars', descAr: 'الاطلاع على قائمة السنوات والشهور المالية', descEn: 'View financial calendar years and months', isReadOnly: true },
      { key: 'create_finance_calendars', labelAr: 'إضافة سنة مالية جديدة', labelEn: 'Create Finance Calendar', descAr: 'إنشاء سنة مالية جديدة وتقسيم شهورها', descEn: 'Create new financial calendar year' },
      { key: 'edit_finance_calendars', labelAr: 'تعديل وفتح السنة المالية', labelEn: 'Edit Finance Calendar', descAr: 'تعديل بيانات أو فتح السنة والشهر المالي', descEn: 'Update and open financial calendar year/months' },
      { key: 'delete_finance_calendars', labelAr: 'حذف سنة مالية', labelEn: 'Delete Finance Calendar', descAr: 'حذف سنة مالية غير مفعلة', descEn: 'Delete inactive financial calendar year' },

      { key: 'view_branches', labelAr: 'عرض الفروع والمواقع', labelEn: 'View Branches', descAr: 'استعراض قائمة فروع ومواقع الشركة', descEn: 'View branch locations list', isReadOnly: true },
      { key: 'create_branches', labelAr: 'إضافة فرع جديد', labelEn: 'Create Branch', descAr: 'إضافة موقع أو فرع جديد للشركة', descEn: 'Create new branch location' },
      { key: 'edit_branches', labelAr: 'تعديل بيانات فرع', labelEn: 'Edit Branch', descAr: 'تحديث بيانات وعنوان فرع الشركة', descEn: 'Update branch information' },
      { key: 'delete_branches', labelAr: 'حذف فرع', labelEn: 'Delete Branch', descAr: 'حذف فرع من قائمة الفروع', descEn: 'Delete branch location' },

      { key: 'view_departments', labelAr: 'عرض الأقسام والإدارات', labelEn: 'View Departments', descAr: 'استعراض الهيكل التنظيمي للأقسام', descEn: 'View department structure list', isReadOnly: true },
      { key: 'create_departments', labelAr: 'إضافة قسم جديد', labelEn: 'Create Department', descAr: 'إنشاء قسم أو إدارة جديدة بالشركة', descEn: 'Create new department' },
      { key: 'edit_departments', labelAr: 'تعديل بيانات قسم', labelEn: 'Edit Department', descAr: 'تعديل اسم أو بيانات القسم', descEn: 'Update department details' },
      { key: 'delete_departments', labelAr: 'حذف قسم', labelEn: 'Delete Department', descAr: 'حذف قسم من الهيكل الإداري', descEn: 'Delete department' },

      { key: 'view_jobs_categories', labelAr: 'عرض الوظائف والتصنيفات', labelEn: 'View Job Titles', descAr: 'استعراض قائمة الوظائف والمسميات المهنية', descEn: 'View job categories and titles', isReadOnly: true },
      { key: 'create_jobs_categories', labelAr: 'إضافة وظيفة جديدة', labelEn: 'Create Job Title', descAr: 'تسجيل مسمى وظيفي أو تصنيف مهني جديد', descEn: 'Add new job title or category' },
      { key: 'edit_jobs_categories', labelAr: 'تعديل مسمى وظيفي', labelEn: 'Edit Job Title', descAr: 'تعديل بيانات المسمى الوظيفي', descEn: 'Update job title details' },
      { key: 'delete_jobs_categories', labelAr: 'حذف مسمى وظيفي', labelEn: 'Delete Job Title', descAr: 'حذف وظيفة من القائمة', descEn: 'Delete job title' },

      { key: 'view_qualifications', labelAr: 'عرض المؤهلات العلمية', labelEn: 'View Qualifications', descAr: 'استعراض قائمة الدرجات والمؤهلات الأكاديمية', descEn: 'View qualification degrees list', isReadOnly: true },
      { key: 'create_qualifications', labelAr: 'إضافة مؤهل جديد', labelEn: 'Create Qualification', descAr: 'إضافة درجة أو تخصص علمي جديد', descEn: 'Add new qualification degree' },
      { key: 'edit_qualifications', labelAr: 'تعديل مؤهل علمي', labelEn: 'Edit Qualification', descAr: 'تعديل بيانات المؤهل العلمي', descEn: 'Update qualification details' },
      { key: 'delete_qualifications', labelAr: 'حذف مؤهل علمي', labelEn: 'Delete Qualification', descAr: 'حذف مؤهل من النظام', descEn: 'Delete qualification' },

      { key: 'view_occasions', labelAr: 'عرض العطلات والمناسبات', labelEn: 'View Holidays', descAr: 'استعراض جدول الإجازات والمناسبات الرسمية', descEn: 'View official holidays list', isReadOnly: true },
      { key: 'create_occasions', labelAr: 'إضافة عطلة أو مناسبة جديدة', labelEn: 'Create Holiday', descAr: 'تحديد وتسجيل إجازة رسمية بالشركة', descEn: 'Add new official holiday' },
      { key: 'edit_occasions', labelAr: 'تعديل مناسبة أو عطلة', labelEn: 'Edit Holiday', descAr: 'تعديل تواريخ أو مسمى المناسبة الرسمية', descEn: 'Update holiday occasion dates' },
      { key: 'delete_occasions', labelAr: 'حذف مناسبة أو عطلة', labelEn: 'Delete Holiday', descAr: 'حذف عطلة رسمية من النظام', descEn: 'Delete holiday occasion' },

      { key: 'view_resignations', labelAr: 'عرض أسباب الاستقالة', labelEn: 'View Resignations', descAr: 'استعراض تصنيفات وأسباب ترك العمل', descEn: 'View resignation types list', isReadOnly: true },
      { key: 'create_resignations', labelAr: 'إضافة نوع استقالة جديد', labelEn: 'Create Resignation Type', descAr: 'إضافة تصنيف أو سبب استقالة جديد', descEn: 'Add new resignation category' },
      { key: 'edit_resignations', labelAr: 'تعديل نوع استقالة', labelEn: 'Edit Resignation Type', descAr: 'تعديل مسمى نوع الاستقالة', descEn: 'Update resignation type details' },
      { key: 'delete_resignations', labelAr: 'حذف نوع استقالة', labelEn: 'Delete Resignation Type', descAr: 'حذف نوع استقالة من النظام', descEn: 'Delete resignation type' },

      { key: 'view_general_constants', labelAr: 'عرض الثوابت العامة', labelEn: 'View System Constants', descAr: 'استعراض قواميس النظام (الجنسيات، اللغات، البلدان،...)', descEn: 'View system lookup constants', isReadOnly: true },
      { key: 'create_general_constants', labelAr: 'إضافة ثابت عام جديد', labelEn: 'Create System Constant', descAr: 'إضافة سجل في قواميس النظام العامة', descEn: 'Add entry in system lookups' },
      { key: 'edit_general_constants', labelAr: 'تعديل ثابت عام', labelEn: 'Edit System Constant', descAr: 'تعديل بيانات مدخلة في الثوابت العامة', descEn: 'Update system lookup entry' },
      { key: 'delete_general_constants', labelAr: 'حذف ثابت عام', labelEn: 'Delete System Constant', descAr: 'حذف عنصر من الثوابت العامة', descEn: 'Delete system lookup entry' },
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
      { key: 'create_roles', labelAr: 'إنشاء دور وظيفي جديد', labelEn: 'Create Role', descAr: 'إنشاء دور جديد وتحديد الصلاحيات الممنوحة له', descEn: 'Create new role and assign permissions' },
      { key: 'edit_roles', labelAr: 'تعديل الأدوار والصلاحيات', labelEn: 'Edit Role', descAr: 'تعديل مسمى الدور وإعادة تخصيص الصلاحيات', descEn: 'Update role permissions and details' },
      { key: 'delete_roles', labelAr: 'حذف دور وظيفي', labelEn: 'Delete Role', descAr: 'حذف دور وظيفي من النظام', descEn: 'Delete role from system' },
      { key: 'assign_roles', labelAr: 'إسناد وتغيير أدوار الموظفين', labelEn: 'Assign Roles', descAr: 'تخصيص الأدوار والصلاحيات لحسابات الموظفين', descEn: 'Assign and change user roles' },
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
