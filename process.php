<?php
$dir = "results/low";
$files = scandir($dir);
$ft = fopen("min_temps.csv", "wb");
fputcsv($ft, ['date', 'latitude', 'longitude', 'stationName', 'value', 'previousDate', 'previousValue', 'type']);

foreach($files as $file) {
    if(is_dir($file)) continue;

    $fh = fopen("$dir/$file", "r");
    $contents = fread($fh, filesize("$dir/$file"));

    $data = json_decode($contents, true);

    foreach($data as $key => $value) {
        if($key == "results") {
            foreach($value as $d) {
                fputcsv($ft, [
                    $d['date'],
                    $d['latitude'],
                    $d['longitude'],
                    ucwords(strtolower($d['stationName'])),
                    $d['value'] * .1,
                    $d['previousDate'],
                    $d['previousValue'] * .1,
                    "low"
                ]);
            }
        }
    }
}

fclose($ft);