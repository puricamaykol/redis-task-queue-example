## What's this about? ##

Code sample featuring a task queue worker made using redis. It uses two lists. The work_queue list is where all tasks are pushed to from any producer. From here using the brpoplpush command they are pushed into a processing queue. If processing is succesful the task will be deleted from the processing queue.
This is done in the case the worker shuts down, once restarted it will resume processing from the tasks in the processing list.


```javascript
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
  }

```

## To do ##

 - Manage max processing attempts number
 - Manage the case when the task gets to the handler but this fails

