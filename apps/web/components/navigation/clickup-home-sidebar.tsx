/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  CyclesOutline,
  IntakeOutline,
  ModuleOutline,
  PagesOutline,
  ViewsOutline,
  WorkItemsOutline,
} from "@makeplane/propel/icons";
import { useClickUpHomeSidebar } from "@/components/navigation/clickup-home-sidebar-context";
import { SpaceCreateMenu } from "@/components/navigation/clickup-space-create-menu";
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useProject } from "@/hooks/store/use-project";
import { useWorkspace } from "@/hooks/store/use-workspace";

/**
 * ClickUp Home sidebar mock (Figma 8005:995).
 * Header hover reveals Search / Filter / Collapse.
 * New → task; Inbox → notifications.
 * Space → Plane projects (lists); each project accordion → Tasks / Sprints / …
 */

const FONT = "Roboto, Helvetica, Arial, sans-serif";
const BG = "#f9f9f9";
const TEXT = "#646464";
const TEXT_DARK = "#202020";
const TEXT_MUTED = "#8d8d8d";
const TEXT_FAINT = "#838383";
const DIVIDER = "#e8e8e8";

function Icon({ src, size = 16 }: { src: string; size?: number }) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ display: "block", width: size, height: size, flexShrink: 0 }}
    />
  );
}

function HeaderIconButton({
  src,
  label,
  size = 16,
  onClick,
  title,
}: {
  src: string;
  label: string;
  size?: number;
  onClick?: () => void;
  title?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        padding: 0,
        border: "none",
        borderRadius: 7,
        background: hovered ? "rgba(0,0,0,0.06)" : "transparent",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 120ms ease",
      }}
    >
      <Icon src={src} size={size} />
    </button>
  );
}

/** Create menu trigger — "+" + chevron, always visible on the Home header. */
function CreateMenuButton() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      aria-label="Create"
      aria-haspopup="menu"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        width: 44,
        height: 28,
        padding: 0,
        border: "none",
        borderRadius: 7,
        background: pressed ? "#f0f0f0" : hovered ? "#fafafa" : "#ffffff",
        boxShadow: hovered
          ? "0px 0px 1px 0px rgba(0,0,0,0.5), 0px 2px 4px 0px rgba(0,0,0,0.18), 0px 1px 2px -1px rgba(0,0,0,0.15)"
          : "0px 0px 1px 0px rgba(0,0,0,0.45), 0px 1px 3px 0px rgba(0,0,0,0.15), 0px 1px 2px -1px rgba(0,0,0,0.15)",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 120ms ease, box-shadow 120ms ease",
      }}
    >
      <Icon src="/clickup-home/create-plus.svg" />
      <Icon src="/clickup-home/create-chevron.svg" size={14} />
    </button>
  );
}

function ListIcon({ color = TEXT_FAINT }: { color?: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: "block",
        width: 16,
        height: 16,
        flexShrink: 0,
        backgroundColor: color,
        WebkitMask: "url(/clickup-home/list.svg) center / contain no-repeat",
        mask: "url(/clickup-home/list.svg) center / contain no-repeat",
      }}
    />
  );
}

function Row(props: {
  icon?: React.ReactNode;
  label: string;
  labelColor?: string;
  suffix?: string;
  count?: string | number;
  active?: boolean;
  /** 0 = root, 1 = under Space, 2 = under project */
  indentLevel?: 0 | 1 | 2;
  /** @deprecated use indentLevel */
  indent?: boolean;
  showRail?: boolean;
  trailing?: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const {
    icon,
    label,
    labelColor = TEXT,
    suffix,
    count,
    active = false,
    indent = false,
    indentLevel: indentLevelProp,
    showRail = false,
    trailing,
    onClick,
    onMouseEnter,
    onMouseLeave,
  } = props;
  const indentLevel = indentLevelProp ?? (indent ? 1 : 0);
  const [hovered, setHovered] = useState(false);

  // Figma / ClickUp: hover = rgba(0,0,0,0.06) pill, radius 7px
  const highlighted = active || hovered;
  const padLeft = indentLevel === 0 ? 0 : indentLevel === 1 ? 20 : 40;
  const railLeft = indentLevel === 2 ? 35.5 : 15.5;

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: 28,
    marginLeft: indentLevel === 0 ? 8 : 0,
    marginRight: 8,
    paddingLeft: indentLevel === 0 ? 8 : 6,
    paddingRight: trailing ? 4 : 8,
    borderRadius: 7,
    background: highlighted ? "rgba(0,0,0,0.06)" : "transparent",
    gap: 10,
    boxSizing: "border-box",
    width: indentLevel === 0 ? "calc(100% - 16px)" : "calc(100% - 8px)",
    border: "none",
    font: "inherit",
    textAlign: "left",
    cursor: onClick ? "pointer" : "default",
    transition: "background 80ms ease",
  };

  const content = (
    <>
      {icon}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 400,
          lineHeight: "16px",
          letterSpacing: "-0.154px",
          color: highlighted ? TEXT_DARK : labelColor,
        }}
      >
        {label}
        {suffix ? <span style={{ color: TEXT_MUTED, fontSize: 12, letterSpacing: 0 }}>{suffix}</span> : null}
      </span>
      {count != null ? (
        <span
          style={{
            fontFamily: FONT,
            fontSize: 12,
            lineHeight: "12px",
            color: highlighted ? TEXT_DARK : TEXT_FAINT,
            flexShrink: 0,
          }}
        >
          {count}
        </span>
      ) : null}
      {trailing}
    </>
  );

  return (
    <div style={{ position: "relative", paddingLeft: padLeft }}>
      {showRail && indentLevel >= 1 && (
        <div
          style={{
            position: "absolute",
            left: 15.5,
            top: -2,
            width: 1,
            height: 32,
            background: DIVIDER,
          }}
        />
      )}
      {showRail && indentLevel === 2 && (
        <div
          style={{
            position: "absolute",
            left: railLeft,
            top: -2,
            width: 1,
            height: 32,
            background: DIVIDER,
          }}
        />
      )}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => {
          setHovered(true);
          onMouseEnter?.();
        }}
        onMouseLeave={() => {
          setHovered(false);
          onMouseLeave?.();
        }}
        style={rowStyle}
        aria-label={label}
      >
        {content}
      </button>
    </div>
  );
}

