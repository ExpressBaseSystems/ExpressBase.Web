////in clear and on new load code duplication
//////called from 1)FormBuilder.JS -> onDropFn 2)FormBuilder ->initCtrl //for editmode dev side
//let blueprintModalfn = function (ctrlObj) {
//    this.init2 = function () {
//        $("#edit_buleprintbtn").on("click", this.modalBluePrintfn.bind(this));
//    }
//    this.ContID = ctrlObj.EbSid_CtxId;
//    let drawBP;
//    this.modalBluePrintfn = function () {
//        let Bpmdlshow = 0;
//        if (!($(`#BP_Modal_${this.ContID}`) && $(`#BP_Modal_${this.ContID}`).length)) {
//            ///// <input type='file' id='bg_image' accept='image/jpeg,image/png,image/jpg,svg' style=' display: none;' />
//            let modalHTML = ` 
//        <div class='BPmodaldiv'>
//        <div class='modal fade BluprntModal' id='BP_Modal_${this.ContID}'  role='dialog'>
//            <div class='modal-dialog' style=" width: 90%; margin-top: 10px;margin-bottom: 10px;">

//                <div class='modal-content'>
//                    <div class='modal-header' >
//                        <button type='button' class='close' data-dismiss='modal'>&times;</button>
//                        <h4 class='modal-title'>Blueprint Visualizer</h4>
//                    </div>
//                    <div class='modal-body'>
//                         <div id='toolbar_divBP' class='col-md-1 col-lg-1 col-sm-1 toolbarBP_cls_dev'>
//                           <div class='vertical-align_tlbr' >
                                
//                                    <div  id='addPolygon_BP' class='bp_toolbarproperties '  tabindex='1' title="Mark">
//                                        <i class="fa fa-object-ungroup "></i>   
//                                    </div>

//                                    <div  id='BP_set_image' class='bp_toolbarproperties ' tabindex='1' title="Image upload">
//                                        <label for="bg_image">
//                                           <i class='fa fa-picture-o'></i>
//                                        </label>
                                   
                                       
//                                    </div> 

//                                    <div id='removecircle_BP' class='bp_toolbarproperties ' tabindex='1' title="Remove circles">
//                                        <i class='fa fa-minus-circle'></i>
//                                    </div>

//                                     <div id='resetsvg_BP' class='bp_toolbarproperties ' tabindex='1' title="Reset position">
//                                        <i class='fa fa-refresh'></i>
//                                    </div>

//                                    <div id='clearsvg_BP' class='bp_toolbarproperties ' tabindex='1' title="Clear layers">
//                                        <i class='fa fa-eraser '></i>
//                                    </div>

//                                    <div id='zoomToggle_BP' class='bp_toolbarproperties ' tabindex='1' title="Zoom">
//                                        <i class='fa fa-search  '></i>
//                                    </div>
//                            </div>
//                        </div>
//                        <div class="col-md-11 col-lg-11 col-sm-11 svgcntnrBP_dev">

//                            <div id="svgContainer"></div>
//                            <div id="BP_propertyGrid"></div>
//                        </div>
//                    </div>
//                    <div class='modal-footer' id= BP_Modal_${ this.ContID}_footer>
//                        <button type='button' id='savesvg' class='btn btn-default' data-dismiss='modal'>OK</button>
//                    </div>
//                </div>

//            </div>
//            </div>  
//        </div>`;



//            $("body").append(modalHTML);
//            Bpmdlshow = 1;
//        }

//        $('#BP_Modal_' + this.ContID).modal({
//            backdrop: 'static',
//            keyboard: false
//        });



//        if (Bpmdlshow) {


//            if (ctrlObj.BlueprintId) {
//                let ftrhtml = `<button type='button' id='updatesvgdtls_dev' class='btn btn-default' data-dismiss='modal'>OK</button>`
//                $(`#BP_Modal_${this._thisBP.ContID}_footer`).html(ftrhtml);
//                drawBP = new drawBluePrintfn(ctrlObj);
//                drawBP.redrawSVGelements_dev();
//            }
//            else {
//                drawBP = new drawBluePrintfn(ctrlObj);
//            }
//        }
//    }

//    this.init2();
//}
//////called from 1)EbBlueprint ->blueprintModalfn 2)InitFormControls.js ->BluePrint
//let drawBluePrintfn = function (ctrlObj) {

//    this.init = function () {
//        $.contextMenu(this.cntxMenuAreaMarked);
//        $.contextMenu(this.cntxMenuAreaSelected);
//        //$("#svgID").on("click", 'polygon', this.AddSvgMeta.bind(this));

