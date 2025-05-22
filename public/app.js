const htmlEl = document.documentElement;
    const themeSelect = document.getElementById('theme-select');

  
    const themes = [
      'light',
      'dark',
      'cupcake',
      'bumblebee',
      'emerald',
      'corporate',
      'synthwave',
      'retro',
      'cyberpunk',
      'valentine',
      'halloween',
      'garden',
      'forest',
      'aqua',
      'lofi',
      'pastel',
      'fantasy',
      'wireframe',
      'black',
      'luxury',
      'dracula',
      'cmyk',
      'autumn',
      'business',
      'acid',
      'lemonade',
      'night',
      'coffee',
      'winter',
    ];

    // Populate the select with theme options
    themes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme;
      option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
      themeSelect.appendChild(option);
    });

    // Load saved theme or default
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    themeSelect.value = savedTheme;

    // Change theme on select change
    themeSelect.addEventListener('change', e => {
      setTheme(e.target.value);
    });

  function setTheme(theme) {
htmlEl.setAttribute('data-theme', theme);
localStorage.setItem('theme', theme);
}

/*
// -----------------------------
// Signup function
function signup() {
  const username = document.getElementById("signup-username").value.trim();
  const email=document.getElementById("signup-email");
  const password = document.getElementById("signup-password").value;

  if (username && password) {
    localStorage.setItem("user", JSON.stringify({ username, password }));
    alert("Signup successful! Please log in.");
    window.location.href = "login.html";
  } else {
    alert("Please enter both username and password.");
  }
}

// Login function
function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (
    storedUser &&
    storedUser.email === email &&
    storedUser.password === password
  ) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "index.html";
  } else {
    alert("Invalid username or password.");
  }
}
 */
// Logout function
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
  const username = params.get('username');

  if (user &user.username) {
    // Show greeting
    document.getElementById('greeting').innerText = `Hi dude`;

    // Show logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.classList.remove('hidden');

    // Logout function (simple redirect to login page)
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'login.html'; // Or wherever your login page is
    });
  }

//contact-us
 const form = document.getElementById('contact-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const message = form.querySelector('textarea').value.trim();

    if (!name || !email || !message) {
      alert('Please fill all fields.');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        form.reset();
      } else {
        alert(data.error || 'Something went wrong.');
      }
    } catch (error) {
      alert('Failed to submit. Please try again later.');
      console.error('Form submit error:', error);
    }
  });