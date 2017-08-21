var redis = require('redis');
var port = 6379;
var host = "127.0.0.1";
var redisClient = redis.createClient(port, host, {
  detect_buffers: true
});

var values = [];
var object = {};
var blpopQueue = function() {
  redisClient.blpop('dataQueue', 0, function(err, data) {
    if (data) {
    	try{
    		object = {};
		      values = data[1].split(',');
		      object = {
		        "policyID": values[0],
		        "statecode": values[1],
		        "county": values[2],
		        "point_latitude": values[3],
		        "point_longitude": values[4]
		      };
		      console.log(object);
		      console.log("'\n'---------------------------------------------'\n'");
		      blpopQueue();
		  }catch(err){
		  		console.log(err.message);
		  		redisClient.rpush('dataQueue', line);
		  		blpopQueue();
		  }
      
    }else if(err){
    	console.log(err);
    	blpopQueue();
    }
  });
};

blpopQueue();