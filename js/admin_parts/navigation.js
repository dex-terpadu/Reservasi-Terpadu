/**
 * LabRoom — Admin Navigation
 */

let currentPage = 'dashboard';
let listFilter = 'all';
let dashFilter = 'all';
let dashSearchQuery = '';
let listSearchQuery = '';

function navTo(section, btn) {
    document.querySelectorAll('.asi').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    currentPage = section;

    document.querySelectorAll('.psec').forEach(s => s.classList.remove('active'));

    if (section === 'dashboard') {
        document.getElementById('sec-dashboard').classList.add('active');
    } else {
        document.getElementById('sec-list').classList.add('active');
        listFilter = (section === 'all' || section === 'pending' || section === 'approved' || section === 'rejected') ? section : 'all';

        const titles = {
            all: 'Semua Pemesanan',
            pending: 'Menunggu Konfirmasi',
            approved: 'Pemesanan Disetujui',
            rejected: 'Pemesanan Ditolak'
        };

        const subs = {
            all: 'Daftar seluruh pemesanan ruangan',
            pending: 'Reservasi menunggu keputusan admin',
            approved: 'Reservasi yang telah disetujui',
            rejected: 'Reservasi yang telah ditolak'
        };

        document.getElementById('list-title').textContent = titles[section] || 'Semua Pemesanan';
        document.getElementById('list-sub').textContent = subs[section] || '';

        // Sync filter buttons
        ['all', 'pending', 'approved', 'rejected'].forEach(f => {
            const b = document.getElementById('lf-' + f);
            if (b) b.className = 'fb' + (f === listFilter ? ' active' : '');
        });

        if (typeof renderListTable === 'function') renderListTable();
    }
}

function navToFilter(filter) {
    const navId = 'nav-' + filter;
    const btn = document.getElementById(navId);
    if (btn) navTo(filter, btn);
}
