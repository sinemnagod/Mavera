"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { hydrateDemo, makeStore } from "@/store";
import { loadSavedState, saveState } from "@/store/persistence";

export default function StoreProvider({ children }) {
  const [store] = useState(makeStore);

  // localStorage doesn't exist on the server, so saved state is loaded after mount, not during render.
  useEffect(() => {
    const saved = loadSavedState();
    if (saved) store.dispatch(hydrateDemo(saved));
    return store.subscribe(() => saveState(store.getState()));
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
