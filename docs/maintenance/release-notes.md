# Release notes

Version history for the robot and this documentation.

## 0.0 — current

The first documented version, and a pre-release one: the interface described in
this documentation is expected to change, and no compatibility promise is made
until 1.0.

**What works today**

- Stand, walk, trot and yaw under velocity command
- The same control stack in MuJoCo simulation and on hardware
- Posture and body-height control independent of the gait
- Operator control from a browser, with arming, a latching STOP and two deadmen
- Scripted scenarios and run recording

**Known limitations**

- Payload, runtime and gradeability are [not characterized](../reference/specifications.md)
- Mechanical and electrical interface figures are not published
- No navigation, mapping or obstacle avoidance in the shipped software
- Locomotion speed has been measured in simulation only

!!! note "Interface stability"

    Topic names, message fields and parameter names may change before 1.0. Where
    a change would break existing code, it will be listed here.
