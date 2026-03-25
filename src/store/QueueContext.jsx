import { createContext, useContext, useReducer } from 'react'

const QueueContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_NOTES':
      return { queue: [...state.queue, ...action.payload] }
    case 'SET_STATUS':
      return {
        queue: state.queue.map(n =>
          n.id === action.payload.id
            ? { ...n, status: action.payload.status, errorMessage: action.payload.errorMessage || n.errorMessage }
            : n
        ),
      }
    case 'UPDATE_NOTA':
      return { queue: state.queue.map(n => n.id === action.payload.id ? action.payload : n) }
    case 'REMOVE_NOTA':
      return { queue: state.queue.filter(n => n.id !== action.payload) }
    case 'CLEAR_EXPORTED':
      return { queue: state.queue.filter(n => n.status !== 'Exported') }
    default:
      return state
  }
}

export function QueueProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { queue: [] })
  return <QueueContext.Provider value={{ state, dispatch }}>{children}</QueueContext.Provider>
}

export function useQueue() {
  return useContext(QueueContext)
}
