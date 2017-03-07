<?php
include "token.php";
//$url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/records/data?datasetid=GHCND_REC_DLY&datatypeid=htmx&locationid=FIPS%3AUS&startdate=2017-02-01&enddate=2017-02-25&type=all&limit=50&offset=";

// ltmn = lowest min
// htmx = highest max

$offset = 0;
for($i=0; $i<2; $i++) {
    $url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/records/data?datasetid=GHCND_REC_DLY&datatypeid=ltmn&locationid=FIPS%3AUS&startdate=2017-02-01&enddate=2017-02-28&type=all&units=standard&limit=1000&offset=$offset";
    echo $url . "\n";
    $ch = curl_init($url);
    $fp = fopen("results_$i.json", "wb");

    curl_setopt($ch, CURLOPT_HTTPHEADER, $token);
    curl_setopt($ch, CURLOPT_FILE, $fp);
    curl_setopt($ch, CURLOPT_HEADER, 0);

    curl_exec($ch);
    curl_close($ch);

    fclose($fp);
    $offset += 1000;
}


