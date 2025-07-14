
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
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount.toLocaleString()}`;
  
  // For some currencies, we want to show the symbol after the amount
  const symbolAfterCurrencies = ['EUR', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF'];
  
  if (symbolAfterCurrencies.includes(currencyCode)) {
    return `${amount.toLocaleString()} ${currency.symbol}`;
  }
  
  return `${currency.symbol}${amount.toLocaleString()}`;
};

export const getDefaultCurrency = (): Currency => {
  return CURRENCIES.find(c => c.code === 'NGN') || CURRENCIES[0];
};
