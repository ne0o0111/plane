/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "home_sidebar_collapsed";

type THomeSidebarContext = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
};

const HomeSidebarContext = createContext<THomeSidebarContext | undefined>(undefined);

export function HomeSidebarProvider({ children }: { children: React.ReactNode }) {
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

  return <HomeSidebarContext.Provider value={value}>{children}</HomeSidebarContext.Provider>;
}

export function useHomeSidebar() {
  const ctx = useContext(HomeSidebarContext);
  if (!ctx) {
    throw new Error("useHomeSidebar must be used within HomeSidebarProvider");
  }
  return ctx;
}
