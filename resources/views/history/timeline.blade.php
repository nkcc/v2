@extends('layouts.default')
@section('pagecss')
    <link rel="stylesheet" href="/css/jquery-ui-1.8.5.custom.css" type="text/css" media="screen" title="no title" charset="utf-8">

    <link rel="stylesheet" href="/js/timeglider/Timeglider.css" type="text/css" media="screen" title="no title" charset="utf-8">

    <link rel="stylesheet" href="/css/docs-style.css" type="text/css" media="screen" title="no title" charset="utf-8">
@stop

@section('timeline')

    <!-- target div for the widget -->
    <div id='placement'></div>

@stop


@section('pagescript')

    <script src="/js/json2.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/jquery-1.9.1.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/jquery-ui-1.10.3.custom.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/underscore-min.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/backbone-min.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/jquery.tmpl.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/ba-debug.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/ba-tinyPubSub.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/jquery.mousewheel.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/jquery.ui.ipad.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/globalize.js" type="text/javascript" charset="utf-8"></script>

    <script src="/js/timeglider/TG_Date.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/timeglider/TG_Org.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/timeglider/TG_Timeline.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/timeglider/TG_TimelineView.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/timeglider/TG_Mediator.js" type="text/javascript" charset="utf-8"></script>
    <script src="/js/timeglider/timeglider.timeline.widget.js" type="text/javascript"></script>

    <script src="/js/timeglider/timeglider.datepicker.js" type="text/javascript"></script>
    <script src="js/jquery.jscrollpane.min.js" type="text/javascript"></script>


    <script type='text/javascript'>
        var tg1 = {};


        $(function() {

          var tg_instance = {};
            var selected_tags = [];


            tg1 = $("#placement").timeline({



                "min_zoom": 1,
                "max_zoom": 100,
                // "timezone": "-06:00",
                "icon_folder": "/",
                "data_source": "js/json/js_history.json",
                "show_footer": true,
                "display_zoom_level": true,
                "mousewheel": "zoom", // zoom | pan | none
                "constrain_to_data": false,
                "image_lane_height": 100,
                "legend": {
                    type: "default"
                }, // default | checkboxes
                "loaded": function (timelines, med) {
                    // timelineReady(med);
                    setTimeout(function () {
                        $(".tg-modal.tg-timeline-modal.ui-widget-content").addClass(
                            'animated fadeOut');
                    }, 2000); //2秒后执行该方法
                }

            }).resizable({
                stop: function () {
                    // $(this).data("timeline").resize();
                }
            });

            tg_instance = tg1.data("timeline");



        }); // end document-ready
    </script>

@stop