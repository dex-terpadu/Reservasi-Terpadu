/**
 * LabRoom — Timeline Visualization
 */

const TL_START = 7 * 60, TL_END = 17 * 60, TL_DURATION = TL_END - TL_START;
const getPct = m => Math.max(0, Math.min(100, ((m - TL_START) / TL_DURATION) * 100));

function renderTimeline() {
    const r = document.getElementById('f-ruangan')?.value;
    const d = document.getElementById('f-tanggal')?.value;
    const ms = document.getElementById('f-mulai')?.value;
    const me = document.getElementById('f-selesai')?.value;
    const wrap = document.getElementById('tl-wrap');
    const bar = document.getElementById('tl-bar');
    const ttl = document.getElementById('tl-title');

    if (!r || !d) { wrap?.classList.remove('show'); return; }

    wrap?.classList.add('show');
    if (ttl) ttl.textContent = `${r} · ${new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;

    const existing = loadBookings().filter(b => b.ruangan === r && b.tanggal === d && b.status !== 'rejected');
    let html = existing.map(b => {
        const s = getPct(timeToMinutes(b.jamMulai));
        const e = getPct(timeToMinutes(b.jamSelesai));
        return `<div class="tl-seg booked" style="left:${s}%;width:${Math.max(e - s, 1)}%">${b.jamMulai}–${b.jamSelesai}</div>`;
    }).join('');

    if (ms && me && timeToMinutes(ms) < timeToMinutes(me)) {
        const s = getPct(timeToMinutes(ms)), e = getPct(timeToMinutes(me));
        const isBad = getConflicts(r, d, ms, me).length > 0;
        html += `<div class="tl-seg ${isBad ? 'new-bad' : 'new-ok'}" style="left:${s}%;width:${Math.max(e - s, 1)}%">${ms}–${me}</div>`;
    }
    if (bar) bar.innerHTML = html;
}
