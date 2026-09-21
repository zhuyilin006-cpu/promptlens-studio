// Vidu 系统预设音色（已实测 create Live 接受）。gender 为按官方展示名/命名惯例的归类，
// 仅作挑选参考；实际音色以通话试听为准。也支持填入自定义/克隆音色 ID。
export interface VoiceOption {
  id: string; // avatar.voice 取值
  label: string; // 展示名
  gender: 'male' | 'female';
}

export const VIDU_VOICES: VoiceOption[] = [
  { id: 'Tina', label: '甜甜 Tina · 温柔女声', gender: 'female' },
  { id: 'Cindy', label: '林欣宜 Cindy · 知性女声', gender: 'female' },
  { id: 'Liora Mira', label: '清欢 Liora · 清亮女声', gender: 'female' },
  { id: 'Chloe', label: 'Chloe · 甜美女声', gender: 'female' },
  { id: 'Momo', label: 'Momo · 活力女声', gender: 'female' },
  { id: 'Sunnybobi', label: '知芝 Sunnybobi · 亲和女声', gender: 'female' },
  { id: 'Raymond', label: '林川野 Raymond · 沉稳男声', gender: 'male' },
  { id: 'Ethan', label: 'Ethan · 磁性男声', gender: 'male' },
  { id: 'Aiden', label: 'Aiden · 阳光男声', gender: 'male' },
  { id: 'Ryan', label: 'Ryan · 温暖男声', gender: 'male' },
];
