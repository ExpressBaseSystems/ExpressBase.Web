//in clear and on new load code duplication

var blueprintModalfn = function (ctrlObj) {
    this.init2 = function () {
        $("#edit_buleprintbtn").on("click", this.modalBluePrintfn.bind(this));
    }
    this.ContID = ctrlObj.EbSid_CtxId;

    this.modalBluePrintfn = function () {

        var modalHTML = ` 
        <div class='modal fade BluprntModal' id='BP_Modal_${this.ContID}'  role='dialog'>
            <div class='modal-dialog' style=" width: 90%; margin-top: 10px;margin-bottom: 10px;">

                <div class='modal-content'>
                    <div class='modal-header' >
                        <button type='button' class='close' data-dismiss='modal'>&times;</button>
                        <h4 class='modal-title'>SVG creator</h4>
                    </div>
                    <div class='modal-body' style="height:calc(90vh - 70px);">
                         <div id='toolbar_divBP' class='col-md-1 col-lg-1 col-sm-1'>
                           <div class='vertical-align_tlbr' >
                                
                                    <div  id='addPolygon_BP' class='bp_toolbarproperties ' title="Add polygon">
                                        <i class="fa fa-object-ungroup "></i>   
                                    </div>

                                    <div  id='bg_image_BP' class='bp_toolbarproperties 'title="Image upload">
                                        <label for="bg_image">
                                           <i class='fa fa-picture-o'></i>
                                        </label>
                                        <input type='file' id='bg_image' accept='image/jpeg,image/png,image/jpg,svg' style=' display: none;' />
                                    </div> 

                                    <div id='removecircle_BP' class='bp_toolbarproperties 'title="Remove circles">
                                        <i class='fa fa-minus-circle'></i>
                                    </div>

                                     <div id='resetsvg_BP' class='bp_toolbarproperties 'title="Reset position">
                                        <i class='fa fa-refresh'></i>
                                    </div>

                                    <div id='clearsvg_BP' class='bp_toolbarproperties 'title="Clear layers">
                                        <i class='fa fa-eraser '></i>
                                    </div>

                                    <div id='zoomToggle_BP' class='bp_toolbarproperties 'title="Clear layers">
                                        <i class='fa fa-search  '></i>
                                    </div>
            
     

                            </div>
                        </div>
                        <div class="col-md-11 col-lg-11 col-sm-11">

                            <div id="svgContainer"></div>
                        </div>
                    </div>
                    <div class='modal-footer'>
                        <button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>
                    </div>
                </div>

            </div>
        </div>`;


        $("body").append(modalHTML);
        $('#BP_Modal_' + this.ContID).modal();

        var kj = drawBluePrintfn(ctrlObj);
        //        var modalHTML = ` 
        //<div class="fup" id="BP_Modal_${this.ContID}">
        //    <div class="imgup-bg">
        //        <div class="imgup-Cont">
        //            <div class="modal-header">
        //                <button type="button" class="close" onclick="$('#BP_Modal_${this.ContID} .imgup-bg').hide(500);" >&times;</button>
        //                <div style="margin-left:10px ; display:inline-block"> <h4 class="modal-title">Multi Language Key Settings.</h4> </div>
        //            </div>
        //            <div class="modal-body" style="height: 420px;">
        //                 <div id="buttondiv" class="col-md-2 col-lg-2 col-sm-2">
        //                    <input type="file" id="bg_image" accept="image/jpeg,image/png,image/jpg,svg" />
        //                    <button id="add">Add Polygon Points</button>
        //                    <button id="savesvg">Save</button><br />
        //                    <input type="text" id="idnotxt" />
        //                    <button id="relodsvg">reload</button><br />
        //                    <button id="clearsvg">Clear svg</button><br />
        //                    <button id="removecircle">remove circle</button>
        //                    <button id="resetsvg">Reset</button>

        //                    <button class="zoomToggle">Toggle zoom</button>
        //                </div>
        //                <div class="col-md-10 col-lg-10 col-sm-10">

        //                    <div id="svgContainer" style="background-color:transparent; border:1px solid blue"></div>
        //                </div>



        //            </div>
        //            <div class="modal-footer">
        //                <div class="modal-footer-body">

        //                    <button type="button" name="CXE_OK" id="${this.ContID}_close" class="btn"  onclick="$('#BP_Modal_${this.ContID} .imgup-bg').hide(500);">OK</button>

        //                    <button type="button" class="btn btn-default" onclick="$('#BP_Modal_${this.ContID} .imgup-bg').hide(500);">Cancel</button>
        //                </div>
        //            </div>
        //        </div>
        //    </div>
        //</div>`;


    }



    this.init2();
}

