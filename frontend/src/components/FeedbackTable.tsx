import { useState } from "react";
import { Feedback } from "@/services/feedbackService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FeedbackTableProps {
  feedbacks: Feedback[];
  onDelete?: (id: string) => void;
}

export default function FeedbackTable({
  feedbacks,
  onDelete,
}: FeedbackTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-100 text-green-700 border-green-300";
    if (rating >= 3) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Feedback History Table
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700 w-12"></TableHead>
                <TableHead className="font-semibold text-gray-700">#</TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Rating
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Message Preview
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Stars
                </TableHead>
                {onDelete && (
                  <TableHead className="font-semibold text-gray-700 text-center">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((feedback, index) => {
                const isExpanded = expandedId === feedback._id;
                return (
                  <>
                    <TableRow
                      key={feedback._id}
                      className={cn(
                        "hover:bg-blue-50 transition-colors cursor-pointer",
                        isExpanded && "bg-blue-100"
                      )}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : feedback._id || null)
                      }
                    >
                      <TableCell>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(
                              isExpanded ? null : feedback._id || null
                            );
                          }}
                          className="p-1 hover:bg-blue-200 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {feedback.createdAt
                              ? format(
                                  new Date(feedback.createdAt),
                                  "MMM dd, yyyy HH:mm"
                                )
                              : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getRatingColor(
                            feedback.rating
                          )} border font-semibold`}
                        >
                          {feedback.rating}/5
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {feedback.message || "No message"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= feedback.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </TableCell>
                      {onDelete && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this feedback?"
                                )
                              ) {
                                onDelete(feedback._id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                    {isExpanded && (
                      <TableRow
                        key={`${feedback._id}-detail`}
                        className="bg-blue-50/50"
                      >
                        <TableCell colSpan={onDelete ? 7 : 6} className="p-4">
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                Full Feedback Message
                              </h4>
                              <Badge
                                className={`${getRatingColor(
                                  feedback.rating
                                )} border`}
                              >
                                {feedback.rating}/5 Stars
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {feedback.message || "No message provided"}
                            </p>
                            {feedback.createdAt && (
                              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Submitted on{" "}
                                {format(
                                  new Date(feedback.createdAt),
                                  "MMMM d, yyyy 'at' h:mm a"
                                )}
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {feedbacks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No feedback available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
