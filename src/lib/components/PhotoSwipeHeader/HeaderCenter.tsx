import { memo, ReactNode } from "react";
import { getClassNames } from "../../helpers";

const HeaderCenter = ({ children }: { children?: ReactNode }) => {
  return <div className={getClassNames("header-center")}>{children}</div>;
};

export default memo(HeaderCenter);
