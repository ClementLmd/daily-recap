import { useState } from "react";

interface ActivityFormProps {
  onSubmit: (activityName: string) => void;
}

export default function ActivityForm({ onSubmit }: ActivityFormProps) {
  const [activityName, setActivityName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activityName.trim()) {
      onSubmit(activityName.trim());
      setActivityName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col space-y-2">
        <label htmlFor="activityName" className="block text-sm font-medium text-gray-700">
          New Activity
        </label>
        <input
          type="text"
          id="activityName"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter activity name"
        />
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Add Activity
      </button>
    </form>
  );
}
