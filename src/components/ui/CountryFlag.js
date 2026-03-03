import Flag from 'react-flagpack';
import 'react-flagpack/dist/style.css';

export default function CountryFlag({ code, size = 'm' }) {
  if (!code || code === 'UNKNOWN' || !/^[a-z]{2}$/i.test(code)) {
    return <span style={{ fontSize: size === 's' ? 14 : 18, lineHeight: 1 }}>🌐</span>;
  }

  return (
    <Flag
      code={code.toUpperCase()}
      size={size}
      hasBorder={false}
      hasBorderRadius
      gradient="real-linear"
    />
  );
}
