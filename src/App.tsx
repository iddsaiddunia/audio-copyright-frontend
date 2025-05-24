import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PaymentProvider } from './contexts/PaymentContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Public Pages
import Dashboard from './pages/Dashboard';
import VerifyAudio from './pages/VerifyAudio';
import AboutCopyright from './pages/AboutCopyright';
import PublicSearch from './pages/PublicSearch';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import RegistrationSubmitted from './pages/auth/RegistrationSubmitted';

// Artist Pages
import ArtistDashboard from './pages/artist/ArtistDashboard';
import RegisterTrack from './pages/artist/RegisterTrack';
import TrackSubmitted from './pages/artist/TrackSubmitted';
import MyTracks from './pages/artist/MyTracks';
import TrackDetails from './pages/artist/TrackDetails';
import RequestLicense from './pages/artist/RequestLicense';
import MyLicenses from './pages/artist/MyLicenses';
import MyProfile from './pages/artist/MyProfile';
import LicenseSettings from './pages/artist/LicenseSettings';
import OwnershipTransfer from './pages/artist/OwnershipTransfer';
import TransfersList from './pages/artist/TransfersList';
import TransferDetails from './pages/artist/TransferDetails';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ArtistVerification from './pages/admin/ArtistVerification';
import TrackApprovals from './pages/admin/TrackApprovals';
import LicenseRequests from './pages/admin/LicenseRequests';
import CopyrightPublishing from './pages/admin/CopyrightPublishing';
import BlockchainRegistry from './pages/admin/BlockchainRegistry';
import SystemSettings from './pages/admin/SystemSettings';
import FinancialReports from './pages/admin/FinancialReports';
import PaymentVerification from './pages/admin/PaymentVerification';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PaymentProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="verify" element={<VerifyAudio />} />
                <Route path="search" element={<PublicSearch />} />
                <Route path="about" element={<AboutCopyright />} />
              </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="registration-submitted" element={<RegistrationSubmitted />} />
          </Route>

          {/* Artist Routes */}
          <Route path="/artist" element={<ProtectedRoute requiredRole="artist" />}>
            <Route element={<MainLayout />}>
            <Route index element={<ArtistDashboard />} />
            <Route path="register-track" element={<RegisterTrack />} />
            <Route path="track-submitted" element={<TrackSubmitted />} />
            <Route path="my-tracks" element={<MyTracks />} />
            <Route path="my-tracks/:trackId" element={<TrackDetails />} />
            <Route path="transfer-ownership/:trackId" element={<OwnershipTransfer />} />
            <Route path="transfers" element={<TransfersList />} />
            <Route path="transfers/:transferId" element={<TransferDetails />} />
            <Route path="request-license" element={<RequestLicense />} />
            <Route path="my-licenses" element={<MyLicenses />} />
            <Route path="license-settings" element={<LicenseSettings cosotaCommissionPercentage={15} />} />
            <Route path="profile" element={<MyProfile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="artist-verification" element={<ArtistVerification />} />
            <Route path="track-approvals" element={<TrackApprovals />} />
            <Route path="license-requests" element={<LicenseRequests />} />
            <Route path="payment-verification" element={<PaymentVerification />} />
            <Route path="copyright-publishing" element={<CopyrightPublishing />} />
            <Route path="blockchain" element={<BlockchainRegistry />} />
            <Route path="financial-reports" element={<FinancialReports />} />
            <Route path="settings" element={<SystemSettings />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
        </PaymentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
