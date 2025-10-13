class EbToast {
    static #stylesInjected = false;
    static #root = null;

    static #injectStyles() {
        if (EbToast.#stylesInjected) return;
        const css = `
      .EbToast-root {
        position: fixed;
        inset: auto 0 20px 0;              /* default: bottom-center */
        display: grid; place-items: center;
        gap: 8px;
        pointer-events: none;              /* clicks pass through gaps */
        z-index: 100000;                   /* above most modals */
        padding: 0 12px;
      }
      .EbToast-root[data-pos^="top"] { top: 20px; bottom: auto; }
      .EbToast-root[data-pos$="left"]  { place-items: start; }
      .EbToast-root[data-pos$="right"] { place-items: end; }

      /* tokens (light) */
      .EbToast-item {
        --bg: #ffffff;
        --fg: #0b0c0e;
        --muted: #5b616e;
        --border: #e5e7eb;

        background: var(--bg);
        color: var(--fg);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 10px 14px;
        box-shadow: 0 8px 24px rgba(0,0,0,.18);
        font: 13px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans";
        display: inline-flex; align-items: center; gap: 10px;
        pointer-events: auto;               /* allow hover to pause */
        opacity: 0; transform: translateY(6px);
        transition: opacity .18s ease, transform .18s ease, filter .12s ease;
        max-width: min(90vw, 520px);
        word-break: break-word;
      }
      @media (prefers-color-scheme: dark) {
        .EbToast-item {
          --bg: #111317;
          --fg: #e5e7eb;
          --muted: #9aa0aa;
          --border: #1f232a;
        }
      }
      .EbToast-item[data-kind="success"] { border-color: #16a34a33; box-shadow: 0 8px 24px rgba(22,163,74,.18); }
      .EbToast-item[data-kind="error"]   { border-color: #b91c1c33; box-shadow: 0 8px 24px rgba(185,28,28,.18); }
      .EbToast-item[data-kind="info"]    { border-color: #2563eb33; box-shadow: 0 8px 24px rgba(37,99,235,.18); }
      .EbToast-item[data-kind="warn"]    { border-color: #d9770633; box-shadow: 0 8px 24px rgba(217,119,6,.18); }

      .EbToast-icon { font-size: 16px; line-height: 1; opacity: .9; }
      .EbToast-msg { flex: 1 1 auto; }
      .EbToast-close {
        appearance: none; border: 0; background: transparent; color: inherit;
        font-size: 16px; line-height: 1; padding: 4px; margin: -4px -2px -4px 4px;
        border-radius: 6px; cursor: pointer;
      }
      .EbToast-close:hover { filter: brightness(1.1); }

      .EbToast-item.EbToast-in  { opacity: 1; transform: translateY(0); }
      .EbToast-item.EbToast-out { opacity: 0; transform: translateY(6px); }
    `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        EbToast.#stylesInjected = true;
    }

    static #ensureRoot(position = "bottom-center") {
        if (!EbToast.#root) {
            const root = document.createElement('div');
            root.className = 'EbToast-root';
            root.setAttribute('role', 'region');
            root.setAttribute('aria-label', 'Notifications');
            document.body.appendChild(root);
            EbToast.#root = root;
        }
        EbToast.#setPosition(position);
    }

    static #setPosition(position) {
        // normalize like "bottom-center"
        const allowed = new Set([
            "bottom-center","bottom-left","bottom-right",
            "top-center","top-left","top-right"
        ]);
        const pos = allowed.has(position) ? position : "bottom-center";
        EbToast.#root.dataset.pos = pos;
        // map to grid alignment via data-pos in CSS
        EbToast.#root.style.inset = pos.startsWith('top') ? "20px 0 auto 0" : "auto 0 20px 0";
        EbToast.#root.style.placeItems =
            pos.endsWith('left') ? "start" :
                pos.endsWith('right') ? "end" : "center";
    }

    /**
     * Show a toast.
     * @param {string|Node} message
     * @param {Object} opts
     * @param {number} [opts.duration=1800] auto-hide in ms (0 disables)
     * @param {"default"|"success"|"error"|"info"|"warn"} [opts.kind="default"]
     * @param {"bottom-center"|"bottom-left"|"bottom-right"|"top-center"|"top-left"|"top-right"} [opts.position]
     * @param {string|null} [opts.icon] optional text/emoji/icon HTML (kept simple)
     * @returns {{close:Function, el:HTMLElement}}
     */
    static show(message, {
        duration = 1800,
        kind = "default",
        position = "bottom-center",
        icon = null
    } = {}) {
        EbToast.#injectStyles();
        EbToast.#ensureRoot(position);

        const toast = document.createElement('div');
        toast.className = 'EbToast-item';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.dataset.kind = kind;

        if (icon) {
            const ic = document.createElement('span');
            ic.className = 'EbToast-icon';
            ic.innerHTML = icon;
            toast.appendChild(ic);
        }

        const msg = document.createElement('div');
        msg.className = 'EbToast-msg';
        if (message instanceof Node) msg.appendChild(message);
        else msg.textContent = String(message ?? '');
        toast.appendChild(msg);

        const btn = document.createElement('button');
        btn.className = 'EbToast-close';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Dismiss');
        btn.innerHTML = '&times;';
        btn.addEventListener('click', () => api.close());
        toast.appendChild(btn);

        // insert and animate
        EbToast.#root.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('EbToast-in'));

        // auto-hide with hover pause
        let timer = null;
        const start = () => {
            if (duration > 0) timer = setTimeout(() => api.close(), duration);
        };
        const stop = () => { if (timer) { clearTimeout(timer); timer = null; } };
        toast.addEventListener('mouseenter', stop);
        toast.addEventListener('mouseleave', start);
        start();

        const api = {
            el: toast,
            close: () => {
                stop();
                toast.classList.remove('EbToast-in');
                toast.classList.add('EbToast-out');
                setTimeout(() => toast.remove(), 200);
            }
        };
        return api;
    }

    static success(msg, opts={}) { return EbToast.show(msg, { kind: 'success', icon: '✔️', ...opts }); }
    static error(msg,   opts={}) { return EbToast.show(msg, { kind: 'error',   icon: '⛔', ...opts }); }
    static info(msg,    opts={}) { return EbToast.show(msg, { kind: 'info',    icon: 'ℹ️', ...opts }); }
    static warn(msg,    opts={}) { return EbToast.show(msg, { kind: 'warn',    icon: '⚠️', ...opts }); }
}
