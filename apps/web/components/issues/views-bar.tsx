/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "react-router";
// plane imports
import { EIssueFilterType } from "@plane/constants";
import { EIssueLayoutTypes, EIssuesStoreType } from "@plane/types";
// components
import { AddViewMenu } from "@/components/issues/add-view-menu";
import { ViewOptionsMenu } from "@/components/issues/view-options-menu";
// hooks
import { useIssues } from "@/hooks/store/use-issues";

/**
 * Views tab strip — Figma `cu3-data-view-list` (8005:259).
 * Default tab is Board (kanban). + View adds List / Board / Calendar / Table / Timeline tabs
 * and switches the issue layout to match.
 */

const FONT = "Roboto, Helvetica, Arial, sans-serif";
const TEXT = "#646464";
const TEXT_ACTIVE = "#202020";
const DIVIDER = "#e0e0e0";
const UNDERLINE = "#1a1a1a";

/** View types that map to Plane layouts and can be added from the picker */
const WORKING_VIEW_TYPES = ["list", "board", "calendar", "table", "timeline"] as const;
type TWorkingViewType = (typeof WORKING_VIEW_TYPES)[number];

const VIEW_TYPE_TO_LAYOUT: Record<TWorkingViewType, EIssueLayoutTypes> = {
  list: EIssueLayoutTypes.LIST,
  board: EIssueLayoutTypes.KANBAN,
  calendar: EIssueLayoutTypes.CALENDAR,
  table: EIssueLayoutTypes.SPREADSHEET,
  timeline: EIssueLayoutTypes.GANTT,
};

const VIEW_TYPE_LABELS: Record<TWorkingViewType, string> = {
  list: "List",
  board: "Board",
  calendar: "Calendar",
  table: "Table",
  timeline: "Timeline",
};

const VIEW_TYPE_ICON_SRC: Record<TWorkingViewType, string> = {
  list: "/icons/views/view-list.svg",
  board: "/icons/views/view-board.svg",
  calendar: "/icons/views/view-calendar.svg",
  table: "/icons/views/view-table.svg",
  timeline: "/icons/views/view-timeline.svg",
};

function isWorkingViewType(id: string): id is TWorkingViewType {
  return (WORKING_VIEW_TYPES as readonly string[]).includes(id);
}

type TViewTab = {
  id: string;
  label: string;
  viewType: TWorkingViewType;
};

const DEFAULT_BOARD_TAB_ID = "board-default";

const INITIAL_TABS: TViewTab[] = [{ id: DEFAULT_BOARD_TAB_ID, label: "Board", viewType: "board" }];

