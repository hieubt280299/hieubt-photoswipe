import React, { useCallback, useMemo, useState } from "react";
import "./Examples.scss";
import PhotoSwipe from "../lib";
import { simpleData, simpleData2 } from "./data";

// Placeholder images with different width and height - for testing purposes only

const ExampleGrid = ({ onImageClick, currentItem }: any) => {
  const items = simpleData;
  return (
    <div className="example-grid">
      {items.map((item) => (
        <div
          className="image-wrapper"
          key={item.id}
          style={currentItem.id === item.id ? { border: "1px solid red" } : undefined}
          onClick={() => {
            onImageClick({ items, activeItemId: item.id });
          }}
        >
          <img
            src={item.src}
            alt={item.fileName}
            style={{
              maxWidth: "100%",
            }}
          />
        </div>
      ))}
    </div>
  );
};

const Example2Grid = ({ onClick, onItemDoubleClick, currentItem }: any) => {
  const items = simpleData2;

  return (
    <div className="example-grid">
      {items.map((item) => {
        const isSelected = currentItem.id === item.id;
        const { fileName, id } = item;
        return (
          <div
            className="image-wrapper"
            key={item.id}
            style={isSelected ? { border: "1px solid red" } : undefined}
            onClick={() => onClick(item)}
            onDoubleClick={onItemDoubleClick}
          >
            <img
              className={`example-img ${isSelected ? "selected" : ""}`}
              src={item.src}
              alt={item.fileName}
              style={{
                maxWidth: "100%",
              }}
              data-file-name={fileName}
              data-media-type-id="1"
              data-id={id}
            />
          </div>
        );
      })}
    </div>
  );
};

function Examples() {
  const psRef = React.useRef<any>();
  const containerEl = React.useRef<any>();
  const [currentItem, setCurrentItem] = useState<any>("");

  const onOpen = useCallback(() => {
    console.log("onOpen!!!");
  }, []);

  const onClose = useCallback(() => {
    console.log("onClose!!!");
  }, []);

  const onAfterChange = useCallback((currItem: any) => {
    console.log("onAfterChange", currItem);
    setCurrentItem(currItem);
  }, []);

  const events = useMemo(() => ({ onOpen, onClose, onAfterChange }), [onAfterChange, onClose, onOpen]);

  const onItemDoubleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!containerEl.current) {
      return;
    }
    psRef.current?.handleOpen({
      imageClassName: "example-img",
      parentEl: containerEl.current,
      events,
      imageSelectedClassName: "selected",
    });
  };

  return (
    <div className="example">
      <p>Example 1: Open by passing items (click to open PhotoSwipe)</p>
      <br />
      <ExampleGrid
        currentItem={currentItem}
        onImageClick={(data: any) => {
          psRef.current?.handleOpen({ ...data, events });
        }}
      />
      <br />
      <hr />
      <br />
      <p>Example 2: Open by passing className (double click to open PhotoSwipe)</p>
      <br />
      <div className="dummy-data" ref={containerEl}>
        <Example2Grid currentItem={currentItem} onClick={(item: any) => setCurrentItem(item)} onItemDoubleClick={onItemDoubleClick} />
      </div>
      <PhotoSwipe ref={psRef} />
    </div>
  );
}

export default Examples;
