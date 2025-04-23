import { useState } from "react";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import courseService, { Course } from "@/services/CourseService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSuccess: () => void;
}

const CourseModal = ({ isOpen, onClose, course, onSuccess }: Props) => {
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [link, setLink] = useState(course?.link || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (course) {
        await courseService.update(course._id, { title, description, link });
      } else {
        await courseService.create({ title, description, link });
      }
      onSuccess();
    } catch (err) {
      console.error("Failed to save course", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? "Edit Course" : "Add Course"}
      width="max-w-lg"
    >
      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Course Title"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Course Description"
        />
        <Input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Course Link (optional)"
        />

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Saving..." : course ? "Update Course" : "Add Course"}
        </Button>
      </div>
    </Modal>
  );
};

export default CourseModal; // Make sure this is default export
