export interface User {
  id: number;
  name: string;
  email?: string;
  username?: string;
}

export interface Employee {
  id?: number;
  employee_code: string;
  emp_name: string;
  job?: JobCategory;
  branch?: Branch;
  department?: Department;
  job_id?: number;
  emp_sal: number;
  day_price: number;
  emp_start_date: string;
  gender: number; // 1 for male, 2 for female
  emp_gender?: number;
  social_status?: number;
  fingerprint_code?: string;
  zketo_code?: string;
  qualifications_id?: number;
  qualifications_year?: string;
  graduation_estimate?: string;
  graduation_specialization?: string;
  birth_date?: string;
  emp_birth_date?: string;
  national_identity?: string;
  emp_national_identity?: string;
  identity_end_date?: string;
  emp_end_identity_date?: string;
  identity_place?: string;
  emp_identity_place?: string;
  native_language?: string;
  children_number?: number;
  residence_address?: string;
  staies_address?: string;
  home_phone?: string;
  emp_home_tel?: string;
  work_phone?: string;
  emp_work_tel?: string;
  functional_status: number; // 1 for in service, 0 for out of service
  attendance_required: number; // 1 or 0
  does_has_attendance?: number;
  has_fixed_shift: number; // 1 or 0
  is_has_fixed_shift?: number;
  daily_work_hours?: number;
  daily_work_hour?: number | string;
  payment_method: number; // 1 for cash, 2 for bank
  bank_account_number?: string;
  military_status?: number;
  service_start_date?: string;
  service_end_date?: string;
  emp_military_weapon?: string;
  exemption_date?: string;
  exemption_reason?: string;
  postponement_reason?: string;
  has_driving_license?: number;
  driving_license_num?: string;
  driving_license_type?: string;
  has_relatives_in_work?: number;
  relatives_details?: string;
  has_disabilities?: number;
  disabilities_processes?: string;
  urgent_person_details?: string;
  emp_cafel?: string;
  emp_pasport_no?: string;
  emp_pasport_place?: string;
  emp_passport_exp?: string;
  home_address?: string;
  resignation_id?: number;
  resignation_date?: string;
  resignation_cause?: string;
  is_sensitive_manager_data?: number;
  does_has_fixed_allowance?: number;
  emp_photo?: string;
  emp_cv?: string;
  motivation_type?: number;
  motivation_value?: number;
  is_social_insurance?: number;
  social_insurance_number?: string;
  social_insurance_cut_monthly?: number;
  is_medical_insurance?: number;
  medical_insurance_number?: string;
  medical_insurance_cut_monthly?: number;
  is_active_for_vaccation?: number;
  sal_cash_or_visa?: number | string;
  bank_number_account?: string;
  motivation?: number | string;
  emp_military_id?: number | string;
  emp_military_date_from?: string;
  emp_military_date_to?: string;
  does_has_driving_license?: number | string;
  has_relatives?: number | string;
  is_disabilities_processes?: number | string;
  notes?: string;
  emp_email?: string;
  added?: User;
  updatedby?: User;
  created_at?: string;
  updated_at?: string;
}

export interface Branch {
  id: number;
  name: string;
  phones?: string;
  email?: string;
  address?: string;
  active: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  added?: User;
  updatedby?: User;
}

export interface Department {
  id: number;
  name: string;
  phones?: string;
  address?: string;
  active: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  added?: User;
  updatedby?: User;
  counterUsed?: number;
}

export interface Shift {
  id: number;
  type: number; // 1 morning, 2 evening
  from_time: string;
  to_time: string;
  total_hour: number;
  active: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  added?: User;
  updatedby?: User;
  counterUsed?: number;
}

export interface Qualification {
  id: number;
  name: string;
  active: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  added?: User;
  updatedby?: User;
}

export interface JobCategory {
  id: number;
  name: string;
  active: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  added?: User;
  updatedby?: User;
}

export interface FinanceCalendar {
  id: number;
  finance_yr: string;
  finance_yr_desc: string;
  start_date: string;
  end_date: string;
  is_open: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  added?: User;
  updatedby?: User;
}

export interface FinanceMonth {
  id: number;
  finance_month_period_id?: number;
  month_id?: number;
  finance_yr: string;
  start_date_m: string;
  end_date_m: string;
  is_open: number;
  month?: {
    name: string;
    name_en: string;
  };
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  added?: User;
  updatedby?: User;
  start_date_for_pasma?: string;
  end_date_for_pasma?: string;
  number_of_days?: number;
}

