import { memo } from "react";
import { getClassNames } from "../helpers";
import { usePhotoSwipeContext } from "../hooks";

const PhotoSwipeFooter = () => {
  const { renderFooter, activeItem } = usePhotoSwipeContext();
  return (
    <div className={getClassNames("footer", "footer-low-opacity")}>
      {renderFooter?.(activeItem) ? renderFooter(activeItem) : <span>{activeItem.fileName}</span>}
    </div>
  );
};

export default memo(PhotoSwipeFooter);
