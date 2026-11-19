/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import Link from "next/link";
import { cn } from "@plane/utils";

// ============================================================================
// TYPES
// ============================================================================

interface AppSidebarItemData {
  href?: string;
  label?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  showLabel?: boolean;
  tone?: "default" | "inverse";
}

interface AppSidebarItemProps {
  variant?: "link" | "button";
  item?: AppSidebarItemData;
}

interface AppSidebarItemLabelProps {
  highlight?: boolean;
  label?: string;
  tone?: "default" | "inverse";
}

interface AppSidebarItemIconProps {
  icon?: React.ReactNode;
  highlight?: boolean;
  tone?: "default" | "inverse";
}

interface AppSidebarLinkItemProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

interface AppSidebarButtonItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  base: "group flex flex-col gap-0.5 items-center justify-center text-tertiary",
  icon: "relative flex items-center justify-center gap-2 size-8 overflow-visible rounded-md text-tertiary",
  iconActive: "bg-layer-transparent-selected text-secondary !text-icon-primary",
  iconInactive: "group-hover:text-icon-secondary group-hover:bg-layer-transparent-hover !text-icon-tertiary",
  iconInverseActive: "bg-white/15 !text-white",
  iconInverseInactive: "group-hover:bg-white/10 !text-white/70 group-hover:!text-white",
  label: "text-[10px] font-semibold text-center leading-tight tracking-tight",
  labelActive: "text-secondary",
  labelInactive: "group-hover:text-secondary text-tertiary",
  labelInverseActive: "!text-white",
  labelInverseInactive: "!text-white/70 group-hover:!text-white",
} as const;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function AppSidebarItemLabel({ highlight = false, label, tone = "default" }: AppSidebarItemLabelProps) {
  if (!label) return null;
  const inverse = tone === "inverse";

  return (
    <span
      className={cn(styles.label, {
        [styles.labelActive]: highlight && !inverse,
        [styles.labelInactive]: !highlight && !inverse,
        [styles.labelInverseActive]: highlight && inverse,
        [styles.labelInverseInactive]: !highlight && inverse,
      })}
    >
      {label}
    </span>
  );
}

function AppSidebarItemIcon({ icon, highlight, tone = "default" }: AppSidebarItemIconProps) {
  if (!icon) return null;
  const inverse = tone === "inverse";

  return (
    <div
      className={cn(styles.icon, {
        [styles.iconActive]: highlight && !inverse,
        [styles.iconInactive]: !highlight && !inverse,
        [styles.iconInverseActive]: highlight && inverse,
        [styles.iconInverseInactive]: !highlight && inverse,
      })}
    >
      {icon}
    </div>
  );
}

function AppSidebarLinkItem({ href, children, className }: AppSidebarLinkItemProps) {
  if (!href) return null;

  return (
    <Link href={href} className={cn(styles.base, className)}>
      {children}
    </Link>
  );
}

function AppSidebarButtonItem({ children, onClick, disabled = false, className }: AppSidebarButtonItemProps) {
  return (
    <button
      className={cn(styles.base, !onClick && "cursor-default", className)}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export type AppSidebarItemComponent = React.FC<AppSidebarItemProps> & {
  Label: React.FC<AppSidebarItemLabelProps>;
  Icon: React.FC<AppSidebarItemIconProps>;
  Link: React.FC<AppSidebarLinkItemProps>;
  Button: React.FC<AppSidebarButtonItemProps>;
};

function AppSidebarItem({ variant = "link", item }: AppSidebarItemProps) {
  if (!item) return null;

  const { icon, isActive, label, href, onClick, disabled, showLabel = true, tone = "default" } = item;

  const commonItems = (
    <>
      <AppSidebarItemIcon icon={icon} highlight={isActive} tone={tone} />
      {showLabel && <AppSidebarItemLabel highlight={isActive} label={label} tone={tone} />}
    </>
  );

  if (variant === "link") {
    return <AppSidebarLinkItem href={href}>{commonItems}</AppSidebarLinkItem>;
  }

  return (
    <AppSidebarButtonItem onClick={onClick} disabled={disabled}>
      {commonItems}
    </AppSidebarButtonItem>
  );
}

// ============================================================================
// COMPOUND COMPONENT ASSIGNMENT
// ============================================================================

AppSidebarItem.Label = AppSidebarItemLabel;
AppSidebarItem.Icon = AppSidebarItemIcon;
AppSidebarItem.Link = AppSidebarLinkItem;
AppSidebarItem.Button = AppSidebarButtonItem;

export { AppSidebarItem };
export type { AppSidebarItemData, AppSidebarItemProps };
