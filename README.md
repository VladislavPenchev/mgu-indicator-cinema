# Indicator Cinema for BMW iDrive 7

Three silent animations triggered by BMW's indicator state:

| Trigger | Scene |
|---|---|
| Left indicator | Woman enters the car on image-left |
| Right indicator | Man enters the car on image-right |
| Manual hazard lights | Both inside: paparazzi romantic-comedy scene with hearts |

Settings select **Cluster map area**, **Head-Up Display**, or **both**, and enable each scene separately. Automatic playback starts disabled; the main screen includes three test buttons and Reset scene. The app runs in the background after leaving its page.

Uses the existing `cluster-render` service, as Maps on Cluster does. ID7 target `map` is the 1088×480 central map area; `hud` is 800×480. It does not replace gauges or create a second RAMSES participant. A persistent exclusive overlay holds the last frame after the lamps turn off. Reset scene releases it. HUD yields to the stock media/call lists. It shares the renderer with other apps; this occupies the map area while active, and navigation may be temporarily hidden there.

The actual clips are bundled as 384×216, 12 fps YUV420 atlases and displayed at 768×432 on cluster / 512×288 on HUD. Original 720p MP4s remain in `media/`. Playback has no audio and uses no audio manager, CarPlay or Bluetooth interfaces. Flashing of the physical lamps does not restart the animation. Unknown signals and automatic emergency/alarm flashing do not trigger a clip; only manual hazards select the common scene, after both entry scenes.

## Build and install

Requires Node (tests), Python 3 (kit), and an **oap-sdk extracted from your own head unit** for an installable package. SDK is not redistributed here.

```
npm test
npm run build:preview
node kit/tools/extract_sdk.js /path/to/your/donor/javascript/app.js oap-sdk
npm run build
```

Add this GitHub repository to MGU Store's repository list; the catalog is `mgu-repo.json`. The Store must also have `cluster-render` available from robertnisipeanu/idrive-apps. Install that dependency through the Store, then Indicator Cinema. Enable automatic playback after the three tests work on your car.

Open Settings to choose display and scenes. In Main press **Test left**, **Test right**, **Test hazards**, or **Reset scene**. When unavailable, the page reports renderer or signal errors. If Waze or another client owns an incompatible display slot, the renderer can wait; this app does not patch slot ownership or force HUD stock-content takeover.

To regenerate the bundled atlases after replacing an MP4, install FFmpeg locally and run `npm run prepare:media`. No FFmpeg is needed on the car.

## Validation and current limits

Version 0.2.1 keeps occupant state in memory until Reset scene, shutdown, or a settings change. Left and right entries finish even if their signal turns off. The other entry queues rather than interrupting; manual hazards queue after both entries. Repeating the same indicator does not make a seated person enter again. Reset scene starts a new sequence; state is not persisted across restarts.

Existing entry videos are combined from image-left and image-right with a feathered seam, retaining the other person's pose. This is not newly generated footage: camera/reflection differences and the transition to the existing hazards clip can remain visible. The hazards clip is the existing paparazzi romantic-comedy scene; a new explicit kissing clip has not been generated. No paid generations are made by this update.

Tests cover both entry orders, lamp release, queued hazards, reset cancellation, disabled automation, YUV planes and holding beyond 30 seconds. Version 0.1.0 manual video playback was confirmed on the car; 0.2.0 still needs visual confirmation on the physical cluster/HUD. The cluster map area must be available (Map view and vehicle display state).

## Sources and attribution

- MGU kit: MIT, cauliflowermossgrape and contributors; see `kit/LICENSE.upstream`.
- `cluster_render_client.js`: MPL-2.0, Robert Nisipeanu, copied unchanged from https://github.com/robertnisipeanu/idrive-apps (2026-11-16). Its source and notices are included.
- Renderer protocol and display dimensions: https://github.com/robertnisipeanu/idrive-apps/tree/main/native/cluster-render
- Indicator enum reference: https://github.com/cauliflowermossgrape/idrive7-apps/tree/main/apps/ambient_config
- Visuals: AI-generated fictional scenes using user-supplied references; no endorsement by BMW, RITUAL, or the portrayed performer is implied. Code licensing does not grant rights to third-party trademarks or likenesses.

Created with OpenAI Codex. No human code review.

## Memory use (0.2.1)

Raw fixed-frame `.pack` files are read by offset from disk. These files are not loaded with the kit pack loader. The player has one reusable source-frame buffer, two pose frames and one composed frame; the clip descriptor and source-buffer reference are released at completion or Reset. There is no base64 module, whole-clip decompression or clip cache. Original MP4s remain build-time inputs only. Retained pose/frame data is about 0.36 MiB while holding, excluding the JS runtime, renderer and protocol buffers. Total application RSS and shared platform limits must still be checked on the car.

`node --expose-gc tools/memory-check.js` runs 20 complete three-clip sequences with the real player and a fake display, checks retained Buffer memory under 2 MiB, then resets. This is a local memory regression check, not a measurement of the car's shared renderer.
