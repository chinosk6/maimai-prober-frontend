import { lazy } from "react";
import { createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route } from "react-router-dom";
import { checkPermission, isTokenExpired, isTokenUndefined, logout, UserPermission } from "./utils/session";
import { refreshToken } from "./utils/api/user";
import App from "./App";
import DeveloperInfo from "./pages/developer/Info";

const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Sync = lazy(() => import('./pages/user/Sync'));
const Scores = lazy(() => import('./pages/user/Scores'));
const Settings = lazy(() => import('./pages/user/Settings'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const DeveloperApply = lazy(() => import('./pages/developer/Apply'));
const Users = lazy(() => import('./pages/admin/Users'));
const Developers = lazy(() => import('./pages/admin/Developers'));

const ProtectedRoute = ({ extra_validation }: { extra_validation?: any }) => {
  if (!isTokenUndefined() && isTokenExpired()) {
    // 切换页面时若 token 过期则尝试刷新 token
    refreshToken().catch(() => {
      logout();
      return <Navigate to="/login" state={{ expired: true }} replace />;
    });
  } else if (isTokenUndefined()) {
    return <Navigate to="/login" replace />;
  }

  if (extra_validation && !extra_validation()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />
}

const routesConfig = (
  <Route element={<App />}>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/user" element={<ProtectedRoute />}>
      <Route index element={<Home />} />
      <Route path="profile" element={<Profile />} />
      <Route path="sync" element={<Sync />} />
      <Route path="scores" element={<Scores />} />
      <Route path="settings" element={<Settings />} />
    </Route>
    <Route path="/developer" element={<ProtectedRoute />}>
      <Route path="apply" element={<DeveloperApply />} />
      <Route path="" element={<DeveloperInfo />} />
    </Route>
    <Route path="/admin" element={<ProtectedRoute extra_validation={
      () => checkPermission(UserPermission.Administrator)}
    />}>
      <Route path="users" element={<Users />} />
      <Route path="developers" element={<Developers />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Route>
);

export const router = createBrowserRouter(
  createRoutesFromElements(routesConfig)
)