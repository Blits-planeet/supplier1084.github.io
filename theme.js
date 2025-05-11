document.addEventListener('DOMContentLoaded', function() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const moonIcon = '<i class="fa-solid fa-moon"></i>';
    const sunIcon = '<i class="fa-solid fa-sun"></i>';
    
    // Check for saved theme preference or use user's system preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = sunIcon;
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleBtn.innerHTML = moonIcon;
    }
    
    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = sunIcon;
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = moonIcon;
        }
    });
});
