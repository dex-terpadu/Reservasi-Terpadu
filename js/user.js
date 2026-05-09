/**
 * LabRoom — User Frontend JavaScript Entry Point (Static Version for GitHub Pages)
 */

const DR = [
    { name: 'Lab Komputer A', cap: 30, fasilitas: '30 PC, Proyektor, AC, WiFi, Whiteboard', status: 'available', closedUntil: '' },
    { name: 'Lab Komputer B', cap: 30, fasilitas: '30 PC, Proyektor, AC, WiFi, Printer', status: 'available', closedUntil: '' },
    { name: 'Lab Jaringan', cap: 24, fasilitas: '24 PC, Rack Server, Switch, Router, Kabel UTP', status: 'available', closedUntil: '' },
    { name: 'Lab Elektronika', cap: 20, fasilitas: 'Osiloskop, PCB, Solder, Power Supply, Multimeter', status: 'available', closedUntil: '' },
    { name: 'Ruang Seminar', cap: 60, fasilitas: 'Meja Bundar, Proyektor, Sound System, AC, Papan Tulis', status: 'available', closedUntil: '' },
    { name: 'Ruang Rapat', cap: 15, fasilitas: 'Meja Rapat, Proyektor, TV, AC, Whiteboard', status: 'available', closedUntil: '' }
];

const loadInitialData = () => {
    // Load Rooms
    const savedRooms = localStorage.getItem('labroom_rooms');
    if (savedRooms) {
        GLOBAL_ROOMS = JSON.parse(savedRooms);
    } else {
        GLOBAL_ROOMS = DR;
        localStorage.setItem('labroom_rooms', JSON.stringify(DR));
    }

    // Load Bookings
    const savedBookings = localStorage.getItem('labroom_bookings');
    if (savedBookings) {
        GLOBAL_BOOKINGS = JSON.parse(savedBookings);
    } else {
        // Initial Mock Bookings
        GLOBAL_BOOKINGS = [
            { id: 1001, createdAt: new Date().toISOString(), nama: 'Rina Agustina', instansi: 'Teknik Informatika — Untan', jenisPemohon: 'untan', kontak: 'rina@example.com', ruangan: 'Lab Komputer A', tanggal: '2026-04-17', jamMulai: '09:00', jamSelesai: '11:00', keperluan: 'Praktikum Pemrograman Web', status: 'approved' },
            { id: 1002, createdAt: new Date().toISOString(), nama: 'Dimas Prasetyo', instansi: 'Fakultas Teknik — Untan', jenisPemohon: 'untan', kontak: '081234567890', ruangan: 'Lab Elektronika', tanggal: '2026-04-17', jamMulai: '13:00', jamSelesai: '15:00', keperluan: 'Penelitian Tugas Akhir', status: 'approved' }
        ];
        localStorage.setItem('labroom_bookings', JSON.stringify(GLOBAL_BOOKINGS));
    }
};

/** Function to save bookings (called by form_logic.js or chatbot.js) */
const saveBookings = (list) => {
    GLOBAL_BOOKINGS = list;
    localStorage.setItem('labroom_bookings', JSON.stringify(list));
};

async function init() {
    loadInitialData();

    if (typeof renderSidebar === 'function') renderSidebar();
    if (typeof initAnimations === 'function') initAnimations();

    if (typeof initChatbot === 'function') await initChatbot();
}

document.addEventListener('DOMContentLoaded', init);
