import '@/styles/globals.scss';
import { AuthProvider } from '@/contexts/AuthContext';
import { DateRangeProvider } from '@/contexts/DateRangeContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <DateRangeProvider>
        <Component {...pageProps} />
      </DateRangeProvider>
    </AuthProvider>
  );
}
