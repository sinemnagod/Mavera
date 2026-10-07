import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { hydrateDemo, makeStore } from "~/store";
import { loadSavedState, saveState } from "~/store/persistence";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  // The page is rendered on the server first, where localStorage doesn't exist,
  // so saved state is loaded after mount, not during render.
  useEffect(() => {
    const saved = loadSavedState();
    if (saved) store.dispatch(hydrateDemo(saved));
    return store.subscribe(() => saveState(store.getState()));
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
