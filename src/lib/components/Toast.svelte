<!-- Toast.svelte – Global toast notification renderer (M10 Task 10.6)
     Included once in +layout.svelte. Subscribes to the toastStore.
     Toasts appear bottom-right, auto-dismiss after 4 s (configurable per toast).
-->
<script>
  import { toast } from '$lib/toastStore.js';
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
</script>

<!-- Portal-style: positioned fixed in the viewport -->
<div class="toast-container" aria-live="polite" aria-atomic="false">
  {#each $toast as item (item.id)}
    <div
      class="toast toast--{item.type}"
      role="status"
      animate:flip={{ duration: 200 }}
      transition:fly={{ y: 20, duration: 250 }}
      on:click={() => toast.remove(item.id)}
    >
      <span class="toast-message">{item.message}</span>
      <button
        class="toast-close"
        aria-label="Schließen"
        on:click|stopPropagation={() => toast.remove(item.id)}
      >✕</button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    pointer-events: none; /* container transparent to clicks */
    max-width: 360px;
    width: calc(100vw - 3rem);
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid transparent;
    font-size: 0.88rem;
    line-height: 1.4;
    cursor: pointer;
    pointer-events: all; /* individual toasts are clickable */
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    transition: opacity 0.15s;
  }

  .toast:hover { opacity: 0.92; }

  /* ── Types ── */
  .toast--success {
    background: #1a2e1a;
    border-color: rgba(34, 197, 94, 0.4);
    color: #86efac;
  }

  .toast--error {
    background: #2e1a1a;
    border-color: rgba(239, 68, 68, 0.4);
    color: #fca5a5;
  }

  .toast--info {
    background: #1a1a2e;
    border-color: rgba(99, 102, 241, 0.4);
    color: #a5b4fc;
  }

  .toast-message {
    flex: 1;
    min-width: 0;
  }

  .toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0;
    line-height: 1;
    transition: opacity 0.1s;
  }

  .toast-close:hover { opacity: 1; }

  @media (max-width: 480px) {
    .toast-container {
      bottom: 1rem;
      right: 0.75rem;
      left: 0.75rem;
      width: auto;
      max-width: none;
    }
  }
</style>
