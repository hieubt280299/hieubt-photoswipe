import React, { useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import { getClassNames } from "../helpers";
import "./PhotoSwipe.scss";
import PhotoSwipeHeader from "./PhotoSwipeHeader";
import PhotoSwipeFooter from "./PhotoSwipeFooter";
import PhotoSwipeContent from "./PhotoSwipeContent";
import { usePhotoSwipeContext } from "../hooks";
import type { PhotoSwipeOptions } from "../models";

type PhotoSwipeDialogProps = {
  isOpen: boolean;
  psOptions: PhotoSwipeOptions;
};

const PhotoSwipeDialog = ({ isOpen, psOptions }: PhotoSwipeDialogProps) => {
  const { activeItem, handleClose, handleNavigateNext, handleNavigatePrevious } = usePhotoSwipeContext();

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (event.key === "Escape") {
        handleClose();
        return;
      }
      if (event.key === " ") {
        const target = event.target as HTMLElement;
        if (target.tagName === "BUTTON") {
          // Prevent triggering currently focused buttons when pressing SPACE
          target.blur();
        }
        if (!activeItem.isVideoFile) {
          handleClose();
          event.stopPropagation();
        }
        return;
      }

      if (!psOptions.arrowKeys) {
        return;
      }
      if (event.key === "ArrowLeft") {
        handleNavigatePrevious();
      } else if (event.key === "ArrowRight") {
        handleNavigateNext();
      }
    },
    [activeItem, handleClose, handleNavigateNext, handleNavigatePrevious, psOptions.arrowKeys]
  );

  return (
    <Dialog fullScreen open={isOpen} onKeyDown={handleKeyDown} className={getClassNames("dialog")}>
      <div className={getClassNames("container")}>
        <PhotoSwipeHeader />
        <PhotoSwipeContent />
        <PhotoSwipeFooter />
      </div>
    </Dialog>
  );
};

export default React.memo(PhotoSwipeDialog);
