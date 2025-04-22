import { useState, useEffect } from "react";
import userService, { User } from "../../services/userService";
import Modal from "@/components/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  refreshUsers: () => void;
}

export default function UserModal({
  isOpen,
  onClose,
  user,
  refreshUsers,
}: Props) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "USER",
    education: "",
    skills: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        email: user.email,
        password: "",
        role: user.role,
        education: user.education || "",
        skills: user.skills || "",
      });
    } else {
      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "USER",
        education: "",
        skills: "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (user) {
        await userService.updateUser(user._id, form);
      } else {
        await userService.createUser(form);
      }
      refreshUsers();
      onClose();
    } catch (err) {
      console.error("Save error", err);
      alert("Error saving user");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Edit User" : "Add User"}
      width="max-w-md"
    >
      <div className="space-y-4">
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="USER">USER</option>
          <option value="EXPERT">EXPERT</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPERADMIN">SUPERADMIN</option>
        </select>
        <input
          name="education"
          placeholder="Education"
          value={form.education}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="skills"
          placeholder="Skills (comma-separated)"
          value={form.skills}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {user ? "Update" : "Create"}
        </button>
      </div>
    </Modal>
  );
}
