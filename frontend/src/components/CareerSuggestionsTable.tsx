import { useState } from "react";
import { CareerSuggestion } from "@/services/careerSuggestionService";
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
import { Lightbulb, Eye, Trash2, Calendar, BookOpen, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface CareerSuggestionsTableProps {
  suggestions: CareerSuggestion[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CareerSuggestionsTable({ 
  suggestions,
  selectedId,
  onSelect, 
  onDelete 
}: CareerSuggestionsTableProps) {
  const handleSelect = (id: string) => {
    onSelect(id);
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          Career Suggestions Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">#</TableHead>
                <TableHead className="font-semibold text-gray-700">Date Created</TableHead>
                <TableHead className="font-semibold text-gray-700">Suggested Careers</TableHead>
                <TableHead className="font-semibold text-gray-700">Career Count</TableHead>
                <TableHead className="font-semibold text-gray-700">Courses</TableHead>
                <TableHead className="font-semibold text-gray-700">Skill Gaps</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.map((suggestion, index) => {
                const careers = suggestion.suggestedCareers.split(',').map(c => c.trim());
                const isSelected = selectedId === suggestion._id;
                
                return (
                  <TableRow
                    key={suggestion._id}
                    className={`cursor-pointer hover:bg-yellow-50 transition-all ${
                      isSelected ? "bg-yellow-100 border-l-4 border-l-yellow-600 shadow-md" : ""
                    }`}
                    onClick={() => handleSelect(suggestion._id || '')}
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {suggestion.createdAt
                            ? format(new Date(suggestion.createdAt), "MMM dd, yyyy HH:mm")
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                          {careers.slice(0, 3).join(', ')}
                          {careers.length > 3 && ` +${careers.length - 3} more`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 font-semibold">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {careers.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{suggestion.recommended_courses?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {suggestion.skillGapAnalysis ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(suggestion._id || '');
                          }}
                          className="text-yellow-600 hover:bg-yellow-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this suggestion?")) {
                              onDelete(suggestion._id || '');
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
        {suggestions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No career suggestions available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

