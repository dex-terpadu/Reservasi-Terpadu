/**
 * LabRoom — Admin UI Helpers (Toast)
 */

function showToast(msg, type = 'success') {
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    };

    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = (icons[type] || icons.success) + msg;
    document.body.appendChild(t);

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(8px)';
        t.style.transition = 'all .3s';
        setTimeout(() => t.remove(), 300);
    }, 3200);
}

// Global modal background click handlers
window.addEventListener('click', function(e) {
    const overlays = ['room-mgmt-overlay', 'room-cal-overlay', 'edit-overlay', 'overlay'];
    overlays.forEach(id => {
        const el = document.getElementById(id);
        if (el && e.target === el) {
            el.classList.remove('show');
            if (id === 'edit-overlay') editBookingId = null;
        }
    });
});
