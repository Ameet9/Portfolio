# React Compound Component Pattern

## Overview
This project demonstrates the **Compound Component Pattern** in React, showcasing how to build flexible and expressive component APIs.

## Architecture
The project includes two primary examples of compound components:
- `Tabs` (`Tabs`, `TabList`, `Tab`, `TabPanels`, `TabPanel`)
- `Accordion` (`Accordion`, `AccordionItem`, `AccordionHeader`, `AccordionPanel`)

Both use React Context to share state implicitly between the parent wrapper component and its semantic children, providing a clean JSX API that avoids prop drilling.

## How to Run
1. Navigate to the project directory: `cd d:\Portfolio\learning\react\compound-components\`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Key Concepts

### Compound Component Pattern
A pattern where components are designed to work together to accomplish a task. State is managed by a parent component and shared implicitly with children, usually via React Context. This leads to a declarative and flexible API.

### Context API Performance Pitfalls
When the value provided to Context changes, all consumers of that Context re-render. To avoid performance issues in large apps:
- Memoize the context value using `useMemo` so that the object reference remains the same if dependencies haven't changed.
- Split context into smaller contexts (e.g., one for state, one for dispatch).

### Controlled vs Uncontrolled Components
- **Uncontrolled:** The compound component manages its own internal state (e.g., `activeTab`).
- **Controlled:** The parent passes state down (e.g., `activeTab` as a prop) and handles changes via callbacks (e.g., `onChange`).
Compound components can be designed to support both patterns, allowing greater flexibility for consumers.

### Accessibility (ARIA)
Compound components like Tabs and Accordions need correct ARIA attributes to be accessible:
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`
- Accordion: `aria-expanded`

### Prop Drilling
Prop drilling is the process of passing data from one component to another through multiple layers of intermediate components. Compound components avoid this by using Context, allowing child components to access state directly without intermediate components needing to pass it down.

## Interview Q&A

**Q: What is the Compound Component Pattern?**
A: It's an advanced React pattern that allows multiple components to work together to share state and handle behavior. A parent component manages the state and provides it to its children implicitly using React Context.

**Q: What are the benefits of this pattern?**
A: 
1. Avoids prop drilling.
2. Provides a very flexible and expressive API. Users can rearrange child components easily.
3. Separation of concerns.

**Q: How does it compare to Render Props?**
A: Render props expose state explicitly via a function, which can lead to nested callbacks ("callback hell"). Compound components expose state implicitly via Context, leading to cleaner, more declarative JSX.
