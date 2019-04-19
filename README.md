# maptext

***This project is not yet functional***

## Installation

```
npm i maptext
```

## Immediate to-dos

0. Figure out why **shape disappears** after repositioning updates views;
    why is **serializedHTML not updating** as before when form/JSON changed?

0. **View map**
0. **Zooming**

1. Allow **highlighted text search** (optionally overriding browser
    find) with highlight of image regions (single or multiple select)
2. Allow (click/drag) image highlighting of region(s)
    for **copy-paste** and/or display of text

## Medium priority to-dos

1. **Demo with RTL and Chinese text**, adding special
    handling/options if necessary
1. Allow **citation format** for text selection, e.g., pars. 5-10 and
    fully representative canonical form (including ellipses)
    1. (Also begin related [dom-on-the-range](http://github.com/brettz9/dom-on-the-range)
      work on **text range selector** (for coordinates and
        highlighting text; but out-of-scope-for-this-project) to
        allow conversion to canonical ranges.)
1. Show **preview of image next to coordinates** and/or on image
    preview (so load preview as soon as URL entered)

## Lower priority to-dos

1. Allow **saving from HTML**
    1. Local storage (including asking for names?)
    2. Downloadable JSON file?
2. Add more **testcafe** tests
3. Add **CLI** for generating
4. Allow for **multiple image maps**?
5. **OCR.js**-type options for auto-populating text fields
