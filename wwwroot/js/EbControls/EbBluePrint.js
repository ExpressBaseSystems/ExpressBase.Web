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
                        <h4 class='modal-title'>Blueprint Visualizer</h4>
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
        $.contextMenu(this.cntxMenuSetting);
        //$("#svgID").on("click", 'polygon', this.AddSvgMeta.bind(this));

        $("#addPolygon_BP").on("click", this.Addpolygon.bind(this));
        $("#clearsvg_BP").on("click", this.clearSvg.bind(this));
        $("#savesvg").on("click", this.saveBluePrint.bind(this));
        $("#updatesvgdtls_dev").on("click", this.updateBluePrint_dev.bind(this));
        //$("#relodsvg").on("click", this.relodSvg.bind(this));
        $("#removecircle_BP").on("click", this.removeCircle.bind(this));
        $("#bg_image_BP").on("change", this.setBackground.bind(this));
        $("#resetsvg_BP").on("click", this.resetSvg.bind(this));
        $("#mark_position").on("click", this.markPositionfn.bind(this));
        $("#zoomToggle_BP").on("click", this.zoomSVG.bind(this));



    }
    var flgObj = {};
    var bpretrive_data = {};
    var chkbox = 0;

    var polyNo = 100;
    var plgnID;
    this.imageUrl;
    var selectedPoly_lst = [];
    var points = [], g;

    var startPoint;
    var bluprnt_meta = {};
    var ContID = ctrlObj.EbSid_CtxId;
    var storeSetval;//store setval value 
    var tempSvg;
    var mousePoint;
    let zom_cordinate
    var tempOuterGrp;
    flgObj.drawPolygon = false;
    flgObj.dragging = false;
    flgObj.drawing = false;
    flgObj.zoomEnabled = false;
    flgObj.markPostn = false;
    flgObj.metaCount = 1;
    var translateVar = [0, 0];
    var markedData = {
        pol_marked: [{
            name: "node1",
            x: 100,
            y: 100,
            height: 50,
            width: 50
        }]
    };



    this.cntxMenuSetting = {
        selector: ".marked_area, .marked_point, polygon",

        items: {
            AddMeta: {
                name: "Add metadata",
                callback: function (itemKey, opt, e) {
                    let clicked_target = $(opt.$trigger).attr('id');
                    this.AddSvgMeta(opt);
                    //// Do not close the menu after clicking an item return false
                }.bind(this)
            }
        }
    }


    var svg = d3.select('#svgContainer').append('svg')
        .attr('height', 540)
        .attr('width', 720)
        .attr('id', 'svgID')
        .style('border', ' 1px solid blue')
        .style('background-color', 'white');
    var svg_g = d3.select('#svgID')
        .append('svg')
        .attr('id', 'innrSVG')
        .attr('height', 540)
        .attr('width', 720)
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
    }


    this.zoomSVG = function () {
        flgObj.zoomEnabled = !flgObj.zoomEnabled;
        if (flgObj.zoomEnabled) {
            svg_g.call(zoom_handler);
        } else {
            svg_g.on('.zoom', null);
        }
        //zoomToggle.node().innerText = 'Zoom is ' + ( flgObj.zoomEnabled ? 'enabled' : 'disabled');
    };

    var dragger = d3.drag()
        .on("drag", handleDrag)
        .on("end", dragended);


    this.Addpolygon = function () {
        flgObj.drawPolygon = true;
    }

    svg.on('click', function (e, k) {

        if (flgObj.dragging) return;
        mousePoint = d3.mouse(this);
        let zom_transform = d3.zoomTransform(svg_g.node());
        zom_cordinate = zom_transform.invert(mousePoint);

        if (flgObj.drawPolygon) {
            flgObj.drawing = true;
            //startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]];
            if (d3.select('#svgOuter_g').select('g.drawPoly').empty()) g = svg_g.append('g').attr('class', 'drawPoly');
            if (d3.event.target.hasAttribute('is-handle')) {
                closePolygon();
                return;
            };
            points.push(zom_cordinate);
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
        else if (!flgObj.drawPolygon) {
            if (flgObj.markPostn) {

                svg_g.append("g")
                    .append("circle")
                    .attr("cx", zom_cordinate[0])
                    .attr("cy", zom_cordinate[1])
                    .attr("r", 5)
                    .classed("marked_point", true);

                markedData.pol_marked.push({
                    name: "nodeN",
                    x: mousePoint[0],
                    y: mousePoint[1],
                    height: 15,
                    width: 15,
                })
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
            .classed("marked_area", true)
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
        flgObj.drawing = false;
        flgObj.drawPolygon = false;
    }

    //function dragstarted(d) {
    //    d3.select(this).raise().classed("active", true);
    //}

    function dragged(d) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
        d3.select(this).classed("active", false);
        flgObj.dragging = false;
    }


    svg.on('mousemove', function () {
        if (!flgObj.drawing) return;
        var g = d3.select('g.drawPoly');
        g.select('line').remove();
        let startPoint = d3.mouse(this);
        let zom_transform = d3.zoomTransform(svg_g.node());
        let line_cordinate = zom_transform.invert(startPoint);
        var line = g.append('line')
            .attr('x1', zom_cordinate[0])
            .attr('y1', zom_cordinate[1])
            .attr('x2', line_cordinate[0])
            .attr('y2', line_cordinate[1])
            .attr('stroke', '#53DBF3')
            .attr('stroke-width', 2);
    })
    function handleDrag() {
        if (flgObj.drawing) return;
        var dragCircle = d3.select(this), newPoints = [], circle;
        flgObj.dragging = true;
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










    this.markPositionfn = function () {
        flgObj.markPostn = true;

    }.bind(this);



    this.saveBluePrint = function () {
        // let savBPobj = {};
        tempOuterGrp = $('#svgOuter_g').clone();
        let data = new FormData();
        let savsvg = d3.select(tempOuterGrp[0]);
        savsvg.select("#ebSvgBGimg").remove();

        data.append("bluprntid", ctrlObj.BlueprintId);

        let txtsvg = savsvg._groups[0][0].innerHTML;
        data.append("svgtxtdata", txtsvg);
        data.append("bgimg", this.imageUrl);
        data.append("bpmeta", JSON.stringify(bluprnt_meta));
        // savBPobj.svgtext = txtsvg;
        // savBPobj.bp_meta = JSON.stringify(bluprnt_meta);
        // data.append("savBPobj", JSON.stringify(savBPobj));
        $.ajax({
            url: "../WebForm/SaveBluePrint",
            type: 'POST',
            data: data,
            contentType: "application/json",
            dataType: "json",
            processData: false,
            contentType: false,
            success: function (bpRes) {
                ctrlObj.BlueprintId = bpRes.bprntid;
                //svg.selectAll("*").remove();
            }
        });
    }

    this.updateBluePrint_dev = function () {
        if (ctrlObj.BlueprintId) {
            let uptBPobj = {};
            // tempSvg = d3.select('#svgID').select('svg')._groups[0];
            tempSvg = $('#innrSVG');
            tempOuterGrp = $('#svgOuter_g').clone();
            let data = new FormData();
            let savsvg = d3.select(tempOuterGrp[0]);
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
                    ctrlObj.BlueprintId = bpRes.bprntid;
                    //svg.selectAll("*").remove();

                    this.makeSVGcopy(tempSvg);

                }.bind(this)
            });
        }
    }.bind(this);


    this.makeSVGcopy = function (tsvg) {
        var svg123 = d3.select("tsvg").select('svg'),
            img = new Image(),
            serializer = new XMLSerializer(),
            svgStr = serializer.serializeToString(tsvg[0]);


        let imgsrc = 'data:image/svg+xml;base64,' + btoa(svgStr);
        let imghtml = `<img id='${ContID}_imgID' src='${imgsrc}'>`;
        //d3.select("#svgdataurl").html(img);
        //   $(`#${ContID}`).find('.ebimg-cont').html(imghtml);
        $(`#blueprint1_imgID`).attr('src', imgsrc).css({
            'opacity': '0.8',
            'width': '30%',
            'height': '50%'
        });
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

        svg.selectAll('#svgOuter_g > *').remove();
    }
    this.removeCircle = function (e) {
        svg.selectAll("circle").remove();
    }



    //detect svg element id on click
    this.AddSvgMeta = function (el_target, e) {
        if (!flgObj.drawing) {
            plgnID = $(el_target.$trigger).attr('id');
            var bdyhtml = "";
            var ftrhtml = "";
            if (!($(`#bpmeta_modal`) && $(`#bpmeta_modal`).length)) {
                var metacltr = `  <div  id='bpmeta_modal' class='modal fade' role='dialog'>
                      <div class='modal-dialog'>
                        <div class='modal-content'>
                          <div class='modal-header'>
                            <button id='AddMetaRow_btn' class='ebbtn eb_btnblue eb_btn-xs ' style='float: right;margin-top: 3px; ' type='button'>
                                <i class='fa fa-plus'></i>Add Fields
                                </button>
                            <h4 class='modal-title'>Meta</h4>
                          </div>
                          <div class='modal-body'>
                                <div id='bpAddMeta_Div'>
                                   
                                </div> 
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
            }
            ////for user side Blueprint drawing
            if (ebcontext.user.wc == 'uc') {
                let plainhtml = "";
                let obj = bluprnt_meta;
                //plgnID = $(e.target).closest('polygon').attr('id');
                let objval = obj[`${plgnID}`];
                $.each(objval, function (key, value) {
                    plainhtml += `<div>
                        <input type='text' id='metakey_${ContID + flgObj.metaCount}' class='metakey_cls' value='${key}'> 
                        <input type='text' id='metaval_${ContID + flgObj.metaCount}' class='metaval_cls' value='${value}'>
                        </div><br> `
                });
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
                $("#bpAddMeta_Div").html(plainhtml);
                plainhtml = "";

            }
            else
            ////for Dev side Blueprint drawing
            {

                //if (ctrlObj.BlueprintId) {
                let plainhtml = "";
                if (jQuery.isEmptyObject(bluprnt_meta)) {
                    //dev side edit mode
                    let obj = bluprnt_meta;
                    //plgnID = $(e.target).closest('polygon').attr('id');
                    if (obj.hasOwnProperty(plgnID)) {
                        ////for Dev side - edit mode
                        let objval = obj[`${plgnID}`];
                        flgObj.metaCount = 0;
                        $.each(objval, function (key, value) {
                            plainhtml += `<div>
                                <input type='text' id='metakey_${ContID + flgObj.metaCount}' class='metakey_cls' value='${key}'> 
                                <input type='text' id='metaval_${ContID + flgObj.metaCount}' class='metaval_cls' value='${value}'>
                                <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
                               </div> <br> `
                            flgObj.metaCount++;
                        });
                        $("#bpAddMeta_Div").html(plainhtml);
                    }
                    else {
                        ////if adding meta for 1st time for that id
                        plainhtml = `<div>
                            <input type='text' id='metakey_${ContID + flgObj.metaCount}' class='metakey_cls' >
                            <input type='text' id='metaval_${ContID + flgObj.metaCount}' class='metaval_cls'>
                            <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
                        </div><br>`;
                        flgObj.metaCount++;
                        $("#bpAddMeta_Div").html(plainhtml);
                    }
                }
                else {
                    ////for Dev side - new mode
                    $(".metakey_cls").val("");
                    $(".metaval_cls").val("");
                    let plainhtml = "";
                    // plgnID = $(e.target).closest('polygon').attr('id');
                    if (bluprnt_meta.hasOwnProperty(plgnID)) {
                        let objval = bluprnt_meta[`${plgnID}`];
                        $.each(objval, function (key, value) {
                            plainhtml += `<div>
                                <input type='text' id='metakey_${ContID + flgObj.metaCount}' class='metakey_cls' value='${key}'> 
                                <input type='text' id='metaval_${ContID + flgObj.metaCount}' class='metaval_cls' value='${value}'>
                                <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
                                </div><br> `
                            flgObj.metaCount++;
                        });
                        //$(`#metakey_${ContID + flgObj.metaCount}`).val(Object.keys(objval)[0]);
                        //$(`#metaval_${ContID + flgObj.metaCount}`).val(objval[Object.keys(objval)[0]]);
                        $("#bpAddMeta_Div").html(plainhtml);
                    }
                    else {
                        ////if adding meta for 1st time for that id
                        plainhtml = `<div>
                            <input type='text' id='metakey_${ContID + flgObj.metaCount}' class='metakey_cls' >
                            <input type='text' id='metaval_${ContID + flgObj.metaCount}' class='metaval_cls'>
                            <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
                        </div><br>`;
                        flgObj.metaCount++;
                        $("#bpAddMeta_Div").html(plainhtml);
                    }
                }

            }


            $('#bpmeta_modal').modal({
                backdrop: 'static',
                keyboard: false
            });

            $("#add_bpmeta").on("click", this.Add_Bpmetafn.bind(this));
            $("#ok_bpmeta").on("click", this.getMarkedPosfn.bind(this));
            $("#close_bpmeta_modal").on("click", this.close_Bpmetafn.bind(this));
            $("#AddMetaRow_btn").off("click").on("click", this.addMetaRowfn.bind(this));
            $(".remove_MetaKeyVal").on("click", this.remove_MetakeyValfn.bind(this));
        }
    }.bind(this);


    this.addMetaRowfn = function (e) {
        let inptHtml = "";
        inptHtml = ` <div>
                                <input type='text' id='metakey_${ContID + flgObj.metaCount}' class='metakey_cls' >
                                <input type='text' id='metaval_${ContID + flgObj.metaCount}' class='metaval_cls'>
                                <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
                            </div><br>`;

        $("#bpAddMeta_Div").append(inptHtml);

        flgObj.metaCount++;
    }

    this.remove_MetakeyValfn = function (el) {
        $(el.target).closest('div').remove();
    }
    //add metadata of polygon to list
    this.Add_Bpmetafn = function (e) {
        let valObj = {};
        let metakey = $(".metakey_cls");
        let metavalue = $(".metaval_cls");


        for (let i = 0; i < metakey.length; i++) {
            valObj[$(metakey[i]).val()] = $(metavalue[i]).val();
        }
        if (valObj != null) {
            bluprnt_meta[plgnID] = valObj;
        }
        //var metakey = $("#metakey_").val();
        //var metavalue = $("#metaval_$").val();
        //if (((metakey.length) && (metavalue.length))) {
        //    //  bluprnt_meta[plgnID] = { metakey, metavalue };
        //    valObj[`${metakey}`] = metavalue;
        //    bluprnt_meta[plgnID] = valObj;
        //}

        //  $(".metakey_cls").val("");
        //  $(".metaval_cls").val("");
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
    this.close_Bpmetafn = function () {
        //$(".metakey_cls").val("");
        //$(".metaval_cls").val("");
        //$("#close_bpmeta_modal").click();
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
        var ajax_redraw = $.ajax({
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
                polyNo += d3.selectAll('polygon')._groups[0].length;
                bluprnt_meta = JSON.parse(svgdata.bpMeta);
            }.bind(this)

        });
        $.when(ajax_redraw)
            .then(function () {
                if (storeSetval.length > 0) {
                    this.setvalueSelected(storeSetval);
                }

            }.bind(this));

    }.bind(this);



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

