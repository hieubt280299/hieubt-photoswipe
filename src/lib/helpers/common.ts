import type { PhotoSwipeData, PhotoSwipeItemInfo, DocumentElementWithFullscreen, DocumentWithFullscreen } from "../models";
import classNames from "classnames";
import { CSS_PREFIX } from "../constants";
import { MediaTypeId } from "../enums";

export const getItemsFromData = (data: PhotoSwipeData): { items: PhotoSwipeItemInfo[]; activeIndex: number } => {
  const itemsFromElement: PhotoSwipeItemInfo[] = [];
  const target = data.event?.target;
  const parentEl = data.parentEl ?? document;
  const imageElments = parentEl.getElementsByClassName(data.imageClassName || "psw-image");
  let index = data.index ?? 0;
  for (let i = 0; i < imageElments.length; i++) {
    const el: Element & { dataset?: { [key: string]: string } } = imageElments[i];
    if (!el.dataset) continue;

    // Media type = video
    if (Number(el.dataset.mediaTypeId) === MediaTypeId.VIDEO) {
      const { id, fileName, videoSrc } = el.dataset;
      const videoObj: PhotoSwipeItemInfo = {
        src: videoSrc,
        isVideoFile: true,
        mediaTypeId: MediaTypeId.VIDEO,
        id,
        fileName,
        data: el.dataset,
      };

      if (videoObj.id) {
        itemsFromElement.push(videoObj);
        if (el === target || (data.imageSelectedClassName && el.classList.contains(data.imageSelectedClassName))) {
          index = itemsFromElement.length - 1;
        }
      }
      continue;
    }

    // Media type = image
    const imageObj: PhotoSwipeItemInfo = {
      id: el.dataset.id,
      isVideoFile: false,
      mediaTypeId: MediaTypeId.IMAGE,
      src: (el as HTMLImageElement).src,
      fileName: el.dataset.fileName,
      data: el.dataset,
    };

    if (imageObj.id) {
      itemsFromElement.push(imageObj);
      if (el === target || (data.imageSelectedClassName && el.classList.contains(data.imageSelectedClassName))) {
        index = itemsFromElement.length - 1;
      }
    }
  }
  return { items: itemsFromElement, activeIndex: index };
};

export const getClassNames = (...args: any[]) => {
  let result = "";
  if (typeof args === "string") {
    result = args;
  } else {
    result = classNames(...args);
  }
  if (result) {
    return result
      .split(" ")
      .map((x: string) => `${CSS_PREFIX}-` + x)
      .join(" ");
  }
  return "";
};

export const toggleFullScreen = (elem: DocumentElementWithFullscreen) => {
  const doc = document as DocumentWithFullscreen;
  if (!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement || doc.mozFullScreenElement)) {
    elem.requestFullscreen?.();
    elem.msRequestFullscreen?.();
    elem.mozRequestFullScreen?.();
    elem.webkitRequestFullscreen?.();
  } else {
    doc.exitFullscreen?.();
    doc.msExitFullscreen?.();
    doc.mozCancelFullScreen?.();
    doc.webkitExitFullscreen?.();
  }
};
