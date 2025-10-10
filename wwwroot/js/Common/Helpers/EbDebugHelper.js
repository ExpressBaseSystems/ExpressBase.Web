class EbDebugHelper {
    static get isEnabled() {
        return true;
        // return !!(window.AppConfig && window.AppConfig.debug);
    }

    static _getCallerLocation() {
        // --- Preferred: V8 callsites (Chrome/Edge/Node) ---
        const isV8 = typeof Error.captureStackTrace === 'function';
        if (isV8) {
            const orig = Error.prepareStackTrace;
            try {
                Error.prepareStackTrace = (_, callsites) => callsites;
                const err = new Error();
                // Skip this function in the stack
                Error.captureStackTrace(err, EbDebugHelper._getCallerLocation);
                const frames = err.stack;

                for (const cs of frames) {
                    const file = cs.getFileName?.() || '';
                    const fn   = cs.getFunctionName?.() || cs.getMethodName?.() || '';
                    if (!file) continue;

                    // Skip helper frames
                    if (file.includes('EbDebugHelper.js')) continue;
                    if ((fn || '').includes('EbDebugHelper')) continue;

                    const line = cs.getLineNumber?.();
                    const col  = cs.getColumnNumber?.();
                    if (line != null && col != null) {
                        return `${file}:${line}:${col}`;
                    }
                    return file; // fallback if no line/col
                }
            } catch (_) {
                // fall through to string parse
            } finally {
                Error.prepareStackTrace = orig;
            }
        }

        // --- Fallback: parse stack string (Firefox/Safari/others) ---
        const stack = new Error().stack || '';
        const lines = stack.split('\n')
            // common prefixes: "Error", "    at ..."
            .map(s => s.trim())
            .filter(Boolean);

        for (const ln of lines) {
            // Skip frames that are clearly the helper
            if (ln.includes('EbDebugHelper')) continue;
            if (ln.includes('EbDebugHelper.js')) continue;

            // Extract (file:line:col) or URL:line:col
            // Handles formats like:
            //   at myFunc (http://.../file.js:123:45)
            //   http://.../file.js:123:45
            const m = ln.match(/\(?([^\s()]+?\.\w+:\d+:\d+)\)?$/);
            if (m) return m[1];
        }

        return '';
    }

    static _format(level, args) {
        const loc = EbDebugHelper._getCallerLocation();
        const prefix = `[${level}]${loc ? ` (${loc})` : ''}`;
        return [prefix, ...args];
    }

    static log(...args)  { if (EbDebugHelper.isEnabled) console.log (...EbDebugHelper._format('DEBUG', args)); }
    static info(...args) { if (EbDebugHelper.isEnabled) console.info(...EbDebugHelper._format('INFO',  args)); }
    static warn(...args) { if (EbDebugHelper.isEnabled) console.warn(...EbDebugHelper._format('WARN',  args)); }
    static error(...args){ if (EbDebugHelper.isEnabled) console.error(...EbDebugHelper._format('ERROR', args)); }

    static trace(...args) {
        if (!EbDebugHelper.isEnabled) return;
        console.log(...EbDebugHelper._format('TRACE', args));
        const stack = new Error().stack;
        if (stack) {
            // Hide helper frames from the printed stack for clarity
            const filtered = stack.split('\n')
                .filter(l => !l.includes('EbDebugHelper'))
                .join('\n');
            console.log(filtered);
        }
    }
}
