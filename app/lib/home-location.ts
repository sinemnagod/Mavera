import locations from "~/data/locations.json";

const home = locations.find((location) => location.id === "kadikoy");
if (!home) throw new Error("Seed data is missing the Kadıköy location");

// The location the four scoped roles are pinned to. One definition, so the name never drifts.
export const HOME_LOCATION = { id: home.id, name: home.name };
