// LAB IMPLEMENTATION: HTML5 localStorage, improved validation, event handling, DOM updates, and user preferences
const STORAGE_KEYS = {
  donors: 'bloodDonors',
  requests: 'bloodRequests',
  feedback: 'bloodFeedback',
  preferences: 'bloodUserPreferences'
};

const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const menuToggle = document.querySelector('.menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

function setActiveNav() {
  const page = document.body?.dataset?.page || '';
  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === `${page}.html` || (page === 'home' && href === 'home.html'));
  });
}

function initializeMenu() {
  if (!menuToggle || !navLinksContainer) return;
  menuToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
  });
}

function getStoredData(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    return [];
  }
}

function saveStoredData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getUserPreferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.preferences) || '{}');
  } catch (error) {
    return {};
  }
}

function saveUserPreference(key, value) {
  const preferences = getUserPreferences();
  preferences[key] = value;
  saveStoredData(STORAGE_KEYS.preferences, preferences);
}

// UI ENHANCEMENT: Reusable toast notifications for clearer success and error feedback
function createToastContainer() {
  let toast = document.getElementById('bloodDonationToast');
  if (toast) return toast;

  toast = document.createElement('div');
  toast.id = 'bloodDonationToast';
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  return toast;
}

function showMessage(element, message, type = 'success') {
  if (element) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const toast = createToastContainer();
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  clearTimeout(toast._hideTimer);
  toast._hideTimer = window.setTimeout(() => {
    toast.className = 'toast';
  }, 3200);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// UI ENHANCEMENT: Audio notification support for successful donor registration, requests, and feedback
function playNotificationSound(type = 'register') {
  const soundId = type === 'feedback' ? 'feedbackSound' : type === 'request' ? 'requestSound' : 'registerSound';
  const audioElement = document.getElementById(soundId);
  if (!audioElement) return;
  audioElement.currentTime = 0;
  audioElement.play().catch(() => {});
}

function getDonors() {
  return getStoredData(STORAGE_KEYS.donors);
}

function saveDonor(data) {
  const donors = getDonors();
  donors.push(data);
  saveStoredData(STORAGE_KEYS.donors, donors);
}

function saveRequest(data) {
  const requests = getStoredData(STORAGE_KEYS.requests);
  requests.push(data);
  saveStoredData(STORAGE_KEYS.requests, requests);
}

function saveFeedback(data) {
  const feedbacks = getStoredData(STORAGE_KEYS.feedback);
  feedbacks.push(data);
  saveStoredData(STORAGE_KEYS.feedback, feedbacks);
}

function seedDemoData() {
  const existingDonors = getDonors();
  if (existingDonors.length) return;

  const demoDonors = [
    {
      fullName: 'Asha Sharma',
      age: 29,
      gender: 'Female',
      bloodGroup: 'O+',
      email: 'asha@example.com',
      phone: '9876543210',
      city: 'Mumbai',
      availability: 'Available',
      password: 'demo123',
      confirmPassword: 'demo123'
    },
    {
      fullName: 'Rahul Verma',
      age: 35,
      gender: 'Male',
      bloodGroup: 'A+',
      email: 'rahul@example.com',
      phone: '9123456780',
      city: 'Delhi',
      availability: 'Available',
      password: 'demo123',
      confirmPassword: 'demo123'
    },
    {
      fullName: 'Meera Iyer',
      age: 26,
      gender: 'Female',
      bloodGroup: 'B+',
      email: 'meera@example.com',
      phone: '9012345678',
      city: 'Bangalore',
      availability: 'Unavailable',
      password: 'demo123',
      confirmPassword: 'demo123'
    }
  ];

  saveStoredData(STORAGE_KEYS.donors, demoDonors);
}

function renderDonorCards(donors, container) {
  if (!container) return;
  if (!donors.length) {
    container.innerHTML = '<div class="glass-card"><p>No Donor Found</p></div>';
    return;
  }

  container.innerHTML = donors.map((donor) => `
    <article class="donor-card">
      <div class="pill">${donor.bloodGroup}</div>
      <h3>${donor.fullName}</h3>
      <p><strong>City:</strong> ${donor.city}</p>
      <p><strong>Phone:</strong> ${donor.phone}</p>
      <p><strong>Status:</strong> ${donor.availability}</p>
      <div class="card-actions">
        <button type="button" data-phone="${donor.phone}">Contact</button>
        <button type="button" data-request="${donor.fullName}" data-group="${donor.bloodGroup}">Request</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-phone]').forEach((button) => {
    button.addEventListener('click', () => {
      const phone = button.getAttribute('data-phone');
      showMessage(document.getElementById('searchMessage'), `Contact Number: ${phone}`, 'success');
    });
  });

  container.querySelectorAll('[data-request]').forEach((button) => {
    button.addEventListener('click', () => {
      const donorName = button.getAttribute('data-request');
      const group = button.getAttribute('data-group');
      localStorage.setItem('pendingRequest', JSON.stringify({ donorName, group }));
      window.location.href = 'request.html';
    });
  });
}

function filterDonors(filters = {}) {
  const donors = getDonors();
  return donors.filter((donor) => {
    const matchesText = !filters.searchText || donor.fullName.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchesGroup = !filters.bloodGroup || donor.bloodGroup === filters.bloodGroup;
    const matchesCity = !filters.city || donor.city === filters.city;
    return matchesText && matchesGroup && matchesCity;
  });
}

// UI ENHANCEMENT: Better donor registration validation and dynamic updates
function handleDonorRegistration(event) {
  event.preventDefault();
  const form = event.target;
  const formMessage = document.getElementById('formMessage');

  const data = {
    fullName: form.fullName.value.trim(),
    age: Number(form.age.value),
    gender: form.gender.value,
    bloodGroup: form.bloodGroup.value.trim().toUpperCase(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    city: form.city.value.trim(),
    availability: form.availability.value,
    password: form.password.value,
    confirmPassword: form.confirmPassword.value
  };

  if (!form.checkValidity()) {
    form.reportValidity();
    showMessage(formMessage, 'Please complete the highlighted fields before submitting.', 'error');
    return;
  }
  if (!data.fullName || !data.gender || !data.bloodGroup || !data.email || !data.phone || !data.city || !data.password || !data.confirmPassword) {
    showMessage(formMessage, 'Please fill all required fields.', 'error');
    return;
  }
  if (data.age < 18) {
    showMessage(formMessage, 'Age must be 18 or above.', 'error');
    return;
  }
  if (!/^[0-9]{10}$/.test(data.phone)) {
    showMessage(formMessage, 'Phone number must be exactly 10 digits.', 'error');
    return;
  }
  if (!validateEmail(data.email)) {
    showMessage(formMessage, 'Please enter a valid email address.', 'error');
    return;
  }
  if (data.password !== data.confirmPassword) {
    showMessage(formMessage, 'Passwords do not match.', 'error');
    return;
  }
  if (data.password.length < 6) {
    showMessage(formMessage, 'Password must be at least 6 characters.', 'error');
    return;
  }

  saveDonor(data);
  saveUserPreference('lastAction', 'donorRegistered');
  form.reset();
  showMessage(formMessage, 'Registration Successful. Return to Home.', 'success');
  playNotificationSound('register');
  const donorResults = document.getElementById('donorResults');
  if (donorResults) {
    renderDonorCards(filterDonors({}), donorResults);
  }
}

// UI ENHANCEMENT: Better search interaction and dynamic donor rendering
function handleSearch(event) {
  event.preventDefault();
  const form = event.target;
  const message = document.getElementById('searchMessage');
  const resultsContainer = document.getElementById('donorResults');
  const filters = {
    searchText: form.searchText.value.trim(),
    bloodGroup: form.bloodGroupFilter.value,
    city: form.cityFilter.value
  };

  saveUserPreference('lastSearch', filters);
  const donors = filterDonors(filters);
  renderDonorCards(donors, resultsContainer);
  if (!donors.length) {
    showMessage(message, 'No Donor Found', 'error');
  } else {
    showMessage(message, 'Matching donors are listed below.', 'success');
  }
}

// UI ENHANCEMENT: Better emergency request validation and matching donor updates
function handleRequest(event) {
  event.preventDefault();
  const form = event.target;
  const message = document.getElementById('requestMessage');
  const formData = {
    patientName: form.patientName.value.trim(),
    requiredBloodGroup: form.requiredBloodGroup.value.trim().toUpperCase(),
    hospitalName: form.hospitalName.value.trim(),
    hospitalLocation: form.hospitalLocation.value.trim(),
    unitsRequired: Number(form.unitsRequired.value),
    contactNumber: form.contactNumber.value.trim(),
    requiredDate: form.requiredDate.value,
    additionalNotes: form.additionalNotes.value.trim(),
    latitude: form.latitude.value.trim(),
    longitude: form.longitude.value.trim(),
    confirmRequest: form.confirmRequest.checked
  };

  if (!form.checkValidity()) {
    form.reportValidity();
    showMessage(message, 'Please complete the highlighted fields before submitting.', 'error');
    return;
  }
  if (!formData.patientName || !formData.requiredBloodGroup || !formData.hospitalName || !formData.hospitalLocation || !formData.unitsRequired || !formData.contactNumber || !formData.requiredDate || !formData.confirmRequest) {
    showMessage(message, 'Please complete all required fields and confirm the request.', 'error');
    return;
  }
  if (formData.unitsRequired <= 0) {
    showMessage(message, 'Units required must be greater than 0.', 'error');
    return;
  }
  if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
    showMessage(message, 'Contact number must be exactly 10 digits.', 'error');
    return;
  }

  saveRequest(formData);
  saveUserPreference('lastAction', 'requestSubmitted');
  form.reset();
  showMessage(message, 'Emergency request submitted successfully.', 'success');
  playNotificationSound('request');
  renderMatchingDonors(formData.requiredBloodGroup, document.getElementById('matchResults'));
}

function renderMatchingDonors(group, container) {
  if (!container) return;
  const donors = getDonors().filter((donor) => donor.bloodGroup === group && donor.availability === 'Available');
  if (!donors.length) {
    container.innerHTML = '<div class="glass-card"><p>No matching donor is currently available.</p></div>';
    return;
  }
  container.innerHTML = donors.map((donor) => `
    <article class="donor-card">
      <div class="pill">${donor.bloodGroup}</div>
      <h3>${donor.fullName}</h3>
      <p><strong>City:</strong> ${donor.city}</p>
      <p><strong>Phone:</strong> ${donor.phone}</p>
      <p><strong>Status:</strong> ${donor.availability}</p>
    </article>
  `).join('');
}

function renderFeedbackSummary(feedbacks, container) {
  if (!container) return;
  if (!feedbacks.length) {
    container.innerHTML = '<p>No feedback submitted yet.</p>';
    return;
  }
  const latest = feedbacks[feedbacks.length - 1];
  container.innerHTML = `
    <h3>Recent Feedback</h3>
    <p><strong>${latest.name}</strong> rated the service ${latest.rating}/5.</p>
    <p>${latest.comments}</p>
  `;
}

// UI ENHANCEMENT: Better feedback validation and dynamic thank-you summary
function handleFeedback(event) {
  event.preventDefault();
  const form = event.target;
  const message = document.getElementById('feedbackMessage');
  const summary = document.getElementById('feedbackSummary');
  const feedbackData = {
    name: form.feedbackName.value.trim(),
    email: form.feedbackEmail.value.trim(),
    rating: form.rating.value,
    referenceUrl: form.referenceUrl?.value.trim() || '',
    comments: form.comments.value.trim(),
    terms: form.terms.checked
  };

  if (!form.checkValidity()) {
    form.reportValidity();
    showMessage(message, 'Please complete the highlighted feedback fields.', 'error');
    return;
  }
  if (!feedbackData.name || !feedbackData.email || !feedbackData.rating || !feedbackData.comments || !feedbackData.terms) {
    showMessage(message, 'Please fill all required feedback fields.', 'error');
    return;
  }
  if (!validateEmail(feedbackData.email)) {
    showMessage(message, 'Please enter a valid feedback email.', 'error');
    return;
  }

  saveFeedback(feedbackData);
  saveUserPreference('lastAction', 'feedbackSubmitted');
  renderFeedbackSummary(getStoredData(STORAGE_KEYS.feedback), summary);
  form.reset();
  showMessage(message, 'Thank you for your Feedback', 'success');
  playNotificationSound('feedback');
}

function attachFormInteractions() {
  const donorForm = document.getElementById('donorForm');
  const searchForm = document.getElementById('searchForm');
  const requestForm = document.getElementById('requestForm');
  const feedbackForm = document.getElementById('feedbackForm');
  const ratingSelect = document.getElementById('rating');
  const stars = Array.from(document.querySelectorAll('.star-btn'));

  if (donorForm) {
    donorForm.addEventListener('input', (event) => {
      const password = donorForm.password?.value || '';
      const confirmPassword = donorForm.confirmPassword?.value || '';
      if (event.target.id === 'confirmPassword' && password && confirmPassword && password !== confirmPassword) {
        showMessage(document.getElementById('formMessage'), 'Passwords do not match.', 'error');
      }
    });
    donorForm.addEventListener('change', () => {
      const donorResults = document.getElementById('donorResults');
      if (donorResults) {
        renderDonorCards(filterDonors({}), donorResults);
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener('input', () => handleSearch({ preventDefault() {}, target: searchForm }));
    searchForm.addEventListener('change', () => handleSearch({ preventDefault() {}, target: searchForm }));
  }

  if (requestForm) {
    requestForm.addEventListener('change', (event) => {
      if (event.target.id === 'requiredBloodGroup') {
        renderMatchingDonors(event.target.value.toUpperCase(), document.getElementById('matchResults'));
      }
    });
  }

  if (ratingSelect && stars.length) {
    const updateStars = (value) => {
      stars.forEach((star) => {
        const starValue = Number(star.dataset.value || 0);
        star.classList.toggle('active', starValue <= value);
      });
      ratingSelect.value = value;
    };

    stars.forEach((star) => {
      star.addEventListener('click', () => {
        updateStars(Number(star.dataset.value || 0));
      });
    });

    ratingSelect.addEventListener('change', () => {
      updateStars(Number(ratingSelect.value || 0));
    });
  }
}

// UI ENHANCEMENT: Elegant canvas heartbeat animation on the home page
function initCanvasAnimation() {
  const canvas = document.getElementById('bloodCanvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  let frame = 0;

  function draw() {
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'rgba(192,0,0,0.08)';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = '#c00000';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(20, 90);
    const pulse = Math.sin(frame / 15) * 8;
    context.quadraticCurveTo(60, 60 + pulse, 95, 85);
    context.quadraticCurveTo(120, 115, 150, 80);
    context.quadraticCurveTo(180, 45, 220, 72);
    context.quadraticCurveTo(240, 90, 250, 78);
    context.stroke();
    context.beginPath();
    context.arc(140, 62, 22 + Math.abs(pulse) / 2, 0, Math.PI * 2);
    context.fillStyle = 'rgba(255,255,255,0.8)';
    context.fill();
    frame += 1;
    requestAnimationFrame(draw);
  }

  draw();
}

// UI ENHANCEMENT: Animated counters for the home page stats section
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach((counter) => {
    const target = Number(counter.dataset.target || 0);
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);
      counter.textContent = value.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  });
}

function initPage() {
  seedDemoData();
  setActiveNav();
  initializeMenu();
  saveUserPreference('lastPage', document.body?.dataset?.page || 'home');
  initCanvasAnimation();
  if (document.body?.dataset?.page === 'home') {
    animateCounters();
  }

  const donorForm = document.getElementById('donorForm');
  const searchForm = document.getElementById('searchForm');
  const requestForm = document.getElementById('requestForm');
  const feedbackForm = document.getElementById('feedbackForm');
  const donorResults = document.getElementById('donorResults');
  const matchResults = document.getElementById('matchResults');
  const feedbackSummary = document.getElementById('feedbackSummary');

  if (donorForm) donorForm.addEventListener('submit', handleDonorRegistration);
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
    const initialDonors = filterDonors({});
    renderDonorCards(initialDonors, donorResults);
  }
  if (requestForm) {
    requestForm.addEventListener('submit', handleRequest);
    const pendingRequest = JSON.parse(localStorage.getItem('pendingRequest') || 'null');
    if (pendingRequest && requestForm.requiredBloodGroup) {
      requestForm.requiredBloodGroup.value = pendingRequest.group;
      localStorage.removeItem('pendingRequest');
      renderMatchingDonors(pendingRequest.group, matchResults);
    } else {
      renderMatchingDonors('', matchResults);
    }
  }
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', handleFeedback);
    renderFeedbackSummary(getStoredData(STORAGE_KEYS.feedback), feedbackSummary);
  }

  attachFormInteractions();
}

window.detectLocation = function () {
  const latitudeField = document.getElementById('latitude');
  const longitudeField = document.getElementById('longitude');
  const requestMessage = document.getElementById('requestMessage');
  if (!navigator.geolocation) {
    showMessage(requestMessage, 'Geolocation is not supported by this browser.', 'error');
    return;
  }
  showMessage(requestMessage, 'Detecting location...', 'success');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (latitudeField) latitudeField.value = position.coords.latitude.toFixed(6);
      if (longitudeField) longitudeField.value = position.coords.longitude.toFixed(6);
      showMessage(requestMessage, 'Location captured successfully.', 'success');
    },
    () => {
      showMessage(requestMessage, 'Unable to detect your location. Please try again.', 'error');
    }
  );
};

document.addEventListener('DOMContentLoaded', initPage);
