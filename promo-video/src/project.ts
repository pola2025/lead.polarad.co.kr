import { makeProject } from '@motion-canvas/core';
import './global.css';

import opening from './scenes/opening?scene';
import adToLanding from './scenes/adToLanding?scene';
import customerFlow from './scenes/customerFlow?scene';
import realtimeAlert from './scenes/realtimeAlert?scene';
import portalLeads from './scenes/portalLeads?scene';
import portalStats from './scenes/portalStats?scene';
import features from './scenes/features?scene';
import closing from './scenes/closing?scene';

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
    size: { x: 3840, y: 2160 },
    background: '#0f172a',
  },
});
