import { ResumeAnalysis } from "@/services/resumeService";
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
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  Trash2,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { format } from "date-fns";
import { calculateResumeScore, getScoreColor } from "@/utils/resumeScore";

interface ResumeTableProps {
  analyses: ResumeAnalysis[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ResumeTable({
  analyses,
  selectedId,
  onSelect,
  onDelete,
}: ResumeTableProps) {
  const handleSelect = (id: string) => {
    onSelect(id);
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="w-6 h-6 text-blue-600" />
          Resume Analyses Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">#</TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Date Analyzed
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Score
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Strengths
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Weaknesses
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Recommendations
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Job Matches
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map((analysis, index) => {
                const score = calculateResumeScore(analysis);

                return (
                  <TableRow
                    key={analysis._id}
                    className={`cursor-pointer hover:bg-blue-50 transition-all ${
                      selectedId === analysis._id
                        ? "bg-blue-100 border-l-4 border-l-blue-600 shadow-md"
                        : ""
                    }`}
                    onClick={() => handleSelect(analysis._id)}
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {analysis.createdAt
                            ? format(
                                new Date(analysis.createdAt),
                                "MMM dd, yyyy HH:mm"
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getScoreColor(
                          score
                        )} border font-semibold`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {score}/100
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium">
                          {analysis.strengths?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="font-medium">
                          {analysis.weakness?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {analysis.recommendation?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {analysis.jobRecommendations?.length || 0} jobs
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(analysis._id);
                          }}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this resume?"
                              )
                            ) {
                              onDelete(analysis._id);
                            }
                          }}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {analyses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No resume analyses available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
