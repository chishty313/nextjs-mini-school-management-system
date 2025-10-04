"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Student, Class, CreateStudentData, UpdateStudentData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const studentSchema = z.object({
  name: z.string().min(1, "Student name is required"),
  age: z
    .number()
    .min(5, "Student age must be at least 5 years")
    .max(25, "Student age must not exceed 25 years"),
  classId: z.number().nullable().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStudentData | UpdateStudentData) => Promise<void>;
  student?: Student | null;
  classes: Class[];
  loading?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  student,
  classes,
  loading = false,
}) => {
  const isEditing = !!student;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      age: 5,
      classId: null,
    },
  });

  const selectedClassId = watch("classId");

  useEffect(() => {
    if (student && open) {
      reset({
        name: student.name,
        age: student.age,
        classId: student.classId || null,
      });
    } else if (!student && open) {
      reset({
        name: "",
        age: 5,
        classId: null,
      });
    }
  }, [student, open, reset]);

  const handleFormSubmit = async (data: StudentFormData) => {
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
            {isEditing ? "Edit Student" : "Add New Student"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the student information below."
              : "Fill in the student information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              placeholder="Enter student name"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="5"
              max="25"
              placeholder="Enter student age"
              {...register("age", { valueAsNumber: true })}
              className={errors.age ? "border-red-500" : ""}
            />
            {errors.age && (
              <p className="text-sm text-red-500">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class (Optional)</Label>
            <Select
              value={selectedClassId?.toString() || "none"}
              onValueChange={(value) => {
                setValue(
                  "classId",
                  value && value !== "none" ? parseInt(value) : null
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Class</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name} - {cls.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isEditing ? "Update Student" : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
