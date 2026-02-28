import { createContext, useContext, useState } from 'react';

const DateRangeContext = createContext();

export function DateRangeProvider({ children }) {
  const [period, setPeriod] = useState('30d');
  const [customRange, setCustomRange] = useState(null);

  const getParams = () => {
    if (customRange) return customRange;
    return { period };
  };

  return (
    <DateRangeContext.Provider
      value={{ period, setPeriod, customRange, setCustomRange, getParams }}
    >
      {children}
    </DateRangeContext.Provider>
  );
}

export const useDateRange = () => useContext(DateRangeContext);
