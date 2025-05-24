const navToggle = document.querySelector('.nav-toggle');
const navbar = document.getElementById('navbar');
navToggle.addEventListener('click', () => navbar.classList.toggle('open'));
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => link.addEventListener('click', () => navbar.classList.remove('open')));
const themeBtn = document.querySelector('.theme-toggle');
themeBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
});

