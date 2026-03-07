import * as React from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { AdminShell } from "./components/admin/AdminShell";
import { Dashboard } from "./components/admin/Dashboard";
import { BlogList } from "./components/portfolio/BlogList";
import BlogPostPage from "./pages/BlogPostPage";
import { PortfolioApp } from "./components/portfolio/PortfolioApp";
import Footer from "./components/portfolio/Footer";
import Navbar from "./components/portfolio/Navbar";
import LoginPage from "./pages/LoginPage";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminExperience from "./pages/admin/AdminExperience";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSeo from "./pages/admin/AdminSeo";
import AdminSettings from "./pages/admin/AdminSettings";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function AdminLayout() {
  const { pathname } = useLocation();
  const [allowed, setAllowed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      setAllowed(false);
      return;
    }
    adminApi.getMe().then((res) => {
      setAllowed(res.success === true);
    });
  }, []);

  if (allowed === false) {
    return <Navigate to="/admin/login" replace />;
  }
  if (allowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  return (
    <AdminShell currentPath={pathname}>
      <Outlet />
    </AdminShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<PortfolioApp />} />
        <Route path="blog" element={<BlogList />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
      </Route>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="experience" element={<AdminExperience />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="seo" element={<AdminSeo />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
