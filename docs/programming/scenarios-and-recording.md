# Scenarios and recording

Two things you need once you stop driving the robot by hand: replaying a
sequence identically, and keeping what happened.

!!! note "Being written"

    This page is an outline. The sections below are what it will cover.

## What a scenario is

A Python file describing a sequence of movements, replayed identically on every
run. Scenarios are how a demonstration becomes repeatable and how an experiment
becomes comparable between runs.

A recorded run is also the input to rendering: the same trajectory can be
re-rendered in NVIDIA Isaac Sim in any of the prepared scenes.

<div class="scene-grid">
  <figure class="render">
    <img src="../../assets/images/scene-studio.webp" alt="Q-Bot Mini walking in the studio scene" width="1920" height="1040" loading="lazy">
    <figcaption>studio</figcaption>
  </figure>
  <figure class="render">
    <img src="../../assets/images/scene-room.webp" alt="Q-Bot Mini walking on a wooden floor in the room scene" width="1920" height="1040" loading="lazy">
    <figcaption>room</figcaption>
  </figure>
  <figure class="render">
    <img src="../../assets/images/scene-warehouse.webp" alt="Q-Bot Mini walking across a floor marking in the warehouse scene" width="1920" height="1040" loading="lazy">
    <figcaption>warehouse</figcaption>
  </figure>
  <figure class="render">
    <img src="../../assets/images/scene-exhibition.webp" alt="Q-Bot Mini walking on a polished floor in the exhibition scene" width="1920" height="1040" loading="lazy">
    <figcaption>exhibition</figcaption>
  </figure>
</div>

## The file format

Structure of a scenario file, how it is loaded, and how to pass one at launch.

## Step types

The available steps and their arguments — commanded motion, waits, posture
changes, and waypoint following.

## A worked example

A complete scenario that can be copied, run, and modified.

## Running headless

Playing a scenario with no viewer, for recording and for batch runs.

## What gets recorded

The channels captured during a run, their sample rates, and what each one means.

## The on-disk format

File layout, units and timestamps — enough to load a run in your own analysis
code.

## Reading a recording back

Loading a recorded run and getting at the trajectories.
