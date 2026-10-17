import { Player, RoleInfo, DeckConfig, RoleType } from '../types/game';

// 25 distinctive medieval villagers with avatars and backstories
export const INITIAL_25_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Mateo (Tú)',
    isHost: true,
    isCurrentUser: true,
    isMayor: true, // Default Alcalde
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3dg_vQWq0VPRNKkvEA_k_pu5_xdAihlhNwXLe7JGvL95FSlraaMcQA7rjBeClL2Lj41iX8PuVch3QhgiT2VAvHGNXGXEwx8Be7Q4RVe4aLvqSaEuUJfQny8EKcL6eqDXf19EiQulag_ZCVIPZ0D55VrnFC65YV0CD0K5F3cgLdbgs9n6bB605HJXVyYpYRToU81tmUKK7hfVrNwd8zgfNpayxfvSWDMy9d8dVq-EahbAPjnANnHucOQ',
    role: 'alfa_werewolf',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p2',
    name: 'Elena',
    isHost: false,
    isCurrentUser: false,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa6ORFhSHL4JXpo1BOFCH-WxHK6UU4Jn0hY9td8o9dTGeq16d5kD0uHGTZ6nEq3U5qS1c7v28DkQiJYTp5NNujCiuZc22CY4_n9aAUocIJSN8piqwoZtHnJ1AGfc-fHOI-5ksC8OrTvC6eKY2g_OizEOM7kmP5wlo226hFv8GH_GEUC2cVbzX-hjVaKvUOz09Bu6OMfsG7fAD0CVog1WRcYMFOVsARAJLoGt3IExGqz_E0MLa_vtpfHw',
    role: 'seer',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p3',
    name: 'Carlos',
    isHost: false,
    isCurrentUser: false,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf8WMjwM0R1LQOjZIkJSH0v3PGMkHiZ4lWRyWkPT8TNleYqqYliKP_XcfA-f6_nvZuDasv9pVG1nVWqHPkzBWMLUrlTdNss1pcynTwv1uKvLXi7v49yBd7G2dBFLqTQ--QcqIbuMVZzw0SY3NEL_TbAeZOtmCcfdb9NYV9jOU16i6_9x_JZWIdAH57f2LD63e0ZrzjtsQkX_cFF1VR2bAVL6xMmo8KKpkIUTZTrjXoFyr07VnATEAuTw',
    role: 'doctor',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p4',
    name: 'Sofía',
    isHost: false,
    isCurrentUser: false,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaICa67tp_F1zq7jF0la9-_z3o_4-Z7vXybzykIwKtMApDmubWimEfbrQDHXHHbX71VVAjgHoESXIwauPKJY6Eqr5Vob21mwRijtJcrjHL-i6qD-WOjGseGb4D71mI21TvRWBk6bSORD3J-UNp8p7wu0iP72FA2hkXTlRDDbEhGwsQL_eJaqwHqD3KnOzdSsfMXzeKtgh4pWASBA3otJKTTcg-DvyYzqMmSyLuTm13WmBO6dAD6IvWgg',
    role: 'cupid',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p5',
    name: 'Lucas',
    isHost: false,
    isCurrentUser: false,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDff9aW54Ydo9Z4jcwvyEUNrW1N17etUUDMDCeFGIjFFHtq6qySRJGVUOuiOcB1_8sSfBjmOfqlKQZ39pzgfcqWpZDI2-YORLStnmcj24fYpGaJ0D0s32UWr1RIY20cfXz81QTNOLFipvPgkIBWtxw2mLl4sTpaCH19DNqRzrKPvy4SGRpTQ-_--fHsVeiMK9A1doyV1TkUn8SIeER7CEF7iaSlxrx1g2q8F_A5XWeZWneykYMkNTiTmQ',
    role: 'hunter',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p6',
    name: 'Valentina',
    isHost: false,
    isCurrentUser: false,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxTc4Gu7_y7t7MSDGq025fdCzK_YHfd-A68LFh72fJS_X3jBCY9HHkJbd6ER191WSO9bDGDaBLzkZ6bsryycNUSHxu9sFsIZczXuTeKLvt4aN885G_u-Cep_SCMhcM1-wM3h6TTjYqTrln7LI9HglRLYLzOGYmZsS9QhcW_uQ0J_2YF8ANrRzciCGb6E2KHZ2hpbQZ-5IwDy0wNhhg_m6Z2k9QjHXB-xhKEfgpFGVlQzQ17DY3D1PZsw',
    role: 'witch',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p7',
    name: 'Diego',
    isHost: false,
    isCurrentUser: false,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdzZCrKyduA1z9yTtMkduPe4lSuLaPtz7B3AagyQ_Ym6xZp_gJfmlAj5cOG9-TzJQiViNBVqzlXUQwQs3fkiVgiURbAJJmQK8TJZUYEzz7TL3ApS8wfJAb86JpG1C_JmWfxYhm8Nj2PpiSoPidgqKuCNn1NOP8h4FJWVt6LJGALLBlVxB225vjPg010x-nPlh1XPgfR1IiI7AzrBmYdsoZpa5OVEGMa1lTNtfonouJCVkm1q-v-utxpw',
    role: 'mute_drunkard',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p8',
    name: 'Lucía',
    isHost: false,
    isCurrentUser: false,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjBcccqgFMA3JwxKZR_whHrnNJmguLjpK7L-1-HWYDeAJzLMmArXImXSVD-Wj7lqGbkvMCskuEGXAsdAgnINS7VilhoUMp7Utcgp8oalGk16Cz4ZD-Ux_UN2aCsKPBD_OyxOIxsKV4ElF7SFb4g5_e1-IEKKfYK3lbsGf8kBxCPRpjfTVdVN943qhsbCndVvSvpReaIkY8gJDRjcfYRDh-InSoN3Of2oTnLToD1fG5ONeA1HqMj1AYuQ',
    role: 'little_girl',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p9',
    name: 'Marcos',
    isHost: false,
    isCurrentUser: false,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI4FIIMSEIayraAoUY1t_KMyzzrUom3xQV2HK0-xZ3l8T-mYUreyayk3PdAj8kMb2htvt2i0lFL1fyoNAfHUIWZWOyzNkBNcNE6I6b87QDdHXgDhZ_4UhoCM4sLXG5qVtsbo6HecvxiBW6kXGg9qR2p5qnCP4ptPeAx3GhBzumaiX22oxB3XF5ViYsvuYpkQd40kg8E4Ad_3SGu2jVNFJUgQWdDDTLDy37dfTukjRueyGiXzWRw3DdEw',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  // Additional players for 10 up to 25
  {
    id: 'p10',
    name: 'Beatriz',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa6ORFhSHL4JXpo1BOFCH-WxHK6UU4Jn0hY9td8o9dTGeq16d5kD0uHGTZ6nEq3U5qS1c7v28DkQiJYTp5NNujCiuZc22CY4_n9aAUocIJSN8piqwoZtHnJ1AGfc-fHOI-5ksC8OrTvC6eKY2g_OizEOM7kmP5wlo226hFv8GH_GEUC2cVbzX-hjVaKvUOz09Bu6OMfsG7fAD0CVog1WRcYMFOVsARAJLoGt3IExGqz_E0MLa_vtpfHw',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p11',
    name: 'Rodrigo',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf8WMjwM0R1LQOjZIkJSH0v3PGMkHiZ4lWRyWkPT8TNleYqqYliKP_XcfA-f6_nvZuDasv9pVG1nVWqHPkzBWMLUrlTdNss1pcynTwv1uKvLXi7v49yBd7G2dBFLqTQ--QcqIbuMVZzw0SY3NEL_TbAeZOtmCcfdb9NYV9jOU16i6_9x_JZWIdAH57f2LD63e0ZrzjtsQkX_cFF1VR2bAVL6xMmo8KKpkIUTZTrjXoFyr07VnATEAuTw',
    role: 'werewolf',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p12',
    name: 'Clara',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaICa67tp_F1zq7jF0la9-_z3o_4-Z7vXybzykIwKtMApDmubWimEfbrQDHXHHbX71VVAjgHoESXIwauPKJY6Eqr5Vob21mwRijtJcrjHL-i6qD-WOjGseGb4D71mI21TvRWBk6bSORD3J-UNp8p7wu0iP72FA2hkXTlRDDbEhGwsQL_eJaqwHqD3KnOzdSsfMXzeKtgh4pWASBA3otJKTTcg-DvyYzqMmSyLuTm13WmBO6dAD6IvWgg',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p13',
    name: 'Gonzalo',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDff9aW54Ydo9Z4jcwvyEUNrW1N17etUUDMDCeFGIjFFHtq6qySRJGVUOuiOcB1_8sSfBjmOfqlKQZ39pzgfcqWpZDI2-YORLStnmcj24fYpGaJ0D0s32UWr1RIY20cfXz81QTNOLFipvPgkIBWtxw2mLl4sTpaCH19DNqRzrKPvy4SGRpTQ-_--fHsVeiMK9A1doyV1TkUn8SIeER7CEF7iaSlxrx1g2q8F_A5XWeZWneykYMkNTiTmQ',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p14',
    name: 'Isabel',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxTc4Gu7_y7t7MSDGq025fdCzK_YHfd-A68LFh72fJS_X3jBCY9HHkJbd6ER191WSO9bDGDaBLzkZ6bsryycNUSHxu9sFsIZczXuTeKLvt4aN885G_u-Cep_SCMhcM1-wM3h6TTjYqTrln7LI9HglRLYLzOGYmZsS9QhcW_uQ0J_2YF8ANrRzciCGb6E2KHZ2hpbQZ-5IwDy0wNhhg_m6Z2k9QjHXB-xhKEfgpFGVlQzQ17DY3D1PZsw',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p15',
    name: 'Tomás',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdzZCrKyduA1z9yTtMkduPe4lSuLaPtz7B3AagyQ_Ym6xZp_gJfmlAj5cOG9-TzJQiViNBVqzlXUQwQs3fkiVgiURbAJJmQK8TJZUYEzz7TL3ApS8wfJAb86JpG1C_JmWfxYhm8Nj2PpiSoPidgqKuCNn1NOP8h4FJWVt6LJGALLBlVxB225vjPg010x-nPlh1XPgfR1IiI7AzrBmYdsoZpa5OVEGMa1lTNtfonouJCVkm1q-v-utxpw',
    role: 'werewolf',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p16',
    name: 'Aitana',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjBcccqgFMA3JwxKZR_whHrnNJmguLjpK7L-1-HWYDeAJzLMmArXImXSVD-Wj7lqGbkvMCskuEGXAsdAgnINS7VilhoUMp7Utcgp8oalGk16Cz4ZD-Ux_UN2aCsKPBD_OyxOIxsKV4ElF7SFb4g5_e1-IEKKfYK3lbsGf8kBxCPRpjfTVdVN943qhsbCndVvSvpReaIkY8gJDRjcfYRDh-InSoN3Of2oTnLToD1fG5ONeA1HqMj1AYuQ',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p17',
    name: 'Javier',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI4FIIMSEIayraAoUY1t_KMyzzrUom3xQV2HK0-xZ3l8T-mYUreyayk3PdAj8kMb2htvt2i0lFL1fyoNAfHUIWZWOyzNkBNcNE6I6b87QDdHXgDhZ_4UhoCM4sLXG5qVtsbo6HecvxiBW6kXGg9qR2p5qnCP4ptPeAx3GhBzumaiX22oxB3XF5ViYsvuYpkQd40kg8E4Ad_3SGu2jVNFJUgQWdDDTLDy37dfTukjRueyGiXzWRw3DdEw',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p18',
    name: 'Leonor',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa6ORFhSHL4JXpo1BOFCH-WxHK6UU4Jn0hY9td8o9dTGeq16d5kD0uHGTZ6nEq3U5qS1c7v28DkQiJYTp5NNujCiuZc22CY4_n9aAUocIJSN8piqwoZtHnJ1AGfc-fHOI-5ksC8OrTvC6eKY2g_OizEOM7kmP5wlo226hFv8GH_GEUC2cVbzX-hjVaKvUOz09Bu6OMfsG7fAD0CVog1WRcYMFOVsARAJLoGt3IExGqz_E0MLa_vtpfHw',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p19',
    name: 'Guillermo',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf8WMjwM0R1LQOjZIkJSH0v3PGMkHiZ4lWRyWkPT8TNleYqqYliKP_XcfA-f6_nvZuDasv9pVG1nVWqHPkzBWMLUrlTdNss1pcynTwv1uKvLXi7v49yBd7G2dBFLqTQ--QcqIbuMVZzw0SY3NEL_TbAeZOtmCcfdb9NYV9jOU16i6_9x_JZWIdAH57f2LD63e0ZrzjtsQkX_cFF1VR2bAVL6xMmo8KKpkIUTZTrjXoFyr07VnATEAuTw',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p20',
    name: 'Esperanza',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaICa67tp_F1zq7jF0la9-_z3o_4-Z7vXybzykIwKtMApDmubWimEfbrQDHXHHbX71VVAjgHoESXIwauPKJY6Eqr5Vob21mwRijtJcrjHL-i6qD-WOjGseGb4D71mI21TvRWBk6bSORD3J-UNp8p7wu0iP72FA2hkXTlRDDbEhGwsQL_eJaqwHqD3KnOzdSsfMXzeKtgh4pWASBA3otJKTTcg-DvyYzqMmSyLuTm13WmBO6dAD6IvWgg',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p21',
    name: 'Salvador',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDff9aW54Ydo9Z4jcwvyEUNrW1N17etUUDMDCeFGIjFFHtq6qySRJGVUOuiOcB1_8sSfBjmOfqlKQZ39pzgfcqWpZDI2-YORLStnmcj24fYpGaJ0D0s32UWr1RIY20cfXz81QTNOLFipvPgkIBWtxw2mLl4sTpaCH19DNqRzrKPvy4SGRpTQ-_--fHsVeiMK9A1doyV1TkUn8SIeER7CEF7iaSlxrx1g2q8F_A5XWeZWneykYMkNTiTmQ',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p22',
    name: 'Marina',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxTc4Gu7_y7t7MSDGq025fdCzK_YHfd-A68LFh72fJS_X3jBCY9HHkJbd6ER191WSO9bDGDaBLzkZ6bsryycNUSHxu9sFsIZczXuTeKLvt4aN885G_u-Cep_SCMhcM1-wM3h6TTjYqTrln7LI9HglRLYLzOGYmZsS9QhcW_uQ0J_2YF8ANrRzciCGb6E2KHZ2hpbQZ-5IwDy0wNhhg_m6Z2k9QjHXB-xhKEfgpFGVlQzQ17DY3D1PZsw',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p23',
    name: 'Bernardo',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdzZCrKyduA1z9yTtMkduPe4lSuLaPtz7B3AagyQ_Ym6xZp_gJfmlAj5cOG9-TzJQiViNBVqzlXUQwQs3fkiVgiURbAJJmQK8TJZUYEzz7TL3ApS8wfJAb86JpG1C_JmWfxYhm8Nj2PpiSoPidgqKuCNn1NOP8h4FJWVt6LJGALLBlVxB225vjPg010x-nPlh1XPgfR1IiI7AzrBmYdsoZpa5OVEGMa1lTNtfonouJCVkm1q-v-utxpw',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p24',
    name: 'Rosa',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjBcccqgFMA3JwxKZR_whHrnNJmguLjpK7L-1-HWYDeAJzLMmArXImXSVD-Wj7lqGbkvMCskuEGXAsdAgnINS7VilhoUMp7Utcgp8oalGk16Cz4ZD-Ux_UN2aCsKPBD_OyxOIxsKV4ElF7SFb4g5_e1-IEKKfYK3lbsGf8kBxCPRpjfTVdVN943qhsbCndVvSvpReaIkY8gJDRjcfYRDh-InSoN3Of2oTnLToD1fG5ONeA1HqMj1AYuQ',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
  {
    id: 'p25',
    name: 'Samuel',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI4FIIMSEIayraAoUY1t_KMyzzrUom3xQV2HK0-xZ3l8T-mYUreyayk3PdAj8kMb2htvt2i0lFL1fyoNAfHUIWZWOyzNkBNcNE6I6b87QDdHXgDhZ_4UhoCM4sLXG5qVtsbo6HecvxiBW6kXGg9qR2p5qnCP4ptPeAx3GhBzumaiX22oxB3XF5ViYsvuYpkQd40kg8E4Ad_3SGu2jVNFJUgQWdDDTLDy37dfTukjRueyGiXzWRw3DdEw',
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
  },
];

