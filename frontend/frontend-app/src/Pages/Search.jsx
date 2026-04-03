import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import FiltersPanel from "../components/FiltersPanel";
import ResultsTable from "../components/ResultsTable";
import DashboardLayout from "../components/layouts/DashboardLayout";

const Search = () => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    inventor: "",
    assignee: "",
    jurisdiction: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const dummyData = [
    {
      id: 1,
      title: "AI-based Medical Imaging System",
      type: "Patent",
      inventor: "Dr. John Smith",
      assignee: "MedTech Corp",
      jurisdiction: "USPTO",
      status: "Granted",
      date: "2022-05-10",
    },
    {
      id: 2,
      title: "Smart Agriculture Device",
      type: "Patent",
      inventor: "Priya Sharma",
      assignee: "AgroTech",
      jurisdiction: "WIPO",
      status: "Pending",
      date: "2023-01-15",
    },
  ];

  useEffect(() => {
    setLoading(true);

    let filtered = dummyData;

    if (query) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters.inventor) {
      filtered = filtered.filter((item) =>
        item.inventor.toLowerCase().includes(filters.inventor.toLowerCase())
      );
    }

    if (filters.assignee) {
      filtered = filtered.filter((item) =>
        item.assignee.toLowerCase().includes(filters.assignee.toLowerCase())
      );
    }

    if (filters.jurisdiction) {
      filtered = filtered.filter(
        (item) => item.jurisdiction === filters.jurisdiction
      );
    }

    // simulate API delay
    setTimeout(() => {
      setResults(filtered);
      setLoading(false);
    }, 600);

  }, [query, filters]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#020617] text-white p-10">

      <div className="mb-10">
        <h1 className="text-4xl font-bold">Global IP Search</h1>
        <p className="text-gray-400 mt-3">
          Search and analyze patents and trademarks worldwide.
        </p>
      </div>

      <SearchBar query={query} setQuery={setQuery} />

      <div className="grid grid-cols-4 gap-8 mt-8">

        <div className="col-span-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <FiltersPanel filters={filters} setFilters={setFilters} />
        </div>

        <div className="col-span-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <ResultsTable results={results} loading={loading} />
        </div>

      </div>
    </div>

    </DashboardLayout>

    
  );
};

export default Search;