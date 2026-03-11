// src/lib/toastStore.js – Global toast notification store (M10 Task 10.6)
//
// Usage (from any Svelte component or +page.svelte):
//   import { toast } from '$lib/toastStore.js';
//   toast.success('✅ Ort gespeichert');
//   toast.error('⚠️ Fehler beim Laden');
//   toast.info('ℹ️ Keine neuen Ereignisse');
//
// The <Toast /> component in +layout.svelte listens to this store
// and renders toasts in the bottom-right corner.

import { writable } from 'svelte/store';

/** @typedef {{ id: number, type: 'success'|'error'|'info', message: string, duration: number }} ToastItem */

/** @type {import('svelte/store').Writable<ToastItem[]>} */
const { subscribe, update } = writable([]);

let nextId = 0;

/**
 * Add a toast notification.
 * @param {'success'|'error'|'info'} type
 * @param {string} message
 * @param {number} [duration=4000] - Auto-dismiss after ms (0 = never)
 */
function add(type, message, duration = 4000) {
  const id = ++nextId;
  update(toasts => [...toasts, { id, type, message, duration }]);

  if (duration > 0) {
    setTimeout(() => remove(id), duration);
  }

  return id;
}

/**
 * Remove a toast by ID.
 * @param {number} id
 */
function remove(id) {
  update(toasts => toasts.filter(t => t.id !== id));
}

/** Shorthand helpers */
const toast = {
  subscribe,
  /** @param {string} message @param {number} [duration] */
  success: (message, duration) => add('success', message, duration),
  /** @param {string} message @param {number} [duration] */
  error:   (message, duration) => add('error',   message, duration),
  /** @param {string} message @param {number} [duration] */
  info:    (message, duration) => add('info',     message, duration),
  remove,
};

export { toast };
