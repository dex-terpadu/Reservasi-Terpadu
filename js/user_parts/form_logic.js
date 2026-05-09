/**
 * LabRoom — Booking Form Logic & Submission
 */

let applicantType = ''; // 'umum' or 'untan'

function selectApplicantType(type) {
    applicantType = type;
    const btnUmum = document.getElementById('jenis-umum');
    const btnUntan = document.getElementById('jenis-untan');
    const instansiField = document.getElementById('field-instansi');
    const fakultasField = document.getElementById('field-fakultas');

    if (!btnUmum || !btnUntan) return;

    btnUmum.className = 'jenis-btn';
    btnUntan.className = 'jenis-btn';

    if (type === 'umum') {
        btnUmum.className = 'jenis-btn active-umum';
        if (instansiField) instansiField.style.display = '';
        if (fakultasField) fakultasField.style.display = 'none';
        const fakultasInput = document.getElementById('f-fakultas');
        if (fakultasInput) fakultasInput.value = '';
    } else {
        btnUntan.className = 'jenis-btn active-untan';
        if (instansiField) instansiField.style.display = 'none';
        if (fakultasField) fakultasField.style.display = '';
        const instansiInput = document.getElementById('f-inst');
        if (instansiInput) instansiInput.value = '';
    }

    // Hide error
    const errJenis = document.getElementById('e-jenis');
    if (errJenis) errJenis.style.display = 'none';
}

function getInstansiValue() {
    if (applicantType === 'umum') {
        const val = document.getElementById('f-inst')?.value || '';
        return val.trim() ? `${val.trim()} (Umum)` : '';
    } else if (applicantType === 'untan') {
        const val = document.getElementById('f-fakultas')?.value || '';
        return val.trim() ? `${val.trim()} — Untan` : '';
    }
    return '';
}

function vld(id, eid) {
    const el = document.getElementById(id);
    if (!el) return;
    const ok = el.value.trim().length > 0;
    el.classList.toggle('ok', ok);
    el.classList.toggle('err', !ok);
    const err = document.getElementById(eid);
    if (err) err.classList.toggle('show', !ok);
}

function showRoomInfo() {
    const room = document.getElementById('f-ruangan')?.value;
    const fasPanel = document.getElementById('fasilitas-panel');
    const blkPanel = document.getElementById('blocked-panel');
    if (!fasPanel || !blkPanel) return;

    if (!room) { fasPanel.classList.remove('show'); blkPanel.classList.remove('show'); return; }

    const info = getRoomInfo(room);
    if (!info) return;

    if (info.fasilitas) {
        document.getElementById('fasilitas-text').textContent = info.fasilitas;
        fasPanel.classList.add('show');
    } else {
        fasPanel.classList.remove('show');
    }

    const date = document.getElementById('f-tanggal')?.value || new Date().toISOString().split('T')[0];
    if (info.status !== 'available' && isRoomBlocked(room, date)) {
        const labels = { maintenance: '🔧 Sedang Maintenance', closed: '🚫 Ruangan Ditutup' };
        const until = info.closedUntil ? ` sampai ${info.closedUntil.split('-').reverse().join('/')}` : '';
        document.getElementById('blocked-text').textContent = (labels[info.status] || 'Tidak Tersedia') + until + ' — tidak dapat dipesan';
        blkPanel.classList.add('show');
        document.getElementById('submit-btn').disabled = true;
    } else {
        blkPanel.classList.remove('show');
        document.getElementById('submit-btn').disabled = false;
    }
}

function checkConflict() {
    const r = document.getElementById('f-ruangan')?.value;
    const d = document.getElementById('f-tanggal')?.value;
    const ms = document.getElementById('f-mulai')?.value;
    const me = document.getElementById('f-selesai')?.value;
    const cp = document.getElementById('conflict-panel');
    const op = document.getElementById('ok-panel');

    if (cp) cp.classList.remove('show');
    if (op) op.classList.remove('show');

    if (!r || !d || !ms || !me || timeToMinutes(ms) >= timeToMinutes(me)) return;

    const conflicts = getConflicts(r, d, ms, me);
    if (conflicts.length) {
        if (cp) {
            cp.classList.add('show');
            document.getElementById('conflict-items').innerHTML = conflicts.map(b => `
                <div class="conflict-item"><strong>${b.nama}</strong> — ${b.jamMulai}–${b.jamSelesai}</div>
            `).join('');
        }
        document.getElementById('f-mulai')?.classList.add('err');
        document.getElementById('f-selesai')?.classList.add('err');
    } else {
        if (op) op.classList.add('show');
        document.getElementById('f-mulai')?.classList.remove('err');
        document.getElementById('f-selesai')?.classList.remove('err');
        document.getElementById('f-mulai')?.classList.add('ok');
        document.getElementById('f-selesai')?.classList.add('ok');
    }
}

