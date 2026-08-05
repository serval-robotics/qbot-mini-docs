# Commanding motion

Everything that drives the robot goes through a single ROS 2 topic. An
application says *where the body should go*; the robot works out what the twelve
joints do about it.

```
your application ──▶ /body_cmd ──▶ locomotion ──▶ /leg_cmd ──▶ legs
                    (BodyCommand)                (RobotCommand)
```

This is the seam. Above it you write intent, below it is ours — and it is the
same seam in simulation and on hardware, so an application developed against the
simulator drives the real robot unchanged.

Read [Conventions](conventions.md) first: the frame, signs and units below are
defined there.

## `/body_cmd`

Type `qbot_interfaces/msg/BodyCommand`.

| Field | Type | Meaning |
| :- | :- | :- |
| `header` | `std_msgs/Header` | Standard stamp and frame |
| `gait` | `uint8` | One of the gait constants below |
| `linear_velocity` | `float64[3]` | Body-frame `[vx, vy, vz]` in m/s. `vz` is unused |
| `yaw_rate` | `float64` | Turn rate in rad/s, positive turns left |
| `body_orientation` | `float64[3]` | Posture `[roll, pitch, yaw]` in rad |
| `body_height` | `float64` | Raise (+) or squat (−) from stance height, in m |

`linear_velocity` and `yaw_rate` drive the feet. `body_orientation` and
`body_height` tilt and raise the body **over** its ground contacts without
moving where the stance feet meet the ground — so you can level the trunk on a
slope, or lower the machine to fit under something, without changing the gait.

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

    It is deliberately not a trajectory. Asking a gait generator to "evaluate
    hold" would produce a stand-phased trot, which is motion, and motion is the
    one thing a freeze must never produce.

    Entering hold does not run a soft-start ramp. Leaving it does.

## Keep publishing

`/body_cmd` has a **deadman**. If no command arrives for `command_timeout`
seconds — **0.5 s by default** — the robot returns to a stand on its own.

This is intentional and you should design around it rather than disable it: an
application that crashes mid-trot leaves the robot unattended, and standing is
the right answer to being unattended. Publish at a steady rate for as long as
you want motion, even if the command has not changed.

Setting `command_timeout` to `0` disables the deadman. Do that only with the
robot on a stand.

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
0.5 s deadman, which is what matters. Publishing slower than 2 Hz will make the
robot stand up underneath you.

## Reading state back

| Topic | Type | Carries |
| :- | :- | :- |
| `/leg_state` | `qbot_interfaces/msg/RobotState` | Measured joint angle, velocity, torque and contact, per leg |
| `/leg_cmd` | `qbot_interfaces/msg/RobotCommand` | What the controller asked the legs for |
| `/imu` | `sensor_msgs/Imu` | Trunk orientation and rates |

!!! note "Naming trap"

    `LegCommand` and `LegState` are **per-leg** messages. The topics `/leg_cmd`
    and `/leg_state` carry the four-leg aggregates `RobotCommand` and
    `RobotState`, whose `legs` array follows the
    [leg order](conventions.md#leg-order).

## What is not published

The gait generator's internals and the impedance control law are **proprietary**
and not documented here. What is specified is the interface above and the
behaviour you can measure through it.

If your work needs to go below this seam — a custom controller, a modified
linkage, direct joint control — that is a conversation we are happy to have.
