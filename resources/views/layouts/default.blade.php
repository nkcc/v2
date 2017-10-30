<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>@yield('title','sample') - HistoryTimeline</title>
    <link rel="stylesheet" href="/css/app.css">
    <link href="https://cdn.bootcss.com/animate.css/3.5.2/animate.min.css" rel="stylesheet">

</head>

<body>
    {{--  @include('layouts._header')  --}}
    @yield('timeline')
    <div class="container">
        <div class="col-md-offset-1 col-md-10">
            @yield('content')
            {{--  @include('layouts._footer')  --}}
        </div>
    </div>
    <script src="/js/app.js"></script>
    <script src="/js/all.js" type="text/javascript" charset="utf-8"></script>
  

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
</body>

</html>