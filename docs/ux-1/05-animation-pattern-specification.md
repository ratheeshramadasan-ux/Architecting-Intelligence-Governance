# Animation Pattern Specification

Motion explains change. Default duration is 200–550 ms for state changes; instructional progression uses 1.2-second steps and always exposes Play, Pause, and Restart.

Approved patterns: fade sequence, step reveal, active path, data pulse, node expansion, layer reveal, before/after, decision branch, timeline progression, risk escalation, control activation, human-approval pause, completion, exception rerouting, hover explanation, scroll reveal, number count-up, progress fill, relationship-line draw, and architecture-layer focus.

The pilots implement scroll reveal, active-path highlighting, step reveal, control activation, and the human-approval pause. `prefers-reduced-motion: reduce` removes transitions and prevents auto-sequence playback. Content is complete and understandable when motion is disabled.

Prohibited: continuous floating, parallax, bouncing, decorative rotation, autoplay video, or transitions that delay navigation.
