/**
 * LabRoom — Chatbot & Form Injection
 */

const MESSAGES_CONTAINER = document.getElementById('messages');
const BOT_AVATAR = `<div class="bot-av"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="3"/><path d="M8 21h8M12 17v4"/></svg></div>`;

function addBotMsg(html) {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    wrap.innerHTML = `${BOT_AVATAR}<div class="bbl">${html}</div>`;
    MESSAGES_CONTAINER.appendChild(wrap);
    setTimeout(() => MESSAGES_CONTAINER.scrollTop = MESSAGES_CONTAINER.scrollHeight, 60);
}

function showTyping() {
    return new Promise(resolve => {
        const wrap = document.createElement('div');
        wrap.className = 'msg bot';
        wrap.id = 'typing';
        wrap.innerHTML = `${BOT_AVATAR}<div class="typing-bbl"><span class="tdot"></span><span class="tdot"></span><span class="tdot"></span></div>`;
        MESSAGES_CONTAINER.appendChild(wrap);
        MESSAGES_CONTAINER.scrollTop = MESSAGES_CONTAINER.scrollHeight;
        setTimeout(() => { wrap.remove(); resolve(); }, 850);
    });
}

/** Injects the entire booking form card into the chat */
function injectFormCard() {
    const rooms = loadRooms();
    const todayStr = new Date().toISOString().split('T')[0];

    const roomOptions = rooms.map(r => {
        const blocked = isRoomBlocked(r.name, todayStr);
        const statusTxt = r.status === 'maintenance' ? ' — Maintenance' : r.status === 'closed' ? ' — Ditutup' : '';
        return `<option value="${r.name}" ${blocked ? 'disabled' : ''} style="${blocked ? 'color:var(--text3)' : ''}">
            ${r.name} (Maks. ${r.cap} orang)${statusTxt}
        </option>`;
    }).join('');

    const fakultasArr = [
        'Fakultas Teknik', 'Fakultas MIPA', 'Fakultas Pertanian', 'Fakultas Kehutanan',
        'Fakultas Ekonomi & Bisnis', 'Fakultas Hukum', 'Fakultas Ilmu Sosial & Ilmu Politik',
        'Fakultas Kedokteran', 'Fakultas Keguruan & Ilmu Pendidikan', 'Pascasarjana', 'Lainnya'
    ];
    const fakultasOptions = fakultasArr.map(f => `<option value="${f}">${f}</option>`).join('');

    const wrap = document.createElement('div');
    wrap.innerHTML = `
    <div class="form-card" id="booking-form">
        <div class="fc-inner">
            <!-- STEP 1: APPLICANT -->
            <div class="fc-section">
                <div class="fc-section-header">
                    <div class="fc-section-num">1</div>
                    <div class="fc-section-label">Data Pemohon</div>
                </div>
                <div class="fc-field" style="margin-bottom:16px">
                    <label class="fc-label">Jenis Pemohon <span class="req">*</span></label>
                    <div class="jenis-group">
                        <button type="button" class="jenis-btn" id="jenis-umum" onclick="selectApplicantType('umum')">
                            <div class="jenis-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
                            <div class="jenis-name">Umum / Luar</div>
                            <span class="jenis-badge umum">Instansi</span>
                        </button>
                        <button type="button" class="jenis-btn" id="jenis-untan" onclick="selectApplicantType('untan')">
                            <div class="jenis-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
                            <div class="jenis-name">Civitas Untan</div>
                            <span class="jenis-badge untan">Fakultas</span>
                        </button>
                    </div>
                    <div id="e-jenis" class="err-box" style="display:none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Pilih jenis pemohon terlebih dahulu
                    </div>
                </div>

                <div class="fc-grid">
                    <div class="fc-field">
                        <label class="fc-label">Nama Lengkap <span class="req">*</span></label>
                        <input class="fc-input" id="f-nama" type="text" placeholder="contoh: Budi Santoso" oninput="vld('f-nama','e-nama')"/>
                        <div class="err-text" id="e-nama">Nama tidak boleh kosong</div>
                    </div>
                    <div class="fc-field">
                        <label class="fc-label">No. HP / Email <span class="req">*</span></label>
                        <input class="fc-input" id="f-kontak" type="text" placeholder="08xxx / nama@email.com" oninput="vld('f-kontak','e-kontak')"/>
                        <div class="err-text" id="e-kontak">Kontak tidak boleh kosong</div>
                    </div>
                </div>

                <div class="fc-field" id="field-instansi" style="display:none">
                    <label class="fc-label">Nama Instansi <span class="req">*</span></label>
                    <input class="fc-input" id="f-inst" type="text" placeholder="contoh: PT. Borneo Teknologi" oninput="vld('f-inst','e-inst')"/>
                    <div class="err-text" id="e-inst">Instansi tidak boleh kosong</div>
                </div>

                <div class="fc-field" id="field-fakultas" style="display:none">
                    <label class="fc-label">Fakultas / Bagian <span class="req">*</span></label>
                    <select class="fc-input" id="f-fakultas" onchange="vld('f-fakultas','e-fakultas')">
                        <option value="">— Pilih Fakultas —</option>
                        ${fakultasOptions}
                    </select>
                    <div class="err-text" id="e-fakultas">Pilih fakultas Anda</div>
                </div>
            </div>

            <!-- STEP 2: BOOKING DETAILS -->
            <div class="fc-section">
                <div class="fc-section-header">
                    <div class="fc-section-num">2</div>
                    <div class="fc-section-label">Detail Pemesanan</div>
                </div>
                <div class="fc-grid">
                    <div class="fc-field">
                        <label class="fc-label">Ruangan <span class="req">*</span></label>
                        <select class="fc-input" id="f-ruangan" onchange="onRoomDateChange();showRoomInfo()">
                            <option value="">— Pilih Ruangan —</option>
                            ${roomOptions}
                        </select>
                        <div class="err-text" id="e-ruangan">Pilih ruangan</div>
                    </div>
                    <div class="fc-field">
                        <label class="fc-label">
                            Tanggal Pemakaian <span class="req">*</span>
                            <span id="f-tgl-display" class="fc-tgl-lbl"></span>
                        </label>
                        <div class="user-cal-wrap" id="user-cal-wrap">
                            <div class="user-cal-nav">
                                <button type="button" onclick="userCalNavPrev()" class="user-cal-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:16px;height:16px"><polyline points="15 18 9 12 15 6"/></svg>
                                </button>
                                <div class="user-cal-header-center">
                                    <button type="button" onclick="userCalSetMode('month')" class="ucal-hdr-btn" id="ucal-hdr-month"></button>
                                    <button type="button" onclick="userCalSetMode('year')"  class="ucal-hdr-btn" id="ucal-hdr-year"></button>
                                </div>
                                <button type="button" onclick="userCalNavNext()" class="user-cal-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:16px;height:16px"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                            </div>
                            <div id="user-cal-grid" class="user-cal-grid"></div>
                            <div id="user-cal-preview" class="user-cal-preview" style="display:none">
                                <div class="ucal-prev-lbl">Jadwal ruangan hari ini:</div>
                                <div id="user-cal-preview-list"></div>
                            </div>
                        </div>
                        <input type="hidden" id="f-tanggal"/>
                        <div class="err-text" id="e-tanggal">Pilih tanggal (min. H+1)</div>
                    </div>
                </div>

                <div id="fasilitas-panel" class="fasilitas-panel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div class="fasilitas-content">
                        <div class="fasilitas-label">Fasilitas Ruangan</div>
                        <div id="fasilitas-text" style="font-size:12.5px;color:var(--text2)">—</div>
                    </div>
                </div>

                <div id="blocked-panel" class="blocked-panel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    <span id="blocked-text">Ruangan tidak tersedia</span>
                </div>

                <div class="fc-field">
                    <label class="fc-label">Rentang Jam Pemakaian <span class="req">*</span> <span class="sub-label">(07:00 – 17:00 WIB)</span></label>
                    <div class="time-row">
                        <input type="time" class="fc-input" id="f-mulai" min="07:00" max="17:00" onchange="onTimeChange()"/>
                        <div class="time-sep">—</div>
                        <input type="time" class="fc-input" id="f-selesai" min="07:00" max="17:00" onchange="onTimeChange()"/>
                    </div>
                    <div class="err-text" id="e-time">Jam tidak valid (07:00–17:00)</div>
                </div>

                <div class="conflict-panel" id="conflict-panel">
                    <div class="conflict-title">⚠️ Jadwal Bentrok! Waktu ini sudah dipesan:</div>
                    <div id="conflict-items"></div>
                </div>
                <div class="ok-panel" id="ok-panel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Waktu tersedia — tidak ada bentrok jadwal.</span>
                </div>

                <div class="tl-wrap" id="tl-wrap">
                    <div class="tl-label">Peta Jadwal: <span id="tl-title" style="font-weight:400;color:var(--text2)">—</span></div>
                    <div class="tl-bar" id="tl-bar"></div>
                    <div class="tl-ticks"><span>07:00</span><span>09:00</span><span>11:00</span><span>13:00</span><span>15:00</span><span>17:00</span></div>
                    <div class="tl-legend">
                        <div class="tl-legend-item"><div class="tl-legend-dot" style="background:rgba(192,57,43,.3)"></div>Terpesan</div>
                        <div class="tl-legend-item"><div class="tl-legend-dot" style="background:rgba(26,127,75,.3)"></div>Aman</div>
                        <div class="tl-legend-item"><div class="tl-legend-dot" style="background:rgba(192,57,43,.5)"></div>Bentrok</div>
                    </div>
                </div>
            </div>

            <!-- STEP 3: PURPOSE -->
            <div class="fc-section" style="border:none;margin-bottom:0;padding-bottom:0">
                <div class="fc-section-header">
                    <div class="fc-section-num">3</div>
                    <div class="fc-section-label">Keperluan</div>
                </div>
                <div class="fc-field" style="margin-bottom:0">
                    <label class="fc-label">Keperluan / Keterangan <span class="req">*</span></label>
                    <input class="fc-input" id="f-kep" type="text" placeholder="contoh: Praktikum Basis Data" oninput="vld('f-kep','e-kep')"/>
                    <div class="err-text" id="e-kep">Keperluan tidak boleh kosong</div>
                </div>
            </div>
        </div>

        <div class="fc-form-footer">
            <button class="fc-submit" id="submit-btn" onclick="submitBooking()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor"/></svg>
                Kirim Permohonan Pemesanan
            </button>
            <div class="submit-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Data Anda aman dan hanya digunakan untuk keperluan sistem ini.
            </div>
        </div>
    </div>`;

    MESSAGES_CONTAINER.appendChild(wrap);
    setTimeout(() => {
        MESSAGES_CONTAINER.scrollTop = MESSAGES_CONTAINER.scrollHeight;
        if (typeof initUserCal === 'function') initUserCal();
    }, 60);
}

/** Inits the chatbot flow */
async function initChatbot() {
    MESSAGES_CONTAINER.innerHTML = '';
    await showTyping();
    addBotMsg("Selamat datang di <strong>LabRoom</strong> Universitas Tanjungpura! 👋");
    await showTyping();
    addBotMsg("Saya adalah asisten LabBot. Silakan lengkapi formulir di bawah untuk melakukan reservasi ruangan laboratorium.");
    await showTyping();
    injectFormCard();

    // Default selection: Civitas Untan
    if (typeof selectApplicantType === 'function') {
        selectApplicantType('untan');
    }
}

/** Resets the chatbot to initial state without page reload */
function resetChatbot() {
    // Reset steps UI if present
    document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active', 'done'));
    document.getElementById('step1')?.classList.add('active');
    
    // Clear and re-init
    initChatbot();
}
