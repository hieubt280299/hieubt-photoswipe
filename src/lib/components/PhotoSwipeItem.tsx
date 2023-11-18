import { memo } from "react";
import PhotoSwipeVideoItem from "./PhotoSwipeVideoItem";
import PhotoSwipeImageItem from "./PhotoSwipeImageItem";
import type { PhotoSwipeItemInfo } from "../models";
import { usePhotoSwipeContext } from "../hooks";
import { getClassNames } from "../helpers";

export type PhotoSwipeItemProps = {
  item: PhotoSwipeItemInfo;
  swipingTranslateX: number;
  isActive?: boolean;
};

const PhotoSwipeItem = (props: PhotoSwipeItemProps) => {
  const { renderItem } = usePhotoSwipeContext();
  const { item, swipingTranslateX } = props;

  // Customized item render
  if (renderItem?.(item)) {
    return (
      <div className={getClassNames("item")} style={{ transform: `translateX(${swipingTranslateX}px)` }}>
        {renderItem(item)}
      </div>
    );
  }

  if (item.isVideoFile) {
    return <PhotoSwipeVideoItem {...props} />;
  }
  return <PhotoSwipeImageItem {...props} />;
};

export default memo(PhotoSwipeItem);
