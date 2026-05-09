/**
 * LabRoom — Authentication & Session
 */

const SESSION_KEY = 'labroom_session';

// Session Management Helpers
const getSession = () => {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (e) {
        return null;
    }
};

const setSession = (user) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
const clearSession = () => sessionStorage.removeItem(SESSION_KEY);

function togglePw() {
    const input = document.getElementById('inp-pw');
    const eyeOff = document.getElementById('eye-off');
    const eyeOn = document.getElementById('eye-on');

    if (input.type === 'password') {
        input.type = 'text';
        eyeOff.style.display = 'none';
        eyeOn.style.display = '';
    } else {
        input.type = 'password';
        eyeOn.style.display = 'none';
        eyeOff.style.display = '';
    }
}

async function doLogin() {
    const username = document.getElementById('inp-user').value.trim();
    const password = document.getElementById('inp-pw').value;
    const errorEl = document.getElementById('lerr');
    const btn = document.getElementById('lbtn');

    if (errorEl) errorEl.classList.remove('show');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="animation:spin .7s linear infinite;width:16px;height:16px">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg> Memverifikasi...
        `;
    }

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            setSession(data.user);
            if (typeof fetchData === 'function') await fetchData();
            document.getElementById('login-page').classList.add('hidden');
            document.getElementById('admin-page').classList.add('active');
            document.getElementById('logged-user').textContent = data.user.nama;
            if (typeof renderAdmin === 'function') renderAdmin();
        } else {
            const lerrTxt = document.getElementById('lerr-txt');
            if (lerrTxt) lerrTxt.textContent = data.message || 'Username atau password salah.';
            if (errorEl) errorEl.classList.add('show');
            document.getElementById('inp-user').classList.add('err');
            document.getElementById('inp-pw').classList.add('err');
        }
    } catch (e) {
        console.error('Login error:', e);
        const lerrTxt = document.getElementById('lerr-txt');
        if (lerrTxt) lerrTxt.textContent = 'Gagal terhubung ke server.';
        if (errorEl) errorEl.classList.add('show');
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
            </svg> Masuk ke Dashboard
        `;
    }
}

function doLogout() {
    clearSession();
    document.getElementById('admin-page').classList.remove('active');
    document.getElementById('login-page').classList.remove('hidden');

    // Reset fields
    document.getElementById('inp-user').value = '';
    document.getElementById('inp-pw').value = '';
    document.getElementById('inp-user').classList.remove('err');
    document.getElementById('inp-pw').classList.remove('err');
    document.getElementById('lerr').classList.remove('show');

    if (typeof showToast === 'function') showToast('Berhasil keluar dari sistem.', 'success');
}
