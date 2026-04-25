import { ThemeProvider }    from './contexts/ThemeContext';
import { LangProvider }     from './contexts/LangContext';
import { BuildProvider }    from './contexts/BuildContext';
import { WishlistProvider } from './contexts/WishlistContext';

import Header        from './components/Header/Header';
import SlotGrid      from './components/SlotGrid/SlotGrid';
import RightPanel    from './components/RightPanel/RightPanel';
import WishlistPanel from './components/Wishlist/WishlistPanel';

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <BuildProvider>
          <WishlistProvider>
            <div className="app">
              <Header />
              <main className="main">
                <section className="builder-section">
                  <WishlistPanel />
                  <SlotGrid />
                </section>
                <aside className="side-right">
                  <RightPanel />
                </aside>
              </main>
            </div>
          </WishlistProvider>
        </BuildProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
