# maptext

***This project is currently only minimally functional***

## Installation

```
npm i maptext
```

## Immediate to-dos

1. **Testing** (Some quirks with buttons not going through until after
    some clicks)
    1. Finish testing option to
        **highlight copy-pasted blocks as mouse goes through them**
    1. Allow **highlighted text search** (optionally overriding browser
        find) with highlight of image regions (single or multiple select)
1. **View map**
      1. Ensure highlighted text search **works with zoom**
1. **Access control** middleware
  1. Ensure user config and .git don't show up when serving static files
  1. Let access level (with URL params--see below) determine what
      panels are shown
1. Allow **URL params to designate map info to pre-load**
1. **Find across multiple files**, with the highlighted
      results showing the word regions only (with
      ability to click to enlarge for full image)
1. Allow the **find feature to scroll the result into view**
1. As per <https://stackoverflow.com/a/36440879/271577> (which outlines usage
    as `tesseract syllabus-page1.jpg syllabus-page1 hocr`), we should be able
    to **prepopulate words and locations based on `tesseract`** which has a
    [Node wrapper](https://github.com/desmondmorris/node-tesseract) or this
    [Promise-based one](https://github.com/zapolnoch/node-tesseract-ocr). This
    should be a huge time-saver, if we can parse and figure out from the
    coordinates in the generated HTML file how to best place the rectangles
    around the word.

## Medium priority to-dos

1. **Saving copy of image** (as Data URL?); needed for offline
1. Ability to **upload image**
1. **Demo with RTL and Chinese text**, adding special
    handling/options if necessary
1. Allow **scroll to extend selection**
1. Allow **citation format** for text selection, e.g., pars. 5-10 and
    fully representative canonical form (including ellipses)
    1. (Also begin related [dom-on-the-range](http://github.com/brettz9/dom-on-the-range)
      work on **text range selector** (for coordinates and
        highlighting text; but out-of-scope-for-this-project) to
        allow conversion to canonical ranges.)
1. Show **preview of image next to coordinates** and/or on image
    preview (so load preview as soon as URL entered)
1. Allow **saving from HTML**
    1. Local storage (including asking for names?) / IndexedDB (service
        worker intercepting json-server requests)
    1. Downloadable JSON file?

## Lower priority to-dos

1. Add more **testcafe** tests
1. Add **CLI** for generating
1. Allow for **multiple image maps**?
1. **OCR.js**-type options for auto-populating text fields
1. **Reading and writing** from/to database and/or
    local Webappfind openable file
