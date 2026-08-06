# Specifications

!!! note "This page is being completed"

    Several figures below are not yet characterized. They are shown as gaps
    rather than filled with estimates, because a number on this page may be used
    to design a system around the robot. Ask us about anything you need that is
    still missing — some of it is measured but not yet published.

## Configuration

| Property | Value |
| :- | :- |
| Type | Quadruped, closed five-bar leg linkage |
| Degrees of freedom | 12 — three per leg (`Hip`, `ThighRear`, `ThighFront`) |
| Actuators | Feetech HL3915 serial bus servos, 12 |
| Leg order | `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` |
| Control interface | ROS 2 Jazzy, `/body_cmd` |
| Onboard control loop | 200 Hz |
| Simulation | MuJoCo, shipped with the robot; the same control stack drives both |
| Visualisation | Isaac Sim render twin, optional — needs Windows and an NVIDIA RTX GPU |

## Physical

| Parameter | Value | Basis |
| :- | :- | :- |
| Mass | 2.0 kg | Measured |
| Leg linkage mass, per leg | 0.130 kg | Measured — two thighs and two calves, excluding hip and motors |
| Overall dimensions | — | Not yet characterized |
| Stance height | — | Not yet characterized |
| Foot contact radius | 0.025 m | Simulated |

## Actuation

| Parameter | Value | Basis |
| :- | :- | :- |
| Peak joint torque | 1.39 N·m | Vendor specification — Feetech HL3915 |
| Joint range | — | Not yet characterized |
| Joint velocity limit | — | Not yet characterized |

The 1.39 N·m ceiling is the real constraint on this machine, and the simulation
model is clamped to it rather than to a comfortable number. A gait that needs
more torque than this does not run here, and finding that out in simulation
instead of on the robot is the point.

## Power and compute

| Parameter | Value | Basis |
| :- | :- | :- |
| Onboard compute | — | Not yet characterized |
| Supply voltage | — | Not yet characterized |
| Battery capacity | — | Not yet characterized |
| Runtime | — | Not yet characterized |

## Performance

Figures below are from the simulation model, which is calibrated against the
robot but is not the robot. Hardware locomotion works — trot, walk and yaw all
run on the machine — but has not been instrumented for speed, so those rows stay
open rather than borrowing the simulated numbers.

| Parameter | Value | Basis |
| :- | :- | :- |
| Forward speed, trot | 0.22 m/s | Simulated — commanded 0.20 m/s, flat floor |
| Forward speed, walk | 0.085 m/s | Simulated — commanded 0.08 m/s, flat floor |
| Standing height | 0.193 m | Simulated |
| Forward speed, hardware | — | Not yet characterized |
| Payload | — | Not yet characterized |
| Gradeability | — | Not yet characterized |
| Step height | — | Not yet characterized |

## How to read the Basis column

Every figure states how it was obtained, so you can tell which numbers are safe
to design against:

| Basis | Meaning |
| :- | :- |
| `Measured` | Taken from the physical robot |
| `Vendor specification` | From a component datasheet — someone else's measurement |
| `Simulated` | From the simulation model |
| `Design target` | Intended, not yet confirmed |
| `Not yet characterized` | Unknown; we would rather say so than guess |
