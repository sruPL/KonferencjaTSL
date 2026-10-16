// Mobile menu toggle
        document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
            const open = document.getElementById('navMenu').classList.toggle('show');
            this.setAttribute('aria-expanded', open ? 'true' : 'false');
            this.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
        });

        function scrollToSection(targetElement) {
            const header = document.querySelector('header');
            const headerOffset = header ? header.offsetHeight : 0;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset + 12;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    scrollToSection(targetElement);
                }

                // Close mobile menu if open
                if (document.getElementById('navMenu').classList.contains('show')) {
                    document.getElementById('navMenu').classList.remove('show');
                    document.querySelector('.mobile-menu-btn').setAttribute('aria-expanded', 'false');
                    document.querySelector('.mobile-menu-btn').setAttribute('aria-label', 'Otwórz menu');
                }
            });
        });

document.addEventListener("DOMContentLoaded", function () {
          const scrollTarget = localStorage.getItem("scrollTarget");
          if (scrollTarget) {
            const el = document.getElementById(scrollTarget);
            if (el) {
              setTimeout(() => {
                scrollToSection(el);
              }, 300);
            }
            localStorage.removeItem("scrollTarget");
          }
        });
