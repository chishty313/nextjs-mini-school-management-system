"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Class, CreateClassData, UpdateClassData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateClassData | UpdateClassData) => Promise<void>;
  classItem?: Class | null;
  loading?: boolean;
}

const ClassForm: React.FC<ClassFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  classItem,
  loading = false,
}) => {
  const isEditing = !!classItem;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      section: "",
    },
  });

  useEffect(() => {
    if (classItem && open) {
      reset({
        name: classItem.name,
        section: classItem.section,
      });
    } else if (!classItem && open) {
      reset({
        name: "",
        section: "",
      });
    }
  }, [classItem, open, reset]);

  const handleFormSubmit = async (data: ClassFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Class" : "Add New Class"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the class information below."
              : "Fill in the class information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics, Physics, English"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Input
              id="section"
              placeholder="e.g., A, B, C, 10-A, 12-B"
              {...register("section")}
              className={errors.section ? "border-red-500" : ""}
            />
            {errors.section && (
              <p className="text-sm text-red-500">{errors.section.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Class" : "Add Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassForm;
