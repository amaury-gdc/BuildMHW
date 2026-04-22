import { ThemeProvider } from './contexts/ThemeContext';
import { LangProvider }  from './contexts/LangContext';
import { BuildProvider } from './contexts/BuildContext';

import Header     from './components/Header/Header';
import SlotGrid   from './components/SlotGrid/SlotGrid';
import RightPanel from './components/RightPanel/RightPanel';

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <BuildProvider>
          <div className="app">
            <Header />
            <main className="main">
              <section className="builder-section">
                <SlotGrid />
              </section>
              <aside className="side-right">
                <RightPanel />
              </aside>
            </main>
          </div>
        </BuildProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
