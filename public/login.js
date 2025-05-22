document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log('Login form submitted');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  console.log('Email:', email, 'Password:', password);

  // Client-side validation
  if (!email || !password) {
    alert('Please fill in both email and password.');
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log('Response status:', res.status, 'Response:', res);

    if (res.ok) {
      const data = await res.json();
      console.log('Login success data:', data);

      localStorage.setItem('loggedInUser', true);
      alert('Login successful! Redirecting to dashboard...');
      window.location.href = 'index.html';
    } else {
      const error = await res.json();
      console.log('Login error:', error);
      alert(error.message || 'Login failed');
    }
  } catch (err) {
    alert('Error logging in. Please try again.');
    console.error('Fetch error:', err);
  }
});


