/**
 * LabRoom — Admin Booking Actions (Edit, Delete, Decide)
 */

async function deleteBooking(id) {
    if (!confirm('Hapus reservasi ini?')) return;
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        await fetch('/api/bookings/' + id, { 
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrfToken }
        });
        if (typeof renderAdmin === 'function') await renderAdmin();
        if (typeof calRoom !== 'undefined' && calRoom && typeof renderDayDetail === 'function') renderDayDetail(calSelectedDate);
        if (typeof showToast === 'function') showToast('Reservasi dihapus.', 'error');
    } catch (e) {
        if (typeof showToast === 'function') showToast('Gagal menghapus reservasi', 'error');
    }
}

let editBookingId = null;

function openEditModal(id) {
    const booking = GLOBAL_BOOKINGS.find(x => x.id === id);
    if (!booking) return;

    editBookingId = id;
    const subEl = document.getElementById('edit-sub');
    if (subEl) subEl.textContent = booking.ruangan;
    
    document.getElementById('edit-nama').value = booking.nama;
    document.getElementById('edit-tanggal').value = booking.tanggal;
    document.getElementById('edit-mulai').value = booking.jamMulai;
    document.getElementById('edit-selesai').value = booking.jamSelesai;
    document.getElementById('edit-kep').value = booking.keperluan;
    document.getElementById('edit-overlay').classList.add('show');
}

function closeEditModal() {
    document.getElementById('edit-overlay').classList.remove('show');
    editBookingId = null;
}

async function saveBookingEdit() {
    const b = GLOBAL_BOOKINGS.find(x => x.id === editBookingId);
    if (!b) { closeEditModal(); return; }

    const nama = document.getElementById('edit-nama').value.trim();
    const tanggal = document.getElementById('edit-tanggal').value;
    const mulai = document.getElementById('edit-mulai').value;
    const selesai = document.getElementById('edit-selesai').value;
    const keperluan = document.getElementById('edit-kep').value.trim();

    if (!nama || !tanggal || !mulai || !selesai || !keperluan) {
        if (typeof showToast === 'function') showToast('Mohon lengkapi semua data.', 'warn');
        return;
    }

    if (timeToMinutes(mulai) >= timeToMinutes(selesai)) {
        if (typeof showToast === 'function') showToast('Jam mulai harus sebelum jam selesai.', 'warn');
        return;
    }

    const conflicts = getConflicts(b.ruangan, tanggal, mulai, selesai, editBookingId);
    if (conflicts.length) {
        if (typeof showToast === 'function') showToast('Jadwal bentrok dengan reservasi lain!', 'error');
        return;
    }

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        await fetch('/api/bookings/' + editBookingId, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ nama, tanggal, jamMulai: mulai, jamSelesai: selesai, keperluan })
        });
        closeEditModal();
        if (typeof renderAdmin === 'function') await renderAdmin();
        if (typeof calRoom !== 'undefined' && calRoom && calSelectedDate && typeof renderDayDetail === 'function') renderDayDetail(calSelectedDate);
        if (typeof showToast === 'function') showToast('Reservasi berhasil diperbarui!', 'success');
    } catch (e) {
        if (typeof showToast === 'function') showToast('Gagal memperbarui reservasi', 'error');
    }
}

/** Quick decide for dashboard actions */
async function quickDecide(id, status) {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        await fetch(`/api/bookings/${id}/status`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ status })
        });
        if (typeof renderAdmin === 'function') await renderAdmin();
        if (typeof showToast === 'function') showToast(status === 'rejected' ? 'Pemesanan ditolak.' : 'Pemesanan disetujui.', status === 'approved' ? 'success' : 'error');
    } catch (e) {
        if (typeof showToast === 'function') showToast('Gagal memproses keputusan', 'error');
    }
}
