// ============================================================
//  GEMS OF COMBAT — Settings Screen
// ============================================================
import { save, loadSave, writeSave, SAVE_KEY } from '../state/save.js';
import { showScreen } from './navigation.js';
import { renderHome } from './home.js';

export function renderSettings() {
  const list = document.getElementById('settings-list');
  if (!list) return;

  list.innerHTML = `
    <div class="settings-section">
      <div class="settings-section-label">Account</div>

      <div class="settings-row danger-row">
        <div class="settings-row-info">
          <div class="settings-row-title">Reset Account</div>
          <div class="settings-row-desc">Erase all progress and start over. This cannot be undone.</div>
        </div>
        <button id="settings-reset-btn" class="settings-btn danger-btn">Reset</button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-label">About</div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-title">Gems of Combat</div>
          <div class="settings-row-desc">A match-3 RPG inspired by Gems of War</div>
        </div>
      </div>
    </div>
  `;

  // Wire reset button
  list.querySelector('#settings-reset-btn')?.addEventListener('click', confirmReset);

  showScreen('settings');
}

function confirmReset() {
  // Two-step confirmation
  const first = confirm(
    '⚠️ RESET ACCOUNT\n\nThis will permanently erase ALL progress:\n• Heroes & stars\n• Equipment & inventory\n• Gold & materials\n• Dungeon progress\n\nAre you sure?'
  );
  if (!first) return;

  const second = confirm(
    '⚠️ FINAL WARNING\n\nThis action CANNOT be undone.\n\nType OK to confirm account reset.'
  );
  if (!second) return;

  // Wipe save data
  try { localStorage.removeItem(SAVE_KEY); } catch {}
  // Also remove old save keys
  try { localStorage.removeItem('gems_of_combat_v4'); } catch {}
  try { localStorage.removeItem('gems_of_combat_v2'); } catch {}

  // Reload fresh defaults
  loadSave();
  writeSave();

  alert('✅ Account has been reset. Starting fresh!');
  renderHome();
}
