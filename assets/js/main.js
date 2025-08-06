



// Animate hero fade-in

// --- About Page: Contact Form Validation ---
window.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const formMessage = document.getElementById('formMessage');
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      let error = '';
      if (!name) error = 'Please enter your name.';
      else if (!/^[A-Za-z0-9 .,'-]{2,}$/.test(name)) error = 'Please enter a valid name.';
      else if (!email) error = 'Please enter your email.';
      else if (!/^\S+@\S+\.\S+$/.test(email)) error = 'Please enter a valid email.';
      else if (!message || message.length < 5) error = 'Please enter a message (at least 5 characters).';
      if (error) {
        formMessage.textContent = error;
        formMessage.style.color = '#e53e3e';
        formMessage.classList.remove('form-success');
        formMessage.classList.add('form-error');
      } else {
        formMessage.textContent = 'Message sent! (Demo only — no backend)';
        formMessage.style.color = '#38a169';
        formMessage.classList.remove('form-error');
        formMessage.classList.add('form-success');
        contactForm.reset();
      }
      formMessage.style.opacity = 0;
      setTimeout(() => { formMessage.style.opacity = 1; }, 100);
      setTimeout(() => { formMessage.style.opacity = 0; }, 3200);
    });
  }
});
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.hero').classList.add('fade-in');

  // --- Daily Motivational Quotes ---
  const quotes = [
    { text: '“You are capable of amazing things.”', author: '— Unknown' },
    { text: '“Small steps every day.”', author: '— Anonymous' },
    { text: '“Dream big. Start now.”', author: '— TeenPlanner' },
    { text: '“Progress, not perfection.”', author: '— Unknown' },
    { text: '“Your future is created by what you do today.”', author: '— Mahatma Gandhi' },
    { text: '“You got this!”', author: '— TeenPlanner' },
    { text: '“Stay positive, work hard, make it happen.”', author: '— Unknown' }
  ];
  const quoteCard = document.getElementById('quoteCard');
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  // Use day of year for rotating quote
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const q = quotes[dayOfYear % quotes.length];
  quoteText.textContent = q.text;
  quoteAuthor.textContent = q.author;

  // --- Testimonial Slider ---
  const testimonials = Array.from(document.querySelectorAll('.testimonial-card'));
  const track = document.getElementById('testimonialTrack');
  let current = 0;
  function showTestimonial(idx) {
    testimonials.forEach((card, i) => {
      card.style.display = i === idx ? 'flex' : 'none';
    });
    feather.replace();
  }
  function getVisibleCount() {
    return 1;
  }
  function updateSlider() {
    let n = 1;
    testimonials.forEach((card, i) => {
      card.style.display = (i === current) ? 'flex' : 'none';
    });
    feather.replace();
  }
  document.getElementById('testimonialPrev').onclick = () => {
    current = (current - 1 + testimonials.length) % testimonials.length;
    updateSlider();
  };
  document.getElementById('testimonialNext').onclick = () => {
    current = (current + 1) % testimonials.length;
    updateSlider();
  };
  window.addEventListener('resize', updateSlider);
  updateSlider();
  // Autoplay
  setInterval(() => {
    current = (current + 1) % testimonials.length;
    updateSlider();
  }, 5000);
});
