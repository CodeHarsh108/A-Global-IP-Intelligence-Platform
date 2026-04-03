const LogsTable = ({ logs, columns }) => {
  if (!logs.length) return <p className="text-gray-500">No logs found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-300">
        <thead>
          <tr className="text-left border-b border-white/10 text-gray-400">
            {columns.map((col) => (
              <th key={col.key} className="p-2">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b border-white/10 hover:bg-white/5 transition"
            >
              {columns.map((col) => (
                <td key={col.key} className="p-2">{log[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
