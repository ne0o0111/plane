/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOutsideClickDetector } from "@plane/hooks";

const FONT = "Roboto, Helvetica, Arial, sans-serif";
const TEXT = "#646464";
const TEXT_DARK = "#202020";
const TEXT_MUTED = "#8d8d8d";
const DIVIDER = "#e8e8e8";

type MenuItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  chevron?: boolean;
};

function MenuIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      style={{
        display: "flex",
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

const IconList = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.2 4.2 4.4 5.4 6.6 2.8M3.2 11.2 4.4 12.4 6.6 9.8M8.5 4.5h5M8.5 11.5h5"
        stroke="#838383"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </MenuIcon>
);

const IconFolder = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2.5 5.5V12a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1H8.2L7 4H3.5a1 1 0 0 0-1 1.5Z"
        stroke="#838383"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  </MenuIcon>
);

const IconSprintFolder = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2.5 5.5V12a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1H8.2L7 4H3.5a1 1 0 0 0-1 1.5Z"
        stroke="#838383"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 9.2a1.8 1.8 0 1 0-.1 1.6M9.2 8.2v1.2h1.2"
        stroke="#838383"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </MenuIcon>
);

const IconDoc = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3.5" y="2.5" width="9" height="11" rx="1.5" fill="#5B8DEF" />
      <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </MenuIcon>
);

const IconArtifact = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <defs>
        <linearGradient id="cu-artifact" x1="2" y1="3" x2="14" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5B8DEF" />
          <stop offset="1" stopColor="#F36B8A" />
        </linearGradient>
      </defs>
      <path
        d="M8 13.2c-.3 0-5.2-3.1-5.2-6.2A2.8 2.8 0 0 1 8 5.1a2.8 2.8 0 0 1 5.2 1.9c0 3.1-4.9 6.2-5.2 6.2Z"
        fill="url(#cu-artifact)"
      />
    </svg>
  </MenuIcon>
);

const IconDashboard = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="8" width="3" height="5.5" rx="0.7" fill="#8B6CF6" />
      <rect x="6.5" y="5" width="3" height="8.5" rx="0.7" fill="#8B6CF6" />
      <rect x="10.5" y="3" width="3" height="10.5" rx="0.7" fill="#8B6CF6" />
    </svg>
  </MenuIcon>
);

const IconWhiteboard = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 10.5c1.2-2.2 2.2-3.2 3.5-3.2S8.8 9 10 8.2 12.2 5 13.5 5"
        stroke="#F5C518"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M4.5 12.5h7" stroke="#F5C518" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  </MenuIcon>
);

const IconForm = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3.5" y="2.5" width="9" height="11" rx="1.5" fill="#7B6CF6" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11.2" cy="11.2" r="2.3" fill="#5B4FE0" />
      <path d="M10.4 11.2h1.6M11.2 10.4v1.6" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
    </svg>
  </MenuIcon>
);

const IconImports = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="#838383" strokeWidth="1.3" />
      <path
        d="M8 5v4.5M8 9.5 6.2 7.8M8 9.5l1.8-1.7"
        stroke="#838383"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </MenuIcon>
);

const IconTemplates = (
  <MenuIcon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M4.2 11.8 10.5 3.8l1.7 1.7-6.3 8H4.2v-1.7ZM10.5 3.8l1.2-1.2a1.2 1.2 0 0 1 1.7 1.7L12.2 5.5"
        stroke="#838383"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.8 8.2v4.3H8.5" stroke="#838383" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </MenuIcon>
);

const IconChevronRight = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M5.25 3.5 8.75 7l-3.5 3.5"
      stroke="#838383"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CREATE_ITEMS: MenuItem[] = [
  {
    id: "list",
    label: "List",
    description: "Track tasks, projects, people & more",
    icon: IconList,
  },
  {
    id: "folder",
    label: "Folder",
    description: "Group Lists, Docs & more",
    icon: IconFolder,
  },
  {
    id: "sprint-folder",
    label: "Sprint Folder",
    description: "Organize your Sprints",
    icon: IconSprintFolder,
  },
];

const ASSET_ITEMS: MenuItem[] = [
  { id: "doc", label: "Doc", icon: IconDoc },
  { id: "artifact", label: "Artifact", icon: IconArtifact },
  { id: "dashboard", label: "Dashboard", icon: IconDashboard },
  { id: "whiteboard", label: "Whiteboard", icon: IconWhiteboard },
  { id: "form", label: "Form", icon: IconForm },
];

const UTILITY_ITEMS: MenuItem[] = [
  { id: "imports", label: "Imports", icon: IconImports, chevron: true },
  { id: "templates", label: "Templates", icon: IconTemplates },
];

function MenuRow({ item, dense, onSelect }: { item: MenuItem; dense?: boolean; onSelect: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: dense ? "center" : "flex-start",
        gap: 12,
        width: "100%",
        padding: dense ? "8px 10px" : "8px 10px",
        border: "none",
        borderRadius: 8,
        background: hovered ? "rgba(0,0,0,0.04)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
        transition: "background 80ms ease",
      }}
    >
      <span style={{ marginTop: dense ? 0 : 1 }}>{item.icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: dense ? 400 : 600,
            lineHeight: "18px",
            color: TEXT_DARK,
            letterSpacing: "-0.1px",
          }}
        >
          {item.label}
        </span>
        {item.description ? (
          <span
            style={{
              display: "block",
              marginTop: 2,
              fontSize: 12,
              fontWeight: 400,
              lineHeight: "16px",
              color: TEXT_MUTED,
            }}
          >
            {item.description}
          </span>
        ) : null}
      </span>
      {item.chevron ? <span style={{ display: "flex", alignItems: "center" }}>{IconChevronRight}</span> : null}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: DIVIDER, margin: "6px 4px" }} />;
}

const MENU_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const MENU_DURATION_MS = 180;

type SpaceCreateMenuProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  /** Anchor element for fixed positioning (the Space + button). */
  anchorRef: React.RefObject<HTMLElement | null>;
};

export function SpaceCreateMenu({ open, onClose, onSelect, anchorRef }: SpaceCreateMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  // Keep mounted through exit so close can animate
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useOutsideClickDetector(ref, onClose, false, open);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - 296),
    });
  }, [open, anchorRef]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Next frame → play enter transition
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timer = window.setTimeout(() => {
      setMounted(false);
      setPos(null);
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
      role="menu"
      aria-label="Create"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 1000,
        width: 280,
        padding: 8,
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: visible
          ? "0px 0px 1px 0px rgba(0,0,0,0.35), 0px 8px 24px 0px rgba(0,0,0,0.12), 0px 2px 6px 0px rgba(0,0,0,0.08)"
          : "0px 0px 1px 0px rgba(0,0,0,0.2), 0px 2px 8px 0px rgba(0,0,0,0.06)",
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
          padding: "6px 10px 4px",
          fontSize: 12,
          fontWeight: 500,
          lineHeight: "16px",
          color: TEXT,
        }}
      >
        Create
      </div>

      {CREATE_ITEMS.map((item) => (
        <MenuRow key={item.id} item={item} onSelect={onSelect} />
      ))}

      <Divider />

      {ASSET_ITEMS.map((item) => (
        <MenuRow key={item.id} item={item} dense onSelect={onSelect} />
      ))}

      <Divider />

      {UTILITY_ITEMS.map((item) => (
        <MenuRow key={item.id} item={item} dense onSelect={onSelect} />
      ))}
    </div>,
    document.body
  );
}
