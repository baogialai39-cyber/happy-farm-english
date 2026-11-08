// Font đóng gói cục bộ (chỉ bộ chữ Latin + tiếng Việt), không tải từ CDN.
import '@fontsource/baloo-2/latin-500.css';
import '@fontsource/baloo-2/latin-ext-500.css';
import '@fontsource/baloo-2/vietnamese-500.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-ext-700.css';
import '@fontsource/baloo-2/vietnamese-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/baloo-2/latin-ext-800.css';
import '@fontsource/baloo-2/vietnamese-800.css';
import './styles.css';
import './world.css';
import './shops.css';
import './learning.css';
import './games.css';
import './time.css';
import './zoo.css';

import type { AppCtx, Route } from './app';
import { createProfileScene } from './scenes/createProfile';
import { splashScene } from './scenes/splash';
import { welcomeScene } from './scenes/welcome';
import { worldScene } from './scenes/world';
import { openKV } from './storage/kv';
import { ProfileStore } from './storage/profiles';
import { AudioEngine } from './systems/audio';

async function boot() {
  const root = document.getElementById('app')!;
  const kv = await openKV();
  const store = new ProfileStore(kv);
  const meta = await store.getMeta();
  const audio = new AudioEngine(meta.musicOn);

  // Trình duyệt chỉ cho phát âm thanh sau lần chạm đầu tiên.
  // Mở khóa âm thanh ở MỌI thao tác của bé (F-210). iOS chỉ coi touchend / click / pointerup (chạm)
  // là thao tác người dùng — pointerdown chỉ có tác dụng với chuột máy tính.
  for (const ev of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const) {
    document.addEventListener(ev, () => audio.unlock(), { capture: true, passive: true });
  }

  let navId = 0;
  const ctx: AppCtx = {
    store,
    kv,
    audio,
    async go(route: Route) {
      const id = ++navId;
      let el: HTMLElement;
      switch (route.name) {
        case 'splash':
          el = splashScene(ctx);
          break;
        case 'create':
          el = createProfileScene(ctx, route);
          break;
        case 'welcome':
          el = await welcomeScene(ctx, route);
          break;
        case 'farm':
          el = await worldScene(ctx, route);
          break;
      }
      if (id !== navId) return; // đã chuyển màn khác trong lúc tải
      root.replaceChildren(el);
      document.body.dataset.screen = route.name;
    },
  };

  root.dataset.storage = kv.kind;
  ctx.go({ name: 'splash' });
}

void boot();
