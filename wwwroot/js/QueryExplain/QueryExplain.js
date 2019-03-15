var SqlEval = function (is_ds) {
    var str = '';
    var index = 0;
    var row = 0;
    var idi = 0;
    var html = [];
    var connect = 0;
    var HJ = [];
    var count = 0;
    //var draw = [];
    var draw = new Object();
    html.push(`<div class ="_row">`);

    
    this.refresh = function (tabNum, code, code_tnum) {
        //var value1 = $('textarea[name="querytext"]').val();
        //var value2 = $('textarea[name="queryparam"]').val(); 
        $("#eb_common_loader").EbLoader("show");
        let params = null;
        if(is_ds)
            params = commonO.ObjCollection["#vernav" + code_tnum].CreateObjString();
        $.ajax({
            url: "../QueryExplain/GetExplain",
            type: 'POST',
            data: {
                "query": code,
                "_params": params
            },
                //"queryparam": value2},
            success: function (response) {
                //this.CreateHtml(response);
                //this.CreateResult(response);
                this.CreateExplain(response);
                this.JsonTraverse(JSON.parse(response.explain)[0]);
                $('#JsonD' + tabNum).append(html.join());
                if (Object.keys(draw).length > 1)
                    this.draw();
                $("#eb_common_loader").EbLoader("hide");
            }.bind(this)
        });
    };

    this.CreateExplain = function (response) {
        var obj = JSON.parse(response.explain)[0];
        var Node = '';
       

        var formattedData = JSON.stringify(obj, null, '\t');
        //$('#output').text(formattedData);
    };

    this.JsonTraverse = function (object) {
        for (var keys in object) {
            for (var key in object[keys]) {
                if (key === "Node Type") {
                    //str += '<dt>' + '<img src="~/images/QueryExplain/hash.png" />'+ object[keys]["Node Type"] + '</dt>';
                    if (object[keys]["Node Type"] === "Seq Scan") {
                        row += 1;
                        index -= 1;
                        html.push('<div class =  "_column"  >' + '<img src="../images/QueryExplain/seq.svg" id="a' + idi++ + '" style="width:30px;height:40x; data-toggle="tooltip" data-placement="top" title="Relation Name : ' + object[keys]["Relation Name"] + ' Parallel Aware : ' + object[keys]["Parallel Aware"] + ' Parent Relationship : ' + object[keys]["Parent Relationship"] + ' Alias : ' + object[keys]["Alias"] + '"/><br/>' + object[keys]["Relation Name"] + '</div></div>');
                        let pre = idi - 2;
                        pre = 'a' + pre;
                        let send = idi - 1;
                        sent = 'a' + send;
                        //this.draw(sent, pre);
                        draw[connect++] = { "From": sent, "To": pre };
                    }
                    else if (object[keys]["Node Type"] === "Hash") {
                        html.push('<div class = "_row">');
                        for (i = 0; i <= index; i++) {
                            html.push('<div class =  "_column_"></div>');
                        }
                        //index += 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/hash.svg" id="a' + idi++ + '" style="width:30px;height:40x; data-toggle="tooltip" data-placement="top" title=" Parallel Aware : ' + object[keys]["Parallel Aware"] + ' Parent Relationship : ' + object[keys]["Parent Relationship"] + '"/><br/>' + object[keys]["Node Type"] + '</div>');
                        let pre = idi - 3;
                        pre = 'a' + pre;
                        let send = idi - 1;
                        sent = 'a' + send;
                        //this.draw(sent, pre);
                        draw[connect++] = { "From": sent, "To": HJ[--count].sent };
                    }
                    else if (object[keys]["Node Type"] === "Index Scan") {
                        index -= 1;
                        html.push('<div class = "_row">');
                        for (i = 0; i <= index; i++) {
                            html.push('<div class =  "_column_"></div>');
                        }
                        index -= 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/ex_index_scan.svg" id="a' + idi++ + '" style="width:30px;height:40x; "/><br/>' + object[keys]["Node Type"] + '</div></div>');
                        let pre = idi - 3;
                        pre = 'a' + pre;
                        let send = idi - 1;
                        sent = 'a' + send;
                        //this.draw(sent, pre);
                        draw[connect++] = { "From": sent, "To": HJ[--count].sent };
                    }
                    else if (object[keys]["Node Type"] === "Materialize") {
                        html.push('<div class = "_row">');
                        for (i = 0; i <= index; i++) {
                            html.push('<div class =  "_column_"></div>');
                        }
                        index += 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/ex_materialize.svg" id="a' + idi++ + '" style="width:30px;height:40x; data-toggle="tooltip" data-placement="top" title="   Parallel Aware : ' + object[keys]["Parallel Aware"] + ' Parent Relationship : ' + object[keys]["Parent Relationship"] + ' "/><br/>' + object[keys]["Node Type"] + '</div>');
                        let pre = idi - 3;
                        pre = 'a' + pre;
                        let send = idi - 1;
                        sent = 'a' + send;
                        //this.draw(sent, pre);
                        draw[connect++] = { "From": sent, "To": HJ[--count].sent };
                    }
                    else if (object[keys]["Node Type"] === "Aggregate") {
                        //index -= 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/ex_aggregate.svg" id="a' + idi++ + '" style="width:30px;height:40x; data-toggle="tooltip" data-placement="top" title="Strategy : ' + object[keys]["Strategy"] + ' Parallel Aware : ' + object[keys]["Parallel Aware"] + ' Parent Relationship : ' + object[keys]["Parent Relationship"] + ' Partial Mode : ' + object[keys]["Partial Mode"] + ' Group Key : ' + object[keys]["Group Key"] + '"/><br/>' + object[keys]["Node Type"] + '</div>');
                        if (idi !== 1) {
                            let pre = idi - 2;
                            pre = 'a' + pre;
                            let send = idi - 1;
                            sent = 'a' + send;
                            //this.draw(sent, pre);
                            draw[connect++] = { "From": sent, "To": pre };
                        }
                        if (idi === 1) {

                            let send = idi - 1;
                            sent = 'a' + send;
                            //this.draw(sent, pre);
                            HJ[count++] = { sent };
                        }
                    }
                    else if (object[keys]["Node Type"] === "Subquery Scan") {
                        //index += 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/ex_subplan.svg" id="a' + idi++ + '" style="width:30px;height:40x; "/><br/>' + object[keys]["Node Type"] + '</div>');
                        let pre = idi - 2;
                        pre = 'a' + pre;
                        let send = idi - 1;
                        sent = 'a' + send;
                        //this.draw(sent, pre);
                        draw[connect++] = { "From": sent, "To": pre };
                    }
                    else if (object[keys]["Node Type"] === "Hash Join") {
                        index += 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/hash.svg"  id="a' + idi++ + '" style="width:30px;height:40x; data-toggle="tooltip" data-placement="top" title="Hash Cond : ' + object[keys]["Hash Cond"] + ' Parallel Aware : ' + object[keys]["Parallel Aware"] + ' Parent Relationship : ' + object[keys]["Parent Relationship"] + ' "/><br/>' + object[keys]["Node Type"] + " " + object[keys]["Join Type"] + '</div>');
                        if (idi !== 1) {
                            let pre = idi - 2;
                            pre = 'a' + pre;
                            let send = idi - 1;
                            sent = 'a' + send;
                            //this.draw(sent, pre);
                            draw[connect++] = { "From": sent, "To": pre };
                            HJ[count++] = { sent };
                        }
                    }
                    else if (object[keys]["Node Type"] === "Nested Loop") {
                        index += 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/ex_nested.svg"  id="a' + idi++ + '" style="width:30px;height:40x; data-toggle="tooltip" data-placement="top" title="Join Filter : ' + object[keys]["Join Filter"] + ' Parallel Aware : ' + object[keys]["Parallel Aware"] + ' Parent Relationship : ' + object[keys]["Parent Relationship"] + '"/><br/>' + object[keys]["Node Type"] + " " + object[keys]["Join Type"] + '</div>');
                        if (idi !== 1) {
                            let pre = idi - 2;
                            pre = 'a' + pre;
                            let send = idi - 1;
                            sent = 'a' + send;
                            //this.draw(sent, pre);
                            draw[connect++] = { "From": sent, "To": pre };
                            HJ[count++] = { sent };
                        }
                    }
                    else if (object[keys]["Node Type"] === "Merge Join") {
                        index += 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/ex_merge.svg"  id="a' + idi++ + '" style="width:30px;height:40x; data-toggle="tooltip" data-placement="top" title="Merge Cond : ' + object[keys]["Merge Cond"] + ' Parallel Aware : ' + object[keys]["Parallel Aware"] + ' Parent Relationship : ' + object[keys]["Parent Relationship"] + '"/><br/>' + object[keys]["Node Type"] + " " + object[keys]["Join Type"] + '</div>');
                        if (idi !== 1) {
                            let pre = idi - 2;
                            pre = 'a' + pre;
                            let send = idi - 1;
                            sent = 'a' + send;
                            //this.draw(sent, pre);
                            draw[connect++] = { "From": sent, "To": pre };
                            HJ[count++] = { sent };
                        }
                        if (idi === 1) {

                            let send = idi - 1;
                            sent = 'a' + send;
                            //this.draw(sent, pre);
                            HJ[count++] = { sent };
                        }

                    }
                    else if (object[keys]["Node Type"] === "Sort") {
                        index += 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/sort.svg"  id="a' + idi++ + '" style="width:30px;height:40x; data-toggle="tooltip" data-placement="top" title="Sort Key : ' + object[keys]["Sort Key"] + ' Parallel Aware : ' + object[keys]["Parallel Aware"] + ' "/><br/>' + object[keys]["Node Type"] + '</div>');
                        if (idi !== 1) {
                            let pre = idi - 2;
                            pre = 'a' + pre;
                            let send = idi - 1;
                            sent = 'a' + send;
                            //this.draw(sent, pre);
                            draw[connect++] = { "From": sent, "To": pre };
                        }
                    }
                    else if (object[keys]["Node Type"] === "Unique") {
                        index += 1;
                        html.push('<div class =  "_column" >' + '<img src="../images/QueryExplain/ex_unique.svg"  id="a' + idi++ + '" style="width:30px;height:40x; data-toggle="tooltip" data-placement="bottom" title=" Parallel Aware : ' + object[keys]["Parallel Aware"] + '">"/><br/>' + object[keys]["Node Type"] + '</div>');
                        if (idi !== 1) {
                            let pre = idi - 2;
                            pre = 'a' + pre;
                            let send = idi - 1;
                            sent = 'a' + send;
                            //this.draw(sent, pre);
                            draw[connect++] = { "From": sent, "To": pre };
                        }
                    }
                    else {
                        html.push("<div> **unknown** </div>");
                    }
                }
                if (key === "Plans") {
                    //str += '</div ><div style="float: right;">';
                    this.JsonTraverse(object[keys][key]);
                }
            }
        }

    };

    this.draw = function () {
        for (var key in draw) {
            new LeaderLine(document.getElementById(draw[key].From),
                document.getElementById(draw[key].To), { size: 3, dash: { animation: true } }).setOptions({ startSocket: 'auto', endSocket: 'auto' });
            this.activemouse();
        }
    };

    this.activemouse = function () {
        //$("#_column").mouseover(alert("Yes"));
    };


    this.CreateHtml = function (resp) {
        var html = [];
        html.push(`<table  class="table table-bordered sqltbl explain-tbl ">
        <thead>
        <th>Query</th>
        <th>Explain</th>
        <th>Rowno</th>
    </thead>
    <tbody>
        `);

        html.push(`<tqueryplanr>
            <td>${resp.qstring}</td>
            <td>${this.getFromArray(resp.explain)}</td>
            <td>${resp.rowno}</td>
            <tr>`);
        $('#item').append(html.join());
    };


    this.CreateResult = function (resp) {
        var html = [];
        html.push(`<table class="table table-bordered sqltbl result-tbl">
                        <thead>
                            ${this.getThead(resp.resultobj.type)}
                        </thead>
                        <tbody>
                            ${this.getTbody(resp.resultobj.result)}
                        </tbody>
                </table>`);

        $('#item').append(html.join(""));
    };

    this.getThead = function (typeArray) {
        let arry = [];
        for (var i = 0; i < typeArray.length; i++) {
            arry.push(` <th>${typeArray[i]}</th>`);
        }
        return arry.join('');
    };

    this.getTbody = function (typeList) { // [[a,b,c],[ka,kb,kc]]
        let array = [];
        for (var i = 0; i < typeList.length; i++) {
            array.push(`<tr>`);
            for (var j = 0; j < typeList[i].length; j++) {
                array.push(`<td>${typeList[i][j]}</td>`);
            }
            array.push(`<tr>`);
        }
        return array.join('');
    };

    this.getFromArray = function (ar) {
        let h = new Array();
        for (i = 0; i < ar.length; i++) {
            h.push(`<div class="expl_byline" style="width:100%;">${ar[i]}</div>`);
        }
        return h.join("");
    };

    //this.start = function () {
    //    $("#explaine_btn").off("click").on("click", this.refresh.bind(this));
    //};

    //this.start();
};
