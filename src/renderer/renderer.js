const dropzone = document.getElementById('dropzone');
const btnPickSrc = document.getElementById('pick-src');
const btnPickOut = document.getElementById('pick-out');
const btnGen = document.getElementById('gen');
const btnZip = document.getElementById('zip');

const srcInput = document.getElementById('src');
const outInput = document.getElementById('out');
const nameInput = document.getElementById('name');
const pwdInput = document.getElementById('pwd');
const statusEl = document.getElementById('status');

function setStatus(msg, cls = 'muted') {
  statusEl.className = cls;
  statusEl.textContent = msg;
}

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.style.background = 'rgba(37,99,235,0.06)';
});
dropzone.addEventListener('dragleave', e => {
  e.preventDefault();
  dropzone.style.background = '#fafafa';
});
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.style.background = '#fafafa';
  const files = e.dataTransfer.files;
  if (files && files.length) {
    srcInput.value = files[0].path;
    setStatus('Sumber dipilih via drag & drop.');
  }
});

btnPickSrc.addEventListener('click', async () => {
  const src = await window.ZipperAPI.pickSource();
  if (src) {
    srcInput.value = src;
    setStatus('Sumber dipilih.');
  }
});

btnPickOut.addEventListener('click', async () => {
  const out = await window.ZipperAPI.pickOutputDir();
  if (out) {
    outInput.value = out;
    setStatus('Folder output dipilih.');
  }
});

btnGen.addEventListener('click', () => {
  const rand = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  pwdInput.value = rand;
  setStatus('Password digenerate.');
});

btnZip.addEventListener('click', async () => {
  const payload = {
    srcPath: (srcInput.value || '').trim(),
    outDir: (outInput.value || '').trim(),
    outName: (nameInput.value || '').trim(),
    password: pwdInput.value
  };
  if (!payload.srcPath) return setStatus('Sumber belum dipilih.', 'warn');
  if (!payload.outDir) return setStatus('Folder output belum dipilih.', 'warn');
  if (!payload.password) return setStatus('Password kosong.', 'warn');

  setStatus('Membuat arsip… harap tunggu…');

  try {
    const res = await window.ZipperAPI.zipDo(payload);
    setStatus(`Selesai.\nZIP: ${res.zipPath}\nPassword file: ${res.passTxt}\nTool: ${res.used}`, 'ok');
    await window.ZipperAPI.revealInFinder(res.zipPath);
  } catch (e) {
    setStatus(`Gagal: ${e.message}`, 'warn');
  }
});

// About Modal & Auto-Update
const appTitle = document.getElementById('app-title');
const aboutModal = document.getElementById('about-modal');
const closeModalBtn = document.getElementById('close-modal');
const checkUpdateBtn = document.getElementById('check-update-btn');
const updateStatusEl = document.getElementById('update-status');

// Open Modal
appTitle.addEventListener('click', () => {
  aboutModal.style.display = 'flex';
  updateStatusEl.textContent = '';
  checkUpdateBtn.disabled = false;
  checkUpdateBtn.textContent = 'Check for Update';
});

// Close Modal
closeModalBtn.addEventListener('click', () => {
  aboutModal.style.display = 'none';
});

// Close when clicking outside modal
aboutModal.addEventListener('click', (e) => {
  if (e.target === aboutModal) {
    aboutModal.style.display = 'none';
  }
});

// Check for update
checkUpdateBtn.addEventListener('click', () => {
  if (checkUpdateBtn.textContent === 'Restart & Install') {
    window.ZipperAPI.quitAndInstall();
    return;
  }

  checkUpdateBtn.disabled = true;
  updateStatusEl.textContent = 'Checking for updates...';
  window.ZipperAPI.checkForUpdates();
});

// Listeners
window.ZipperAPI.onUpdateMessage((text) => {
  updateStatusEl.textContent = text;
  if (text.includes('not available') || text.includes('Error')) {
    checkUpdateBtn.disabled = false;
  }
});

window.ZipperAPI.onUpdateDownloaded((info) => {
  updateStatusEl.textContent = `Update downloaded (v${info.version}).`;
  checkUpdateBtn.disabled = false;
  checkUpdateBtn.textContent = 'Restart & Install';
});
