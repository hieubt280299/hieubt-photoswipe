import { useContext } from "react";
import { PhotoSwipeContext } from "../components/PhotoSwipe";

export const usePhotoSwipeContext = () => {
  const context = useContext(PhotoSwipeContext);
  if (!context) {
    throw new Error("No context found");
  }
  return context;
};
