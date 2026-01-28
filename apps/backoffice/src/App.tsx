import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import UsersPage from './pages/UsersPage';
import MotorcyclesPage from './pages/MotorcyclesPage';
import DealersPage from './pages/DealersPage';
import BookingsPage from './pages/BookingsPage';
import EmailsPage from './pages/EmailsPage';
import CustomerSatisfactionFormsPage from './pages/CustomerSatisfactionFormsPage';
import DealerSatisfactionFormsPage from './pages/DealerSatisfactionFormsPage';
import DRTTeamReportsPage from './pages/DRTTeamReportsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:eventId" element={<EventDetailPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="motorcycles" element={<MotorcyclesPage />} />
            <Route path="dealers" element={<DealersPage />} />
            <Route path="emails" element={<EmailsPage />} />
            <Route path="forms/customers" element={<CustomerSatisfactionFormsPage />} />
            <Route path="forms/dealers" element={<DealerSatisfactionFormsPage />} />
            <Route path="forms/drt-team" element={<DRTTeamReportsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
