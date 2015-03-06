(function() {
  var peer = new Peer({ key: 'x7fwx2kavpy6tj4i' });

  var boundPeer;
  var peerConnections = {};

  peer.on('open', function(id) { $('#peer-id').text(id); });
  peer.on('connection', connectionOffer);
  peer.on('error', function(err) { console.log(err); });

  function triggerButton(buttonCode) {
    triggerButtonEvent('keydown', buttonCode);
    triggerButtonEvent('keyup', buttonCode);
  }

  function triggerButtonEvent(eventName, buttonCode) {
    var e = new KeyboardEvent(eventName, { bubbles: true });

    Object.defineProperty(e, 'keyCode', { get: function() { return buttonCode; } });
    Object.defineProperty(e, 'which',   { get: function() { return buttonCode; } });

    document.getElementById('iframe').contentWindow.document.body.dispatchEvent(e);
  }

  function showConnectionStatus(status) {
    $('div.connected').toggle();
    $('div.not-connected').toggle();

    if(boundPeer) {
      $('.connected > span').append(boundPeer);
    } else {
      $('.connected > span').html('');
    }
  }

  function clearCandidates() {
    $.each(peerConnections, function(key, value) {
      if(key === boundPeer) return;

      peerConnections[key].close();
      delete peerConnections[key];
    });

    $('.candidates').html('');
  }

  function displayCandidate(peerId) {
    $('.candidates').append('<li data-peer-id="' + peerId + '">' + peerId + '</li>');
  }

  function removeCandidate(connection) {
    connection.close();
    delete peerConnections[connection.peer];

    $('.candidates').find('[data-peer-id=' + connection.peer + ']').remove();
  }

  function addCandidate(connection) {
    peerConnections[connection.peer] = connection;
    displayCandidate(connection.peer);

    connection.on('close', function() {
      removeCandidate(connection);
    });
  }

  function connectionOffer(connection) {
    if(!boundPeer) {
      addCandidate(connection);
    } else {
      connection.on('open', function() {
        connection.close();
      });
    }
  }

  function connect(peerId) {
    boundPeer = peerId;
    clearCandidates();
    showConnectionStatus();

    peerConnections[boundPeer].on('data', function(data) {
      triggerButton(data);
    });

    peerConnections[boundPeer].on('close', function() {
      delete peerConnections[boundPeer];
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

    $('.toggle-connection-controls').click(function() {
      $('#overlay').toggle();
      $('#connection-controls').toggle();
    });

    $('.candidates').on('click', 'li', function() {
      connect($(this).data('peerId'));
    });

    $('#connect').click(function() {
      var peerId = $('#connect-to-id').val();
      if(!boundPeer && peerId) {
        var connection = peer.connect(peerId);
        peerConnections[connection.peer] = connection;

        connection.on('open', connect(connection.peer));
        connection.on('error', function(err) { console.log(err); });
      }
    });

    $('#disconnect').click(function() {
      if(boundPeer) {
        peerConnections[boundPeer].close();
      }
    });
  });

  window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
      peer.destroy();
    }
  };
})();
