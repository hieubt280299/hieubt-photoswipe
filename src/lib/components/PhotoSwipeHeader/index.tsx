import { FC, ReactNode } from "react";
import { getClassNames } from "../../helpers";
import HeaderRight from "./HeaderRight";
import HeaderLeft from "./HeaderLeft";
import HeaderCenter from "./HeaderCenter";
import { usePhotoSwipeContext } from "../../hooks";

type PhotoSwipeHeaderProps = {
  children?: ReactNode;
};

type PhotoSwipeHeaderComponent = FC & {
  Left: FC<{ children?: ReactNode }>;
  Center: FC<{ children?: ReactNode }>;
  Right: FC<{ children?: ReactNode }>;
};

const PhotoSwipeHeader: PhotoSwipeHeaderComponent = ({ children }: PhotoSwipeHeaderProps): JSX.Element => {
  const { renderHeader, activeItem } = usePhotoSwipeContext();

  return (
    <div className={getClassNames("header", "header-low-opacity")}>
      {renderHeader?.(activeItem) ? renderHeader(activeItem) : <DefaultPhotoSwipeHeader />}
      {children}
    </div>
  );
};

PhotoSwipeHeader.Left = HeaderLeft;

PhotoSwipeHeader.Center = HeaderCenter;

PhotoSwipeHeader.Right = HeaderRight;

export const DefaultPhotoSwipeHeader = () => (
  <>
    <PhotoSwipeHeader.Left />
    <PhotoSwipeHeader.Center />
    <PhotoSwipeHeader.Right />
  </>
);

export default PhotoSwipeHeader;
