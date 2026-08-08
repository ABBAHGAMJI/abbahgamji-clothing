import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'ABBAHGAMJI — Kaftan, Jallabiya, Agbada, Hijab & Long Gowns | Northern Nigerian Fashion',
  description:
    'ABBAHGAMJI is premium made-to-measure Northern Nigerian fashion for men and women — kaftans, jallabiyas, senator wear, agbada, hijabs, long gowns, shoes, handbags and perfumes.',
  metadataBase: new URL('https://www.abbahgamji.com'),
  openGraph: {
    title: 'ABBAHGAMJI — Premium Northern Nigerian Fashion For Him & Her',
    description:
      'Made-to-measure kaftans, jallabiyas, agbada, hijabs and long gowns — plus shoes, handbags and perfumes — tailored for style, class, distinction and comfort.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1590736969955-71cc94901144?q=80&w=1200&auto=format&fit=crop']
  },
  themeColor: '#0a1f44'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
