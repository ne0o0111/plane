/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "clickup_home_sidebar_collapsed";

type TClickUpHomeSidebarContext = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
};

const ClickUpHomeSidebarContext = createContext<TClickUpHomeSidebarContext | undefined>(undefined);

export function ClickUpHomeSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsedState(true);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ collapsed: hydrated ? collapsed : false, setCollapsed, toggleCollapsed }),
    [collapsed, hydrated, setCollapsed, toggleCollapsed]
  );

  return <ClickUpHomeSidebarContext.Provider value={value}>{children}</ClickUpHomeSidebarContext.Provider>;
}

export function useClickUpHomeSidebar() {
  const ctx = useContext(ClickUpHomeSidebarContext);
  if (!ctx) {
    throw new Error("useClickUpHomeSidebar must be used within ClickUpHomeSidebarProvider");
  }
  return ctx;
}
