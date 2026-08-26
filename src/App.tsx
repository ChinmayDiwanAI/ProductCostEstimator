import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { ProductsPage } from './pages/ProductsPage';
import { CalculatorPage } from './pages/CalculatorPage';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
