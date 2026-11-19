/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import Link from "next/link";

export type TClickUpRailItemProps = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  isActive?: boolean;
  tracking?: "nav" | "utility";
};

/**
 * Figma cu-simple-bar-item — column stack (icon 32 + label 18 = 50),
 * parent gap 12 → 62px pitch between items.
 */
export function ClickUpRailItem(props: TClickUpRailItemProps) {
  const { label, icon, href, isActive = false, tracking = "nav" } = props;

  const content = (
    <>
      <span
        style={{
          position: "relative",
          display: "flex",
          width: 32,
          height: 32,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
        }}
      >
        {icon}
      </span>
      <span
        title={label}
        style={{
          display: "block",
          boxSizing: "border-box",
          width: 52,
          maxWidth: 52,
          height: 18,
          padding: "0 2px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "center",
          fontFamily: "Roboto, Helvetica, Arial, sans-serif",
          fontSize: 10,
          fontWeight: isActive ? 700 : 600,
          lineHeight: "16px",
          letterSpacing: tracking === "utility" ? "0.12px" : "-0.25px",
          color: "#ffffff",
        }}
      >
        {label}
      </span>
    </>
  );

  const style: React.CSSProperties = {
    display: "flex",
    width: 52,
    maxWidth: 52,
    minWidth: 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 0,
    padding: 0,
    margin: 0,
    border: "none",
    background: "transparent",
    textDecoration: "none",
    color: "#ffffff",
    opacity: isActive ? 1 : 0.8,
    cursor: href ? "pointer" : "default",
    overflow: "visible",
  };

  if (href) {
    return (
      <Link href={href} style={style} aria-current={isActive ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" style={style} aria-label={label}>
      {content}
    </button>
  );
}
