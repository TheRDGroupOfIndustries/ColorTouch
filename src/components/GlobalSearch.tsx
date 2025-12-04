"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Lead {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SearchResult {
  type: "lead" | "employee";
  id: string;
  name: string;
  subtitle: string;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults: SearchResult[] = [];

        // Search leads
        const leadsRes = await fetch("/api/leads");
        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          const leads = Array.isArray(leadsData) ? leadsData : (leadsData.leads || []);
          
          const matchingLeads = leads.filter((lead: Lead) =>
            lead.name?.toLowerCase().includes(query.toLowerCase()) ||
            lead.email?.toLowerCase().includes(query.toLowerCase()) ||
            lead.company?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5);

          matchingLeads.forEach((lead: Lead) => {
            searchResults.push({
              type: "lead",
              id: lead.id,
              name: lead.name,
              subtitle: lead.email || lead.company || "Lead"
            });
          });
        }

        // Search employees
        const employeesRes = await fetch("/api/employees");
        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          const employees = employeesData.employees || [];
          
          const matchingEmployees = employees.filter((emp: Employee) =>
            emp.name?.toLowerCase().includes(query.toLowerCase()) ||
            emp.email?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5);

          matchingEmployees.forEach((emp: Employee) => {
            searchResults.push({
              type: "employee",
              id: emp.id,
              name: emp.name,
              subtitle: emp.email || emp.role
            });
          });
        }

        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "lead") {
      router.push(`/leads?search=${encodeURIComponent(result.name)}`);
    } else {
      router.push(`/employees?search=${encodeURIComponent(result.name)}`);
    }
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-2xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        placeholder="Search leads, employees..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        className="pl-10 pr-10 bg-card border-border"
      />
      {query && (
        <button
          onClick={() => {
            setQuery("");
            setResults([]);
            setIsOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-gray-800 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    result.type === "lead" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                  }`}>
                    {result.type === "lead" ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{result.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    result.type === "lead" 
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                      : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  }`}>
                    {result.type === "lead" ? "Lead" : "Employee"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
