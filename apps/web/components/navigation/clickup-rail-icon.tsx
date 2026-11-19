/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { cn } from "@plane/utils";

type TClickUpRailIconProps = {
  src: string;
  alt: string;
  className?: string;
  withGlow?: boolean;
};

export function ClickUpRailIcon(props: TClickUpRailIconProps) {
  const { src, alt, className, withGlow = false } = props;

  if (withGlow) {
    return (
      <span className={cn("relative flex size-5 items-center justify-center", className)}>
        <img
          src="/clickup-rail/home-glow.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute size-9 max-w-none select-none"
        />
        <img src={src} alt={alt} className="relative size-5" />
      </span>
    );
  }

  return <img src={src} alt={alt} className={cn("size-5 opacity-90", className)} />;
}
