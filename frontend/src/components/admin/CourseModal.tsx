import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PlusCircle, X, Save, Link, Tag, Loader } from "lucide-react";
import courseService, {
  Course,
  CourseFormData,
} from "@/services/CourseService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSuccess: () => void;
}

const CourseModal = ({ isOpen, onClose, course, onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CourseFormData>({
    defaultValues: {
      title: "",
      description: "",
      url: "",
      tags: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });

  useEffect(() => {
    if (course) {
      reset({
        title: course.title || "",
        description: course.description || "",
        url: course.url || "",
        tags: (course.tags || []).map((tag) => ({ value: tag })),
      });
    } else {
      reset({
        title: "",
        description: "",
        url: "",
        tags: [],
      });
    }
  }, [course, reset]);

  const onSubmit = async (data: CourseFormData) => {
    const payload = {
      title: data.title,
      description: data.description,
      url: data.url,
      tags: data.tags.map((tag) => tag.value.trim()).filter(Boolean),
    };

    try {
      if (course) {
        await courseService.update(course._id, payload);
      } else {
        await courseService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save course", err);
    }
  };

  const addNewTag = () => {
    append({ value: "" });
  };

  // Custom style to override the default input styles
  const inputStyles = `
    border border-gray-300 hover:border-gray-400
    focus:border-gray-400 focus:ring-0 focus:outline-none
    transition-colors duration-200
  `;

  const errorInputStyles = `
    border border-red-500 hover:border-red-600
    focus:border-red-500 focus:ring-0 focus:outline-none
    transition-colors duration-200
  `;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? "Edit Course" : "Add New Course"}
      width="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-4">
        <div className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Course Title
            </Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Enter course title..."
              className={errors.title ? errorInputStyles : inputStyles}
              style={{ outline: "none" }}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Course Description
            </Label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Description is required",
              })}
              placeholder="Describe the course content and what learners will achieve..."
              className={`min-h-24 ${
                errors.description ? errorInputStyles : inputStyles
              }`}
              style={{ outline: "none" }}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* URL Field */}
          <div className="space-y-2">
            <Label
              htmlFor="url"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Link className="w-4 h-4" /> Course URL
            </Label>
            <Input
              id="url"
              {...register("url", {
                required: "URL is required",
                pattern: {
                  value: /^(https?:\/\/[^\s]+)$/i,
                  message:
                    "Please enter a valid URL (starting with http:// or https://)",
                },
              })}
              placeholder="https://example.com/course"
              className={errors.url ? errorInputStyles : inputStyles}
              style={{ outline: "none" }}
            />
            {errors.url && (
              <p className="text-sm text-red-500 mt-1">{errors.url.message}</p>
            )}
          </div>

          {/* Tags Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" /> Tags
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addNewTag}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1 focus:ring-0 focus:outline-none"
                style={{ outline: "none" }}
              >
                <PlusCircle className="w-4 h-4" /> Add Tag
              </Button>
            </div>

            {fields.length > 0 ? (
              <Card className="p-4 bg-gray-50 border-gray-200">
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        {...register(`tags.${index}.value`, {
                          required: "Tag cannot be empty",
                        })}
                        placeholder="Enter tag..."
                        className={`flex-1 ${inputStyles}`}
                        style={{ outline: "none" }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 focus:ring-0 focus:outline-none"
                        style={{ outline: "none" }}
                        aria-label="Remove tag"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md bg-gray-50 border-gray-200">
                <p className="text-gray-500 text-sm">No tags added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewTag}
                  className="mt-2 focus:ring-0 focus:outline-none"
                  style={{ outline: "none" }}
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Your First Tag
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="focus:ring-0 focus:outline-none"
            style={{ outline: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="bg-black text-white focus:ring-0 focus:outline-none"
            style={{ outline: "none" }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {course ? "Update Course" : "Create Course"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CourseModal;
