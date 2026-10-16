# Alpha Profile List

A lightweight, responsive profile directory powered entirely by `Profiles.txt`.

## Files

- `index.html` — page structure
- `style.css` — responsive dark cyber-luxury styling
- `script.js` — text parser, search, link handling, image/video rendering
- `Profiles.txt` — profile data; edit this file to add, remove, or update profiles

## Add or edit a profile

Each entry contains a separator line, then exactly three non-empty lines:

1. Profile name
2. Profile media URL (image or video)
3. Profile page URL

Finish each entry with another separator line. The separator is a single `$` character on its own line. Keep each field on its own line. Blank lines are allowed.

Example:

```text
$
Example Profile
https://github.com/owner/repository/blob/main/photo.jpg
https://owner.github.io/repository/
$
```

## Link compatibility

- Direct raw GitHub media URLs are supported.
- Normal GitHub file links containing `/blob/` are automatically converted to raw media URLs when used in the media field.
- Ordinary direct image URLs and video URLs are supported.
- Profile page URLs are opened as links and are not converted.
- Common video file extensions such as MP4, WebM, OGG, MOV, and M4V are displayed as muted, looping inline videos.

## Publish on GitHub Pages

Upload all four files to the same folder/repository and enable GitHub Pages. `Profiles.txt` must be in the same directory as `index.html`. The page needs to be served over HTTP/HTTPS; opening `index.html` directly as a local file may prevent the browser from fetching `Profiles.txt`.

If an image URL is private, unavailable, or points to a page that blocks direct media access, the card shows a fallback initial. The site cannot make private or inaccessible media public.
