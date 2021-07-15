# maptext

***This project is currently only minimally functional***

MapText allows annotating images of text (e.g., of historical documents,
calligraphy, etc.) with text that can be copied out (as in copy-paste) while
viewing the image and which can be searched for text so as to display the
relevant portion(s) of the original document.

It is similar to PDFs whose text can be copied out or searched, but MapText
seeks to provide a ready means for providing such documents in a way whereby
a location can be bookmarked and shared so as to bring others online to the
same point in the document by URL, along with the text highlighted, the
search results shown, etc.

## Installation

```
npm i maptext
```

## Immediate to-dos

1. **Access control** middleware
    1. Let access level (with URL params--see below) determine what
        panels are shown (hide all but view from unlogged-in)
1. **URL params**
    1. Allow **URL params to designate map info to pre-load**
        1. Could try changing components to SFC-style
    1. **Highlight specific block(s)** based on URL
1. **Pages**
    1. **View map** (with find and copy-paste)
        1. Ensure highlighted text search **works with zoom**
        1. Find-all changes view entry to add query param to open to specific
            location(s) within file and highlighting them
    1. **Main page**
        1. **List image files** in overflow area
        1. **Find across multiple files**, with the highlighted
            results showing the word regions only (with
            ability to click to enlarge for full image)
            1. Allow the **find feature to scroll the result into view**
            1. Allow **highlighted text search** (optionally overriding browser
                find) with highlight of image regions (single or multiple
                select)
1. **Demo with RTL and Chinese/Korean text**, adding special
    handling/options if necessary
1. **Bugs**
    1. **Highlight copy-pasted blocks as mouse goes through them** should
        de-highlight when moved off
    1. **Sticky rectangles** staying together sometimes?
    1. **Buttons not working immediately**?
    1. **Duplicate rectangles** sometimes being created with
        **duplicate textboxes**
    1. **Can't highlight indefinitely vertically** without guides disappearing
1. Add more **Cypress** tests

## Medium priority to-dos

1. Ability to **upload image**
    1. **Saving copy of image** (as Data URL?); needed for offline
1. Show **preview of image next to coordinates** and/or on image
    preview (so load preview as soon as URL entered)
1. URL param to **scroll to specific coordinates within long image** (and use
    within search)

## Lower priority to-dos

1. **OCR.js**-type options for auto-populating (more easily recognized) text
    fields
    1. Tesseract has option to get coordinates. As per
        <https://stackoverflow.com/a/36440879/271577> (which outlines usage
        as `tesseract syllabus-page1.jpg syllabus-page1 hocr`), we should be
        able to **prepopulate words and locations based on `tesseract`** which
        has a [Node wrapper](https://github.com/desmondmorris/node-tesseract)
        or this [Promise-based one](https://github.com/zapolnoch/node-tesseract-ocr).
        This should be a huge time-saver, if we can parse and figure out from
        the coordinates in the generated HTML file how to best place the
        rectangles around the word.
1. Allow **saving from HTML**
    1. Local storage (including asking for names?) / IndexedDB (service
        worker intercepting json-server requests)
    1. Downloadable JSON file?
1. Allow **citation format** for text selection, e.g., pars. 5-10 and
    fully representative canonical form (including ellipses)
    1. (Also begin related [dom-on-the-range](http://github.com/brettz9/dom-on-the-range)
        work on **text range selector** (for coordinates and
        highlighting text; but out-of-scope-for-this-project) to
        allow conversion to canonical ranges.)
1. Allow for **multiple image map layers** (e.g., English and Arabic)
1. **Reading and writing** from/to database and/or local Webappfind
    openable file
1. Add **CLI** for generating
