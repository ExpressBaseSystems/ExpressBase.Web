var FontEditor = function (params) {
    this.ContainerId = params.ContainerId;
    this.ToggleId = params.ToggleId

    this.createModal = function () {
        var modalHTML = '<div class="fup" id="' + this.ContainerId + 'fontEditor"><div class="fontW">'
            + '<div class="imgup-Cont">'

            + '<div class="modal-header">'
            + '<button type="button" class="close" onclick="$(\'#' + this.ContainerId + ' .font-bg\').hide(500);" >&times;</button>'
            + '<h4 class="modal-title" style="display:inline;">Font Editor </h4>'            
            + '</div>'

            + '<div class="modal-body">'
            + "<div id-'fontEditor-body' style='margin-top:15px;'>"
            + '</div></div>'

            + '<div class="modal-footer">'
            + '<div class="modal-footer-body">'
            + '<button type="button" name="CXE_OK" id="' + this.ContainerId + '_close" class="btn"  onclick="$(\'#' + this.ContainerId + ' .imgup-bg\').hide(500);">OK</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';

        $("#" + this.ContainerId).append(modalHTML);
    }
    init();
    this.init = function () {
        this.createModal();
    }
}