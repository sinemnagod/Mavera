import { redirect } from "react-router";

// /store has no screen of its own; send it to the first one.
export function clientLoader() {
  return redirect("/store/stock");
}
