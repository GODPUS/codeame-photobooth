<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>face to gif</title>
    <link href="app.css?v=1" rel="stylesheet">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <div class="container">
      <div id="message">tap on video to record</div>
      <div id="progress"></div>
      <div id="video-container">
        <button id="record-button"></button>
        <div id="indicator">
          <svg height="40" width="40">
            <circle cx="20" cy="20" r="20" fill="red" />
          </svg>
        </div>
        <video autoplay height="100%" width="100%"></video>
      </div>
      <output id="gifs-go-here"></output>
    </div>

  <script src="js/vendor/jquery-1.11.0.min.js"></script>
  <script src="js/vendor/gif.js"></script>
  <script src="js/app.js?v=1"></script>
  </body>
</html>
