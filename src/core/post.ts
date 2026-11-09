// Pipeline de renderização final. (Etapa A: render direto; o pós-processamento entra na etapa B1.)
import { R, S, cam } from './engine';
import type { Quality } from './config';

export const post = {
  quality: 'media' as Quality,
  init(q: Quality) { this.quality = q; },
  setQuality(q: Quality) { this.quality = q; },
  /** Quantos quadros renderizar antes de uma captura (efeitos temporais precisam acumular). */
  warmup() { return 1; },
  render(_dt: number) { R.render(S, cam); },
};
