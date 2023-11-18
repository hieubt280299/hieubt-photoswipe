import type { DocumentWithFullscreen } from "../../../models";
import { useCallback, useEffect, useState } from "react";
import { getClassNames, toggleFullScreen } from "../../../helpers";
import Fullscreen from "@mui/icons-material/Fullscreen";
import FullscreenExit from "@mui/icons-material/FullscreenExit";
import { usePhotoSwipeContext } from "../../../hooks";

export const ToggleFullscreenButton: React.FC = () => {
  const [isFullScreen, setFullScreen] = useState(false);
  const { isOpen } = usePhotoSwipeContext();

  const handleFullScreen = useCallback(() => {
    toggleFullScreen(document.documentElement);
  }, []);

  useEffect(() => {
    if (!isOpen && isFullScreen) {
      const doc = document as DocumentWithFullscreen;
      doc.exitFullscreen?.();
      doc.msExitFullscreen?.();
      doc.mozCancelFullScreen?.();
      doc.webkitExitFullscreen?.();
    }
  }, [isFullScreen, isOpen]);

  const checkFullScreen = useCallback(() => {
    const doc = document as DocumentWithFullscreen;
    setFullScreen(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement || doc.mozFullScreenElement));
  }, []);

  useEffect(() => {
    const prefixes = ["", "webkit", "moz", "ms"];
    prefixes.forEach((prefix) => {
      document.addEventListener(`${prefix}fullscreenchange`, checkFullScreen);
    });
    return () => {
      prefixes.forEach((prefix) => {
        document.removeEventListener(`${prefix}fullscreenchange`, checkFullScreen);
      });
    };
  }, [checkFullScreen]);
  return (
    <button className={getClassNames("icon-button")} title="Toggle fullscreen" onClick={handleFullScreen}>
      {!isFullScreen ? <Fullscreen /> : <FullscreenExit />}
    </button>
  );
};

export default ToggleFullscreenButton;
