# The web console

A browser interface for driving the robot without writing code. It runs against
the simulation and against hardware identically, and everything it sends goes
through the same [`/body_cmd`](../programming/ros2-interface.md) path as your own
software — so clamping, slew limiting, the deadman and STOP all still apply.

## Opening it

Start the system with the console as the command source, then open the URL the
node logs at startup:

```
http://127.0.0.1:8642
```

!!! tip "Read the logged URL, do not assume the port"

    If 8642 is taken, the node walks upward until it finds a free port and logs
    the real one. Take the URL from the log rather than typing it.

## Arming

**You connect disarmed.** Every control except ARM, STOP and Clear stop is locked
out behind an overlay until you arm — press ++enter++ or click ARM.

Only one browser tab has control. Others show
`observing — controls held by another tab`.

The browser must keep sending heartbeats. Lose them for one second — by closing
the tab, losing the network, or putting the machine to sleep — and the robot
disarms itself.

!!! danger "STOP latches"

    ++esc++ or the STOP button freezes the robot in place, and it stays latched
    until someone presses **Clear stop**. See [Safety](../safety.md) for why a
    deliberate stop freezes while a lost connection settles.

## Drive modes

++m++ switches between them. **HOLD is the boot default.**

| Mode | Behaviour |
| :- | :- |
| **HOLD** | The robot moves only while a key is held. Release returns to zero |
| **SETPOINT** | Each tap nudges the speed, and it is held until you change it |

A tap moves an axis by a tenth of its current cap, so ten taps reach full scale
whatever the cap is set to.

## Gaits

Selecting a gait applies its starting values **and zeroes the drive
setpoints** — changing gait never inherits the previous gait's speed.

| Gait | Step frequency | Speed cap | Turn cap | Step height |
| :- | :-: | :-: | :-: | :-: |
| `walk` | 0.3 Hz | 0.05 m/s | 0.3 rad/s | 0.05 m |
| `trot` | 1.5 Hz | 0.15 m/s | 1.0 rad/s | 0.05 m |
| `stand` | — | — | — | 0.05 m |

`stand` has no preset because the whole drive row is locked while standing. Step
height is adjustable from 0.01 to 0.12 m.

## Keyboard

| Key | Action |
| :- | :- |
| ++w++ / ++s++ | Forward / back. In **stand**, pitch the body instead (±0.02 rad) |
| ++a++ / ++d++ | Strafe left / right. In **stand**, roll |
| ++q++ / ++e++ | Turn left / right. In **stand**, yaw |
| ++space++ | All stop — zeroes the held setpoint |
| ++arrow-up++ / ++arrow-down++ | Body pitch ±0.02 rad |
| ++arrow-left++ / ++arrow-right++ | Body roll ±0.02 rad |
| ++comma++ / ++period++ | Body yaw ±0.02 rad |
| ++z++ | Level the body — roll, pitch and yaw to zero |
| ++r++ / ++f++ | Raise / lower ride height ±5 mm |
| ++h++ | Back to nominal height |
| ++1++ / ++2++ / ++3++ | stand / walk / trot, applying that gait's presets |
| ++minus++ / ++equal++ | Speed cap ±0.05 m/s |
| ++bracket-left++ / ++bracket-right++ | Turn cap ±0.1 rad/s |
| ++semicolon++ / ++single-quote++ | Step frequency ±0.1 Hz |
| ++enter++ | Arm / disarm |
| ++esc++ | STOP — latches, needs Clear stop |
| ++m++ | Switch drive mode |
| ++question++ | Show the full key map |

The drive keys pose the body in stand rather than doing nothing, matching what
the on-screen controls do while the drive row is locked.

## One-button demos

Eight prepared routines — Forward, Backward, Strafe, Spin, Circle, Dance, Bob,
Sit — for showing the robot to someone without driving it by hand.

They drive the same command path as manual operation, and **any** manual input,
STOP, disarm, or switching tabs cancels a running demo immediately.

## Reaching the console from another machine

By default the console is bound to localhost and cannot be reached from
elsewhere. Bound to any other address, it prints a one-time token at startup and
the URL must carry it:

```
http://<address>:8642/?token=<printed value>
```

Every request without the token is refused with 403.

!!! warning

    Exposing the console puts control of a moving robot on your network. Do it
    on a network you control, and read [Safety](../safety.md) first.
