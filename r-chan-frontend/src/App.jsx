import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import ThreadPage from './pages/ThreadPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminLogsPage from './pages/AdminLogsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AllPostsPage from './pages/AllPostsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyResetCodePage from './pages/VerifyResetCodePage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/thread/:postId" element={<ThreadPage />} />

          {/* Admin Routes */}
          <Route path="/administrator/login" element={<AdminLoginPage />} />
          <Route path="/administrator" element={<AdminDashboardPage />} />
          <Route path="/administrator/profile" element={<AdminProfilePage />} />
          <Route path="/administrator/logs" element={<AdminLogsPage />} />
          <Route path="/administrator/users" element={<AdminUsersPage />} />
          <Route path="/administrator/all-posts" element={<AllPostsPage />} />

          {/* Password Reset Routes */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password/verify" element={<VerifyResetCodePage />} />
          <Route path="/forgot-password/reset" element={<ResetPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
  
}

export default App;