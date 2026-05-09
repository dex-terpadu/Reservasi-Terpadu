/**
 * LabRoom — Admin Utilities & Data Fetching
 */

// Global Data Storage
let GLOBAL_ROOMS = [];
let GLOBAL_BOOKINGS = [];

/** Convert HH:mm to minutes from midnight */
const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

/** Format YYYY-MM-DD to DD/MM/YYYY */
const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
};

/** Detect conflicts between a potential booking and existing ones */
const getConflicts = (ruangan, tanggal, mulai, selesai, excludeId = null) => {
    const start = timeToMinutes(mulai);
    const end = timeToMinutes(selesai);

    return GLOBAL_BOOKINGS.filter(b => {
        if (b.id === excludeId) return false;
        if (b.ruangan !== ruangan || b.tanggal !== tanggal || b.status === 'rejected') return false;
        return start < timeToMinutes(b.jamSelesai) && end > timeToMinutes(b.jamMulai);
    });
};

async function fetchData() {
    try {
        const roomsRes = await fetch('/api/rooms');
        GLOBAL_ROOMS = await roomsRes.json();

        const bookingsRes = await fetch('/api/bookings');
        GLOBAL_BOOKINGS = await bookingsRes.json();
    } catch (e) {
        console.error('Gagal mengambil data dari API', e);
    }
}
