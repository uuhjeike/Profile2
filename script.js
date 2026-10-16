(() => {
  'use strict';
  const FILE = 'Profiles.txt';
  const grid = document.getElementById('profiles');
  const search = document.getElementById('search');
  const clearButton = document.getElementById('clear-search');
  const count = document.getElementById('count');
  const status = document.getElementById('status');
  const empty = document.getElementById('empty');
  const error = document.getElementById('error');
  const retry = document.getElementById('retry');
  let profiles = [];
  let loadVersion = 0;

  // Accepts raw.githubusercontent.com, GitHub /blob/ links, ordinary image/video URLs,
  // and regular website URLs. Only media URLs are normalized as media.
  function normalizeMediaUrl(input) {
    const value = input.trim();
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      if ((url.hostname === 'github.com' || url.hostname === 'www.github.com') && url.pathname.includes('/blob/')) {
        const parts = url.pathname.split('/').filter(Boolean);
        const blobIndex = parts.indexOf('blob');
        if (parts.length >= blobIndex + 3 && blobIndex >= 2) {
          const owner = parts[0];
          const repo = parts[1];
          const branch = parts[blobIndex + 1];
          const filePath = parts.slice(blobIndex + 2).join('/');
          return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}${url.search}`;
        }
      }
      // Keep other URL types untouched, including non-GitHub hosts and direct media links.
      return url.href;
    } catch (_) {
      return value;
    }
  }

  function isVideoUrl(value) {
    try {
      const pathname = new URL(value, window.location.href).pathname.toLowerCase();
      return /\.(mp4|webm|ogg|mov|m4v)$/.test(pathname);
    } catch (_) {
      return /\.(mp4|webm|ogg|mov|m4v)(?:[?#].*)?$/i.test(value);
    }
  }

  function parseProfiles(raw) {
    // Each record: separator line, name, media URL, profile URL. Blank lines are ignored.
    // A separator must be a line containing only a dollar sign; a UTF-8 BOM is tolerated.
    const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trim());
    const records = [];
    let block = [];
    const flush = () => {
      const values = block.filter(Boolean);
      if (values.length >= 3) {
        records.push({ name: values[0], media: values[1], href: values[2] });
      }
      block = [];
    };
    for (const line of lines) {
      if (line === '$') {
        flush();
      } else if (line) {
        block.push(line);
      }
    }
    flush();
    // Deduplicate only exact repeated triples, preserving order and legitimate same-name profiles.
    const seen = new Set();
    return records.filter(item => {
      const key = `${item.name}\n${item.media}\n${item.href}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function safeProfileHref(value) {
    try {
      const url = new URL(value, window.location.href);
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    } catch (_) {}
    return '#';
  }

  function createCard(profile, index) {
    const link = document.createElement('a');
    link.className = 'profile-card';
    link.href = safeProfileHref(profile.href);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Open ${profile.name} profile in a new tab`);

    const mediaUrl = normalizeMediaUrl(profile.media);
    let media;
    if (mediaUrl && isVideoUrl(mediaUrl)) {
      media = document.createElement('video');
      media.className = 'avatar';
      media.src = mediaUrl;
      media.autoplay = true;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = 'metadata';
      media.setAttribute('aria-label', `${profile.name} profile video`);
      media.addEventListener('error', () => replaceWithFallback(media, profile.name), { once: true });
    } else {
      media = document.createElement('img');
      media.className = 'avatar';
      media.src = mediaUrl;
      media.alt = `${profile.name} profile image`;
      media.loading = index < 8 ? 'eager' : 'lazy';
      media.decoding = 'async';
      media.referrerPolicy = 'no-referrer';
      media.addEventListener('error', () => replaceWithFallback(media, profile.name), { once: true });
    }

    const copy = document.createElement('div');
    copy.className = 'profile-copy';
    const title = document.createElement('h2');
    title.className = 'profile-name';
    title.textContent = profile.name;
    const label = document.createElement('p');
    label.className = 'profile-label';
    label.textContent = 'Open profile ↗';
    copy.append(title, label);
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(media, copy, arrow);
    return link;
  }

  function replaceWithFallback(media, name) {
    if (!media || !media.parentNode) return;
    const fallback = document.createElement('div');
    fallback.className = 'avatar avatar-fallback';
    fallback.setAttribute('aria-label', `No media available for ${name}`);
    fallback.textContent = (name.trim()[0] || '?').toUpperCase();
    media.replaceWith(fallback);
  }

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = profiles.filter(profile => profile.name.toLocaleLowerCase().includes(query));
    const fragment = document.createDocumentFragment();
    visible.forEach((profile, index) => fragment.appendChild(createCard(profile, index)));
    grid.replaceChildren(fragment);
    count.textContent = `${profiles.length} profile${profiles.length === 1 ? '' : 's'}`;
    status.textContent = query ? `${visible.length} match${visible.length === 1 ? '' : 'es'}` : 'Select a profile to visit its page';
    empty.hidden = visible.length !== 0;
    grid.hidden = visible.length === 0;
    clearButton.hidden = search.value.length === 0;
  }

  async function loadProfiles() {
    const version = ++loadVersion;
    error.hidden = true;
    empty.hidden = true;
    grid.hidden = true;
    status.textContent = 'Loading profile list…';
    try {
      const response = await fetch(`${FILE}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.text();
      if (version !== loadVersion) return;
      profiles = parseProfiles(raw);
      if (!profiles.length) {
        grid.replaceChildren();
        grid.hidden = true;
        empty.hidden = false;
        empty.querySelector('h2').textContent = 'No profiles found';
        empty.querySelector('p').textContent = 'Add entries to Profiles.txt using the documented three-line format.';
        count.textContent = '0 profiles';
        status.textContent = 'The list loaded, but no complete entries were found.';
        return;
      }
      render();
      grid.hidden = false;
    } catch (err) {
      if (version !== loadVersion) return;
      console.error('Profile list loading failed:', err);
      count.textContent = 'Profiles unavailable';
      status.textContent = 'The list could not be loaded.';
      error.hidden = false;
    }
  }

  search.addEventListener('input', render);
  clearButton.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  retry.addEventListener('click', loadProfiles);
  loadProfiles();
})();
