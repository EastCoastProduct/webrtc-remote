(function() {
  var peer = new Peer({ key: 'x7fwx2kavpy6tj4i', debug: 0 });

  var boundPeer;
  var boundPeerConnection;
  var connectedPeers = {};

  peer.on('open', function(id) { $('#peer-id').text(id); });
  peer.on('connection', connect);
  peer.on('error', function(err) { console.log(err); });

  function triggerButton(buttonCode) {
    if(!buttonCode) return false;

    triggerButtonEvent('keydown', buttonCode);
    triggerButtonEvent('keyup', buttonCode);
  }

  function triggerButtonEvent(eventName, buttonCode) {
    var e = new KeyboardEvent(eventName, {bubbles:true});

    Object.defineProperty(e, 'keyCode', { get:function() { return buttonCode; } });
    Object.defineProperty(e, 'which',   { get:function() { return buttonCode; } });

    document.getElementById('iframe').contentWindow.document.body.dispatchEvent(e);
  }

  function showConnectionStatus(status) {
    $('div.connected').toggle();
    $('div.not-connected').toggle();

    if(!!boundPeer) {
      $('.connected > span').append(boundPeer);
    } else {
      $('.connected > span').html('');
    }
  }

  function connect(connection) {
    boundPeer = connection.peer;
    boundPeerConnection = connection;
    showConnectionStatus();

    connection.on('data', function(data){
      triggerButton(data);
    });

    connection.on('close', function(){
      boundPeer = undefined;
      showConnectionStatus();
    });
  }

  $(document).ready(function() {
    $('#iframe').ready(function() {
      $('.slide-button').click(function() {
        var action = $(this).data('action');

        if(action === 'prev') { var code = 37; }
        if(action === 'next') { var code = 39; }

        triggerButton(code);
        boundPeerConnection.send(code);
      });
    });

    $('.toggle-connection-controls').click(function() {
      $('#overlay').toggle();
      $('#connection-controls').toggle();
    });

    $('#connect').click(function() {
      if(!boundPeer) {
        var connection = peer.connect($('#connect-to-id').val());

        connection.on('open', connect(connection));
        connection.on('error', function(err) { alert(err); });
      }
    });

    $('#disconnect').click(function() {
      boundPeerConnection.close();
    });
  });

  window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
      peer.destroy();
    }
  };
})();
