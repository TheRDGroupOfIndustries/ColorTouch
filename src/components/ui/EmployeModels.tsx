"use client"
import React, { useState, useEffect } from "react";
import { X, Save, Eye, SquarePen } from "lucide-react";
import { BackendUser } from "@/app/employees/page";

interface EmployeModelsProps {
  show: boolean;
  action: "view" | "edit" | null;
  user: BackendUser | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

const EmployeModels: React.FC<EmployeModelsProps> = ({
  show,
  action,
  user,
  onClose,
  onUserUpdated,
}) => {
  const [formData, setFormData] = useState<Partial<BackendUser>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        whatsapp: user.whatsapp,
      });
    } else {
      setFormData({});
    }
  }, [user]);

  if (!show || !user) return null;

  const isView = action === "view";
  const isEdit = action === "edit";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/auth/user/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update user");

      onUserUpdated();
      onClose();
    } catch (error: any) {
      alert(error.message || "Error updating user");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (
    label: string,
    key: keyof Partial<BackendUser>,
    type: string = "text"
  ) => (
    <div className="flex flex-col mb-3">
      <label className="text-sm font-medium">{label}</label>
      {isView ? (
        <p className="border rounded p-2">{(user as any)[key] ?? "N/A"}</p>
      ) : (
        <input
          type={type}
          name={key as string}
          value={(formData[key] as string) ?? ""}
          onChange={handleChange}
          className="border rounded p-2 text-sm"
          disabled={key === "id" || key === "email"}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-black text-white rounded-lg w-full max-w-md p-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {isView ? <Eye /> : <SquarePen />}
            {isView ? "View User" : `Edit User`}
          </h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave}>
          {renderField("Full Name", "name")}
          {renderField("Email", "email", "email")}
          {renderField("Role", "role")}
          {renderField("WhatsApp", "whatsapp")}

          {/* Footer for Edit */}
          {isEdit && (
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-gray-600 text-white px-4 py-2 rounded cursor-pointer  disabled:opacity-50"
              >
                <Save className="inline mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmployeModels;
