/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";
import { PlaneLogo } from "./plane-logo";

export type PlaneLockupProps = React.ComponentPropsWithoutRef<"span"> & {
  width?: string | number;
  height?: string | number;
  color?: string;
};

/** Product lockup: mark + “Ergonic” wordmark (replaces former Plane wordmark SVG). */
export function PlaneLockup({
  height = 20,
  className,
  color = "currentColor",
  style,
  width: _width,
  ...rest
}: PlaneLockupProps) {
  const h = typeof height === "string" ? Number.parseFloat(height) || 20 : height;
  const logoWidth = Math.round((h * 85) / 52);

  return (
    <span
      className={className}
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.max(6, Math.round(h * 0.35)),
        color,
        height: h,
        lineHeight: 1,
        ...style,
      }}
    >
      <PlaneLogo height={h} width={logoWidth} color={color} className="shrink-0" style={{ display: "block" }} />
      <span
        style={{
          fontSize: Math.round(h * 0.9),
          fontWeight: 700,
          letterSpacing: "-0.03em",
          whiteSpace: "nowrap",
          color: "inherit",
        }}
      >
        Ergonic
      </span>
    </span>
  );
}
