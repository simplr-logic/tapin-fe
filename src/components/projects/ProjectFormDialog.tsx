"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ProjectFormFields } from "./ProjectFormFields";

import type { NewProjectInput } from "@/components/providers/ProjectsProvider";

export function ProjectFormDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewProjectInput) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <>
            <DialogHeader>
              <span className="text-[10px] font-semibold text-link tracking-wide">New Project</span>
              <DialogTitle>Create allocation project</DialogTitle>
            </DialogHeader>
            <ProjectFormFields
              submitLabel="Create Project"
              onSubmit={(payload) => {
                onCreate({ ...payload, locked: false });
                onOpenChange(false);
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
