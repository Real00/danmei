export const DEFAULT_FONT_PX = 18;
export const DEFAULT_FONT_WEIGHT = 500;
export const DEFAULT_BRIGHTNESS = 1;
export const MIN_FONT_WEIGHT = 300;
export const MAX_FONT_WEIGHT = 900;
export const FONT_WEIGHT_STEP = 100;
export const MIN_BRIGHTNESS = 0.55;
export const MAX_BRIGHTNESS = 1.25;
export const BRIGHTNESS_STEP = 0.05;
export const WEIGHT_PROBE_MIN_DELTA = 0.25;
export const READER_FONT_STACK_DEFAULT =
  `"Microsoft YaHei Variable", "Microsoft YaHei", "PingFang SC", "Noto Sans SC", ` +
  `"Source Han Sans SC", "WenQuanYi Micro Hei", "Noto Serif SC", "Source Han Serif SC", ` +
  `"STSong", "Songti SC", "Noto Serif", serif`;
export const READER_FONT_STACK_FALLBACK =
  `"PingFang SC", "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", ` +
  `"WenQuanYi Micro Hei", sans-serif`;

export const READER_STATE_KEY = "danmei_reader_state_v1";
export const READER_STATE_VERSION = 1;

export const BRAND_SUB_IDLE = "可传入 dmxs.org URL（#u=...），或在上方输入书籍链接";
export const EMPTY_CHAPTER_TITLE = "未加载内容";
export const DEFAULT_HINT_TEXT = "点此调字体";
export const EMPTY_GUIDE_PARAGRAPHS = [
  "请在上方输入 dmxs.org 书籍 URL 后点击 Open。",
  "也可以通过地址栏 #u=... 传入 URL，页面会自动打开。",
];
