/**
 * LabRoom — User Utilities & Global Data
 */

let GLOBAL_ROOMS = [];
let GLOBAL_BOOKINGS = [];

/** Helpers to access global data */
const loadRooms = () => GLOBAL_ROOMS;
const loadBookings = () => GLOBAL_BOOKINGS;
const getRoomInfo = (name) => loadRooms().find(r => r.name === name) || null;

/** Convert HH:mm to total minutes from midnight */
const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

/** Check if a room is locked for a specific date (maintenance/closed) */
const isRoomBlocked = (name, date) => {
    const info = getRoomInfo(name);
    if (!info) return false;
    if (info.status === 'available') return false;
    if (!info.closedUntil) return true; // Forever if no date
    return date <= info.closedUntil;
};

/** Detect scheduling conflicts */
const getConflicts = (ruangan, tanggal, mulai, selesai, excludeId = null) => {
    if (!ruangan || !tanggal || !mulai || !selesai) return [];
    const start = timeToMinutes(mulai);
    const end = timeToMinutes(selesai);

    if (start >= end) return [];

    return loadBookings().filter(b => {
        if (b.id === excludeId) return false;
        if (b.ruangan !== ruangan || b.tanggal !== tanggal || b.status === 'rejected') return false;
        const bStart = timeToMinutes(b.jamMulai);
        const bEnd = timeToMinutes(b.jamSelesai);
        return start < bEnd && end > bStart;
    });
};
