import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export const SPILL_AREAS = [
  "Main",
  "Terrace",
  "Family",
  "Kitchen",
  "Restrooms",
  "Storage",
  "Entrance",
] as const;
export type SpillArea = (typeof SPILL_AREAS)[number];

export interface SpillReport {
  id: string;
  area: SpillArea;
  description: string;
  reportedBy: string;
  reportedAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

type NewSpill = Pick<SpillReport, "area" | "description" | "reportedBy">;

const initialState: SpillReport[] = [];

const spillsSlice = createSlice({
  name: "spills",
  initialState,
  reducers: {
    spillReported: {
      reducer(state, action: PayloadAction<SpillReport>) {
        state.unshift(action.payload);
      },
      // A reducer must be pure, so the id and timestamp are created here, before the action is dispatched.
      prepare({ area, description, reportedBy }: NewSpill) {
        const report: SpillReport = {
          id: nanoid(),
          area,
          description,
          reportedBy,
          reportedAt: new Date().toISOString(),
          resolved: false,
        };
        return { payload: report };
      },
    },
    spillResolved: {
      reducer(state, action: PayloadAction<{ id: string; resolvedBy: string; resolvedAt: string }>) {
        const spill = state.find((s) => s.id === action.payload.id);
        if (!spill) return;
        spill.resolved = true;
        spill.resolvedBy = action.payload.resolvedBy;
        spill.resolvedAt = action.payload.resolvedAt;
      },
      prepare({ id, resolvedBy }: { id: string; resolvedBy: string }) {
        return { payload: { id, resolvedBy, resolvedAt: new Date().toISOString() } };
      },
    },
  },
});

export const { spillReported, spillResolved } = spillsSlice.actions;
export default spillsSlice.reducer;
