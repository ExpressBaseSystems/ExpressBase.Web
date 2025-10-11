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
        if (!window?.EbAppConfig?.ServerEventUrlPrefix) {

            throw new Error("required EbAppConfigs are missing");
        }

        return this.getEbWebUrl(window?.EbAppConfig?.ServerEventUrlPrefix);
    }

    static getEbWebUrl(subDomain)
    {
        if (!window?.EbAppConfig?.ServerEventUrlPrefix || !window?.EbAppConfig?.domain || !window?.EbAppConfig?.scheme) {

            throw new Error("required EbAppConfigs are missing");
        }

        return `${window.EbAppConfig.scheme}${subDomain}.${window.EbAppConfig.domain}`;
    }
}
k