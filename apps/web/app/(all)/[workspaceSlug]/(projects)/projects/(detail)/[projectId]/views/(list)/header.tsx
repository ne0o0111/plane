/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// ui
import { Button } from "@makeplane/propel/components/button";
import { ViewsOutline } from "@makeplane/propel/icons";
import { Breadcrumbs } from "@plane/blocks/breadcrumb";
import { Header } from "@plane/blocks/layout";
// components
import { ViewListHeader } from "@/components/views/view-list-header";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useProject } from "@/hooks/store/use-project";
// plane web imports
import { CommonProjectBreadcrumbs } from "@/components/breadcrumbs/common";
import { useProjectCrumbProps } from "@/components/breadcrumbs/use-project-crumb-props";

const VIEW_ACCENT = "#D97706";

export const ProjectViewsHeader = observer(function ProjectViewsHeader() {
  const { workspaceSlug, projectId } = useParams();
  const projectCrumb = useProjectCrumbProps(workspaceSlug?.toString(), projectId?.toString());
  // store hooks
  const { toggleCreateViewModal } = useCommandPalette();
  const { loader } = useProject();

  return (
    <>
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
                    <ViewsOutline className="h-3.5 w-3.5 shrink-0" style={{ color: VIEW_ACCENT }} />
                    <span
                      style={{
                        color: "#1E293B",
                        fontSize: 13,
                        fontWeight: 600,
                        lineHeight: "16px",
                      }}
                    >
                      Views
                    </span>
                  </span>
                }
                isLast
              />
            </Breadcrumbs>
          </div>
        </Header.LeftItem>
        <Header.RightItem>
          <ViewListHeader />
          <div>
            <Button
              variant="primary"
              size="md"
              stretch="auto"
              label="Add view"
              onClick={() => toggleCreateViewModal(true)}
            />
          </div>
        </Header.RightItem>
      </Header>
    </>
  );
});