//        $("#addPolygon_BP").on("click", this.Addpolygon.bind(this));
//        $("#clearsvg_BP").on("click", this.clearSvg.bind(this));
//        $("#savesvg").on("click", this.saveBluePrint.bind(this));
//        $("#updatesvgdtls_dev").on("click", this.updateBluePrint_dev.bind(this));
//        //$("#relodsvg").on("click", this.relodSvg.bind(this));
//        $("#removecircle_BP").on("click", this.removeCircle.bind(this));
//        //  $("#BP_set_image").on("change", this.setBackground.bind(this));
//        $("#resetsvg_BP").on("click", this.resetSvg.bind(this));
//        $("#mark_position").on("click", this.markPositionfn.bind(this));
//        $("#zoomToggle_BP").on("click", this.zoomSVG.bind(this));
//        //  $(".marked_point").on("click", this.showParentMeta.bind(this));

//        this.setBluePrintImage();
//    }
//    _thisBP = this;
//    ctrlObj.Blueprint_UniqueID = commonO.Current_obj.EbSid + "_" + ctrlObj.EbSid;
//    _thisBP.flgObj = {};
//    _thisBP.bpretrive_data = {};
//    _thisBP.chkbox = 0;
//    _thisBP.polyNo = 100;
//    _thisBP.markedPointCount = 1;
//    _thisBP.plgnID;
//    _thisBP.imageUrl;/////no need for since image refid is used
//    _thisBP.markedArea_lst = [];
//    _thisBP.points_lst = [];
//    var g;
//    //_thisBP.startPoint;
//    _thisBP.bluprnt_meta = {};
//    _thisBP.ContID = ctrlObj.EbSid_CtxId;
//    _thisBP.storeSetval;//store setval value 
//    _thisBP.tempSvg;
//    _thisBP.mousePoint;
//    _thisBP.zom_cordinate
//    _thisBP.tempOuterGrp;
//    _thisBP.flgObj.drawPolygon = false;
//    _thisBP.flgObj.dragging = false;
//    _thisBP.flgObj.drawing = false;
//    _thisBP.flgObj.zoomEnabled = false;
//    _thisBP.flgObj.markPosition = false;
//    _thisBP.flgObj.metaCount = 1;
//    _thisBP.translatelet = [0, 0];
//    _thisBP.imageRefid;
//    _thisBP.markedData = {
//        pol_marked: [{
//            name: "node1",
//            x: 100,
//            y: 100,
//            height: 50,
//            width: 50
//        }]
//    };


//    this.cntxMenuAreaMarked = {
//        selector: ".marked_area, polygon",
//        items: {
//            AddMeta: {
//                name: "Add metadata",
//                callback: function (itemKey, opt, e) {
//                    let clicked_target = $(opt.$trigger).attr('id');
//                    this.AddSvgMeta(opt);
//                    //// Do not close the menu after clicking an item return false
//                }.bind(this)
//            }
//        }

//    }
//    this.cntxMenuAreaSelected = {
//        selector: ".marked_point",
//        items: {
//            AddMeta: {
//                name: "Show Details",
//                callback: function (itemKey, opt, e) {
//                    let clicked_targetID = $(opt.$trigger).attr('id');
//                    this.ShowParent_Meta(opt);
//                    //// Do not close the menu after clicking an item return false
//                }.bind(this)
//            }
//        }
//    }


//    let svg = d3.select('#svgContainer').append('svg')
//        .attr('height', 540)
//        .attr('width', 720)
//        .attr('id', 'svgID')
//        .style('border', ' 1px solid blue')
//        .style('background-color', 'white');
//    let svg_g = d3.select('#svgID')
//        .append('svg')
//        .attr('id', 'innrSVG')
//        .attr('height', 540)
//        .attr('width', 720)
//        .append('svg')
//        .append('g')
//        .attr('id', 'svgOuter_g');
//    //.call(d3.behavior.zoom().on("zoom", function () {
//    //    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
//    //}));

//    let zoom_handler = d3.zoom()
//        .scaleExtent([.5, 5])
//        .on("zoom", zoom_actions);

//    function zoom_actions() {
//        // svg.select("svg").attr("transform", d3.event.transform);
//        let transform = d3.zoomTransform(this);
//        this.setAttribute("transform", transform.toString());
//    }

//    //reset svg to initial position
//    this.resetSvg = function () {
//        svg_g.transition().call(zoom_handler.transform, d3.zoomIdentity);
//    }

//    this.zoomSVG = function () {
//        _thisBP.flgObj.zoomEnabled = !_thisBP.flgObj.zoomEnabled;
//        if (_thisBP.flgObj.zoomEnabled) {
//            svg_g.call(zoom_handler);
//        } else {
//            svg_g.on('.zoom', null);
//        }
//        //zoomToggle.node().innerText = 'Zoom is ' + ( _thisBP.flgObj.zoomEnabled ? 'enabled' : 'disabled');
//    };

//    let dragger = d3.drag()
//        .on("drag", handleDrag)
//        .on("end", dragended);


//    this.Addpolygon = function () {
//        _thisBP.flgObj.drawPolygon = true;
//    }

//    svg.on('click', function (e, k) {

//        if (_thisBP.flgObj.dragging) return;
//        _thisBP.mousePoint = d3.mouse(this);
//        let zom_transform = d3.zoomTransform(svg_g.node());
//        _thisBP.zom_cordinate = zom_transform.invert(_thisBP.mousePoint);

