# 40 result (round 2)

Cause of the clipping: headless Chrome's `--window-size=375` lays the page out at a wider minimum window and crops to 375, so the CSS was not overflowing. Measured with a true 375 viewport, scrollWidth is 375 (1280 at desktop).

Files changed: mockup/mockup.css (grids now minmax(0, 1fr), min-width: 0 and overflow-wrap: anywhere on tiles, cards and edit rows), phone-375.png (375x3633) and desktop-1280.png, both true full-page captures via Chrome DevTools device-metrics override (windowsHide, script in scratchpad, not in the repo).

I viewed the new phone-375.png: tiles, cards, edit rows, staff text, skeletons and empty states all fit, nothing cut off.

Done-test rerun through the runner: green (259 pass; runner runs the whole suite). Round-1 mutation result stands (uppercase failed "no wide letter-spacing and no uppercase", max-width query failed "only min-width media queries"); the CSS change was layout only, so not repeated.

Not run: tsc, eslint (gate does it).
