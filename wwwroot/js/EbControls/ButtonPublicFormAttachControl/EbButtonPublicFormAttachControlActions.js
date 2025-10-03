window.buttonPublicFormAttachControlEnableDisable = function (flatControls, action) {

    for (const c of flatControls) {
        if (c.ObjType === ButtonPublicFormAttachControl.CONTROL) {
            try {
                if (action === "disable" && typeof c.disable === 'function') {
                    c.disable();
                } else if (action === "enable" && typeof c.enable === 'function') {
                    c.enable();
                } else {
                    EbDebugHelper.warn("action " + action + " is invalid on " + ButtonPublicFormAttachControl.CONTROL)
                }
            } catch (e) {
                EbDebugHelper.warn("unable to perform action " + action + " on " + ButtonPublicFormAttachControl.CONTROL, e)
            }
        }
    }
};
