import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { WindowFrame } from "./window-frame";
import { MainTitleBar } from "./main-title-bar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <WindowFrame
      titleBar={<MainTitleBar />}
      contentClassName="flex h-full overflow-hidden"
    >
      <Sidebar currentPath={window.location.pathname} />
      <div className="flex-1 overflow-auto">{children}</div>
    </WindowFrame>
  );
}