//        if (_thisBP.flgObj.drawPolygon) {
//            _thisBP.flgObj.drawing = true;
//            //_thisBP.startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]];
//            if (d3.select('#svgOuter_g').select('g.drawPoly').empty()) g = svg_g.append('g').attr('class', 'drawPoly');
//            if (d3.event.target.hasAttribute('is-handle')) {
//                closePolygon();
//                return;
//            };
//            _thisBP.points_lst.push(_thisBP.zom_cordinate);
//            g.select('polyline').remove();
//            let polyline = g.append('polyline').attr('points', _thisBP.points_lst)
//                .style('fill', 'none')
//                .attr('stroke', '#000');
//            for (let i = 0; i < _thisBP.points_lst.length; i++) {
//                g.append('circle')
//                    .attr('cx', _thisBP.points_lst[i][0])
//                    .attr('cy', _thisBP.points_lst[i][1])
//                    .attr('r', 4)
//                    .attr('fill', 'red')
//                    .attr('stroke', '#000')
//                    .attr('is-handle', 'true')
//                    .style({ cursor: 'pointer' });
//            }
//        }
//        else if (!_thisBP.flgObj.drawPolygon) {
//            if (_thisBP.flgObj.markPosition) {
//                //for marking point at user side and save point to markedPoint_dtls
//                svg_g.append("g")
//                    .append("circle")
//                    .attr("cx", _thisBP.zom_cordinate[0])
//                    .attr("cy", _thisBP.zom_cordinate[1])
//                    .attr("r", 5)
//                    .attr("input_type", "markPoint")
//                    .attr("id", d3.event.target.id + "_" + _thisBP.markedPointCount)
//                    .classed("marked_point", true);
//                let selectedPoly_lst = {};
//                let markedPointObj = {};
//                let mrkPntID = d3.event.target.id + "_" + "MP" + _thisBP.markedPointCount;
//                markedPointObj["parentID"] = d3.event.target.id;
//                markedPointObj["markedPointID"] = mrkPntID;
//                markedPointObj["cx"] = _thisBP.zom_cordinate[0];
//                markedPointObj["cy"] = _thisBP.zom_cordinate[1];
//                markedPointObj["r"] = 5;
//                markedPointObj["class"] = "marked_point";
//                markedPointObj["input_type"] = "markPoint";


//                selectedPoly_lst[mrkPntID] = markedPointObj;
//                _thisBP.markedArea_lst.push(selectedPoly_lst);
//                for (let i = 0; i < ctrlObj._onChangeFunctions.length; i++)
//                    ctrlObj._onChangeFunctions[i]();

//                _thisBP.markedPointCount++;
//                _thisBP.markedData.pol_marked.push({
//                    name: "nodeN",
//                    x: _thisBP.mousePoint[0],
//                    y: _thisBP.mousePoint[1],
//                    height: 15,
//                    width: 15,
//                })
//            }
//        }
//    });


//    function closePolygon() {
//        svg.select('g.drawPoly').remove();
//        let grp = svg_g.append('g')
//                    .classed("poly_grp",true);
//        let polyId = ctrlObj.Blueprint_UniqueID +"_"+ "poly" + _thisBP.polyNo++;
//        grp.append('polygon')
//            .attr('id', polyId)
//            .attr('points', _thisBP.points_lst)
//            .classed("marked_area", true)
//            .style('fill', getRandomColor());
//        for (let i = 0; i < _thisBP.points_lst.length; i++) {
//            let circle = grp.selectAll('circles')
//                .data([_thisBP.points_lst[i]])
//                .enter()
//                .append('circle')
//                .attr('cx', _thisBP.points_lst[i][0])
//                .attr('cy', _thisBP.points_lst[i][1])
//                .attr('r', 4)
//                .attr('fill', '#FDBC07')
//                .attr('stroke', '#000')
//                .attr('is-handle', 'true')
//                .style('cursor', 'move')
//            dragger(circle);

//        }
//        _thisBP.points_lst.splice(0);
//        _thisBP.flgObj.drawing = false;
//        _thisBP.flgObj.drawPolygon = false;
//    }

//    //function dragstarted(d) {
//    //    d3.select(this).raise().classed("active", true);
//    //}

//    function dragged(d) {
//        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
//    }

//    function dragended(d) {
//        d3.select(this).classed("active", false);
//        _thisBP.flgObj.dragging = false;
//    }

