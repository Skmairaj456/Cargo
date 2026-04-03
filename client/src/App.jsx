import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/DashboardPage";
import DriverPage from "./pages/DriverPage";
import AuthPage from "./pages/AuthPage";

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<BookingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/driver" element={<DriverPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);

export default App;
