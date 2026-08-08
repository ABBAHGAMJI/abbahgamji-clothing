import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartDrawer from '../../components/CartDrawer';

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </>
  );
}
