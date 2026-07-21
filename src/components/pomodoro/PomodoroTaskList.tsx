"use client";

import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { timerStore } from "./timerStore";

import type { PomodoroTask } from "./timerStore";

export function PomodoroTaskList({ tasks }: { tasks: PomodoroTask[] }) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    timerStore.addTask(text);
    setText("");
    inputRef.current?.focus();
  }

  return (
    <div className="w-full space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
        Session tasks
      </p>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a task…"
          className="h-8 text-sm flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={submit}
          disabled={!text.trim()}
          title="Add task"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {tasks.length > 0 && (
        <ul className="space-y-1">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-2 group"
            >
              <span className="text-xs text-ink flex-1 truncate">{task.text}</span>
              <button
                type="button"
                onClick={() => timerStore.removeTask(task.id)}
                className="text-ink-subtle hover:text-error shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove task"
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
