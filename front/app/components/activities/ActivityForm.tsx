import React, { useState } from "react";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="activityName" className="block text-sm font-medium text-gray-700">
          New Activity
        </label>
        <input
          type="text"
          id="activityName"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
          className="mt-1 block w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm"
          placeholder="Enter activity name"
          maxLength={50}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Activity
      </button>
    </form>
  );
}
