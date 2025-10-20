class EbFrostGlassLoader {
    constructor({
        blur = 10,
        brightness = 1.1,
        saturate = 1.2,
        background = 'rgba(255,255,255,0.2)',
        border = '1px solid rgba(255,255,255,0.3)',
        boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)',
        borderRadius = '16px',
        zIndex = 2147483647,
        blockScroll = true,
        showSpinner = true,
        autoTimeout = 0
    } = {}) {
        this.opts = { blur, brightness, saturate, background, border, boxShadow, borderRadius, zIndex, blockScroll, showSpinner, autoTimeout };
        this._overlayId = 'expressbase-blur-overlay';
        this._styleId = 'expressbase-blur-style';
        this._timer = null;
    }

    attach() {
        if (this.isActive()) return;
        const ensure = () => {
            this.#injectStyle();

            const overlay = document.createElement('div');
            overlay.id = this._overlayId;
            overlay.setAttribute('role', 'presentation');
            overlay.tabIndex = -1;

            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                zIndex: String(this.opts.zIndex),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: this.opts.background,
                backdropFilter: `blur(${this.opts.blur}px) brightness(${this.opts.brightness}) saturate(${this.opts.saturate})`,
                WebkitBackdropFilter: `blur(${this.opts.blur}px) brightness(${this.opts.brightness}) saturate(${this.opts.saturate})`,
                border: this.opts.border,
                borderRadius: this.opts.borderRadius,
                boxShadow: this.opts.boxShadow,
                pointerEvents: 'auto',
                animation: 'fadeInGlass 0.3s ease-out',
            });

            if (this.opts.showSpinner) {
                const spin = document.createElement('div');
                spin.className = 'expressbase-blur-spinner';
                overlay.appendChild(spin);
            }

            if (this.opts.blockScroll) document.documentElement.style.overflow = 'hidden';

            document.body.appendChild(overlay);

            if (this.opts.autoTimeout > 0)
                this._timer = setTimeout(() => this.detach(), this.opts.autoTimeout);
        };
        if (!document.body) window.addEventListener('DOMContentLoaded', ensure, { once: true });
        else ensure();
    }

    detach() {
        const overlay = document.getElementById(this._overlayId);
        if (!overlay) return;
        if (this._timer) clearTimeout(this._timer);
        overlay.remove();
        document.documentElement.style.overflow = '';
    }

    isActive() { return !!document.getElementById(this._overlayId); }

    #injectStyle() {
        if (document.getElementById(this._styleId)) return;
        const style = document.createElement('style');
        style.id = this._styleId;
        style.textContent = `
          #${this._overlayId} .expressbase-blur-spinner {
            width: 40px; height: 40px;
            border-radius: 50%;
            border: 4px solid rgba(255,255,255,0.4);
            border-top-color: rgba(255,255,255,0.8);
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeInGlass {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `;
        document.head.appendChild(style);
    }
}