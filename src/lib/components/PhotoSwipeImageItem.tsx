import { memo, useCallback, useRef, useEffect, useState, useLayoutEffect, useMemo, SyntheticEvent } from "react";
import { EventBus, getClassNames } from "../helpers";
import { usePhotoSwipeContentSize, useWindowSize } from "../hooks";
import type { PhotoSwipeItemProps } from "./PhotoSwipeItem";
import { SET_HEADER_ZOOMING_STATUS, TOGGLE_PS_ZOOMING } from "../constants";
import { ZoomingStatus } from "../enums";
import { debounce } from "@mui/material";

type PhotoSwipeImageItemProps = PhotoSwipeItemProps & {};

type Translate2D = { x: number; y: number };
type ImgSize = { width: number; height: number };
type MousePosition = { x: number; y: number };

const TRANSLATE_2D_DEFAULT_VALUE: Translate2D = { x: 0, y: 0 };

const PhotoSwipeImageItem = ({ item, swipingTranslateX, isActive }: PhotoSwipeImageItemProps) => {
  const itemRef = useRef<any>(null);

  const [isImageLoaded, setImageLoaded] = useState(false);
  const [enableZooming, setEnableZooming] = useState(true);
  const [isZooming, setZooming] = useState(false);
  const [imgNaturalSize, setImgNaturalSize] = useState<ImgSize>({ width: 0, height: 0 });
  const [imgRenderedSize, setImgRenderedSize] = useState<ImgSize | { width: "100%"; height: "100%" }>({
    width: "100%",
    height: "100%",
  });
  const [zoomingTranslate, setZoomingTranslate] = useState<Translate2D>(TRANSLATE_2D_DEFAULT_VALUE);
  const zoomingPositionRef = useRef<Translate2D>(TRANSLATE_2D_DEFAULT_VALUE);
  const mouseDownPositionRef = useRef<MousePosition | null>(null);
  const [isPanning, setPanning] = useState(false);
  const [isWheeling, setWheeling] = useState(false);

  const { width: containerWidth, height: containerHeight } = usePhotoSwipeContentSize();
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (imgNaturalSize.height > 0 && imgNaturalSize.width > 0) {
      timeout = setTimeout(() => {
        setImageLoaded(true);
      }, 300);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [imgNaturalSize]);

  const resetZoomingStates = useCallback(() => {
    setZooming(false);
    setZoomingTranslate(TRANSLATE_2D_DEFAULT_VALUE);
    setPanning(false);
    setWheeling(false);
    zoomingPositionRef.current = TRANSLATE_2D_DEFAULT_VALUE;
    mouseDownPositionRef.current = null;
  }, []);

  const toggleZooming = useCallback(() => {
    if (isZooming) {
      resetZoomingStates();
    } else {
      setZooming(true);
    }
  }, [isZooming, resetZoomingStates]);

  useEffect(() => {
    // Allow toggle zooming current item from header
    if (isActive) {
      EventBus.on(TOGGLE_PS_ZOOMING, toggleZooming);
    }
    return () => {
      EventBus.off(TOGGLE_PS_ZOOMING, toggleZooming);
    };
  }, [isActive, toggleZooming]);

  useEffect(() => {
    if (!isActive) return;
    if (!enableZooming) {
      EventBus.dispatch(SET_HEADER_ZOOMING_STATUS, ZoomingStatus.DISABLED);
    } else {
      EventBus.dispatch(SET_HEADER_ZOOMING_STATUS, isZooming ? ZoomingStatus.IN : ZoomingStatus.OUT);
    }
  }, [isZooming, enableZooming, isActive]);

  useLayoutEffect(() => {
    const { width: itemWidth, height: itemHeight } = imgNaturalSize;
    if (itemWidth < containerWidth && itemHeight < containerHeight) {
      setEnableZooming(false);
      resetZoomingStates();
      setImgRenderedSize({ width: itemWidth, height: itemHeight });
      return;
    } else {
      setEnableZooming(true);
    }

    if (isZooming) {
      setImgRenderedSize({ width: itemWidth, height: itemHeight });
      return;
    }

    const containerRatio = containerWidth / containerHeight;
    const itemRatio = itemWidth / itemHeight;

    if (itemRatio > containerRatio) {
      setImgRenderedSize({ width: containerWidth, height: containerWidth / itemRatio });
    } else {
      setImgRenderedSize({ height: containerHeight, width: containerHeight * itemRatio });
    }
  }, [containerHeight, containerWidth, imgNaturalSize, isZooming, resetZoomingStates]);

  useEffect(() => {
    if (!isActive && isZooming) {
      // When navigating while zooming
      resetZoomingStates();
    }
  }, [resetZoomingStates, isActive, isZooming]);

  // Make sure user can only pan to the edge of current item (cannot pan further when item edge meets container edge)
  const getEdgePanningProtectedZoomingTranslate = useCallback(
    (nextZoomingTranslate: Translate2D) => {
      const { width, height } = imgNaturalSize;
      const maxTranslateX = Math.max((width - containerWidth) / 2, 0);
      const maxTranslateY = Math.max((height - containerHeight) / 2, 0);

      if (nextZoomingTranslate.x > maxTranslateX) {
        nextZoomingTranslate.x = maxTranslateX;
      } else if (nextZoomingTranslate.x < -maxTranslateX) {
        nextZoomingTranslate.x = -maxTranslateX;
      }

      if (nextZoomingTranslate.y > maxTranslateY) {
        nextZoomingTranslate.y = maxTranslateY;
      } else if (nextZoomingTranslate.y < -maxTranslateY) {
        nextZoomingTranslate.y = -maxTranslateY;
      }

      return nextZoomingTranslate;
    },
    [containerHeight, containerWidth, imgNaturalSize]
  );

  useLayoutEffect(() => {
    // When user stops panning
    if (isZooming && !isPanning) {
      // Make sure user can only pan to the edge of current item (cannot pan further when item edge meets container edge)
      const nextZoomingTranslate = getEdgePanningProtectedZoomingTranslate({
        x: zoomingTranslate.x,
        y: zoomingTranslate.y,
      });

      if (nextZoomingTranslate.x !== zoomingTranslate.x || nextZoomingTranslate.y !== zoomingTranslate.y) {
        setZoomingTranslate(nextZoomingTranslate);
      }
    }
  }, [getEdgePanningProtectedZoomingTranslate, isPanning, isZooming, zoomingTranslate.x, zoomingTranslate.y]);

  const startWheeling = useCallback(() => {
    setPanning(true);
    setWheeling(true);
  }, []);

  const stopWheelingDebounce = useMemo(
    () =>
      debounce(() => {
        setPanning(false);
        setWheeling(false);
      }, 300),
    []
  );

  const handleMouseWheel: React.WheelEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!isZooming) return;

      // Handle wheel events when zooming
      startWheeling();
      const { deltaX, deltaY } = e;
      const nextZoomingTranslate = getEdgePanningProtectedZoomingTranslate({
        x: zoomingTranslate.x - deltaX,
        y: zoomingTranslate.y - deltaY,
      });

      if (nextZoomingTranslate.x !== zoomingTranslate.x || nextZoomingTranslate.y !== zoomingTranslate.y) {
        setZoomingTranslate(nextZoomingTranslate);
      }

      stopWheelingDebounce();
    },
    [getEdgePanningProtectedZoomingTranslate, isZooming, startWheeling, stopWheelingDebounce, zoomingTranslate.x, zoomingTranslate.y]
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const nextZoomingTranslate = {
      x: e.clientX - zoomingPositionRef.current.x,
      y: e.clientY - zoomingPositionRef.current.y,
    };
    setZoomingTranslate(nextZoomingTranslate);
    setPanning(true);
  }, []);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const target = e.target as HTMLElement;

      //#region ZOOM IN
      if (!isZooming && swipingTranslateX === 0) {
        // Zooming in should be available only when the user move the mouse in the image area
        if (!target.classList.contains(getClassNames("image-wrapper"))) return;

        // Not zooming + not swiping + mouse up => zoom in
        enableZooming && setZooming(true);

        const itemClientWidth: number = itemRef.current.clientWidth;
        const itemClientHeight: number = itemRef.current.clientHeight;

        const { width, height } = imgNaturalSize;

        const scale = Math.max(width / itemClientWidth, height / itemClientHeight);
        /*
          (windowWidth / 2 - e.clientX) is x-distance from the container center (1)
          (windowHeight / 2 - e.clientY) is the y-distance from the container center (1)
          (windowWidth / 2 - e.clientX) * scale is x-distance from the zoomed image center (2)
          (windowHeight / 2 - e.clientY) * scale is the y-distance from the zoomed image center (2)
          Subtract the distance (2) by the distance (1) => zooming translate
        */
        const nextZoomingTranslate = getEdgePanningProtectedZoomingTranslate({
          x: (windowWidth / 2 - e.clientX) * (scale - 1),
          y: (windowHeight / 2 - e.clientY) * (scale - 1),
        });

        setZoomingTranslate(nextZoomingTranslate);
        return;
      }
      //#endregion ZOOM IN

      //#region ZOOM OUT
      if (!mouseDownPositionRef.current) {
        return;
      }

      if (e.clientX - mouseDownPositionRef.current.x === 0 && e.clientY - mouseDownPositionRef.current.y === 0) {
        // Mouse up position === mouse down position => zoom out

        // Zooming out should be available only when the user move the mouse in the image area
        if (target.classList.contains(getClassNames("image-wrapper"))) {
          resetZoomingStates();
          return;
        }
      }
      //#endregion ZOOM OUT

      //#region STOP PANNING
      setPanning(false);
      //#endregion STOP PANNING
    },
    [
      enableZooming,
      getEdgePanningProtectedZoomingTranslate,
      handleMouseMove,
      imgNaturalSize,
      isZooming,
      resetZoomingStates,
      swipingTranslateX,
      windowHeight,
      windowWidth,
    ]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      window.addEventListener("mouseup", handleMouseUp);
      if (isZooming) {
        e.stopPropagation();
        window.addEventListener("mousemove", handleMouseMove);
        mouseDownPositionRef.current = { x: e.clientX, y: e.clientY };
        zoomingPositionRef.current = { x: e.clientX - zoomingTranslate.x, y: e.clientY - zoomingTranslate.y };
      }
    },
    [handleMouseMove, handleMouseUp, isZooming, zoomingTranslate.x, zoomingTranslate.y]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const onImgLoad = useCallback((imageUrl: string) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImgNaturalSize({
        height: img.height,
        width: img.width,
      });
    };
    img.onerror = (err) => {
      console.log("Unexpected error when loading image");
      console.error(err);
    };
  }, []);

  useLayoutEffect(() => {
    if (!item.src) return;
    onImgLoad(item.src);
  }, [item.src, onImgLoad]);

  const imageProps = useMemo(() => {
    const { src } = item;
    const { width, height } = imgRenderedSize;
    const { x, y } = zoomingTranslate;
    return {
      src,
      style: {
        width,
        height,
        transform: `translate(${x}px, ${y}px)`,
      },
    };
  }, [imgRenderedSize, item, zoomingTranslate]);

  if (isActive) {
    return (
      <div
        className={getClassNames(
          "item",
          `${isActive ? "item-active" : ""}`,
          `${enableZooming ? (isZooming ? "item-zooming-in" : "item-zooming-out") : ""}`,
          `${isPanning ? "item-panning" : "item-panning-released"}`,
          `${isWheeling ? "item-wheeling" : ""}`,
          `${isImageLoaded ? "item-loaded" : ""}`
        )}
        style={{ transform: `translateX(${swipingTranslateX}px)` }}
        onMouseDown={isImageLoaded ? handleMouseDown : undefined}
        onWheel={isImageLoaded ? handleMouseWheel : undefined}
        onContextMenu={(e) => {
          e.preventDefault(); // disable right click
        }}
      >
        <div className={getClassNames("image-wrapper")}>
          <img ref={itemRef} {...imageProps} alt="" />
        </div>
      </div>
    );
  }

  return (
    <div className={getClassNames("item")} style={{ transform: `translateX(${swipingTranslateX}px)` }}>
      <div className={getClassNames("image-wrapper")}>
        <img ref={itemRef} {...imageProps} alt="" />
      </div>
    </div>
  );
};

export default memo(PhotoSwipeImageItem);
