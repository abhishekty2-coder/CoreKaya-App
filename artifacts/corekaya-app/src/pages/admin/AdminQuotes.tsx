import { useListQuotes, useUpdateQuoteStatus, getListQuotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function AdminQuotes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: quotes = [], isLoading } = useListQuotes();
  const updateQuote = useUpdateQuoteStatus();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateQuote.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQuotesQueryKey() });
        toast({ title: "Quote status updated" });
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Quotes</h1>
      
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium text-gray-500">Date</th>
              <th className="p-4 font-medium text-gray-500">Customer</th>
              <th className="p-4 font-medium text-gray-500">Product</th>
              <th className="p-4 font-medium text-gray-500 w-1/3">Message</th>
              <th className="p-4 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No quotes found.</td>
              </tr>
            ) : (
              quotes.map((q: any) => (
                <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {format(new Date(q.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{q.customerName}</div>
                    <div className="text-gray-500 text-xs">{q.customerEmail}</div>
                    {q.customerPhone && <div className="text-gray-500 text-xs">{q.customerPhone}</div>}
                  </td>
                  <td className="p-4 text-gray-900 font-medium">
                    {q.productName || "General Inquiry"}
                  </td>
                  <td className="p-4 text-gray-600 text-xs">
                    {q.message}
                  </td>
                  <td className="p-4">
                    <select
                      className={`text-xs font-bold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-navy ${
                        q.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        q.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}
                      value={q.status}
                      onChange={(e) => handleStatusChange(q.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}