import { memo, ReactNode } from "react";
import { getClassNames } from "../../helpers";
import { CloseButton, ToggleFullscreenButton, ZoomButton } from "./buttons";

const HeaderRight = ({ children }: { children?: ReactNode }) => {
  return (
    <div className={getClassNames("header-right")}>
      {children}
      <ZoomButton />
      <ToggleFullscreenButton />
      <CloseButton />
    </div>
  );
};

export default memo(HeaderRight);
