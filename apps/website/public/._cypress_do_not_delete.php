<?php
$status = array('ccf' => true, 'php' => substr(phpversion(), 0, 3));

header('Content-type: application/json');
echo json_encode($status);

exit;
