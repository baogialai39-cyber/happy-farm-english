/**
 * TEST SOUND (F-212, SPEC 9) — khu phụ huynh. Kiểm tra THẬT (không giả) trên máy đang dùng:
 * Web Audio (AudioContext + đồng hồ âm thanh), HTMLAudioElement (play()), giọng đọc tiếng Anh, phiên âm thanh iOS.
 * Mọi thứ được khởi động ĐỒNG BỘ trong sự kiện chạm (yêu cầu của iOS), kết quả hiển thị sau.
 */
import type { AppCtx } from '../app';
import { isIOS, testSpeech, voiceInfo, voiceTotal } from '../systems/speech';
import { SOUND_FILES } from '../systems/audio';
import { h } from '../ui/dom';

type Level = 'ok' | 'warn';
const line = (lv: Level, text: string) => h('li', { class: `st-line st-${lv}` }, h('span', {}, lv === 'ok' ? '✅' : '⚠️'), h('span', {}, text));

const SPEECH_ERR: Record<string, string> = {
  'not-allowed': 'máy chặn giọng đọc vì chưa có thao tác chạm — hãy bấm TEST SOUND lần nữa',
  timeout: 'giọng đọc không bắt đầu. Trên iPhone: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Anh, tải một giọng (VD Samantha) rồi thử lại',
  'no-speech-synthesis': 'trình duyệt này không có chức năng đọc chữ',
  'synthesis-unavailable': 'máy chưa có giọng đọc tiếng Anh — hãy tải giọng tiếng Anh trong Cài đặt',
  'audio-busy': 'âm thanh đang bị ứng dụng khác chiếm — đóng app nghe nhạc / cuộc gọi rồi thử lại',
  interrupted: 'giọng đọc bị ngắt giữa chừng — thử lại',
  canceled: 'giọng đọc bị hủy — thử lại',
};

export function soundTestSection(ctx: AppCtx): HTMLElement {
  const out = h('ul', { class: 'st-results', 'aria-live': 'polite' });
  const btn = h('button', { class: 'btn btn-blue pt-btn st-btn' }, '🔊 TEST SOUND');
  btn.addEventListener('click', () => {
    // ---- 1) khởi động mọi thứ NGAY trong thao tác chạm (không await trước) ----
    ctx.audio.unlock();
    ctx.audio.chime(); // tiếng "ting ting" của Web Audio
    const el = new Audio(SOUND_FILES.beep); // tiếng "bíp" phát bằng HTMLAudioElement (file thật)
    el.setAttribute('playsinline', '');
    // iOS: play() phải gọi trong thao tác → gọi ngay, không chờ; lỗi (NotAllowedError…) được bắt và báo lại
    const htmlNow = el.play().then(() => 'ok', (e: unknown) => (e as DOMException)?.name ?? String(e));
    const speechP = testSpeech('Hello! Can you hear me?', 0.9);
    btn.disabled = true;
    out.replaceChildren(h('li', { class: 'st-line' }, '⏳ Đang kiểm tra… (bạn sẽ nghe "ting", "bíp" và giọng "Hello! Can you hear me?")'));
    void (async () => {
      // file âm thanh có thực sự tải được từ máy chủ (Vercel) không
      const fileCheck = (url: string) => fetch(url, { cache: 'no-store' }).then((r) => (r.ok ? `ok:${r.headers.get('content-type') ?? ''}` : `HTTP ${r.status}`), (e: unknown) => String(e));
      const [diag, html, sp, f1, f2] = await Promise.all([ctx.audio.diagnose(), htmlNow, speechP, fileCheck(SOUND_FILES.silence), fileCheck(SOUND_FILES.beep)]);
      const items: HTMLElement[] = [];
      // Web Audio (nhạc nền + hiệu ứng)
      if (!diag.supported) items.push(line('warn', 'Nhạc nền & hiệu ứng: trình duyệt không hỗ trợ Web Audio.'));
      else if (diag.state === 'running' && diag.clockRunning) items.push(line('ok', `Nhạc nền & hiệu ứng: hoạt động (AudioContext đang chạy, ${diag.sampleRate} Hz).`));
      else items.push(line('warn', `Nhạc nền & hiệu ứng: AudioContext đang "${diag.state}" — hãy bấm TEST SOUND lần nữa. Nếu vẫn vậy: tắt chế độ Nguồn điện thấp, đóng app khác đang phát âm thanh.`));
      // HTMLAudioElement
      items.push(html === 'ok'
        ? line('ok', 'Phát âm thanh bằng thẻ <audio>: thành công.')
        : line('warn', `Phát âm thanh bằng thẻ <audio>: bị chặn (${html}). Hãy bấm TEST SOUND lần nữa.`));
      // Giọng đọc
      const vi = voiceInfo();
      const n = voiceTotal();
      if (sp.ended) items.push(line('ok', `Giọng đọc tiếng Anh: đã đọc xong "Hello!" (giọng: ${vi?.name ?? 'mặc định'}, máy có ${n} giọng).`));
      else if (sp.started) items.push(line('warn', `Giọng đọc tiếng Anh: đã bắt đầu đọc nhưng chưa kết thúc${sp.error ? ` (${sp.error})` : ''}.`));
      else items.push(line('warn', `Giọng đọc tiếng Anh: ${SPEECH_ERR[sp.error ?? ''] ?? `lỗi "${sp.error}"`}.`));
      // Trạng thái khác
      items.push(line(diag.musicOn ? 'ok' : 'warn', diag.musicOn ? 'Nhạc nền: đang BẬT (nút 🎵).' : 'Nhạc nền: đang TẮT — bấm nút 🎵 để bật lại.'));
      items.push(line('ok', `Phiên âm thanh: ${diag.session === 'playback' ? 'phát media (nghe được cả khi gạt nút im lặng)' : diag.session}.`));
      const files = [['silence.wav', f1], ['test-beep.wav', f2]] as const;
      const bad = files.filter(([, r]) => !r.startsWith('ok'));
      items.push(bad.length
        ? line('warn', `File âm thanh: không tải được ${bad.map(([n, r]) => `${n} (${r})`).join(', ')} — kiểm tra mạng hoặc bản triển khai.`)
        : line('ok', 'File âm thanh: silence.wav và test-beep.wav tải thành công (nhạc nền, hiệu ứng và giọng đọc được tạo ngay trên máy, không cần file).'));
      if (isIOS()) items.push(h('li', { class: 'st-line st-tip' }, '📱 iPhone/iPad: nếu vẫn không nghe — gạt nút im lặng bên hông máy, bấm tăng âm lượng, tắt chế độ Tập trung, rồi bấm TEST SOUND lại.'));
      items.push(h('li', { class: 'st-line st-tip' }, '👂 Bạn có nghe tiếng "ting", "bíp" và giọng "Hello!" không? Nếu có, âm thanh đã hoạt động.'));
      out.replaceChildren(...items);
      btn.disabled = false;
    })();
  });
  return h('div', { class: 'st' }, h('p', { class: 'pt-info' }, '🔊 Kiểm tra âm thanh (nhạc, hiệu ứng, giọng đọc)'), btn, out);
}
