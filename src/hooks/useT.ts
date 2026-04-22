import { useLang } from '../contexts/LangContext';
import { I18N, type I18nKey } from '../data/i18n';

export function useT() {
  const { lang } = useLang();
  return function t(key: I18nKey): string {
    return I18N[lang][key];
  };
}
