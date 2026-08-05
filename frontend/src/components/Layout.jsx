import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-[#05070D]">

      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <main
        className="
          flex-1
          h-screen
          overflow-y-scroll
          scrollbar-hide
        "
      >
        <div className="max-w-7xl mx-auto p-12 pb-40 text-white">
          {children}
        </div>
        
      </main>

    </div>
    
  );
}

export default Layout;