/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";
import { observer } from "mobx-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@makeplane/propel/components/context-menu";
// hooks
import { useAppRailPreferences } from "@/hooks/use-navigation-preferences";
import { useAppRailVisibility } from "@/lib/app-rail/context";
// local imports
import { AppSidebarItemsRoot } from "./items-root";

export const AppRailRoot = observer(() => {
  // preferences
  const { preferences, updateDisplayMode } = useAppRailPreferences();
  const { isCollapsed, toggleAppRail } = useAppRailVisibility();
  // derived values
  const showLabel = preferences.displayMode === "icon_with_label";
  const railWidth = showLabel ? "3.5rem" : "3rem";

  return (
    <div
      className="z-[26] h-full flex-shrink-0 py-1.5 pl-1.5 transition-all duration-300 ease-in-out"
      style={{
        width: `calc(${railWidth} + 0.375rem)`,
        display: "block",
      }}
    >
      <ContextMenu>
        <ContextMenuTrigger render={<div className="h-full" />}>
          <div
            className="flex h-full flex-col justify-between rounded-lg px-1.5 py-3"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="flex flex-col gap-4">
              <AppSidebarItemsRoot showLabel={showLabel} section="top" />
            </div>
            <div className="flex flex-col gap-4">
              <AppSidebarItemsRoot showLabel={showLabel} section="bottom" />
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => updateDisplayMode("icon_only")}
            label="Icon only"
            selected={preferences.displayMode === "icon_only"}
          />
          <ContextMenuItem
            onClick={() => updateDisplayMode("icon_with_label")}
            label="Icon with name"
            selected={preferences.displayMode === "icon_with_label"}
          />
          <ContextMenuSeparator />
          <ContextMenuItem onClick={toggleAppRail} label={isCollapsed ? "Dock App Rail" : "Undock App Rail"} />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
});
