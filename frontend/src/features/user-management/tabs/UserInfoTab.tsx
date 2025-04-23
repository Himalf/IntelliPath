import { User } from "@/services/userService";
import { format } from "date-fns";
import {
  Mail,
  User as UserIcon,
  Calendar,
  BookOpen,
  Code,
  FileText,
} from "lucide-react";

interface Props {
  user: User;
}

export default function UserInfoTab({ user }: Props) {
  return (
    <div className="bg-white rounded-lg">
      <div className="flex flex-col md:flex-row">
        {/* User avatar section */}
        <div className="flex-shrink-0 flex flex-col items-center mb-6 md:mb-0 md:mr-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.fullName
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </div>
          <div className="mt-4 text-center">
            <h3 className="font-bold text-xl text-gray-800">{user.fullName}</h3>
            <p className="text-gray-500">{user.role}</p>
          </div>
        </div>

        {/* User details section */}
        <div className="flex-grow">
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-800 mb-4 pb-2 border-b">
              Contact Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium">{user.fullName}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <UserIcon className="w-4 h-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="font-medium">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "MMMM d, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Education and Skills */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.education && (
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div className="flex items-center mb-3">
                  <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-800">Education</h4>
                </div>
                <p className="text-gray-700">{user.education}</p>
              </div>
            )}

            {user.skills && (
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div className="flex items-center mb-3">
                  <Code className="w-4 h-4 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-800">Skills</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.skills.split(",").map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resume Link */}
          {user.resume_url && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Resume</h4>
                <a
                  href={user.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  View Resume
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
