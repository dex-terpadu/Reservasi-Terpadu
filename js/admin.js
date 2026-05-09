/**
 * LabRoom — Admin Panel JavaScript Entry Point
 */

(async function init() {
    const session = typeof getSession === 'function' ? getSession() : null;
    if (session) {
        const loginPage = document.getElementById('login-page');
        const adminPage = document.getElementById('admin-page');
        const loggedUser = document.getElementById('logged-user');
        
        if (loginPage) loginPage.classList.add('hidden');
        if (adminPage) adminPage.classList.add('active');
        if (loggedUser) loggedUser.textContent = session.nama;
        
        if (typeof renderAdmin === 'function') await renderAdmin();
    }
})();
