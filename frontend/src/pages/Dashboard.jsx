import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight, MapPin, Calendar } from "lucide-react";
import { getCustomers } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import SearchBar from "../components/SearchBar";
import toast from "react-hot-toast";

const STATUS_FILTERS = ["All", "New", "Active", "On Hold", "Matched", "Closed"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await getCustomers(params);
      setCustomers(res.data.data);
    } catch (error) {
      toast.error("Failed to load customers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Assigned Customers
            </h2>
            <p className="text-sm text-slate-500">
              {customers.length} client{customers.length !== 1 ? "s" : ""} in your portfolio
            </p>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or city..."
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === status
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Customer list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading customers...</span>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No customers found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header — hidden on mobile */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Customer</div>
            <div className="col-span-1 text-center">Age</div>
            <div className="col-span-2">City</div>
            <div className="col-span-2">Marital Status</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Customer rows */}
          <div className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => navigate(`/customer/${customer.id}`)}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                {/* Name + gender */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                      customer.gender === "Male"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-pink-50 text-pink-700"
                    }`}
                  >
                    {customer.firstName[0]}
                    {customer.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-xs text-slate-400 md:hidden flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {customer.city} · {customer.age}y · {customer.maritalStatus}
                    </p>
                  </div>
                </div>

                {/* Age — desktop */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center">
                  <span className="text-sm text-slate-600">{customer.age}</span>
                </div>

                {/* City — desktop */}
                <div className="hidden md:flex md:col-span-2 items-center">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {customer.city}
                  </span>
                </div>

                {/* Marital status — desktop */}
                <div className="hidden md:flex md:col-span-2 items-center">
                  <span className="text-sm text-slate-600">
                    {customer.maritalStatus}
                  </span>
                </div>

                {/* Status badge */}
                <div className="md:col-span-2 flex items-center">
                  <StatusBadge status={customer.status} />
                </div>

                {/* Arrow */}
                <div className="hidden md:flex md:col-span-1 items-center justify-end">
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
