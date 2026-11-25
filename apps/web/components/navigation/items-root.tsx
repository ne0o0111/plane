/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import type { TAppRailDockItem } from "./app-rail-hoc";
import { withDockItems } from "./app-rail-hoc";
import { AppRailItem } from "./app-rail-item";

type Props = {
  dockItems: TAppRailDockItem[];
  section?: "top" | "bottom";
};

function Component({ dockItems, section = "top" }: Props) {
  return (
    <>
      {dockItems
        .filter((item) => item.shouldRender && item.section === section)
        .map((item) => (
          <AppRailItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            href={item.href}
            isActive={item.isActive}
            tracking={item.tracking}
            onClick={item.onClick}
          />
        ))}
    </>
  );
}

export const AppSidebarItemsRoot = withDockItems(Component);
