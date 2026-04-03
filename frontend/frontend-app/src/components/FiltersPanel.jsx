import { useState } from "react";

const FiltersPanel = ({ filters, setFilters }) => {
  const [open, setOpen] = useState(false);
  const options = ["All", "WIPO", "USPTO", "EPO", "TMView"];

  const selectOption = (value) => {
    setFilters({ ...filters, jurisdiction: value === "All" ? "" : value });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Filters</h3>

      {/* Inventor */}
      <div>
        <label className="block text-sm mb-2 text-gray-300">Inventor</label>
        <input
          type="text"
          name="inventor"
          value={filters.inventor}
          onChange={(e) =>
            setFilters({ ...filters, inventor: e.target.value })
          }
          className="w-full p-2 rounded-lg bg-[#020617] border border-white/20 text-white"
        />
      </div>

      {/* Assignee */}
      <div>
        <label className="block text-sm mb-2 text-gray-300">Assignee</label>
        <input
          type="text"
          name="assignee"
          value={filters.assignee}
          onChange={(e) =>
            setFilters({ ...filters, assignee: e.target.value })
          }
          className="w-full p-2 rounded-lg bg-[#020617] border border-white/20 text-white"
        />
      </div>

      {/* Jurisdiction Dropdown */}
      <div className="relative">
        <label className="block text-sm mb-2 text-gray-300">Jurisdiction</label>

        <div
          onClick={() => setOpen(!open)}
          className="w-full p-2 rounded-lg bg-[#020617] border border-white/20 text-white cursor-pointer flex justify-between"
        >
          {filters.jurisdiction || "All"}
          <span>▲</span>
        </div>

        {open && (
          <div className="absolute bottom-full mb-2 w-full bg-[#020617] border border-white/20 rounded-lg shadow-lg">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => selectOption(option)}
                className="p-2 hover:bg-blue-600 cursor-pointer text-white"
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersPanel;