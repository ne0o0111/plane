/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";
import { useEffect } from "react";
import { observer } from "mobx-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@makeplane/propel/components/context-menu";
import { useAppRailPreferences } from "@/hooks/use-navigation-preferences";
import { useAppRailVisibility } from "@/lib/app-rail/context";
import { AppSidebarItemsRoot } from "./items-root";

const ROBOTO_LINK_ID = "clickup-rail-roboto-font";

function ensureRobotoFont() {
  if (typeof document === "undefined") return;
  if (document.getElementById(ROBOTO_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = ROBOTO_LINK_ID;
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@600;700;800&display=swap";
  document.head.appendChild(link);
}

export const AppRailRoot = observer(() => {
  const { preferences, updateDisplayMode } = useAppRailPreferences();
  const { isCollapsed, toggleAppRail } = useAppRailVisibility();

  useEffect(() => {
    ensureRobotoFont();
  }, []);

  return (
    <div style={{ zIndex: 26, height: "100%", width: 58, flexShrink: 0, padding: "6px 0 6px 6px" }}>
      <ContextMenu>
        <ContextMenuTrigger render={<div style={{ height: "100%" }} />}>
          <div
            style={{
              display: "flex",
              height: "100%",
              width: 52,
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "visible",
              borderRadius: 8,
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: "#000000",
              boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.11), 0px 2px 4px -2px rgba(0,0,0,0.11)",
            }}
          >
            {/* Item height ~50px + gap 12px = 62px pitch (Figma) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <AppSidebarItemsRoot section="top" />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <AppSidebarItemsRoot section="bottom" />
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
