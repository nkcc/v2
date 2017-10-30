<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>@yield('title','sample') - HistoryTimeline</title>
    <link rel="stylesheet" href="/css/app.css">
</head>

<body>
    @include('layouts._header')
    <div class="container">
        <div class="col-md-offset-1 col-md-10">

            @yield('content') @include('layouts._footer')
        </div>

    </div>
     <script src="/js/app.js"></script>
</body>

</html>