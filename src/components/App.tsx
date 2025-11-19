import Navigation from './Navigation';
import BillCalculator from './BillCalculator';
import ResidentsManager from './residents/ResidentsManager';

export default function App() {
  return (
    <Navigation>
      {(activeTab, language) => {
        if (activeTab === 'bills') {
          return <BillCalculator language={language} />;
        } else {
          return <ResidentsManager language={language} />;
        }
      }}
    </Navigation>
  );
}
