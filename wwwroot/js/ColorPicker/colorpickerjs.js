
var ColorPickerJs = function (option) {
    this.elemId = option.elemId;
    this.color = option.color !== "" ? option.color : '#3876eaf5';
    const slider = document.getElementById(`${this.elemId}_opacity`);
    const input = document.getElementById(`${this.elemId}_color`);
    this.Opacity = yourNumber = parseInt(this.color.slice(7, 9), 16);
    this.HexClr = this.color.slice(0, 7);
    this.init = function () {
        $(`#${this.elemId}_color`).on("input", this.setColor.bind(this));
        $(`#${this.elemId}_opacity`).on("change", this.setColor.bind(this));
        this.InitColor();
        this.setColor();
    };

    this.InitColor = function () { 
        $(`#${this.elemId}_color`).val(this.HexClr); 
        $(`#${this.elemId}_opacity`).val(this.Opacity || 255);
        const min = slider.min;
        const max = slider.max;
        const value = slider.value;
        slider.style.background = `linear-gradient(to right, #528ff0 0%, #528ff0 ${(value - min) / (max - min) * 100}%, #a8a8a8 ${(value - min) / (max - min) * 100}%, #a8a8a8 100%)`

        slider.oninput = function () {
            this.style.background = `linear-gradient(to right, #528ff0 0%, #528ff0 ${(this.value - this.min) / (this.max - this.min) * 100}%, #a8a8a8 ${(this.value - this.min) / (this.max - this.min) * 100}%, #a8a8a8 100%)`
        };
    }
    this.setColor = function () {
        var color = $(`#${this.elemId}_color`).val();       
        var opacity = BigInt(slider.value).toString(16);
        var rgbaCol = `${color}${opacity}`;
        $(`#${this.elemId}`).val(rgbaCol);
    }
    this.init();
}
