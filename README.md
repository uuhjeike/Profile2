# Alpha Profile List — Ultimate Edition

A lightweight, mobile-first profile directory powered by `Profiles.txt`.

## Files
- `index.html` — minimal page structure
- `style.css` — black, red, and purple styling with circular profile media
- `script.js` — profile parsing, search, URL handling, and image/video support
- `Profiles.txt` — profile data

## Add or edit profiles
Each profile entry uses a line containing only `$`, followed by three lines: profile name, media URL, and profile page URL. End the entry with another `$` line.

```text
$
Example Profile
https://github.com/owner/repository/blob/main/photo.jpg
https://owner.github.io/repository/
$
```

Media URLs can be direct raw GitHub links or regular GitHub `/blob/` links. `/blob/` links are automatically converted to raw media links for profile photos/videos. Image formats such as PNG, JPG, JPEG, GIF, WebP, and supported video URLs work when publicly accessible. Video avatars are muted, looping, and inline.

Upload all files to the same repository folder and enable GitHub Pages. `Profiles.txt` must sit beside `index.html`. The search control is a small icon at the top-right and expands when tapped. Profile images are displayed in circular frames.
