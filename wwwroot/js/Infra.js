function SetValue(id) {
    document.getElementById('tier').value = id;
}
function readURL(input) {
    if (input.files && input.files[0]) {
        var token = jwt_decode($.cookie("Token"));
        var reader = new FileReader();
        reader.onload = function (e) {
            var DataCollection = { 'id': token.uid, 'proimg': reader.result };
            $.post('https://localhost:44377/infra/', { crossDomain: 'true', "op": "tenantaccountimg", "Colvalues": JSON.stringify(DataCollection), "Token": $.cookie('Token') },
               function (data) {
                   if (data) {
                       alert(data.id);
                       $('#tenantuserid').val(data.id);
                   }
                   else {
                       alert("Hii");
                   }
               });
            console.log(reader.result);
            $('#img')
           .attr('src', e.target.result)
           .width(100)
           .height(100);
        };
        reader.readAsDataURL(input.files[0]);
    }
}