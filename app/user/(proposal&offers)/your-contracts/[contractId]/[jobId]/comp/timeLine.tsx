"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";

interface TodoItem {
  _id?: string; // Added _id for updating specific tasks
  task: string;
  deadline: string | Date;
  status: "Pending" | "In Progress" | "Completed";
  memo?: string;
}

interface Props {
  project_todo: TodoItem[];
  contractId: string;
  userRole: "client" | "freelancer";
  projectStatus?: "ongoing" | "completed" | "revisions" | "canceled";
}

const TimeLine = ({
  project_todo,
  contractId,
  userRole,
  projectStatus,
}: Props) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isAddTimelineItemOpen, setIsAddTimelineItemOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ timeline: true });

  useEffect(() => {
    console.log("Initial todos from props:", project_todo);
    setTodos(project_todo);
  }, [project_todo]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const [newTimelineItem, setNewTimelineItem] = useState({
    task: "",
    endDate: "",
    status: "Pending" as TodoItem["status"],
    memo: "",
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Freelancer can add tasks if project is ongoing or in revisions
  const handleAddTimelineItem = async () => {
    if (!newTimelineItem.task || !newTimelineItem.endDate) return;
    if (
      userRole !== "freelancer" ||
      (projectStatus !== "ongoing" && projectStatus !== "revisions")
    )
      return;

    const newTodo: TodoItem = {
      task: newTimelineItem.task,
      deadline: newTimelineItem.endDate,
      status: newTimelineItem.status,
      memo: newTimelineItem.memo || undefined,
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);

    try {
      const response = await fetchWithAuth("/api/project-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          updates: { project_todo: updatedTodos },
        }),
      });

      if (!response.ok) throw new Error("Failed to update project todos");

      const data = await response.json();
      console.log("Project updated successfully:", data);
      setNewTimelineItem({
        task: "",
        endDate: "",
        status: "Pending",
        memo: "",
      });
      setIsAddTimelineItemOpen(false);
    } catch (error) {
      console.error("Error updating project todos:", error);
      setTodos(todos); // Revert on failure
      alert("Failed to add task. Please try again.");
    }
  };

  // Freelancer can update task status if project is ongoing or in revisions
  const handleStatusChange = async (
    todoIndex: number,
    newStatus: TodoItem["status"]
  ) => {
    if (
      userRole !== "freelancer" ||
      (projectStatus !== "ongoing" && projectStatus !== "revisions")
    )
      return;

    const updatedTodos = todos.map((todo, idx) =>
      idx === todoIndex ? { ...todo, status: newStatus } : todo
    );
    setTodos(updatedTodos);

    try {
      const response = await fetchWithAuth("/api/project-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          updates: { project_todo: updatedTodos },
        }),
      });

      if (!response.ok) throw new Error("Failed to update task status");
      console.log("Task status updated successfully");
    } catch (error) {
      console.error("Error updating task status:", error);
      setTodos(todos); // Revert on failure
      alert("Failed to update task status. Please try again.");
    }
  };

  const isEditable =
    userRole === "freelancer" &&
    (projectStatus === "ongoing" || projectStatus === "revisions");

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div
        className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => toggleSection("timeline")}
      >
        <h2 className="text-lg font-semibold">Project Timeline</h2>
        <div className="flex items-center">
          {expandedSections.timeline ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500 ml-2" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500 ml-2" />
          )}
        </div>
      </div>
      {expandedSections.timeline && (
        <div className="p-4">
          {/* Add Task Button - Only for freelancer if ongoing or revisions */}
          {isEditable && (
            <div className="flex justify-end mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddTimelineItemOpen(true);
                }}
                className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Task
              </button>
            </div>
          )}
          <div className="space-y-6">
            {todos && todos.length > 0 ? (
              todos.map((todo, index) => (
                <div
                  key={index}
                  className="relative pl-8 pb-6 border-l-2 border-gray-200 last:pb-0"
                >
                  <div
                    className={`absolute left-[-8px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                      todo.status === "Completed"
                        ? "bg-green-500"
                        : todo.status === "In Progress"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                    }`}
                  ></div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h3 className="font-medium">{todo.task}</h3>
                    {/* Status Dropdown - Only for freelancer if editable */}
                    {isEditable ? (
                      <select
                        value={todo.status}
                        onChange={(e) =>
                          handleStatusChange(
                            index,
                            e.target.value as TodoItem["status"]
                          )
                        }
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(todo.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(todo.status)}`}
                      >
                        {todo.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <ClockIcon className="inline-block h-4 w-4 mr-1 text-gray-500" />
                    Due by{" "}
                    {typeof todo.deadline === "string"
                      ? todo.deadline
                      : new Date(todo.deadline).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                  </p>
                  {todo.memo && (
                    <p className="text-sm text-gray-600 mt-2">{todo.memo}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No tasks available.</p>
            )}
          </div>
          {/* Read-only notice for completed or canceled */}
          {(projectStatus === "completed" || projectStatus === "canceled") && (
            <p className="text-sm text-gray-500 italic mt-4">
              This project is {projectStatus}. No edits allowed.
            </p>
          )}
        </div>
      )}
      {isAddTimelineItemOpen && isEditable && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Add Timeline Task</h3>
              <p className="text-gray-500 mt-1">
                Add a new task to the project timeline.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="task-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Task Name
                </label>
                <input
                  type="text"
                  id="task-name"
                  value={newTimelineItem.task}
                  onChange={(e) =>
                    setNewTimelineItem({
                      ...newTimelineItem,
                      task: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., User Testing"
                />
              </div>
              <div>
                <label
                  htmlFor="end-date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={newTimelineItem.endDate}
                  onChange={(e) =>
                    setNewTimelineItem({
                      ...newTimelineItem,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={newTimelineItem.status}
                  onChange={(e) =>
                    setNewTimelineItem({
                      ...newTimelineItem,
                      status: e.target.value as TodoItem["status"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="memo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Memo (Optional)
                </label>
                <textarea
                  id="memo"
                  value={newTimelineItem.memo}
                  onChange={(e) =>
                    setNewTimelineItem({
                      ...newTimelineItem,
                      memo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddTimelineItemOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTimelineItem}
                disabled={!newTimelineItem.task || !newTimelineItem.endDate}
                className={`px-4 py-2 rounded-md text-white font-medium text-sm ${
                  !newTimelineItem.task || !newTimelineItem.endDate
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Add to Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeLine;
