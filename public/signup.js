document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = form.username.value.trim(); // Still collected but not sent to server
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password,username }), 
      });

      const data = await res.json();

      if (res.ok) {
        // Store username locally if needed (optional)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.push({ username, email });
         localStorage.setItem('user', JSON.stringify(data.user)); // Store username + email
        alert('Signup successful! You can now login.');

        
        window.location.href = 'login.html';
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      alert('Error signing up. Please try again.');
      console.error('Fetch error:', err);
    }
  });
});