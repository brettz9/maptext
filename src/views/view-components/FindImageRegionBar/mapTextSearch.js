export const getBeginAndEndIndexes = ({formObjectInfo, value, isFirstMode}) => {
  const segmentIndexes = [];
  let text = '';
  formObjectInfo.some(({shape, alt, coords}, i) => {
    segmentIndexes.push(text.length);
    text += alt + ' ';
    // Shortcut if only need the first match and we already match
    return isFirstMode && text.includes(value);
  });
  // text = text.slice(0, -1);
  const foundBeginStringIndex = text.indexOf(value);
  if (foundBeginStringIndex === -1) {
    // NOT FOUND
    return [];
  }

  let tooFar = false;
  let beginSegmentIndexIndex = segmentIndexes.findIndex(
    (segmentIndex, i) => {
      tooFar = segmentIndex > foundBeginStringIndex;
      return tooFar || segmentIndex === foundBeginStringIndex;
    }
  );

  let endSegmentIndexIndex = 0;
  if (beginSegmentIndexIndex === -1) {
    // Begins somewhere after beginning of last segment
    beginSegmentIndexIndex = segmentIndexes.length - 1;
    endSegmentIndexIndex = beginSegmentIndexIndex;
  } else if (tooFar) {
    // Begins somewhere before beginning of found segment
    beginSegmentIndexIndex--;
  }

  // If haven't found ending yet, calculate the end
  if (!endSegmentIndexIndex) {
    const endIndex = foundBeginStringIndex + value.length;
    endSegmentIndexIndex = segmentIndexes.slice(
      beginSegmentIndexIndex
    ).findIndex((segmentIndex) => {
      return segmentIndex >= endIndex;
    });
    if (endSegmentIndexIndex === -1) {
      // Ending must be after the beginning of the last segment
      endSegmentIndexIndex = segmentIndexes.length - 1;
    } else {
      // We sliced this off for efficiency, so need to add back
      endSegmentIndexIndex += beginSegmentIndexIndex - 1;
    }
  }
  return [beginSegmentIndexIndex, endSegmentIndexIndex];
};
