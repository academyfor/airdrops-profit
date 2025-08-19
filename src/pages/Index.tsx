import { CryptoDashboard } from '@/components/dashboard/CryptoDashboard';
import { getMockData } from '@/utils/dataParser';

const Index = () => {
  const dashboardData = getMockData();

  return <CryptoDashboard data={dashboardData} />;
};

export default Index;
