import AdminStatisticsSection from "./AdminStatisticsSection";
import ChartAreaInteractiveSection from "./ChartAreaInteractiveSection";

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <AdminStatisticsSection />
      <ChartAreaInteractiveSection />
    </div>
  );
};

export default AdminDashboard;
