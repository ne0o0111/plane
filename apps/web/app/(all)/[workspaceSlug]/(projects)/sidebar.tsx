/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane helpers
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { EUserWorkspaceRoles } from "@plane/types";
import { DraftsOutline, InboxOutline, YourWorkOutline } from "@makeplane/propel/icons";
// components
import { SidebarWrapper } from "@/components/sidebar/sidebar-wrapper";
import { SidebarFavoritesMenu } from "@/components/workspace/sidebar/favorites/favorites-menu";
import { SidebarProjectsList } from "@/components/workspace/sidebar/projects-list";
import { SidebarQuickActions } from "@/components/workspace/sidebar/quick-actions";
import { SidebarUserMenuItem } from "@/components/workspace/sidebar/user-menu-item";
// hooks
import { useFavorite } from "@/hooks/store/use-favorite";
import { useUser, useUserPermissions } from "@/hooks/store/user";

export const AppSidebar = observer(function AppSidebar() {
  const { workspaceSlug } = useParams();
  const slug = workspaceSlug?.toString() ?? "";
  // store hooks
  const { allowPermissions, workspaceUserInfo } = useUserPermissions();
  const { data: currentUser } = useUser();
  const { groupedFavorites } = useFavorite();

  // derived values
  const canPerformWorkspaceMemberActions = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );
  const isFavoriteEmpty = isEmpty(groupedFavorites);
  const draftIssueCount = workspaceUserInfo[slug]?.draft_issue_count ?? 0;
  const memberAccess = [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER];
  const everyoneAccess = [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER, EUserWorkspaceRoles.GUEST];

  const homeItems = [
    {
      key: "notifications",
      labelTranslationKey: "notification.label",
      href: `/${slug}/notifications/`,
      access: everyoneAccess,
      Icon: InboxOutline,
    },
    {
      key: "your-work",
      labelTranslationKey: "sidebar.your_work",
      href: `/${slug}/profile/${currentUser?.id}/`,
      access: memberAccess,
      Icon: YourWorkOutline,
    },
    {
      key: "drafts",
      labelTranslationKey: "sidebar.drafts",
      href: `/${slug}/drafts/`,
      access: memberAccess,
      Icon: DraftsOutline,
    },
  ];

  return (
    <SidebarWrapper title="Home" quickActions={<SidebarQuickActions />}>
      <div className="flex flex-col gap-0.5">
        {homeItems.map((item) => (
          <SidebarUserMenuItem key={item.key} item={item} draftIssueCount={draftIssueCount} />
        ))}
      </div>
      {canPerformWorkspaceMemberActions && !isFavoriteEmpty && <SidebarFavoritesMenu />}
      <SidebarProjectsList />
    </SidebarWrapper>
  );
});
