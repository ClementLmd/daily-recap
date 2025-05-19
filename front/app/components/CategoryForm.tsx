interface CategoryFormProps {
  onSubmit: (category: string) => void;
}

export default function CategoryForm({ onSubmit }: CategoryFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get("category") as string;
    if (category.trim()) {
      onSubmit(category.trim());
      e.currentTarget.reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Add New Category
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="category"
            id="category"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500"
            placeholder="e.g., Push-ups done"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}
