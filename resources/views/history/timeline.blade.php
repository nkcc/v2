@extends('layouts.default')
@section('head')
<link rel="stylesheet" href="/css/jquery-ui-1.8.5.custom.css" type="text/css" media="screen" title="no title" charset="utf-8">
<link href="//cdn.bootcss.com/semantic-ui/2.2.13/semantic.min.css" rel="stylesheet">
<link rel="stylesheet" href="/js/timeglider/Timeglider.css" type="text/css" media="screen" title="no title" charset="utf-8">
<link rel="stylesheet" href="/js/timeglider/timeglider.datepicker.css" type="text/css" media="screen" title="no title" charset="utf-8">
<link rel="stylesheet" href="/css/floating-menu.css" type="text/css" media="screen" title="no title" charset="utf-8">
<link href="//cdn.bootcss.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet">
<link href="//cdn.bootcss.com/animate.css/3.5.2/animate.min.css" rel="stylesheet">
@stop
@section('timeline')

<!-- target div for the widget -->
<div id='placement'></div>
    <div class="time-menu-float">
        <a class="icon ion-plus-circled" href="javascript:void(null);" data-action="show-actions-menu" data-fm-floatto="right"></a>
    </div>
@stop @section('script')
<script src="/js/all.js" type="text/javascript" charset="utf-8"></script>
<script src="//cdn.bootcss.com/semantic-ui/2.2.13/semantic.min.js"></script>
 <script src="js/floating-menu.js"></script>
    <script>
        $.floatingMenu({
            selector: '.time-menu-float a[data-action="show-actions-menu"]',
            items: [{
                icon: 'ion-arrow-resize',
                title: '时间轴对比',
                action: 'http://cc.yeethink.com/contrast.html',
                blank: true, // opens link in new tab (optional)
                close: false, // close the menu after the action happene (optional)
            }, {
                icon: 'ion-navicon',
                title: '历史事件列表',
                action: 'http://cc.yeethink.com/list/1.html',
                close: false, // no effect (optional)
            }, {
                icon: 'ion-plus',
                title: '新增历史事件',
                action: function(event) {
                    alert('insert');
                },
                blank: true, // no effect (optional)
                close: false, // close the menu after the action happene (optional)
            }]
        });
    </script>
<script type='text/javascript'>
    var tg1 = {};
    $(function () {
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
                }, 1); //2秒后执行该方法
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