//    svg.on('mousemove', function () {
//        if (!_thisBP.flgObj.drawing) return;
//        let g = d3.select('g.drawPoly');
//        g.select('line').remove();
//        let startPoint = d3.mouse(this);
//        let zom_transform = d3.zoomTransform(svg_g.node());
//        let line_cordinate = zom_transform.invert(startPoint);
//        let line = g.append('line')
//            .attr('x1', _thisBP.zom_cordinate[0])
//            .attr('y1', _thisBP.zom_cordinate[1])
//            .attr('x2', line_cordinate[0])
//            .attr('y2', line_cordinate[1])
//            .attr('stroke', '#53DBF3')
//            .attr('stroke-width', 2);
//    })
//    function handleDrag() {
//        if (_thisBP.flgObj.drawing) return;
//        let dragCircle = d3.select(this), newPoints = [], circle;
//        _thisBP.flgObj.dragging = true;
//        let poly = d3.select(this.parentNode).select('polygon');
//        let circles = d3.select(this.parentNode).selectAll('circle');
//        dragCircle
//            .attr('cx', d3.event.x)
//            .attr('cy', d3.event.y);
//        //for (let i = 0; i < circles[0].length; i++) {
//        for (let i = 0; i < circles._groups[0].length; i++) {
//            circle = d3.select(circles._groups[0][i]);
//            newPoints.push([circle.attr('cx'), circle.attr('cy')]);
//        }
//        poly.attr('points', newPoints);
//    }
//    function getRandomColor() {
//        return "rgba(" + Math.floor(Math.random() * 255) + ","
//            + Math.floor(Math.random() * 255) + ","
//            + Math.floor(Math.random() * 255) + ",0.6)";

//    }




//    this.markPositionfn = function () {
//        _thisBP.flgObj.markPosition = !_thisBP.flgObj.markPosition;

//    }.bind(this);

//    this.saveBluePrint = function () {
//        let areamarked = {};
        
        
        
//        areamarked.Area_ParentFormID;
//        areamarked.Area_FormID;
        

//        var plygrpLst = d3.selectAll(".poly_grp");
//        plygrpLst.each(function (d, i) {
//            areamarked.BP_AreaMarkedID = $(this).find('polygon').attr("id")
//            areamarked.Area_HTMLtext = this;    
//            let nme = _thisBP.bluprnt_meta[areamarked.BP_AreaMarkedID];
//            areamarked.Area_DispalyName = Object.keys(nme)[0];
//            areamarked.Area_Name = nme[key];
//            var child1 = d3.select(this).select(".childNode>*");
//            var children = d3.selectAll(this.childNodes);
//            console.log(children);
//            ctrlObj.AreaMarkedList.$values.push(areamarked);
//        });




//        _thisBP.tempOuterGrp = $('#svgOuter_g').clone();
//        let data = new FormData();
//        let savsvg = d3.select(_thisBP.tempOuterGrp[0]);
//        savsvg.select("#ebSvgBGimg").remove();

//        data.append("bluprntid", ctrlObj.BlueprintId);

//        let txtsvg = savsvg._groups[0][0].innerHTML;
//        data.append("svgtxtdata", txtsvg);
//        data.append("bgimg", _thisBP.imageUrl);
//        data.append("bpmeta", JSON.stringify(_thisBP.bluprnt_meta));
//        // savBPobj.svgtext = txtsvg;
//        // savBPobj.bp_meta = JSON.stringify(_thisBP.bluprnt_meta);
//        // data.append("savBPobj", JSON.stringify(savBPobj));
//        //$.ajax({
//        //    url: "../WebForm/SaveBluePrint",
//        //    type: 'POST',
//        //    data: data,
//        //    contentType: "application/json",
//        //    dataType: "json",
//        //    processData: false,
//        //    contentType: false,
//        //    success: function (bpRes) {
//        //        ctrlObj.BlueprintId = bpRes.bprntid;
//        //        //svg.selectAll("*").remove();
//        //    }
//        //});


//        ctrlObj.BP_ImageRefid = _thisBP.imageRefid;
       


//    }

//    this.updateBluePrint_dev = function () {
//        if (ctrlObj.BlueprintId) {
//            let uptBPobj = {};
//            // _thisBP.tempSvg = d3.select('#svgID').select('svg')._groups[0];
//            _thisBP.tempSvg = $('#innrSVG');
//            _thisBP.tempOuterGrp = $('#svgOuter_g').clone();
//            let data = new FormData();
//            let savsvg = d3.select(_thisBP.tempOuterGrp[0]);
//            savsvg.select("#ebSvgBGimg").remove();
//            let txtsvg = savsvg._groups[0][0].innerHTML;
//            data.append("bluprntid", ctrlObj.BlueprintId);
//            data.append("bgimg", _thisBP.imageUrl);
//            uptBPobj.svgtext = txtsvg;
//            uptBPobj.bp_meta = JSON.stringify(_thisBP.bluprnt_meta);
//            data.append("uptBPobj", JSON.stringify(uptBPobj));
//            $.ajax({
//                url: "../WebForm/UpdateBluePrint_Dev",
//                type: 'POST',
//                data: data,
//                contentType: "application/json",
//                dataType: "json",
//                processData: false,
//                contentType: false,
//                success: function (bpRes) {
//                    ctrlObj.BlueprintId = bpRes.bprntid;
//                    //svg.selectAll("*").remove();

//                    this.makeSVGcopy(_thisBP.tempSvg);

//                }.bind(this)
//            });
//        }
//    }.bind(this);