type ProjectNavItem = {
  key: string;
  name: string;
  href: string;
  icon: React.ElementType;
  shouldRender: boolean;
};

function NavGlyph({ icon: IconCmp, active }: { icon: React.ElementType; active?: boolean }) {
  return (
    <span
      style={{
        display: "flex",
        width: 16,
        height: 16,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: active ? TEXT_DARK : TEXT_FAINT,
      }}
    >
      <IconCmp className="size-4" />
    </span>
  );
}

/** Plane project as a ClickUp List — accordion to Tasks / Sprints / … */
const SpaceProjectItem = observer(function SpaceProjectItem({
  projectId,
  workspaceSlug,
  index,
}: {
  projectId: string;
  workspaceSlug: string;
  index: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { getPartialProjectById, getProjectAnalyticsCountById } = useProject();
  const project = getPartialProjectById(projectId);
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const navItems = useMemo((): ProjectNavItem[] => {
    if (!project) return [];
    return [
      {
        key: "work_items",
        name: "Tasks",
        href: `/${workspaceSlug}/projects/${projectId}/issues`,
        icon: WorkItemsOutline,
        shouldRender: true,
      },
      {
        key: "cycles",
        name: "Sprints",
        href: `/${workspaceSlug}/projects/${projectId}/cycles`,
        icon: CyclesOutline,
        shouldRender: project.cycle_view ?? false,
      },
      {
        key: "modules",
        name: "Epics",
        href: `/${workspaceSlug}/projects/${projectId}/modules`,
        icon: ModuleOutline,
        shouldRender: project.module_view ?? false,
      },
      {
        key: "views",
        name: "Views",
        href: `/${workspaceSlug}/projects/${projectId}/views`,
        icon: ViewsOutline,
        shouldRender: project.issue_views_view ?? false,
      },
      {
        key: "pages",
        name: "Docs",
        href: `/${workspaceSlug}/projects/${projectId}/pages`,
        icon: PagesOutline,
        shouldRender: project.page_view ?? false,
      },
      {
        key: "intake",
        name: "Intake",
        href: `/${workspaceSlug}/projects/${projectId}/intake`,
        icon: IntakeOutline,
        shouldRender: project.inbox_view ?? false,
      },
    ].filter((item) => item.shouldRender);
  }, [project, workspaceSlug, projectId]);

  useEffect(() => {
    if (pathname.includes(`/projects/${projectId}`)) setIsOpen(true);
  }, [pathname, projectId]);

  if (!project) return null;

  const onProjectPath = pathname.includes(`/projects/${projectId}`);
  const onNavChild = navItems.some((item) => pathname.includes(item.href));
  const isActive = onProjectPath && !onNavChild;
  const count = getProjectAnalyticsCountById(projectId)?.total_issues;
  const iconColor = isActive || isOpen ? TEXT_DARK : LIST_ICON_COLORS[index % LIST_ICON_COLORS.length];

  return (
    <div>
      <Row
        indentLevel={1}
        showRail
        active={isActive}
        icon={
          hovered ? (
            <span
              aria-hidden
              style={{
                display: "flex",
                width: 16,
                height: 16,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transform: isOpen ? "none" : "rotate(-90deg)",
                transition: "transform 140ms ease",
              }}
            >
              <Icon src="/clickup-home/chevron.svg" size={14} />
            </span>
          ) : (
            <ListIcon color={iconColor} />
          )
        }
        label={project.name}
        count={count}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setIsOpen((open) => !open)}
      />
      {isOpen
        ? navItems.map((item) => {
            const active = pathname.includes(item.href);
            return (
              <Row
                key={item.key}
                indentLevel={2}
                showRail
                active={active}
                icon={<NavGlyph icon={item.icon} active={active} />}
                label={item.name}
                onClick={() => router.push(`${item.href}/`)}
              />
            );
          })
        : null}
    </div>
  );
});

