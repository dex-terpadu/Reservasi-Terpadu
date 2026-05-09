/**
 * LabRoom — Room Calendar Popup (User View)
 */

let rcRoom = '', rcYear = 0, rcMonth = 0;

function openRoomCal(room) {
    rcRoom = room;
    const now = new Date();
    rcYear = now.getFullYear();
    rcMonth = now.getMonth();

    document.getElementById('rc-title').textContent = 'Jadwal: ' + room;
    document.getElementById('rc-sub').innerHTML = '';

    renderRcGrid();
    document.getElementById('rc-overlay').classList.add('show');
}

function closeRoomCal() {
    document.getElementById('rc-overlay').classList.remove('show');
}

function rcNav(delta) {
    rcMonth += delta;
    if (rcMonth < 0) { rcMonth = 11; rcYear--; }
    if (rcMonth > 11) { rcMonth = 0; rcYear++; }
    renderRcGrid();
}

function renderRcGrid() {
    const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    document.getElementById('rc-month-lbl').textContent = MONTHS[rcMonth] + ' ' + rcYear;

    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let html = days.map(d => `<div class="rc-head">${d}</div>`).join('');

    const firstDay = new Date(rcYear, rcMonth, 1).getDay();
    const daysInMonth = new Date(rcYear, rcMonth + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];
    const bookings = loadBookings().filter(b => b.ruangan === rcRoom && b.status !== 'rejected');

    // Fill empty slots
    for (let i = 0; i < firstDay; i++) html += `<div class="rc-day empty"></div>`;

    // Fill days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${rcYear}-${String(rcMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const hasBookings = bookings.some(b => b.tanggal === dateStr);
        const isToday = dateStr === today;

        let cls = 'rc-day';
        if (hasBookings) cls += ' has-bookings';
        if (isToday) cls += ' today';

        const dot = hasBookings ? `<div class="rc-dot-row"><div class="rc-dot"></div></div>` : '';
        html += `
            <div class="${cls}" onclick="rcShowDay('${dateStr}')">
                <div class="rc-day-num">${d}</div>
                ${dot}
            </div>
        `;
    }

    document.getElementById('rc-grid').innerHTML = html;
    document.getElementById('rc-detail').style.display = 'none';
}

function rcShowDay(dateStr) {
    const container = document.getElementById('rc-detail');
    const titleEl = document.getElementById('rc-det-title');
    const listEl = document.getElementById('rc-det-list');

    const fmt = d => d.split('-').reverse().join('/');
    titleEl.textContent = 'Jadwal ' + fmt(dateStr);

    const roomInfo = getRoomInfo(rcRoom);
    if (roomInfo && roomInfo.status !== 'available' && isRoomBlocked(rcRoom, dateStr)) {
        const labels = { maintenance: '🔧 Sedang Maintenance', closed: '🚫 Ruangan Ditutup' };
        const until = roomInfo.closedUntil ? ` sampai ${fmt(roomInfo.closedUntil)}` : '';
        listEl.innerHTML = `
            <div class="rc-lock-notice">
                ${labels[roomInfo.status] || 'Tidak Tersedia'}${until}
            </div>
        `;
        container.style.display = 'block';
        return;
    }

    const dayBookings = loadBookings().filter(b => b.ruangan === rcRoom && b.tanggal === dateStr && b.status !== 'rejected');

    if (!dayBookings.length) {
        listEl.innerHTML = `
            <div class="rc-empty-notice">
                ✓ Tidak ada reservasi — ruangan tersedia.
            </div>
        `;
        container.style.display = 'block';
        return;
    }

    dayBookings.sort((a, b) => timeToMinutes(a.jamMulai) - timeToMinutes(b.jamMulai));

    const statusMap = { approved: 'Disetujui', pending: 'Menunggu', rejected: 'Ditolak' };
    const statusStyle = { approved: 'var(--green)', pending: 'var(--amber)', rejected: 'var(--red)' };

    listEl.innerHTML = dayBookings.map(b => `
        <div class="rc-item">
            <div class="rc-item-header">
                <span class="rc-item-time">${b.jamMulai} – ${b.jamSelesai}</span>
                <span class="rc-item-status" style="color:${statusStyle[b.status]}">${statusMap[b.status] || b.status}</span>
            </div>
            <div class="rc-item-kep">${b.keperluan}</div>
        </div>
    `).join('');

    container.style.display = 'block';
}
