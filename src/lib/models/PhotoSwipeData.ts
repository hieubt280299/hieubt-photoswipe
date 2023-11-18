import { PhotoSwipeItemInfo } from "./PhotoSwipeItemInfo";

export interface PhotoSwipeEvents {
  onOpen?: () => void;
  onClose?: (currItem: PhotoSwipeItemInfo) => void;
  onAfterChange?: (currItem: PhotoSwipeItemInfo) => void;
}

export interface PhotoSwipeData {
  items?: PhotoSwipeItemInfo[];
  activeItemId?: string;
  events?: PhotoSwipeEvents;
  imageClassName?: string;
  imageSelectedClassName?: string;
  index?: number;
  parentEl?: HTMLElement;
  event?: Event;
}