function SectionLabel({
  label,
  action,
  onActionClick,
}: {
  label: string;
  action?: React.ReactNode;
  onActionClick?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 24,
        margin: "0 8px",
        paddingLeft: 5,
        paddingRight: 4,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 500,
          lineHeight: "16px",
          color: TEXT,
          flex: 1,
        }}
      >
        {label}
      </span>
      {action ? (
        onActionClick ? (
          <button
            type="button"
            aria-label={`Add ${label}`}
            onClick={onActionClick}
            style={{
              display: "flex",
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {action}
          </button>
        ) : (
          action
        )
      ) : null}
    </div>
  );
}

const LIST_ICON_COLORS = ["#838383", "#29C56A", "#3E8BFF", "#F5A623", "#E06C75", "#C678DD"];

/** ClickUp-style Space parent; nested rows are Plane projects (lists). */
const SpaceTree = observer(function SpaceTree({ workspaceSlug }: { workspaceSlug: string }) {
  const pathname = usePathname();
  const { toggleCreateProjectModal } = useCommandPalette();
  const { joinedProjectIds, fetchProjectAnalyticsCount } = useProject();
  const [isOpen, setIsOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!workspaceSlug) return;
    void fetchProjectAnalyticsCount(workspaceSlug, { fields: "total_issues" });
  }, [workspaceSlug, fetchProjectAnalyticsCount]);

  // Keep accordion open when navigating into a nested project
  useEffect(() => {
    if (joinedProjectIds.some((id) => pathname.includes(`/projects/${id}`))) {
      setIsOpen(true);
    }
  }, [pathname, joinedProjectIds]);

  const handleCreateSelect = (id: string) => {
    setCreateMenuOpen(false);
    // List = Plane project (Space nested lists map to projects)
    if (id === "list") toggleCreateProjectModal(true);
  };

  return (
    <div>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row
            icon={
              hovered || createMenuOpen ? (
                <span
                  aria-hidden
                  style={{
                    display: "flex",
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: "rgba(0,0,0,0.06)",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transform: isOpen ? "none" : "rotate(-90deg)",
                    transition: "transform 140ms ease",
                  }}
                >
                  <Icon src="/clickup-home/chevron.svg" size={14} />
                </span>
              ) : (
                <span
                  style={{
                    display: "flex",
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: "#6049e7",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  S
                </span>
              )
            }
            label="Space"
            onClick={() => setIsOpen((open) => !open)}
            trailing={<span style={{ width: 20, height: 20, flexShrink: 0 }} aria-hidden />}
          />
        </div>
        <button
          ref={createButtonRef}
          type="button"
          data-prevent-outside-click
          aria-label="Create in Space"
          aria-haspopup="menu"
          aria-expanded={createMenuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setCreateMenuOpen((open) => !open);
          }}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: createMenuOpen ? "translateY(-50%) rotate(45deg)" : "translateY(-50%) rotate(0deg)",
            display: "flex",
            width: 20,
            height: 20,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            background: createMenuOpen ? "rgba(0,0,0,0.06)" : "transparent",
            padding: 0,
            cursor: "pointer",
            zIndex: 1,
            transition: "background 160ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <Icon src="/clickup-home/plus-sm.svg" />
        </button>
        <SpaceCreateMenu
          open={createMenuOpen}
          anchorRef={createButtonRef}
          onClose={() => setCreateMenuOpen(false)}
          onSelect={handleCreateSelect}
        />
      </div>

      {isOpen
        ? joinedProjectIds.map((projectId, index) => (
            <SpaceProjectItem key={projectId} projectId={projectId} workspaceSlug={workspaceSlug} index={index} />
          ))
        : null}
    </div>
  );
});

