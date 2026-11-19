/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
import { useParams, usePathname } from "next/navigation";
import type { AppSidebarItemData } from "@/components/sidebar/sidebar-item";
import { ClickUpRailIcon } from "./clickup-rail-icon";

export type TAppRailDockItem = AppSidebarItemData & {
  shouldRender: boolean;
  section: "top" | "bottom";
};

type WithDockItemsProps = {
  dockItems: TAppRailDockItem[];
};

export function withDockItems<P extends WithDockItemsProps>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithDockItems = observer(function ComponentWithDockItems(props: Omit<P, keyof WithDockItemsProps>) {
    const { workspaceSlug } = useParams();
    const pathname = usePathname();
    const slug = workspaceSlug?.toString() ?? "";
    const isHome = pathname === `/${slug}` || pathname === `/${slug}/`;
    const isSpaces = pathname.includes(`/${slug}/projects`);
    const isPlanner = pathname.includes(`/${slug}/active-cycles`);

    const dockItems: TAppRailDockItem[] = [
      {
        label: "Home",
        icon: <ClickUpRailIcon src="/clickup-rail/home.svg" alt="Home" withGlow />,
        href: `/${slug}/`,
        isActive: isHome,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Spaces",
        icon: <ClickUpRailIcon src="/clickup-rail/spaces.svg" alt="Spaces" />,
        href: `/${slug}/projects/`,
        isActive: isSpaces,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Planner",
        icon: <ClickUpRailIcon src="/clickup-rail/planner.svg" alt="Planner" />,
        href: `/${slug}/active-cycles/`,
        isActive: isPlanner,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Docs",
        icon: <ClickUpRailIcon src="/clickup-rail/docs.svg" alt="Docs" />,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Dashboards",
        icon: <ClickUpRailIcon src="/clickup-rail/dashboards.svg" alt="Dashboards" />,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Invite",
        icon: <ClickUpRailIcon src="/clickup-rail/invite.svg" alt="Invite" />,
        shouldRender: true,
        section: "bottom",
      },
    ];

    return <WrappedComponent {...(props as P)} dockItems={dockItems} />;
  });

  return ComponentWithDockItems;
}
