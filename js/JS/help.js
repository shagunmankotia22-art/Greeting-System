/* ================= HELP WIDGET ================= */
const helpBtn   = document.getElementById('helpBtn');
const helpPanel = document.getElementById('helpPanel');
const closeHelp = document.getElementById('closeHelp');

if (helpBtn) {
  helpBtn.addEventListener('click', () => {
    if (helpPanel.style.display === 'flex') {
      helpPanel.style.display = 'none';
    } else {
      helpPanel.style.display = 'flex';
    }
  });
}

if (closeHelp) {
  closeHelp.addEventListener('click', () => {
    helpPanel.style.display = 'none';
  });
}

// FAQ option - scroll to FAQ section
document.getElementById('faqOption')?.addEventListener('click', () => {
  helpPanel.style.display = 'none';
  document.querySelector('.faq-section')?.scrollIntoView({ behavior: 'smooth' });
});

// Contact option
document.getElementById('contactOption')?.addEventListener('click', () => {
  helpPanel.style.display = 'none';
  const issue = prompt('📝 Describe your problem:');
  if (issue && issue.trim()) {
    window.location.href = `mailto:shagun8595.beaift25@chitkara.edu.in,tanvee8605.beaift25@chitkara.edu.in
?subject=Greetings Support Request
&body=Hi Team,%0D%0A%0D%0AI am facing the following issue:%0D%0A%0D%0A${encodeURIComponent(issue)}%0D%0A%0D%0AThank you`;
  }
});

//Report Issue
document.getElementById('reportOption')?.addEventListener('click', () => {
  helpPanel.style.display = 'none';
  const issue = prompt('📝 Describe your issue briefly:');
  if (issue && issue.trim()) {
    alert(`✅ Thank you! Your issue has been reported:\n"${issue}"\n\nWe will get back to you within 24 hours.`);
  }
});

//Live Chat
document.querySelectorAll('.help-option')[3]?.addEventListener('click', () => {
  helpPanel.style.display = 'none';
  const choice = confirm(
    '💬 Choose WhatsApp number to chat:\n\nOK → Shagun: +91 XXXXX XXXXX\nCancel → Tanvee: +91 XXXXX XXXXX'
  );
  if (choice) {
    window.open('https://wa.me/919115850273?text=Hi! I need help with Greetings.', '_blank');
  } else {
    window.open('https://wa.me/91XXXXXXXXXX?text=Hi! I need help with Greetings.', '_blank');
  }
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
  if (helpPanel && helpBtn) {
    if (!helpPanel.contains(e.target) && !helpBtn.contains(e.target)) {
      helpPanel.style.display = 'none';
    }
  }
});