export const ClickUpHomeSidebar = observer(function ClickUpHomeSidebar() {
  const [headerHovered, setHeaderHovered] = useState(false);
  const { setCollapsed } = useClickUpHomeSidebar();
  const { toggleCreateIssueModal, toggleCreateProjectModal } = useCommandPalette();
  const { workspaceSlug } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const slug = workspaceSlug?.toString() ?? "";
  const { currentWorkspace } = useWorkspace();
  const workspaceName = currentWorkspace?.name ?? slug;

  return (
    <aside
      aria-label="ClickUp Home (mock)"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        // Figma cu-nav-sidebar-container: 256px (255 content + divider strip)
        width: 256,
        minWidth: 256,
        maxWidth: 256,
        height: "100%",
        background: BG,
        fontFamily: FONT,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Right edge separator vs Plane content */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 1,
          height: "100%",
          background: DIVIDER,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      {/* Header — hover reveals Search / Filter / Collapse like ClickUp */}
      <div
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 40,
          padding: "0 8px 0 12px",
          flexShrink: 0,
          background: BG,
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            lineHeight: "20px",
            letterSpacing: "-0.32px",
            color: TEXT_DARK,
            flexShrink: 0,
          }}
        >
          Home
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginLeft: "auto",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              maxWidth: headerHovered ? 92 : 0,
              opacity: headerHovered ? 1 : 0,
              transform: headerHovered ? "translateX(0)" : "translateX(10px)",
              transition:
                "max-width 220ms cubic-bezier(0.32, 0.72, 0, 1), opacity 180ms cubic-bezier(0.32, 0.72, 0, 1), transform 220ms cubic-bezier(0.32, 0.72, 0, 1)",
              pointerEvents: headerHovered ? "auto" : "none",
            }}
          >
            <HeaderIconButton src="/clickup-home/search.svg" label="Search" />
            <HeaderIconButton src="/clickup-home/filter.svg" label="Filter" />
            <HeaderIconButton
              src="/clickup-home/collapse.svg"
              label="Collapse sidebar"
              title="Close sidebar ⌘\\"
              onClick={() => setCollapsed(true)}
            />
          </div>
          <CreateMenuButton />
        </div>
      </div>

      {/* Scrollable tree */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingTop: 8, paddingBottom: 20 }}>
        <Row icon={<Icon src="/clickup-home/new.svg" />} label="New" onClick={() => toggleCreateIssueModal(true)} />
        <Row
          icon={<Icon src="/clickup-home/inbox.svg" />}
          label="Inbox"
          onClick={() => {
            if (slug) router.push(`/${slug}/notifications/`);
          }}
        />
        <Row icon={<Icon src="/clickup-home/assigned-comments.svg" />} label="Assigned Comments" />
        <Row icon={<Icon src="/clickup-home/meetings.svg" />} label="Meetings" />
        <Row icon={<Icon src="/clickup-home/my-tasks.svg" />} label="My Tasks" />

        <Row
          indent
          showRail
          icon={
            <span
              style={{
                display: "flex",
                width: 16,
                height: 16,
                borderRadius: 999,
                background: TEXT_DARK,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.15px",
                flexShrink: 0,
              }}
            >
              N
            </span>
          }
          label="Assigned to me"
        />
        <Row indent showRail icon={<Icon src="/clickup-home/today-overdue.svg" />} label="Today & Overdue" />
        <Row indent showRail icon={<Icon src="/clickup-home/personal-list.svg" />} label="Personal List" />

        <Row icon={<Icon src="/clickup-home/more.svg" />} label="More" />

        <div style={{ height: 1, background: DIVIDER, margin: "12px 12px 8px" }} />

        <SectionLabel
          label="Spaces"
          onActionClick={() => toggleCreateProjectModal(true)}
          action={
            <span
              style={{
                display: "flex",
                width: 20,
                height: 20,
                borderRadius: 5,
                background: "rgba(0,0,0,0.06)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon src="/clickup-home/plus-sm.svg" />
            </span>
          }
        />

        <Row
          icon={
            <span
              style={{
                display: "flex",
                width: 20,
                height: 20,
                borderRadius: 5,
                background: "#fff",
                border: `1px solid ${DIVIDER}`,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src="/clickup-home/all-tasks.svg"
                alt=""
                width={14}
                height={20}
                style={{ display: "block", width: 14, height: 20 }}
              />
            </span>
          }
          label="All Tasks"
          suffix={workspaceName ? ` - ${workspaceName}` : undefined}
          active={pathname.includes("/workspace-views/all-issues")}
          onClick={() => {
            if (slug) router.push(`/${slug}/workspace-views/all-issues/`);
          }}
        />

        {slug ? <SpaceTree workspaceSlug={slug} /> : null}

        <Row icon={<Icon src="/clickup-home/more-muted.svg" />} label="More" labelColor={TEXT_FAINT} />
        <Row
          icon={<Icon src="/clickup-home/plus.svg" />}
          label="New Space"
          labelColor={TEXT_MUTED}
          onClick={() => toggleCreateProjectModal(true)}
        />
      </div>
    </aside>
  );
});
