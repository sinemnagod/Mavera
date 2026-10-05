export default async function OrderPage({ params }) {
  const { tableId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">Order — Table {tableId}</h1>
      <p className="mt-4 max-w-prose text-stone-400">
        Menu categories, item grid, and the receipt-styled ticket panel with quantity steppers,
        modifier chips, and urgency flags land in a later milestone.
      </p>
    </div>
  );
}
