/**
 * LabRoom — Admin Room Management & Room Calendar
 */

let currentMgmtRoom = '';
let currentMgmtStatus = 'available';

function openRoomMgmt(name) {
    const room = GLOBAL_ROOMS.find(x => x.name === name);
    if (!room) return;

    currentMgmtRoom = name;
    currentMgmtStatus = room.status || 'available';

    document.getElementById('rmgmt-title').textContent = 'Kelola: ' + name;
    document.getElementById('rmgmt-sub').textContent = 'Edit kapasitas, fasilitas dan status ruangan';
    document.getElementById('rmgmt-cap').value = room.cap || '';
    document.getElementById('rmgmt-fasilitas').value = room.fasilitas || '';
    document.getElementById('rmgmt-until').value = room.closedUntil || '';

    pickStatus(currentMgmtStatus);
    document.getElementById('room-mgmt-overlay').classList.add('show');
}

function closeRoomMgmt() {
    document.getElementById('room-mgmt-overlay').classList.remove('show');
}

function pickStatus(st) {
    currentMgmtStatus = st;
    document.querySelectorAll('.stp').forEach(b => b.classList.remove('active'));

    const activeBtn = document.querySelector('.stp.' + st);
    if (activeBtn) activeBtn.classList.add('active');

    // Show date picker only for non-available status
    const untilWrap = document.getElementById('rmgmt-until-wrap');
    if (untilWrap) untilWrap.style.display = (st === 'maintenance' || st === 'closed') ? 'block' : 'none';
}

async function saveRoomMgmt() {
    const cap = document.getElementById('rmgmt-cap').value || '30';
    const fasilitas = document.getElementById('rmgmt-fasilitas').value.trim();
    const closedUntil = (currentMgmtStatus === 'available') ? '' : document.getElementById('rmgmt-until').value;

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        await fetch('/api/rooms/' + currentMgmtRoom, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ cap, fasilitas, status: currentMgmtStatus, closedUntil })
        });
        closeRoomMgmt();
        if (typeof renderAdmin === 'function') await renderAdmin();
        if (typeof showToast === 'function') showToast('Data ruangan berhasil disimpan!', 'success');
    } catch (e) {
        if (typeof showToast === 'function') showToast('Gagal menyimpan data ruangan', 'error');
    }
}

/** Automatically check and reset expired maintenance/closed status */
function checkAutoExpire() {
    const today = new Date().toISOString().split('T')[0];
    let changed = false;

    GLOBAL_ROOMS.forEach(r => {
        if ((r.status === 'maintenance' || r.status === 'closed') && r.closedUntil && r.closedUntil < today) {
            r.status = 'available';
            r.closedUntil = '';
            changed = true;
        }
    });

    return GLOBAL_ROOMS;
}

function renderRoomsPanel() {
    const rooms = checkAutoExpire();

    // Render Aside Rooms
    const asideRooms = document.getElementById('aside-rooms');
    if (asideRooms) {
        asideRooms.innerHTML = rooms.map(r => {
            const statusColor = r.status === 'available' ? 'var(--green)' : r.status === 'maintenance' ? 'var(--amber)' : 'var(--red)';
            return `
                <div class="asi" onclick="openRoomCalendar('${r.name}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px;flex-shrink:0">
                        <rect x="2" y="3" width="20" height="14" rx="3"/><path d="M8 21h8M12 17v4"/>
                    </svg>
                    <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${r.name}</span>
                    <span style="width:7px;height:7px;border-radius:50%;background:${statusColor};flex-shrink:0"></span>
                    <button onclick="event.stopPropagation();openRoomMgmt('${r.name}')" class="aside-edit-btn">⚙</button>
                </div>
            `;
        }).join('');
    }

    // Render Main Panel Rooms
    const mainRooms = document.getElementById('room-panel-list');
    if (!mainRooms) return;

    const labels = { available: 'Tersedia', maintenance: 'Maintenance', closed: 'Ditutup' };

    mainRooms.innerHTML = rooms.map(r => {
        const untilText = r.closedUntil ? ' s/d ' + r.closedUntil.split('-').reverse().join('/') : '';
        return `
            <div class="rsc" style="flex-direction:column;align-items:flex-start;gap:12px">
                <div>
                    <div class="rsn">${r.name}</div>
                    <div class="rsd">Kapasitas: ${r.cap} orang</div>
                    ${r.fasilitas ? `<div class="rsd" style="margin-top:6px;font-size:11.5px;color:var(--text2);line-height:1.5">${r.fasilitas}</div>` : ''}
                </div>
                <div class="rsc-footer">
                    <span class="rstag ${r.status || 'available'}">${labels[r.status] || r.status}${untilText}</span>
                    <button class="ber" onclick="openRoomMgmt('${r.name}')">Edit</button>
                </div>
            </div>
        `;
    }).join('');

    if (typeof calRoom !== 'undefined' && calRoom) renderRoomCalendar();
}

