# Safety

QBot Mini is a **development platform, not a certified industrial product**. It
has no safety rating, no protective stop conforming to a machinery standard, and
no assessment for operation around untrained people. Treat it as laboratory
equipment: supervised, in a defined area, by someone who knows what it is about
to do.

## The robot does nothing until you arm it

A freshly powered robot publishes no commands at all. It stays in its tucked
starting pose until an operator explicitly arms it, so a launch file's defaults
can never hoist a robot that somebody has their hands on.

Every control except **ARM**, **STOP** and **Clear stop** is locked out while
disarmed.

## Two kinds of stop, and they behave differently on purpose

This distinction matters more than any other on this page.

| What happened | What the robot does |
| :- | :- |
| **An operator presses STOP** or deliberately disarms | **Freezes in place.** The current pose is latched and held exactly. |
| **The commander vanishes** — timeout, closed tab, lost network, crashed application | **Decelerates and settles.** Velocity slews to zero, then the robot stands. |

The reasoning: somebody standing next to the robot has usually parked it
deliberately, and pressing STOP must not hoist it back up under their hands. An
*unattended* robot whose commander disappeared should slow down and settle onto
its feet rather than freeze mid-stride with a foot in the air.

A freeze **zeroes velocity but keeps the posture** — an emergency stop keeps the
pose, never the momentum.

!!! danger "STOP latches"

    Once any operator presses STOP, the robot cannot be armed again until
    someone presses **Clear stop**. This is deliberate: a stop should not expire
    on its own while the reason for it is still standing next to the robot.

## The two deadmen

Two independent timeouts, confusingly sharing a parameter name in different
nodes. Both exist so that a failure upstream ends in a stationary robot:

| Deadman | Default | Watches | On expiry |
| :- | :-: | :- | :- |
| Motion (`locomotion_node`) | 0.5 s | `/body_cmd` arriving | Robot stands |
| Operator (`web_ui_node`) | 1.0 s | Browser heartbeat | Robot disarms and settles |

Setting either to `0` disables it. There is exactly one situation where that is
reasonable — the robot on a stand with its feet off the ground — and doing it
with the robot on the floor is how people break robots.

## Before you power on

!!! note "Being written"

    A pre-flight checklist for the hardware is being prepared. Until it is
    published, the short version: clear the area, check nothing is caught in the
    linkages, and have the STOP control in reach of whoever is closest to the
    robot.

## Batteries

!!! note "Being written"

    Charging, storage, transport and damaged-cell handling are being prepared.
    Follow the cell manufacturer's guidance in the meantime, and do not charge
    the robot unattended.

## Working around a moving robot

- Keep the STOP control within reach of the person closest to the robot, not the
  person driving it.
- The robot can fall. Assume any leg can end up somewhere unexpected within one
  gait cycle.
- Do not put hands in the linkages while armed. A leg holding a pose is still
  under torque — a freeze is not a power-off.
- Power down before working on the machine. Disarmed is not de-energised.

## If it behaves unexpectedly

In this order:

1. **STOP** — it freezes rather than doing anything further.
2. **Power down** if the behaviour was mechanical or the robot is still moving.
3. Only then diagnose. Debugging a robot that is still armed is how a
   misdiagnosis becomes an injury.

See [Troubleshooting](maintenance/troubleshooting.md) once the robot is safe.
