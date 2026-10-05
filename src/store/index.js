import { combineReducers, configureStore, createAction } from "@reduxjs/toolkit";
import spillsReducer from "./spillsSlice";

export const resetDemo = createAction("demo/reset");
export const hydrateDemo = createAction("demo/hydrate");

const appReducer = combineReducers({
  spills: spillsReducer,
});

// Reset and hydrate act on the whole state tree, so they can't live inside any one slice.
function rootReducer(state, action) {
  if (resetDemo.match(action)) return appReducer(undefined, action);
  // Merging over fresh defaults means a slice added after the save was made still gets its initial state.
  if (hydrateDemo.match(action)) return { ...appReducer(undefined, action), ...action.payload };
  return appReducer(state, action);
}

// A function, not a shared instance: on the server each request must get its own store.
export function makeStore() {
  return configureStore({ reducer: rootReducer });
}
