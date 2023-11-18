import { memo, ReactNode } from "react";
import { getClassNames } from "../../helpers";
import { usePhotoSwipeContext } from "../../hooks";

const HeaderLeft = ({ children }: { children?: ReactNode }) => {
  const { activeItemIndex, items } = usePhotoSwipeContext();

  return (
    <div className={getClassNames("header-left")}>
      <div>{`${activeItemIndex + 1} / ${items.length}`}</div>
      {children}
    </div>
  );
};

export default memo(HeaderLeft);
