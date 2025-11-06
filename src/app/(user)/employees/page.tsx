"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
// Import the modal component
import EmployeModels from "@/components/ui/EmployeModels"; 
import {
  Users,
  UserCheck,
  Crown,
  Shield,
  Settings2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  Eye,
  SquarePen,
} from "lucide-react";
import Image from "next/image";
import EditEmployee from "@/components/EmployeeEdit";
import EmployeeView from "@/components/EmployeeView";
import CreateUser from "@/components/CreateUser";

/** Backend user structure */
export interface BackendUser {
  id: string;
  email?: string | null;
  name: string;
  role: string;
  password?: string | null;
  subscription?: string | null;
  createdAt: string;
  updatedAt?: string;
  avatar?: string | null;
  whatsapp?: string | null;
}

export default function Employees() {
  const router = useRouter();

  // states
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedRole, setSelectedRole] = useState("User Role");
  const [roleOpen, setRoleOpen] = useState(false);
  // Replaced 'lead' logic with 'user' logic
  const [popup, setPopup] = useState<null | "view" | "edit">(null); 
  const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null);
  const [openCreateUser, setOpenCreateUser] = useState(false);

  /** Fetch users from backend */
  const fetchUsers = () => {
    let mounted = true;
    setLoading(true);

    fetch("/api/auth/user", { method: "GET", credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setUsers(data);
        else if (data?.users) setUsers(data.users);
        else setUsers([]);
      })
      .catch((err: any) => {
        if (mounted) setError(err.message ?? "Failed to load users");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const closepop = () => setPopup(null);

  // Updated logic to use BackendUser
  const openModal = (action: "view" | "edit", user: BackendUser) => {
    setSelectedUser(user);
    setPopup(action);
  };

  // ... (stats, filtering, pagination logic remains the same)

  /** Stats summary */
  const stats = useMemo(() => {
    const total = users.length;
    const counts = users.reduce(
      (a, u) => {
        const role = u.role.toUpperCase();
        if (role.includes("ADMIN")) a.admins++;
        if (role.includes("EMPLOYEE")) a.employees++;
        // Note: The original code used 'CUSTOMER' which might not be a direct role
        if (!role.includes("ADMIN") && !role.includes("EMPLOYEE")) a.customers++;
        return a;
      },
      { admins: 0, employees: 0, customers: 0 }
    );

    return [
      {
        value: total,
        title: "Total Users",
        description: "All registered users on the platform",
        icon: <Users className="size-6 text-muted-foreground" />,
      },
      {
        value: counts.customers,
        title: "Total Customers",
        description: "Active customers using the platform",
        icon: <UserCheck className="size-6 text-muted-foreground" />,
      },
      {
        value: counts.employees,
        title: "Total Employees",
        description: "All employees with system access",
        icon: <Crown className="size-6 text-muted-foreground" />,
      },
      {
        value: counts.admins,
        title: "Total Admins",
        description: "Administrators managing the platform",
        icon: <Shield className="size-6 text-muted-foreground" />,
      },
    ];
  }, [users]);

  /** Filter & role search */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );

    if (selectedRole !== "User Role") {
      list = list.filter((u) => {
        const r = u.role.toLowerCase();
        if (selectedRole === "Admin") return r.includes("admin");
        if (selectedRole === "Employee") return r.includes("employee");
        if (selectedRole === "Other")
          return !r.includes("admin") && !r.includes("employee");
        return true;
      });
    }

    return list;
  }, [users, search, selectedRole]);

  /** Pagination logic */
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  /** Navigation actions */
  const handleView = (id: string) =>
    router.push(`/console/admin/users/view/${id}`);
  const handleEdit = (id: string) =>
    router.push(`/console/admin/users/manage/${id}`);

  /** Avatar helper */
  const hashCode = (s: string) =>
    s.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

  const avatarFor = (u: BackendUser) =>
    u.avatar ||
    (u.email
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
          u.name
        )}&background=ddd&color=333&size=128`
      : `https://randomuser.me/api/portraits/lego/${
          Math.abs(hashCode(u.name || u.id)) % 10
        }.jpg`);


  function fetchLeads(): void {
    setLoading(true);
    setError(null);

    fetch("/api/auth/user", { method: "GET", credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else if (data?.users) setUsers(data.users);
        else setUsers([]);
      })
      .catch((err: any) => {
        setError(err?.message ?? "Failed to load users");
      })
      .finally(() => {
        setLoading(false);
      });
  }
  return (
    <div className="px-3">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-0 mb-3">
        <div>
          <div className="text-2xl font-semibold">Users</div>
          <div className="text-base text-muted-foreground">
            Manage your users
          </div>
        </div>
        <div className="p-6">
      {/* Add User Button */}
      <button
        onClick={() => setOpenCreateUser(true)}
        className="inline-flex items-center gap-2 rounded-md bg-[#cbc6c6] px-4 py-2 text-sm font-medium text-black transition-all hover:bg-[#cbc6c6]/90 active:scale-95"
      >
        Add User
      </button>

      {/* ✅ Modal component */}
      <CreateUser open={openCreateUser} close={() => setOpenCreateUser(false)} />
    </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col pb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{s.value}</div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {s.description}
                  </div>
                </div>
                {s.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            placeholder="Search name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-8 w-full max-w-80 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          />

          {/* Role dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setRoleOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 h-8 rounded-md border px-3 text-sm font-medium bg-card hover:bg-accent hover:text-accent-foreground transition-all"
            >
              {selectedRole}
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${
                  roleOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {roleOpen && (
              <div
                className="absolute left-0 mt-2 w-36 rounded-md border bg-card shadow-lg z-50"
                onMouseLeave={() => setRoleOpen(false)}
              >
                {["Admin", "Employee", "Other"].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setRoleOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 min-h-[60vh] rounded-xl border bg-card p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading users...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-destructive">{error}</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="h-14 border-b">
              <tr className="text-left">
                <th className="px-4">Image</th>
                <th className="px-4">Name</th>
                <th className="px-4">Email</th>
                <th className="px-4">Role</th>
                <th className="px-4">Created At</th>
                <th className="px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u) => (
                <tr
                  key={u.id}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-2">
                    <Image
                      src={avatarFor(u)}
                      alt={u.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="rounded-full border object-cover"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium">{u.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {u.email ?? "—"}
                  </td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">
                    {new Date(u.createdAt).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        title="View"
                        onClick={() => openModal("view", u)} // Pass user 'u'
                        className="p-1 hover:text-primary"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => openModal("edit", u)} // Pass user 'u'
                        className="p-1 hover:text-primary"
                      >
                        <SquarePen className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border bg-card py-4 shadow-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage(1)}
          className="hidden h-8 w-8 items-center justify-center rounded-md border bg-card hover:bg-accent lg:flex"
        >
          <ChevronsLeft className="size-4" />
        </button>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="h-8 w-8 flex items-center justify-center rounded-md border bg-card hover:bg-accent"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="rounded-md border px-4 py-1 text-sm font-medium">
          Page {page} of {totalPages}
        </div>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="h-8 w-8 flex items-center justify-center rounded-md border bg-card hover:bg-accent"
        >
          <ChevronRight className="size-4" />
        </button>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(totalPages)}
          className="hidden h-8 w-8 items-center justify-center rounded-md border bg-card hover:bg-accent lg:flex"
        >
          <ChevronsRight className="size-4" />
        </button>
      </div>
{popup === "edit" && selectedUser && (
  <EditEmployee
    user={selectedUser as any}
    open={popup === "edit"}
    close={closepop}
    onUpdated={fetchUsers} // refresh list after edit
  />
)}

{popup === "view" && selectedUser && (
  <EmployeeView user={selectedUser} close={closepop} />
)}


    </div>
  );
}