var drawBluePrintfn = function (ctrlObj) {

    this.init = function () {
        $("svg").on("click", 'polygon', this.detect.bind(this));

        $("#addPolygon_BP").on("click", this.Addpolygon.bind(this));
        $("#clearsvg_BP").on("click", this.clearSvg.bind(this));
        $("#savesvg").on("click", this.saveSvg.bind(this));
        $("#relodsvg").on("click", this.relodSvg.bind(this));
        $("#removecircle_BP").on("click", this.removeCircle.bind(this));
        $("#bg_image_BP").on("change", this.setBackground.bind(this));
        $("#resetsvg_BP").on("click", this.resetSvg.bind(this));

    }

    isAddPoints = 0;
    var polyNo = 100;
    this.imageUrl;
    var points = [], g;
    var dragging = false, drawing = false, startPoint;

    var svg = d3.select('#svgContainer').append('svg')
        .attr('height', 576)
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
        .on("start", dragstarted)
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
        var polyId = "ebpoly" + polyNo++;
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

    function dragstarted(d) {
        d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
        d3.select(this).classed("active", false);
        dragging = false;
    }


    svg.on('mousemove', function () {
        if (!drawing) return;
        //var g = d3.select('g.drawPoly');
        //g.select('line').remove();
        //var line = g.append('line')
        //    .attr('x1', startPoint[0])
        //    .attr('y1', startPoint[1])
        //    .attr('x2', d3.mouse(this)[0] + 2)
        //    .attr('y2', d3.mouse(this)[1])
        //    .attr('stroke', '#53DBF3')
        //    .attr('stroke-width', 1);
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


    this.saveSvg = function () {

        var tempSvg = $('#svgOuter_g').clone();
        var data = new FormData();
        var savsvg = d3.select(tempSvg[0]);
        savsvg.select("#ebSvgBGimg").remove();


        var txtsvg = savsvg._groups[0][0].innerHTML;
        data.append("svgtxtdata", txtsvg);
        data.append("bgimg", this.imageUrl);
        $.ajax({
            url: "../Vrgs_test/StoreSVG",
            type: 'POST',
            data: data,
            processData: false,
            contentType: false,
            //data: { svgtxtdata: txtsvg,  bgimg: bgimgfile},
            success: function () {
                svg.selectAll("*").remove();
            }
        });
    }
    this.relodSvg = function () {
        var vl = $("#idnotxt").val();

        $.ajax({
            url: "../Vrgs_test/RetriveSVG",
            type: 'POST',
            cache: false,
            data: { idno: vl },
            success: function (svgdata) {
                svg.select("#svgOuter_g").remove();
                svg_g = d3.select('svg')
                    .append('g')
                    .attr('id', 'svgOuter_g');
                var svgimg = svg_g.insert('g')
                    .attr('id', 'ebSvgBGimg')
                    .append('image')
                    .attr('xlink:href', svgdata.fileDataURL)
                    .attr("height", '100%')
                    .attr("width", '100%');

                d3.select("#svgOuter_g").html(d3.select("#svgOuter_g").html() + svgdata.svgPolyData);
                //$('svg').html(svgdata.svgPolyData);
                var crcl = svg.selectAll("circle");
                dragger(crcl);
                //$('body').append(`<img src="${svgdata.fileDataURL}" cntype="image/jpeg">`)

            }
        });
    }

    this.clearSvg = function (e) {
        svg.select("#svgOuter_g").remove();
        svg_g = d3.select('svg')
            .append('g')
            .attr('id', 'svgOuter_g');
    }
    this.removeCircle = function (e) {
        svg.selectAll("circle").remove();
    }



    //detect svg element id on click
    this.detect = function (e) {
        var kz = e.target.id;
        alert(kz);
    }.bind(this);


    this.setBackground = function (e) {
        svg.select("#svgOuter_g").remove();
        svg_g = d3.select('svg')
            .append('g')
            .attr('id', 'svgOuter_g');
        this.imageUrl = e.target.files[0];
        var src1 = URL.createObjectURL(this.imageUrl);
        var svgimg = svg_g.insert('g')
            .attr('id', 'ebSvgBGimg')
            .append('image')
            .attr('xlink:href', src1)
            .attr("height", '100%')
            .attr("width", '100%');

    }




    this.init();

}