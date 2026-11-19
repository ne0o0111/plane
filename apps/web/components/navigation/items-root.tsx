/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { AppSidebarItem } from "@/components/sidebar/sidebar-item";
import type { TAppRailDockItem } from "./app-rail-hoc";
import { withDockItems } from "./app-rail-hoc";

type Props = {
  dockItems: TAppRailDockItem[];
  showLabel?: boolean;
  section?: "top" | "bottom";
};

function Component({ dockItems, showLabel = true, section = "top" }: Props) {
  return (
    <>
      {dockItems
        .filter((item) => item.shouldRender && item.section === section)
        .map((item) => (
          <AppSidebarItem
            key={item.label}
            item={{ ...item, showLabel, tone: "inverse" }}
            variant={item.href ? "link" : "button"}
          />
        ))}
    </>
  );
}

export const AppSidebarItemsRoot = withDockItems(Component);
