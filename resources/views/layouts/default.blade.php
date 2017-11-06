<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title','sample') - HistoryTimeline</title>
    @yield('head')
    <link rel="stylesheet" href="/css/app.css">


</head>

<body>
    @include('layouts._header')
    @yield('timeline')
    <div class="container">
        <div class="col-md-offset-1 col-md-10">
            @yield('content')
            @include('layouts._footer')
        </div>
    </div>
    <script src="/js/app.js"></script>
    <script src="/js/all.js" type="text/javascript" charset="utf-8"></script>
  

@yield('script')
</body>

</html>