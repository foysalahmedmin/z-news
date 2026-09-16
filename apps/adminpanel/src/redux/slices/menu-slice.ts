// store/routeSlice.ts

import type { TMenuState } from "@/types/state.type";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState: TMenuState = {
  menus: [],
  indexesMap: {},
  breadcrumbsMap: {},
  activeIndexes: [],
  openIndexes: [],
  activeBreadcrumbs: [],
};

const routeSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenus(state, action: PayloadAction<TMenuState["menus"]>) {
      state.menus = action.payload;
    },
    setIndexesMap(state, action: PayloadAction<TMenuState["indexesMap"]>) {
      state.indexesMap = action.payload;
    },
    setBreadcrumbsMap(
      state,
      action: PayloadAction<TMenuState["breadcrumbsMap"]>,
    ) {
      state.breadcrumbsMap = action.payload;
    },
    setActiveIndexes(
      state,
      action: PayloadAction<TMenuState["activeIndexes"]>,
    ) {
      state.activeIndexes = action.payload;
    },
    setOpenIndexes(state, action: PayloadAction<TMenuState["openIndexes"]>) {
      state.openIndexes = action.payload;
    },
    setActiveBreadcrumbs(
      state,
      action: PayloadAction<TMenuState["activeBreadcrumbs"]>,
    ) {
      state.activeBreadcrumbs = action.payload;
    },
  },
});

export const {
  setMenus,
  setIndexesMap,
  setBreadcrumbsMap,
  setActiveIndexes,
  setOpenIndexes,
  setActiveBreadcrumbs,
} = routeSlice.actions;
export default routeSlice.reducer;
