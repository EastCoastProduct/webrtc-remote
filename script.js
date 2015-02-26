(function(){
  var peer = new Peer({
    key: 'x7fwx2kavpy6tj4i',
    debug: 0
  });

  var connectedPeers = {};

  peer.on('open', function(id){ $('#pid').text(id); });
  peer.on('connection', askApproval);
  peer.on('error', function(err) { console.log(err); });


  function showApproveModal(peerCode) {
    $('body').append(Mustache.render($('#approve-modal-template').html(), {peerCode: peerCode}));
  }

  function showChatbox(peerCode) {
    $('#actions').append(Mustache.render($('#chatbox-template').html(), {peerCode: peerCode}));
  }

  function askApproval(c) {
    showApproveModal(c.peer);

    $('button.approve').click(function() {
      $('.overlay').remove();
      connect(c);
    });

    $('button.deny').click(function() {
      $('.overlay').remove();
      c.close();
    });
  }

  function connect(c) {
    if (c.label === 'chat') {
      showChatbox(c.peer);

      c.on('data', function(data) {
        console.log('asdasdasdasd');
        triggerButton(getButtonCode(data));
      });

      c.on('close', function() {
        $('.chatbox').remove();

        if ($('.connection').length === 0) {
          delete connectedPeers[c.peer];
        }
      });
    }
    connectedPeers[c.peer] = 1;
  }

  function getButtonCode(command) {
    if(command === 'next') {
      return 39;
    } else if(command === 'prev') {
      return 37;
    }
    return false;
  }

  function triggerButtonEvent(eventName, buttonCode) {
    var e = new KeyboardEvent(eventName, {bubbles:true});

    Object.defineProperty(e, 'keyCode', {get:function(){return buttonCode;}});
    Object.defineProperty(e, 'which', {get:function(){return buttonCode;}});

    var qwe = document.getElementById('iframe').contentWindow.document.body.dispatchEvent(e);
  }

  function triggerButton(buttonCode) {
    if(!buttonCode) return false;

    triggerButtonEvent('keydown', buttonCode);
    triggerButtonEvent('keyup', buttonCode);
  }

  $(document).ready(function() {
    function doNothing(e){
      e.preventDefault();
      e.stopPropagation();
    }

    $('#iframe-selector > select').change(function(){
      document.getElementById('iframe').src = $(this).val();
    });

    $('.toggle-remote').click(function() {
      $('#control').toggle();
    });

    $('.toggle-iframe').click(function() {
      $('iframe').toggle();
    });

    $('#iframe').ready(function() {

      $('.slide-button').click(function() {
        var action = $(this).data('action');

        triggerButton(getButtonCode(action));

        eachActiveConnection(function(c, $c) {
          if (c.label === 'chat') {
            c.send(action);
          }
        });
      });


    });

    $('iframe').load(function() {
      var e = $.Event("keydown", {keyCode: 64});
    });

    $('#connect').click(function() {
      var requestedPeer = $('#rid').val();
      if (!connectedPeers[requestedPeer]) {

        var c = peer.connect(requestedPeer, {
          label: 'chat',
          serialization: 'none',
          metadata: {message: 'hi i want to chat with you!'}
        });
        c.on('open', function() {
          connect(c);
        });
        c.on('error', function(err) { alert(err); });
      }
      connectedPeers[requestedPeer] = 1;
    });

    $('#close').click(function() {
      eachActiveConnection(function(c) {
        c.close();
      });
    });

    function eachActiveConnection(fn) {
      var actives = $('.active');
      var checkedIds = {};
      actives.each(function() {
        var peerId = $(this).attr('id');

        if (!checkedIds[peerId]) {
          var conns = peer.connections[peerId];
          for (var i = 0, ii = conns.length; i < ii; i += 1) {
            var conn = conns[i];
            fn(conn);
          }
        }

        checkedIds[peerId] = 1;
      });
    }
  });

  window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
      peer.destroy();
    }
  };
})();
