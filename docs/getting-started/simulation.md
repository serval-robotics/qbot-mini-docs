# Quick start: simulation

The fastest way to see whether Q-Bot Mini does what you need. **No hardware, no
GPU** — the simulation runs the same control stack as the robot, so what walks
here walks there.

<figure class="render">
  <img src="../../assets/images/sim-warehouse-still.webp" alt="Q-Bot Mini walking beside pallet racking in a warehouse scene" width="1920" height="1080">
  <figcaption>A run recorded in this simulation, re-rendered in NVIDIA Isaac Sim. The viewer window you get here is plainer — the motion is the same.</figcaption>
</figure>

## What you need

| Requirement | Value |
| :- | :- |
| Operating system | Ubuntu 24.04 |
| ROS 2 | Jazzy |
| Graphics | None required. A viewer window needs a display; headless runs do not |

## Getting the software

!!! note "Being written"

    How the software reaches you depends on your arrangement with us and is
    being documented separately. Ask us — this is not a blocker, it is a
    paperwork question.

## Run it

```bash
ros2 launch qbot_bringup sim.launch.py use_viewer:=true
```

A viewer window opens and the robot stands. That is the whole check that your
environment works.

To make it walk:

```bash
ros2 launch qbot_bringup sim.launch.py use_viewer:=true gait:=trot vx:=0.2
```

The robot trots forward at 0.2 m/s until you stop it with ++ctrl+c++.

## Launch arguments

| Argument | Default | Meaning |
| :- | :-: | :- |
| `use_viewer` | `false` | Open the viewer window |
| `commander` | `param` | Where commands come from: `param`, `web` or `script` |
| `gait` | `stand` | `stand`, `walk` or `trot` |
| `vx`, `vy` | `0.0` | Body-frame velocity, m/s |
| `yaw_rate` | `0.0` | Turn rate, rad/s, positive turns left |
| `body_height` | `0.0` | Offset from stance height, m |
| `body_roll`, `body_pitch`, `body_yaw` | `0.0` | Static posture, rad |
| `scenario` | `""` | Scenario file to play, with `commander:=script` |
| `loop` | `false` | Restart the scenario when it ends |

The `gait`, velocity and posture arguments apply to `commander:=param` only —
they are how you drive the robot without writing any code or opening a browser.

!!! warning "`commander` is matched exactly and is not validated"

    A typo starts **no** command source at all, and the robot simply never
    moves. If nothing happens, check this argument first.

## Drive it from the browser

```bash
ros2 launch qbot_bringup sim.launch.py use_viewer:=true commander:=web
```

Then open the URL logged at startup, normally `http://127.0.0.1:8642`. See
[The web console](web-console.md).

## Write your own controller

The simulation publishes and subscribes exactly what the robot does. Point your
application at `/body_cmd` and it will drive both:

```bash
ros2 launch qbot_bringup sim.launch.py use_viewer:=true commander:=param
# then, from another terminal, publish your own /body_cmd
```

See [Control architecture](../programming/control-architecture.md) for where your
code sits, and [ROS 2 interface](../programming/ros2-interface.md) for the
message it sends.

## What to try next

| If you want to | Go to |
| :- | :- |
| Drive it by hand | [The web console](web-console.md) |
| Script a repeatable route | [Scenarios and recording](../programming/scenarios-and-recording.md) |
| Understand the sign conventions before writing code | [Coordinate conventions](../reference/conventions.md) |
| Nothing happened | [Troubleshooting](../maintenance/troubleshooting.md) |
