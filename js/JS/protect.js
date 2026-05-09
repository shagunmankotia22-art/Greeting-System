/* ================= PROTECT.JS ================= */
// Add this to pages you want to protect (e.g. view.html)
// If user is not logged in, redirect to login page

const user = JSON.parse(localStorage.getItem('greetings_user') || 'null');

if (!user) {
  // Allow viewing cards without login — only block if you want
  // Uncomment below to force login:
  // window.location.href = 'login.html';
}