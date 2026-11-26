/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
// plane imports
import { cn } from "@plane/utils";
import { AppRailRoot } from "@/components/navigation";
import { HomeSidebar } from "@/components/navigation/home-sidebar";
import { HomeSidebarProvider, useHomeSidebar } from "@/components/navigation/home-sidebar-context";
import { useAppRailVisibility } from "@/lib/app-rail";
import { TopNavigationRoot } from "@/components/navigation/top-navigation-root";

const HOME_SIDEBAR_WIDTH = 256;
const HOME_SIDEBAR_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const HOME_SIDEBAR_MS = 280;

/** Workspace / Space settings have their own sidebar — hide Home without mutating the saved preference. */
function isSettingsPath(pathname: string | null): boolean {
  return /\/settings(\/|$)/.test(pathname ?? "");
}

const WorkspaceShell = observer(function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { shouldRenderAppRail } = useAppRailVisibility();
  const { collapsed, toggleCollapsed } = useHomeSidebar();
  const homeHidden = collapsed || isSettingsPath(pathname);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        // Don't toggle while settings forces Home closed.
        if (isSettingsPath(pathname)) return;
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleCollapsed, pathname]);

  return (
    <div className="relative flex size-full flex-col overflow-hidden bg-canvas transition-all duration-300 ease-in-out">
      <TopNavigationRoot />
      <div className="relative flex size-full overflow-hidden">
        {shouldRenderAppRail && <AppRailRoot />}
        <div
          className={cn(
            "relative flex size-full min-w-0 flex-grow overflow-hidden pr-2 pb-2 transition-all duration-300 ease-in-out",
            shouldRenderAppRail ? "pl-0" : "pl-2"
          )}
        >
          {/* Shared card: border + radius wrap Home + Plane content (Figma Main panel) */}
          <div className="relative flex size-full overflow-hidden rounded-lg border border-subtle bg-surface-1">
            {shouldRenderAppRail ? (
              <div
                aria-hidden={homeHidden}
                style={{
                  width: homeHidden ? 0 : HOME_SIDEBAR_WIDTH,
                  minWidth: homeHidden ? 0 : HOME_SIDEBAR_WIDTH,
                  maxWidth: homeHidden ? 0 : HOME_SIDEBAR_WIDTH,
                  height: "100%",
                  overflow: "hidden",
                  flexShrink: 0,
                  transition: `width ${HOME_SIDEBAR_MS}ms ${HOME_SIDEBAR_EASE}, min-width ${HOME_SIDEBAR_MS}ms ${HOME_SIDEBAR_EASE}, max-width ${HOME_SIDEBAR_MS}ms ${HOME_SIDEBAR_EASE}`,
                }}
              >
                <div
                  style={{
                    width: HOME_SIDEBAR_WIDTH,
                    height: "100%",
                    opacity: homeHidden ? 0 : 1,
                    transform: homeHidden ? "translateX(-12px)" : "translateX(0)",
                    transition: `opacity ${HOME_SIDEBAR_MS - 40}ms ${HOME_SIDEBAR_EASE}, transform ${HOME_SIDEBAR_MS}ms ${HOME_SIDEBAR_EASE}`,
                    pointerEvents: homeHidden ? "none" : "auto",
                  }}
                >
                  <HomeSidebar />
                </div>
              </div>
            ) : null}
            <div className="relative flex size-full min-w-0 flex-grow overflow-hidden">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const WorkspaceContentWrapper = observer(function WorkspaceContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HomeSidebarProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </HomeSidebarProvider>
  );
});
