import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { CreateFeedbackDto } from "@/services/feedbackService";
import { Star } from "lucide-react";
import { useState } from "react";

interface Props {
  userId: string;
  onSubmit: (data: CreateFeedbackDto) => void;
  initialData?: Partial<CreateFeedbackDto>;
}

export default function FeedbackForm({ userId, onSubmit, initialData }: Props) {
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<CreateFeedbackDto>({
      defaultValues: {
        userId,
        message: "",
        rating: initialData?.rating || 5,
        ...initialData,
      },
    });

  const currentRating = watch("rating", initialData?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const submitHandler = (data: CreateFeedbackDto) => {
    onSubmit({
      ...data,
      rating: Number.parseInt(data.rating.toString(), 10),
    });
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-4 bg-white rounded-lg p-5 shadow-sm border border-gray-100"
    >
      <div className="space-y-2">
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700"
        >
          Your Feedback
        </label>
        <textarea
          id="message"
          {...register("message", { required: true })}
          className="w-full min-h-[120px] border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none transition-all"
          placeholder="Share your thoughts and experience..."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Rating
        </label>
        <div className="flex items-center">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue("rating", star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  className={`${
                    (
                      hoverRating !== null
                        ? star <= hoverRating
                        : star <= currentRating
                    )
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500">
            {hoverRating !== null ? hoverRating : currentRating} out of 5
          </span>
          <input
            type="hidden"
            {...register("rating", { required: true, min: 1, max: 5 })}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 transition-colors"
      >
        Submit Feedback
      </Button>
    </form>
  );
}
