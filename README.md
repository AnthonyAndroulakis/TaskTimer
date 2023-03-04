# TaskTimer
TaskTimer is a game to help you keep track of tasks and reward productivity.

![example](/example.png)

### 2 types of tasks:
- Fixed Time (FT)
	- will take a fixed amount of time no matter what
	- these are for tasks where only completing the task within the reasonable time frame is incentivized
- Variable Time (VT)
	- might take a max time of x minutes but can be done quicker

### tips for the game:
- only do 1 task at a time (don't stack tasks)
- tasks are items that you do. For example, waiting for laundry to finish does not count as a task. Starting the laundry, does, however.
- FT tasks should not be rushed, but they should not take an absurd amount of time, either
- set the VT time to a realistic estimate, do not overestimate the time in order to get more points (otherwise, you devalue your points)

### equations:
when not doing a task:
- points lost at a rate of 2 points per minute

FT tasks:
- meditation: points = 10 x minutes
- other: points = minutes

VT tasks: 
- points = 4 x (1 - (elapsed / (estimate))) x estimate + 1/60