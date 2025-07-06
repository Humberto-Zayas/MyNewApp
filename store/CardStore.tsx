import React, { createContext, useContext, useReducer } from 'react';

type State = {
  likedCards: string[];
  dislikedCards: string[];
};

type Action =
  | { type: 'LIKE_CARD'; id: string }
  | { type: 'DISLIKE_CARD'; id: string }
  | { type: 'RESET' };

const initialState: State = {
  likedCards: [],
  dislikedCards: [],
};

const CardStateContext = createContext<State | undefined>(undefined);
const CardDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LIKE_CARD':
      return {
        ...state,
        likedCards: [...state.likedCards, action.id],
        dislikedCards: state.dislikedCards.filter(id => id !== action.id),
      };
    case 'DISLIKE_CARD':
      return {
        ...state,
        dislikedCards: [...state.dislikedCards, action.id],
        likedCards: state.likedCards.filter(id => id !== action.id),
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const CardProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CardStateContext.Provider value={state}>
      <CardDispatchContext.Provider value={dispatch}>
        {children}
      </CardDispatchContext.Provider>
    </CardStateContext.Provider>
  );
};

export const useCardState = () => {
  const context = useContext(CardStateContext);
  if (!context) throw new Error('useCardState must be used within CardProvider');
  return context;
};

export const useCardDispatch = () => {
  const context = useContext(CardDispatchContext);
  if (!context) throw new Error('useCardDispatch must be used within CardProvider');
  return context;
};
