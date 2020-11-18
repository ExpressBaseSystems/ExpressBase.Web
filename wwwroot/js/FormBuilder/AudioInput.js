var AudioInput = function (ctrl, ctrlopts) {
    this.ctrl = ctrl;
    this.ctrlopts = ctrlopts;

    let audioIN = { audio: true };
    let dataArray = [];
    var mediaRecorder;
    let playAudio = document.getElementById('adioPlay');
    // audio is true, for recording 

    // Access the permission for use 
    // the microphone 
    let _StartBtn = $('#btnStart');
    let _StopBtn = $('#btnStop');


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
                    if (this.ctrl.IsMultipleUpload)
                        $('.AudioColl').append(clipContainerElement);
                    else
                        $('.AudioColl').empty().append(clipContainerElement);
                    this.Conver2file(dataArray[dataArray.length - 1]);
                    $('.aud-close').off('click').on('click', this.DeleteAudio.bind(this));
                    //dataArray = [];
                    //const audio = new Audio(audioUrl);
                    //audio.play();
                });
            });

    };

    this.Conver2file = function (blob) {
        var file = new File([blob], `aud_`+ Date.now().toString(36)+`.mp3`, {
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
            $(`[data-id=${e.target.getAttribute('data-id')}]`).remove();
        }
    };

    this.StopRec = function () {
        _StartBtn.css("color", "#000000");
        _StopBtn.css("color", "#000000");
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    };
    this.UploadAudio = function () {
        $.each($(".aud-data"), function (i, obj) {
            let _id = obj.getAttribute("data-id");
            var file = this.Conver2file(dataArray[_id]);
            //let audioData = new Blob(dataArray, { 'type': 'audio/mp3;', 'name': 'tets1.mp3' });
            //var arrayBuffer;
            //var fileReader = new FileReader();
            //fileReader.onload = function (event) {
            //    arrayBuffer = event.target.result;
            //};
            //fileReader.readAsArrayBuffer(audioData);
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
                //EbLoader("hide");            
            }.bind(this));
        }.bind(this));
    };

    this.init = function () {
        $('#btnStart').off("click").on('click', this.StartRec.bind(this));
        $('#btnStop').off("click").on('click', this.StopRec.bind(this));
        $('#uploadAudio').off("click").on('click', this.UploadAudio.bind(this));
    };

    this.init();

}