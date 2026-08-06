# Parameters

Runtime parameters, settable with the standard ROS 2 parameter interface. The
ones documented here are the ones with safety or behavioural consequences.

!!! note "Being written"

    The complete parameter reference is being prepared. The entries below are
    verified; the list is not yet exhaustive.

## Safety-relevant

| Node | Parameter | Default | Effect |
| :- | :- | :-: | :- |
| `locomotion_node` | `command_timeout` | 0.5 s | Motion deadman. No `/body_cmd` for this long and the robot stands. `0` disables it |
| `web_ui_node` | `command_timeout` | 1.0 s | Operator deadman. No browser heartbeat for this long and the robot disarms and settles |

The two share a name and live in different nodes. Setting either to `0` removes
a safety behaviour; see [Safety](../safety.md).

## Setting a parameter

```bash
# Read
ros2 param get /locomotion_node command_timeout

# Set, at runtime
ros2 param set /locomotion_node command_timeout 0.8
```

Parameters set this way last until the node restarts. To make a change
permanent, pass it at launch.

## Gait and posture tuning

!!! note "Being written"

    Gait period, duty factor, stance height and the impedance gains are
    adjustable at runtime. Their names, ranges and safe values are being
    documented; ask us before changing them on hardware.