function onTimeChange() {
    const ms = document.getElementById('f-mulai')?.value;
    const me = document.getElementById('f-selesai')?.value;
    const err = document.getElementById('e-time');
    const btn = document.getElementById('submit-btn');

    let isInvalid = false;
    if (ms && me) {
        const s = timeToMinutes(ms), e = timeToMinutes(me);
        if (s >= e || s < 7 * 60 || e > 17 * 60) isInvalid = true;
    }

    if (err) err.classList.toggle('show', isInvalid);
    if (btn) btn.disabled = isInvalid;

    checkConflict();
    if (typeof renderTimeline === 'function') renderTimeline();
}

function onRoomDateChange() {
    showRoomInfo();
    checkConflict();
    if (typeof renderTimeline === 'function') renderTimeline();
}

async function submitBooking() {
    if (!applicantType) {
        const err = document.getElementById('e-jenis');
        if (err) err.style.display = 'flex';
        showToast('Pilih jenis pemohon (Umum / Untan).', 'warn');
        return;
    }

    const fields = ['f-nama', 'f-kontak', 'f-ruangan', 'f-kep'];
    let isAllValid = true;

    fields.forEach(fid => {
        const el = document.getElementById(fid);
        const val = el?.value.trim();
        if (!val) {
            el?.classList.add('err');
            const err = document.getElementById('e-' + fid.split('-')[1]);
            if (err) err.classList.add('show');
            isAllValid = false;
        }
    });

    if (applicantType === 'umum') {
        const el = document.getElementById('f-inst');
        if (!el?.value.trim()) { el?.classList.add('err'); document.getElementById('e-inst')?.classList.add('show'); isAllValid = false; }
    } else {
        const el = document.getElementById('f-fakultas');
        if (!el?.value.trim()) { el?.classList.add('err'); document.getElementById('e-fakultas')?.classList.add('show'); isAllValid = false; }
    }

    const ms = document.getElementById('f-mulai')?.value, me = document.getElementById('f-selesai')?.value;
    if (!ms || !me || timeToMinutes(ms) >= timeToMinutes(me)) { isAllValid = false; document.getElementById('e-time')?.classList.add('show'); }

    if (!isAllValid) { showToast('Lengkapi data yang ditandai merah.', 'warn'); return; }

    const room = document.getElementById('f-ruangan').value;
    const date = document.getElementById('f-tanggal').value;

    if (getConflicts(room, date, ms, me).length > 0) { showToast('Jadwal bentrok!', 'error'); return; }

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Mengirim...';

    const payload = {
        room_name: room,
        nama: document.getElementById('f-nama').value.trim(),
        instansi: getInstansiValue(),
        kontak: document.getElementById('f-kontak').value.trim(),
        tanggal: date,
        jamMulai: ms,
        jamSelesai: me,
        keperluan: document.getElementById('f-kep').value.trim()
    };

    try {
        // Save to GLOBAL and localStorage
        const list = loadBookings();
        const booking = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'pending',
            ...payload
        };
        list.push(booking);
        saveBookings(list);

        if (typeof renderSidebar === 'function') renderSidebar();

        document.getElementById('step3')?.classList.add('done');
        document.getElementById('booking-form').innerHTML = renderSuccessState(booking.id, payload);
        showToast('Permohonan Berhasil Dikirim!', 'success');
        
    } catch (e) {
        showToast('Gagal mengirim data.', 'error');
        btn.disabled = false;
        btn.textContent = 'Kirim Permohonan Pemesanan';
    }
}

function renderSuccessState(id, p) {
    const dateStr = new Date(p.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return `
        <div class="success-state">
            <div class="success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div class="success-title">Permohonan Terkirim!</div>
            <div class="success-sub">Admin akan meninjau permohonan Anda dan menghubungi melalui <strong style="color:var(--navy)">${p.kontak}</strong>.</div>
            <div class="success-receipt">
                <div class="receipt-row"><span>Nomor</span><span>#${id}</span></div>
                <div class="receipt-row"><span>Ruangan</span><span>${p.room_name}</span></div>
                <div class="receipt-row"><span>Waktu</span><span>${p.jamMulai}–${p.jamSelesai} WIB</span></div>
                <div class="receipt-row"><span>Tanggal</span><span>${dateStr}</span></div>
                <div class="receipt-row"><span>Pemohon</span><span>${p.nama}</span></div>
            </div>
            <span class="sbadge pending">● Menunggu Konfirmasi Admin</span>
            <button onclick="resetChatbot()" class="fc-submit" style="margin-top:24px; background: linear-gradient(135deg, var(--gold2), var(--gold)); border:none; box-shadow: 0 4px 15px var(--gold-glow); color:white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;margin-right:8px"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                Buat Reservasi Baru
            </button>
        </div>
    `;
}
