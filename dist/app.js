const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('is-open', !expanded);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, focus = false) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  }
  document.dispatchEvent(new CustomEvent('expertisechange', { detail: tab.id }));
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      activateTab(tabs[next], true);
    }
  });
});

const photoButtons = [...document.querySelectorAll('[data-photo]')];
const dialog = document.querySelector('.photo-dialog');
const dialogImage = document.querySelector('.lightbox-image');
const dialogCaption = document.getElementById('lightbox-caption');
let photoIndex = 0;
let originatingPhoto;
function showPhoto(index) {
  photoIndex = (index + photoButtons.length) % photoButtons.length;
  const photo = photoButtons[photoIndex];
  dialogImage.src = photo.dataset.photo;
  dialogImage.alt = photo.querySelector('img').alt;
  dialogCaption.textContent = photo.dataset.caption;
  document.querySelector('.lightbox-count').textContent = `${photoIndex + 1} / ${photoButtons.length}`;
}
photoButtons.forEach((photo, index) => photo.addEventListener('click', () => {
  originatingPhoto = photo;
  showPhoto(index);
  dialog.showModal();
  document.body.classList.add('modal-open');
}));
document.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
document.querySelector('.photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
document.querySelector('.photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  originatingPhoto?.focus({ preventScroll: true });
});

const emailButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('#copy-status');
let statusTimeout;
emailButton.addEventListener('click', async () => {
  const email = 'mrnipunkakkar@gmail.com';
  let copied = false;
  try {
    await navigator.clipboard.writeText(email);
    copied = true;
  } catch {
    const field = document.createElement('textarea');
    field.value = email;
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    copied = document.execCommand('copy');
    field.remove();
    emailButton.focus({ preventScroll: true });
  }
  copyStatus.textContent = copied ? 'Email address copied.' : 'Select the email address to copy it.';
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => { copyStatus.textContent = ''; }, 4000);
});
document.getElementById('year').textContent = new Date().getFullYear();
