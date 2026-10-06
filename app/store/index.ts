import {
  combineReducers,
  configureStore,
  createAction,
  type UnknownAction,
} from "@reduxjs/toolkit";
import spillsReducer from "./spillsSlice";

const appReducer = combineReducers({
  spills: spillsReducer,
});

export type RootState = ReturnType<typeof appReducer>;

export const resetDemo = createAction("demo/reset");
export const hydrateDemo = createAction<Partial<RootState>>("demo/hydrate");

// Reset and hydrate act on the whole state tree, so they can't live inside any one slice.
function rootReducer(state: RootState | undefined, action: UnknownAction): RootState {
  if (resetDemo.match(action)) return appReducer(undefined, action);
  // Merging over fresh defaults means a slice added after the save was made still gets its initial state.
  if (hydrateDemo.match(action)) return { ...appReducer(undefined, action), ...action.payload };
  return appReducer(state, action);
}

// A function, not a shared instance: on the server each request must get its own store.
export function makeStore() {
  return configureStore({ reducer: rootReducer });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
