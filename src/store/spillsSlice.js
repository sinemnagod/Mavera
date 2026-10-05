import { createSlice, nanoid } from "@reduxjs/toolkit";

const spillsSlice = createSlice({
  name: "spills",
  initialState: [],
  reducers: {
    spillReported: {
      reducer(state, action) {
        state.unshift(action.payload);
      },
      // A reducer must be pure, so the id and timestamp are created here, before the action is dispatched.
      prepare({ area, description, reportedBy }) {
        return {
          payload: {
            id: nanoid(),
            area,
            description,
            reportedBy,
            reportedAt: new Date().toISOString(),
            resolved: false,
          },
        };
      },
    },
    spillResolved: {
      reducer(state, action) {
        const spill = state.find((s) => s.id === action.payload.id);
        if (!spill) return;
        spill.resolved = true;
        spill.resolvedBy = action.payload.resolvedBy;
        spill.resolvedAt = action.payload.resolvedAt;
      },
      prepare({ id, resolvedBy }) {
        return { payload: { id, resolvedBy, resolvedAt: new Date().toISOString() } };
      },
    },
  },
});

export const { spillReported, spillResolved } = spillsSlice.actions;
export default spillsSlice.reducer;
