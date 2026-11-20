/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArchiveOutline,
  LinkOutline,
  LogOutOutline,
  MoreHorizontalOutline,
  SettingsOutline,
  ShareAltOutline,
  StarOutline,
} from "@makeplane/propel/icons";
// plane imports
import { setPromiseToast } from "@plane/blocks/toast";
import { useTranslation } from "@plane/i18n";
import { Icon } from "@makeplane/propel/components/icon";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@makeplane/propel/components/menu";
// components
import { ArchiveRestoreProjectModal } from "@/components/project/archive-restore-modal";
// hooks
import { useProject } from "@/hooks/store/use-project";

type Props = {
  workspaceSlug: string;
  project: {
    id: string;
    is_favorite?: boolean;
  };
  isAdmin: boolean;
  isAuthorized: boolean;
  onCopyText: () => void;
  onLeaveProject: () => void;
  onPublishModal: () => void;
  /** Notified when the menu open state changes (e.g. keep row hover chrome visible). */
  onOpenChange?: (open: boolean) => void;
};

export function ProjectActionsMenu({
  workspaceSlug,
  project,
  isAdmin,
  isAuthorized,
  onCopyText,
  onLeaveProject,
  onPublishModal,
  onOpenChange,
}: Props) {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addProjectToFavorites, removeProjectFromFavorites } = useProject();

  const handleOpenChange = (open: boolean) => {
    setIsMenuActive(open);
    onOpenChange?.(open);
  };

  const handleToggleFavorite = () => {
    const promise = project.is_favorite
      ? removeProjectFromFavorites(workspaceSlug, project.id)
      : addProjectToFavorites(workspaceSlug, project.id);

    setPromiseToast(promise, {
      loading: project.is_favorite ? "Removing project from favorites..." : "Adding project to favorites...",
      success: {
        title: "Success!",
        message: () => (project.is_favorite ? "Project removed from favorites." : "Project added to favorites."),
      },
      error: {
        title: "Error!",
        message: () =>
          project.is_favorite
            ? "Couldn't remove the project from favorites. Please try again."
            : "Couldn't add the project to favorites. Please try again.",
      },
    });
  };

  return (
    <>
      <ArchiveRestoreProjectModal
        workspaceSlug={workspaceSlug}
        projectId={project.id}
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        archive
      />
      <div className="shrink-0">
        <Menu open={isMenuActive} onOpenChange={handleOpenChange}>
          <MenuTrigger
            render={
              <button
                type="button"
                aria-label={t("aria_labels.projects_sidebar.toggle_quick_actions_menu")}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-transparent text-placeholder hover:bg-transparent hover:text-secondary data-popup-open:bg-transparent data-popup-open:text-secondary"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Icon icon={MoreHorizontalOutline} className="size-3.5" />
              </button>
            }
          />
          <MenuContent side="bottom" align="start">
            <MenuItem
              icon={<Icon icon={SettingsOutline} />}
              label={t("settings")}
              onClick={() => {
                void navigate(`/${workspaceSlug}/settings/projects/${project.id}`);
              }}
            />
            <MenuItem icon={<Icon icon={LinkOutline} />} label={t("copy_link")} onClick={onCopyText} />
            <MenuItem
              icon={<Icon icon={StarOutline} />}
              label={project.is_favorite ? t("remove_from_favorites") : t("add_to_favorites")}
              onClick={handleToggleFavorite}
            />
            {isAdmin ? (
              <MenuItem icon={<Icon icon={ShareAltOutline} />} label={t("publish_project")} onClick={onPublishModal} />
            ) : null}
            {isAuthorized ? (
              <MenuItem
                icon={<Icon icon={ArchiveOutline} />}
                label="Open archives"
                onClick={() => {
                  void navigate(`/${workspaceSlug}/projects/${project.id}/archives/issues`);
                }}
              />
            ) : null}

            <MenuSeparator />

            {isAdmin ? (
              <MenuItem
                icon={<Icon icon={ArchiveOutline} />}
                label="Archive project"
                onClick={() => setArchiveModalOpen(true)}
              />
            ) : null}
            <MenuItem
              variant="danger"
              icon={<Icon icon={LogOutOutline} />}
              label={t("leave_project")}
              onClick={onLeaveProject}
            />
          </MenuContent>
        </Menu>
      </div>
    </>
  );
}