export interface DiscountType {
  id: number;
  name: string;
  active: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Discount {
  id: number;
  finance_month_period_id: number;
  employee_code: string;
  discounts_type_id: number;
  total: number;
  notes?: string;
  is_archived: number;
  added_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
  discount_type?: DiscountType;
  added?: User;
  updatedby?: User;
}

export interface AllowanceType {
  id: number;
  name: string;
  active: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Allowance {
  id: number;
  finance_month_period_id: number;
  employee_code: string;
  allowance_type_id: number;
  total: number;
  notes?: string;
  is_archived: number;
  added_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
  allowance_type?: AllowanceType;
  added?: User;
  updatedby?: User;
}

export interface RewardType {
  id: number;
  name: string;
  active: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Reward {
  id: number;
  finance_month_period_id: number;
  employee_code: string;
  rewards_type_id: number;
  total: number;
  notes?: string;
  is_archived: number;
  added_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
  reward_type?: RewardType;
  added?: User;
  updatedby?: User;
}

export interface LoanType {
  id: number;
  name: string;
  active: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Loan {
  id: number;
  finance_month_period_id: number;
  employee_code: string;
  loans_type_id: number;
  total: number;
  notes?: string;
  is_archived: number;
  added_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
  loan_type?: LoanType;
  added?: User;
  updatedby?: User;
}

export interface Sanction {
  id: number;
  finance_month_period_id: number;
  employee_code: string;
  sanction_type: number; // 1 for days, 2 for fingerprint, 3 for investigation
  days_count: number;
  total: number;
  notes?: string;
  is_archived: number;
  added_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
  added?: User;
  updatedby?: User;
}

export interface Absence {
  id: number;
  finance_month_period_id: number;
  employee_code: string;
  days_count: number;
  total: number;
  notes?: string;
  is_archived: number;
  added_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
  added?: User;
  updatedby?: User;
}

export interface SalaryRecord {
  id: number;
  finance_month_period_id: number;
  employee_code: string;
  emp_sal: number;
  allowances: number;
  discounts: number;
  rewards: number;
  loans: number;
  sanctions: number;
  absences: number;
  net_salary: number;
  is_archived: number;
  added_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
  added?: User;
  updatedby?: User;
}

export interface Occasion {
  id: number;
  name: string;
  from_date: string;
  to_date: string;
  days_counter: number;
  active: number;
  created_at?: string;
  updated_at?: string;
}

export interface Country {
  id: number;
  name: string;
  active: number;
  created_at?: string;
  updated_at?: string;
  added_by?: number;
  updated_by?: number;
  added?: User;
  updatedby?: User;
}

export interface Governorate {
  id: number;
  name: string;
  country_id: number;
  active: number;
  created_at?: string;
  updated_at?: string;
  added_by?: number;
  updated_by?: number;
  added?: User;
  updatedby?: User;
  country?: Country;
  counterUsed?: number;
}

export interface Center {
  id: number;
  name: string;
  governorate_id: number;
  active: number;
  created_at?: string;
  updated_at?: string;
  added_by?: number;
  updated_by?: number;
  added?: User;
  updatedby?: User;
  governorate?: Governorate;
  country?: Country;
  counterUsed?: number;
}

export interface Attendance {
  id: number;
  company_id: number;
  employee_code: string | number;
  finance_months_periods_id: number;
  main_salary_employee_id?: number;
  attendance_date: string;
  variables?: string;
  shift_hours: number;
  attendance_status: number;
  total_hours: number;
  check_in?: string;
  check_out?: string;
  late_attendance?: number;
  early_leave?: number;
  overtime_hours?: number;
  absence_hours?: number;
  ezen_hours?: string;
  is_processed?: number;
  vacations_type_id?: number;
  occasions_id?: number;
  cut?: number;
  year_and_month?: string;
  branch_id?: number;
  functional_status?: number;
  actionDateTime?: string;
  is_approved?: number;
  is_archived?: number;
  archived_at?: string;
  archived_by?: number;
  added_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
  added_by_admin?: User;
  updated_by_admin?: User;
}

export interface PermissionItem {
  id: number;
  name: string;
  guard_name: string;
}

export interface RoleItem {
  id: number;
  name: string;
  display_name: string;
  company_id: string;
  permissions: PermissionItem[];
}

export interface PermissionDef {
  key: string;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  isReadOnly?: boolean;
}

export interface ModuleGroup {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  colorClass: string;
  badgeClass: string;
  permissions: PermissionDef[];
}

export interface VacationType {
  id: number;
  company_id: string;
  name: string;
  type_slug: string;
  is_paid: number;
  deduct_from_balance: number;
  max_days_per_year: number;
  requires_attachment: number;
  active: number;
  requests_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeVacationBalance {
  id: number;
  company_id: string;
  employee_id: number;
  year: number;
  carried_over_balance: number | string;
  initial_assigned_balance: number | string;
  monthly_accrued_balance: number | string;
  total_entitled_balance: number | string;
  used_balance: number | string;
  pending_balance: number | string;
  remaining_balance: number | string;
  notes?: string;
  last_calculated_at?: string;
  employee?: {
    id: number;
    emp_name: string;
    employee_code: string;
    emp_start_date?: string;
    department?: { id: number; name: string };
    job?: { id: number; name: string };
    is_active_for_vaccation?: number;
  };
}

export interface VacationRequest {
  id: number;
  company_id: string;
  employee_id: number;
  vacation_type_id: number;
  from_date: string;
  to_date: string;
  days_count: number;
  reason?: string;
  attachment_path?: string;
  status: number; // 0=Pending, 1=Approved, 2=Rejected, 3=Cancelled
  action_by?: number;
  action_reason?: string;
  action_at?: string;
  created_at?: string;
  updated_at?: string;
  employee?: {
    id: number;
    emp_name: string;
    employee_code: string;
    branch_id?: number;
    department?: { id: number; name: string };
    job?: { id: number; name: string };
  };
  vacation_type?: VacationType;
  action_by_user?: {
    id: number;
    name: string;
  };
}

