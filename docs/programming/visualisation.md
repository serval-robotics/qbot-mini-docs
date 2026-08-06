# Visualisation

An optional photorealistic view of the running simulation, rendered by NVIDIA
Isaac Sim. Use it for demonstrations, recorded video, and generating camera
imagery for vision work.

!!! info "Isaac Sim renders. It does not simulate."

    Physics, control and contact stay in MuJoCo throughout. Isaac receives the
    body poses MuJoCo has already solved and draws them. There is no second
    physics model, no second set of parameters to keep calibrated, and nothing
    about the robot's behaviour changes when you turn the renderer on.

    This matters when reading results: what you see in Isaac is the MuJoCo
    simulation, photographed.

## What it is for

| Use | Why the renderer rather than the MuJoCo viewer |
| :- | :- |
| Demonstrations and video | Materials, lighting and depth of field the physics viewer does not attempt |
| Camera imagery for vision work | Renders through a virtual camera, in scenes with real backgrounds |
| Presentations | A recorded run looks like the robot, not like a debug view |

For everything else — checking a gait, tuning, watching contacts — the MuJoCo
viewer is faster and needs no extra hardware.

## Requirements

| Requirement | Value |
| :- | :- |
| Isaac Sim | 5.x, developed against 5.1.0 |
| Host | Windows, alongside the Linux machine running the simulation |
| GPU | NVIDIA RTX |

The simulation itself needs none of this. The renderer is an addition, and the
robot runs identically without it.

## Running it

Two processes. Start the simulation with the pose stream enabled:

```bash
ros2 launch qbot_bringup sim.launch.py commander:=web isaac_tap:=true
```

Then start the renderer on the Windows host, pointing Isaac Sim's Python at
`isaac_render_twin.py`.

!!! warning "Do not press Play in Isaac"

    The renderer has no physics timeline. Poses arrive from the simulation, and
    pressing Play starts an Isaac simulation that has nothing behind it.

A window opens with the robot on a neutral floor, framed by a camera that
follows it. Until the first pose arrives the robot stands in its reference pose
with dead-straight legs — that is the renderer waiting, not a fault.

The renderer is **stateless**: it can be started, stopped and restarted while
the simulation keeps running, and it resynchronises on the next frame.

!!! note "Being written"

    Recording video, choosing scenes and camera framing, and headless capture
    are documented separately and are being prepared for publication.

## First launch is slow

Isaac compiles shaders on first run, and it is nearly silent about it. Several
minutes with no visible progress is normal on a first launch; later launches
start in seconds. Do not assume it has hung until it has been quiet for around
ten minutes.
