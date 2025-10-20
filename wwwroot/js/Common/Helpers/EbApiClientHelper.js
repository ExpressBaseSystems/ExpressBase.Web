class EbApiClientHelper {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {

        let url = this.baseUrl + endpoint;
        if (options.query) {
            const qs = new URLSearchParams(options.query).toString();
            url += (url.includes('?') ? '&' : '?') + qs;
        }

        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const resp = await fetch(url, {
            method: options.method || 'POST',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            credentials: options.credentials || 'same-origin'
        });

        if (!resp.ok) {
            let errText = `${resp.status} ${resp.statusText}`;
            try {
                const errJson = await resp.json();
                if (errJson.message) errText = errJson.message;
            } catch (_) {}
            throw new Error(errText);
        }

        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return await resp.json();
        } else {
            return await resp.text();
        }
    }
}
