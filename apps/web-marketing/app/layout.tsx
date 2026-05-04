import './styles.css';

export const metadata = {
  title: 'VICTUALS — Smart Nutritional Food Plan Pass',
  description: 'A $WO-powered nutritional access platform for multi-market merchant redemption.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
