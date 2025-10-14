class EbShareModal {
    host; shadow; backdrop; card; input; copyBtn;
    _prevOverflow = null; _prevPaddingRight = null; lastFocused = null;

    constructor({
                    title = 'Shareable URL',
                    helperText = 'This link may contain a one-time ticket. Keep it private if it includes sensitive info.',
                    copyLabel = 'Copy',
                    cancelLabel = 'Cancel',
                    closeAriaLabel = 'Close',
                    url = null,
                    autoDestroy = false,
                } = {}) {
        this.autoDestroy = !!autoDestroy;

        this.host = document.createElement('div');
        this.host.style.all = 'initial';
        document.body.appendChild(this.host);
        this.shadow = this.host.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
      .EbShareModal-backdrop {
        --eb-bg-default: #f6f7f9;
        --eb-fg-default: #0b0c0e;
        --eb-card-default: #ffffff;
        --eb-border-default: #e5e7eb;
        --eb-accent-default: #2563eb;
        --eb-muted-default: #5b616e;
      }
      @media (prefers-color-scheme: dark) {
        .EbShareModal-backdrop {
          --eb-bg-default: #0b0c0e;
          --eb-fg-default: #e5e7eb;
          --eb-card-default: #111317;
          --eb-border-default: #1f232a;
          --eb-accent-default: #60a5fa;
          --eb-muted-default: #9aa3af;
        }
      }
      .EbShareModal-backdrop {
        position: fixed; inset: 0;
        background: rgba(0,0,0,.45);
        display: none;
        align-items: center; justify-content: center;
        padding: 28px;
        z-index: 9999;
        backdrop-filter: blur(2px);
        color-scheme: light dark;
        color: var(--fg, var(--eb-fg-default));
        font-family: var(--font, system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji');
      }
      .EbShareModal-backdrop[aria-hidden="false"] { display: flex; }
      .EbShareModal-card {
        display: block;
        width: 100%; max-width: 900px;
        background: var(--card, var(--eb-card-default));
        color: var(--fg, var(--eb-fg-default));
        border: 1px solid var(--border, var(--eb-border-default));
        border-radius: 16px;
        box-shadow: 0 16px 48px rgba(0,0,0,.28);
        padding: 24px;
        transform: translateY(8px);
        transition: transform .18s ease, opacity .18s ease;
        opacity: 0;
        outline: none;
        pointer-events: auto;
      }
      .EbShareModal-backdrop[aria-hidden="false"] .EbShareModal-card { transform: translateY(0); opacity: 1; }
      .EbShareModal-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
      .EbShareModal-title { margin: 0; font-size: 20px; font-weight: 700; }
      .EbShareModal-close {
        display: grid; place-items: center;
        width: 38px; height: 38px;
        border: 1px solid var(--border, var(--eb-border-default));
        border-radius: 10px;
        background: transparent;
        color: inherit;
        cursor: pointer;
        line-height: 1;
      }
      .EbShareModal-close:hover { border-color: var(--accent, var(--eb-accent-default)); }
      .EbShareModal-body { display: grid; gap: 14px; }
      .EbShareModal-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; justify-content: flex-end; }
      .EbShareModal-inputrow { display: grid; grid-template-columns: 1fr auto; gap: 12px; }
      .EbShareModal-input {
        display: block; width: 100%;
        padding: 12px 14px;
        background: transparent;
        color: inherit;
        border: 1px solid var(--border, var(--eb-border-default));
        border-radius: 10px;
        font-family: var(--mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace);
        font-size: 15px; line-height: 1.4;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .EbShareModal-input:focus { outline: none; border-color: var(--accent, var(--eb-accent-default)); }
      .EbShareModal-btn {
        display: inline-block;
        padding: 12px 16px;
        border: 1px solid var(--border, var(--eb-border-default));
        border-radius: 10px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        text-align: center;
        user-select: none;
      }
      .EbShareModal-btn:hover { border-color: var(--accent, var(--eb-accent-default)); }
      .EbShareModal-btn-primary {
        background: var(--accent, var(--eb-accent-default));
        border-color: var(--accent, var(--eb-accent-default));
        color: #fff;
      }
      .EbShareModal-btn-primary:hover { filter: brightness(1.05); }
      .EbShareModal-helper { font-size: 13px; color: var(--muted, var(--eb-muted-default)); }
      @media (max-width: 600px) {
        .EbShareModal-card { padding: 20px; border-radius: 14px; }
        .EbShareModal-title { font-size: 18px; }
        .EbShareModal-inputrow { grid-template-columns: 1fr; }
      }
    `;

        this.backdrop = document.createElement('div');
        this.backdrop.className = 'EbShareModal-backdrop';
        this.backdrop.setAttribute('role', 'dialog');
        this.backdrop.setAttribute('aria-modal', 'true');
        this.backdrop.setAttribute('aria-hidden', 'true');

        this.card = document.createElement('div');
        this.card.className = 'EbShareModal-card';
        this.card.setAttribute('tabindex', '-1');

        const header = document.createElement('div');
        header.className = 'EbShareModal-header';

        const h2 = document.createElement('h2');
        h2.className = 'EbShareModal-title';
        const titleId = `EbShareModal-title-${Math.random().toString(36).slice(2)}`;
        h2.id = titleId;
        h2.textContent = title;
        this.backdrop.setAttribute('aria-labelledby', titleId);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'EbShareModal-close';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', closeAriaLabel);
        closeBtn.textContent = '×';

        const body = document.createElement('div');
        body.className = 'EbShareModal-body';

        const inputRow = document.createElement('div');
        inputRow.className = 'EbShareModal-inputrow';

        this.input = document.createElement('input');
        this.input.className = 'EbShareModal-input';
        this.input.type = 'text';
        this.input.readOnly = true;

        this.copyBtn = document.createElement('button');
        this.copyBtn.className = 'EbShareModal-btn EbShareModal-btn-primary';
        this.copyBtn.type = 'button';
        this.copyBtn.textContent = copyLabel;

        inputRow.appendChild(this.input);
        inputRow.appendChild(this.copyBtn);

        const helper = document.createElement('div');
        helper.className = 'EbShareModal-helper';
        helper.textContent = helperText;

        const actions = document.createElement('div');
        actions.className = 'EbShareModal-row';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'EbShareModal-btn';
        cancelBtn.type = 'button';
        cancelBtn.textContent = cancelLabel;

        actions.appendChild(cancelBtn);

        header.appendChild(h2);
        header.appendChild(closeBtn);
        body.appendChild(inputRow);
        body.appendChild(helper);
        body.appendChild(actions);
        this.card.appendChild(header);
        this.card.appendChild(body);
        this.backdrop.appendChild(this.card);

        this.shadow.appendChild(style);
        this.shadow.appendChild(this.backdrop);

        this.copyBtn.addEventListener('click', () => this.copyToClipboard(this.input.value));
        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', this.#onBackdropClick);

        if (url != null) this.setUrl(url);
    }

    open(url = null) {
        if (url != null) this.setUrl(url);
        this.lastFocused = document.activeElement;
        this.backdrop.setAttribute('aria-hidden', 'false');
        this.#lockScroll();
        setTimeout(() => this.card.focus(), 0);
        document.addEventListener('keydown', this.#trapFocus, { passive: false });
    }

    close() {
        this.backdrop.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', this.#trapFocus);
        this.#unlockScroll();
        if (this.lastFocused && typeof this.lastFocused.focus === 'function') {
            try { this.lastFocused.focus(); } catch {}
        }
        if (this.autoDestroy) this.destroy();
    }

    destroy() {
        this.backdrop.removeEventListener('click', this.#onBackdropClick);
        document.removeEventListener('keydown', this.#trapFocus);
        this.#unlockScroll();
        this.host?.remove();
    }

    setUrl(url) { this.input.value = url ?? ''; }

    copyToClipboard(text) {
        try {
            EbClipBoardHelper.copy(text);
            EbToast.success('Copied to clipboard', { position: 'bottom-center' });
        } catch {
            EbToast.error('Copy failed. Long-press to select.', { position: 'bottom-center' });
        }
    }

    #trapFocus = (e) => {
        if (this.backdrop.getAttribute('aria-hidden') === 'true') return;
        const focusables = this.card.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!focusables.length) {
            if (e.key === 'Escape') this.close();
            return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
            else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
        } else if (e.key === 'Escape') {
            this.close();
        }
    };

    #onBackdropClick = (e) => { if (e.target === this.backdrop) this.close(); };

    #lockScroll() {
        const docEl = document.documentElement;
        const body = document.body;
        const scrollBar = window.innerWidth - docEl.clientWidth;
        this._prevOverflow = body.style.overflow;
        this._prevPaddingRight = body.style.paddingRight;
        body.style.overflow = 'hidden';
        if (scrollBar > 0) {
            const current = getComputedStyle(body).paddingRight;
            body.style.paddingRight = `calc(${current} + ${scrollBar}px)`;
        }
    }

    #unlockScroll() {
        const body = document.body;
        if (body.style.overflow === 'hidden') {
            body.style.overflow = this._prevOverflow ?? '';
            body.style.paddingRight = this._prevPaddingRight ?? '';
        }
    }
}

// Usage example:
// <button class="btn" id="copy_url" title="Copy public url" style="display:none"
//   onclick="ebModal.open('@publicFormUrl')">
//   <i class="fa fa-clipboard" aria-hidden="true"></i>
// </button>
// <script>
//   const ebModal = new EbShareModal({ title: "Public Form URL" });
// </script>