//    this.makeSVGcopy = function (tsvg) {
//        let svg123 = d3.select("tsvg").select('svg'),
//            img = new Image(),
//            serializer = new XMLSerializer(),
//            svgStr = serializer.serializeToString(tsvg[0]);


//        let imgsrc = 'data:image/svg+xml;base64,' + btoa(svgStr);
//        let imghtml = `<img id='${_thisBP.ContID}_imgID' src='${imgsrc}'>`;
//        //d3.select("#svgdataurl").html(img);
//        //   $(`#${_thisBP.ContID}`).find('.ebimg-cont').html(imghtml);
//        $(`#blueprint1_imgID`).attr('src', imgsrc).css({
//            'opacity': '0.8',
//            'width': '30%',
//            'height': '50%'
//        });
//    }



//    //this.relodSvg = function () {
//    //    let vl = $("#idnotxt").val();

//    //    $.ajax({
//    //        url: "../Vrgs_test/RetriveSVG",
//    //        type: 'POST',
//    //        cache: false,
//    //        data: { idno: vl },
//    //        success: function (svgdata) {
//    //            svg.select("#svgOuter_g").remove();
//    //            svg_g = d3.select('svg')
//    //                .append('g')
//    //                .attr('id', 'svgOuter_g');
//    //            let svgimg = svg_g.insert('g')
//    //                .attr('id', 'ebSvgBGimg')
//    //                .append('image')
//    //                .attr('xlink:href', svgdata.fileDataURL)
//    //                .attr("height", '100%')
//    //                .attr("width", '100%');

//    //            d3.select("#svgOuter_g").html(d3.select("#svgOuter_g").html() + svgdata.svgPolyData);
//    //            //$('svg').html(svgdata.svgPolyData);
//    //            let crcl = svg.selectAll("circle");
//    //            dragger(crcl);
//    //            //$('body').append(`<img src="${svgdata.fileDataURL}" cntype="image/jpeg">`)

//    //        }
//    //    });
//    //}

//    this.clearSvg = function (e) {

//        svg.selectAll('#svgOuter_g > *').remove();
//    }
//    this.removeCircle = function (e) {
//        svg.selectAll("circle").remove();
//    }

//    this.ShowParent_Meta = function (el_target, e) {
//        if (el_target.selector == ".marked_point") {
//            let plainhtml = "";
//            let selectedID = el_target.$trigger[0].id;
//            $.each(_thisBP.markedArea_lst, function (key, value) {
//                Object.keys(value)
//                    .forEach(function eachKey(key) {
//                        if (Object.keys(value) == selectedID) {
//                            let markedParentID = value[selectedID].parentID;
//                            alert(markedParentID);
//                        }
//                    });


//            });

//        }
//    }
//    //detect svg element id on click
//    this.AddSvgMeta = function (el_target, e) {
//        if (!_thisBP.flgObj.drawing) {
//            _thisBP.plgnID = $(el_target.$trigger).attr('id');
//            let bdyhtml = "";
//            let ftrhtml = "";
//            if (!($(`#bpmeta_modal`) && $(`#bpmeta_modal`).length)) {
//                let metacltr = `  <div  id='bpmeta_modal' class='modal fade' role='dialog'>
//                      <div class='modal-dialog'>
//                        <div class='modal-content'>
//                          <div class='modal-header'>
//                            <button id='AddMetaRow_btn' class='ebbtn eb_btnblue eb_btn-xs ' style='float: right;margin-top: 3px; ' type='button'>
//                                <i class='fa fa-plus'></i>Add Fields
//                                </button>
//                            <h4 class='modal-title'>Meta</h4>
//                          </div>
//                          <div class='modal-body'>
//                                <div id='bpAddMeta_Div'>
                                   
//                                </div> 
//                          </div>
//                          <div class='modal-footer'>
//                             <button type='button' id='add_bpmeta' class='btn btn-default' >Add</button>
//                             <button type='button' id='close_bpmeta_modal' class='btn btn-close btn-default' data-dismiss='modal'>Close</button>
//                          </div>
//                        </div>
//                      </div>
//                    </div>`

//                // $('#BP_Modal_' + this._thisBP.ContID).append(metacltr);
//                $('body').append(metacltr);
//            }


