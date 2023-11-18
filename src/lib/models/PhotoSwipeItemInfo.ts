import { MediaTypeId } from "../enums";

export interface PhotoSwipeItemInfo {
  data?: { [key: string]: string };
  src?: string;
  id?: string;
  fileName: string;
  isVideoFile?: boolean;
  mediaTypeId?: MediaTypeId;
  renderKey?: string;
}
