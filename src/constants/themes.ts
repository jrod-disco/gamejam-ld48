// Theming
const _COLORS = {
  PEPTO: 0xff00ff,
  ORIGINAL_WHITE: 0xffffff,
  ORIGINAL_BLACK: 0x000000,
  GRAY_DARK: 0x333333,
  GRAY_MID: 0x999999,
  GRAY_LIGHT: 0xdddddd,
  BLUE_MIDNIGHT: 0x04080d,
  BLUE_LIGHT: 0x3877ba,
  BLUE_LIGHTER: 0x4f8cc9,
  BLUE_LIGHTEST: 0x7eabd7,
  BLUEGREEN: 0x3a8f8e,
  BLUEGREEN_LIGHT: 0x4bb88c,
  RED_DEEP: 0x330000,
  RED_MID: 0xcc0000,
  RED_LIGHT: 0xff0000,
  RED_PINK: 0xff3333,
  GAMEBOY_A: 0x0f380f,
  GAMEBOY_B: 0x8bac0f,
  GAMEBOY_C: 0xafd412,
  GAMEBOY_D: 0xc5eb19,

  SOLAR_A: 0x204059,
  SOLAR_B: 0x586e75,
  SOLAR_C: 0x93a1a1,
  SOLAR_D: 0xeee8d5,
  SOLAR_YELLOW: 0xb58900,
  SOLAR_ORANGE: 0xcb4b16,
  SOLAR_RED: 0xdc322f,
  SOLAR_MAGENTA: 0xd33682,
  SOLAR_VIOLET: 0x6c71c4,
  SOLAR_BLUE: 0x268bd2,
  SOLAR_CYAN: 0x2aa198,
  SOLAR_GREEN: 0x859900,
};
export const _THEMES = {
  // prettier-ignore
  ORIGINAL: {
      NAME: 'ORIGINAL B&W',
      BG_HEX:             _COLORS.ORIGINAL_BLACK,
      FILLS_HEX:          _COLORS.ORIGINAL_WHITE,
      OUTLINES_HEX:       _COLORS.ORIGINAL_BLACK,
      TARGET_OUTLINE_HEX: _COLORS.ORIGINAL_BLACK,
      JETS_OUTLINE_HEX:   _COLORS.ORIGINAL_BLACK,
      TARGET_FILL_HEX:    _COLORS.ORIGINAL_WHITE,
      JETS_FILL_HEX:      _COLORS.ORIGINAL_WHITE,
      LOGO_HEX:           _COLORS.ORIGINAL_WHITE,
      BUTTON_HEX:         _COLORS.ORIGINAL_WHITE,
      TXT_TITLES_HEX:     _COLORS.ORIGINAL_WHITE,
      TXT_INFO_HEX:       _COLORS.ORIGINAL_WHITE,
      TXT_HUD_HEX:        _COLORS.ORIGINAL_WHITE,
      TXT_TARGET_HEX:     _COLORS.ORIGINAL_WHITE,
      TXT_BULLET_HEX:     _COLORS.ORIGINAL_WHITE,
      PARTICLE_HEX:       _COLORS.ORIGINAL_WHITE,
    },

  // prettier-ignore
  GAMEBOYTRUSE: {
      NAME: 'GAMEBOYTRUSE',
      BG_HEX:             _COLORS.GAMEBOY_A,
      LOGO_HEX:           _COLORS.GAMEBOY_D,
      OUTLINES_HEX:       _COLORS.GAMEBOY_A,
      TARGET_OUTLINE_HEX: _COLORS.GAMEBOY_A,
      JETS_OUTLINE_HEX: _COLORS.GAMEBOY_A,
      
      FILLS_HEX:          _COLORS.GAMEBOY_B,
      TARGET_FILL_HEX:    _COLORS.GAMEBOY_B,
      JETS_FILL_HEX:      _COLORS.GAMEBOY_B,
      
      PARTICLE_HEX:       _COLORS.GAMEBOY_D,
      TXT_TITLES_HEX:     _COLORS.GAMEBOY_D,
      TXT_INFO_HEX:       _COLORS.GAMEBOY_C,
      TXT_HUD_HEX:        _COLORS.GAMEBOY_B,
      TXT_TARGET_HEX:     _COLORS.GAMEBOY_C,
      TXT_BULLET_HEX:     _COLORS.GAMEBOY_D,
      BUTTON_HEX:         _COLORS.GAMEBOY_C,
  },
  // prettier-ignore
  SOLARIZED: {
      NAME:           'SOLARIZED',
      BG_HEX:             _COLORS.SOLAR_A,
      LOGO_HEX:           _COLORS.SOLAR_BLUE,
      STREAK_HEX:         _COLORS.SOLAR_MAGENTA, // new
      PARTICLE_HEX:       _COLORS.SOLAR_YELLOW,
      BUTTON_HEX:         _COLORS.SOLAR_C,
      OUTLINES_HEX:       _COLORS.SOLAR_A,
      TARGET_OUTLINE_HEX: _COLORS.SOLAR_A,
      JETS_OUTLINE_HEX:   _COLORS.SOLAR_YELLOW,
      EBULLET_OUTLINE_HEX: _COLORS.SOLAR_A,// new
      MISSILE_OUTLINE_HEX:_COLORS.SOLAR_A,// new
      
      FILLS_HEX:          _COLORS.SOLAR_C,
      TARGET_FILL_HEX:    _COLORS.SOLAR_MAGENTA,
      JETS_FILL_HEX:      _COLORS.SOLAR_ORANGE,
      EBULLET_FILL_HEX:   _COLORS.SOLAR_RED,// new
      MISSILE_FILL_HEX:   _COLORS.SOLAR_D,// new

      TXT_TITLES_HEX:     _COLORS.SOLAR_BLUE,
      TXT_INFO_HEX:       _COLORS.SOLAR_C,
      TXT_HUD_HEX:        _COLORS.SOLAR_D,
      TXT_TARGET_HEX:     _COLORS.SOLAR_GREEN,
      TXT_BULLET_HEX:     _COLORS.SOLAR_CYAN,
    },
};
