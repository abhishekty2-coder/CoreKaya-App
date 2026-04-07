import { useState } from "react";
import { 
  useListProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  getListProductsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products = [], isLoading } = useListProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "", category: "Large Equipment", imageUrl: "", affiliateUrl: "", priceDisplay: "", description: "", isFeatured: false, isPublished: false
  });

  const resetForm = () => {
    setFormData({ name: "", category: "Large Equipment", imageUrl: "", affiliateUrl: "", priceDisplay: "", description: "", isFeatured: false, isPublished: false });
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      affiliateUrl: product.affiliateUrl,
      priceDisplay: product.priceDisplay,
      description: product.description,
      isFeatured: product.isFeatured,
      isPublished: product.isPublished
    });
    setEditingId(product.id);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Product updated" });
          resetForm();
        }
      });
    } else {
      createProduct.mutate({ data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Product created" });
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Product deleted" });
        }
      });
    }
  };

  const toggleFeature = (id: number, current: boolean) => {
    updateProduct.mutate({ id, data: { isFeatured: !current } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); }
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm mb-1">Name</label><input required className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Category</label><input required className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Price Display (e.g. $1,999)</label><input required className="w-full border p-2 rounded" value={formData.priceDisplay} onChange={e => setFormData({...formData, priceDisplay: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Image URL</label><input required className="w-full border p-2 rounded" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} /></div>
              <div className="col-span-2"><label className="block text-sm mb-1">Affiliate/Link URL</label><input required className="w-full border p-2 rounded" value={formData.affiliateUrl} onChange={e => setFormData({...formData, affiliateUrl: e.target.value})} /></div>
              <div className="col-span-2"><label className="block text-sm mb-1">Description</label><textarea required className="w-full border p-2 rounded" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              <div className="col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} /> Published</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} /> Featured</label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" isLoading={createProduct.isPending || updateProduct.isPending}>Save Product</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-medium text-gray-500">Product</th>
                <th className="p-4 font-medium text-gray-500">Category</th>
                <th className="p-4 font-medium text-gray-500">Price</th>
                <th className="p-4 font-medium text-gray-500">Status</th>
                <th className="p-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.imageUrl} className="w-10 h-10 rounded object-cover" alt="" />
                    <div className="font-bold text-gray-900">{p.name}</div>
                  </td>
                  <td className="p-4 text-gray-600">{p.category}</td>
                  <td className="p-4 text-gray-600">{p.priceDisplay}</td>
                  <td className="p-4 flex gap-2 items-center h-full">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <button onClick={() => toggleFeature(p.id, p.isFeatured)} className={`p-1 rounded-full ${p.isFeatured ? 'text-yellow-500' : 'text-gray-300'}`}>
                      <Star className="w-4 h-4" fill={p.isFeatured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="p-1 text-gray-400 hover:text-navy"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}