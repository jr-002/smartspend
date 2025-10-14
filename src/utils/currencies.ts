export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  // Major Currencies
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  
  // African Currencies
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "EGP", symbol: "£E", name: "Egyptian Pound", flag: "🇪🇬" },
  
  // Asian Currencies
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "LKR", symbol: "₨", name: "Sri Lankan Rupee", flag: "🇱🇰" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  
  // Middle Eastern Currencies
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal", flag: "🇶🇦" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", flag: "🇰🇼" },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar", flag: "🇧🇭" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial", flag: "🇴🇲" },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar", flag: "🇯🇴" },
  { code: "LBP", symbol: "£L", name: "Lebanese Pound", flag: "🇱🇧" },
  
  // European Currencies
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty", flag: "🇵🇱" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", flag: "🇧🇬" },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna", flag: "🇭🇷" },
  { code: "RSD", symbol: "дин", name: "Serbian Dinar", flag: "🇷🇸" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
  
  // American Currencies
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "MXN", symbol: "$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "ARS", symbol: "$", name: "Argentine Peso", flag: "🇦🇷" },
  { code: "CLP", symbol: "$", name: "Chilean Peso", flag: "🇨🇱" },
  { code: "COP", symbol: "$", name: "Colombian Peso", flag: "🇨🇴" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", flag: "🇵🇪" },
  { code: "UYU", symbol: "$U", name: "Uruguayan Peso", flag: "🇺🇾" },
  
  // Oceania Currencies
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },
  
  // Cryptocurrency (Popular ones)
  { code: "BTC", symbol: "₿", name: "Bitcoin", flag: "₿" },
  { code: "ETH", symbol: "Ξ", name: "Ethereum", flag: "Ξ" }
];

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find(currency => currency.code === code);
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  // Handle null/undefined amounts
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }
  
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount.toLocaleString()}`;
  
  // For some currencies, we want to show the symbol after the amount
  const symbolAfterCurrencies = ['EUR', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF'];
  
  if (symbolAfterCurrencies.includes(currencyCode)) {
    return `${amount.toLocaleString()} ${currency.symbol}`;
  }
  
  return `${currency.symbol}${amount.toLocaleString()}`;
};

const COUNTRY_CURRENCY_MAP: { [key: string]: string } = {
  'US': 'USD', 'United States': 'USD',
  'GB': 'GBP', 'United Kingdom': 'GBP',
  'EU': 'EUR', 'Germany': 'EUR', 'France': 'EUR', 'Spain': 'EUR', 'Italy': 'EUR', 'Netherlands': 'EUR',
  'JP': 'JPY', 'Japan': 'JPY',
  'NG': 'NGN', 'Nigeria': 'NGN',
  'ZA': 'ZAR', 'South Africa': 'ZAR',
  'KE': 'KES', 'Kenya': 'KES',
  'GH': 'GHS', 'Ghana': 'GHS',
  'EG': 'EGP', 'Egypt': 'EGP',
  'IN': 'INR', 'India': 'INR',
  'CN': 'CNY', 'China': 'CNY',
  'KR': 'KRW', 'South Korea': 'KRW',
  'SG': 'SGD', 'Singapore': 'SGD',
  'HK': 'HKD', 'Hong Kong': 'HKD',
  'TH': 'THB', 'Thailand': 'THB',
  'MY': 'MYR', 'Malaysia': 'MYR',
  'ID': 'IDR', 'Indonesia': 'IDR',
  'PK': 'PKR', 'Pakistan': 'PKR',
  'BD': 'BDT', 'Bangladesh': 'BDT',
  'LK': 'LKR', 'Sri Lanka': 'LKR',
  'PH': 'PHP', 'Philippines': 'PHP',
  'AE': 'AED', 'United Arab Emirates': 'AED',
  'SA': 'SAR', 'Saudi Arabia': 'SAR',
  'QA': 'QAR', 'Qatar': 'QAR',
  'KW': 'KWD', 'Kuwait': 'KWD',
  'BH': 'BHD', 'Bahrain': 'BHD',
  'OM': 'OMR', 'Oman': 'OMR',
  'JO': 'JOD', 'Jordan': 'JOD',
  'LB': 'LBP', 'Lebanon': 'LBP',
  'CH': 'CHF', 'Switzerland': 'CHF',
  'SE': 'SEK', 'Sweden': 'SEK',
  'NO': 'NOK', 'Norway': 'NOK',
  'DK': 'DKK', 'Denmark': 'DKK',
  'PL': 'PLN', 'Poland': 'PLN',
  'CZ': 'CZK', 'Czech Republic': 'CZK',
  'HU': 'HUF', 'Hungary': 'HUF',
  'RO': 'RON', 'Romania': 'RON',
  'BG': 'BGN', 'Bulgaria': 'BGN',
  'HR': 'HRK', 'Croatia': 'HRK',
  'RS': 'RSD', 'Serbia': 'RSD',
  'RU': 'RUB', 'Russia': 'RUB',
  'UA': 'UAH', 'Ukraine': 'UAH',
  'TR': 'TRY', 'Turkey': 'TRY',
  'CA': 'CAD', 'Canada': 'CAD',
  'MX': 'MXN', 'Mexico': 'MXN',
  'BR': 'BRL', 'Brazil': 'BRL',
  'AR': 'ARS', 'Argentina': 'ARS',
  'CL': 'CLP', 'Chile': 'CLP',
  'CO': 'COP', 'Colombia': 'COP',
  'PE': 'PEN', 'Peru': 'PEN',
  'UY': 'UYU', 'Uruguay': 'UYU',
  'AU': 'AUD', 'Australia': 'AUD',
  'NZ': 'NZD', 'New Zealand': 'NZD',
};

export const detectCurrencyFromLocation = async (): Promise<Currency> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location');

    const data = await response.json();
    const countryCode = data.country_code || data.country;
    const countryName = data.country_name;

    const currencyCode = COUNTRY_CURRENCY_MAP[countryCode] || COUNTRY_CURRENCY_MAP[countryName];

    if (currencyCode) {
      const currency = getCurrencyByCode(currencyCode);
      if (currency) {
        localStorage.setItem('detected_currency', currencyCode);
        return currency;
      }
    }
  } catch (error) {
    console.warn('Failed to detect currency from location:', error);
  }

  const savedCurrency = localStorage.getItem('detected_currency');
  if (savedCurrency) {
    const currency = getCurrencyByCode(savedCurrency);
    if (currency) return currency;
  }

  return CURRENCIES.find(c => c.code === 'USD') || CURRENCIES[0];
};

export const getDefaultCurrency = (): Currency => {
  const savedCurrency = localStorage.getItem('detected_currency');
  if (savedCurrency) {
    const currency = getCurrencyByCode(savedCurrency);
    if (currency) return currency;
  }
  return CURRENCIES.find(c => c.code === 'USD') || CURRENCIES[0];
};