//            ////for user side Blueprint drawing
//            if (ebcontext.user.wc == 'uc') {
//                let plainhtml = "";
//                let obj = _thisBP.bluprnt_meta;
//                //_thisBP.plgnID = $(e.target).closest('polygon').attr('id');
//                let objval = obj[`${_thisBP.plgnID}`];
//                $.each(objval, function (key, value) {
//                    plainhtml += `<div>
//                        <input type='text' id='metakey_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metakey_cls' value='${key}'> 
//                        <input type='text' id='metaval_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metaval_cls' value='${value}'>
//                        </div><br> `
//                });
//                if (_thisBP.chkbox == 0) {
//                    bdyhtml = `<br><input type='checkbox' id='bppoly_slct' value='1'>select<br>`;
//                    ftrhtml = `<button type='button' id='ok_bpmeta' class='btn btn-default' >Ok</button>
//                       <button type='button' id='close_bpmeta_modal' class='btn btn-default' data-dismiss='modal'>Close</button>`;
//                    $('#bpmeta_modal').find('.modal-body').append(bdyhtml);
//                    $('#bpmeta_modal').find('.modal-footer').html(ftrhtml);
//                }
//                $("#bppoly_slct").prop("checked", false);
//                if (_thisBP.markedArea_lst.includes(_thisBP.plgnID))
//                    $("#bppoly_slct").prop("checked", true);
//                _thisBP.chkbox = 1;
//                $("#bpAddMeta_Div").html(plainhtml);
//                plainhtml = "";

//            }
//            else
//            ////for Dev side Blueprint drawing
//            {

//                //if (ctrlObj.BlueprintId) {
//                let plainhtml = "";
//                if (jQuery.isEmptyObject(_thisBP.bluprnt_meta)) {
//                    //dev side edit mode
//                    let obj = _thisBP.bluprnt_meta;
//                    //_thisBP.plgnID = $(e.target).closest('polygon').attr('id');
//                    if (obj.hasOwnProperty(_thisBP.plgnID)) {
//                        ////for Dev side - edit mode
//                        let objval = obj[`${_thisBP.plgnID}`];
//                        _thisBP.flgObj.metaCount = 0;
//                        $.each(objval, function (key, value) {
//                            plainhtml += `<div>
//                                <input type='text' id='metakey_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metakey_cls' value='${key}'> 
//                                <input type='text' id='metaval_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metaval_cls' value='${value}'>
//                                <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
//                               </div> <br> `
//                            _thisBP.flgObj.metaCount++;
//                        });
//                        $("#bpAddMeta_Div").html(plainhtml);
//                    }
//                    else {
//                        ////if adding meta for 1st time for that id
//                        plainhtml = `<div>
//                            <input type='text' id='metakey_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metakey_cls' >
//                            <input type='text' id='metaval_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metaval_cls'>
//                            <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
//                        </div><br>`;
//                        _thisBP.flgObj.metaCount++;
//                        $("#bpAddMeta_Div").html(plainhtml);
//                    }
//                }
//                else {
//                    ////for Dev side - new mode
//                    $(".metakey_cls").val("");
//                    $(".metaval_cls").val("");
//                    let plainhtml = "";
//                    // _thisBP.plgnID = $(e.target).closest('polygon').attr('id');
//                    if (_thisBP.bluprnt_meta.hasOwnProperty(_thisBP.plgnID)) {
//                        let objval = _thisBP.bluprnt_meta[`${_thisBP.plgnID}`];
//                        $.each(objval, function (key, value) {
//                            plainhtml += `<div>
//                                <input type='text' id='metakey_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metakey_cls' value='${key}'> 
//                                <input type='text' id='metaval_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metaval_cls' value='${value}'>
//                                <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
//                                </div><br> `
//                            _thisBP.flgObj.metaCount++;
//                        });
//                        //$(`#metakey_${_thisBP.ContID + _thisBP.flgObj.metaCount}`).val(Object.keys(objval)[0]);
//                        //$(`#metaval_${_thisBP.ContID + _thisBP.flgObj.metaCount}`).val(objval[Object.keys(objval)[0]]);
//                        $("#bpAddMeta_Div").html(plainhtml);
//                    }
//                    else {
//                        ////if adding meta for 1st time for that id
//                        plainhtml = `<div>
//                            <input type='text' id='metakey_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metakey_cls' >
//                            <input type='text' id='metaval_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metaval_cls'>
//                            <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
//                        </div><br>`;
//                        _thisBP.flgObj.metaCount++;
//                        $("#bpAddMeta_Div").html(plainhtml);
//                    }
//                }

//            }


//            $('#bpmeta_modal').modal({
//                backdrop: 'static',
//                keyboard: false
//            });
//            $("#AddMetaRow_btn").prop('disabled', true);
//            $("#add_bpmeta").on("click", this.Add_Bpmetafn.bind(this));
//            $("#ok_bpmeta").on("click", this.getMarkedPosfn.bind(this));
//            $("#close_bpmeta_modal").on("click", this.close_Bpmetafn.bind(this));
//            $("#AddMetaRow_btn").off("click").on("click", this.addMetaRowfn.bind(this));
//            $(".remove_MetaKeyVal").on("click", this.remove_MetakeyValfn.bind(this));
//        }
//    }.bind(this);


//    this.addMetaRowfn = function (e) {
//        let inptHtml = "";
//        inptHtml = ` <div>
//                                <input type='text' id='metakey_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metakey_cls' >
//                                <input type='text' id='metaval_${_thisBP.ContID + _thisBP.flgObj.metaCount}' class='metaval_cls'>
//                                <button type='button'class='remove_MetaKeyVal' style='border-radius: 50%; border: none; background: transparent;'>&times;</button>
//                            </div><br>`;

