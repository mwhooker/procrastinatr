(function() {
  var main = function() {
    var socket = new io.Socket();

    socket.on('connect', function(){ 
        console.log('connected');
    }) 
    socket.on('message', function(data){ 
        console.log(data)
    })
    socket.on('disconnect', function(){}) 
    socket.connect();
  }
  main();
})();
