# ROS 2 interface

The complete published interface. Frames, signs and units are defined in
[Coordinate conventions](../reference/conventions.md) and assumed throughout.

There are no namespaces and no remappings in the shipped launch files, so every
name below is what appears on the wire.

## Topics

| Topic | Type | Direction |
| :- | :- | :- |
| `/body_cmd` | `qbot_interfaces/BodyCommand` | You publish |
| `/leg_cmd` | `qbot_interfaces/RobotCommand` | Robot publishes |
| `/leg_state` | `qbot_interfaces/RobotState` | Robot publishes |
| `/imu` | `sensor_msgs/Imu` | Robot publishes |

!!! note "Naming trap"

    `LegCommand` and `LegState` are **per-leg** messages. The topics `/leg_cmd`
    and `/leg_state` carry the four-leg aggregates `RobotCommand` and
    `RobotState`, whose `legs` array follows the
    [leg order](../reference/conventions.md#leg-order).

## `BodyCommand`

The one message you send.

| Field | Type | Meaning |
| :- | :- | :- |
| `header` | `std_msgs/Header` | Standard stamp and frame |
| `gait` | `uint8` | One of the gait constants below |
| `linear_velocity` | `float64[3]` | Body-frame `[vx, vy, vz]` in m/s. `vz` is unused |
| `yaw_rate` | `float64` | Turn rate in rad/s, positive turns left |
| `body_orientation` | `float64[3]` | Posture `[roll, pitch, yaw]` in rad |
| `body_height` | `float64` | Raise (+) or squat (−) from stance height, in m |

`linear_velocity` and `yaw_rate` drive the feet. `body_orientation` and
`body_height` tilt and raise the body **over** its ground contacts without moving
where the stance feet meet the ground — so you can level the trunk on a slope, or
lower the machine to fit under something, without changing the gait.

### Gaits

| Constant | Value | Behaviour |
| :- | :-: | :- |
| `GAIT_STAND` | 0 | Holds a stance; posture and height still apply |
| `GAIT_WALK` | 1 | Statically stable crawl, one foot in swing at a time |
| `GAIT_TROT` | 2 | Diagonal pairs, the working gait |
| `GAIT_HOLD` | 3 | Freeze — see below |

!!! danger "`GAIT_HOLD` is a freeze, not a gait"

    `GAIT_HOLD` republishes the last leg command verbatim — positions,
    feed-forward forces, contact flags — and stops advancing the gait phase. The
    robot stays in whatever pose it is in.

    Entering hold does not run a soft-start ramp. Leaving it does.

## The deadman

`/body_cmd` has a deadman. If no command arrives for `command_timeout`
seconds — **0.5 s by default** — the robot returns to a stand on its own.

Design around it rather than disabling it: an application that crashes mid-trot
leaves the robot unattended, and standing is the right answer to being
unattended. Publish at a steady rate for as long as you want motion, even when
the command has not changed.

Setting `command_timeout` to `0` disables the deadman. Do that only with the
robot on a stand. See [Parameters](parameters.md).

## `RobotState` and `RobotCommand`

What the robot tells you.

**`LegState`**, one per leg, in [joint order](../reference/conventions.md#joint-order):

| Field | Type | Meaning |
| :- | :- | :- |
| `joint_angle` | `float64[3]` | Measured joint angles, rad |
| `joint_velocity` | `float64[3]` | Measured joint velocities, rad/s |
| `joint_torque` | `float64[3]` | Estimated joint torques, N·m |
| `is_contact` | `bool` | Estimated ground contact |

**`LegCommand`**, one per leg, in [leg frame](../reference/conventions.md):

| Field | Type | Meaning |
| :- | :- | :- |
| `foot_position` | `float64[3]` | Commanded foot tip `[x, y, z]`, m |
| `feedforward_force` | `float64[3]` | Feed-forward contact force, N |
| `is_contact` | `bool` | Commanded contact or swing |

`RobotCommand` additionally carries `gait_time`: the gait-clock time these
commands were evaluated at. It reads zero while a soft-start ramp is running and
starts counting when the ramp completes, so a consumer needing the controller's
true gait phase reads it here rather than inferring an epoch from message stamps.

## A worked example

Trot forward at 0.2 m/s:

```python
import rclpy
from rclpy.node import Node

from qbot_interfaces.msg import BodyCommand


class TrotForward(Node):
    """Publishes a steady forward trot, fast enough to hold off the deadman."""

    def __init__(self):
        super().__init__("trot_forward")
        self.commands = self.create_publisher(BodyCommand, "/body_cmd", 10)
        self.create_timer(0.05, self.send)

    def send(self):
        command = BodyCommand()
        command.header.stamp = self.get_clock().now().to_msg()
        command.gait = BodyCommand.GAIT_TROT
        command.linear_velocity = [0.2, 0.0, 0.0]
        command.yaw_rate = 0.0
        self.commands.publish(command)


def main():
    rclpy.init()
    rclpy.spin(TrotForward())


if __name__ == "__main__":
    main()
```

The 20 Hz timer is not a requirement of the controller — it is well inside the
0.5 s deadman, which is what matters. Publishing slower than 2 Hz makes the robot
stand up underneath you.
