"use client";

import React from "react";
import { useTabManager, type TabItem } from "../../hooks/use-tab-manager";
import "./TabBar.scss";

interface TabBarProps {
  className?: string;
  showTabBar?: boolean;
}

export function TabBar({ className = "", showTabBar = true }: TabBarProps) {
  const { tabs, activeTabId, switchToTab, removeTab, hasMultipleTabs } = useTabManager();

  if (!showTabBar || !hasMultipleTabs) {
    return null;
  }

  return (
    <div className={`tab-bar ${className}`}>
      <div className="tab-bar-content">
        {tabs.map((tab) => (
          <TabBarItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => switchToTab(tab.id)}
            onClose={() => removeTab(tab.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface TabBarItemProps {
  tab: TabItem;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

function TabBarItem({ tab, isActive, onSelect, onClose }: TabBarItemProps) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const getTabIcon = () => {
    switch (tab.type) {
      case "document":
        return "📄";
      case "folder":
        return "📁";
      case "workspace":
        return "🏠";
      default:
        return "📄";
    }
  };

  const truncateTitle = (title: string, maxLength: number = 25) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + "...";
  };

  return (
    <div
      className={`tab-bar-item ${isActive ? "active" : ""}`}
      onClick={onSelect}
      title={tab.title}
    >
      <span className="tab-icon">{getTabIcon()}</span>
      <span className="tab-title">{truncateTitle(tab.title)}</span>
      <button
        type="button"
        className="tab-close"
        onClick={handleClose}
        title="Close tab"
        aria-label={`Close ${tab.title} tab`}
      >
        ×
      </button>
    </div>
  );
}

/**
 * Compact tab bar for smaller screens or focused mode
 */
export function CompactTabBar({ className = "" }: { className?: string }) {
  const { tabs, activeTab, switchToTab } = useTabManager();

  if (tabs.length <= 1) {
    return null;
  }

  return (
    <div className={`compact-tab-bar ${className}`}>
      <select
        value={activeTab?.id || ""}
        onChange={(e) => switchToTab(e.target.value)}
        className="tab-selector"
      >
        {tabs.map((tab) => (
          <option key={tab.id} value={tab.id}>
            {tab.title}
          </option>
        ))}
      </select>
      <span className="tab-count">{tabs.length} tabs</span>
    </div>
  );
}