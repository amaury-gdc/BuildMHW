import { ThemeProvider } from './contexts/ThemeContext';
import { LangProvider }  from './contexts/LangContext';
import { BuildProvider } from './contexts/BuildContext';

import Header       from './components/Header/Header';
import SlotGrid     from './components/SlotGrid/SlotGrid';
import MetaPanel    from './components/MetaPanel/MetaPanel';
import SetBonusPanel from './components/SetBonusPanel/SetBonusPanel';
import StatsPanel   from './components/StatsPanel/StatsPanel';
import SkillsPanel  from './components/SkillsPanel/SkillsPanel';

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <BuildProvider>
          <div className="app">
            <Header />
            <main className="main">
              <aside className="side-left">
                <MetaPanel />
                <SetBonusPanel />
              </aside>

              <section>
                <SlotGrid />
              </section>

              <aside className="side-right">
                <StatsPanel />
                <SkillsPanel />
              </aside>
            </main>
          </div>
        </BuildProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
