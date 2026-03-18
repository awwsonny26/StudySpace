const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav a');
const contactForm = document.querySelector('.contact-form');

if (burger && nav) {
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      nav.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Дякуємо! Вашу заявку успішно надіслано.');
    contactForm.reset();
  });
}
