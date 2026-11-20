/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useOutsideClickDetector } from "@plane/hooks";

/** Figma cu3-icon exports — single copy in public/clickup-views/ (native 16×16) */
const VIEW_LIST_ICON = "/clickup-views/view-list.svg";
const VIEW_BOARD_ICON = "/clickup-views/view-board.svg";
const VIEW_CALENDAR_ICON = "/clickup-views/view-calendar.svg";
const VIEW_TABLE_ICON = "/clickup-views/view-table.svg";
const VIEW_TIMELINE_ICON = "/clickup-views/view-timeline.svg";
const VIEW_FORM_ICON = "/clickup-views/view-form.svg";
const VIEW_DOC_ICON = "/clickup-views/view-doc.svg";
const VIEW_WHITEBOARD_ICON = "/clickup-views/view-whiteboard.svg";
const VIEW_DASHBOARD_ICON = "/clickup-views/view-dashboard.svg";

/**
 * ClickUp “+ View” → Create a view picker.
 * Anchored under the + View control; title + 4-col icon grid.
 */

const FONT = "Roboto, Helvetica, Arial, sans-serif";
const TEXT_DARK = "#292929";
const TEXT_MUTED = "#7a7a7a";
const HOVER = "rgba(0,0,0,0.045)";
const ICON_PAD = "#f7f7f7";
const ICON_PAD_HOVER = "#efefef";
const BORDER = "rgba(0,0,0,0.08)";

const MENU_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const MENU_DURATION_MS = 180;
const MENU_WIDTH = 360;
const MENU_GAP = 6;
const TILE_STAGGER_MS = 28;

type TViewType = {
  id: string;
  label: string;
  iconSrc: string;
  iconSize?: number;
  /** Only List / Board / Calendar / Table / Timeline switch layouts for now */
  enabled?: boolean;
};

const VIEW_ICON_DISPLAY_SIZE = 24;

const VIEW_TYPES: TViewType[] = [
  { id: "list", label: "List", iconSrc: VIEW_LIST_ICON, iconSize: VIEW_ICON_DISPLAY_SIZE, enabled: true },
  { id: "board", label: "Board", iconSrc: VIEW_BOARD_ICON, iconSize: VIEW_ICON_DISPLAY_SIZE, enabled: true },
  { id: "calendar", label: "Calendar", iconSrc: VIEW_CALENDAR_ICON, iconSize: VIEW_ICON_DISPLAY_SIZE, enabled: true },
  { id: "table", label: "Table", iconSrc: VIEW_TABLE_ICON, iconSize: VIEW_ICON_DISPLAY_SIZE, enabled: true },
  { id: "timeline", label: "Timeline", iconSrc: VIEW_TIMELINE_ICON, iconSize: VIEW_ICON_DISPLAY_SIZE, enabled: true },
  { id: "form", label: "Form", iconSrc: VIEW_FORM_ICON, iconSize: VIEW_ICON_DISPLAY_SIZE, enabled: false },
  { id: "doc", label: "Doc", iconSrc: VIEW_DOC_ICON, iconSize: VIEW_ICON_DISPLAY_SIZE, enabled: false },
  {
    id: "whiteboard",
    label: "Whiteboard",
    iconSrc: VIEW_WHITEBOARD_ICON,
    iconSize: VIEW_ICON_DISPLAY_SIZE,
    enabled: false,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    iconSrc: VIEW_DASHBOARD_ICON,
    iconSize: VIEW_ICON_DISPLAY_SIZE,
    enabled: false,
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (viewTypeId: string) => void;
  anchorRef: RefObject<HTMLElement | null>;
};

function computePosition(anchor: DOMRect): { top: number; left: number } {
  const top = anchor.bottom + MENU_GAP;
  let left = anchor.left;
  const maxLeft = window.innerWidth - MENU_WIDTH - 8;
  if (left > maxLeft) left = Math.max(8, maxLeft);
  if (left < 8) left = 8;
  return { top, left };
}

export function ClickUpAddViewMenu({ open, onClose, onSelect, anchorRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useOutsideClickDetector(ref, onClose, false, open);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    setPos(computePosition(anchorRef.current.getBoundingClientRect()));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timer = window.setTimeout(() => {
      setMounted(false);
      setPos(null);
      setHoveredId(null);
    }, MENU_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !pos || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Create a view"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 1000,
        width: MENU_WIDTH,
        padding: "12px 10px 10px",
        borderRadius: 10,
        border: `1px solid ${BORDER}`,
        background: "#ffffff",
        boxShadow: visible
          ? "0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -4px rgba(0,0,0,0.12)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        fontFamily: FONT,
        transformOrigin: "top left",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.96)",
        transition: `opacity ${MENU_DURATION_MS}ms ${MENU_EASE}, transform ${MENU_DURATION_MS}ms ${MENU_EASE}, box-shadow ${MENU_DURATION_MS}ms ${MENU_EASE}`,
        pointerEvents: visible ? "auto" : "none",
        willChange: "opacity, transform",
      }}
    >
      <div
        style={{
          padding: "2px 6px 12px",
          fontSize: 13,
          fontWeight: 600,
          lineHeight: "18px",
          letterSpacing: "-0.01em",
          color: TEXT_DARK,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-4px)",
          transition: `opacity ${MENU_DURATION_MS}ms ${MENU_EASE}, transform ${MENU_DURATION_MS}ms ${MENU_EASE}`,
        }}
      >
        Create a view
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
        }}
      >
        {VIEW_TYPES.map((type, index) => {
          const enabled = type.enabled !== false;
          const hovered = enabled && hoveredId === type.id;
          return (
            <button
              key={type.id}
              type="button"
              disabled={!enabled}
              aria-disabled={!enabled}
              onClick={() => {
                if (!enabled) return;
                onSelect(type.id);
              }}
              onMouseEnter={() => enabled && setHoveredId(type.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "8px 4px 10px",
                border: "none",
                borderRadius: 8,
                background: hovered ? HOVER : "transparent",
                cursor: enabled ? "pointer" : "not-allowed",
                fontFamily: FONT,
                opacity: !visible ? 0 : enabled ? 1 : 0.38,
                transform: visible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.94)",
                transition: `background 100ms ease, opacity 200ms ${MENU_EASE} ${visible ? 40 + index * TILE_STAGGER_MS : 0}ms, transform 220ms ${MENU_EASE} ${visible ? 40 + index * TILE_STAGGER_MS : 0}ms`,
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  borderRadius: 10,
                  background: hovered ? ICON_PAD_HOVER : ICON_PAD,
                  transition: "background 100ms ease, transform 150ms ease",
                  transform: hovered ? "scale(1.06)" : "scale(1)",
                }}
              >
                <img
                  src={type.iconSrc}
                  alt=""
                  width={type.iconSize ?? 24}
                  height={type.iconSize ?? 24}
                  style={{ display: "block" }}
                />
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: "15px",
                  color: enabled ? TEXT_DARK : TEXT_MUTED,
                  textAlign: "center",
                }}
              >
                {type.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );
}
