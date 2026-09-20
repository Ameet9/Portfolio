import React, { useReducer, useState, useEffect } from 'react';

// Initial state for the time-traveling reducer
const initialState = {
  past: [],
  present: '',
  future: []
};

// Reducer function handling UNDO, REDO, and EDIT actions
function historyReducer(state, action) {
  const { past, present, future } = state;

  switch (action.type) {
    case 'UNDO':
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      };
    case 'REDO':
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture
      };
    case 'EDIT':
      if (present === action.payload) return state;
      return {
        past: [...past, present],
        present: action.payload,
        future: [] // Clear future on new edit
      };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(historyReducer, initialState);
  const [text, setText] = useState(state.present);

  // Sync internal text state with present state when UNDO/REDO occurs
  useEffect(() => {
    setText(state.present);
  }, [state.present]);

  // Debounce the text changes and dispatch EDIT action
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only dispatch if text has actually changed compared to present
      if (text !== state.present) {
        dispatch({ type: 'EDIT', payload: text });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [text, state.present]);

  // Handle keyboard shortcuts (Ctrl+Z and Ctrl+Shift+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          dispatch({ type: 'REDO' });
        } else {
          e.preventDefault();
          dispatch({ type: 'UNDO' });
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUndo = () => dispatch({ type: 'UNDO' });
  const handleRedo = () => dispatch({ type: 'REDO' });

  return (
    <div className="container">
      <header>
        <h1>TimeTravel Notes</h1>
        <div className="toolbar">
          <button onClick={handleUndo} disabled={state.past.length === 0}>
            Undo
          </button>
          <button onClick={handleRedo} disabled={state.future.length === 0}>
            Redo
          </button>
        </div>
      </header>
      
      <main>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing..."
        />
      </main>

      <footer className="status">
        <span>Past states: {state.past.length}</span>
        <span>Shortcuts: Ctrl+Z (Undo) / Ctrl+Y (Redo)</span>
        <span>Future states: {state.future.length}</span>
      </footer>
    </div>
  );
}

export default App;
