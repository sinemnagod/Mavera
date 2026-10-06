import { useState } from "react";
import { resetDemo } from "~/store";
import { useAppDispatch } from "~/store/hooks";

export default function ResetDemoButton() {
  const dispatch = useAppDispatch();
  const [didReset, setDidReset] = useState(false);

  function handleReset() {
    dispatch(resetDemo());
    setDidReset(true);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleReset}
        className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-stone-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
      >
        Reset demo data
      </button>
      {/* Rendered even when empty: screen readers only announce a live region that already exists. */}
      <p role="status" className="text-sm text-stone-400">
        {didReset ? "Demo data reset." : ""}
      </p>
    </div>
  );
}