//        $("#bpAddMeta_Div").append(inptHtml);

//        _thisBP.flgObj.metaCount++;
//    }

//    this.remove_MetakeyValfn = function (el) {
//        $(el.target).closest('div').remove();
//    }
//    //add metadata of polygon to list
//    this.Add_Bpmetafn = function (e) {
//        let valObj = {};
//        let metakey = $(".metakey_cls");
//        let metavalue = $(".metaval_cls");


//        for (let i = 0; i < metakey.length; i++) {
//            valObj[$(metakey[i]).val()] = $(metavalue[i]).val();
//        }
//        if (valObj != null) {
//            _thisBP.bluprnt_meta[_thisBP.plgnID] = valObj;
//        }
//        //let metakey = $("#metakey_").val();
//        //let metavalue = $("#metaval_$").val();
//        //if (((metakey.length) && (metavalue.length))) {
//        //    //  _thisBP.bluprnt_meta[_thisBP.plgnID] = { metakey, metavalue };
//        //    valObj[`${metakey}`] = metavalue;
//        //    _thisBP.bluprnt_meta[_thisBP.plgnID] = valObj;
//        //}

//        //  $(".metakey_cls").val("");
//        //  $(".metaval_cls").val("");
//        $("#close_bpmeta_modal").click();
//        // $('#bpmeta_modal').modal('toggle');
//    }

//    this.getMarkedPosfn = function (e) {
//        if ($("#bppoly_slct").prop('checked') == true) {
//            d3.select(`#${_thisBP.plgnID}`).classed('element_blink_slct', true);
//            if (!_thisBP.markedArea_lst.includes(_thisBP.plgnID))
//                _thisBP.markedArea_lst.push(_thisBP.plgnID);
//            for (let i = 0; i < ctrlObj._onChangeFunctions.length; i++)
//                ctrlObj._onChangeFunctions[i]();
//        }
//        else {
//            d3.select(`#${_thisBP.plgnID}`).classed('element_blink_slct', false);
//            d3.select(`#${_thisBP.plgnID}`).classed('element_blink_edtmode', false);
//            if (_thisBP.markedArea_lst.includes(_thisBP.plgnID))
//                _thisBP.markedArea_lst.pop(_thisBP.plgnID);
//            for (let i = 0; i < ctrlObj._onChangeFunctions.length; i++)
//                ctrlObj._onChangeFunctions[i]();
//        }

//        $("#close_bpmeta_modal").click();
//        //$('#bpmeta_modal').modal('toggle');
//    }
//    this.close_Bpmetafn = function () {
//        //$(".metakey_cls").val("");
//        //$(".metaval_cls").val("");
//        //$("#close_bpmeta_modal").click();
//    }

//    //this.setBackground = function (e) {
//    //    if (e.target.files[0]) {
//    //        svg.selectAll('#svgOuter_g > *').remove();
//    //        _thisBP.imageUrl = e.target.files[0];
//    //        let src1 = URL.createObjectURL(_thisBP.imageUrl);
//    //        let svgimg = svg_g.insert('g')
//    //            .attr('id', 'ebSvgBGimg')
//    //            .append('image')
//    //            .attr('xlink:href', src1)
//    //            .attr("height", '100%')
//    //            .attr("width", '100%');
//    //    }
//    //}


//    this.redrawSVGelements_usr = function () {
//        let BpID = ctrlObj.BlueprintId;
//        _thisBP.storeSetval = "";
//        let ajax_redraw = $.ajax({
//            url: "../WebForm/RetriveBluePrint",
//            type: 'POST',
//            cache: false,
//            data: { idno: BpID },
//            success: function (svgdata) {
//                svg_g = d3.select('svg').select('#svgOuter_g');
//                //.append('g');
//                //.attr('id', 'svgOuter_g');
//                let svgimg = svg_g.insert('g')
//                    .attr('id', 'ebSvgBGimg')
//                    .append('image')
//                    .attr('xlink:href', svgdata.fileDataURL)
//                    .attr("height", '100%')
//                    .attr("width", '100%');

//                d3.select("#svgOuter_g").html(d3.select("#svgOuter_g").html() + svgdata.svgPolyData);

//                let crcl = svg_g.selectAll("circle").remove();
//                bpretrive_data = svgdata;
//                _thisBP.polyNo += d3.selectAll('polygon')._groups[0].length;
//                _thisBP.bluprnt_meta = JSON.parse(svgdata.bpMeta);
//            }.bind(this)

//        });
//        $.when(ajax_redraw)
//            .then(function () {
//                if (_thisBP.storeSetval.length > 0) {
//                    this.setvalueSelected(_thisBP.storeSetval);
//                }

//            }.bind(this));

//    }.bind(this);



