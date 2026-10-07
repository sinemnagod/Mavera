import type { Route } from "./+types/ticket";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Ticket ${params.ticketId} · Mavera` }];
}

export default function TicketDetail({ params }: Route.ComponentProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">Ticket {params.ticketId}</h1>
      <p className="mt-4 max-w-prose text-stone-400">
        Fired items, ready items, add-more, request check, and close-table actions land in a
        later milestone.
      </p>
    </div>
  );
}
