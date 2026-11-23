/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// ui
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@makeplane/propel/components/button";
import { CyclesOutline } from "@makeplane/propel/icons";
import { Breadcrumbs } from "@plane/blocks/breadcrumb";
import { Header } from "@plane/blocks/layout";
// components
import { CyclesViewHeader } from "@/components/cycles/cycles-view-header";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import { CommonProjectBreadcrumbs } from "@/components/breadcrumbs/common";
import { useProjectCrumbProps } from "@/components/breadcrumbs/use-project-crumb-props";

const SPRINT_ACCENT = "#7C3AED";

export const CyclesListHeader = observer(function CyclesListHeader() {
  // router
  const { workspaceSlug, projectId } = useParams();
  const projectCrumb = useProjectCrumbProps(workspaceSlug?.toString(), projectId?.toString());

  // store hooks
  const { toggleCreateCycleModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  const { currentProjectDetails, loader } = useProject();
  const { t } = useTranslation();

  const canUserCreateCycle = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  return (
    <Header>
      <Header.LeftItem>
        <div className="flex items-center gap-2.5">
          <Breadcrumbs isLoading={loader === "init-loader"} className="flex-grow-0">
            <CommonProjectBreadcrumbs
              workspaceSlug={workspaceSlug?.toString()}
              projectId={projectId?.toString()}
              {...projectCrumb}
            />
            <Breadcrumbs.Item
              component={
                <span
                  aria-current="page"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    height: 28,
                    padding: "0 10px 0 8px",
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                  }}
                >
                  <CyclesOutline className="h-3.5 w-3.5 shrink-0" style={{ color: SPRINT_ACCENT }} />
                  <span
                    style={{
                      color: "#1E293B",
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: "16px",
                    }}
                  >
                    Sprints
                  </span>
                </span>
              }
              isLast
            />
          </Breadcrumbs>
        </div>
      </Header.LeftItem>
      {canUserCreateCycle && currentProjectDetails ? (
        <Header.RightItem>
          <CyclesViewHeader projectId={currentProjectDetails.id} />
          <div className="flex">
            <div className="block sm:hidden">
              <Button
                variant="primary"
                size="md"
                stretch="auto"
                label={t("add")}
                onClick={() => {
                  toggleCreateCycleModal(true);
                }}
              />
            </div>
            <div className="hidden sm:block">
              <Button
                variant="primary"
                size="md"
                stretch="auto"
                label={t("project_cycles.add_cycle")}
                onClick={() => {
                  toggleCreateCycleModal(true);
                }}
              />
            </div>
          </div>
        </Header.RightItem>
      ) : (
        <></>
      )}
    </Header>
  );
});
