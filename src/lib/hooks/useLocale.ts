import * as localeStore from '$lib/stores/locale';

const useLocale = () => {
  return {
    getLocale : localeStore.getLocale,
    setLocale : localeStore.setLocale,
  };
};

export default useLocale;
