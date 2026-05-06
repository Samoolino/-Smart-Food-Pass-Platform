import './styles.css';

export const metadata = {
  title: 'VICTUALS — Smart Nutritional Food Plan Pass',
  description: 'A $WO-powered nutritional access platform for multi-market merchant redemption.'
};

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/market-stores', label: 'Market Stores' },
  { href: '/plans', label: 'Plans' },
  { href: '/contract-overview', label: 'Contract Overview' }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="container nav-inner">
            <a className="brand" href="/">
              <span className="brand-mark">V</span>
              <span>VICTUALS</span>
            </a>
            <div className="nav-links" aria-label="Primary navigation">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href}>{link.label}</a>
              ))}
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
