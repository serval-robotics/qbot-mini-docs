# Parameters

Runtime parameters, settable with the standard ROS 2 parameter interface. Every
default below is the one the robot ships with.

## Setting a parameter

```bash
# Read
ros2 param get /locomotion_node stance_height

# Set, at runtime
ros2 param set /locomotion_node stance_height 0.15
```

A parameter set this way lasts until the node restarts. To make a change
permanent, pass it at launch or edit the configuration file the launch reads.

Gait parameters take effect on the next cycle; the robot does not stop to apply
them.

## Safety-relevant

Changing any of these changes what the robot does when something goes wrong.
Read [Safety](../safety.md) before you do.

| Node | Parameter | Default | Effect |
| :- | :- | :-: | :- |
| `locomotion_node` | `command_timeout` | 0.5 s | Motion deadman. No `/body_cmd` for this long and the robot homes to a standing hold. `0` disables it |
| `web_ui_node` | `command_timeout` | 1.0 s | Operator deadman. No browser heartbeat for this long and the robot disarms and settles |
| `locomotion_node` | `feedback_timeout` | 0.5 s | `/leg_state` older than this counts as stale, and the leg stops being driven on measurements that are no longer arriving |
| `locomotion_node` | `soft_start_time` | 1.5 s | How long the robot takes to ramp into holding its own weight at startup. `0` removes the ramp and the legs take the load at once |
| `locomotion_node` | `tau_limit` | 1.39 N·m | Per-joint torque ceiling. It is the actuator's rating, not a tuning knob |
| `locomotion_node` | `f_limit` | 60 N | Per-foot force ceiling, about twice the load one foot ever carries |

The two `command_timeout` parameters share a name and live in different nodes.
Setting either to `0` removes a safety behaviour.

## Gait shape

One set per gait, because a static crawl and a dynamic trot want different
numbers. These set the gait's cadence and footfall, not its speed — speed comes
from the velocity you command, and the stride follows it:

<div class="formula" markdown>
stride = `vx` × `duty` × `period`
</div>

| Parameter | Trot | Walk | Meaning |
| :- | :-: | :-: | :- |
| `period` | 0.714 s | 1.667 s | One gait cycle. Smaller is a faster cadence, not a faster robot |
| `duty` | 0.65 | 0.85 | Fraction of the cycle a foot spends on the ground. Higher is more feet down at once, and more stable |
| `step_height` | 0.05 m | 0.06 m | How far a foot lifts during its swing |

Walk's floors are validated rather than silently applied: configure it below a
1.0 s period or a 0.85 duty and it is clamped, with a warning naming what was
asked for and what was run. A step height below 0.06 m warns and runs what you
asked for.

`trot.step_height` is worth knowing the shape of. The lift arrives in proportion
to what is asked for at every setting measured: 0.02, 0.03, 0.04 and 0.05 m of
command gave 5.8, 8.4, 10.9 and 13.6 mm of clearance over the floor, so the
shipped 0.05 m is also the most clearance any of them bought. What a taller lift
costs is paid inside the swing window — turn rate, foot scuff and swing-phase
torque all suffer when the leg is asked to lift further in the same time — and
the shipped 0.714 s cycle at a 0.65 duty gives that swing 0.250 s, which is what
makes this lift affordable. Shortening the period without lowering the lift
spends that margin.

### Posture

| Parameter | Default | Meaning |
| :- | :-: | :- |
| `stance_height` | 0.16 m | Neutral foot drop below the hip — how tall the robot stands before any command. About 81% of the leg's 0.198 m reach, which leaves travel in both directions |
| `k_sway` | 0.1 | How far the body leans into its support polygon during a static walk |

Body height, roll, pitch and yaw are commanded per message rather than set as
parameters; see the [ROS 2 interface](ros2-interface.md).

## Timing

| Node | Parameter | Default | Meaning |
| :- | :- | :-: | :- |
| `locomotion_node` | `publish_rate_hz` | 200 Hz | The control loop |
| `commander_node` | `publish_rate_hz` | 50 Hz | How often the built-in commander publishes `/body_cmd` |
| `locomotion_node` | `imu_timeout` | 0.2 s | IMU older than this leaves the state estimate invalid |

## What you cannot set

The body controller — what turns a commanded velocity into the forces each foot
applies — is proprietary and ships pre-tuned. Its gains are not exposed as
parameters, and the numbers above are the ones intended to be changed.

If you need behaviour the parameters above cannot reach, ask us rather than
working around them: the limits exist because the robot is a light machine whose
joints top out at 1.39 N·m, and most of them are the reason it survives a
mistake.
