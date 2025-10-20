class EbMessages {
    static data = {
        somethingWentWrongJSRefresh: "Something went wrong, kindly do a hard refresh (Ctrl + Shift + R)",
        networkError: "Network error. Please check your connection.",
        unauthorized: "You are not authorized to perform this action.",
    };

    static get(key) {
        return this.data[key] || "Unknown message key.";
    }
}

