class EbClipboardHelper {
    static async copy(text) {
        if (!text) throw new Error('Nothing to copy');

        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            EbDebugHelper.error("Copy to clipboard failed",err);
            return EbClipboardHelper._fallbackCopyText(text);
        }
    }

    static _fallbackCopyText(text) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(ta);
            return successful;
        } catch (e) {
            EbDebugHelper.error("Copy to clipboard fallback failed",e);
            return false;
        }
    }
}
