import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { TemplatesPage } from "./components/TemplatesPage";
import { DraftEditor } from "./components/DraftEditor";
import { MyDocuments } from "./components/MyDocuments";
import { Analytics } from "./components/Analytics";
import { Settings } from "./components/Settings";
import { Support } from "./components/Support";
import { Documentation } from "./components/Documentation";
import { LoginPage, SignupPage } from "./components/AuthPages";
import { ForgotPasswordPage, ResetPasswordPage } from "./components/ForgotPassword";
import { RequireAuth } from "./components/auth";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  { path: "/signup", Component: SignupPage },
  { path: "/forgot-password", Component: ForgotPasswordPage },
  { path: "/reset-password", Component: ResetPasswordPage },
  {
    path: "/",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: "templates", Component: TemplatesPage },
      { path: "templates/:templateName", Component: DraftEditor },
      { path: "documents", Component: MyDocuments },
      { path: "shared", Component: Dashboard },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
      { path: "support", Component: Support },
      { path: "docs", Component: Documentation },
      { path: "*", Component: Dashboard },
    ],
  },
]);
