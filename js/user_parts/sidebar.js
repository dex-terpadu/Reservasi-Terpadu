/**
 * LabRoom — Sidebar Rendering
 */

function renderSidebar() {
    const rooms = loadRooms();
    const bookings = loadBookings();
    const today = new Date().toISOString().split('T')[0];
    const container = document.getElementById('room-status-list');

    if (!container) return;

    container.innerHTML = rooms.map(r => {
        let dotClass, statusLabel;

        if (r.status === 'maintenance') {
            dotClass = 'pt';
            statusLabel = 'Maintenance';
        } else if (r.status === 'closed') {
            dotClass = 'bs';
            statusLabel = 'Ditutup';
        } else {
            const now = new Date();
            const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
            const nowMin = timeToMinutes(hhmm);

            const isBusyNow = bookings.some(b => 
                b.ruangan === r.name && 
                b.tanggal === today && 
                b.status === 'approved' && 
                timeToMinutes(b.jamMulai) <= nowMin && 
                nowMin < timeToMinutes(b.jamSelesai)
            );

            const hasTodayReservations = bookings.some(b => 
                b.ruangan === r.name && 
                b.tanggal === today && 
                b.status !== 'rejected'
            );

            dotClass = isBusyNow ? 'bs' : (hasTodayReservations ? 'pt' : 'av');
            statusLabel = isBusyNow ? 'Sedang Terpakai' : (hasTodayReservations ? 'Ada Reservasi' : 'Tersedia');
        }

        return `
            <div class="room-row" onclick="openRoomCal('${r.name}')" title="Lihat jadwal ${r.name}">
                <span class="rdot ${dotClass}"></span>
                <span class="rname">${r.name}</span>
                <span class="rstatus">${statusLabel}</span>
            </div>
        `;
    }).join('');
}
