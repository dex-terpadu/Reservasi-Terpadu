/**
 * LabRoom — Admin Detail Modal & Timeline
 */

const TL_START = 7 * 60, TL_END = 17 * 60, TL_DURATION = TL_END - TL_START;
const getTimelinePct = m => Math.max(0, Math.min(100, ((m - TL_START) / TL_DURATION) * 100));

function openModal(id) {
    const b = GLOBAL_BOOKINGS.find(x => x.id === id);
    if (!b) return;

    const df = d => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    document.getElementById('m-title').textContent = 'Pemesanan: ' + b.ruangan;
    document.getElementById('m-sub').textContent = 'Diajukan oleh ' + b.nama + ' · ' + (b.instansi || '—');
    document.getElementById('m-nama').textContent = b.nama;
    document.getElementById('m-inst').textContent = b.instansi || '—';
    document.getElementById('m-kontak').textContent = b.kontak;
    document.getElementById('m-room').textContent = b.ruangan;
    document.getElementById('m-time').textContent = df(b.tanggal) + ', ' + b.jamMulai + ' – ' + b.jamSelesai;
    document.getElementById('m-kep').textContent = b.keperluan;

    // Render Timeline
    const others = GLOBAL_BOOKINGS.filter(x => x.ruangan === b.ruangan && x.tanggal === b.tanggal && x.id !== b.id && x.status !== 'rejected');
    let tlHtml = others.map(x => {
        const s = getTimelinePct(timeToMinutes(x.jamMulai));
        const e = getTimelinePct(timeToMinutes(x.jamSelesai));
        return `<div class="mtls bkd" style="left:${s}%;width:${Math.max(e - s, 1)}%">${x.jamMulai}–${x.jamSelesai}</div>`;
    }).join('');

    const curS = getTimelinePct(timeToMinutes(b.jamMulai));
    const curE = getTimelinePct(timeToMinutes(b.jamSelesai));
    tlHtml += `<div class="mtls cur" style="left:${curS}%;width:${Math.max(curE - curS, 1)}%">${b.jamMulai}–${b.jamSelesai}</div>`;
    document.getElementById('m-tl-bar').innerHTML = tlHtml;

    // Check Conflicts
    const conflicts = (typeof getConflicts === 'function') ? getConflicts(b.ruangan, b.tanggal, b.jamMulai, b.jamSelesai, b.id) : [];
    const warnEl = document.getElementById('m-warn');
    if (conflicts.length) {
        if (warnEl) {
            warnEl.classList.add('show');
            const warnTxt = document.getElementById('m-warn-text');
            if (warnTxt) warnTxt.innerHTML = '⚠️ Bentrok dengan: ' + conflicts.map(c => `<strong>${c.nama}</strong> (${c.jamMulai}–${c.jamSelesai})`).join(', ') + '.';
        }
    } else {
        if (warnEl) warnEl.classList.remove('show');
    }

    // Modal Actions
    const approveBtn = document.getElementById('m-approve');
    const rejectBtn = document.getElementById('m-reject');

    if (b.status === 'pending') {
        if (approveBtn) {
            approveBtn.style.display = '';
            approveBtn.onclick = () => decideInModal(id, 'approved');
        }
        if (rejectBtn) {
            rejectBtn.style.display = '';
            rejectBtn.onclick = () => decideInModal(id, 'rejected');
        }
    } else {
        if (approveBtn) approveBtn.style.display = 'none';
        if (rejectBtn) rejectBtn.style.display = 'none';
    }

    document.getElementById('overlay').classList.add('show');
}

function closeModal() {
    document.getElementById('overlay').classList.remove('show');
}

async function decideInModal(id, status) {
    if (typeof quickDecide === 'function') await quickDecide(id, status);
    closeModal();
}
