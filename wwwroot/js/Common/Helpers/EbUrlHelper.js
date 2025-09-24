class EbUrlHelper {

    static getParam(key, defaultValue = null) {
        const params = new URLSearchParams(window.location.search);
        return params.has(key) ? params.get(key) : defaultValue;
    }


    static getAllParams() {
        const params = new URLSearchParams(window.location.search);
        return Object.fromEntries(params.entries());
    }


    static hasParam(key) {
        const params = new URLSearchParams(window.location.search);
        return params.has(key);
    }
}
