export const metadata = {
  title: '폐업 세금 계산기 | RebornBiz',
  description: '폐업 시 부가가치세(잔존재화 간주공급)를 세법 기준으로 산출해 드립니다.',
  alternates: {
    canonical: '/tax_cal',
  },
};

export default function TaxCalLayout({ children }) {
  return <>{children}</>;
}
