/**
 * LabRoom — User Calendar (Inline Form Calendar)
 */

let uCalYear = 0, uCalMonth = 0, uCalMode = 'day';

function initUserCal() {
    const now = new Date();
    const minDate = new Date(now);
    minDate.setDate(now.getDate() + 1);

    uCalYear = minDate.getFullYear();
    uCalMonth = minDate.getMonth();
    uCalMode = 'day';

    renderUserCal('');
    userCalPickDate(minDate.toISOString().split('T')[0]);
}

function uCalUpdateHeader() {
    const MN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const mBtn = document.getElementById('ucal-hdr-month');
    const yBtn = document.getElementById('ucal-hdr-year');
    if (!mBtn || !yBtn) return;

    mBtn.textContent = MN[uCalMonth];
    yBtn.textContent = uCalYear;

    mBtn.className = 'ucal-hdr-btn' + (uCalMode === 'month' ? ' active' : '');
    yBtn.className = 'ucal-hdr-btn' + (uCalMode === 'year' ? ' active' : '');
}

function userCalSetMode(mode) {
    uCalMode = (uCalMode === mode) ? 'day' : mode;
    renderUserCal(document.getElementById('f-tanggal')?.value || '');
}

function userCalNavPrev() {
    if (uCalMode === 'year') { uCalYear--; }
    else {
        uCalMonth--;
        if (uCalMonth < 0) { uCalMonth = 11; uCalYear--; }
    }
    renderUserCal(document.getElementById('f-tanggal')?.value || '');
}

function userCalNavNext() {
    if (uCalMode === 'year') { uCalYear++; }
    else {
        uCalMonth++;
        if (uCalMonth > 11) { uCalMonth = 0; uCalYear++; }
    }
    renderUserCal(document.getElementById('f-tanggal')?.value || '');
}

function renderUserCal(selectedDate) {
    uCalUpdateHeader();
    const grid = document.getElementById('user-cal-grid');
    if (!grid) return;
    if (uCalMode === 'month') renderMonthPicker(grid);
    else if (uCalMode === 'year') renderYearPicker(grid);
    else renderDayPicker(grid, selectedDate);
}

function renderDayPicker(grid, selectedDate) {
    grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let html = dayNames.map(d => `<div class="ucal-head">${d}</div>`).join('');

    const firstDay = new Date(uCalYear, uCalMonth, 1).getDay();
    const daysInMonth = new Date(uCalYear, uCalMonth + 1, 0).getDate();
    const prevDaysInMonth = new Date(uCalYear, uCalMonth, 0).getDate();
    
    const today = new Date().toISOString().split('T')[0];
    const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
    const minStr = minDate.toISOString().split('T')[0];

    const room = document.getElementById('f-ruangan')?.value;
    const bookings = room ? loadBookings().filter(b => b.ruangan === room && b.status !== 'rejected') : [];

    // 1. Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const d = prevDaysInMonth - i;
        html += `<div class="ucal-day ucal-outside">${d}</div>`;
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${uCalYear}-${String(uCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const outOfRange = ds < minStr;
        const isSel = ds === selectedDate;
        const bks = bookings.filter(b => b.tanggal === ds);

        let cls = 'ucal-day';
        if (outOfRange) cls += ' ucal-disabled';
        else if (isSel) cls += ' ucal-selected';
        else if (bks.length) cls += ' ucal-has-booking';
        else cls += ' ucal-avail';

        if (ds === today) cls += ' ucal-today';

        const dot = (bks.length && !isSel) ? `<div class="ucal-dot"></div>` : '';
        const click = outOfRange ? '' : `onclick="userCalPickDate('${ds}')"`;
        html += `<div class="${cls}" ${click}><span class="ucal-day-num">${d}</span>${dot}</div>`;
    }

    // 3. Next month days (to fill 42 cells total)
    const totalCells = firstDay + daysInMonth;
    const nextDaysNeeded = 42 - totalCells;
    for (let d = 1; d <= nextDaysNeeded; d++) {
        html += `<div class="ucal-day ucal-outside">${d}</div>`;
    }

    grid.innerHTML = html;
    if (selectedDate) userCalShowPreview(selectedDate);
}

function renderMonthPicker(grid) {
    grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    const mn = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    grid.innerHTML = mn.map((n, i) => `
        <div class="ucal-month-cell ${i === uCalMonth ? 'ucal-m-selected' : ''}" onclick="uCalPickMonth(${i})">${n}</div>
    `).join('');
}

function uCalPickMonth(m) { uCalMonth = m; uCalMode = 'day'; renderUserCal(document.getElementById('f-tanggal')?.value || ''); }

function renderYearPicker(grid) {
    grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    const startY = uCalYear - 4;
    let html = '';
    for (let y = startY; y <= startY + 8; y++) {
        html += `<div class="ucal-month-cell ${y === uCalYear ? 'ucal-m-selected' : ''}" onclick="uCalPickYear(${y})">${y}</div>`;
    }
    grid.innerHTML = html;
}

function uCalPickYear(y) { uCalYear = y; uCalMode = 'month'; renderUserCal(document.getElementById('f-tanggal')?.value || ''); }

function userCalPickDate(ds) {
    const input = document.getElementById('f-tanggal');
    if (!input) return;
    input.value = ds;

    const lbl = new Date(ds + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const disp = document.getElementById('f-tgl-display');
    if (disp) disp.textContent = '→ ' + lbl;

    const err = document.getElementById('e-tanggal');
    if (err) err.classList.remove('show');

    uCalMode = 'day';
    renderUserCal(ds);
    if (typeof onRoomDateChange === 'function') onRoomDateChange();

    // Step indicators
    document.getElementById('step2')?.classList.add('done');
    document.getElementById('step3')?.classList.add('active');
}

function userCalShowPreview(ds) {
    const room = document.getElementById('f-ruangan')?.value;
    const preview = document.getElementById('user-cal-preview');
    const listEl = document.getElementById('user-cal-preview-list');
    if (!preview || !listEl) return;

    const bks = room ? loadBookings().filter(b => b.ruangan === room && b.tanggal === ds && b.status !== 'rejected') : [];

    if (!bks.length) { preview.style.display = 'none'; return; }

    bks.sort((a, b) => timeToMinutes(a.jamMulai) - timeToMinutes(b.jamSelesai));

    const statusStyle = { approved: 'color:var(--green)', pending: 'color:var(--amber)' };
    const statusLabel = { approved: 'Disetujui', pending: 'Menunggu' };

    listEl.innerHTML = bks.map(b => `
        <div class="ucal-prev-item">
            <span class="ucal-prev-time">${b.jamMulai}–${b.jamSelesai}</span>
            <span class="ucal-prev-kep">${b.keperluan}</span>
            <span class="ucal-prev-status" style="${statusStyle[b.status]}">${statusLabel[b.status] || b.status}</span>
        </div>
    `).join('');
    preview.style.display = 'block';
}
