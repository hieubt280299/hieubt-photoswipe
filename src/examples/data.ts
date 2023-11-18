export const simpleData = Array.from(Array(5).keys()).map((num) => {
  const randomWidth = Math.round(Math.random() * 1200 + 800 + num * 100);
  const randomHeight = Math.round(Math.random() * 900 + 600 + num * 100);

  return {
    id: `ex-imagetest${num}`,
    src: `https://placehold.co/${randomWidth}x${randomHeight}?text=Test+Image+${num}\\n${randomWidth}x${randomHeight}`,
    fileName: `imagetest${num}`,
    isVideoFile: false,
  };
});

export const simpleData2 = Array.from(Array(5).keys()).map((num) => {
  const randomWidth = Math.round(Math.random() * 700 + 700 + num * 100);
  const randomHeight = Math.round(Math.random() * 600 + 400 + num * 100);

  return {
    id: `ex2-imagetest${num}`,
    src: `https://placehold.co/${randomWidth}x${randomHeight}?text=Test+Image+${num}\\n${randomWidth}x${randomHeight}`,
    fileName: `imagetest${num}`,
    isVideoFile: false,
  };
});
