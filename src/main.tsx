import React, { lazy, Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./index.css";
import "./i18n";
import { WindowFrame } from "./components/window-frame";
import { MainTitleBar } from "./components/main-title-bar";
import { Sidebar } from "./components/sidebar";

const HomePage = lazy(() => import("./pages/home"));
const AboutPage = lazy(() => import("./pages/about"));
const SettingsPage = lazy(() => import("./pages/settings"));
const TutorialPage = lazy(() => import("./pages/tutorial"));
const EditorPage = lazy(() => import("./pages/editor"));

function AppWrapper() {
  const [currentPage, setCurrentPage] = useState<string>(
    window.location.pathname === "/editor" ? "/editor" :
    window.location.pathname === "/tutorial" ? "/tutorial" : "/"
  );

  useEffect(() => {
    // Show window after React is ready
    getCurrentWindow().show();

    // Listen for page navigation events
    const handleNavigation = (e: CustomEvent<{ page: string }>) => {
      setCurrentPage(e.detail.page);
      window.history.pushState({}, "", e.detail.page);
    };

    window.addEventListener("navigate" as any, handleNavigation);
    return () => window.removeEventListener("navigate" as any, handleNavigation);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "/":
        return <HomePage />;
      case "/about":
        return <AboutPage />;
      case "/settings":
        return <SettingsPage />;
      case "/tutorial":
        return <TutorialPage />;
      case "/editor":
        return <EditorPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <WindowFrame
      titleBar={<MainTitleBar />}
      contentClassName="flex h-full overflow-hidden"
    >
      <Sidebar currentPath={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </WindowFrame>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <AppWrapper />
    </Suspense>
  </React.StrictMode>
);
