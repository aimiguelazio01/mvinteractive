import { SectionData, WorkItem } from '../types';

export const SECTION_ACCENTS: Record<string, { rgb: string; hex: string; hoverHex: string }> = {
  'section_01': { rgb: '180,140,80', hex: '#b48c50', hoverHex: '#d4a860' },  // warm amber
  'section_02': { rgb: '80,130,190', hex: '#5282be', hoverHex: '#6a9ad6' },  // cool steel blue
  'section_03': { rgb: '70,170,140', hex: '#46aa8c', hoverHex: '#5cc4a4' },  // teal green
  'section_04': { rgb: '130,90,180', hex: '#825ab4', hoverHex: '#9a72cc' },  // deep violet
  'section_05': { rgb: '60,160,110', hex: '#3ca06e', hoverHex: '#50b880' },  // emerald
  'section_06': { rgb: '180,100,100', hex: '#b46464', hoverHex: '#cc7c7c' },  // warm rose
};

export const WORK_COLORS = [
  { rgb: '0,242,255', hex: '#00f2ff', hoverHex: '#33f5ff' },   // electric cyan
  { rgb: '188,255,0', hex: '#bcff00', hoverHex: '#caff33' },   // acid green
  { rgb: '255,0,122', hex: '#ff007a', hoverHex: '#ff3395' },   // hot pink
  { rgb: '255,107,0', hex: '#ff6b00', hoverHex: '#ff8933' },   // safety orange
  { rgb: '188,0,255', hex: '#bc00ff', hoverHex: '#c933ff' },   // royal purple
  { rgb: '255,234,0', hex: '#ffea00', hoverHex: '#ffee33' },   // cyber yellow
  { rgb: '255,0,0', hex: '#ff0000', hoverHex: '#ff3333' },     // deep crimson
  { rgb: '0,210,255', hex: '#00d2ff', hoverHex: '#33dbff' },   // ice blue
  { rgb: '255,110,200', hex: '#ff6ec8', hoverHex: '#ff8bd3' }, // soft pink
  { rgb: '100,255,180', hex: '#64ffb4', hoverHex: '#83ffc3' }, // mint
];

export const WORKS_INDEX: WorkItem[] = [
  {
    id: 'w1',
    title: 'APPLE HARMONICS',
    description: 'A playful project that turns real apples into piano keys. Touching the apples plays musical notes, while a projected 3D apple on screen mimics your hand movements. It\'s a fun blend of nature and technology that shows how everyday objects can come to life.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/9d2922a9-4e5a-4525-8d05-0e3125be754a?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/appleharmonics/index.html'
  },
  {
    id: 'w2',
    title: 'ROCKTOUCH POSTER',
    description: 'An interactive poster that you can play like a real guitar. Touch the illustrated guitar strings to hear chords, or tap the speakers to play songs from featured rock bands. It combines graphic design and touch technology into a musical experience.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/cf77af7f-ca47-4a8b-b944-45c6fe3c8eb3?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/rocktouch/code.html'
  },
  {
    id: 'w3',
    title: 'TOUCHSTONE CATALOG',
    description: 'A physical catalog of stone samples connected to a screen. Touching any real stone immediately displays its detailed 3D version on the screen, letting you explore different design materials in a hands-on way.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/d7781688-242b-40ba-9d7a-ef77c558a697?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/touchstone/index.html'
  },
  {
    id: 'w4',
    title: 'ARCHSYNC MODEL',
    description: 'A physical, 3D-printed building miniature synced with a screen. Turning the physical model rotates the virtual building on the screen in real time, and lifting off floors shows the room layouts instantly.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/cadd146c-d63e-473d-a1e2-9e8ba0a0d4e6?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/archsync_model/archsync_hero.html'
  },
  {
    id: 'w5',
    title: 'LIVESPACE',
    description: 'An interactive virtual home tour. You can walk through the house, customize the furniture and colors in real time, and see how the sunlight changes at different times of day.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/7ce0e237-7f69-403e-990d-8e5ed7005a45?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/livespace/code.html'
  },
  {
    id: 'w6',
    title: 'GREENHAVEN INTERACTIVE',
    description: 'A beautiful 3D walkthrough of a forest cabin. Change furniture layouts, wall colors, and lighting to see updates instantly against a realistic woodland backdrop.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/4f613faf-a1f8-4505-892e-2a92a6288309?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/greenhaven/code.html'
  },
  {
    id: 'w7',
    title: 'ORBITARIUM INTERACTIVE',
    description: 'A 3D solar system controlled with your hands. Fly between planets using simple hand gestures in the air, and watch educational videos about space.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/67ba8e61-32a5-44bf-a110-a635ec840c06?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/solarsystem/index.html'
  },
  {
    id: 'w8',
    title: 'SKETCHMAGIC',
    description: 'A drawing app for kids that uses AI to bring sketches to life. Waves of your hands in front of sensors turn simple outlines into cute cartoon monsters or colorful stars instantly.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/6c067489-8672-4e37-a042-6c1a52474c78?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/sketchmagic/index.html'
  },
  {
    id: 'w10',
    title: 'GHOSTVIEW',
    description: 'An interactive 3D showroom for the Rolls-Royce Ghost. Customize paint colors, explore the luxury interior, and view the car in different settings like studio lights or city streets.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/3fc8c5e8-84a2-466a-b9e6-0d022d51005e?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/rolls_royce/code.html'
  },
  {
    id: 'w12',
    title: 'VASEMOTION',
    description: 'A custom 3D-printed vase presented through video animations. The animation highlights its curves and texture, showing how physical crafting and digital art work together.',
    mediaUrl: 'https://player.mediadelivery.net/embed/625906/42b64c18-0390-4920-9964-d2c9384a981c?autoplay=true&loop=true&muted=true&preload=true&responsive=true',
    mediaType: 'iframe',
    externalLink: '/vasemotion/index.html'
  },
];