//    this.redrawSVGelements_dev = function () {
//        let BpID = ctrlObj.BlueprintId;
//        $.ajax({
//            url: "../WebForm/RetriveBluePrint",
//            type: 'POST',
//            cache: false,
//            data: { idno: BpID },
//            success: function (svgdata) {
//                svg_g = d3.select('svg').select('#svgOuter_g');
//                //.append('g');
//                //.attr('id', 'svgOuter_g');
//                let svgimg = svg_g.insert('g')
//                    .attr('id', 'ebSvgBGimg')
//                    .append('image')
//                    .attr('xlink:href', svgdata.fileDataURL)
//                    .attr("height", '100%')
//                    .attr("width", '100%');

//                d3.select("#svgOuter_g").html(d3.select("#svgOuter_g").html() + svgdata.svgPolyData);

//                let crcl = svg_g.selectAll("circle");
//                dragger(crcl);
//                bpretrive_data = svgdata;
//                _thisBP.polyNo += d3.selectAll('polygon')._groups[0].length;
//                _thisBP.bluprnt_meta = JSON.parse(svgdata.bpMeta);

//            }

//        });

//    }

//    this.getvalueSelected = function () {
//        let marked_lst_json = JSON.stringify(_thisBP.markedArea_lst);
//        //_thisBP.markedArea_lst = [];
//        return marked_lst_json;

//    }

//    this.setvalueSelected = function (p1) {
//        if (p1 != null) {
//            _thisBP.markedPointCount = 1;
//            let arr = JSON.parse(p1);
//            _thisBP.markedArea_lst = [];/////do need this???
//            $.each(arr, function (index, value) {
//                if (!jQuery.isEmptyObject(value)) {

//                    ////svg_g.append("g")
//                    ////    .append("circle")
//                    ////    .attr("cx", value["cx"])
//                    ////    .attr("cy", value["cy"])
//                    ////    .attr("r", value["r"])
//                    ////    .attr("id", value["markedPointID"])
//                    ////    .classed("marked_point", true);

//                    $.each(value, function (key1, value1) {
//                        svg_g.append("g")
//                            .append("circle")
//                            .attr("cx", value1["cx"])
//                            .attr("cy", value1["cy"])
//                            .attr("r", value1["r"])
//                            .attr("id", value1["markedPointID"])
//                            .classed("marked_point", true);
//                    });
//                    _thisBP.markedPointCount++;

//                }

//                _thisBP.markedArea_lst.push(value);
//            });
//            for (let i = 0; i < ctrlObj._onChangeFunctions.length; i++)
//                ctrlObj._onChangeFunctions[i]();
//            _thisBP.storeSetval = p1;
//        }
//        //let arr = JSON.parse(p1);
//        //$.each(arr, function (index, value) {
//        //    d3.select(`#${value}`).classed('element_blink_edtmode', true);
//        //    _thisBP.markedArea_lst.push(value);
//        //});

//    }

//    this.clear_ctrlAftrsave = function (p2) {

//        $.each(_thisBP.markedArea_lst, function (index, value) {

//            $.each(value, function (key1, value1) {

//                let pointID = value1["markedPointID"];
//                d3.select(`#${pointID}`).remove();
//            });
//            //d3.select(`#${value}`).classed('element_blink_slct', false);
//        });
//        for (let i = 0; i < ctrlObj._onChangeFunctions.length; i++)
//            ctrlObj._onChangeFunctions[i]();
//        _thisBP.markedArea_lst = [];

//    }

//    this.setBluePrintImage = function () {

//        let bpImg = new EbFileUpload({
//            Type: "image",
//            Toggle: "#BP_set_image",
//            TenantId: ebcontext.user.CId,
//            SolutionId: ebcontext.sid,
//            Container: "onboarding_logo",
//            Multiple: false,
//            ServerEventUrl: ebcontext.env === "Production" ? 'https://se.expressbase.com' : 'https://se.eb-test.cloud',
//            //EnableTag: ctrl.EnableTag,
//            EnableTag: false,
//            EnableCrop: false,
//            Context: "logo",//if single and crop
//            ResizeViewPort: false //if single and crop
//        });

//        bpImg.uploadSuccess = function (fileid) {
//            EbMessage("show", { Message: "Profile Image Uploaded Successfully" });
//            if (fileid) {
//                setTimeout(function () {
//                    svg.selectAll('#svgOuter_g > *').remove();
//                    let src1 = `${location.origin}/images/large/${fileid}.jpg`;
//                    let svgimg = svg_g.insert('g')
//                        .attr('id', 'ebSvgBGimg')
//                        .append('image')
//                        .attr('xlink:href', src1)
//                        .attr("height", '100%')
//                        .attr("width", '100%');
//                }, 6000);
               
//                _thisBP.imageRefid = fileid;
//            }


//        }
//        bpImg.windowClose = function () {
//            EbMessage("show", { Message: "window closed", Background: "red" });
//        }
       
//    };

//    //this.PGobj = new Eb_PropertyGrid({
//    //    id: "BP_proGrid_div",
//    //    wc: this.wc,
//    //    cid: this.cid,
//    //    $extCont: $("#BP_propertyGrid"),
//    //    isDraggable: true
//    //});

//    this.init();

//}

