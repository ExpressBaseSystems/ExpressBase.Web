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

    static getEbServerEventUrl()
    {
        if (!window?.EbAppConfig?.serverEventUrlPrefix) {

            throw new Error("required EbAppConfig are missing");
        }

        return this.getEbWebUrl(window?.EbAppConfig?.serverEventUrlPrefix);
    }

    static getEbWebUrl(subDomain)
    {
        if (!window?.EbAppConfig?.domain || !window?.EbAppConfig?.scheme) {

            throw new Error("required EbAppConfigs are missing");
        }

        return `${window.EbAppConfig.scheme}${subDomain}.${window.EbAppConfig.domain}`;
    }
}