import AdminDashboard from "@/components/(common)/dashboard-page/AdminDashboard";
import PageHeader from "@/components/sections/PageHeader";

const Dashboard = () => {
  return (
    <main className="space-y-6">
      <PageHeader />
      <section>
        <AdminDashboard />
      </section>
    </main>
  );
};

export default Dashboard;
