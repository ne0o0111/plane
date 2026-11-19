/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams, useRouter } from "next/navigation";
import { useCommandPalette } from "@/hooks/store/use-command-palette";

/**
 * ClickUp Home sidebar mock (Figma 8005:995).
 * Header hover reveals Search / Filter / Collapse.
 * "New" → New work item; "Inbox" → notifications.
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

function HeaderIconButton({ src, label, size = 16 }: { src: string; label: string; size?: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
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

function Row(props: {
  icon?: React.ReactNode;
  label: string;
  labelColor?: string;
  suffix?: string;
  count?: string | number;
  active?: boolean;
  indent?: boolean;
  showRail?: boolean;
  onClick?: () => void;
}) {
  const {
    icon,
    label,
    labelColor = TEXT,
    suffix,
    count,
    active = false,
    indent = false,
    showRail = false,
    onClick,
  } = props;
  const [hovered, setHovered] = useState(false);

  // Figma / ClickUp: hover = rgba(0,0,0,0.06) pill, radius 7px
  const highlighted = active || hovered;

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: 28,
    marginLeft: indent ? 0 : 8,
    marginRight: 8,
    paddingLeft: indent ? 6 : 8,
    paddingRight: 8,
    borderRadius: 7,
    background: highlighted ? "rgba(0,0,0,0.06)" : "transparent",
    gap: 10,
    boxSizing: "border-box",
    width: indent ? "calc(100% - 8px)" : "calc(100% - 16px)",
    border: "none",
    font: "inherit",
    textAlign: "left",
    cursor: "pointer",
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
    </>
  );

  return (
    <div style={{ position: "relative", paddingLeft: indent ? 20 : 0, marginLeft: indent ? 0 : 0 }}>
      {showRail && (
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
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={rowStyle}
        aria-label={label}
      >
        {content}
      </button>
    </div>
  );
}

function SectionLabel({ label, action }: { label: string; action?: React.ReactNode }) {
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
      {action}
    </div>
  );
}

export const ClickUpHomeSidebar = observer(function ClickUpHomeSidebar() {
  const [headerHovered, setHeaderHovered] = useState(false);
  const { toggleCreateIssueModal } = useCommandPalette();
  const { workspaceSlug } = useParams();
  const router = useRouter();
  const slug = workspaceSlug?.toString() ?? "";

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
              transform: headerHovered ? "translateX(0)" : "translateX(8px)",
              transition: "max-width 180ms ease, opacity 160ms ease, transform 180ms ease",
              pointerEvents: headerHovered ? "auto" : "none",
            }}
          >
            <HeaderIconButton src="/clickup-home/search.svg" label="Search" />
            <HeaderIconButton src="/clickup-home/filter.svg" label="Filter" />
            <HeaderIconButton src="/clickup-home/collapse.svg" label="Collapse sidebar" />
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
          suffix=" - School Health"
        />

        <Row
          icon={
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
          }
          label="Space"
        />

        <Row indent showRail icon={<Icon src="/clickup-home/list.svg" />} label="SCRUM Sprint Planning" count={3} />
        <Row indent showRail active icon={<Icon src="/clickup-home/checklist.svg" />} label="Bug Tracking" count={9} />

        <Row icon={<Icon src="/clickup-home/more-muted.svg" />} label="More" labelColor={TEXT_FAINT} />
        <Row icon={<Icon src="/clickup-home/plus.svg" />} label="New Space" labelColor={TEXT_MUTED} />
      </div>
    </aside>
  );
});
