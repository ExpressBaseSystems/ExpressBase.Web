//in clear and on new load code duplication
////called from 1)FormBuilder.JS -> onDropFn 2)FormBuilder ->initCtrl //for editmode dev side
var blueprintModalfn = function (ctrlObj) {
    this.init2 = function () {
        $("#edit_buleprintbtn").on("click", this.modalBluePrintfn.bind(this));
    }
    this.ContID = ctrlObj.EbSid_CtxId;
    var drawBP;
    this.modalBluePrintfn = function () {
        var Bpmdlshow = 0;
        if (!($(`#BP_Modal_${this.ContID}`) && $(`#BP_Modal_${this.ContID}`).length)) {

            var modalHTML = ` 
        <div class='BPmodaldiv'>
        <div class='modal fade BluprntModal' id='BP_Modal_${this.ContID}'  role='dialog'>
            <div class='modal-dialog' style=" width: 90%; margin-top: 10px;margin-bottom: 10px;">

                <div class='modal-content'>
                    <div class='modal-header' >
                        <button type='button' class='close' data-dismiss='modal'>&times;</button>
                        <h4 class='modal-title'>SVG creator</h4>
                    </div>
                    <div class='modal-body'>
                         <div id='toolbar_divBP' class='col-md-1 col-lg-1 col-sm-1 toolbarBP_cls_dev'>
                           <div class='vertical-align_tlbr' >
                                
                                    <div  id='addPolygon_BP' class='bp_toolbarproperties '  tabindex='1' title="Mark">
                                        <i class="fa fa-object-ungroup "></i>   
                                    </div>

                                    <div  id='bg_image_BP' class='bp_toolbarproperties ' tabindex='1' title="Image upload">
                                        <label for="bg_image">
                                           <i class='fa fa-picture-o'></i>
                                        </label>
                                        <input type='file' id='bg_image' accept='image/jpeg,image/png,image/jpg,svg' style=' display: none;' />
                                    </div> 

                                    <div id='removecircle_BP' class='bp_toolbarproperties ' tabindex='1' title="Remove circles">
                                        <i class='fa fa-minus-circle'></i>
                                    </div>

                                     <div id='resetsvg_BP' class='bp_toolbarproperties ' tabindex='1' title="Reset position">
                                        <i class='fa fa-refresh'></i>
                                    </div>

                                    <div id='clearsvg_BP' class='bp_toolbarproperties ' tabindex='1' title="Clear layers">
                                        <i class='fa fa-eraser '></i>
                                    </div>

                                    <div id='zoomToggle_BP' class='bp_toolbarproperties ' tabindex='1' title="Zoom">
                                        <i class='fa fa-search  '></i>
                                    </div>
                            </div>
                        </div>
                        <div class="col-md-11 col-lg-11 col-sm-11 svgcntnrBP_dev">

                            <div id="svgContainer"></div>
                        </div>
                    </div>
                    <div class='modal-footer' id= BP_Modal_${ this.ContID}_footer>
                        <button type='button' id='savesvg' class='btn btn-default' data-dismiss='modal'>OK</button>
                    </div>
                </div>

            </div>
            </div>  
        </div>`;



            $("body").append(modalHTML);
            Bpmdlshow = 1;
        }

        $('#BP_Modal_' + this.ContID).modal({
            backdrop: 'static',
            keyboard: false
        });



        if (Bpmdlshow) {


            if (ctrlObj.BlueprintId) {
                let ftrhtml = `<button type='button' id='updatesvgdtls_dev' class='btn btn-default' data-dismiss='modal'>OK</button>`
                $(`#BP_Modal_${this.ContID}_footer`).html(ftrhtml);
                drawBP = new drawBluePrintfn(ctrlObj);
                drawBP.redrawSVGelements_dev();
            }
            else {
                drawBP = new drawBluePrintfn(ctrlObj);
            }
        }


    }



    this.init2();
}
////called from 1)EbBlueprint ->blueprintModalfn 2)InitFormControls.js ->BluePrint
var drawBluePrintfn = function (ctrlObj) {

    this.init = function () {
        $("#svgID").on("click", 'polygon', this.AddSvgMeta.bind(this));

        $("#addPolygon_BP").on("click", this.Addpolygon.bind(this));
        $("#clearsvg_BP").on("click", this.clearSvg.bind(this));
        $("#savesvg").on("click", this.saveBluePrint.bind(this));
        $("#updatesvgdtls_dev").on("click", this.updateBluePrint_dev.bind(this));
        //$("#relodsvg").on("click", this.relodSvg.bind(this));
        $("#removecircle_BP").on("click", this.removeCircle.bind(this));
        $("#bg_image_BP").on("change", this.setBackground.bind(this));
        $("#resetsvg_BP").on("click", this.resetSvg.bind(this));


    }
    var bpretrive_data;
    var chkbox = 0;
    isAddPoints = 0;
    var polyNo = 100;
    var plgnID;
    this.imageUrl;
    var selectedPoly_lst = [];
    var points = [], g;
    var dragging = false, drawing = false, startPoint;
    var bluprnt_meta = {};
    var ContID = ctrlObj.EbSid_CtxId;
    var storeSetval;

    var svg = d3.select('#svgContainer').append('svg')
        .attr('height', 540)
        .attr('width', 720)
        .attr('id', 'svgID')
        .style('border', ' 1px solid blue')
        .style('background-color', 'white');
    var svg_g = d3.select('#svgID')
        .append('svg')
        .append('g')
        .attr('id', 'svgOuter_g');
    //.call(d3.behavior.zoom().on("zoom", function () {
    //    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    //}));




    var zoom_handler = d3.zoom()
        .scaleExtent([.5, 5])
        .on("zoom", zoom_actions);

    function zoom_actions() {
        // svg.select("svg").attr("transform", d3.event.transform);
        var transform = d3.zoomTransform(this);
        this.setAttribute("transform", transform.toString());
    }



    //reset svg to initial position
    this.resetSvg = function () {

        svg_g.transition().call(zoom_handler.transform, d3.zoomIdentity);
        //svg_g = d3.select('svg')
        //    .append('g')
        //    .attr('id', 'svgOuter_g');
    }


    var zoomEnabled;
    var zoomToggle = d3.select('#zoomToggle_BP').on('click', toggleZoom);
    function toggleZoom() {
        zoomEnabled = !zoomEnabled;
        if (zoomEnabled) {
            svg_g.call(zoom_handler);
        } else {
            svg_g.on('.zoom', null);
        }
        //zoomToggle.node().innerText = 'Zoom is ' + (zoomEnabled ? 'enabled' : 'disabled');
    };




    var dragger = d3.drag()
        .on("drag", handleDrag)
        .on("end", dragended);



    this.Addpolygon = function () {
        svg_g.on('.zoom', null); svg_g.on('.zoom', null);
        svg_g.transition().call(zoom_handler.transform, d3.zoomIdentity);
        isAddPoints = 1;
    }

    svg.on('mouseup', function () {
        if (dragging) return;
        if (isAddPoints) {
            drawing = true;
            startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]];
            if (svg.select('g.drawPoly').empty()) g = svg.append('g').attr('class', 'drawPoly');
            if (d3.event.target.hasAttribute('is-handle')) {
                closePolygon();
                return;
            };
            points.push(d3.mouse(this));
            g.select('polyline').remove();
            var polyline = g.append('polyline').attr('points', points)
                .style('fill', 'none')
                .attr('stroke', '#000');
            for (var i = 0; i < points.length; i++) {
                g.append('circle')
                    .attr('cx', points[i][0])
                    .attr('cy', points[i][1])
                    .attr('r', 4)
                    .attr('fill', 'red')
                    .attr('stroke', '#000')
                    .attr('is-handle', 'true')
                    .style({ cursor: 'pointer' });
            }
        }
    });



    function closePolygon() {
        svg.select('g.drawPoly').remove();
        var g = svg_g.append('g');
        var polyId = ContID + "poly" + polyNo++;
        g.append('polygon')
            .attr('id', polyId)
            .attr('points', points)
            .style('fill', getRandomColor());
        for (var i = 0; i < points.length; i++) {
            var circle = g.selectAll('circles')
                .data([points[i]])
                .enter()
                .append('circle')
                .attr('cx', points[i][0])
                .attr('cy', points[i][1])
                .attr('r', 4)
                .attr('fill', '#FDBC07')
                .attr('stroke', '#000')
                .attr('is-handle', 'true')
                .style('cursor', 'move')
            dragger(circle);

        }
        points.splice(0);
        drawing = false;
        isAddPoints = 0;
    }

    //function dragstarted(d) {
    //    d3.select(this).raise().classed("active", true);
    //}

    function dragged(d) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
        d3.select(this).classed("active", false);
        dragging = false;
    }


    svg.on('mousemove', function () {
        if (!drawing) return;
        var g = d3.select('g.drawPoly');
        g.select('line').remove();
        var line = g.append('line')
            .attr('x1', startPoint[0])
            .attr('y1', startPoint[1])
            .attr('x2', d3.mouse(this)[0] + 2)
            .attr('y2', d3.mouse(this)[1])
            .attr('stroke', '#53DBF3')
            .attr('stroke-width', 1);
    })
    function handleDrag() {
        if (drawing) return;
        var dragCircle = d3.select(this), newPoints = [], circle;
        dragging = true;
        var poly = d3.select(this.parentNode).select('polygon');
        var circles = d3.select(this.parentNode).selectAll('circle');
        dragCircle
            .attr('cx', d3.event.x)
            .attr('cy', d3.event.y);
        //for (var i = 0; i < circles[0].length; i++) {
        for (var i = 0; i < circles._groups[0].length; i++) {
            circle = d3.select(circles._groups[0][i]);
            newPoints.push([circle.attr('cx'), circle.attr('cy')]);
        }
        poly.attr('points', newPoints);
    }
    function getRandomColor() {
        return "rgba(" + Math.floor(Math.random() * 255) + ","
            + Math.floor(Math.random() * 255) + ","
            + Math.floor(Math.random() * 255) + ",0.6)";

    }



    this.saveBluePrint = function () {
        let savBPobj = {};
        let tempSvg = $('#svgOuter_g').clone();
        let data = new FormData();
        let savsvg = d3.select(tempSvg[0]);
        savsvg.select("#ebSvgBGimg").remove();

        data.append("bluprntid", ctrlObj.BlueprintId);

        let txtsvg = savsvg._groups[0][0].innerHTML;
        data.append("svgtxtdata", txtsvg);
        data.append("bgimg", this.imageUrl);
        data.append("bpmeta", JSON.stringify(bluprnt_meta));
        savBPobj.svgtext = txtsvg;
        savBPobj.bp_meta = JSON.stringify(bluprnt_meta);
        data.append("savBPobj", JSON.stringify(savBPobj));
        $.ajax({
            url: "../WebForm/SaveBluePrint",
            type: 'POST',
            data: data,
            contentType: "application/json",
            dataType: "json",
            processData: false,
            contentType: false,
            success: function (bpRes) {
                alert(bpRes.bprntid)
                ctrlObj.BlueprintId = bpRes.bprntid;
                //svg.selectAll("*").remove();
            }
        });
    }

    this.updateBluePrint_dev = function () {
        alert("");
        if (ctrlObj.BlueprintId) {
            let uptBPobj = {};
            let tempSvg = $('#svgOuter_g').clone();
            let data = new FormData();
            let savsvg = d3.select(tempSvg[0]);
            savsvg.select("#ebSvgBGimg").remove();
            let txtsvg = savsvg._groups[0][0].innerHTML;
            data.append("bluprntid", ctrlObj.BlueprintId);
            data.append("bgimg", this.imageUrl);
            uptBPobj.svgtext = txtsvg;
            uptBPobj.bp_meta = JSON.stringify(bluprnt_meta);
            data.append("uptBPobj", JSON.stringify(uptBPobj));
            $.ajax({
                url: "../WebForm/UpdateBluePrint_Dev",
                type: 'POST',
                data: data,
                contentType: "application/json",
                dataType: "json",
                processData: false,
                contentType: false,
                success: function (bpRes) {
                    alert(bpRes.bprntid)
                    ctrlObj.BlueprintId = bpRes.bprntid;
                    //svg.selectAll("*").remove();
                }
            });
        }
    }
    //this.relodSvg = function () {
    //    var vl = $("#idnotxt").val();

    //    $.ajax({
    //        url: "../Vrgs_test/RetriveSVG",
    //        type: 'POST',
    //        cache: false,
    //        data: { idno: vl },
    //        success: function (svgdata) {
    //            svg.select("#svgOuter_g").remove();
    //            svg_g = d3.select('svg')
    //                .append('g')
    //                .attr('id', 'svgOuter_g');
    //            var svgimg = svg_g.insert('g')
    //                .attr('id', 'ebSvgBGimg')
    //                .append('image')
    //                .attr('xlink:href', svgdata.fileDataURL)
    //                .attr("height", '100%')
    //                .attr("width", '100%');

    //            d3.select("#svgOuter_g").html(d3.select("#svgOuter_g").html() + svgdata.svgPolyData);
    //            //$('svg').html(svgdata.svgPolyData);
    //            var crcl = svg.selectAll("circle");
    //            dragger(crcl);
    //            //$('body').append(`<img src="${svgdata.fileDataURL}" cntype="image/jpeg">`)

    //        }
    //    });
    //}

    this.clearSvg = function (e) {
        //svg.select("#svgOuter_g").remove();
        //svg_g = d3.select('svg')
        //    .append('g')
        //    .attr('id', 'svgOuter_g');
        svg.selectAll('#svgOuter_g > *').remove();
    }
    this.removeCircle = function (e) {
        svg.selectAll("circle").remove();
    }



    //detect svg element id on click
    this.AddSvgMeta = function (e) {
        if (!drawing) {
            var bp_metamdl = 0;
            var bdyhtml = "";
            var ftrhtml = "";
            if (!($(`#bpmeta_modal`) && $(`#bpmeta_modal`).length)) {
                var metacltr = `  <div class='modal fade' id='bpmeta_modal' role='dialog'>
                            <div class='modal-dialog'>
                              <div class='modal-content'>
                                <div class='modal-header'>
                                  <h4 class='modal-title'>Meta</h4>
                                </div>
                                <div class='modal-body'>
                                  <input type='text' id='bpMetakey' >
                                 <input type='text' id='bpMetavalue' >
                                </div>
                                <div class='modal-footer'>
                                  <button type='button' id='add_bpmeta' class='btn btn-default' >Add</button>
                                  <button type='button' id='close_bpmeta_modal' class='btn btn-close btn-default' data-dismiss='modal'>Close</button>
                                </div>
                              </div>
                            </div>
                          </div>`

                // $('#BP_Modal_' + this.ContID).append(metacltr);
                $('body').append(metacltr);
                bp_metamdl = 1;
            }
            ////for user side Blueprint drawing
            if (ebcontext.user.wc == 'uc') {
                var obj = JSON.parse(bpretrive_data.bpMeta);
                plgnID = $(e.target).closest('polygon').attr('id');
                var objval = obj[`${plgnID}`];
                $("#bpMetakey").val(Object.keys(objval)[0]).prop('disabled', true);
                $("#bpMetavalue").val(objval[Object.keys(objval)[0]]).prop('disabled', true);
                if (chkbox == 0) {
                    bdyhtml = `<br><input type='checkbox' id='bppoly_slct' value='1'>select<br>`;
                    ftrhtml = `<button type='button' id='ok_bpmeta' class='btn btn-default' >Ok</button>
                       <button type='button' id='close_bpmeta_modal' class='btn btn-default' data-dismiss='modal'>Close</button>`;
                    $('#bpmeta_modal').find('.modal-body').append(bdyhtml);
                    $('#bpmeta_modal').find('.modal-footer').html(ftrhtml);
                }
                $("#bppoly_slct").prop("checked", false);
                if (selectedPoly_lst.includes(plgnID))
                    $("#bppoly_slct").prop("checked", true);
                chkbox = 1;

            }
            else
            ////for Dev side Blueprint drawing
            {
                ////for Dev side - edit mode
                if (ctrlObj.BlueprintId) {
                    var obj = JSON.parse(bpretrive_data.bpMeta);
                    plgnID = $(e.target).closest('polygon').attr('id');
                    if (obj.hasOwnProperty(plgnID)) {
                        var objval = obj[`${plgnID}`];
                        $("#bpMetakey").val(Object.keys(objval)[0]);
                        $("#bpMetavalue").val(objval[Object.keys(objval)[0]]);
                    }
                }
                else
                    ////for Dev side - new mode
                $("#bpMetakey").val("");
                $("#bpMetavalue").val("");
                plgnID = $(e.target).closest('polygon').attr('id');
                if (bluprnt_meta.hasOwnProperty(plgnID)) {
                    var objval = bluprnt_meta[`${plgnID}`];
                    $("#bpMetakey").val(Object.keys(objval)[0]);
                    $("#bpMetavalue").val(objval[Object.keys(objval)[0]]);
                }

            }


            $('#bpmeta_modal').modal({
                backdrop: 'static',
                keyboard: false
            });

            $("#add_bpmeta").on("click", this.Add_Bpmetafn.bind(this));
            $("#ok_bpmeta").on("click", this.getMarkedPosfn.bind(this));
        }
    }.bind(this);

    //add metadata of polygon to list
    this.Add_Bpmetafn = function (e) {
        valObj = {};
        var metakey = $("#bpMetakey").val();
        var metavalue = $("#bpMetavalue").val();
        if (((metakey.length) && (metavalue.length))) {
            //  bluprnt_meta[plgnID] = { metakey, metavalue };
            valObj[`${metakey}`] = metavalue;
            bluprnt_meta[plgnID] = valObj;
        }
        $("#bpMetakey").val("");
        $("#bpMetavalue").val("");
        $("#close_bpmeta_modal").click();
        // $('#bpmeta_modal').modal('toggle');
    }

    this.getMarkedPosfn = function (e) {
        if ($("#bppoly_slct").prop('checked') == true) {
            d3.select(`#${plgnID}`).classed('element_blink_slct', true);
            if (!selectedPoly_lst.includes(plgnID))
                selectedPoly_lst.push(plgnID);
            for (let i = 0; i < ctrlObj._onChangeFunctions.length; i++)
                ctrlObj._onChangeFunctions[i]();
        }
        else {
            d3.select(`#${plgnID}`).classed('element_blink_slct', false);
            d3.select(`#${plgnID}`).classed('element_blink_edtmode', false);
            if (selectedPoly_lst.includes(plgnID))
                selectedPoly_lst.pop(plgnID);
            for (let i = 0; i < ctrlObj._onChangeFunctions.length; i++)
                ctrlObj._onChangeFunctions[i]();
        }

        $("#close_bpmeta_modal").click();
        //$('#bpmeta_modal').modal('toggle');
    }


    this.setBackground = function (e) {
        if (e.target.files[0]) {
            svg.selectAll('#svgOuter_g > *').remove();
            this.imageUrl = e.target.files[0];
            var src1 = URL.createObjectURL(this.imageUrl);
            var svgimg = svg_g.insert('g')
                .attr('id', 'ebSvgBGimg')
                .append('image')
                .attr('xlink:href', src1)
                .attr("height", '100%')
                .attr("width", '100%');
        }
    }


    this.redrawSVGelements_usr = function () {
        let BpID = ctrlObj.BlueprintId;
        storeSetval = "";
        $.ajax({
            url: "../WebForm/RetriveBluePrint",
            type: 'POST',
            cache: false,
            data: { idno: BpID },
            success: function (svgdata) {
                svg_g = d3.select('svg').select('#svgOuter_g');
                //.append('g');
                //.attr('id', 'svgOuter_g');
                var svgimg = svg_g.insert('g')
                    .attr('id', 'ebSvgBGimg')
                    .append('image')
                    .attr('xlink:href', svgdata.fileDataURL)
                    .attr("height", '100%')
                    .attr("width", '100%');

                d3.select("#svgOuter_g").html(d3.select("#svgOuter_g").html() + svgdata.svgPolyData);

                var crcl = svg_g.selectAll("circle").remove();
                bpretrive_data = svgdata;
                if (storeSetval.length>0) {
                    var arr = JSON.parse(storeSetval);
                    $.each(arr, function (index, value) {
                        d3.select(`#${value}`).classed('element_blink_edtmode', true);
                        selectedPoly_lst.push(value);
                    });
                    for (let i = 0; i < ctrlObj._onChangeFunctions.length; i++)
                        ctrlObj._onChangeFunctions[i]();
                }
            }

        });

    }

    this.redrawSVGelements_dev = function () {
        let BpID = ctrlObj.BlueprintId;
        $.ajax({
            url: "../WebForm/RetriveBluePrint",
            type: 'POST',
            cache: false,
            data: { idno: BpID },
            success: function (svgdata) {
                svg_g = d3.select('svg').select('#svgOuter_g');
                //.append('g');
                //.attr('id', 'svgOuter_g');
                let svgimg = svg_g.insert('g')
                    .attr('id', 'ebSvgBGimg')
                    .append('image')
                    .attr('xlink:href', svgdata.fileDataURL)
                    .attr("height", '100%')
                    .attr("width", '100%');

                d3.select("#svgOuter_g").html(d3.select("#svgOuter_g").html() + svgdata.svgPolyData);

                let crcl = svg_g.selectAll("circle");
                dragger(crcl);
                bpretrive_data = svgdata;
                polyNo += d3.selectAll('polygon')._groups[0].length;
                bluprnt_meta = JSON.parse(svgdata.bpMeta);

            }

        });

    }

    this.getvalueSelected = function () {
        return JSON.stringify(selectedPoly_lst);
    }

    this.setvalueSelected = function (p1) {

        var arr = JSON.parse(p1);
        $.each(arr, function (index, value) {
            d3.select(`#${value}`).classed('element_blink_edtmode', true);
            selectedPoly_lst.push(value);
        });
        for (let i = 0; i < ctrlObj._onChangeFunctions.length; i++)
            ctrlObj._onChangeFunctions[i]();
        storeSetval = p1;
    }

    this.clear_ctrlAftrsave = function (p2) {

        $.each(selectedPoly_lst, function (key, value) {
            d3.select(`#${value}`).classed('element_blink_slct', false);
        });

        selectedPoly_lst = [];

    }


    this.init();

}