import { makeProject } from '@motion-canvas/core';
import './global.css';

import opening from './scenes-mobile/opening?scene';
import adToLanding from './scenes-mobile/adToLanding?scene';
import customerFlow from './scenes-mobile/customerFlow?scene';
import realtimeAlert from './scenes-mobile/realtimeAlert?scene';
import portalLeads from './scenes-mobile/portalLeads?scene';
import portalStats from './scenes-mobile/portalStats?scene';
import features from './scenes-mobile/features?scene';
import closing from './scenes-mobile/closing?scene';

export default makeProject({
  scenes: [
    opening,
    adToLanding,
    customerFlow,
    realtimeAlert,
    portalLeads,
    portalStats,
    features,
    closing,
  ],
  settings: {
    size: { x: 1080, y: 1920 },
    background: '#0f172a',
  },
});