export const ROLE_DEFINITIONS: Record<RoleType, RoleInfo> = {
  alfa_werewolf: {
    type: 'alfa_werewolf',
    name: 'Hombre Lobo Alfa',
    category: 'SEÑOR OSCURO',
    categoryColor: 'bg-red-700 text-amber-200 border border-amber-400 font-bold',
    description: 'Líder de la manada. Puede escoger a un muerto y convertirlo en lobo.',
    details: 'Gobiernas la noche. Además de cazar junto a tus hermanos de luna, posees el rito prohibido de la resurrección: puedes resucitar a un fallecido en la hoguera o en la niebla y transformarlo en un nuevo Hombre Lobo.',
    quote: '"La muerte no es el final en mi bosque; es el renacer en la manada."',
    allegiance: 'werewolves',
    sealColor: '#dc2626',
  },
  werewolf: {
    type: 'werewolf',
    name: 'Hombre Lobo',
    category: 'MORTAL',
    categoryColor: 'bg-red-600 text-white font-bold',
    description: 'Cazan en silencio al amparo de la noche.',
    details: 'Al caer la medianoche, abres los ojos junto a tu manada. Acuerden en silencio una víctima inocente para devorarla. Durante el día, simula terror y confunde al concejo para evitar la horca.',
    quote: '"La luna llena no perdona la debilidad de la carne mortal."',
    allegiance: 'werewolves',
    sealColor: '#ef4444',
  },
  cupid: {
    type: 'cupid',
    name: 'Cupido',
    category: 'VÍNCULO ETERNO',
    categoryColor: 'bg-pink-600 text-white font-bold',
    description: 'Escoge a los dos novios. Si uno muere, el otro perece de tristeza.',
    details: 'En la primera noche, arrojas tus flechas doradas y unes el alma de dos aldeanos. A partir de ese instante se amarán en secreto: si uno de ellos perece por los lobos, poción o linchamiento, el otro se quita la vida de inmediato por dolor.',
    quote: '"Ni la muerte ni los colmillos quebrantarán el juramento de los amantes."',
    allegiance: 'village',
    sealColor: '#ec4899',
  },
  little_girl: {
    type: 'little_girl',
    name: 'La Niña Fizgona',
    category: 'INQUISITRIZ',
    categoryColor: 'bg-purple-600 text-amber-100 font-bold',
    description: 'Puede asomarse en la noche para espiar a los lobos.',
    details: 'Tu curiosidad es más fuerte que el miedo. Durante el despertar de los Hombres Lobo, puedes entornar los ojos y espiar quiénes son. Pero ten cautela: si un lobo nota tu mirada, pasarás a ser su presa inmediata.',
    quote: '"Vi sus ojos brillar entre los helechos... sé quiénes son."',
    allegiance: 'village',
    sealColor: '#a855f7',
  },
  mute_drunkard: {
    type: 'mute_drunkard',
    name: 'El Borracho Mudo',
    category: 'FOLCLORE',
    categoryColor: 'bg-amber-600 text-black font-bold',
    description: 'De día solo se expresa con señas y mímica. Si habla, muere.',
    details: 'Una mezcla de hidromiel sagrada y pavor te ha dejado sin habla. Durante el juicio diurno solo puedes gesticular mediante señas, mímica y gestos. Si pronuncias una sola palabra o haces ruido de noche, el hechizo te arrebatará la vida.',
    quote: '"🤫 (Señala desesperadamente hacia el molino haciendo gestos de garras)"',
    allegiance: 'village',
    sealColor: '#f59e0b',
  },
  doctor: {
    type: 'doctor',
    name: 'Doctor / Guardián',
    category: 'GUARDIÁN',
    categoryColor: 'bg-[#03b5d3] text-black font-bold',
    description: 'Salva a una víctima cada noche secreta con bálsamos benditos.',
    details: 'Conocedor de las hierbas protectoras y ungüentos bendecidos. Cada noche puedes elegir a un aldeano (o a ti mismo) para protegerlo. Si las bestias lo eligen, sobrevivirá a la cacería.',
    quote: '"Mientras mi lámpara arda, la muerte no cruzará ese umbral."',
    allegiance: 'village',
    sealColor: '#06b6d4',
  },
  seer: {
    type: 'seer',
    name: 'Vidente',
    category: 'ORÁCULO',
    categoryColor: 'bg-[#acedff] text-[#001f26] font-bold',
    description: 'Inspecciona el alma de 1 aldeano dormido.',
    details: 'Tus ojos trascienden la niebla y las apariencias terrenales. Cada noche puedes inspeccionar el alma secreta de un habitante para descubrir su verdadera naturaleza: bestia u hombre de bien.',
    quote: '"En la quietud de los sueños, las máscaras caen ante los ojos del oráculo."',
    allegiance: 'village',
    sealColor: '#38bdf8',
  },
  witch: {
    type: 'witch',
    name: 'La Bruja',
    category: 'ALQUIMISTA',
    categoryColor: 'bg-emerald-600 text-white font-bold',
    description: 'Posee 2 pociones: una cura milagrosa y un veneno letal.',
    details: 'Domina los misterios de la botica oscura. Dispone de dos elixires de un solo uso en la partida: la Poción de Curación (revive a la víctima atacada por los lobos) y la Poción de Veneno (elimina a cualquier sospechoso esa misma noche).',
    quote: '"Una gota para la vida eterna, otra gota para el reposo eterno."',
    allegiance: 'village',
    sealColor: '#10b981',
  },
  hunter: {
    type: 'hunter',
    name: 'El Cazador',
    category: 'JUSTICIERO',
    categoryColor: 'bg-amber-800 text-amber-100 font-bold',
    description: 'Al morir por cualquier causa, dispara su mosquete a un sospechoso.',
    details: 'Veterano de los bosques oscuros. Si eres linchado por la aldea o despedazado por las bestias, tienes derecho a un último disparo mortal antes de exhalar tu alma.',
    quote: '"Mi pulso no temblará, y me llevaré a uno de vosotros a la fosa."',
    allegiance: 'village',
    sealColor: '#b45309',
  },
  villager: {
    type: 'villager',
    name: 'Aldeano',
    category: 'POBLACIÓN',
    categoryColor: 'bg-[#ffb95f] text-[#2a1700] font-bold',
    description: 'Debaten y linchan durante el juicio diurno.',
    details: 'No posees artes mágicas ni garras afiladas, pero posees el don de la observación y el voto colectivo. Desentraña las mentiras, encuentra las contradicciones y lleva a los lobos al cadalso.',
    quote: '"Nuestra unión y palabra son el único fuego que purificará la villa."',
    allegiance: 'village',
    sealColor: '#f97316',
  },
};

