/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useOutsideClickDetector } from "@plane/hooks";

/**
 * View-tab options popover — mock UI only (no persistence / API).
 */

const FONT = "Roboto, Helvetica, Arial, sans-serif";
const TEXT = "#292929";
const TEXT_MUTED = "#8d8d8d";
const HOVER = "rgba(0,0,0,0.045)";
const DIVIDER = "rgba(0,0,0,0.08)";
const TRACK_OFF = "#d4d4d4";
const TRACK_ON = "#202020";

const MENU_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const MENU_DURATION_MS = 160;
const MENU_WIDTH = 260;
const MENU_GAP = 6;

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  viewLabel?: string;
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      style={{
        display: "flex",
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#646464",
      }}
    >
      {children}
    </span>
  );
}

const Chevron = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M5.25 3.5 8.75 7l-3.5 3.5"
      stroke="#9a9a9a"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ICONS = {
  pencil: <img src="/icons/views/rename.svg" alt="" width={16} height={16} style={{ display: "block" }} />,
  link: <img src="/icons/views/copy-link.svg" alt="" width={16} height={16} style={{ display: "block" }} />,
  gear: <img src="/icons/views/settings.svg" alt="" width={16} height={16} style={{ display: "block" }} />,
  pin: <img src="/icons/views/pin.svg" alt="" width={16} height={16} style={{ display: "block" }} />,
  lock: <img src="/icons/views/lock.svg" alt="" width={16} height={16} style={{ display: "block" }} />,
  shield: <img src="/icons/views/protect.svg" alt="" width={16} height={16} style={{ display: "block" }} />,
  save: <img src="/icons/views/autosave.svg" alt="" width={16} height={16} style={{ display: "block" }} />,
  home: <img src="/icons/views/default-view.svg" alt="" width={16} height={16} style={{ display: "block" }} />,
  duplicate: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="5.2" y="5.2" width="8" height="8" rx="1.4" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M10.8 5.2V3.8A1.3 1.3 0 0 0 9.5 2.5H3.8A1.3 1.3 0 0 0 2.5 3.8v5.7a1.3 1.3 0 0 0 1.3 1.3h1.4"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 5h9M6 5V3.6A.6.6 0 0 1 6.6 3h2.8a.6.6 0 0 1 .6.6V5M4.4 5l.6 8h5.9l.7-8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function computePosition(anchor: DOMRect): { top: number; left: number } {
  const top = anchor.bottom + MENU_GAP;
  let left = anchor.left;
  const maxLeft = window.innerWidth - MENU_WIDTH - 8;
  if (left > maxLeft) left = Math.max(8, maxLeft);
  if (left < 8) left = 8;
  return { top, left };
}

function MenuRow(props: { icon: ReactNode; label: string; chevron?: boolean; muted?: boolean; onClick?: () => void }) {
  const { icon, label, chevron, muted, onClick } = props;
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        height: 34,
        padding: "0 10px",
        border: "none",
        borderRadius: 6,
        background: hovered ? HOVER : "transparent",
        cursor: "pointer",
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 400,
        color: muted ? TEXT_MUTED : TEXT,
        textAlign: "left",
        boxSizing: "border-box",
      }}
    >
      <Icon>{icon}</Icon>
      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {chevron ? <span style={{ display: "flex", flexShrink: 0 }}>{Chevron}</span> : null}
    </button>
  );
}

function ToggleRow(props: { icon: ReactNode; label: string; checked: boolean; onChange: (next: boolean) => void }) {
  const { icon, label, checked, onChange } = props;
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        height: 34,
        padding: "0 10px",
        border: "none",
        borderRadius: 6,
        background: hovered ? HOVER : "transparent",
        cursor: "pointer",
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 400,
        color: TEXT,
        textAlign: "left",
        boxSizing: "border-box",
      }}
    >
      <Icon>{icon}</Icon>
      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span
        aria-hidden
        style={{
          position: "relative",
          width: 30,
          height: 18,
          borderRadius: 999,
          background: checked ? TRACK_ON : TRACK_OFF,
          flexShrink: 0,
          transition: "background 140ms ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 14 : 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            transition: "left 140ms ease",
          }}
        />
      </span>
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: DIVIDER, margin: "4px 8px" }} />;
}

export function ViewOptionsMenu({ open, onClose, anchorRef, viewLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [toggles, setToggles] = useState({
    pin: false,
    private: false,
    protect: false,
    autosave: true,
    defaultView: false,
  });

  useOutsideClickDetector(ref, onClose, false, open);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    setPos(computePosition(anchorRef.current.getBoundingClientRect()));
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const t = window.setTimeout(() => setMounted(false), MENU_DURATION_MS);
      return () => window.clearTimeout(t);
    }
    setMounted(true);
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
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

  const setToggle = (key: keyof typeof toggles) => (next: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: next }));
  };

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label={viewLabel ? `${viewLabel} view options` : "View options"}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: MENU_WIDTH,
        zIndex: 60,
        fontFamily: FONT,
        background: "#fff",
        borderRadius: 10,
        border: `1px solid ${DIVIDER}`,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -4px rgba(0,0,0,0.12)",
        padding: 6,
        boxSizing: "border-box",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(-4px) scale(0.98)",
        transition: `opacity ${MENU_DURATION_MS}ms ${MENU_EASE}, transform ${MENU_DURATION_MS}ms ${MENU_EASE}`,
        transformOrigin: "top left",
      }}
    >
      <MenuRow icon={ICONS.pencil} label="Rename" />
      <MenuRow icon={ICONS.link} label="Copy link to view" />
      <MenuRow icon={ICONS.gear} label="Customize view" />

      <Divider />

      <ToggleRow icon={ICONS.pin} label="Pin view" checked={toggles.pin} onChange={setToggle("pin")} />
      <ToggleRow icon={ICONS.lock} label="Private view" checked={toggles.private} onChange={setToggle("private")} />
      <ToggleRow icon={ICONS.shield} label="Protect view" checked={toggles.protect} onChange={setToggle("protect")} />
      <ToggleRow
        icon={ICONS.save}
        label="Autosave for me"
        checked={toggles.autosave}
        onChange={setToggle("autosave")}
      />
      <ToggleRow
        icon={ICONS.home}
        label="Set as default view"
        checked={toggles.defaultView}
        onChange={setToggle("defaultView")}
      />

      <Divider />

      <MenuRow icon={ICONS.duplicate} label="Duplicate view" chevron />
      <MenuRow icon={ICONS.trash} label="Delete view" muted />
    </div>,
    document.body
  );
}
