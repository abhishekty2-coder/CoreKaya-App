import { useState, useEffect } from "react";
import { 
  useGetCurrentSchedule, 
  useUpdateCurrentSchedule, 
  useListWorkouts,
  getGetCurrentScheduleQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function AdminSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: schedule, isLoading: scheduleLoading } = useGetCurrentSchedule();
  const { data: workouts = [], isLoading: workoutsLoading } = useListWorkouts();
  const updateSchedule = useUpdateCurrentSchedule();

  const [formData, setFormData] = useState<Record<string, number | null>>({
    mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        mon: schedule.mon,
        tue: schedule.tue,
        wed: schedule.wed,
        thu: schedule.thu,
        fri: schedule.fri,
        sat: schedule.sat,
        sun: schedule.sun,
      });
    }
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchedule.mutate({
      data: {
        startDate: schedule?.startDate || format(new Date(), "yyyy-MM-dd"),
        mon: formData.mon,
        tue: formData.tue,
        wed: formData.wed,
        thu: formData.thu,
        fri: formData.fri,
        sat: formData.sat,
        sun: formData.sun,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentScheduleQueryKey() });
        toast({ title: "Weekly schedule updated" });
      }
    });
  };

  if (scheduleLoading || workoutsLoading) return <div>Loading...</div>;

  const publishedWorkouts = workouts.filter(w => w.isPublished);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Weekly Schedule</h1>
      <p className="text-gray-500 mb-6">Set the curated workouts for the "Weekly Drop" view.</p>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-24 font-medium text-gray-700 capitalize">{day}</div>
              <select
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-navy focus:border-navy"
                value={formData[day] || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  [day]: e.target.value ? Number(e.target.value) : null 
                }))}
              >
                <option value="">-- Rest Day --</option>
                {publishedWorkouts.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.title} ({w.durationMin}m) - {w.category}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="pt-6 border-t border-gray-100 mt-6">
            <Button 
              type="submit" 
              isLoading={updateSchedule.isPending}
            >
              Save Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}