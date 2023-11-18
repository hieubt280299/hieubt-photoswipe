import { useCallback } from "react";
import { getClassNames } from "../../../helpers";
import CloseIcon from "@mui/icons-material/Close";
import { usePhotoSwipeContext } from "../../../hooks";

export const CloseButton: React.FC = () => {
  const { handleClose } = usePhotoSwipeContext();
  const onCloseButtonClick = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <button className={getClassNames("icon-button")} title="Close (ESC)" onClick={onCloseButtonClick}>
      <CloseIcon />
    </button>
  );
};
