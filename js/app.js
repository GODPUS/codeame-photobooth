(function () {
  "use strict";

  function thisBrowserIsBad() {
    alert("dude use a different browser");
  }

  function getStream(callback, fail) {
    (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || thisBrowserIsBad).call(navigator, {video: true}, callback, fail);
  }

  var facetogif = {
    settings: { w: 200, h: 150, framerate: 1000/10, seconds: 3000, countdown: 3000 },
    canvas: null,
    video: null,
    stream: null,
    blobs: [],
    frames: []
  };

  var recorder = {
    gif: null,
    interval: null,
    frames: [],
    ctx: null,
    start: function () {
      this.interval = setInterval(this.record(this.ctx, this.frames, this.gif), facetogif.settings.framerate);
    },
    pause: function () {
      clearInterval(this.interval);
    },
    compile: function (callback) {
      this.gif.on('finished', function (blob) { callback(blob); });
      this.gif.render();
    },
    record: function(ctx, frames, gif) {
      return function () {
        if (facetogif.video.src) {
          ctx.drawImage(facetogif.video, 0, 0, facetogif.settings.w, facetogif.settings.h);
          var frame = ctx.getImageData(0, 0, facetogif.settings.w, facetogif.settings.h);
          frames.push(frame);
          gif.addFrame(frame, {delay: facetogif.settings.framerate});
        } else {
          clearInterval(this.interval);
        }
      }
    },
    upload: function(blob) {

      var reader = new window.FileReader();
         
      reader.onloadend = function() {
        var base64data = reader.result;                
        
        console.log('uploading...')
        $.post('upload.php', JSON.stringify({ src: base64data }), function(data){ 
          console.log('upload complete');
        }).error(function(){
          console.log('error sending image to php');
        });
      }

      reader.readAsDataURL(blob);
    }
  };

  $(window).load(function(){
    facetogif.canvas = document.createElement('canvas');
    facetogif.video = document.querySelector('video');
    $('#record-button').attr('disabled', true);

    getStream(function (stream) {
      facetogif.video.src = window.URL.createObjectURL(stream);
      facetogif.stream = stream;
      $('#record-button').attr('disabled', false);
    }, function (fail) {
      console.log(fail);
    });

    $('#record-button').click(function(){
      var $recordButton = $(this);
      $recordButton.attr('disabled', true);

      recorder.gif = new GIF({
        workers: 2,
        width: facetogif.settings.w,
        height: facetogif.settings.h,
        quality: 20,
        workerScript: 'js/vendor/gif.worker.js'
      });

      recorder.frames = [];
      recorder.ctx = facetogif.canvas.getContext('2d');

      //wait 3 seconds then record
      var count = facetogif.settings.countdown/1000;
      function countdown(){
        $('#message').html('recording in '+count);
        if(count > 1){ setTimeout(function(){ count--; countdown(); }, 1000); }
      }
      countdown();

      setTimeout(function(){
        $('#message').text('recording');
        $('#indicator').addClass('on');
        $('#progress').animate({width: '100%'}, facetogif.settings.seconds);
        recorder.start();
        
        //wait 3 seconds then compile
        console.log('compiling in 3...2...1');
        setTimeout(function(){
          $('#message').text('compiling');
          $('#indicator').removeClass('on');
          recorder.pause();
          recorder.compile(function (blob) {
            var img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            img.dataset.blobindex = facetogif.blobs.push(blob) -1;
            img.dataset.framesindex = facetogif.frames.push(recorder.frames) -1;
            
            if($('#gifs-go-here').children('img').length === 4){
              $('#gifs-go-here').children('img').last().remove();
            }
            $(img).prependTo('#gifs-go-here');
            $recordButton.attr('disabled', false);
            $('#progress').animate({width: '0%'}, 1000);
            $('#message').text('tap on video to record');
            recorder.upload(blob);
          });

        }, facetogif.settings.seconds);
      }, facetogif.settings.countdown);
    });

  });


} ());
