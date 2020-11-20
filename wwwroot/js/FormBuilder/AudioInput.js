var AudioInput = function (ctrl, ctrlopts) {
    this.ctrl = ctrl;
    this.ctrlopts = ctrlopts;
    this.audioRefids = [];
    this._onChangeFunctions = [];
    //if (this.ctrl.DataVals.Value == null) { this.ctrl.DataVals.Value = ''; }
    //if (this.ctrl.DataVals.Value !== "") { this.audioRefids = this.ctrl.DataVals.Value.split(','); }
    let dataArray = [];
    let mediaRecorder;

    this.ctrl.getValueFromDOM = function () {
        //return this.ctrl.DataVals.Value;
        //if (this.audioRefids.length !== 0)
        return this.audioRefids.toString();
    }.bind(this);

    this.ctrl.setValue = function (p1) {
        if (p1 == null) {
            this.audioRefids = [];
        }
        else {
            this.audioRefids = p1.split(',').map(Number);
        }
        //if (this.ctrl.DataVals.Value !== "") { this.audioRefids = this.ctrl.DataVals.Value.split(','); }
        this.EditMode();
    }.bind(this);

    this.ctrl.bindOnChange = function (p1) {
        if (!this._onChangeFunctions.includes(p1))
            this._onChangeFunctions.push(p1);
        //this.ctrl.DataVals.Value = this.audioRefids.toString();
    }.bind(this);

    this.ctrl.clear = function () {

    }.bind(this);

    let _StartBtn = $('#btnStart');
    let _StopBtn = $('#btnStop');

    this.EditMode = function () {
        $.each(audioRefids, function (i, id) {
            let audioElement = document.createElement('audio');
            audioElement.setAttribute('controls', '');
            audioElement.setAttribute('style', 'padding: 10px 0px;');
            audioElement.setAttribute('id', id);
            audioElement.src = "/audio/" + id + ".mp3";
            let clipContainerElement = document.createElement('div');
            clipContainerElement.appendChild(audioElement);
            clipContainerElement.setAttribute('class', "aud-data");
            clipContainerElement.setAttribute('refid', id);
            clipContainerElement.setAttribute('style', 'display:flex;');
            let dltElement = document.createElement('i');
            dltElement.setAttribute('class', 'fa fa-trash aud-close');
            dltElement.setAttribute('refid', id);
            dltElement.setAttribute('style', 'padding: 17px 30px;font-size: 20px;');
            clipContainerElement.appendChild(dltElement);
            if (this.ctrl.IsMultipleUpload)
                $('.AudioColl').append(clipContainerElement);
            else
                $('.AudioColl').empty().append(clipContainerElement);
            $('.aud-close').off('click').on('click', this.DeleteAudio.bind(this));
        }.bind(this));
    };
    this.StartRec = function () {
        _StartBtn.css("color", "#03af03");
        _StopBtn.css("color", "#ff0000");
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                mediaRecorder.addEventListener("dataavailable", event => {
                    dataArray.push(event.data);
                });
                mediaRecorder.addEventListener("stop", () => {
                    //const audioBlob = new Blob(dataArray, { 'type': 'audio/mp3;' });
                    //const audioUrl = URL.createObjectURL(audioBlob);
                    //let playAudio = document.getElementById('adioPlay');
                    var audioElement = document.createElement('audio');
                    audioElement.setAttribute('controls', '');
                    audioElement.setAttribute('style', 'padding: 10px 0px;');
                    audioElement.setAttribute('id', dataArray.length - 1);
                    audioElement.src = URL.createObjectURL(dataArray[dataArray.length - 1]);
                    var clipContainerElement = document.createElement('div');
                    clipContainerElement.appendChild(audioElement);
                    clipContainerElement.setAttribute('class', "aud-data");
                    clipContainerElement.setAttribute('data-id', dataArray.length - 1);
                    clipContainerElement.setAttribute('style', 'display:flex;');
                    var dltElement = document.createElement('i');
                    dltElement.setAttribute('class', 'fa fa-trash aud-close');
                    dltElement.setAttribute('data-id', dataArray.length - 1);
                    dltElement.setAttribute('style', 'padding: 17px 30px;font-size: 20px;');
                    clipContainerElement.appendChild(dltElement);
                    let uploadElement = document.createElement('i');
                    uploadElement.setAttribute('class', 'fa fa-upload aud-upload');
                    uploadElement.setAttribute('audio-id', dataArray.length - 1);
                    uploadElement.setAttribute('style', 'padding: 17px 30px;font-size: 20px;');
                    clipContainerElement.appendChild(uploadElement);
                    if (this.ctrl.IsMultipleUpload)
                        $('.AudioColl').append(clipContainerElement);
                    else
                        $('.AudioColl').empty().append(clipContainerElement);
                    this.Conver2file(dataArray[dataArray.length - 1]);
                    $('.aud-close').off('click').on('click', this.DeleteAudio.bind(this));
                    $('.aud-upload').off('click').on('click', this.UploadAudio.bind(this));
                });
            });

    };

    this.Conver2file = function (blob) {
        var file = new File([blob], `aud_` + Date.now().toString(36) + `.mp3`, {
            type: "audio/mp3",
            lastModified: new Date(),
            size: 2
        });
        return file;
    };
    this.DeleteAudio = function (e) {
        EbDialog("show", {
            Message: "Are you sure, you want to submit ?",
            Buttons: {
                "Yes": {
                    Background: "green",
                    Align: "right",
                    FontColor: "white;"
                },
                "No": {
                    Background: "red",
                    Align: "left",
                    FontColor: "white;"
                }
            },
            CallBack: this.confirmBoxCallBack.bind(this, e)
        });
    };

    this.confirmBoxCallBack = function (e, cur) {
        if (cur == "Yes") {
            let ref = e.target.getAttribute('refid');
            let _did = e.target.getAttribute('data-id');
            if (_did !== null || _did !== "")
                $(`[data-id=${_did}]`).remove();
            else if (ref !== null || ref !== "") {
                $(`[refid=${ref}]`).remove();
                for (var i = audioRefids.length - 1; i >= 0; i--) {
                    if (audioRefids[i] == ref) myArray.splice(i, 1);
                }
            }
        }
    };

    this.StopRec = function () {
        _StartBtn.css("color", "#000000");
        _StopBtn.css("color", "#000000");
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    };

    this.UploadAudio = function (e) {
        let _id = e.target.getAttribute("audio-id");
        if (_id !== null) {
            var file = this.Conver2file(dataArray[_id]);
            let formData = new FormData();
            formData.append("File", file);
            $.ajax({
                url: "../StaticFile/UploadAudioAsync",
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (evt) {
                    //EbLoader("show");
                }.bind(this)
            }).done(function (refid) {
                audioRefids.push(refid);
                $(`[audio-id=${_id}]`).remove();
                for (let j = 0; j < this._onChangeFunctions.length; j++)
                    this._onChangeFunctions[j]();
            }.bind(this));
        }
    };

    this.init = function () {
        $('#btnStart').off("click").on('click', this.StartRec.bind(this));
        $('#btnStop').off("click").on('click', this.StopRec.bind(this));
        $('#uploadAudio').off("click").on('click', this.UploadAudio.bind(this));
    };

    this.init();

}

