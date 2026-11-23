/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// icons
// plane imports
import { EUserPermissions, EUserPermissionsLevel, SPACE_BASE_PATH, SPACE_BASE_URL } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@makeplane/propel/elements/button";
import { NewTabOutline, WorkItemsOutline } from "@makeplane/propel/icons";
import { Tooltip } from "@makeplane/propel/components/tooltip";
import { EIssuesStoreType } from "@plane/types";
import { Breadcrumbs } from "@plane/blocks/breadcrumb";
import { Header } from "@plane/blocks/layout";
// components
import { HeaderFilters } from "@/components/issues/filters";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useIssues } from "@/hooks/store/use-issues";
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { usePlatformOS } from "@/hooks/use-platform-os";
// plane web imports
import { CommonProjectBreadcrumbs } from "@/components/breadcrumbs/common";
import { useProjectCrumbProps } from "@/components/breadcrumbs/use-project-crumb-props";

const TASK_ACCENT = "#2563EB";

export const IssuesHeader = observer(function IssuesHeader() {
  // router
  const { workspaceSlug, projectId } = useParams();
  const projectCrumb = useProjectCrumbProps(workspaceSlug?.toString(), projectId?.toString());
  // store hooks
  const {
    issues: { getGroupIssueCount },
  } = useIssues(EIssuesStoreType.PROJECT);
  // i18n
  const { t } = useTranslation();

  const { currentProjectDetails, loader } = useProject();

  const { toggleCreateIssueModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  const { isMobile } = usePlatformOS();

  const SPACE_APP_URL =
    (SPACE_BASE_URL.trim() === "" && typeof window !== "undefined" ? window.location.origin : SPACE_BASE_URL) +
    SPACE_BASE_PATH;
  const publishedURL = `${SPACE_APP_URL}/issues/${currentProjectDetails?.anchor}`;

  const issuesCount = getGroupIssueCount(undefined, undefined, false);
  const canUserCreateIssue = allowPermissions(
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
                <Tooltip
                  label={
                    issuesCount && issuesCount > 0
                      ? `There are ${issuesCount} ${issuesCount > 1 ? "tasks" : "task"} in this project`
                      : "Tasks"
                  }
                  layout="stacked"
                  side="bottom"
                  disabled={isMobile}
                >
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
                    <WorkItemsOutline className="h-3.5 w-3.5 shrink-0" style={{ color: TASK_ACCENT }} />
                    <span
                      style={{
                        color: "#1E293B",
                        fontSize: 13,
                        fontWeight: 600,
                        lineHeight: "16px",
                      }}
                    >
                      Tasks
                    </span>
                    {issuesCount && issuesCount > 0 ? (
                      <span
                        style={{
                          marginLeft: 2,
                          padding: "2px 6px",
                          borderRadius: 6,
                          background: "#EFF6FF",
                          color: "#2563EB",
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: "14px",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {issuesCount}
                      </span>
                    ) : null}
                  </span>
                </Tooltip>
              }
              isLast
            />
          </Breadcrumbs>
        </div>
        {currentProjectDetails?.anchor ? (
          <a
            href={publishedURL}
            className="group flex items-center gap-1.5 rounded-sm bg-accent-primary/10 px-2.5 py-1 text-caption-sm-medium text-accent-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent-primary" />
            {t("workspace_projects.network.public.title")}
            <NewTabOutline className="hidden h-3 w-3 group-hover:block" />
          </a>
        ) : (
          <></>
        )}
      </Header.LeftItem>
      <Header.RightItem>
        <div className="hidden gap-2 md:flex">
          {workspaceSlug && projectId && (
            <HeaderFilters
              projectId={projectId.toString()}
              currentProjectDetails={currentProjectDetails}
              workspaceSlug={workspaceSlug.toString()}
              canUserCreateIssue={canUserCreateIssue}
            />
          )}
        </div>
        {canUserCreateIssue && (
          <Button
            variant="primary"
            size="md"
            stretch="auto"
            type="button"
            onClick={() => {
              toggleCreateIssueModal(true, EIssuesStoreType.PROJECT);
            }}
          >
            <div className="block sm:hidden">{t("issue.label", { count: 1 })}</div>
            <div className="hidden sm:block">{t("issue.add.label")}</div>
          </Button>
        )}
      </Header.RightItem>
    </Header>
  );
});
