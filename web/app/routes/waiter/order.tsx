import type { Route } from "./+types/order";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Order, table ${params.tableId} · Mavera` }];
}

export default function Order({ params }: Route.ComponentProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">Order — Table {params.tableId}</h1>
      <p className="mt-4 max-w-prose text-stone-400">
        Menu categories, item grid, and the receipt-styled ticket panel with quantity steppers,
        modifier chips, and urgency flags land in a later milestone.
      </p>
    </div>
  );
}
