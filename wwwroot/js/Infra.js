function SetValue(id) {
    document.getElementById('tier').value = id;
}
function readURL(input) {
    if (input.files && input.files[0]) {
        var token = jwt_decode($.cookie("Token"));
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#imgpro').val(reader.result);
            $('#tenantid').val(token.uid);
            console.log(reader.result);
            $('#img')
           .attr('src', e.target.result)
           .width(100)
           .height(100);
        };
        reader.readAsDataURL(input.files[0]);
    }
}