import { useState, useLayoutEffect } from "react";
import { useWindowSize } from "./";

interface PSContentSize {
  width: number;
  height: number;
}

// top: height of header, bottom: height of footer
const VERTICAL_GAP = { top: 44, bottom: 44 };

const HORIZONTAL_GAP = { left: 0, right: 0 };

export function usePhotoSwipeContentSize(): PSContentSize {
  const windowSize = useWindowSize();
  const [psContentSize, setPsContentSize] = useState({
    width: windowSize.width - (HORIZONTAL_GAP.left + HORIZONTAL_GAP.right),
    height: windowSize.height - (VERTICAL_GAP.top + VERTICAL_GAP.bottom),
  });

  useLayoutEffect(() => {
    setPsContentSize({
      width: windowSize.width - (HORIZONTAL_GAP.left + HORIZONTAL_GAP.right),
      height: windowSize.height - (VERTICAL_GAP.top + VERTICAL_GAP.bottom),
    });
  }, [windowSize.height, windowSize.width]);

  return psContentSize;
}
