export function meta() {
  return [{ title: "Checklist editor · Mavera" }];
}

export default function ChecklistEditor() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">Checklist editor</h1>
      <p className="mt-4 max-w-prose text-stone-400">
        Add, edit, and remove daily cleaning tasks, then submit a new version for GM approval —
        lands in a later milestone.
      </p>
    </div>
  );
}
