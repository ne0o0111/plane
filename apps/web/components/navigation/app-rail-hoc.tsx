/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
import { useParams, usePathname } from "next/navigation";
import { useHomeSidebar } from "@/components/navigation/home-sidebar-context";
import type { TAppRailItemProps } from "./app-rail-item";
import { AppRailIcon } from "./app-rail-icon";

export type TAppRailDockItem = TAppRailItemProps & {
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
    const { collapsed, setCollapsed } = useHomeSidebar();
    const slug = workspaceSlug?.toString() ?? "";
    const isHome = pathname === `/${slug}` || pathname === `/${slug}/`;
    const isSpaces = pathname.includes(`/${slug}/projects`);
    const isPlanner = pathname.includes(`/${slug}/active-cycles`);
    const plannerDay = String(new Date().getDate());

    const dockItems: TAppRailDockItem[] = [
      {
        label: "Home",
        icon: collapsed ? (
          <AppRailIcon src="/icons/app-rail/expand-chevrons.svg" alt="Open Home sidebar" />
        ) : (
          <AppRailIcon src="/icons/app-rail/home.svg" alt="Home" withGlow />
        ),
        href: collapsed ? undefined : `/${slug}/`,
        onClick: collapsed ? () => setCollapsed(false) : undefined,
        isActive: isHome || collapsed,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Spaces",
        icon: <AppRailIcon src="/icons/app-rail/spaces.svg" alt="Spaces" />,
        href: `/${slug}/projects/`,
        isActive: isSpaces,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Planner",
        icon: <AppRailIcon src="/icons/app-rail/planner.svg" alt="Planner" badge={plannerDay} />,
        href: `/${slug}/active-cycles/`,
        isActive: isPlanner,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Docs",
        icon: <AppRailIcon src="/icons/app-rail/docs.svg" alt="Docs" />,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Dashboards",
        icon: <AppRailIcon src="/icons/app-rail/dashboards.svg" alt="Dashboards" />,
        shouldRender: true,
        section: "top",
      },
      {
        label: "Invite",
        icon: <AppRailIcon src="/icons/app-rail/invite.svg" alt="Invite" />,
        tracking: "utility",
        shouldRender: true,
        section: "bottom",
      },
    ];

    return <WrappedComponent {...(props as P)} dockItems={dockItems} />;
  });

  return ComponentWithDockItems;
}
