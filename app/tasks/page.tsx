"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";

const Tasks = dynamic(() => import("@/components/Tasks"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
        ></div>
      ))}
    </div>
  ),
});

export default function TasksPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 md:mb-0">
          Your Tasks
        </h1>

        {status === "authenticated" && (
          <Button
            className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            asChild
          >
            <a href="/tasks/new">
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
              Add New Task
            </a>
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        {status === "authenticated" ? (
          <Tasks />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to view your tasks
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
