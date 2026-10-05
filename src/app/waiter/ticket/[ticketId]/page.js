export default async function TicketDetailPage({ params }) {
  const { ticketId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">Ticket {ticketId}</h1>
      <p className="mt-4 max-w-prose text-stone-400">
        Fired items, ready items, add-more, request check, and close-table actions land in a
        later milestone.
      </p>
    </div>
  );
}