export const SECTIONS: SectionData[] = [
  {
    id: 'section_01',
    title: 'INTERACTIVE SURFACES & MOTION CONTROLS',
    backgroundText: ['TOUCH', 'MOVE', 'CONTROL'],
    description: [
      'TOUCH-SENSITIVE SURFACES',
      'TAP & SWIPE INTERFACES',
      'CAMERA GESTURE CONTROLS',
      'BODY MOVEMENT SENSORS'
    ],
    videoPoster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4'
  },
  {
    id: 'section_02',
    title: 'REAL-TIME 3D VISUALIZATION',
    backgroundText: ['INTERACTIVE', 'WORLDS', 'IN MOTION'],
    description: [
      'VIRTUAL WALKTHROUGHS',
      'CUSTOM DECOR & STYLING',
      'SMART SCALE MODELS',
      'FIRST-PERSON EXPLORATION'
    ],
    videoPoster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    videoUrl: 'https://videos.pexels.com/video-files/20770858/20770858-uhd_2560_1440_60fps.mp4'
  },
  {
    id: 'section_03',
    title: 'CONNECTING REAL OBJECTS TO THE DIGITAL WORLD',
    backgroundText: ['BRIDGING', 'MATTER', 'AND PIXELS'],
    description: [
      'LIVE DIGITAL REPLICAS',
      'PHYSICAL CONTROLLERS',
      'LIGHT PROJECTION ON OBJECTS',
      'PHYSICAL-DIGITAL HARMONY'
    ],
    videoPoster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://videos.pexels.com/video-files/852422/852422-hd_1920_1080_30fps.mp4'
  },
  {
    id: 'section_04',
    title: 'CREATING WITH AI',
    backgroundText: ['SYSTEMS THAT', 'CREATE', 'WITH YOU'],
    description: [
      'AI INTERACTIVE WEBPAGES',
      'LIVE-ART PATTERNS',
      'ART WITH CODE',
      'SMART RESPONSIVE LAYOUTS'
    ],
    videoPoster: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop',
    videoUrl: 'https://videos.pexels.com/video-files/3141208/3141208-uhd_2560_1440_25fps.mp4'
  },
  {
    id: 'section_05',
    title: '3D GENERALIST',
    backgroundText: ['FORM', 'MOTION', 'AND', 'SIMULATION'],
    description: [
      '3D MODELING',
      'UVS, TEXTURING & RENDERING',
      '3D TRACKING',
      'LOOK DEVELOPMENT',
      'VFX & MOTION DESIGN'
    ],
    videoPoster: 'https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=2574&auto=format&fit=crop',
    videoUrl: 'https://videos.pexels.com/video-files/5527739/5527739-uhd_2560_1440_25fps.mp4'
  },
  {
    id: 'section_06',
    title: '3D PRINTING & DESIGN',
    backgroundText: ['FROM DIGITAL', 'TO PHYSICAL'],
    description: [
      '3D PRINTING',
      'DIGITAL CRAFTING',
      'BUILDING PROTOTYPES',
      'PRODUCT DESIGN'
    ],
    videoPoster: 'https://images.unsplash.com/photo-1631557022789-9828d5d4d385?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://videos.pexels.com/video-files/3845070/3845070-uhd_2560_1440_30fps.mp4'
  }
];

