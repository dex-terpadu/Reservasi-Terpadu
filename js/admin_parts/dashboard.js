/**
 * LabRoom — Admin Dashboard & Tables
 */

async function renderAdmin() {
    if (typeof fetchData === 'function') await fetchData();

    const bookings = GLOBAL_BOOKINGS;
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const approvedCount = bookings.filter(b => b.status === 'approved').length;
    const rejectedCount = bookings.filter(b => b.status === 'rejected').length;

    // Update statistics
    const updateCount = (ids, val) => ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    });

    updateCount(['s-total', 'a-total'], bookings.length);
    updateCount(['s-pending', 'a-pending'], pendingCount);
    updateCount(['s-approved', 'a-approved'], approvedCount);
    updateCount(['s-rejected', 'a-rejected'], rejectedCount);

    // Update filter badges count
    ['df', 'lf'].forEach(prefix => {
        const allCnt = document.getElementById(`${prefix}-cnt-all`);
        const pndCnt = document.getElementById(`${prefix}-cnt-pending`);
        const appCnt = document.getElementById(`${prefix}-cnt-approved`);
        const rejCnt = document.getElementById(`${prefix}-cnt-rejected`);
        
        if (allCnt) allCnt.textContent = bookings.length;
        if (pndCnt) pndCnt.textContent = pendingCount;
        if (appCnt) appCnt.textContent = approvedCount;
        if (rejCnt) rejCnt.textContent = rejectedCount;
    });

    if (typeof renderRoomsPanel === 'function') renderRoomsPanel();
    renderDashTable();
    renderListTable();
}

/** Helper to build table rows HTML */
function buildRows(data) {
    if (!data.length) {
        return `
            <div class="es">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p>Tidak ada data pemesanan</p>
            </div>
        `;
    }

    return data.map(b => {
        const statusClass = b.status; // pending, approved, rejected
        const statusLabel = b.status === 'pending' ? 'Menunggu' : b.status === 'approved' ? 'Disetujui' : 'Ditolak';

        // Check conflicts only for pending
        const conflicts = (b.status === 'pending' && typeof getConflicts === 'function') ? getConflicts(b.ruangan, b.tanggal, b.jamMulai, b.jamSelesai, b.id) : [];
        const conflictBadge = conflicts.length ? '<span class="cbg">⚠️ Bentrok</span>' : '';

        const actions = (b.status === 'pending')
            ? `<button class="ab2 vw" onclick="openModal(${b.id})">Tinjau</button>
               <button class="ab2 ar" onclick="quickDecide(${b.id}, 'rejected')">Tolak</button>`
            : `<button class="ab2 vw" onclick="openModal(${b.id})">Detail</button>`;

        return `
            <div class="brow">
                <div class="c">
                    <div class="cn">${b.nama}${conflictBadge}</div>
                    <div class="cs">${b.kontak}</div>
                </div>
                <div class="c col-inst" style="font-size:12.5px;color:var(--text2)">${b.instansi || '—'}</div>
                <div class="c" style="font-size:12.5px">${b.ruangan}</div>
                <div class="c col-time">
                    ${typeof formatDate === 'function' ? formatDate(b.tanggal) : b.tanggal}<br>
                    <span style="color:var(--text3);font-size:11.5px">${b.jamMulai}–${b.jamSelesai}</span>
                </div>
                <div class="c">
                    <span class="tag ${statusClass}"><span class="tdot"></span>${statusLabel}</span>
                </div>
                <div class="acts">${actions}</div>
            </div>
        `;
    }).join('');
}

function renderDashTable() {
    const listEl = document.getElementById('dash-blist');
    if (!listEl) return;

    let data = GLOBAL_BOOKINGS;
    if (dashFilter !== 'all') data = data.filter(b => b.status === dashFilter);
    if (dashSearchQuery) {
        data = data.filter(b =>
            b.nama.toLowerCase().includes(dashSearchQuery) ||
            b.ruangan.toLowerCase().includes(dashSearchQuery) ||
            (b.instansi || '').toLowerCase().includes(dashSearchQuery)
        );
    }
    data.sort((a, b) => b.id - a.id);
    listEl.innerHTML = buildRows(data.slice(0, 10));
}

function setDashFilter(filter, btn) {
    dashFilter = filter;
    document.querySelectorAll('#dash-fbar .fb').forEach(b => b.className = 'fb');

    const modeClasses = {
        all: 'fb active',
        pending: 'fb active-amber',
        approved: 'fb active-green',
        rejected: 'fb active-red'
    };
    if (btn) btn.className = modeClasses[filter] || 'fb active';
    renderDashTable();
}

function setDashSearch(q) {
    dashSearchQuery = q.toLowerCase();
    renderDashTable();
}

function renderListTable() {
    const listEl = document.getElementById('list-blist');
    if (!listEl) return;

    let data = GLOBAL_BOOKINGS;
    if (listFilter !== 'all') data = data.filter(b => b.status === listFilter);
    if (listSearchQuery) {
        data = data.filter(b =>
            b.nama.toLowerCase().includes(listSearchQuery) ||
            b.ruangan.toLowerCase().includes(listSearchQuery) ||
            (b.instansi || '').toLowerCase().includes(listSearchQuery)
        );
    }
    data.sort((a, b) => b.id - a.id);
    listEl.innerHTML = buildRows(data);
}

function setListFilter(filter, btn) {
    listFilter = filter;
    ['all', 'pending', 'approved', 'rejected'].forEach(x => {
        const b = document.getElementById('lf-' + x);
        if (b) b.className = 'fb';
    });

    const modeClasses = {
        all: 'fb active',
        pending: 'fb active-amber',
        approved: 'fb active-green',
        rejected: 'fb active-red'
    };
    if (btn) btn.className = modeClasses[filter] || 'fb active';
    renderListTable();
}

function setListSearch(q) {
    listSearchQuery = q.toLowerCase();
    renderListTable();
}
