(function() {
  var peer = new Peer({ key: 'x7fwx2kavpy6tj4i' });

  var boundPeer;
  var peerConnections = {};

  peer.on('open', function(id) { $('#peer-id').text(id); });
  peer.on('connection', connectionOffer);
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

  function addCandidate(peerId) {
    $('.connected').hide();
    $('.candidates').append('<li data-peer-id="' + peerId + '">' + peerId + '</li>');
  }

  function connectionOffer(connection) {
    if(boundPeer) {
      connection.on('open', function(){
        connection.close();
      });
    } else {
      peerConnections[connection.peer] = connection;
      addCandidate(connection.peer);
    }
  }

  function connect(peerId) {
    boundPeer = peerId;
    showConnectionStatus();

    peerConnections[boundPeer].on('data', function(data) {
      triggerButton(data);
    });

    peerConnections[boundPeer].on('close', function() {
      boundPeer = undefined;
      showConnectionStatus();
    });
  }

  $(document).ready(function() {
    $('#iframe').ready(function() {
      $('.slide-button').click(function() {
        if(boundPeer) {
          var action = $(this).data('action');

          if(action === 'prev') { var code = 37; }
          if(action === 'next') { var code = 39; }

          triggerButton(code);
          peerConnections[boundPeer].send(code);
        }
      });
    });

    $('.candidates').on('click', 'li', function() {
      connect($(this).data('peerId'));
    });

    $('.toggle-connection-controls').click(function() {
      $('#overlay').toggle();
      $('#connection-controls').toggle();
    });

    $('#connect').click(function() {
      if(!boundPeer) {
        var connection = peer.connect($('#connect-to-id').val());
        peerConnections[connection.peer] = connection;

        connection.on('open', connect(connection.peer));
        connection.on('error', function(err) {  console.log(err); });
      }
    });

    $('#disconnect').click(function() {
      if(boundPeer) {
        peerConnections[boundPeer].close();
        peerConnections[boundPeer] = undefined;
      }
    });
  });

  window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
      peer.destroy();
    }
  };
})();
