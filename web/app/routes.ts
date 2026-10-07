import { index, route, type RouteConfig } from "@react-router/dev/routes";

// Waiter, kitchen, cleaner and store manager have no location in their URLs: they are
// hardcoded to Kadıköy, the stand-in for what authentication would decide. Only the
// GM's location detail takes a :locationId.
export default [
  index("routes/home.tsx"),

  route("waiter", "routes/waiter/layout.tsx", [
    index("routes/waiter/redirect.tsx"),
    route("floor-plan", "routes/waiter/floor-plan.tsx"),
    route("order/:tableId", "routes/waiter/order.tsx"),
    route("ticket/:ticketId", "routes/waiter/ticket.tsx"),
  ]),

  route("kitchen", "routes/kitchen.tsx"),
  route("cleaner", "routes/cleaner.tsx"),

  route("store", "routes/store/layout.tsx", [
    index("routes/store/redirect.tsx"),
    route("stock", "routes/store/stock.tsx"),
    route("counts", "routes/store/counts.tsx"),
    route("movements", "routes/store/movements.tsx"),
    route("variance", "routes/store/variance.tsx"),
    route("checklist", "routes/store/checklist.tsx"),
  ]),

  route("gm", "routes/gm/layout.tsx", [
    index("routes/gm/overview.tsx"),
    route("locations/:locationId", "routes/gm/location.tsx"),
    route("approvals", "routes/gm/approvals.tsx"),
  ]),
] satisfies RouteConfig;
