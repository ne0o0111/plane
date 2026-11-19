/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

type TClickUpRailIconProps = {
  src: string;
  alt: string;
  withGlow?: boolean;
  badge?: string;
};

/** 20×20 glyph centered in the parent 32×32 hit target. */
export function ClickUpRailIcon(props: TClickUpRailIconProps) {
  const { src, alt, withGlow = false, badge } = props;

  return (
    <span
      style={{
        position: "relative",
        display: "flex",
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {withGlow && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: -10,
            top: -10,
            width: 40,
            height: 40,
            pointerEvents: "none",
            // Soft circular aurora — matches Figma radial mask (white 30% → transparent 74%)
            WebkitMaskImage: "radial-gradient(circle at center, #fff 30%, transparent 74%)",
            maskImage: "radial-gradient(circle at center, #fff 30%, transparent 74%)",
          }}
        >
          <img
            src="/clickup-rail/home-glow.png"
            alt=""
            width={40}
            height={40}
            style={{ display: "block", width: 40, height: 40, maxWidth: "none" }}
          />
        </span>
      )}
      <img
        src={src}
        alt={alt}
        width={20}
        height={20}
        style={{ position: "relative", width: 20, height: 20, display: "block" }}
      />
      {badge ? (
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "calc(50% + 1.35px)",
            transform: "translate(-50%, -50%)",
            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            fontSize: 9,
            fontWeight: 800,
            lineHeight: "9px",
            letterSpacing: "-0.4px",
            color: "#fff",
            pointerEvents: "none",
          }}
        >
          {badge}
        </span>
      ) : null}
    </span>
  );
}
