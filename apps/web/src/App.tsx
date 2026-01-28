import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import BookingWizardPage from './pages/BookingWizardPage';
import FAQPage from './pages/FAQPage';
import NotFoundPage from './pages/NotFoundPage';
import SatisfactionFormPage from './pages/SatisfactionFormPage';
import ThankYouPage from './pages/ThankYouPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="reserver" element={<BookingPage />} />
        <Route path="reserver/event/:eventId" element={<BookingWizardPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      {/* Routes sans layout (formulaire satisfaction et merci) */}
      <Route path="/satisfaction" element={<SatisfactionFormPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
    </Routes>
  );
}

export default App;
