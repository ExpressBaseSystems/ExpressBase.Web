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
                    const audioBlob = new Blob(dataArray, { 'type': 'audio/mp3;' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    let playAudio = document.getElementById('adioPlay');

                    playAudio.src = audioUrl;
                    //dataArray = [];
                    //const audio = new Audio(audioUrl);
                    //audio.play();
                });
            });

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