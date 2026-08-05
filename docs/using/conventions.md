# Conventions

Frames, signs, orders and units. Everything else in this documentation assumes
these, and getting a sign wrong here is the difference between a robot that
walks forward and one that drives itself into the floor. Read this page before
sending the robot a command.

## Body frame

The body frame is right-handed and fixed to the trunk:

| Axis | Direction |
| :- | :- |
| `+x` | Forward |
| `+y` | Left |
| `+z` | Up |

Rotations follow the right-hand rule about those axes, so a **positive
`yaw_rate` turns the robot left**.

The feet sit below the hips, so a foot position's `z` component is **negative**
in normal standing and walking. A positive `z` would place the foot above its
hip.

## Leg order

Every four-leg array — `RobotCommand.legs`, `RobotState.legs` — is ordered:

```
[0] FrontLeft   [1] FrontRight   [2] RearLeft   [3] RearRight
```

!!! warning "There is no per-leg mirroring"

    Leg commands are **not** mirrored left to right by the software. A foot
    position is expressed the same way for all four legs, and the physical
    mounting orientation of each leg is accounted for on the motor controller.

    This trips up anyone who expects to negate `y` for the right-hand legs. Do
    not. Send the same convention to all four.

## Joint order

Each leg carries three joints, ordered:

```
[0] Hip   [1] ThighRear   [2] ThighFront
```

The naming reflects the closed five-bar linkage: two thigh joints drive a pair
of calf links that meet at a single foot tip, rather than the open hip-knee
chain of a serial leg.

## Units

SI throughout, without exception:

| Quantity | Unit |
| :- | :- |
| Position, length | metres (m) |
| Linear velocity | metres per second (m/s) |
| Angle | radians (rad) |
| Angular velocity | radians per second (rad/s) |
| Force | newtons (N) |
| Torque | newton-metres (N·m) |
| Time | seconds (s) |

Millimetres and degrees do not appear on any interface. If you are reading a
figure in millimetres, it came from a mechanical drawing, not from the robot.
