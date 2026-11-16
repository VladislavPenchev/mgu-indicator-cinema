# Indicator Cinema for BMW iDrive 7

Three silent animations triggered by BMW's indicator state:

| Trigger | Scene |
|---|---|
| Left indicator | Woman enters the car on image-left |
| Right indicator | Man enters the car on image-right |
| Manual hazard lights | Both inside: paparazzi romantic-comedy scene with hearts |

Settings select **Cluster map area**, **Head-Up Display**, or **both**, and enable each scene separately. Automatic playback starts disabled; the main screen includes three test buttons and Stop. The app runs in the background after leaving its page.

Uses the existing `cluster-render` service, as Maps on Cluster does. ID7 target `map` is the 1088×480 central map area; `hud` is 800×480. It does not replace gauges or create a second RAMSES participant. A temporary exclusive overlay releases after indicators go off or after 12 seconds. HUD yields to the stock media/call lists. It shares the renderer with other apps; this occupies the map area while active, and navigation may be temporarily hidden there.

The actual clips are bundled as 384×216, 12 fps YUV420 atlases and displayed at 768×432 on cluster / 512×288 on HUD. Original 720p MP4s remain in `media/`. Playback has no audio and uses no audio manager, CarPlay or Bluetooth interfaces. Flashing of the physical lamps does not restart the animation. Unknown signals and automatic emergency/alarm flashing stop playback; only manual hazards select the common scene.

## Build and install

Requires Node (tests), Python 3 (kit), and an **oap-sdk extracted from your own head unit** for an installable package. SDK is not redistributed here.

```
npm test
npm run build:preview
node kit/tools/extract_sdk.js /path/to/your/donor/javascript/app.js oap-sdk
npm run build
```

Add this GitHub repository to MGU Store's repository list; the catalog is `mgu-repo.json`. The Store must also have `cluster-render` available from robertnisipeanu/idrive-apps. Install that dependency through the Store, then Indicator Cinema. Enable automatic playback after the three tests work on your car.

Open Settings to choose display and scenes. In Main press **Test left**, **Test right**, **Test hazards**, or **Stop**. When unavailable, the page reports renderer or signal errors. If Waze or another client owns an incompatible display slot, the renderer can wait; this app does not patch slot ownership or force HUD stock-content takeover.

To regenerate the bundled atlases after replacing an MP4, install FFmpeg locally and run `npm run prepare:media`. No FFmpeg is needed on the car.

## Validation and current limits

Version 0.1.0 is an experimental first build. Local tests cover BMW enum decoding, repeated notifications, off debounce, switching triggers, disabling, atlas integrity, and settings. Actual subscription field: `de.bmw.body.Light / 1 / StatusFunctionsIndicators.activeFunctionIndicateDirection`. Numeric and named enums are supported, following Ambient Config's known BMW interface.

**Not yet tested on the car:** permissions on this firmware, simultaneous map/HUD playback, renderer arbitration with Waze, and visual readability on the physical HUD. The car was unreachable over Tailscale during development. No car software or Waze settings were modified.

Clips are independent scenes, each starting from the original pose; sequential left/right inputs do not preserve a persistent occupancy state. The hazards clip starts with both people seated. A future version can add transition clips if persistent entry/exit states are desired.

## Sources and attribution

- MGU kit: MIT, cauliflowermossgrape and contributors; see `kit/LICENSE.upstream`.
- `cluster_render_client.js`: MPL-2.0, Robert Nisipeanu, copied unchanged from https://github.com/robertnisipeanu/idrive-apps (2026-11-16). Its source and notices are included.
- Renderer protocol and display dimensions: https://github.com/robertnisipeanu/idrive-apps/tree/main/native/cluster-render
- Indicator enum reference: https://github.com/cauliflowermossgrape/idrive7-apps/tree/main/apps/ambient_config
- Visuals: AI-generated fictional scenes using user-supplied references; no endorsement by BMW, RITUAL, or the portrayed performer is implied. Code licensing does not grant rights to third-party trademarks or likenesses.

Created with OpenAI Codex. No human code review or on-car test yet.
