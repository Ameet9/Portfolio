import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Context ---
interface AccordionContextType {
  activeIndex: number | null;
  toggleIndex: (index: number) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider');
  }
  return context;
};

// --- Components ---
interface AccordionProps {
  children: ReactNode;
  defaultActiveIndex?: number | null;
}

export const Accordion: React.FC<AccordionProps> = ({ children, defaultActiveIndex = null }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultActiveIndex);

  const toggleIndex = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <AccordionContext.Provider value={{ activeIndex, toggleIndex }}>
      <div className="accordion" style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { index } as any);
          }
          return child;
        })}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  children: ReactNode;
  index?: number;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ children, index }) => {
  return (
    <div className="accordion-item" style={{ borderBottom: '1px solid #ccc' }}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { index } as any);
        }
        return child;
      })}
    </div>
  );
};

export const AccordionHeader: React.FC<{ children: ReactNode; index?: number }> = ({ children, index }) => {
  const { activeIndex, toggleIndex } = useAccordion();
  const isActive = activeIndex === index;

  return (
    <button
      onClick={() => index !== undefined && toggleIndex(index)}
      aria-expanded={isActive}
      style={{
        width: '100%',
        padding: '10px',
        textAlign: 'left',
        background: '#f9f9f9',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      {children}
    </button>
  );
};

export const AccordionPanel: React.FC<{ children: ReactNode; index?: number }> = ({ children, index }) => {
  const { activeIndex } = useAccordion();
  const isActive = activeIndex === index;

  if (!isActive) return null;

  return (
    <div style={{ padding: '10px' }}>
      {children}
    </div>
  );
};
