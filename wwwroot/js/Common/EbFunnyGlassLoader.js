class EbFunnyGlassLoader {
    constructor({
        zIndex = 2147483647,
        blockScroll = true,
        autoTimeout = 0
    } = {}) {
        this.opts = { zIndex, blockScroll, autoTimeout };
        this._overlayId = 'eb-funky-frost-overlay';
        this._styleId = 'eb-funky-frost-style';
        this._timer = null;
        this._beat = null;
    }

    attach() {
        if (this.isActive()) return;
        const ensure = () => {
            this.#injectStyle();

            const overlay = document.createElement('div');
            overlay.id = this._overlayId;

            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                zIndex: this.opts.zIndex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(20px) brightness(1.2)',
                WebkitBackdropFilter: 'blur(20px) brightness(1.2)',
                animation: 'funky-bg 6s linear infinite',
                overflow: 'hidden'
            });

            const dj = document.createElement('div');
            dj.className = 'dj';
            dj.textContent = this.#randomEmoji();

            const msg = document.createElement('div');
            msg.className = 'funky-text';
            msg.textContent = this.#randomMessage();

            overlay.appendChild(dj);
            overlay.appendChild(msg);
            document.body.appendChild(overlay);

            if (this.opts.blockScroll) document.documentElement.style.overflow = 'hidden';
            this.#startFunk(dj, msg);

            if (this.opts.autoTimeout > 0)
                this._timer = setTimeout(() => this.detach(), this.opts.autoTimeout);
        };

        if (!document.body) window.addEventListener('DOMContentLoaded', ensure, { once: true });
        else ensure();
    }

    detach() {
        if (this._timer) clearTimeout(this._timer);
        if (this._beat) clearInterval(this._beat);
        const overlay = document.getElementById(this._overlayId);
        if (overlay) overlay.remove();
        document.documentElement.style.overflow = '';
    }

    isActive() {
        return !!document.getElementById(this._overlayId);
    }

    #startFunk(dj, msg) {
        let step = 0;

        const emojis = ['🔧', '⏰', '⏳'];

        const messages = [
            'കിട്ടും... കിട്ടും... കുറച്ച് കഴിഞ്ഞിട്ട് കിട്ടും',
            'ഇപ്പോ ശരിയാക്കിത്തരാം'
        ];


        this._beat = setInterval(() => {
            dj.textContent = emojis[step % emojis.length];
            msg.textContent = messages[Math.floor(Math.random() * messages.length)];
            step++;
        }, 1500);
    }

    #randomEmoji() {
        const arr = ['🔧', '⏰', '⏳'];
        return arr[Math.floor(Math.random() * arr.length)];
    }

    #randomMessage() {
        const arr = [
            'കിട്ടും... കിട്ടും... കുറച്ച് കഴിഞ്ഞിട്ട് കിട്ടും',
            'ഇപ്പോ ശരിയാക്കിത്തരാം'
        ];
        return arr[Math.floor(Math.random() * arr.length)];
    }

    #injectStyle() {
        if (document.getElementById(this._styleId)) return;
        const style = document.createElement('style');
        style.id = this._styleId;
        style.textContent = `
      @keyframes funky-bg {
        0% { background: linear-gradient(135deg, #ff00ff, #00ffff); }
        25% { background: linear-gradient(135deg, #00ffff, #ff8800); }
        50% { background: linear-gradient(135deg, #ff8800, #00ff66); }
        75% { background: linear-gradient(135deg, #00ff66, #ff00ff); }
        100% { background: linear-gradient(135deg, #ff00ff, #00ffff); }
      }
      @keyframes bop {
        0%,100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.3) rotate(10deg); }
      }
      @keyframes glow {
        0%,100% { text-shadow: 0 0 8px #fff, 0 0 12px #ff00ff; }
        50% { text-shadow: 0 0 18px #0ff, 0 0 28px #ff0080; }
      }
      #${this._overlayId} .dj {
        font-size: 72px;
        animation: bop 0.8s ease-in-out infinite;
      }
      #${this._overlayId} .funky-text {
        margin-top: 20px;
        font-family: 'Comic Sans MS', 'Comic Neue', cursive;
        font-size: 22px;
        color: white;
        text-align: center;
        animation: glow 1.4s ease-in-out infinite;
      }
    `;
        document.head.appendChild(style);
    }
}