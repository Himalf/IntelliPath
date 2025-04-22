interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const getBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "superadmin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium capitalize ${getBadgeClass(
        role
      )}`}
    >
      {role}
    </span>
  );
}
