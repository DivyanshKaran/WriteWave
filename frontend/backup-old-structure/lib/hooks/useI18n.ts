// Internationalization Hook
import { useState, useEffect } from 'react';
import { getLocale, getDirection, formatDate, formatNumber, formatCurrency, formatPercentage } from '@/utils/i18n';

export const useI18n = () => {
  const [locale, setLocale] = useState(getLocale());
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const currentLocale = getLocale();
    const currentDirection = getDirection(currentLocale);
    
    setLocale(currentLocale);
    setDirection(currentDirection);
  }, []);

  const isRTL = direction === 'rtl';

  return {
    locale,
    direction,
    isRTL,
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, options, locale),
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(number, locale, options),
    formatCurrency: (amount: number, currency?: string) =>
      formatCurrency(amount, locale, currency),
    formatPercentage: (value: number, options?: Intl.NumberFormatOptions) =>
      formatPercentage(value, locale, options),
  };
};
