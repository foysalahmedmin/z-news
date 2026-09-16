import { setOpenIndexes as setOpenIndexesSlice } from "@/redux/slices/menu-slice";
import type { RootState } from "@/redux/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useMenu = () => {
  const dispatch = useDispatch();
  const {
    menus,
    indexesMap,
    breadcrumbsMap,
    activeIndexes,
    openIndexes,
    activeBreadcrumbs,
  } = useSelector((state: RootState) => state.menu);

  const setOpenIndexes = useCallback(
    (payload: number[]) => dispatch(setOpenIndexesSlice(payload)),
    [dispatch],
  );

  return {
    menus,
    indexesMap,
    breadcrumbsMap,
    activeIndexes,
    openIndexes,
    activeBreadcrumbs,
    setOpenIndexes,
  };
};

export default useMenu;