function ViewIcon({ viewType }: { viewType: TWorkingViewType }) {
  return (
    <span style={{ display: "block", width: 16, height: 16, flexShrink: 0 }}>
      <img src={VIEW_TYPE_ICON_SRC[viewType]} alt="" width={16} height={16} style={{ display: "block" }} />
    </span>
  );
}
export const IssuesViewsBar = observer(function IssuesViewsBar() {
  const { workspaceSlug, projectId, viewId } = useParams();
  const storeType = viewId ? EIssuesStoreType.PROJECT_VIEW : EIssuesStoreType.PROJECT;
  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(storeType);

  const [activeId, setActiveId] = useState(DEFAULT_BOARD_TAB_ID);
  const [tabs, setTabs] = useState<TViewTab[]>(INITIAL_TABS);
  const [addViewOpen, setAddViewOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsTabId, setOptionsTabId] = useState<string | null>(null);
  const addViewRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const optionsAnchorRef = useRef<HTMLElement | null>(null);
  const didApplyDefaultLayout = useRef(false);

  const currentLayout = issueFilters?.displayFilters?.layout;

  const applyLayout = useCallback(
    (viewType: TWorkingViewType) => {
      if (!workspaceSlug || !projectId) return;
      const layout = VIEW_TYPE_TO_LAYOUT[viewType];
      // Same layout → skip updateFilters (it clears issues + hits the API)
      if (currentLayout === layout) return;
      if (viewId) {
        updateFilters(
          workspaceSlug.toString(),
          projectId.toString(),
          EIssueFilterType.DISPLAY_FILTERS,
          { layout },
          viewId.toString()
        );
      } else {
        updateFilters(workspaceSlug.toString(), projectId.toString(), EIssueFilterType.DISPLAY_FILTERS, { layout });
      }
    },
    [workspaceSlug, projectId, viewId, updateFilters, currentLayout]
  );

  // Default tab is Board → switch to kanban once filters are loaded
  useEffect(() => {
    if (didApplyDefaultLayout.current) return;
    if (!workspaceSlug || !projectId) return;
    if (!issueFilters?.displayFilters) return;
    didApplyDefaultLayout.current = true;
    if (issueFilters.displayFilters.layout !== EIssueLayoutTypes.KANBAN) {
      applyLayout("board");
    }
  }, [workspaceSlug, projectId, issueFilters?.displayFilters, applyLayout]);

  const closeOptions = useCallback(() => {
    setOptionsOpen(false);
    setOptionsTabId(null);
    optionsAnchorRef.current = null;
  }, []);

  const handleSelectTab = (tab: TViewTab) => {
    // Active tab click → open view options popover (pattern)
    if (activeId === tab.id) {
      setAddViewOpen(false);
      if (optionsOpen && optionsTabId === tab.id) {
        closeOptions();
        return;
      }
      optionsAnchorRef.current = tabRefs.current[tab.id] ?? null;
      setOptionsTabId(tab.id);
      setOptionsOpen(true);
      return;
    }
    closeOptions();
    setActiveId(tab.id);
    applyLayout(tab.viewType);
  };

  const optionsTab = tabs.find((t) => t.id === optionsTabId);

  const handleAddView = (viewTypeId: string) => {
    if (!isWorkingViewType(viewTypeId)) {
      setAddViewOpen(false);
      return;
    }
    const existing = tabs.find((t) => t.viewType === viewTypeId);
    if (existing) {
      if (activeId !== existing.id) setActiveId(existing.id);
      applyLayout(viewTypeId);
      setAddViewOpen(false);
      return;
    }
    const label = VIEW_TYPE_LABELS[viewTypeId];
    const id = `${viewTypeId}-${Date.now()}`;
    const next: TViewTab = { id, label, viewType: viewTypeId };
    setTabs((prev) => [...prev, next]);
    setActiveId(id);
    applyLayout(viewTypeId);
    setAddViewOpen(false);
  };

  return (
    <div
      className="hidden md:block"
      style={{
        fontFamily: FONT,
        background: "#ffffff",
        borderBottom: `1px solid ${DIVIDER}`,
        height: 35,
        paddingLeft: 12,
        paddingRight: 12,
        boxSizing: "border-box",
      }}
      role="tablist"
      aria-label="Views"
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          height: "100%",
          gap: 0,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-haspopup={isActive ? "menu" : undefined}
              aria-expanded={isActive && optionsOpen && optionsTabId === tab.id ? true : undefined}
              data-prevent-outside-click
              onClick={() => handleSelectTab(tab)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: "100%",
                paddingLeft: 3,
                paddingRight: 8,
                marginLeft: index === 0 ? 0 : 2,
                border: "none",
                borderBottom: isActive ? `2px solid ${UNDERLINE}` : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
                color: isActive ? TEXT_ACTIVE : TEXT,
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                lineHeight: "15px",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxSizing: "border-box",
              }}
            >
              <ViewIcon viewType={tab.viewType} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <div
          aria-hidden
          style={{
            width: 1,
            height: 16,
            background: DIVIDER,
            marginLeft: 8,
            marginRight: 8,
            flexShrink: 0,
            alignSelf: "center",
          }}
        />

        <button
          ref={addViewRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={addViewOpen}
          onClick={() => {
            closeOptions();
            setAddViewOpen((v) => !v);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            height: "100%",
            paddingLeft: 5,
            paddingRight: 6,
            border: "none",
            borderBottom: "2px solid transparent",
            background: "transparent",
            cursor: "pointer",
            color: TEXT,
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 400,
            lineHeight: "15px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          <img
            src="/icons/views/plus.svg"
            alt=""
            width={16}
            height={16}
            style={{
              display: "block",
              transition: "transform 200ms ease",
              transform: addViewOpen ? "rotate(45deg)" : "rotate(0deg)",
            }}
          />
          <span>View</span>
        </button>
      </div>

      <AddViewMenu
        open={addViewOpen}
        onClose={() => setAddViewOpen(false)}
        onSelect={handleAddView}
        anchorRef={addViewRef}
      />

      <ViewOptionsMenu
        open={optionsOpen}
        onClose={closeOptions}
        anchorRef={optionsAnchorRef}
        viewLabel={optionsTab?.label}
      />
    </div>
  );
});
