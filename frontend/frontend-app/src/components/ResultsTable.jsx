import { useNavigate } from "react-router-dom";

const ResultsTable = ({ results, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <p className="text-blue-400">Loading results...</p>;
  }

  if (!loading && results.length === 0) {
    return <p className="text-gray-400">No results found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/20">
            <th className="p-3">Title</th>
            <th className="p-3">Type</th>
            <th className="p-3">Inventor</th>
            <th className="p-3">Assignee</th>
            <th className="p-3">Jurisdiction</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => (
            <tr
              key={item.id}
              onClick={() => navigate(`/ip/${item.id}`)}
              className="border-b border-white/10 hover:bg-white/5 transition cursor-pointer"
            >
              <td className="p-3 text-blue-400">{item.title}</td>
              <td className="p-3">{item.type}</td>
              <td className="p-3">{item.inventor}</td>
              <td className="p-3">{item.assignee}</td>
              <td className="p-3">{item.jurisdiction}</td>
              <td className="p-3">{item.status}</td>
              <td className="p-3">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
