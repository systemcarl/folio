import * as themeStore from '$lib/stores/theme';

export function isGraphic(src : string) {
  return src.endsWith('.svg');
}

export function renderGraphic(src : string) {
  return themeStore.getGraphics()[src] ?? '';
}

const useGraphics = () => {
  return {
    getGraphics : themeStore.getGraphics,
    setGraphics : themeStore.setGraphics,
    isGraphic,
    renderGraphic,
  };
};

export default useGraphics;
