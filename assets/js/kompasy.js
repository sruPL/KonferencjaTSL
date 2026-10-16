document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
            const open = document.getElementById('navMenu').classList.toggle('show');
            this.setAttribute('aria-expanded', open ? 'true' : 'false');
            this.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
        });

document.addEventListener("DOMContentLoaded", function () {
      const links = document.querySelectorAll('#navMenu a[data-target]');

      links.forEach(link => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const targetId = this.getAttribute("data-target");

          // Save target section in localStorage
          localStorage.setItem("scrollTarget", targetId);
          // Redirect to homepage
          window.location.href = "/";
        });
      });
    });
