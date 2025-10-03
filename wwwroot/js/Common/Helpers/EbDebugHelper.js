class EbDebugHelper {

    static get isEnabled() {
        //return true;
        return !!(window.AppConfig && window.AppConfig.debug);
    }

    static log(...args) {
        if (EbDebugHelper.isEnabled) {
            console.log('[DEBUG]', ...args);
        }
    }

    static info(...args) {
        if (EbDebugHelper.isEnabled) {
            console.info('[INFO]', ...args);
        }
    }

    static warn(...args) {
        if (EbDebugHelper.isEnabled) {
            console.warn('[WARN]', ...args);
        }
    }

    static error(...args) {
        if (EbDebugHelper.isEnabled) {
            console.error('[ERROR]', ...args);
        }
    }

    static trace(...args) {
        if (EbDebugHelper.isEnabled) {
            const stack = new Error().stack;
            console.log('[TRACE]', ...args);
            if (stack) {
                const lines = stack.split('\n').slice(1);
                console.log(lines.join('\n'));
            }
        }
    }
}
