<?php
    abstract class te{
        static function e(){
            echo 'Funfa normal po';
        }
    }
    te::e();
?>
<?php
/*
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Testing</title>
</head>
<body>
    <script>
        //Convert to server zone, before sending any data to server convert to timeZone from the server.
        let zone = new Date().toLocaleString('en-US',{timeZone:"<?php echo date_default_timezone_get()?>"})
        console.log(zone);
    </script>
</body>
</html>
    */
?>