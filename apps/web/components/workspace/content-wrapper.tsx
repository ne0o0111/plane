/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
// plane imports
import { cn } from "@plane/utils";
import { AppRailRoot } from "@/components/navigation";
import { ClickUpHomeSidebar } from "@/components/navigation/clickup-home-sidebar";
import { useAppRailVisibility } from "@/lib/app-rail";
import { TopNavigationRoot } from "@/components/navigation/top-navigation-root";

export const WorkspaceContentWrapper = observer(function WorkspaceContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { shouldRenderAppRail } = useAppRailVisibility();

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
            {shouldRenderAppRail && <ClickUpHomeSidebar />}
            <div className="relative flex size-full min-w-0 flex-grow overflow-hidden">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
});
