import { useState } from "react";
import { 
  useListWorkouts, 
  useCreateWorkout, 
  useUpdateWorkout, 
  useDeleteWorkout,
  getListWorkoutsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminWorkouts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: workouts = [], isLoading } = useListWorkouts();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "", instructor: "", category: "Mat Lab", difficulty: "All Levels", durationMin: 30, equipment: "", thumbnailUrl: "", videoUrl: "", description: "", isPublished: false, tags: ""
  });

  const resetForm = () => {
    setFormData({ title: "", instructor: "", category: "Mat Lab", difficulty: "All Levels", durationMin: 30, equipment: "", thumbnailUrl: "", videoUrl: "", description: "", isPublished: false, tags: "" });
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEdit = (workout: any) => {
    setFormData({
      title: workout.title,
      instructor: workout.instructor,
      category: workout.category,
      difficulty: workout.difficulty,
      durationMin: workout.durationMin,
      equipment: workout.equipment.join(", "),
      thumbnailUrl: workout.thumbnailUrl,
      videoUrl: workout.videoUrl || "",
      description: workout.description,
      isPublished: workout.isPublished,
      tags: workout.tags.join(", ")
    });
    setEditingId(workout.id);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      equipment: formData.equipment.split(",").map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(",").map(s => s.trim()).filter(Boolean),
      videoUrl: formData.videoUrl || null
    };

    if (editingId) {
      updateWorkout.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWorkoutsQueryKey() });
          toast({ title: "Workout updated" });
          resetForm();
        }
      });
    } else {
      createWorkout.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWorkoutsQueryKey() });
          toast({ title: "Workout created" });
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deleteWorkout.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWorkoutsQueryKey() });
          toast({ title: "Workout deleted" });
        }
      });
    }
  };

  const togglePublish = (id: number, currentStatus: boolean) => {
    updateWorkout.mutate({ id, data: { isPublished: !currentStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWorkoutsQueryKey() });
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Workouts</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Workout
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Workout' : 'New Workout'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm mb-1">Title</label><input required className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Instructor</label><input required className="w-full border p-2 rounded" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Category</label><input required className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Difficulty</label><input required className="w-full border p-2 rounded" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Duration (min)</label><input type="number" required className="w-full border p-2 rounded" value={formData.durationMin} onChange={e => setFormData({...formData, durationMin: Number(e.target.value)})} /></div>
              <div><label className="block text-sm mb-1">Equipment (comma separated)</label><input required className="w-full border p-2 rounded" value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Thumbnail URL</label><input required className="w-full border p-2 rounded" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Video URL (optional)</label><input className="w-full border p-2 rounded" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} /></div>
              <div className="col-span-2"><label className="block text-sm mb-1">Description</label><textarea required className="w-full border p-2 rounded" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              <div className="col-span-2"><label className="block text-sm mb-1">Tags (comma separated)</label><input className="w-full border p-2 rounded" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} /></div>
              <div className="col-span-2 flex items-center">
                <input type="checkbox" id="isPub" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} className="mr-2" />
                <label htmlFor="isPub">Published</label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" isLoading={createWorkout.isPending || updateWorkout.isPending}>Save Workout</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-medium text-gray-500">Workout</th>
                <th className="p-4 font-medium text-gray-500">Category</th>
                <th className="p-4 font-medium text-gray-500">Duration</th>
                <th className="p-4 font-medium text-gray-500">Status</th>
                <th className="p-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w: any) => (
                <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={w.thumbnailUrl} className="w-10 h-10 rounded object-cover" alt="" />
                    <div>
                      <div className="font-bold text-gray-900">{w.title}</div>
                      <div className="text-gray-500 text-xs">{w.instructor}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{w.category}</td>
                  <td className="p-4 text-gray-600">{w.durationMin}m</td>
                  <td className="p-4">
                    <button onClick={() => togglePublish(w.id, w.isPublished)} className={`px-2 py-1 rounded text-xs font-bold ${w.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {w.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(w)} className="p-1 text-gray-400 hover:text-navy"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(w.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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