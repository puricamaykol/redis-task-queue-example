## What's this about? ##

Code sample featuring a task queue worker made using redis. It uses two lists. The work_queue list is where all tasks are pushed to from any producer. From here using the brpoplpush command they are pushed into a processing queue. If processing is succesful the task will be deleted from the processing queue.
This is done in the case the worker shuts down, once restarted it will resume processing from the tasks in the processing list.

## To do ##

 - Manage max processing attempts number
 - Manage the case when the task gets to the handler but this fails

