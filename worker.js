'use strict'
let EventEmitter = require('events').EventEmitter;

let workerEmitter = new EventEmitter();

let handlerEmitter = new EventEmitter();

let redis = require('redis');
let port = 6379;
let host = "127.0.0.1";
let redisClient = redis.createClient(port, host, {
  detect_buffers: true
});
let work_queue = "work_queue";
let process_queue = "process_queue";
let dead_tasks = "dead_tasks";
let max_attempts = 5;

const worker = {

  workerStart: function() {
  	console.log("starting");
    workerEmitter.emit('worker_start');
  },

  getNextTask: function() {
  	console.log("get next")
    redisClient.lrange(process_queue, 0, 0, (err, tasks) => {
      if (tasks) {
        if (typeof tasks === 'object') {
          if (tasks.length > 0) {
            console.log("Restarting processing...:"+ tasks[0]);
            workerEmitter.emit('task_found', tasks[0]);
          } else {
            redisClient.brpoplpush(work_queue, process_queue, 0, (err, task) => {
              if (task) {
              	console.log(task);
                workerEmitter.emit('task_found', task);
              } else if (err) {
                console.log("There was an error processing " + work_queue + " item: "+err);
              } else {
              	console.log("No tasks found");
              }
            });
          }
        }
      } else if (err) {
        console.log("There was an error processing " + process_queue + " item");
      }
    });
  },

  processTask: function(task) {
    if (task) {
      handlerEmitter.emit(task.split(":")[0], task, (err, success) => {
        if (success) {
        	console.log(task, "processTask");
          workerEmitter.emit('task_processed', task);
        } else if (err) {
          console.log("There has been an error processing task: " + err);
        }
      });
    }
  },

  removeTaskFromProcessingQueue: function(task) {
    if (task) {
      redisClient.lrem(process_queue, -1, task, (err, res) => {
      	if(err){
      		console.log("There were errors deleting task from processing "+process_queue, err);
      		workerEmitter.emit("worker_start");
      	}else if (res){
      		console.log(res);
      		workerEmitter.emit("task_finished");
      	}
      });
    }
  },

  pushTaskToDeadTasksList: function(task) {
    //not yet implemented
  }


};

workerEmitter.on('worker_start', worker.getNextTask);
workerEmitter.on('task_found', worker.processTask);
workerEmitter.on('task_processed', worker.removeTaskFromProcessingQueue);
workerEmitter.on('task_finished', worker.getNextTask);
//workerEmitter.on('task_processing_error', worker.getNextTask);
//workerEmitter.on('max_attempts_reached', worker.pushTaskToDeadTasksList);

handlerEmitter.on("number_one", (payload, done) => {
	console.log("This is the processed task"+payload);

	done(null, true);
})
handlerEmitter.on("number_two", (payload, done) => {
	console.log("This is the processed task"+payload);

	done(null, true);
})

handlerEmitter.on("number_three", (payload, done) => {
	console.log("This is the processed task"+payload);

	done(null, true);
})

worker.workerStart();
//module.exports = worker;