/* =========================================================================
   ROOM CALENDAR POPUP
   ========================================================================= */

let calRoom = '', calYear = 0, calMonth = 0, calSelectedDate = '';

function openRoomCalendar(room) {
    calRoom = room;
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    calSelectedDate = '';

    document.getElementById('rc-title').textContent = 'Jadwal: ' + room;
    const rcSub = document.getElementById('rc-sub');
    if (rcSub) rcSub.textContent = 'Klik tanggal untuk melihat detail reservasi';

    renderRoomCalendar();
    document.getElementById('room-cal-overlay').classList.add('show');
}

function closeRoomCalendar() {
    document.getElementById('room-cal-overlay').classList.remove('show');
    const dayDetail = document.getElementById('rc-day-detail');
    if (dayDetail) dayDetail.style.display = 'none';
}

function rcChangeMonth(delta) {
    calMonth += delta;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderRoomCalendar();
}

function renderRoomCalendar() {
    const monthLbl = document.getElementById('rc-month-label');
    if (!monthLbl) return;

    const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    monthLbl.textContent = MONTH_NAMES[calMonth] + ' ' + calYear;

    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const bookings = GLOBAL_BOOKINGS.filter(b => b.ruangan === calRoom && b.status !== 'rejected');
    const today = new Date().toISOString().split('T')[0];

    let html = days.map(d => `<div class="rch">${d}</div>`).join('');
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) html += '<div class="rcd empty"></div>';

    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const bks = bookings.filter(b => b.tanggal === ds);

        let cls = 'rcd';
        if (bks.length) cls += ' hasbk';
        if (ds === today) cls += ' today';
        if (ds === calSelectedDate) cls += ' sel';

        const dots = bks.length ? `<div class="drow">${bks.slice(0, 4).map(() => '<span class="dd"></span>').join('')}</div>` : '';
        html += `
            <div class="${cls}" onclick="rcSelectDay('${ds}')">
                <div class="rcdn">${d}</div>
                ${dots}
            </div>
        `;
    }

    const gridEl = document.getElementById('rc-cal-grid');
    if (gridEl) gridEl.innerHTML = html;
    if (calSelectedDate) renderDayDetail(calSelectedDate);
}

function rcSelectDay(ds) {
    calSelectedDate = ds;
    renderRoomCalendar();
    renderDayDetail(ds);
}

function renderDayDetail(ds) {
    const label = new Date(ds + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const titleEl = document.getElementById('rc-day-title');
    if (titleEl) titleEl.textContent = label;

    const bookings = GLOBAL_BOOKINGS.filter(b => b.ruangan === calRoom && b.tanggal === ds && b.status !== 'rejected');
    const container = document.getElementById('rc-day-detail');
    if (container) container.style.display = 'block';

    const listEl = document.getElementById('rc-day-list');
    if (!listEl) return;

    if (!bookings.length) {
        listEl.innerHTML = `
            <div style="font-size:12.5px;color:var(--text3);padding:10px;background:var(--cream);border-radius:8px;text-align:center">
                Tidak ada reservasi pada hari ini.
            </div>
        `;
        return;
    }

    bookings.sort((a, b) => timeToMinutes(a.jamMulai) - timeToMinutes(b.jamMulai));

    const labels = { approved: 'Disetujui', pending: 'Menunggu', rejected: 'Ditolak' };

    listEl.innerHTML = bookings.map(b => {
        const statusClass = b.status;
        const statusText = labels[b.status] || b.status;

        return `
            <div class="rci">
                <div>
                    <div class="rcii"><strong>${b.nama}</strong> · ${b.instansi || '—'} <span class="tsm ${statusClass}">${statusText}</span></div>
                    <div class="rcit">📅 ${b.jamMulai}–${b.jamSelesai} | ${b.keperluan}</div>
                </div>
                <div class="rcia">
                    <button class="rcb ed" onclick="openEditModal(${b.id})">Edit</button>
                    <button class="rcb dl" onclick="deleteBooking(${b.id})">Hapus</button>
                </div>
            </div>
        `;
    }).join('');
}
