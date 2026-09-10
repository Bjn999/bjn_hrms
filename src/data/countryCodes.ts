export interface CountryCode {
  code: string;
  nameAr: string;
  nameEn: string;
  dialCode: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
  placeholder: string;
  pattern?: RegExp;
}

export const COUNTRIES: CountryCode[] = [
  {
    code: 'SA',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    dialCode: '+966',
    flag: '🇸🇦',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '501234567',
    pattern: /^5\d{8}$/
  },
  {
    code: 'YE',
    nameAr: 'اليمن',
    nameEn: 'Yemen',
    dialCode: '+967',
    flag: '🇾🇪',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '771234567',
    pattern: /^7\d{8}$/
  },
  {
    code: 'EG',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    dialCode: '+20',
    flag: '🇪🇬',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '1012345678',
    pattern: /^1[0125]\d{8}$/
  },
  {
    code: 'AE',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '501234567',
    pattern: /^5\d{8}$/
  },
  {
    code: 'KW',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    dialCode: '+965',
    flag: '🇰🇼',
    minDigits: 8,
    maxDigits: 8,
    placeholder: '91234567',
    pattern: /^[569]\d{7}$/
  },
  {
    code: 'QA',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    dialCode: '+974',
    flag: '🇶🇦',
    minDigits: 8,
    maxDigits: 8,
    placeholder: '33123456',
    pattern: /^[3567]\d{7}$/
  },
  {
    code: 'BH',
    nameAr: 'البحرين',
    nameEn: 'Bahrain',
    dialCode: '+973',
    flag: '🇧🇭',
    minDigits: 8,
    maxDigits: 8,
    placeholder: '39123456',
    pattern: /^[36]\d{7}$/
  },
  {
    code: 'OM',
    nameAr: 'عمان',
    nameEn: 'Oman',
    dialCode: '+968',
    flag: '🇴🇲',
    minDigits: 8,
    maxDigits: 8,
    placeholder: '91234567',
    pattern: /^[79]\d{7}$/
  },
  {
    code: 'JO',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    dialCode: '+962',
    flag: '🇯🇴',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '791234567',
    pattern: /^7[789]\d{7}$/
  },
  {
    code: 'PS',
    nameAr: 'فلسطين',
    nameEn: 'Palestine',
    dialCode: '+970',
    flag: '🇵🇸',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '591234567',
    pattern: /^5[69]\d{7}$/
  },
  {
    code: 'IQ',
    nameAr: 'العراق',
    nameEn: 'Iraq',
    dialCode: '+964',
    flag: '🇮🇶',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '7712345678',
    pattern: /^7\d{9}$/
  },
  {
    code: 'SY',
    nameAr: 'سوريا',
    nameEn: 'Syria',
    dialCode: '+963',
    flag: '🇸🇾',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '941234567',
    pattern: /^9\d{8}$/
  },
  {
    code: 'LB',
    nameAr: 'لبنان',
    nameEn: 'Lebanon',
    dialCode: '+961',
    flag: '🇱🇧',
    minDigits: 8,
    maxDigits: 8,
    placeholder: '70123456',
    pattern: /^[378]\d{7}$/
  },
  {
    code: 'SD',
    nameAr: 'السودان',
    nameEn: 'Sudan',
    dialCode: '+249',
    flag: '🇸🇩',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '912345678',
    pattern: /^[19]\d{8}$/
  },
  {
    code: 'DZ',
    nameAr: 'الجزائر',
    nameEn: 'Algeria',
    dialCode: '+213',
    flag: '🇩🇿',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '551234567',
    pattern: /^[567]\d{8}$/
  },
  {
    code: 'MA',
    nameAr: 'المغرب',
    nameEn: 'Morocco',
    dialCode: '+212',
    flag: '🇲🇦',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '612345678',
    pattern: /^[567]\d{8}$/
  },
  {
    code: 'TN',
    nameAr: 'تونس',
    nameEn: 'Tunisia',
    dialCode: '+216',
    flag: '🇹🇳',
    minDigits: 8,
    maxDigits: 8,
    placeholder: '20123456',
    pattern: /^[2459]\d{7}$/
  },
  {
    code: 'LY',
    nameAr: 'ليبيا',
    nameEn: 'Libya',
    dialCode: '+218',
    flag: '🇱🇾',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '912345678',
    pattern: /^9[1245]\d{7}$/
  },
  {
    code: 'TR',
    nameAr: 'تركيا',
    nameEn: 'Turkey',
    dialCode: '+90',
    flag: '🇹🇷',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '5012345678',
    pattern: /^5\d{9}$/
  },
  {
    code: 'US',
    nameAr: 'الولايات المتحدة',
    nameEn: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '2025550123',
    pattern: /^[2-9]\d{9}$/
  },
  {
    code: 'GB',
    nameAr: 'المملكة المتحدة',
    nameEn: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '7911123456',
    pattern: /^7\d{9}$/
  },
  {
    code: 'DE',
    nameAr: 'ألمانيا',
    nameEn: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    minDigits: 10,
    maxDigits: 11,
    placeholder: '15123456789'
  },
  {
    code: 'FR',
    nameAr: 'فرنسا',
    nameEn: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '612345678'
  },
  {
    code: 'IN',
    nameAr: 'الهند',
    nameEn: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '9876543210',
    pattern: /^[6-9]\d{9}$/
  },
  {
    code: 'PK',
    nameAr: 'باكستان',
    nameEn: 'Pakistan',
    dialCode: '+92',
    flag: '🇵🇰',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '3012345678',
    pattern: /^3\d{9}$/
  },
  {
    code: 'MY',
    nameAr: 'ماليزيا',
    nameEn: 'Malaysia',
    dialCode: '+60',
    flag: '🇲🇾',
    minDigits: 9,
    maxDigits: 10,
    placeholder: '123456789'
  }
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Saudi Arabia
