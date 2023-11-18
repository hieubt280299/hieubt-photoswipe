import { memo, useCallback, useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { getClassNames } from "../helpers";
import "./PhotoSwipe.scss";
import { usePhotoSwipeContext, useWindowSize } from "../hooks";
import PhotoSwipeItem from "./PhotoSwipeItem";
import { debounce } from "@mui/material";

// The gap between 2 consecutive items will be 10% of screen width - This is to prevent 2 items from being too close to each other
const ITEM_GAP_RATIO = 1.1;

// Swipe more than 200px will navigate to next/previous item
export const ITEM_SWIPE_THRESHOLD = 200;

const PhotoSwipeContent = () => {
  const { displayItems, displayItemIndex, handleNavigateNext, handleNavigatePrevious } = usePhotoSwipeContext();

  // Swiping
  const [swipingTranslateX, setSwipingTranslateX] = useState(0);
  const [isFullyReleased, setFullyReleased] = useState(true);
  const swipingPositionXRef = useRef(0);

  // Resizing
  const [isResizing, setResizing] = useState(false);
  const screenWidth = useWindowSize().width;
  useLayoutEffect(() => {
    setResizing(true);
    const resizingTimeout = setTimeout(() => {
      setResizing(false);
    }, 300);
    return () => {
      clearTimeout(resizingTimeout);
    };
  }, [screenWidth]);

  const fullyReleaseDebounce = useMemo(
    () =>
      debounce(() => {
        setFullyReleased(true);
      }, 300),
    []
  );

  const handleMouseMoveWhenSwiping = useCallback((e: MouseEvent) => {
    setSwipingTranslateX(e.clientX - swipingPositionXRef.current);
    setFullyReleased(false);
  }, []);

  const handleMouseUpWhenSwiping = useCallback(
    (e: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMoveWhenSwiping);
      window.removeEventListener("mouseup", handleMouseUpWhenSwiping);
      // Resetting swiping translate to 0 needs to be put before handleNavigateNext/Prev to prevent some animation issues
      setSwipingTranslateX(0);

      const finalTranslateX = e.clientX - swipingPositionXRef.current;
      if (finalTranslateX < -ITEM_SWIPE_THRESHOLD) {
        handleNavigateNext();
      } else if (finalTranslateX > ITEM_SWIPE_THRESHOLD) {
        handleNavigatePrevious();
      }
      if (finalTranslateX !== 0) {
        fullyReleaseDebounce();
      }
    },
    [fullyReleaseDebounce, handleMouseMoveWhenSwiping, handleNavigateNext, handleNavigatePrevious]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      window.addEventListener("mousemove", handleMouseMoveWhenSwiping);
      window.addEventListener("mouseup", handleMouseUpWhenSwiping);
      swipingPositionXRef.current = e.clientX;
    },
    [handleMouseMoveWhenSwiping, handleMouseUpWhenSwiping]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMoveWhenSwiping);
      window.removeEventListener("mouseup", handleMouseUpWhenSwiping);
    };
  }, [handleMouseMoveWhenSwiping, handleMouseUpWhenSwiping]);

  const contentStatus = useMemo(() => {
    if (isResizing) {
      return "resizing";
    }
    if (swipingTranslateX !== 0) {
      return "swiping";
    }
    if (isFullyReleased) {
      return "released";
    }
    return "";
  }, [isFullyReleased, isResizing, swipingTranslateX]);

  return (
    <>
      <div className={getClassNames("button-arrow-wrapper")}>
        {displayItems.length > 1 && (
          <>
            <button
              onClick={handleNavigatePrevious}
              className={getClassNames("icon-button", "button-arrow", "button-arrow-left")}
              title="Previous (arrow left)"
            >
              <ArrowBack />
            </button>
            <button onClick={handleNavigateNext} className={getClassNames("icon-button", "button-arrow", "button-arrow-right")} title="Next (arrow right)">
              <ArrowForward />
            </button>
          </>
        )}
      </div>
      <div className={getClassNames("content", `content-${contentStatus}`)} onMouseDown={handleMouseDown}>
        {displayItems.map((item, index) => {
          let deltaIndex = index - displayItemIndex;
          if (displayItems.length <= 1) {
            deltaIndex = 0;
          } else if (displayItemIndex === 0 && index === displayItems.length - 1) {
            deltaIndex = -1;
          } else if (displayItemIndex === displayItems.length - 1 && index === 0) {
            deltaIndex = 1;
          }
          if (Math.abs(deltaIndex) > 1) return null;
          const itemTranslateX = swipingTranslateX + deltaIndex * screenWidth * ITEM_GAP_RATIO;
          const isActive = deltaIndex === 0;
          return <PhotoSwipeItem key={`${item.id}-${item.renderKey}`} swipingTranslateX={itemTranslateX} item={item} isActive={isActive} />;
        })}
      </div>
    </>
  );
};

export default memo(PhotoSwipeContent);
