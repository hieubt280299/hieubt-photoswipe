import React, { useCallback, useState, useMemo, forwardRef, useImperativeHandle, useLayoutEffect, ForwardRefRenderFunction } from "react";
import PhotoSwipeDialog from "./PhotoSwipeDialog";
import { PhotoSwipeData, PhotoSwipeEvents, PhotoSwipeItemInfo, PhotoSwipeOptions } from "../models";
import { getItemsFromData } from "../helpers";

export type PhotoSwipeContextType = {
  isOpen: boolean;
  handleClose: () => void;
  handleNavigateNext: () => void;
  handleNavigatePrevious: () => void;
  items: PhotoSwipeItemInfo[];
  displayItems: PhotoSwipeItemInfo[];
  updatePsOptions: (newOptions: PhotoSwipeOptions) => void;
  activeItemIndex: number;
  activeItem: PhotoSwipeItemInfo;
  displayItemIndex: number;
  extraData: { [key: string]: unknown };
  updateExtraData: (data: { [key: string]: unknown }) => void;
} & PhotoSwipeProps;

export const PhotoSwipeContext = React.createContext<PhotoSwipeContextType | undefined>(undefined);

type PhotoSwipeProps = {
  renderHeader?: (item: PhotoSwipeItemInfo) => React.ReactNode;
  renderItem?: (item: PhotoSwipeItemInfo) => React.ReactNode;
  renderFooter?: (item: PhotoSwipeItemInfo) => React.ReactNode;
};

const PhotoSwipe: ForwardRefRenderFunction<unknown, PhotoSwipeProps> = ({ renderHeader, renderFooter, renderItem }, ref) => {
  const [isOpen, setOpen] = useState(false);
  const [items, setItems] = useState<PhotoSwipeItemInfo[]>([]);
  const [displayItemIndex, setDisplayItemIndex] = useState<number>(0);
  const [psOptions, setPsOptions] = useState<PhotoSwipeOptions>({});
  const [events, setEvents] = useState<PhotoSwipeEvents>({});

  // Extra data used internally for the BeforeAfterView items (example: BeforeAfterView's item selected before asset option in case there are multiple before assets)
  const [extraData, setExtraData] = useState<{ [key: string]: unknown }>({});

  const updateExtraData = useCallback((data: { [key: string]: unknown }) => {
    setExtraData((prev) => ({ ...prev, ...data }));
  }, []);

  // When items.length > 3 || < 2, displayItemIndex is always equal to activeItemIndex and displayItems is always equal to items
  // displayItemIndex and displayItems are only used to smooth the swiping animation when 2 <= items.length <= 3

  const activeItemIndex = useMemo(() => {
    return displayItemIndex % items.length;
  }, [displayItemIndex, items.length]);

  const displayItems = useMemo(() => {
    if (items.length > 3 || items.length < 2) {
      return items;
    } else {
      return [...items.map((item) => ({ ...item, renderKey: "1" })), ...items.map((item) => ({ ...item, renderKey: "2" }))];
    }
  }, [items]);

  const updatePsOptions = useCallback((newOptions: PhotoSwipeOptions) => {
    setPsOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  const handleOpen = useCallback((data: PhotoSwipeData) => {
    if (data.items?.length) {
      setItems(data.items);
      if (data.activeItemId) {
        const itemIndex = data.items.findIndex((item) => item.id === data.activeItemId);
        setDisplayItemIndex(Math.max(itemIndex, 0));
      }
    } else {
      const { items, activeIndex } = getItemsFromData(data);
      setItems(items);
      setDisplayItemIndex(activeIndex);
    }
    if (data.events) {
      setEvents(data.events);
      data.events.onOpen?.();
    }
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    const onClose = events.onClose;
    const currItem = { ...items[activeItemIndex] };
    onClose?.(currItem);
    setOpen(false);
  }, [activeItemIndex, events.onClose, items]);

  useLayoutEffect(() => {
    updatePsOptions({ arrowKeys: true });
  }, [displayItemIndex, updatePsOptions]);

  useImperativeHandle(
    ref,
    () => {
      return {
        isOpen,
        handleOpen: (data: PhotoSwipeData) => handleOpen(data),
        handleClose: () => handleClose(),
        setItems: (items: PhotoSwipeItemInfo[]) => setItems(items),
        updateItemById: (newItem: PhotoSwipeItemInfo, id: string) => {
          const index = items.findIndex((item) => item.id === id);
          const newItems = structuredClone(items);
          newItems[index] = { ...newItem };
          setItems(newItems);
        },
      };
    },
    [isOpen, handleOpen, handleClose, items]
  );

  const handleNavigate = useCallback(
    (direction: "next" | "prev") => {
      switch (direction) {
        case "next":
          setDisplayItemIndex((prev) => (prev + 1) % displayItems.length);
          break;
        case "prev":
          setDisplayItemIndex((prev) => (prev + displayItems.length - 1) % displayItems.length);
          break;
      }
    },
    [displayItems]
  );

  const handleNavigateNext = useCallback(() => {
    handleNavigate("next");
  }, [handleNavigate]);

  const handleNavigatePrevious = useCallback(() => {
    handleNavigate("prev");
  }, [handleNavigate]);

  useLayoutEffect(() => {
    const onAfterChange = events.onAfterChange;
    const currItem = { ...items[activeItemIndex] };
    if (onAfterChange) {
      onAfterChange(currItem);
    }
  }, [activeItemIndex, events.onAfterChange, items]);

  const contextValue = useMemo(
    () => ({
      isOpen,
      items,
      displayItems,
      updatePsOptions,
      extraData,
      updateExtraData,
      handleOpen,
      handleClose,
      activeItemIndex,
      activeItem: items[activeItemIndex],
      displayItemIndex,
      handleNavigateNext,
      handleNavigatePrevious,
      renderHeader,
      renderFooter,
      renderItem,
    }),
    [
      isOpen,
      items,
      displayItems,
      updatePsOptions,
      extraData,
      updateExtraData,
      handleOpen,
      handleClose,
      activeItemIndex,
      displayItemIndex,
      handleNavigateNext,
      handleNavigatePrevious,
      renderHeader,
      renderFooter,
      renderItem,
    ]
  );

  return (
    <PhotoSwipeContext.Provider value={contextValue}>
      <PhotoSwipeDialog isOpen={isOpen} psOptions={psOptions} />
    </PhotoSwipeContext.Provider>
  );
};

export default React.memo(forwardRef(PhotoSwipe));
