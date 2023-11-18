import { useCallback, useEffect, useState } from "react";
import { EventBus, getClassNames } from "../../../helpers";
import { usePhotoSwipeContext } from "../../../hooks";
import { SET_HEADER_ZOOMING_STATUS, TOGGLE_PS_ZOOMING } from "../../../constants";
import { ZoomingStatus } from "../../../enums";
import ZoomIn from "@mui/icons-material/ZoomIn";
import ZoomOut from "@mui/icons-material/ZoomOut";

export const ZoomButton: React.FC = () => {
  // Zooming status of current item
  const [zoomingStatus, setZoomingStatus] = useState<ZoomingStatus>(ZoomingStatus.DISABLED);
  const { activeItem } = usePhotoSwipeContext();
  const isImageItem = !activeItem.isVideoFile;

  const toggleZooming = useCallback(() => {
    EventBus.dispatch(TOGGLE_PS_ZOOMING);
  }, []);

  useEffect(() => {
    EventBus.on(SET_HEADER_ZOOMING_STATUS, setZoomingStatus);
    return () => {
      EventBus.off(SET_HEADER_ZOOMING_STATUS, setZoomingStatus);
    };
  }, [setZoomingStatus]);
  if (isImageItem && zoomingStatus !== ZoomingStatus.DISABLED) {
    const ZoomIcon = zoomingStatus === ZoomingStatus.IN ? ZoomOut : ZoomIn;
    return (
      <button className={getClassNames("icon-button")} title="Toggle zoom" onClick={toggleZooming}>
        <ZoomIcon />
      </button>
    );
  }

  return null;
};
