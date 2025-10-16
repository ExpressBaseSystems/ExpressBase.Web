class EbApiClientHelper {
    constructor(baseUrl = '', defaultTimeout = 10000) {
        this.baseUrl = baseUrl;
        this.defaultTimeout = defaultTimeout;
    }

    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeout = options.timeout ?? this.defaultTimeout;
        const signal = controller.signal;

        // Construct final URL with query params
        let url = this.baseUrl + endpoint;
        if (options.query) {
            const qs = new URLSearchParams(options.query).toString();
            url += (url.includes('?') ? '&' : '?') + qs;
        }

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        // Setup timeout
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const resp = await fetch(url, {
                method: options.method || 'POST',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
                credentials: options.credentials || 'same-origin',
                signal
            });

            clearTimeout(timeoutId);

            if (!resp.ok) {
                let errText = `${resp.status} ${resp.statusText}`;
                try {
                    const errJson = await resp.json();
                    if (errJson.message) errText = errJson.message;
                } catch (_) {}
                throw new Error(errText);
            }

            const contentType = resp.headers.get('content-type') || '';
            return contentType.includes('application/json')
                ? await resp.json()
                : await resp.text();

        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                throw new Error(`Request timed out after ${timeout} ms`);
            }
            throw err;
        }
    }
}
