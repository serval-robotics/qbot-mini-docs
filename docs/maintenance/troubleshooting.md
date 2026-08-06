# Troubleshooting

Symptoms first, because that is what you have.

If the robot is powered and behaving unexpectedly, read [Safety](../safety.md)
before debugging: stop it, then diagnose.

## The robot does not move at all

In order of how often it is the cause:

**Check the command source.** `commander` is matched by exact string equality
and is not validated, so `commander:=wev` starts no command source at all and
the robot never moves. No error is printed.

**Check something is publishing.**

```bash
ros2 topic echo /body_cmd --once
```

Nothing appearing means nothing is commanding the robot. The deadman is doing
its job — see [Parameters](../programming/parameters.md).

**Check the robot is armed.** From the console, the controls stay locked behind
an overlay until you arm. A latched STOP needs **Clear stop** before ARM will
work.

**Check the gait is not `stand`.** Standing is a gait; the robot is working
correctly and going nowhere.

## The robot stands but will not walk

**Check commands are arriving fast enough.** The motion deadman is 0.5 s. An
application publishing slower than 2 Hz makes the robot stand up between
commands, which looks like a robot that twitches and settles.

```bash
ros2 topic hz /body_cmd    # should comfortably exceed 2 Hz
ros2 topic hz /leg_cmd     # is the gait generator producing output?
```

**Check the speed cap.** From the console, each gait applies its own cap when
selected, and the caps are deliberately low — `walk` is capped at 0.05 m/s.

## `walk` ignores the period I set

Walk is clamped to a static-stability floor: a period of at least 2.0 s. A
shorter period is refused and the clamp is logged as a warning by
`locomotion_node`.

This is deliberate. A crawl gait faster than that floor is no longer statically
stable, and the robot falls over.

## Motion is jerky, mirrored or asymmetric

Almost always a convention error rather than a fault. Check, in this order:

1. **Signs.** `+x` forward, `+y` left, `+z` up. Positive `yaw_rate` turns left.
2. **No per-leg mirroring.** Do not negate `y` for the right-hand legs.
3. **Leg order.** Every four-element array is `FL`, `FR`, `RL`, `RR`.
4. **Units.** Metres and radians, never millimetres or degrees.

See [Coordinate conventions](../reference/conventions.md).

## The web console will not load

**The port moved.** If 8642 is taken, the node walks upward until it finds a free
port, and logs the real URL. Read the log line rather than assuming the port.

**You are not on localhost.** The console refuses every request from a
non-loopback address unless the URL carries the token printed at startup. See
[The web console](../getting-started/web-console.md#reaching-the-console-from-another-machine).

## Nothing appears in the simulation viewer

**No display.** A viewer window needs one. Headless machines can run the
simulation, just without `use_viewer:=true`.

**The simulation is running but time is not advancing.** If `locomotion_node`
logs that it is not receiving `/clock`, the nodes have not found each other:

```bash
ros2 daemon stop && ros2 daemon start
```

Then relaunch. This also fixes a machine that has been suspended and resumed.

## `ros2` commands find no nodes

**Discovery has not converged.** Restart the daemon as above.

**`ROS_DOMAIN_ID` is set to an empty string**, which makes `ros2 daemon start`
fail with an `int('')` error:

```bash
export ROS_DOMAIN_ID=0
```

## Triage commands

The five that answer most questions:

```bash
ros2 topic echo /body_cmd --once    # what is being commanded
ros2 topic hz /leg_cmd              # is the gait publishing, and how fast
ros2 topic echo /leg_state --once   # what the robot reports back
ros2 node list                      # is everything up
ros2 daemon stop && ros2 daemon start
```

## Still stuck

Send us the output of `ros2 node list`, `ros2 topic hz /leg_cmd`, and the log
from startup. Those three answer most of what we would ask.
