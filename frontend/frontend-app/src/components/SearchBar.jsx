import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ query, setQuery }) => {
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // If the user is not on the search page, navigate there with the query
      // If they are already there, the local state update is enough
      if (window.location.pathname !== "/search") {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div className="relative w-full max-w-xl group">
      {/* Search Icon */}
      <Search 
        size={18} 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" 
      />
      
      <input
        type="text"
        placeholder="Search patents, trademarks, or node IDs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#0f1219] border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm font-medium"
      />
      
      {/* Keyboard Shortcut Indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex gap-1 items-center pointer-events-none">
        <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-black text-slate-500">
          ENTER
        </kbd>
      </div>
    </div>
  );
};

export default SearchBar;