export const INITIAL_DECK: DeckConfig = {
  werewolves: 1,
  alfa_werewolf: 1,
  doctor: 1,
  seer: 1,
  cupid: 1,
  little_girl: 1,
  mute_drunkard: 1,
  witch: 1,
  hunter: 0,
  villagers: 2,
  targetPlayers: 9, // starts at 9, configurable up to 25
};

export function calculateBalancedDeck(playerCount: number): DeckConfig {
  const count = Math.max(7, Math.min(25, playerCount));

  // Reglas estrictas solicitadas por el usuario:
  // - 1 Niña Fizgona (little_girl) obligatoria
  // - 1 Médico (doctor) obligatorio
  // - 1 Bruja (witch) obligatoria
  const little_girl = 1;
  const doctor = 1;
  const witch = 1;

  // - ~20% de Lobos (al menos 2: 1 Lobo Alfa + Lobos comunes)
  const totalWolves = Math.max(2, Math.round(count * 0.2));
  const alfa_werewolf = 1;
  const werewolves = totalWolves - 1;

  // - ~30% de Aldeanos comunes
  let villagers = Math.max(2, Math.round(count * 0.3));

  // - Restante se completa con Vidente, Cupido, Cazador, Borracho Mudo
  let remaining = count - (totalWolves + little_girl + doctor + witch + villagers);

  let seer = 0;
  let cupid = 0;
  let hunter = 0;
  let mute_drunkard = 0;

  if (remaining > 0) {
    seer = 1;
    remaining--;
  }
  if (remaining > 0) {
    cupid = 1;
    remaining--;
  }
  if (remaining > 0) {
    hunter = 1;
    remaining--;
  }
  if (remaining > 0) {
    mute_drunkard = 1;
    remaining--;
  }

  // Cualquier espacio adicional se asigna a aldeanos comunes
  if (remaining > 0) {
    villagers += remaining;
  } else if (remaining < 0) {
    villagers = Math.max(1, villagers + remaining);
  }

  // Asegurar cuadre exacto al total de jugadores
  const sum =
    werewolves +
    alfa_werewolf +
    doctor +
    seer +
    cupid +
    little_girl +
    mute_drunkard +
    witch +
    hunter +
    villagers;

  if (sum !== count) {
    villagers += count - sum;
  }

  return {
    werewolves,
    alfa_werewolf,
    doctor,
    seer,
    cupid,
    little_girl,
    mute_drunkard,
    witch,
    hunter,
    villagers,
    targetPlayers: count,
  };
}

export const INITIAL_ACCUSATIONS = [
  {
    id: 'acc1',
    author: 'Elena',
    target: 'Lucas',
    message: 'Vi a Lucas merodeando cerca de la arboleda cuando la niebla comenzó a descender...',
    timestamp: 'Hace 2 min',
    severity: 'medium' as const,
  },
  {
    id: 'acc2',
    author: 'Diego (El Mudo)',
    target: 'Sofía',
    message: '🤫👉 (Señala a Sofía, cruza las manos formando garras y tiembla de pánico)',
    timestamp: 'Hace 1 min',
    severity: 'high' as const,
    isGesture: true,
  },
  {
    id: 'acc3',
    author: 'Carlos',
    target: 'Elena',
    message: 'Como boticario de la villa, he visto miradas más sinceras que la tuya esta mañana.',
    timestamp: 'Hace 30s',
    severity: 'low' as const,
  },
];
