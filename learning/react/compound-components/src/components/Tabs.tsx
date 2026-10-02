import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Context ---
interface TabsContextType {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs provider');
  }
  return context;
};

// --- Components ---
interface TabsProps {
  children: ReactNode;
  defaultActiveTab?: number;
}

/**
 * Tabs wrapper component that holds the state for the active tab.
 */
export const Tabs: React.FC<TabsProps> = ({ children, defaultActiveTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="tab-list" role="tablist" style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          // Pass the index implicitly to each Tab
          return React.cloneElement(child, { index } as any);
        }
        return child;
      })}
    </div>
  );
};

export const Tab: React.FC<{ children: ReactNode; index?: number }> = ({ children, index }) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === index;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => index !== undefined && setActiveTab(index)}
      style={{
        padding: '10px 20px',
        cursor: 'pointer',
        border: 'none',
        background: isActive ? '#f0f0f0' : 'transparent',
        borderBottom: isActive ? '2px solid blue' : 'none',
      }}
    >
      {children}
    </button>
  );
};

export const TabPanels: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="tab-panels" style={{ padding: '20px' }}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          // Pass the index implicitly to each TabPanel
          return React.cloneElement(child, { index } as any);
        }
        return child;
      })}
    </div>
  );
};

export const TabPanel: React.FC<{ children: ReactNode; index?: number }> = ({ children, index }) => {
  const { activeTab } = useTabs();
  const isActive = activeTab === index;

  if (!isActive) return null;

  return (
    <div role="tabpanel">
      {children}
    </div>
  );
};
