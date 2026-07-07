"use client";

export function DragGhost({ title, Icon }: { title: string; Icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-kale text-white px-3 py-2 shadow-elevated text-xs font-semibold">
      <Icon className="w-3.5 h-3.5" />
      {title}
    </div>
  );
}
