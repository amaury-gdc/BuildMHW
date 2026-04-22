import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { EquippedBuild, Slot } from '../types';

const LS_BUILD_KEY = 'wilds-builder-build';
const LS_NAME_KEY  = 'wilds-builder-name';

const EMPTY_DECOS: EquippedBuild['decos'] = {
  weapon:   [null, null, null],
  head:     [null, null, null],
  chest:    [null, null, null],
  arms:     [null, null, null],
  waist:    [null, null, null],
  legs:     [null, null, null],
  talisman: [null, null, null],
};

const DEFAULT_BUILD: EquippedBuild = {
  weapon:   'w147',  // Volto-hache chrono (Charge Blade R8)
  head:     'h582',  // Cache-œil Roi-dragon α (Arkveld R8)
  chest:    'c22',   // Cotte As de la Guilde α
  arms:     'a23',   // Avant-bras As de la Guilde α
  waist:    'wa24',  // Tassette As de la Guilde α
  legs:     'l25',   // Bottes As de la Guilde α
  talisman: 't179',  // Talisman de fureur III
  decos:    { ...EMPTY_DECOS },
};

function loadBuild(): EquippedBuild {
  try {
    const raw = localStorage.getItem(LS_BUILD_KEY);
    if (raw) return JSON.parse(raw) as EquippedBuild;
  } catch {
    // données corrompues → fallback sur le build par défaut
  }
  return DEFAULT_BUILD;
}

function loadName(): string {
  try {
    const raw = localStorage.getItem(LS_NAME_KEY);
    if (raw !== null) return raw;
  } catch {
    // données corrompues → fallback
  }
  return 'As de la Guilde';
}

interface BuildContextValue {
  build:        EquippedBuild;
  equip:        (slot: Slot, itemId: string | null) => void;
  setDeco:      (slot: Slot, index: 0 | 1 | 2, decoId: string | null) => void;
  buildName:    string;
  setBuildName: (name: string) => void;
}

const BuildContext = createContext<BuildContextValue | null>(null);

export function BuildProvider({ children }: { children: ReactNode }) {
  const [build, setBuild]         = useState<EquippedBuild>(loadBuild);
  const [buildName, setBuildName] = useState<string>(loadName);

  useEffect(() => {
    localStorage.setItem(LS_BUILD_KEY, JSON.stringify(build));
  }, [build]);

  useEffect(() => {
    localStorage.setItem(LS_NAME_KEY, buildName);
  }, [buildName]);

  const equip = (slot: Slot, itemId: string | null) => {
    // Vider les décos du slot quand on change l'item
    setBuild(prev => ({
      ...prev,
      [slot]: itemId,
      decos: { ...prev.decos, [slot]: [null, null, null] },
    }));
  };

  const setDeco = (slot: Slot, index: 0 | 1 | 2, decoId: string | null) => {
    setBuild(prev => {
      const slotDecos = [...prev.decos[slot]] as [string | null, string | null, string | null];
      slotDecos[index] = decoId;
      return { ...prev, decos: { ...prev.decos, [slot]: slotDecos } };
    });
  };

  return (
    <BuildContext.Provider value={{ build, equip, setDeco, buildName, setBuildName }}>
      {children}
    </BuildContext.Provider>
  );
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error('useBuild doit être utilisé dans BuildProvider');
  return ctx;
}
