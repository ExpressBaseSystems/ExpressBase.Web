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



    this.StartRec = function () {
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
                    clipContainerElement.setAttribute('class', dataArray.length - 1);
                    clipContainerElement.setAttribute('style', 'display:flex;');
                    var dltElement = document.createElement('i');
                    dltElement.setAttribute('class', 'fa fa-times-circle');
                    dltElement.setAttribute('style', 'padding: 17px 30px;font-size: 20px;');
                    clipContainerElement.appendChild(dltElement);
                    $('.AudioColl').append(clipContainerElement);

                    $('.aud-close').off('click').on('click', this.DeleteAudio.bind(this));
                    //dataArray = [];
                    //const audio = new Audio(audioUrl);
                    //audio.play();
                });
            });

    };

    this.DeleteAudio = function () {

    };
    this.StopRec = function () {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    };
    this.UploadAudio = function () {
        let audioData = new Blob(dataArray, { 'type': 'audio/mp3;','name': 'tets1.mp3' });
        var arrayBuffer;
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
            arrayBuffer = event.target.result;  
        };
        fileReader.readAsArrayBuffer(audioData);
        let formData = new FormData();
        formData.append("File", audioData);
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
    };
    this.init = function () {
        $('#btnStart').on('click', this.StartRec.bind(this));
        $('#btnStop').on('click', this.StopRec.bind(this));
        $('#uploadAudio').on('click', this.UploadAudio.bind(this));
    };

    this.init();

}