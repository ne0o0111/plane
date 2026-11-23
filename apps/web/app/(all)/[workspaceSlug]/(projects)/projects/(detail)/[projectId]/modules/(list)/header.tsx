/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
// ui
import { Button } from "@makeplane/propel/components/button";
import { ModuleOutline } from "@makeplane/propel/icons";
import { Breadcrumbs } from "@plane/blocks/breadcrumb";
import { Header } from "@plane/blocks/layout";
// components
import { ModuleViewHeader } from "@/components/modules";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import { CommonProjectBreadcrumbs } from "@/components/breadcrumbs/common";
import { useProjectCrumbProps } from "@/components/breadcrumbs/use-project-crumb-props";

const EPIC_ACCENT = "#059669";

export const ModulesListHeader = observer(function ModulesListHeader() {
  // router
  const { workspaceSlug, projectId } = useParams();
  const projectCrumb = useProjectCrumbProps(workspaceSlug?.toString(), projectId?.toString());
  // store hooks
  const { toggleCreateModuleModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();

  const { loader } = useProject();

  const { t } = useTranslation();

  // auth
  const canUserCreateModule = allowPermissions(
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
                  <ModuleOutline className="h-3.5 w-3.5 shrink-0" style={{ color: EPIC_ACCENT }} />
                  <span
                    style={{
                      color: "#1E293B",
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: "16px",
                    }}
                  >
                    Epics
                  </span>
                </span>
              }
              isLast
            />
          </Breadcrumbs>
        </div>
      </Header.LeftItem>
      <Header.RightItem>
        <ModuleViewHeader />
        {canUserCreateModule ? (
          <div className="flex">
            <div className="block sm:hidden">
              <Button
                variant="primary"
                size="md"
                stretch="auto"
                label={t("add")}
                onClick={() => {
                  toggleCreateModuleModal(true);
                }}
              />
            </div>
            <div className="hidden sm:block">
              <Button
                variant="primary"
                size="md"
                stretch="auto"
                label={t("project_module.add_module")}
                onClick={() => {
                  toggleCreateModuleModal(true);
                }}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
      </Header.RightItem>
    </Header>
  );
});
