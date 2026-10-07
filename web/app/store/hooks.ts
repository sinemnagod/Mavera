import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./index";

// Pre-typed versions of the hooks, so components never repeat the types.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