export const INTEL_DATA: Record<string, { description: string, image?: string, video?: string }> = {
  'TOUCH-SENSITIVE SURFACES': {
    description: 'SURFACES THAT DETECT PHYSICAL TOUCH USING SMART SENSORS.\nTHEY TURN ORDINARY OBJECTS INTO RESPONSIVE DIGITAL CONTROLLERS.',
    video: '/assets/videos/capacitive_sensors.mp4'
  },
  'TAP & SWIPE INTERFACES': {
    description: 'SCREENS AND PANEL SURFACES THAT RESPOND INSTANTLY TO TAPS AND GESTURES, MAKING DIGITAL NAVIGATION FEEL NATURAL AND IMMEDIATE.',
    video: '/assets/videos/touch_interfaces.mp4'
  },
  'CAMERA GESTURE CONTROLS': {
    description: 'CAMERAS THAT READ THE POSITION AND SHAPE OF YOUR HANDS, LETTING YOU INTERACT WITH SCREENS IN THE AIR WITHOUT TOUCHING A PHYSICAL DEVICE.',
    video: '/assets/videos/hand_tracking.mp4'
  },
  'BODY MOVEMENT SENSORS': {
    description: 'INTELLIGENT SENSORS THAT REACT TO HOW A PERSON MOVES IN A SPACE, AUTOMATICALLY CHANGING THE VISUALS AND SOUNDS AROUND THEM.',
    video: '/assets/videos/motion_sensing.mp4'
  },
  'VIRTUAL WALKTHROUGHS': {
    description: 'FULLY EXPLORABLE 3D SIMULATIONS OF SPACES AND HOUSES.\nUSERS CAN FREELY WALK AROUND AND CHANGE DECORATIONS, FURNITURE, AND STYLES ON THE FLY.',
    video: '/assets/videos/interactive_int_ext.mp4'
  },
  'CUSTOM DECOR & STYLING': {
    description: 'INTERACTIVE CONTROLS TO SWAP WALL COLORS, FLOORS, AND TEXTURES INSTANTLY, GIVING AN IMMEDIATE SENSE OF HOW DIFFERENT DESIGN CHOICES LOOK.',
    video: '/assets/videos/design_exploration.mp4'
  },
  'SMART SCALE MODELS': {
    description: 'PHYSICAL 3D-PRINTED MINIATURES CONNECTED TO SCREENS.\nROTATING AND INTERACTING WITH THE REAL MODEL AUTOMATICALLY ROTATES THE VIRTUAL SCENE.',
    video: '/assets/videos/physical_digital_models.mp4'
  },
  'FIRST-PERSON EXPLORATION': {
    description: 'EXPERIENCES THAT PUT THE USER INSIDE THE 3D WORLD, DRIVING ENGAGEMENT THROUGH NATURAL CONTROLS AND A RESPONSIVE SENSE OF DEPTH.',
    video: '/assets/videos/immersive_experiences.mp4'
  },
  'LIVE DIGITAL REPLICAS': {
    description: 'VIRTUAL 3D CLONES OF PHYSICAL OBJECTS.\nANY CHANGE TO THE PHYSICAL STATE IS INSTANTLY UPDATED AND DISPLAYED ON ITS VIRTUAL COUNTERPART.',
    video: '/assets/videos/digital_twins.mp4'
  },
  'PHYSICAL CONTROLLERS': {
    description: 'USING REAL, PHYSICAL OBJECTS AS HANDS-ON BUTTONS OR DIALS TO INTERACT DIRECTLY WITH SOFTWARE AND GAMES.',
    video: '/assets/videos/tangible_interfaces.mp4'
  },
  'LIGHT PROJECTION ON OBJECTS': {
    description: 'PROJECTING VISUALS PRECISELY ONTO 3D SURFACES OR OBJECTS, CREATING THE ILLUSION OF MOTION AND ALIVE COLOR ON THE PHYSICAL SHAPE.',
    video: '/assets/videos/projection_mapping.mp4'
  },
  'PHYSICAL-DIGITAL HARMONY': {
    description: 'A ZERO-DELAY CONNECTION BETWEEN DOING SOMETHING IN THE PHYSICAL WORLD AND SEEING ITS EFFECT IN THE DIGITAL WORLD.',
    video: '/assets/videos/physical_digital_sync.mp4'
  },
  'AI INTERACTIVE WEBPAGES': {
    description: 'DEVELOPING WEB PAGES THAT USE ARTIFICIAL INTELLIGENCE TO INTERACT, ADAPT, AND GENERATE CONTENTS IN REAL TIME BASED ON USER INPUTS.',
    video: '/assets/videos/ai_image_generation.mp4'
  },
  'LIVE-ART PATTERNS': {
    description: 'LIVE ART THAT IS CONTINUOUSLY CALCULATED BY A COMPUTER, RESPONDING DYNAMICALLY TO HUMAN TOUCH AND AUDIO INPUTS.',
    video: '/assets/videos/generative_visuals.mp4'
  },
  'ART WITH CODE': {
    description: 'USING COMPUTER PROGRAMMING NOT JUST FOR UTILITY, BUT TO INVENT UNIQUE VISUAL EXPERIENCES, LIGHT SHOWS, AND INTERACTIVE ARTWORKS.',
    video: '/assets/videos/creative_coding.mp4'
  },
  'SMART RESPONSIVE LAYOUTS': {
    description: 'WEBSITES AND APP SCREEN LAYOUTS THAT AUTOMATICALLY REORGANIZE AND CHANGE TO SUIT HOW A VISITOR IS CURRENTLY INTERACTING.',
    video: '/assets/videos/adaptive_user_interfaces.mp4'
  },
  '3D MODELING': {
    description: '3D MODELING CREATES DIGITAL REPRESENTATIONS OF OBJECTS, SPACES, AND FORMS.\nIT PROVIDES THE FOUNDATION FOR VISUALIZATION, ANIMATION, AND INTERACTIVE EXPERIENCES.',
    video: '/assets/videos/3d_modeling.mp4'
  },
  'UVS, TEXTURING & RENDERING': {
    description: 'UVS, TEXTURING, AND RENDERING WORK TOGETHER TO DEFINE SURFACE DETAIL, MATERIAL QUALITY, AND LIGHT RESPONSE.\nTHEY TRANSFORM 3D MODELS INTO POLISHED, PHOTOREAL, OR STYLIZED VISUAL OUTPUT.',
    video: '/assets/videos/uvs_texturing.mp4'
  },
  '3D TRACKING': {
    description: '3D TRACKING CAPTURES CAMERA OR OBJECT MOTION TO ALIGN DIGITAL CONTENT WITH REAL-WORLD FOOTAGE.\nIT ENABLES SEAMLESS INTEGRATION OF 3D ELEMENTS INTO LIVE-ACTION ENVIRONMENTS.',
    video: '/assets/videos/3d_tracking.mp4'
  },
  'LOOK DEVELOPMENT': {
    description: 'LOOK DEVELOPMENT DEFINES THE VISUAL IDENTITY OF A 3D SCENE THROUGH MATERIALS, LIGHTING, AND COLOR.\nIT SHAPES MOOD, STYLE, AND CONSISTENCY ACROSS VISUAL EXPERIENCES.',
    video: '/assets/videos/look_development.mp4'
  },
  'VFX & MOTION DESIGN': {
    description: 'VFX AND MOTION DESIGN ADD DYNAMIC VISUAL EFFECTS AND MOVEMENT TO DIGITAL CONTENT.\nTHEY ENHANCE STORYTELLING, RHYTHM, AND VISUAL IMPACT ACROSS MEDIA.',
    video: '/assets/videos/vfx_motion_design.mp4'
  },
  '3D PRINTING': {
    description: 'USING A 3D PRINTER TO CREATE REAL, SOLID PLASTIC OR RESIN OBJECTS DIRECTLY FROM COMPUTER DESIGNS.',
    video: '/assets/videos/3d_printing.mp4'
  },
  'DIGITAL CRAFTING': {
    description: 'USING COMPUTER-GUIDED MACHINERY (LIKE LASER CUTTERS AND 3D PRINTERS) TO MANUFACTURE CUSTOM PHYSICAL PARTS.',
    video: '/assets/videos/digital_fabrication.mp4'
  },
  'BUILDING PROTOTYPES': {
    description: 'CREATING QUICK, RAW PHYSICAL MODELS OF AN OBJECT OR PRODUCT TO TEST HOW IT FEELS IN THE HAND AND HOW IT WORKS.',
    video: '/assets/videos/physical_prototyping.mp4'
  },
  'PRODUCT DESIGN': {
    description: 'THE ENTIRE PROCESS OF DESIGNING BEAUTIFUL, USEFUL PHYSICAL PRODUCTS — FROM HOUSEHOLD GADGETS TO CUSTOM FURNITURE.',
    video: '/assets/videos/object_design.mp4'
  }
};
