import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CatalogProvider } from './context/CatalogContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { LandingPage } from './pages/LandingPage';

// Rutas bajo demanda (code-splitting): la home carga sin arrastrar el catálogo,
// que nadie ve en la primera pantalla.
const CatalogPage = lazy(() => import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const ShippingPage = lazy(() => import('./pages/ShippingPage').then((m) => ({ default: m.ShippingPage })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService').then((m) => ({ default: m.TermsOfService })));
const WarrantyPolicy = lazy(() => import('./pages/legal/WarrantyPolicy').then((m) => ({ default: m.WarrantyPolicy })));

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
  </div>
);

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <ScrollToTop />

      {/* `overflow-x-clip` y no `-hidden`: en un div común, `hidden` fuerza
          `overflow-y: auto` y convierte esto en un contenedor de scroll, con lo
          cual cualquier `position: sticky` de adentro deja de pegarse (los
          filtros del catálogo). `clip` recorta igual pero no crea scrollport. */}
      <div className="min-h-screen bg-transparent text-white font-sans flex flex-col overflow-x-clip">
        <Navbar />

        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/catalogo/:category" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/envios" element={<ShippingPage />} />

              {/* Legales */}
              <Route path="/garantia" element={<WarrantyPolicy />} />
              <Route path="/privacidad" element={<PrivacyPolicy />} />
              <Route path="/terminos" element={<TermsOfService />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        {/* La home cierra con su propio pie dentro de la última sección. */}
        {!isHome && <Footer />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <Router>
        <AppContent />
      </Router>
    </CatalogProvider>
  );
}
