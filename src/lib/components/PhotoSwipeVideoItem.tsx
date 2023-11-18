import { memo, useCallback } from "react";
import { getClassNames } from "../helpers";
import type { PhotoSwipeItemProps } from "./PhotoSwipeItem";
import { usePhotoSwipeContext } from "../hooks";

type PhotoSwipeVideoItemProps = PhotoSwipeItemProps & {};

const PhotoSwipeVideoItem = ({ item, swipingTranslateX, isActive }: PhotoSwipeVideoItemProps) => {
  const { updatePsOptions } = usePhotoSwipeContext();

  const preventSwipe = useCallback((e: Event) => {
    e.stopPropagation();
  }, []);

  const onVideoPlayed = useCallback(() => {
    updatePsOptions({ arrowKeys: false });
  }, [updatePsOptions]);

  const onVideoEnded = useCallback(() => {
    updatePsOptions({ arrowKeys: true });
  }, [updatePsOptions]);

  const onVideoRendered = useCallback(
    (containerEl?: HTMLElement) => {
      if (!containerEl) {
        return;
      }
      containerEl.addEventListener("pointerdown", preventSwipe);
      containerEl.addEventListener("MSPointerDown", preventSwipe);
      containerEl.addEventListener("touchstart", preventSwipe);
      containerEl.addEventListener("mousedown", preventSwipe);
      const videoEl = containerEl.querySelector("video");
      videoEl?.addEventListener("play", onVideoPlayed);
      videoEl?.addEventListener("ended", onVideoEnded);
    },
    [onVideoEnded, onVideoPlayed, preventSwipe]
  );

  return (
    <div className={getClassNames("item")} style={{ transform: `translateX(${swipingTranslateX}px)` }}>
      <div className={getClassNames("video-container")}>{isActive && <div>Video Component here</div>}</div>
    </div>
  );
};

export default memo(PhotoSwipeVideoItem);
