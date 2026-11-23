/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
// constants
import { EPageAccess } from "@plane/constants";
// plane types
import { Button } from "@makeplane/propel/components/button";
import { PagesOutline } from "@makeplane/propel/icons";
import { setToast } from "@plane/blocks/toast";
import type { TPage } from "@plane/types";
// plane ui
import { Breadcrumbs } from "@plane/blocks/breadcrumb";
import { Header } from "@plane/blocks/layout";
// hooks
import { useProject } from "@/hooks/store/use-project";
// plane web imports
import { CommonProjectBreadcrumbs } from "@/components/breadcrumbs/common";
import { useProjectCrumbProps } from "@/components/breadcrumbs/use-project-crumb-props";
import { EPageStoreType, usePageStore } from "@/hooks/store";

const DOC_ACCENT = "#0891B2";

export const PagesListHeader = observer(function PagesListHeader() {
  // states
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = useParams();
  const projectCrumb = useProjectCrumbProps(workspaceSlug?.toString(), projectId?.toString());
  const searchParams = useSearchParams();
  const pageType = searchParams.get("type");
  // store hooks
  const { currentProjectDetails, loader } = useProject();
  const { canCurrentUserCreatePage, createPage } = usePageStore(EPageStoreType.PROJECT);
  // handle page create
  const handleCreatePage = async () => {
    setIsCreatingPage(true);

    const payload: Partial<TPage> = {
      access: pageType === "private" ? EPageAccess.PRIVATE : EPageAccess.PUBLIC,
    };

    await createPage(payload)
      // oxlint-disable-next-line promise/always-return
      .then((res) => {
        const pageId = `/${workspaceSlug}/projects/${currentProjectDetails?.id}/pages/${res?.id}`;
        router.push(pageId);
      })
      .catch((err) => {
        setToast({
          type: "error",
          title: "Error!",
          message: err?.data?.error || "Doc could not be created. Please try again.",
        });
      })
      .finally(() => setIsCreatingPage(false));
  };

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
                  <PagesOutline className="h-3.5 w-3.5 shrink-0" style={{ color: DOC_ACCENT }} />
                  <span
                    style={{
                      color: "#1E293B",
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: "16px",
                    }}
                  >
                    Docs
                  </span>
                </span>
              }
              isLast
            />
          </Breadcrumbs>
        </div>
      </Header.LeftItem>
      {canCurrentUserCreatePage && (
        <Header.RightItem>
          <Button
            variant="primary"
            size="md"
            stretch="auto"
            label={isCreatingPage ? "Adding" : "Add Doc"}
            onClick={handleCreatePage}
            loading={isCreatingPage}
          />
        </Header.RightItem>
      )}
    </Header>
  );
});
