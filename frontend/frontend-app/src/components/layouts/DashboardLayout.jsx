import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">

      {/* Sidebar */}
      <Sidebar/>

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar/>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;