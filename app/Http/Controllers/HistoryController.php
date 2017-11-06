<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HistoryController extends Controller
{
    //
    public function index()
    {
        return view('history/timeline');
    }

    public function test()
    {
        return view('history/test');
    }
}
