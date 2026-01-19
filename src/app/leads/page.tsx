"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Building,
  Edit,
  Trash2,
  ShieldBan,
} from "lucide-react";
import type { Lead, Client, LeadStatus } from "@/types";

const statusLabels: Record<LeadStatus, { label: string; class: string }> = {
  new: { label: "신규", class: "badge-new" },
  contacted: { label: "연락완료", class: "badge-contacted" },
  converted: { label: "전환", class: "badge-converted" },
  spam: { label: "스팸", class: "badge-spam" },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, clientsRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/clients"),
      ]);

      const leadsData = await leadsRes.json();
      const clientsData = await clientsRes.json();

      if (leadsData.success) {
        setLeads(leadsData.data);
      }
      if (clientsData.success) {
        setClients(clientsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "알 수 없음";
  };

  const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l)));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setOpenMenu(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.filter((l) => l.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
    setOpenMenu(null);
  };

  const handleAddToBlacklist = async (lead: Lead) => {
    if (!confirm(`${lead.phone}을(를) 블랙리스트에 추가하시겠습니까?`)) return;

    try {
      await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: lead.clientId,
          type: "phone",
          value: lead.phone,
          reason: `리드 ID: ${lead.id}에서 추가`,
        }),
      });

      // 상태를 스팸으로 변경
      await handleStatusChange(lead, "spam");
      alert("블랙리스트에 추가되었습니다.");
    } catch (error) {
      console.error("Failed to add to blacklist:", error);
    }
    setOpenMenu(null);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = !filterClient || lead.clientId === filterClient;
    const matchesStatus = !filterStatus || lead.status === filterStatus;
    return matchesSearch && matchesClient && matchesStatus;
  });

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">리드 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            접수된 리드를 관리하고 상태를 업데이트합니다.
          </p>
        </div>

        {/* 필터 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 연락처, 상호명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">모든 클라이언트</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LeadStatus | "")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">모든 상태</option>
              <option value="new">신규</option>
              <option value="contacted">연락완료</option>
              <option value="converted">전환</option>
              <option value="spam">스팸</option>
            </select>
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="card flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-gray-500">
            <p>접수된 리드가 없습니다.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>접수자</th>
                  <th>연락처</th>
                  <th>상호/업종</th>
                  <th>클라이언트</th>
                  <th>상태</th>
                  <th>접수일</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        {lead.email && (
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {lead.phone}
                      </p>
                    </td>
                    <td>
                      {lead.businessName ? (
                        <div>
                          <p className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-gray-400" />
                            {lead.businessName}
                          </p>
                          {lead.industry && (
                            <p className="text-xs text-gray-500">{lead.industry}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <span className="text-sm">{getClientName(lead.clientId)}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${statusLabels[lead.status]?.class || "badge-new"}`}
                      >
                        {statusLabels[lead.status]?.label || "신규"}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-500">
                        {new Date(lead.createdAt).toLocaleString("ko-KR")}
                      </span>
                    </td>
                    <td>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === lead.id ? null : lead.id)}
                          className="rounded p-1 hover:bg-gray-100"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                        {openMenu === lead.id && (
                          <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            <div className="border-b border-gray-100 px-4 py-2">
                              <p className="text-xs text-gray-500 mb-2">상태 변경</p>
                              <div className="flex flex-wrap gap-1">
                                {(["new", "contacted", "converted", "spam"] as LeadStatus[]).map(
                                  (status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusChange(lead, status)}
                                      className={`badge ${statusLabels[status].class} cursor-pointer hover:opacity-80`}
                                    >
                                      {statusLabels[status].label}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setEditingLead(lead);
                                setOpenMenu(null);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4" />
                              수정
                            </button>
                            <button
                              onClick={() => handleAddToBlacklist(lead)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
                            >
                              <ShieldBan className="h-4 w-4" />
                              블랙리스트 추가
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <Trash2 className="h-4 w-4" />
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 수정 모달 */}
        {editingLead && (
          <EditLeadModal
            lead={editingLead}
            onClose={() => setEditingLead(null)}
            onSave={(updated) => {
              setLeads(leads.map((l) => (l.id === updated.id ? updated : l)));
              setEditingLead(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

// 수정 모달 컴포넌트
function EditLeadModal({
  lead,
  onClose,
  onSave,
}: {
  lead: Lead;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}) {
  const [formData, setFormData] = useState({
    name: lead.name,
    phone: lead.phone,
    email: lead.email || "",
    businessName: lead.businessName || "",
    industry: lead.industry || "",
    memo: lead.memo || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        onSave({ ...lead, ...formData });
      }
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">리드 수정</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상호명</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업종</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
