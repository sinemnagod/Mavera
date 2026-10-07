import { redirect } from "react-router";

// /waiter has no screen of its own; send it to the first one.
export function clientLoader() {
  return redirect("/waiter/floor-plan");
}
